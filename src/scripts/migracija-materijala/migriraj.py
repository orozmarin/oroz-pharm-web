#!/usr/bin/env python3
"""Migrira Oroz-web i Oroz-marketing u OrozDigital/materijali prema mapiranje.tsv."""
import csv
import os
import shutil
import stat
import subprocess
import sys

from slug import slugify

IZVOR_KORIJEN = "/Users/marinoroz/Documents"
CILJ = "/Users/marinoroz/Documents/OrozDigital/materijali"
MAPIRANJE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mapiranje.tsv")
LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preimenovanja.log")

# Isto što rsync isključuje kod stvarnog kopiranja (vidi komentar u kopiraj()) —
# pred-let mora modelirati iste izuzetke da ne prijavi sudar za datoteku koja se
# ionako nikad neće kopirati.
_IGNORIRANE_DATOTEKE = {".DS_Store"}


def _ignorirano(ime: str) -> bool:
    return ime in _IGNORIRANE_DATOTEKE or ime.startswith("._")


def ucitaj_redke() -> list:
    with open(MAPIRANJE) as f:
        return [r for r in csv.reader(f, delimiter="\t") if r and not r[0].startswith("#")]


def provjeri_sudare() -> None:
    """Pred-let prije ijednog kopiranja (i u suhom i u stvarnom prolazu).

    Za svaki redak izračuna konačnu odredišnu putanju svake datoteke onakvu
    kakva će biti NAKON slugifikacije: za `file` retke to je zadano odredište;
    za `dir` retke prošeće izvor i za svaku datoteku sastavi odredište
    slugificirajući svaki segment relativne putanje unutar mape (isto što bi
    slugificiraj() naknadno napravio, samo unaprijed i bez side-effecta).

    Prekida ako dvije različite izvorne datoteke planiraju istu konačnu
    putanju, ili ako slugify() ne može obraditi neko ime.
    """
    odredista: dict[str, list[str]] = {}

    for mode, izvor, odrediste in ucitaj_redke():
        src = os.path.join(IZVOR_KORIJEN, izvor)
        dst = os.path.join(CILJ, odrediste)
        if mode == "file":
            odredista.setdefault(dst, []).append(src)
        elif mode == "dir":
            # Provjeravamo samo čitljivost — izvor ne treba biti zapisiv (dozvole
            # dobavljača su njegova stvar); nedostatak w na odredištu se rješava
            # naknadnom normalizacijom u kopiraj(), ne odbijanjem ovdje.
            if not os.access(src, os.R_OK | os.X_OK):
                sys.exit(f"PREKID: izvor nije čitljiv: {src}")
            for dirpath, _dirnames, filenames in os.walk(src):
                rel = os.path.relpath(dirpath, src)
                segmenti = [] if rel == "." else rel.split(os.sep)
                for ime in filenames:
                    if _ignorirano(ime):
                        continue
                    puni_izvor = os.path.join(dirpath, ime)
                    try:
                        segmenti_slug = [slugify(s) for s in segmenti]
                        ime_slug = slugify(ime)
                    except ValueError as e:
                        sys.exit(f"PREKID: slugify ne uspijeva za {puni_izvor}: {e}")
                    konacna = os.path.join(dst, *segmenti_slug, ime_slug)
                    odredista.setdefault(konacna, []).append(puni_izvor)
        # nepoznat mode: kopiraj() će ga prijaviti; pred-let ga ovdje preskače.

    sudari = {k: v for k, v in odredista.items() if len(v) > 1}
    if sudari:
        redovi = []
        for konacna, izvori in sorted(sudari.items()):
            redovi.append(f"  {konacna}")
            for i in sorted(izvori):
                redovi.append(f"    <- {i}")
        sys.exit(
            "PREKID: sudar(i) pri planiranju odredišta (prije ijednog kopiranja):\n"
            + "\n".join(redovi)
        )


def _normaliziraj_dozvole(korijen: str) -> None:
    """Dodaje vlasniku pravo pisanja (i x na mapama) na cijelom stablu ispod
    `korijen`, nakon što ga je rsync -a upravo napunio.

    Dozvole izvora su artefakt isporuke dobavljača (npr. mapa raspakirana iz
    zipa bez w bita za vlasnika) — rsync -a ih vjerno prenosi na odredište, ali
    ciljno stablo MORA ostati zapisivo: korisnik u njega kasnije dodaje nove
    materijale, a slugificiraj() treba w na svakoj mapi da bi preimenovao njen
    sadržaj. Koristimo st_mode | S_IWUSR (i S_IRUSR|S_IXUSR za mape) — dodajemo,
    nikad ne oduzimamo, i diramo samo vlasnika, ne grupu ni ostale.
    """
    for dp, dn, fn in os.walk(korijen):
        st = os.stat(dp)
        os.chmod(dp, st.st_mode | stat.S_IRUSR | stat.S_IWUSR | stat.S_IXUSR)
        for ime in fn:
            p = os.path.join(dp, ime)
            st = os.stat(p)
            os.chmod(p, st.st_mode | stat.S_IRUSR | stat.S_IWUSR)


