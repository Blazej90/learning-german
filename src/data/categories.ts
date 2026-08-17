import { CATEGORY_IDS, type Category, type CategoryId } from "@/types/content";

const LABELS: Record<CategoryId, Omit<Category, "id">> = {
  greetings: {
    name: "Powitania i pożegnania",
    short: "Powitania",
    description: "Pierwsze i ostatnie zdanie każdej rozmowy.",
  },
  politeness: {
    name: "Grzeczność i podstawy",
    short: "Grzeczność",
    description: "Słowa, bez których nie zbudujesz żadnego zdania.",
  },
  introductions: {
    name: "Przedstawianie się",
    short: "O sobie",
    description: "Kim jesteś, skąd jesteś, jak się masz.",
  },
  questions: {
    name: "Pytania podstawowe",
    short: "Pytania",
    description: "Ratunek, gdy nie rozumiesz albo czegoś szukasz.",
  },
  numbers: {
    name: "Liczby, czas i daty",
    short: "Liczby i czas",
    description: "Godziny, ceny i dni tygodnia — bez nich niczego nie umówisz.",
  },
  directions: {
    name: "Orientacja i transport",
    short: "Transport",
    description: "Jak dojść, dojechać i nie zgubić się po drodze.",
  },
  restaurant: {
    name: "Restauracja i kawiarnia",
    short: "Restauracja",
    description: "Zamówienie, rachunek, uprzejmości przy stole.",
  },
  shopping: {
    name: "Zakupy",
    short: "Zakupy",
    description: "Sklep, płatność, uprzejme wykręcenie się od sprzedawcy.",
  },
  smalltalk: {
    name: "Small talk i uczucia",
    short: "Small talk",
    description: "Krótkie reakcje, które podtrzymują rozmowę.",
  },
  connectors: {
    name: "Łączniki i budowa zdań",
    short: "Łączniki",
    description: "Klej, który zamienia pojedyncze zwroty w zdania.",
  },
  health: {
    name: "Zdrowie i sytuacje awaryjne",
    short: "Zdrowie",
    description: "Rzadko potrzebne, ale wtedy potrzebne natychmiast.",
  },
};

/** Categories in the order they should be presented — easiest first. */
export const CATEGORIES: readonly Category[] = CATEGORY_IDS.map((id) => ({
  id,
  ...LABELS[id],
}));

export function getCategory(id: CategoryId): Category {
  return { id, ...LABELS[id] };
}
