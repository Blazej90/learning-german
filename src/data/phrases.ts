import type { CategoryId, Phrase } from "@/types/content";

/**
 * Source: `star learn german.md`, section 1.
 *
 * Entries that listed several variants on one line ("Ja / Nein / Vielleicht")
 * are split into one card each — spaced repetition works on single items, not
 * on lists.
 *
 * The `id` of every phrase is the primary key of its SRS state in Firestore.
 * Adding phrases is safe; renaming an existing id orphans the user's progress.
 */
export const PHRASES: readonly Phrase[] = [
  // --- Powitania i pożegnania -------------------------------------------
  { id: "greetings-hallo", de: "Hallo", pl: "Cześć", category: "greetings" },
  {
    id: "greetings-guten-tag",
    de: "Guten Tag",
    pl: "Dzień dobry",
    category: "greetings",
    note: "Neutralne o każdej porze dnia, bezpieczniejsze niż „Hallo” wobec obcych.",
  },
  {
    id: "greetings-guten-morgen",
    de: "Guten Morgen",
    pl: "Dzień dobry (rano)",
    category: "greetings",
    note: "Mniej więcej do godziny 11.",
  },
  {
    id: "greetings-guten-abend",
    de: "Guten Abend",
    pl: "Dobry wieczór",
    category: "greetings",
  },
  {
    id: "greetings-auf-wiedersehen",
    de: "Auf Wiedersehen",
    pl: "Do widzenia",
    category: "greetings",
    note: "Forma formalna.",
  },
  {
    id: "greetings-tschuess",
    de: "Tschüss",
    pl: "Cześć (na pożegnanie)",
    category: "greetings",
    note: "Nieformalnie, do znajomych.",
  },
  {
    id: "greetings-bis-bald",
    de: "Bis bald",
    pl: "Do zobaczenia wkrótce",
    category: "greetings",
  },
  {
    id: "greetings-bis-spaeter",
    de: "Bis später",
    pl: "Do później",
    category: "greetings",
    note: "Gdy widzicie się jeszcze tego samego dnia.",
  },
  {
    id: "greetings-schoenen-tag-noch",
    de: "Schönen Tag noch!",
    pl: "Miłego dnia!",
    category: "greetings",
    note: "Częste na pożegnanie w sklepie czy kawiarni.",
  },

  // --- Grzeczność i podstawy --------------------------------------------
  {
    id: "politeness-bitte",
    de: "Bitte",
    pl: "Proszę / Nie ma za co",
    category: "politeness",
    note: "Działa i przy prośbie, i jako odpowiedź na „Danke”.",
  },
  {
    id: "politeness-danke",
    de: "Danke schön",
    pl: "Dziękuję bardzo",
    category: "politeness",
    note: "Samo „Danke” to zwykłe „dziękuję”.",
  },
  {
    id: "politeness-entschuldigung",
    de: "Entschuldigung",
    pl: "Przepraszam",
    category: "politeness",
    note: "Zarówno przeprosiny, jak i zaczepienie kogoś na ulicy.",
  },
  {
    id: "politeness-kein-problem",
    de: "Kein Problem",
    pl: "Żaden problem",
    category: "politeness",
  },
  { id: "politeness-ja", de: "Ja", pl: "Tak", category: "politeness" },
  { id: "politeness-nein", de: "Nein", pl: "Nie", category: "politeness" },
  {
    id: "politeness-vielleicht",
    de: "Vielleicht",
    pl: "Może",
    category: "politeness",
  },

  // --- Przedstawianie się ------------------------------------------------
  {
    id: "introductions-ich-heisse",
    de: "Ich heiße …",
    pl: "Nazywam się …",
    category: "introductions",
  },
  {
    id: "introductions-wie-heisst-du",
    de: "Wie heißt du?",
    pl: "Jak masz na imię?",
    category: "introductions",
    note: "Nieformalnie, na „ty”.",
  },
  {
    id: "introductions-wie-heissen-sie",
    de: "Wie heißen Sie?",
    pl: "Jak się pan/pani nazywa?",
    category: "introductions",
    note: "Formalnie, przez „Sie”.",
  },
  {
    id: "introductions-ich-komme-aus-polen",
    de: "Ich komme aus Polen.",
    pl: "Jestem z Polski.",
    category: "introductions",
  },
  {
    id: "introductions-ich-wohne-in",
    de: "Ich wohne in …",
    pl: "Mieszkam w …",
    category: "introductions",
  },
  {
    id: "introductions-wie-gehts-dir",
    de: "Wie geht's dir?",
    pl: "Jak się masz?",
    category: "introductions",
    note: "Nieformalnie.",
  },
  {
    id: "introductions-wie-geht-es-ihnen",
    de: "Wie geht es Ihnen?",
    pl: "Jak się pan/pani miewa?",
    category: "introductions",
    note: "Formalnie.",
  },
  {
    id: "introductions-mir-geht-es-gut",
    de: "Mir geht es gut, danke.",
    pl: "Mam się dobrze, dziękuję.",
    category: "introductions",
  },

  // --- Pytania podstawowe ------------------------------------------------
  {
    id: "questions-wie-bitte",
    de: "Wie bitte?",
    pl: "Słucham?",
    category: "questions",
    note: "Gdy czegoś nie dosłyszałeś.",
  },
  {
    id: "questions-koennen-sie-das-wiederholen",
    de: "Können Sie das wiederholen?",
    pl: "Może pan/pani to powtórzyć?",
    category: "questions",
  },
  {
    id: "questions-sprechen-sie-englisch",
    de: "Sprechen Sie Englisch?",
    pl: "Czy mówi pan/pani po angielsku?",
    category: "questions",
  },
  {
    id: "questions-ich-verstehe-nicht",
    de: "Ich verstehe nicht.",
    pl: "Nie rozumiem.",
    category: "questions",
  },
  {
    id: "questions-koennen-sie-langsamer-sprechen",
    de: "Können Sie langsamer sprechen?",
    pl: "Może pan/pani mówić wolniej?",
    category: "questions",
  },
  {
    id: "questions-was-bedeutet-das",
    de: "Was bedeutet das?",
    pl: "Co to znaczy?",
    category: "questions",
  },
  {
    id: "questions-wo-ist",
    de: "Wo ist …?",
    pl: "Gdzie jest …?",
    category: "questions",
  },
  {
    id: "questions-wie-viel-kostet-das",
    de: "Wie viel kostet das?",
    pl: "Ile to kosztuje?",
    category: "questions",
  },
  {
    id: "questions-wie-spaet-ist-es",
    de: "Wie spät ist es?",
    pl: "Która jest godzina?",
    category: "questions",
  },

  // --- Restauracja i kawiarnia -------------------------------------------
  {
    id: "restaurant-ich-haette-gern",
    de: "Ich hätte gern …",
    pl: "Poproszę …",
    category: "restaurant",
    note: "Grzeczna forma zamawiania — bezpieczniejsza niż „Ich will”.",
  },
  {
    id: "restaurant-die-speisekarte-bitte",
    de: "Die Speisekarte, bitte.",
    pl: "Poproszę menu.",
    category: "restaurant",
  },
  {
    id: "restaurant-zahlen-bitte",
    de: "Zahlen, bitte!",
    pl: "Poproszę rachunek!",
    category: "restaurant",
  },
  {
    id: "restaurant-das-wars-danke",
    de: "Das war's, danke.",
    pl: "To wszystko, dziękuję.",
    category: "restaurant",
    note: "Kończy zamówienie.",
  },
  {
    id: "restaurant-guten-appetit",
    de: "Guten Appetit!",
    pl: "Smacznego!",
    category: "restaurant",
  },

  // --- Zakupy -------------------------------------------------------------
  {
    id: "shopping-ich-suche",
    de: "Ich suche …",
    pl: "Szukam …",
    category: "shopping",
  },
  {
    id: "shopping-haben-sie",
    de: "Haben Sie …?",
    pl: "Czy ma pan/pani …?",
    category: "shopping",
  },
  {
    id: "shopping-ich-schaue-nur",
    de: "Ich schaue nur, danke.",
    pl: "Tylko oglądam, dziękuję.",
    category: "shopping",
  },
  {
    id: "shopping-kann-ich-mit-karte-zahlen",
    de: "Kann ich mit Karte zahlen?",
    pl: "Czy mogę zapłacić kartą?",
    category: "shopping",
    note: "W Niemczech pytanie wciąż praktyczne — gotówka bywa jedyną opcją.",
  },

  // --- Small talk i uczucia -----------------------------------------------
  {
    id: "smalltalk-das-ist-interessant",
    de: "Das ist interessant.",
    pl: "To ciekawe.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-das-ist-super",
    de: "Das ist super.",
    pl: "To super.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-das-ist-schade",
    de: "Das ist schade.",
    pl: "Szkoda.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-ich-bin-muede",
    de: "Ich bin müde.",
    pl: "Jestem zmęczony.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-ich-bin-hungrig",
    de: "Ich bin hungrig.",
    pl: "Jestem głodny.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-ich-bin-froh",
    de: "Ich bin froh.",
    pl: "Jestem zadowolony.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-alles-klar",
    de: "Alles klar.",
    pl: "Wszystko jasne.",
    category: "smalltalk",
    note: "Także jako „w porządku, rozumiem”.",
  },
];

/**
 * Duplicate ids would silently overwrite each other's SRS state in Firestore,
 * so fail loudly at import time instead.
 */
const duplicateIds = PHRASES.map((phrase) => phrase.id).filter(
  (id, index, ids) => ids.indexOf(id) !== index,
);

if (duplicateIds.length > 0) {
  throw new Error(`Duplicate phrase ids: ${duplicateIds.join(", ")}`);
}

export function getPhrasesByCategory(category: CategoryId): Phrase[] {
  return PHRASES.filter((phrase) => phrase.category === category);
}

const PHRASES_BY_ID = new Map(PHRASES.map((phrase) => [phrase.id, phrase]));

/** The deck in review order — the queue builder only needs the ids. */
export const PHRASE_IDS: readonly string[] = PHRASES.map((phrase) => phrase.id);

/** `undefined` for an id that left the deck, e.g. saved state from an old build. */
export function getPhrase(id: string): Phrase | undefined {
  return PHRASES_BY_ID.get(id);
}
