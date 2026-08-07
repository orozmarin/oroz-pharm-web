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

    def test_visestruke_tocke(self):
        # Datoteke sa 2+ točke — ekstenzija se detektuje od zadnje točke
        self.assertEqual(slugify("test.jpg.webp"), "test-jpg.webp")
        self.assertEqual(
            slugify("WhatsApp Image 2024-04-02 at 08.28.26.jpeg"),
            "whatsapp-image-2024-04-02-at-08-28-26.jpeg"
        )
        self.assertEqual(
            slugify("oroz pharm pleternica render 2.2.mp4"),
            "oroz-pharm-pleternica-render-2-2.mp4"
        )

    def test_vodeca_tocka_puca(self):
        # Imena koja počinju s točkom trebaju baciti ValueError
        for ime in ("._photo.jpg", ".DS_Store", ".gitignore"):
            with self.assertRaises(ValueError):
                slugify(ime)

    def test_neispravna_ekstenzija_puca(self):
        # Ekstenzije koje nisu [a-z0-9]+ trebaju baciti ValueError
        for ime in ("file.abc_def", "file.___", "video.MP_4"):
            with self.assertRaises(ValueError):
                slugify(ime)

    def test_ime_koje_zavrsava_tockom(self):
        # Imena koja se završavaju s točkom trebaju imati praznu ekstenziju
        self.assertEqual(slugify("Dani lubenica Soljani 2026."),
                         "dani-lubenica-soljani-2026")

if __name__ == "__main__":
    unittest.main()
