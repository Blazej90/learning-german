/**
 * Source: `start-learning-german.md`, section 3 — "Darmowe kursy i materiały".
 *
 * The file itself spells out only two addresses (Nicos Weg, Goethe-Institut);
 * the rest are the official home pages of the services it names by title.
 */

export type Resource = {
  name: string;
  /** One line on what it is good for — Polish, like the rest of the UI. */
  description: string;
  url: string;
};

export type ResourceGroup = {
  id: string;
  title: string;
  resources: readonly Resource[];
};

export const RESOURCE_GROUPS: readonly ResourceGroup[] = [
  {
    id: "course",
    title: "Kurs strukturalny",
    resources: [
      {
        name: "Nicos Weg (Deutsche Welle)",
        description:
          "Darmowy kurs A1–B1 z ćwiczeniami, gramatyką i certyfikatem po każdym poziomie. Najlepszy punkt startowy.",
        url: "https://learngerman.dw.com/en/overview",
      },
    ],
  },
  {
    id: "exercises",
    title: "Ćwiczenia i społeczność",
    resources: [
      {
        name: "Goethe-Institut — Deutsch für dich",
        description:
          "Ponad 260 darmowych ćwiczeń na poziomach A1–C2 plus społeczność do wymiany.",
        url: "https://www.goethe.de/ins/pl/pl/spr/ueb.html",
      },
    ],
  },
  {
    id: "listening",
    title: "Słuchanie",
    resources: [
      {
        name: "Easy German",
        description:
          "Wywiady na ulicy z napisami PL/EN/DE — żywy język, nie studyjny.",
        url: "https://www.youtube.com/@EasyGerman",
      },
      {
        name: "Slow German",
        description: "Podcast czytany wolniej, z transkrypcjami.",
        url: "https://slowgerman.com/",
      },
      {
        name: "DW Deutsch lernen",
        description: "Materiały wideo i podcasty na różne poziomy.",
        url: "https://learngerman.dw.com/en/beginners/c-36519789",
      },
    ],
  },
  {
    id: "flashcards",
    title: "Fiszki i powtórki",
    resources: [
      {
        name: "Anki",
        description:
          "Darmowy system powtórek — na słówka z rozmów, których nie ma w tej talii.",
        url: "https://apps.ankiweb.net/",
      },
    ],
  },
  {
    id: "speaking",
    title: "Rozmowy z innymi",
    resources: [
      {
        name: "Tandem",
        description:
          "Wymiana językowa: Ty pomagasz w polskim, native speaker Tobie w niemieckim.",
        url: "https://www.tandem.net/",
      },
      {
        name: "HelloTalk",
        description: "To samo co Tandem, inna społeczność — warto sprawdzić obie.",
        url: "https://www.hellotalk.com/",
      },
      {
        name: "italki",
        description:
          "Płatne lekcje 1:1, taniej niż szkoła językowa. Na pierwszą prawdziwą rozmowę w tygodniu 3.",
        url: "https://www.italki.com/",
      },
    ],
  },
];
