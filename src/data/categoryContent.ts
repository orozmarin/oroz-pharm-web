/**
 * Duži opisi kategorija za SEO, prikazuju se ispod proizvoda na /proizvodi/[category].
 * Kratki opis za zaglavlje i meta description ostaje u Payloadu (Categories.description).
 * Pišu se samo činjenice: potkategorije i proizvođači koji su stvarno u katalogu.
 * Proizvođače navodimo kao primjere ("između ostalih"), jer na webu nije cijela ponuda,
 * bez cijena, akcija i obećanja o zalihama.
 */
export interface CategoryContent {
  heading: string;
  paragraphs: string[];
}

export const categoryContent: Record<string, CategoryContent> = {
  "zastita-bilja": {
    heading: "Sredstva za zaštitu bilja u Pleternici i Požegi",
    paragraphs: [
      "U poslovnicama Oroz PHARM-a u Pleternici i Požegi nabavit ćete herbicide, fungicide i insekticide za ratarske kulture, voćnjake, vinograde i povrće. Uz njih imamo limacide protiv puževa, rodenticide i druge biocide te okvašivače koji poboljšavaju djelovanje škropiva.",
      "Surađujemo s velikim brojem proizvođača, između ostalih s Bayerom, Syngentom i BASF-om. Na webu je za sada samo dio ponude, pa ako ne nađete sredstvo koje tražite, pitajte nas. U poslovnici vam pomažemo odabrati sredstvo prema kulturi, problemu i roku primjene.",
      "Sredstva za zaštitu bilja ne prodajemo preko interneta. Svratite u poslovnicu ili nas nazovite pa provjerite što trenutno imamo i što je najbolje za vašu situaciju.",
    ],
  },
  gnojiva: {
    heading: "Gnojiva i poboljšivači tla",
    paragraphs: [
      "Za jesensku i proljetnu gnojidbu, prihranu i folijarnu primjenu kod nas ćete naći mineralna i organska gnojiva, biostimulatore i poboljšivače tla. Imamo gnojiva za ratarske kulture, voćnjake, vinograde, povrtnjake i cvijeće.",
      "Među proizvođačima čija gnojiva imamo su Petrokemija Kutina, Italpollina, Syngenta, Agrochem Maks i Zeleni hit, a u poslovnici je izbor veći nego na webu. Krupnija pakiranja i palete gnojiva drže se u skladištu uz poslovnicu u Pleternici, pa se i veće količine mogu odmah utovariti.",
      "Ako niste sigurni koje gnojivo i koliko vam treba, recite nam kulturu i površinu pa ćemo zajedno složiti plan gnojidbe.",
    ],
  },
  "sjemenski-program": {
    heading: "Sjeme ratarskih kultura i povrća",
    paragraphs: [
      "U sjemenskom programu su hibridi kukuruza, uljarice, sjeme trava i djetelina te hibridi povrća, uključujući F1 hibride. Sjeme povrća i cvijeća imamo i u malim vrećicama za kućne vrtove.",
      "Imamo sjeme više sjemenarskih kuća, između ostalih DEKALB i KWS za ratarske kulture te Zeleni hit i Agrochem Maks za povrće i cvijeće. Pri izboru hibrida pitajte nas za vegetacijsku skupinu i namjenu, da sjeme odgovara vašem tlu i roku sjetve.",
      "Za veće količine sjemena nazovite poslovnicu unaprijed.",
    ],
  },
  "sadni-materijal": {
    heading: "Sadnice, lučica i sjemenski krumpir",
    paragraphs: [
      "U sezoni sadnje kod nas nabavljate voćne sadnice, sadnice vinove loze, prijesadnice cvijeća, lučicu i sjemenski krumpir. Sadni materijal je sezonski, pa se ponuda mijenja kroz godinu.",
      "Za voćnjak ili vinograd dobro je unaprijed znati sortu, podlogu i broj sadnica. Javite nam se na vrijeme, a uz sadnice ćete kod nas naći i gnojiva, supstrate, vezni materijal i sredstva za zaštitu mladih nasada.",
    ],
  },
  "stocna-hrana": {
    heading: "Stočna hrana za sve domaće životinje",
    paragraphs: [
      "Kod nas ćete naći kompletne krmne smjese, koncentrate i dodatke za svinje, goveda, perad i druge domaće životinje, za različite faze uzgoja.",
      "Prodajemo hranu više proizvođača, između ostalih Sano, TSH Čakovec, Patent, Genera, Valpovka i Lek. Ako mijenjate hranu ili niste sigurni koja smjesa odgovara dobi i namjeni životinja, pitajte nas u poslovnici.",
      "Stočnu hranu imamo u obje poslovnice, a veća pakiranja se mogu utovariti izravno u vozilo.",
    ],
  },
  perad: {
    heading: "Jednodnevni pilići, purići i nesilice",
    paragraphs: [
      "Živu perad prodajemo po narudžbi. U ponudi su jednodnevni pilići i purići za tov te druga perad, uključujući nesilice za proizvodnju jaja.",
      "Termine dolaska peradi i dostupne vrste dogovorite telefonom ili u poslovnici. Uz perad kod nas odmah nabavite i starter smjese, hranilice, pojilice i ostalu opremu za uzgoj.",
    ],
  },
  "kucni-ljubimci": {
    heading: "Hrana i oprema za kućne ljubimce",
    paragraphs: [
      "Za pse i mačke imamo hranu, ogrlice, povodce i ostalu opremu, a za ptice, ribe i golubove hranu i dodatke.",
      "Hranu za kućne ljubimce možete kupiti u obje poslovnice, zajedno s ostalim stvarima za dom i dvorište.",
    ],
  },
  "vrt-i-okucnica": {
    heading: "Oprema za vrt i okućnicu",
    paragraphs: [
      "U kategoriji vrt i okućnica su tačke, prskalice, nit za košnju, mreže i cerade, vezni materijal, radne rukavice, čizme i radna zaštita. Pred blagdane imamo i lampione.",
      "Među proizvođačima su BR Garden, Salva, Brati Ritoša, Claber i Quadra, a izbor u poslovnici je veći nego na webu. Sve što vam treba za uređenje dvorišta i rad u vrtu nabavite na jednom mjestu, u Pleternici ili u Požegi.",
    ],
  },
  alati: {
    heading: "Alat za vrt, voćnjak i vinograd",
    paragraphs: [
      "Za rezidbu voćaka i loze imamo škare i pile, a za obradu vrta alatke i držala. Alat je namijenjen i profesionalnom i hobi radu.",
      "Imamo alate više proizvođača, između ostalih BR Garden, Tick, Brati Ritoša i Leon. Ako niste sigurni koje škare ili pila vam trebaju za vaš voćnjak ili vinograd, pitajte nas u poslovnici.",
    ],
  },
  navodnjavanje: {
    heading: "Oprema za navodnjavanje",
    paragraphs: [
      "Za navodnjavanje vrta, plastenika i polja kod nas ćete naći pumpe, crijeva i cijevi, crijeva kap po kap, rasprskivače te spojnice i ventile.",
      "Među proizvođačima su Brati Ritoša, Leon, BR Garden i RI-TAPE. Ako postavljate novi sustav, donesite nam skicu i mjere parcele pa ćemo zajedno složiti popis dijelova.",
    ],
  },
  "oprema-za-povrtlarstvo": {
    heading: "Supstrati, folija i oprema za povrtlarstvo",
    paragraphs: [
      "Za uzgoj presadnica i povrća imamo profesionalne supstrate, između ostalih Klasmann, Brill, Florabella, Hawita i Plantella, plasteničku foliju te mreže za zasjenu i zaštitu.",
      "Kategorija je namijenjena povrtlarima i cvjećarima koji rade u plasteniku ili na otvorenom. Uz supstrate i foliju kod nas nabavite i sjeme, gnojiva i sredstva za zaštitu povrća.",
    ],
  },
  "oprema-za-stocarstvo": {
    heading: "Oprema za stočarstvo",
    paragraphs: [
      "Za štalu i pašnjak imamo hranilice i pojilice te električne pastire s opremom za ograđivanje pašnjaka.",
      "Opremu možete kupiti zajedno sa stočnom hranom u obje poslovnice. Ako postavljate novi električni pastir, pitajte nas koji uređaj i koliko žice ili trake vam treba za vašu površinu.",
    ],
  },
  "oprema-za-pcelarstvo": {
    heading: "Pčelarska oprema i prihrana",
    paragraphs: [
      "Za pčelare imamo košnice, pčelarski alat, opremu za vrcanje i cijeđenje meda te zaštitnu opremu. U ponudi su i pogače i druga prihrana za pčele te sredstva za zdravlje pčelinjih zajednica.",
      "Prodajemo pčelarsku opremu Medin san, a od ostalih proizvođača imamo između ostalih Bondex, Anel, Nozevit i BeeVital. Za veće narudžbe opreme zatražite ponudu u poslovnici ili preko kontakt obrasca.",
    ],
  },
  enologija: {
    heading: "Oprema za vinarstvo",
    paragraphs: [
      "Za proizvodnju vina kod nas ćete naći inox bačve, kanistere, boce i kvasce te ostalu opremu za podrum.",
      "Kategorija je namijenjena vinogradarima i kućnim vinarima. Uz opremu za podrum kod nas nabavite i sve za vinograd, od sredstava za zaštitu i gnojiva do alata za rezidbu.",
    ],
  },
  "pribor-za-kolinje": {
    heading: "Pribor za kolinje",
    paragraphs: [
      "Pred kolinje kod nas ćete naći crijeva, punilice, mesoreznice, noževe i kuke, sve na jednom mjestu.",
      "Pribor za kolinje imamo u obje poslovnice, a dobro je doći ranije, prije nego što krene sezona kolinja. Uz pribor kod nas nabavite i završne smjese za tov.",
    ],
  },
  "poljoprivredni-strojevi": {
    heading: "Kosilice, motorne pile i trimeri",
    paragraphs: [
      "Za održavanje okućnice, voćnjaka i šume imamo kosilice, motorne pile, trimere i drugu manju mehanizaciju.",
      "Uz strojeve kod nas ćete naći i nit za košnju, ulja, maziva i ostali potrošni materijal. Za dostupnost pojedinih modela nazovite poslovnicu.",
    ],
  },
  "ulja-i-maziva": {
    heading: "Ulja, maziva i antifriz",
    paragraphs: [
      "Za traktore i ostalu poljoprivrednu mehanizaciju imamo motorna ulja, maziva, antifriz i tekućine za stakla.",
      "Pred zimu provjerite antifriz i tekućinu za stakla, a ulje birajte prema preporuci proizvođača stroja. Ako niste sigurni koje ulje vam treba, ponesite podatke o stroju u poslovnicu.",
    ],
  },
  "gume-i-zracnice": {
    heading: "Gume i zračnice za bicikle i tačke",
    paragraphs: [
      "Imamo gume i zračnice za bicikle, tačke i ostalu opremu bez motora.",
      "Kad dolazite po gumu ili zračnicu, ponesite staru ili prepišite oznaku dimenzije s boka gume. Tako ćemo odmah pronaći odgovarajuću.",
    ],
  },
  "roba-siroke-potrosnje": {
    heading: "Kace, bačve, kante i lončanice",
    paragraphs: [
      "U robi široke potrošnje su kace, bačve, kante, lončanice za cvijeće, sprejevi i druge korisne stvari za kuću, podrum i dvorište.",
      "Sve to možete kupiti u obje poslovnice, zajedno s ostalim stvarima za vrt i okućnicu.",
    ],
  },
  "ekoloski-proizvodi": {
    heading: "Proizvodi za ekološku poljoprivredu",
    paragraphs: [
      "Za ekološki uzgoj i vrtlare koji žele izbjeći sintetička sredstva imamo preparate dopuštene u organskoj poljoprivredi.",
      "Pitajte nas u poslovnici koji su proizvodi prikladni za vašu kulturu i kako se primjenjuju.",
    ],
  },
};
