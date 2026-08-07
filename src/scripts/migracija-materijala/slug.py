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
    baza = re.sub(r"[^a-zA-Z0-9]+", "-", baza).strip("-").lower()
    if not baza:
        raise ValueError(f"prazan slug za {ime!r}")
    return baza + ext.lower()
