import os
import re
import unicodedata

_EKSPLICITNO = {"đ": "d", "Đ": "d"}

def slugify(ime: str) -> str:
    """Slugificira jedan segment putanje. Ekstenzija se zadržava, snižena."""
    baza, ext = os.path.splitext(ime)
    if ext in (".", ""):          # "mapa." nema ekstenziju, samo točku
        baza, ext = ime.rstrip("."), ""
    for a, b in _EKSPLICITNO.items():
        baza = baza.replace(a, b)
    baza = unicodedata.normalize("NFD", baza)
    baza = "".join(c for c in baza if not unicodedata.combining(c))
    baza = baza.lower()
    # Ukloni vodeće znakove koji nisu alphanumerički (npr. ._ macOS sjene)
    baza = re.sub(r'^[^a-z0-9]+', '', baza)
    baza = re.sub(r"[^a-z0-9]+", "-", baza).strip("-")

    # Sanitiziraj ekstenziju
    if ext:
        ext_body = ext[1:]  # Uklonimo točku
        ext_body = re.sub(r"[^a-z0-9]+", "-", ext_body.lower()).strip("-")
        ext = ("." + ext_body) if ext_body else ""

    if not baza:
        raise ValueError(f"prazan slug za {ime!r}")
    return baza + ext
