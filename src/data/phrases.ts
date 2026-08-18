import type { CategoryId, Phrase } from "@/types/content";

/**
 * The deck is the single source of truth for phrases. `star learn german.md`
 * holds the original starter set plus the study plan and links, but the deck
 * has since grown past it — do not treat that file as the list to sync with.
 *
 * Entries that listed several variants on one line ("Ja / Nein / Vielleicht")
 * are split into one card each — spaced repetition works on single items, not
 * on lists. Number and weekday runs are the deliberate exception: they are
 * memorised as a series, so splitting "eins, zwei, drei" into three cards would
 * make them harder, not easier.
 *
 * Size is chosen against the study plan: DEFAULT_NEW_CARDS_PER_DAY is 8 and the
 * plan runs 28 days, so a deck under ~200 phrases runs dry before week 4.
 *
 * The `id` of every phrase is the primary key of its SRS state in Firestore.
 * Adding phrases is safe; renaming an existing id orphans the user's progress.
 *
 * So append the ids of anything you add here to `RELEASED_PHRASE_IDS` in
 * `phrases.test.ts`. That ledger is the only thing guarding the rule, and a new
 * phrase stays unguarded until it lands there — the test cannot notice a rename
 * of an id it was never told about.
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
  {
    id: "greetings-bis-morgen",
    de: "Bis morgen",
    pl: "Do jutra",
    category: "greetings",
  },
  {
    id: "greetings-wir-sehen-uns",
    de: "Wir sehen uns!",
    pl: "Do zobaczenia!",
    category: "greetings",
  },
  {
    id: "greetings-gute-nacht",
    de: "Gute Nacht",
    pl: "Dobranoc",
    category: "greetings",
    note: "Tylko przed snem. Żegnając się wieczorem mówisz „Schönen Abend noch”.",
  },
  {
    id: "greetings-schoenes-wochenende",
    de: "Schönes Wochenende!",
    pl: "Miłego weekendu!",
    category: "greetings",
    note: "Standard w piątek — usłyszysz przy każdej kasie.",
  },
  {
    id: "greetings-moin",
    de: "Moin",
    pl: "Cześć",
    category: "greetings",
    note: "Północ Niemiec, o każdej porze dnia mimo brzmienia.",
  },
  {
    id: "greetings-servus",
    de: "Servus",
    pl: "Cześć",
    category: "greetings",
    note: "Bawaria i Austria, działa i na powitanie, i na pożegnanie.",
  },
  {
    id: "greetings-gruess-gott",
    de: "Grüß Gott",
    pl: "Dzień dobry",
    category: "greetings",
    note: "Bawaria i Austria, forma grzecznościowa — nie brzmi religijnie.",
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
  {
    id: "politeness-vielen-dank",
    de: "Vielen Dank!",
    pl: "Wielkie dzięki!",
    category: "politeness",
    note: "Mocniejsze od „Danke”, wciąż całkiem formalne.",
  },
  {
    id: "politeness-gern-geschehen",
    de: "Gern geschehen",
    pl: "Nie ma za co",
    category: "politeness",
    note: "Cieplejsza odpowiedź na podziękowanie niż samo „Bitte”.",
  },
  {
    id: "politeness-danke-gleichfalls",
    de: "Danke, gleichfalls!",
    pl: "Dziękuję, nawzajem!",
    category: "politeness",
    note: "Odpowiedź na „Schönen Tag noch” — załatwia całą wymianę.",
  },
  {
    id: "politeness-entschuldigen-sie-bitte",
    de: "Entschuldigen Sie, bitte.",
    pl: "Przepraszam pana/panią.",
    category: "politeness",
    note: "Grzeczniejsze niż samo „Entschuldigung”, gdy zaczepiasz obcą osobę.",
  },
  {
    id: "politeness-es-tut-mir-leid",
    de: "Es tut mir leid.",
    pl: "Przykro mi.",
    category: "politeness",
    note: "Prawdziwe przeprosiny. „Entschuldigung” to raczej „sorry”.",
  },
  {
    id: "politeness-macht-nichts",
    de: "Macht nichts.",
    pl: "Nic nie szkodzi.",
    category: "politeness",
  },
  {
    id: "politeness-natuerlich",
    de: "Natürlich",
    pl: "Oczywiście",
    category: "politeness",
  },
  {
    id: "politeness-koennen-sie-mir-helfen",
    de: "Können Sie mir helfen?",
    pl: "Czy może mi pan/pani pomóc?",
    category: "politeness",
  },
  {
    id: "politeness-einen-moment-bitte",
    de: "Einen Moment, bitte.",
    pl: "Chwileczkę, proszę.",
    category: "politeness",
    note: "Kupuje czas, gdy szukasz słowa.",
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
  {
    id: "introductions-ich-bin",
    de: "Ich bin …",
    pl: "Jestem …",
    category: "introductions",
    note: "Prostsza alternatywa dla „Ich heiße” — samo imię wystarczy.",
  },
  {
    id: "introductions-freut-mich",
    de: "Freut mich!",
    pl: "Miło mi!",
    category: "introductions",
    note: "Skrót od „Es freut mich, Sie kennenzulernen”.",
  },
  {
    id: "introductions-und-sie",
    de: "Und Sie?",
    pl: "A pan/pani?",
    category: "introductions",
    note: "Odbija pytanie z powrotem — najtańszy sposób na podtrzymanie rozmowy.",
  },
  {
    id: "introductions-woher-kommen-sie",
    de: "Woher kommen Sie?",
    pl: "Skąd pan/pani pochodzi?",
    category: "introductions",
  },
  {
    id: "introductions-ich-bin-jahre-alt",
    de: "Ich bin … Jahre alt.",
    pl: "Mam … lat.",
    category: "introductions",
    note: "Po niemiecku wiek się „jest”, nie „ma”.",
  },
  {
    id: "introductions-was-machen-sie-beruflich",
    de: "Was machen Sie beruflich?",
    pl: "Czym się pan/pani zajmuje zawodowo?",
    category: "introductions",
  },
  {
    id: "introductions-ich-arbeite-als",
    de: "Ich arbeite als …",
    pl: "Pracuję jako …",
    category: "introductions",
    note: "Bez rodzajnika: „Ich arbeite als Programmierer”.",
  },
  {
    id: "introductions-ich-lerne-deutsch",
    de: "Ich lerne Deutsch.",
    pl: "Uczę się niemieckiego.",
    category: "introductions",
  },
  {
    id: "introductions-ich-spreche-nur-ein-bisschen-deutsch",
    de: "Ich spreche nur ein bisschen Deutsch.",
    pl: "Mówię tylko trochę po niemiecku.",
    category: "introductions",
    note: "Rozbraja sytuację i zwykle sprawia, że rozmówca zwalnia.",
  },
  {
    id: "introductions-das-ist-ein-freund-von-mir",
    de: "Das ist ein Freund von mir.",
    pl: "To mój kolega.",
    category: "introductions",
    note: "Uwaga: samo „mein Freund” zwykle znaczy „mój chłopak”.",
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
  {
    id: "questions-wo-ist-die-toilette",
    de: "Wo ist die Toilette?",
    pl: "Gdzie jest toaleta?",
    category: "questions",
  },
  {
    id: "questions-was-ist-das",
    de: "Was ist das?",
    pl: "Co to jest?",
    category: "questions",
  },
  {
    id: "questions-wie-sagt-man-das-auf-deutsch",
    de: "Wie sagt man das auf Deutsch?",
    pl: "Jak to się mówi po niemiecku?",
    category: "questions",
    note: "Zamienia każdą rozmowę w lekcję.",
  },
  {
    id: "questions-koennen-sie-das-aufschreiben",
    de: "Können Sie das aufschreiben?",
    pl: "Może pan/pani to zapisać?",
    category: "questions",
    note: "Ratuje, gdy ze słuchu nie łapiesz nazw ani liczb.",
  },
  {
    id: "questions-wann",
    de: "Wann?",
    pl: "Kiedy?",
    category: "questions",
  },
  {
    id: "questions-warum",
    de: "Warum?",
    pl: "Dlaczego?",
    category: "questions",
  },
  {
    id: "questions-wie-lange-dauert-das",
    de: "Wie lange dauert das?",
    pl: "Jak długo to trwa?",
    category: "questions",
  },
  {
    id: "questions-haben-sie-wlan",
    de: "Haben Sie WLAN?",
    pl: "Czy jest u państwa Wi-Fi?",
    category: "questions",
    note: "Czyta się „we-lan”. „Wi-Fi” po niemiecku nie zadziała.",
  },

  // --- Liczby, czas i daty ------------------------------------------------
  {
    id: "numbers-eins-bis-fuenf",
    de: "eins, zwei, drei, vier, fünf",
    pl: "jeden, dwa, trzy, cztery, pięć",
    category: "numbers",
  },
  {
    id: "numbers-sechs-bis-zehn",
    de: "sechs, sieben, acht, neun, zehn",
    pl: "sześć, siedem, osiem, dziewięć, dziesięć",
    category: "numbers",
  },
  {
    id: "numbers-elf-bis-fuenfzehn",
    de: "elf, zwölf, dreizehn, vierzehn, fünfzehn",
    pl: "jedenaście, dwanaście, trzynaście, czternaście, piętnaście",
    category: "numbers",
  },
  {
    id: "numbers-sechzehn-bis-zwanzig",
    de: "sechzehn, siebzehn, achtzehn, neunzehn, zwanzig",
    pl: "szesnaście, siedemnaście, osiemnaście, dziewiętnaście, dwadzieścia",
    category: "numbers",
    note: "Uwaga na skróty: „sechzehn” bez -s, „siebzehn” bez -en.",
  },
  {
    id: "numbers-zehner",
    de: "dreißig, vierzig, fünfzig, sechzig",
    pl: "trzydzieści, czterdzieści, pięćdziesiąt, sześćdziesiąt",
    category: "numbers",
    note: "Wszystkie przez -zig, tylko „dreißig” przez -ßig.",
  },
  {
    id: "numbers-einundzwanzig",
    de: "einundzwanzig",
    pl: "dwadzieścia jeden",
    category: "numbers",
    note: "Niemcy czytają od tyłu — dosłownie „jeden i dwadzieścia”. Stąd pomyłki przy cenach.",
  },
  {
    id: "numbers-hundert-tausend",
    de: "hundert, tausend",
    pl: "sto, tysiąc",
    category: "numbers",
  },
  {
    id: "numbers-montag-dienstag-mittwoch",
    de: "Montag, Dienstag, Mittwoch",
    pl: "poniedziałek, wtorek, środa",
    category: "numbers",
  },
  {
    id: "numbers-donnerstag-freitag",
    de: "Donnerstag, Freitag",
    pl: "czwartek, piątek",
    category: "numbers",
  },
  {
    id: "numbers-samstag-sonntag",
    de: "Samstag, Sonntag",
    pl: "sobota, niedziela",
    category: "numbers",
    note: "Na północy usłyszysz też „Sonnabend” zamiast „Samstag”.",
  },
  {
    id: "numbers-am-montag",
    de: "am Montag",
    pl: "w poniedziałek",
    category: "numbers",
    note: "Dni tygodnia zawsze z „am”.",
  },
  {
    id: "numbers-am-wochenende",
    de: "am Wochenende",
    pl: "w weekend",
    category: "numbers",
  },
  {
    id: "numbers-es-ist-drei-uhr",
    de: "Es ist drei Uhr.",
    pl: "Jest godzina trzecia.",
    category: "numbers",
  },
  {
    id: "numbers-halb-drei",
    de: "halb drei",
    pl: "wpół do trzeciej",
    category: "numbers",
    note: "To 2:30, nie 3:30 — Niemcy liczą do pełnej godziny, tak jak Polacy.",
  },
  {
    id: "numbers-viertel-nach",
    de: "Viertel nach vier",
    pl: "kwadrans po czwartej",
    category: "numbers",
  },
  {
    id: "numbers-viertel-vor",
    de: "Viertel vor fünf",
    pl: "za kwadrans piąta",
    category: "numbers",
  },
  {
    id: "numbers-um-wie-viel-uhr",
    de: "Um wie viel Uhr?",
    pl: "O której godzinie?",
    category: "numbers",
  },
  {
    id: "numbers-heute-morgen-gestern",
    de: "heute, morgen, gestern",
    pl: "dziś, jutro, wczoraj",
    category: "numbers",
    note: "„morgen” to jutro, „der Morgen” to poranek.",
  },
  {
    id: "numbers-jetzt-spaeter",
    de: "jetzt, später",
    pl: "teraz, później",
    category: "numbers",
  },
  {
    id: "numbers-morgens-abends",
    de: "morgens, abends",
    pl: "rano, wieczorem",
    category: "numbers",
  },
  {
    id: "numbers-naechste-woche",
    de: "nächste Woche",
    pl: "w przyszłym tygodniu",
    category: "numbers",
  },
  {
    id: "numbers-letzte-woche",
    de: "letzte Woche",
    pl: "w zeszłym tygodniu",
    category: "numbers",
  },
  {
    id: "numbers-jeden-tag",
    de: "jeden Tag",
    pl: "codziennie",
    category: "numbers",
  },
  {
    id: "numbers-der-erste-mai",
    de: "der erste Mai",
    pl: "pierwszy maja",
    category: "numbers",
    note: "Daty przez liczebniki porządkowe: „am ersten Mai”.",
  },

  // --- Orientacja i transport ---------------------------------------------
  {
    id: "directions-wie-komme-ich-zum-bahnhof",
    de: "Wie komme ich zum Bahnhof?",
    pl: "Jak dojdę na dworzec?",
    category: "directions",
    note: "Podmień ostatnie słowo — wzór działa dla każdego celu.",
  },
  {
    id: "directions-geradeaus",
    de: "geradeaus",
    pl: "prosto",
    category: "directions",
  },
  {
    id: "directions-nach-links",
    de: "nach links",
    pl: "w lewo",
    category: "directions",
  },
  {
    id: "directions-nach-rechts",
    de: "nach rechts",
    pl: "w prawo",
    category: "directions",
  },
  {
    id: "directions-an-der-ampel-links",
    de: "An der Ampel links.",
    pl: "Na światłach w lewo.",
    category: "directions",
  },
  {
    id: "directions-ist-es-weit-von-hier",
    de: "Ist es weit von hier?",
    pl: "Czy to daleko stąd?",
    category: "directions",
  },
  {
    id: "directions-zu-fuss",
    de: "zu Fuß",
    pl: "pieszo",
    category: "directions",
  },
  {
    id: "directions-in-der-naehe",
    de: "in der Nähe",
    pl: "w pobliżu",
    category: "directions",
  },
  {
    id: "directions-gegenueber",
    de: "gegenüber",
    pl: "naprzeciwko",
    category: "directions",
  },
  {
    id: "directions-neben-dem-bahnhof",
    de: "neben dem Bahnhof",
    pl: "obok dworca",
    category: "directions",
  },
  {
    id: "directions-ich-habe-mich-verlaufen",
    de: "Ich habe mich verlaufen.",
    pl: "Zgubiłem się.",
    category: "directions",
    note: "Pieszo. W aucie: „Ich habe mich verfahren”.",
  },
  {
    id: "directions-koennen-sie-mir-das-auf-der-karte-zeigen",
    de: "Können Sie mir das auf der Karte zeigen?",
    pl: "Może mi pan/pani pokazać to na mapie?",
    category: "directions",
    note: "Ratunek, gdy nie nadążasz za opisem drogi.",
  },
  {
    id: "directions-eine-fahrkarte-nach-berlin",
    de: "Eine Fahrkarte nach Berlin, bitte.",
    pl: "Poproszę bilet do Berlina.",
    category: "directions",
  },
  {
    id: "directions-einfach-oder-hin-und-zurueck",
    de: "Einfach oder hin und zurück?",
    pl: "W jedną stronę czy w obie?",
    category: "directions",
    note: "Zapyta kasjer — warto rozpoznać ze słuchu.",
  },
  {
    id: "directions-wann-faehrt-der-naechste-zug",
    de: "Wann fährt der nächste Zug?",
    pl: "Kiedy odjeżdża następny pociąg?",
    category: "directions",
  },
  {
    id: "directions-von-welchem-gleis",
    de: "Von welchem Gleis?",
    pl: "Z którego peronu?",
    category: "directions",
  },
  {
    id: "directions-der-zug-hat-verspaetung",
    de: "Der Zug hat Verspätung.",
    pl: "Pociąg jest opóźniony.",
    category: "directions",
    note: "Zdanie, które w Niemczech usłyszysz częściej, niż się spodziewasz.",
  },
  {
    id: "directions-muss-ich-umsteigen",
    de: "Muss ich umsteigen?",
    pl: "Czy muszę się przesiadać?",
    category: "directions",
  },
  {
    id: "directions-wo-ist-die-haltestelle",
    de: "Wo ist die Haltestelle?",
    pl: "Gdzie jest przystanek?",
    category: "directions",
  },
  {
    id: "directions-haelt-dieser-bus-am-markt",
    de: "Hält dieser Bus am Markt?",
    pl: "Czy ten autobus zatrzymuje się na rynku?",
    category: "directions",
  },
  {
    id: "directions-ist-dieser-platz-frei",
    de: "Ist dieser Platz frei?",
    pl: "Czy to miejsce jest wolne?",
    category: "directions",
  },
  {
    id: "directions-ich-suche-diese-adresse",
    de: "Ich suche diese Adresse.",
    pl: "Szukam tego adresu.",
    category: "directions",
    note: "Wystarczy pokazać telefon — reszta rozmowy zrobi się sama.",
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
  {
    id: "restaurant-einen-tisch-fuer-zwei",
    de: "Einen Tisch für zwei, bitte.",
    pl: "Poproszę stolik dla dwóch osób.",
    category: "restaurant",
  },
  {
    id: "restaurant-haben-sie-reserviert",
    de: "Haben Sie reserviert?",
    pl: "Czy mają państwo rezerwację?",
    category: "restaurant",
    note: "Zwykle pierwsze pytanie kelnera przy drzwiach.",
  },
  {
    id: "restaurant-ein-bier-bitte",
    de: "Ein Bier, bitte.",
    pl: "Poproszę piwo.",
    category: "restaurant",
  },
  {
    id: "restaurant-ein-glas-wasser-bitte",
    de: "Ein Glas Wasser, bitte.",
    pl: "Poproszę szklankę wody.",
    category: "restaurant",
    note: "Domyślnie dostaniesz gazowaną. Niegazowana to „stilles Wasser”.",
  },
  {
    id: "restaurant-einen-kaffee-bitte",
    de: "Einen Kaffee, bitte.",
    pl: "Poproszę kawę.",
    category: "restaurant",
  },
  {
    id: "restaurant-ich-nehme-das",
    de: "Ich nehme das.",
    pl: "Wezmę to.",
    category: "restaurant",
    note: "Ze wskazaniem palcem w menu działa zawsze.",
  },
  {
    id: "restaurant-was-empfehlen-sie",
    de: "Was empfehlen Sie?",
    pl: "Co pan/pani poleca?",
    category: "restaurant",
  },
  {
    id: "restaurant-ich-bin-vegetarier",
    de: "Ich bin Vegetarier.",
    pl: "Jestem wegetarianinem.",
    category: "restaurant",
    note: "Bez rodzajnika — przy zawodach i dietach niemiecki go pomija.",
  },
  {
    id: "restaurant-ohne-fleisch",
    de: "ohne Fleisch",
    pl: "bez mięsa",
    category: "restaurant",
  },
  {
    id: "restaurant-moechten-sie-noch-etwas-trinken",
    de: "Möchten Sie noch etwas trinken?",
    pl: "Czy życzą sobie państwo jeszcze coś do picia?",
    category: "restaurant",
  },
  {
    id: "restaurant-hat-es-geschmeckt",
    de: "Hat es geschmeckt?",
    pl: "Smakowało?",
    category: "restaurant",
    note: "Odpowiedź: „Ja, sehr gut, danke.”",
  },
  {
    id: "restaurant-getrennt-oder-zusammen",
    de: "Getrennt oder zusammen?",
    pl: "Osobno czy razem?",
    category: "restaurant",
    note: "Kelner pyta, czy płacicie osobno — pada przy każdym rachunku.",
  },
  {
    id: "restaurant-stimmt-so",
    de: "Stimmt so.",
    pl: "Reszty nie trzeba.",
    category: "restaurant",
    note: "Standardowy napiwek: mówisz to, podając zaokrągloną kwotę.",
  },
  {
    id: "restaurant-zum-mitnehmen-bitte",
    de: "Zum Mitnehmen, bitte.",
    pl: "Na wynos, proszę.",
    category: "restaurant",
    note: "Na miejscu: „Zum Hieressen”.",
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
  {
    id: "shopping-nur-bargeld",
    de: "Nur Bargeld.",
    pl: "Tylko gotówka.",
    category: "shopping",
    note: "Odpowiedź, którą usłyszysz częściej, niż się spodziewasz.",
  },
  {
    id: "shopping-wo-finde-ich",
    de: "Wo finde ich …?",
    pl: "Gdzie znajdę …?",
    category: "shopping",
  },
  {
    id: "shopping-haben-sie-das-in-groesse-m",
    de: "Haben Sie das in Größe M?",
    pl: "Czy jest to w rozmiarze M?",
    category: "shopping",
  },
  {
    id: "shopping-kann-ich-das-anprobieren",
    de: "Kann ich das anprobieren?",
    pl: "Czy mogę to przymierzyć?",
    category: "shopping",
  },
  {
    id: "shopping-das-ist-zu-teuer",
    de: "Das ist zu teuer.",
    pl: "To za drogie.",
    category: "shopping",
  },
  {
    id: "shopping-haben-sie-etwas-billigeres",
    de: "Haben Sie etwas Billigeres?",
    pl: "Czy mają państwo coś tańszego?",
    category: "shopping",
  },
  {
    id: "shopping-ist-das-im-angebot",
    de: "Ist das im Angebot?",
    pl: "Czy to jest w promocji?",
    category: "shopping",
  },
  {
    id: "shopping-eine-tuete-bitte",
    de: "Eine Tüte, bitte.",
    pl: "Poproszę reklamówkę.",
    category: "shopping",
    note: "Płatna i nie dostaniesz jej bez pytania.",
  },
  {
    id: "shopping-brauchen-sie-einen-kassenbon",
    de: "Brauchen Sie einen Kassenbon?",
    pl: "Czy potrzebuje pan/pani paragon?",
    category: "shopping",
    note: "Pytanie kasjera — wystarczy „Nein, danke”.",
  },
  {
    id: "shopping-ich-moechte-das-umtauschen",
    de: "Ich möchte das umtauschen.",
    pl: "Chciałbym to wymienić.",
    category: "shopping",
  },
  {
    id: "shopping-wann-haben-sie-geoeffnet",
    de: "Wann haben Sie geöffnet?",
    pl: "W jakich godzinach jest otwarte?",
    category: "shopping",
    note: "W niedzielę odpowiedź brzmi „geschlossen” — sklepy są zamknięte.",
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
  {
    id: "smalltalk-ich-bin-durstig",
    de: "Ich bin durstig.",
    pl: "Chce mi się pić.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-das-wetter-ist-schoen",
    de: "Das Wetter ist schön heute.",
    pl: "Dziś jest ładna pogoda.",
    category: "smalltalk",
    note: "Najbezpieczniejszy temat na otwarcie rozmowy.",
  },
  {
    id: "smalltalk-es-regnet",
    de: "Es regnet.",
    pl: "Pada deszcz.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-es-ist-kalt",
    de: "Es ist kalt.",
    pl: "Jest zimno.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-das-gefaellt-mir",
    de: "Das gefällt mir.",
    pl: "To mi się podoba.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-ich-mag",
    de: "Ich mag …",
    pl: "Lubię …",
    category: "smalltalk",
  },
  {
    id: "smalltalk-wirklich",
    de: "Wirklich?",
    pl: "Naprawdę?",
    category: "smalltalk",
    note: "Krótkie reakcje trzymają rozmowę przy życiu, gdy brakuje Ci słów.",
  },
  {
    id: "smalltalk-genau",
    de: "Genau!",
    pl: "Dokładnie!",
    category: "smalltalk",
    note: "Niemcy używają tego bez przerwy — brzmisz naturalnie za darmo.",
  },
  {
    id: "smalltalk-stimmt",
    de: "Stimmt.",
    pl: "Zgadza się.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-ach-so",
    de: "Ach so!",
    pl: "Aha, rozumiem!",
    category: "smalltalk",
  },
  {
    id: "smalltalk-was-machst-du-in-der-freizeit",
    de: "Was machst du in der Freizeit?",
    pl: "Co robisz w wolnym czasie?",
    category: "smalltalk",
  },
  {
    id: "smalltalk-ich-bin-zum-ersten-mal-hier",
    de: "Ich bin zum ersten Mal hier.",
    pl: "Jestem tu pierwszy raz.",
    category: "smalltalk",
  },
  {
    id: "smalltalk-viel-glueck",
    de: "Viel Glück!",
    pl: "Powodzenia!",
    category: "smalltalk",
  },
  {
    id: "smalltalk-herzlichen-glueckwunsch",
    de: "Herzlichen Glückwunsch!",
    pl: "Wszystkiego najlepszego!",
    category: "smalltalk",
    note: "Na urodziny i każdą inną gratulację.",
  },

  // --- Łączniki i budowa zdań ---------------------------------------------
  { id: "connectors-und", de: "und", pl: "i", category: "connectors" },
  { id: "connectors-aber", de: "aber", pl: "ale", category: "connectors" },
  { id: "connectors-oder", de: "oder", pl: "albo", category: "connectors" },
  { id: "connectors-auch", de: "auch", pl: "też", category: "connectors" },
  {
    id: "connectors-denn",
    de: "denn",
    pl: "bo",
    category: "connectors",
    note: "Łatwiejsze niż „weil” — szyk zdania się nie zmienia.",
  },
  {
    id: "connectors-weil",
    de: "weil",
    pl: "ponieważ",
    category: "connectors",
    note: "Wyrzuca czasownik na koniec: „…, weil ich müde bin”.",
  },
  {
    id: "connectors-deshalb",
    de: "deshalb",
    pl: "dlatego",
    category: "connectors",
  },
  {
    id: "connectors-wenn",
    de: "wenn",
    pl: "jeśli / kiedy",
    category: "connectors",
  },
  {
    id: "connectors-dass",
    de: "dass",
    pl: "że",
    category: "connectors",
    note: "Też wyrzuca czasownik na koniec zdania podrzędnego.",
  },
  {
    id: "connectors-zuerst-dann",
    de: "zuerst … dann …",
    pl: "najpierw … potem …",
    category: "connectors",
    note: "Wystarczy, żeby opowiedzieć o swoim dniu.",
  },
  {
    id: "connectors-schon",
    de: "schon",
    pl: "już",
    category: "connectors",
  },
  {
    id: "connectors-noch-nicht",
    de: "noch nicht",
    pl: "jeszcze nie",
    category: "connectors",
  },
  { id: "connectors-sehr", de: "sehr", pl: "bardzo", category: "connectors" },
  {
    id: "connectors-ein-bisschen",
    de: "ein bisschen",
    pl: "trochę",
    category: "connectors",
  },
  {
    id: "connectors-ich-moechte",
    de: "Ich möchte …",
    pl: "Chciałbym …",
    category: "connectors",
    note: "Uniwersalny początek prośby — grzeczniejszy niż „Ich will”.",
  },
  {
    id: "connectors-ich-muss",
    de: "Ich muss …",
    pl: "Muszę …",
    category: "connectors",
    note: "Drugi czasownik ląduje na końcu: „Ich muss jetzt gehen”.",
  },
  {
    id: "connectors-ich-kann-nicht",
    de: "Ich kann nicht …",
    pl: "Nie mogę …",
    category: "connectors",
  },
  {
    id: "connectors-darf-ich",
    de: "Darf ich …?",
    pl: "Czy mogę …?",
    category: "connectors",
    note: "Pytanie o pozwolenie. O możliwość pytasz przez „Kann ich …?”.",
  },
  {
    id: "connectors-es-gibt",
    de: "Es gibt …",
    pl: "Jest / są …",
    category: "connectors",
    note: "Dosłownie „to daje”. Niemiecki odpowiednik „there is”.",
  },
  {
    id: "connectors-ich-glaube",
    de: "Ich glaube, …",
    pl: "Myślę, że …",
    category: "connectors",
    note: "Po przecinku zdanie ma normalny szyk — „dass” można pominąć.",
  },

  // --- Zdrowie i sytuacje awaryjne ----------------------------------------
  {
    id: "health-hilfe",
    de: "Hilfe!",
    pl: "Pomocy!",
    category: "health",
  },
  {
    id: "health-notruf-112",
    de: "Der Notruf ist 112.",
    pl: "Numer alarmowy to 112.",
    category: "health",
    note: "112 działa w całej Europie. Sama policja to 110.",
  },
  {
    id: "health-rufen-sie-einen-arzt",
    de: "Rufen Sie einen Arzt!",
    pl: "Proszę wezwać lekarza!",
    category: "health",
  },
  {
    id: "health-rufen-sie-die-polizei",
    de: "Rufen Sie die Polizei!",
    pl: "Proszę wezwać policję!",
    category: "health",
  },
  {
    id: "health-ich-brauche-einen-arzt",
    de: "Ich brauche einen Arzt.",
    pl: "Potrzebuję lekarza.",
    category: "health",
  },
  {
    id: "health-ich-fuehle-mich-nicht-gut",
    de: "Ich fühle mich nicht gut.",
    pl: "Źle się czuję.",
    category: "health",
  },
  {
    id: "health-mir-ist-schlecht",
    de: "Mir ist schlecht.",
    pl: "Jest mi niedobrze.",
    category: "health",
    note: "O mdłościach. „Ich bin schlecht” znaczy „jestem zły (kiepski)”.",
  },
  {
    id: "health-ich-habe-kopfschmerzen",
    de: "Ich habe Kopfschmerzen.",
    pl: "Boli mnie głowa.",
    category: "health",
  },
  {
    id: "health-ich-habe-bauchschmerzen",
    de: "Ich habe Bauchschmerzen.",
    pl: "Boli mnie brzuch.",
    category: "health",
  },
  {
    id: "health-hier-tut-es-weh",
    de: "Hier tut es weh.",
    pl: "Tu mnie boli.",
    category: "health",
    note: "Z pokazaniem palcem załatwia całą wizytę.",
  },
  {
    id: "health-ich-bin-allergisch-gegen",
    de: "Ich bin allergisch gegen …",
    pl: "Mam alergię na …",
    category: "health",
  },
  {
    id: "health-ich-nehme-diese-medikamente",
    de: "Ich nehme diese Medikamente.",
    pl: "Biorę te leki.",
    category: "health",
  },
  {
    id: "health-wo-ist-die-apotheke",
    de: "Wo ist die Apotheke?",
    pl: "Gdzie jest apteka?",
    category: "health",
    note: "Leki tylko w aptece — w drogerii („Drogerie”) ich nie kupisz.",
  },
  {
    id: "health-ich-brauche-einen-termin",
    de: "Ich brauche einen Termin.",
    pl: "Potrzebuję umówić wizytę.",
    category: "health",
    note: "Bez „Termin” w Niemczech nie załatwisz prawie niczego.",
  },
  {
    id: "health-ich-habe-meinen-pass-verloren",
    de: "Ich habe meinen Pass verloren.",
    pl: "Zgubiłem paszport.",
    category: "health",
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
