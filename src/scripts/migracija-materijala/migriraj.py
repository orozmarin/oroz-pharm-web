#!/usr/bin/env python3
"""Migrira Oroz-web i Oroz-marketing u OrozDigital/materijali prema mapiranje.tsv."""
import csv
import os
import shutil
import subprocess
import sys

from slug import slugify

IZVOR_KORIJEN = "/Users/marinoroz/Documents"
CILJ = "/Users/marinoroz/Documents/OrozDigital/materijali"
MAPIRANJE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "mapiranje.tsv")
LOG = os.path.join(os.path.dirname(os.path.abspath(__file__)), "preimenovanja.log")


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
    """Preimenuje sve u materijali/ odozdo prema gore. Prekida na sudaru."""
    preimenovanja = []
    for dp, dn, fn in os.walk(CILJ, topdown=False):
        for ime in fn + dn:
            novo = slugify(ime)
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
            preimenovanja.append((staro_p, novo_p))
    with open(LOG, "w") as f:
        w = csv.writer(f, delimiter="\t")
        w.writerows(preimenovanja)
    print(f"preimenovano: {len(preimenovanja)}, zapisano u {LOG}")


if __name__ == "__main__":
    suho = "--suho" in sys.argv
    if not suho and os.path.exists(CILJ) and os.listdir(CILJ):
        sys.exit(f"PREKID: {CILJ} postoji i nije prazan. Obriši ga pa ponovi.")
    kopiraj(suho)
    if not suho:
        slugificiraj()
