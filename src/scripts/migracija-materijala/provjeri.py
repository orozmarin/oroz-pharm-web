#!/usr/bin/env python3
"""Tri provjere cjelovitosti migracije."""
import hashlib
import os
import re
import subprocess
import sys

CILJ = "/Users/marinoroz/Documents/OrozDigital/materijali"
OCEKIVANO = 833
# Sažetak /Users/marinoroz/Documents/Oroz-web/.claude/settings.local.json — jedine namjerno
# neprenesene datoteke iz `prije-sha.txt`. Hardkodiran, ne izračunat: izvorno stablo
# (Oroz-web) se briše nakon migracije, pa `sha()` nad njim ne bi imao što otvoriti, a ova
# provjera mora ostati ponovljiva i nakon brisanja.
NEPRENESENO_SHA = "39a3723441892ce1cf987508fb448b6a656b65c8d194d1640c1915cd9098d3c6"
OSNOVICA = os.path.join(os.path.dirname(os.path.abspath(__file__)), "prije-sha.txt")
# `fullmatch`, ne `match`: u Pythonu `$` znači kraj stringa ILI neposredno prije završnog
# `\n`, pa bi `re.match(..., "foo.jpg\n")` prošao. Ime datoteke s newlineom je na POSIX-u
# dopušteno, a provjera koja ga propusti je gora od nikakve.
DOPUSTENO = re.compile(r"[a-z0-9]+(-[a-z0-9]+)*(\.[a-z0-9]+)?")


def sha(p):
    h = hashlib.sha256()
    with open(p, "rb") as f:
        for blok in iter(lambda: f.read(1 << 20), b""):
            h.update(blok)
    return h.hexdigest()


def sve_datoteke():
    """Materijali, bez metapodataka stabla.

    Izuzeto:
    - `CLAUDE.md` i `.gitignore` u korijenu — dokumentacija stabla, dodana nakon migracije.
    - `.DS_Store` i `._*` bilo gdje — macOS ih posije čim se mapa otvori u Finderu.
      Migracija ih je isključivala iz kopiranja, pa ih i provjera mora ignorirati; inače
      bi padala svaki put kad netko pogleda mapu, i prestala bi se čitati.
    """
    for dp, dn, fn in os.walk(CILJ):
        for x in fn:
            if dp == CILJ and x in ("CLAUDE.md", ".gitignore"):
                continue
            if x == ".DS_Store" or x.startswith("._"):
                continue
            yield os.path.join(dp, x)


def provjera_broja():
    n = sum(1 for _ in sve_datoteke())
    ok = n == OCEKIVANO
    print(f"[{'OK' if ok else 'PAD'}] broj datoteka: {n} (očekivano {OCEKIVANO})")
    return ok


def provjera_sadrzaja():
    """Svaki sha256 iz izvora mora postojati na odredištu. Hvata i tihi gubitak i izmjenu."""
    with open(OSNOVICA) as f:
        prije = sorted(x.strip() for x in f if x.strip())
    prije.remove(NEPRENESENO_SHA)
    poslije = sorted(sha(p) for p in sve_datoteke())
    ok = prije == poslije
    print(f"[{'OK' if ok else 'PAD'}] sadržaj: {len(prije)} izvornih sažetaka prema {len(poslije)}")
    if not ok:
        nedostaje = set(prije) - set(poslije)
        visak = set(poslije) - set(prije)
        print(f"     nedostaje {len(nedostaje)}, višak {len(visak)}")
    return ok


def provjera_imena():
    """Pozitivna provjera: ime mora odgovarati dopuštenom obliku, a ne samo izbjeći
    poznate loše znakove. Crna lista propušta ono na što se nije mislilo — `,`, `&`, `+`."""
    lose = []
    for dp, dn, fn in os.walk(CILJ):
        for x in dn + fn:
            if dp == CILJ and x in ("CLAUDE.md", ".gitignore"):
                continue
            # Ista izuzeća kao u sve_datoteke() — macOS ih posije čim se mapa otvori.
            if x == ".DS_Store" or x.startswith("._"):
                continue
            if not DOPUSTENO.fullmatch(x):
                lose.append(os.path.join(dp, x))
    ok = not lose
    print(f"[{'OK' if ok else 'PAD'}] imena: {len(lose)} problematičnih")
    for p in lose[:20]:
        print("     ", p)
    return ok


if __name__ == "__main__":
    rezultati = [provjera_broja(), provjera_sadrzaja(), provjera_imena()]
    velicina = subprocess.run(["du", "-sh", CILJ], capture_output=True, text=True).stdout.strip()
    print(f"     veličina: {velicina}")
    sys.exit(0 if all(rezultati) else 1)