def kopiraj(suho: bool) -> None:
    with open(MAPIRANJE) as f:
        redci = [r for r in csv.reader(f, delimiter="\t") if r and not r[0].startswith("#")]
    for mode, izvor, odrediste in redci:
        src = os.path.join(IZVOR_KORIJEN, izvor)
        dst = os.path.join(CILJ, odrediste)
        if not os.path.exists(src):
            sys.exit(f"PREKID: izvor ne postoji: {src}")
        if mode == "dir":
            if suho:
                print(f"dir  {izvor}/ -> {odrediste}/")
                continue
            os.makedirs(dst, exist_ok=True)
            # ._* su AppleDouble sjene koje macOS ostavlja pri kopiranju preko USB-a i zipa.
            # Danas ih u izvorima nema, ali `._foo.jpg` slugificira u `foo.jpg` i tiho bi se
            # sudario s pravom datotekom — jeftinije ih je isključiti nego uhvatiti kasnije.
            subprocess.run(
                ["rsync", "-a", "--exclude", ".DS_Store", "--exclude", "._*",
                 f"{src}/", f"{dst}/"],
                check=True,
            )
            _normaliziraj_dozvole(dst)
        elif mode == "file":
            if os.path.exists(dst) and not suho:
                sys.exit(f"PREKID: odredište već postoji: {dst}")
            if suho:
                print(f"file {izvor} -> {odrediste}")
                continue
            os.makedirs(os.path.dirname(dst), exist_ok=True)
            shutil.copy2(src, dst)
        else:
            sys.exit(f"PREKID: nepoznat mode {mode!r} u retku {izvor}")


def slugificiraj() -> None:
    """Preimenuje sve u materijali/ odozdo prema gore. Prekida na sudaru.

    LOG se otvara PRIJE petlje i svaki par se piše (uz flush) čim se
    preimenovanje dogodi — ako skripta pukne na pola, log ipak sadrži sve što
    je do tada stvarno preimenovano, umjesto da nestane zajedno s prekidom.
    """
    broj = 0
    with open(LOG, "w") as f:
        w = csv.writer(f, delimiter="\t")
        for dp, dn, fn in os.walk(CILJ, topdown=False):
            for ime in fn + dn:
                try:
                    novo = slugify(ime)
                except ValueError as e:
                    sys.exit(f"PREKID: slugify ne uspijeva za {os.path.join(dp, ime)}: {e}")
                if novo == ime:
                    continue
                staro_p = os.path.join(dp, ime)
                novo_p = os.path.join(dp, novo)
                # APFS je case-insensitive: "Label" i "label" su ista stavka, pa os.path.exists
                # javlja True i za preimenovanje koje mijenja samo veličinu slova. samefile to
                # razlikuje od stvarnog sudara s drugom datotekom.
                if os.path.exists(novo_p) and not os.path.samefile(staro_p, novo_p):
                    sys.exit(f"PREKID: sudar pri preimenovanju {staro_p} -> {novo_p}")
                os.rename(staro_p, novo_p)
                w.writerow((staro_p, novo_p))
                f.flush()
                broj += 1
    print(f"preimenovano: {broj}, zapisano u {LOG}")


if __name__ == "__main__":
    suho = "--suho" in sys.argv
    if not suho and os.path.exists(CILJ) and os.listdir(CILJ):
        sys.exit(
            f"PREKID: {CILJ} postoji i nije prazan.\n"
            "Kopiranje je idempotentno samo iz praznog stanja — jedini siguran oporavak je "
            f"obrisati cijeli {CILJ} i pokrenuti skriptu ispočetka. Izvorna stabla "
            "(Oroz-web, Oroz-marketing) nisu dirana i ostaju netaknuta bez obzira na to "
            "gdje je prethodni pokušaj stao."
        )
    provjeri_sudare()
    kopiraj(suho)
    if not suho:
        slugificiraj()
