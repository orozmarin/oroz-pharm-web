import os
import re
import unicodedata

_EKSPLICITNO = {"đ": "d", "Đ": "d"}

def slugify(ime: str) -> str:
    """Slugificira jedan segment putanje. Ekstenzija se zadržava, snižena."""
    # 1. Ako ime sadrži znakove koji nisu dozvoljeni → raise ValueError
    if '\n' in ime or '\r' in ime or '\0' in ime:
        raise ValueError(f"ime sadrži nedozvoljene znakove: {ime!r}")

    # 2. Ako ime počinje točkom → raise ValueError (skrivene datoteke, macOS metapodaci)
    if ime.startswith('.'):
        raise ValueError(f"ime počinje s točkom: {ime!r}")

    # 3. Razdvoji bazu i ekstenziju
    baza, ext = os.path.splitext(ime)
    if ext in (".", ""):          # "mapa." nema ekstenziju, samo točku
        baza, ext = ime.rstrip("."), ""

    # 4. Obrada baze
    for a, b in _EKSPLICITNO.items():
        baza = baza.replace(a, b)
    baza = unicodedata.normalize("NFD", baza)
    baza = "".join(c for c in baza if not unicodedata.combining(c))
    baza = re.sub(r"[^a-zA-Z0-9]+", "-", baza).strip("-").lower()

    if not baza:
        raise ValueError(f"prazna baza za {ime!r}")

    # 5. Ekstenzija — samo .lower(), bez transformacije; mora biti [a-z0-9]+
    if ext:
        ext_body = ext[1:].lower()  # Uklonimo točku i sniži
        if not re.fullmatch(r'[a-z0-9]+', ext_body):
            raise ValueError(f"neispravna ekstenzija {ext!r}: mora biti [a-z0-9]+ (dobio {ext_body!r})")
        ext = "." + ext_body

    return baza + ext
