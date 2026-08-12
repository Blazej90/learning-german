import { CATEGORY_IDS, type Category, type CategoryId } from "@/types/content";

const LABELS: Record<CategoryId, Omit<Category, "id">> = {
  greetings: {
    name: "Powitania i pożegnania",
    description: "Pierwsze i ostatnie zdanie każdej rozmowy.",
  },
  politeness: {
    name: "Grzeczność i podstawy",
    description: "Słowa, bez których nie zbudujesz żadnego zdania.",
  },
  introductions: {
    name: "Przedstawianie się",
    description: "Kim jesteś, skąd jesteś, jak się masz.",
  },
  questions: {
    name: "Pytania podstawowe",
    description: "Ratunek, gdy nie rozumiesz albo czegoś szukasz.",
  },
  restaurant: {
    name: "Restauracja i kawiarnia",
    description: "Zamówienie, rachunek, uprzejmości przy stole.",
  },
  shopping: {
    name: "Zakupy",
    description: "Sklep, płatność, uprzejme wykręcenie się od sprzedawcy.",
  },
  smalltalk: {
    name: "Small talk i uczucia",
    description: "Krótkie reakcje, które podtrzymują rozmowę.",
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
