import unittest
from slug import slugify

class TestSlugify(unittest.TestCase):
    def test_dijakritika(self):
        self.assertEqual(slugify("Ritoša"), "ritosa")
        self.assertEqual(slugify("stočna hrana"), "stocna-hrana")
        self.assertEqual(slugify("Žito"), "zito")

    def test_d_s_crtom_ne_dekomponira(self):
        # đ nije NFD-razloživ, mora imati eksplicitno mapiranje
        self.assertEqual(slugify("Đakovo"), "dakovo")
        self.assertEqual(slugify("žeđ"), "zed")

    def test_ekstenzija_se_zadrzava_i_snizava(self):
        self.assertEqual(slugify("IMG_4306.HEIC"), "img-4306.heic")
        self.assertEqual(slugify("Oroz PHARM.svg"), "oroz-pharm.svg")

    def test_interpunkcija_i_visestruki_razmaci(self):
        self.assertEqual(
            slugify("Kosačica VINGO  2,3KS LONCIN 139.jpg"),
            "kosacica-vingo-2-3ks-loncin-139.jpg",
        )
        self.assertEqual(slugify("Vinkoprom - popis artikala.docx"),
                         "vinkoprom-popis-artikala.docx")

    def test_rubne_crtice_se_odbacuju(self):
        self.assertEqual(slugify("_zaBlur_.jpeg"), "zablur.jpeg")

    def test_mapa_bez_ekstenzije(self):
        self.assertEqual(slugify("Dani lubenica Soljani 2026."),
                         "dani-lubenica-soljani-2026")

if __name__ == "__main__":
    unittest.main()
