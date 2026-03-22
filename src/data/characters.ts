/**
 * characters.ts — Romaanin hahmot
 *
 * Sisältää kaikki "Arojen Tarina" -romaanin hahmot jaettuna
 * kategorioihin: päähahmot, perhe, liittolaiset, viholliset ja henget.
 */

export interface Character {
  name: string;
  role: string;
  description: string;
  category: "main" | "family" | "allies" | "enemies" | "spirits";
}

export const characters: Character[] = [
  // === Päähahmot ===
  {
    name: "Temüü \"Baatar\"",
    role: "Päähenkilö",
    description: "Nuori soturi, joka kasvaa mieheksi ja yhdistää heimot yhdeksi valtakunnaksi.",
    category: "main",
  },
  {
    name: "Erdenetögs \"Böö\"",
    role: "Shamaani",
    description: "Yliluonnollisten voimien välittäjä ja Temüün henkinen opas, joka ohjaa hänen kohtaloaan.",
    category: "main",
  },

  // === Perhe ===
  {
    name: "Bolormaa",
    role: "Äiti",
    description: "Sydämellinen äiti, joka pitää perheen koossa vaikeuksien keskellä ja tukee Temüütä johtajaksi kasvamisessa.",
    category: "family",
  },
  {
    name: "Ganbaatar",
    role: "Isäpuoli",
    description: "Juoppo ja väkivaltainen mies, jonka Temüü lopulta haastaa kaksintaisteluun.",
    category: "family",
  },
  {
    name: "Naran",
    role: "Sisko",
    description: "Temüün vahva ja suojeleva sisko, joka ottaa lyöntejä vastaan sisarustensa puolesta.",
    category: "family",
  },
  {
    name: "Sarantuya",
    role: "Temüün vaimo",
    description: "Herkkä ja sisäänpäin kääntynyt nainen, joka istuu valtaistuimella Temüün rinnalla.",
    category: "family",
  },
  {
    name: "Möngke",
    role: "Pikkuveli",
    description: "Temüün nuorempi veli, jonka hyvinvoinnista Temüü kantaa vastuuta lapsuudesta asti.",
    category: "family",
  },
  {
    name: "Altantsetseg",
    role: "Pikkusisko",
    description: "Temüün nuorempi sisko, joka kasvaa vaikeissa oloissa vahvaksi naiseksi.",
    category: "family",
  },

  // === Liittolaiset ===
  {
    name: "Batu",
    role: "Sotajohtaja",
    description: "Kokenut sotajohtaja, joka näkee potentiaalin nuoressa Temüüssä ja tukee hänen nousujaan.",
    category: "allies",
  },
  {
    name: "Khüleg",
    role: "Henkivartija",
    description: "Temüün uskollinen henkivartija, joka taistelee hänen rinnallaan vallankaappauksessa.",
    category: "allies",
  },
  {
    name: "Odval",
    role: "Parantaja",
    description: "Heimon vanha viisas nainen, joka hoitaa haavoittuneita ja avustaa rituaaleissa.",
    category: "allies",
  },
  {
    name: "Sübedei",
    role: "Ratsuväenkomentaja",
    description: "Nerokas ratsuväen taktikko, joka johtaa harhauttavia hyökkäyksiä Temüün sotaretkillä.",
    category: "allies",
  },

  // === Viholliset ===
  {
    name: "Darga",
    role: "Vihollisheimopäällikkö",
    description: "Ensimmäisen vihollisheimon johtaja, jonka armeija kukistetaan Temüün noustessa valtaan.",
    category: "enemies",
  },
  {
    name: "Targutai",
    role: "Korruptoitunut johtaja",
    description: "Heimojohtajien neuvoston jäsen, joka pilkkaa Temüütä ja maksa siitä hengellään.",
    category: "enemies",
  },
  {
    name: "Burkhan",
    role: "Itäisten heimojen päällikkö",
    description: "Muskettisotilaita komentava päällikkö, jonka Temüü voittaa Aleksanterin taktiikalla.",
    category: "enemies",
  },
  {
    name: "Toghrul",
    role: "Petturi-liittolainen",
    description: "Entinen liittolainen, joka kääntyy Temüütä vastaan ja liittoutuu vihollisheimojen kanssa.",
    category: "enemies",
  },

  // === Henget ja kosmiset olennot ===
  {
    name: "Hirvi",
    role: "Luoja-henki",
    description: "Kosminen olento, joka loi maailman yhdessä suden kanssa. Symboloi viisautta ja luomista.",
    category: "spirits",
  },
  {
    name: "Susi",
    role: "Tuhoaja-henki",
    description: "Kosminen olento, jonka tanssi hirven kanssa synnytti vuoret ja joet. Symboloi voimaa ja nälkää.",
    category: "spirits",
  },
  {
    name: "Kotka",
    role: "Taivaan henki",
    description: "Taivaallinen sanansaattaja, joka yhdistää ihmisen ja henkimaailman ylhäältä käsin.",
    category: "spirits",
  },
  {
    name: "Karhu",
    role: "Maan henki",
    description: "Maan ja metsän suojelija, joka edustaa raakaa voimaa ja luonnon hallintaa.",
    category: "spirits",
  },
  {
    name: "Pöllö",
    role: "Yön henki",
    description: "Pimeyden ja näkymättömän maailman vartija, joka näkee sen mitä muut eivät näe.",
    category: "spirits",
  },
];

export const categoryLabels: Record<Character["category"], string> = {
  main: "Päähahmot",
  family: "Perhe",
  allies: "Liittolaiset",
  enemies: "Viholliset",
  spirits: "Henget & Kosmiset Olennot",
};

export const categoryColors: Record<Character["category"], string> = {
  main: "text-primary",
  family: "text-accent",
  allies: "text-green-600 dark:text-green-400",
  enemies: "text-destructive",
  spirits: "text-purple-600 dark:text-purple-400",
};
