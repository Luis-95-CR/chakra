import {
  FaBacon,
  FaDrumstickBite,
  FaFish,
  FaFire,
  FaHotdog,
  FaBurger,
  FaUtensils,
  FaMortarPestle,
} from "react-icons/fa6";
import type { IconType } from "react-icons";

// Maps category names (matched by keyword) to an icon. Matching is
// accent-/case-insensitive and order-sensitive: the first rule whose keyword is
// contained in the category name wins, so put the most specific rules first.
const RULES: { keywords: string[]; icon: IconType }[] = [
  { keywords: ["parrilla", "asado", "bbq", "grill"], icon: FaFire },
  { keywords: ["pate", "terrina"], icon: FaMortarPestle },
  { keywords: ["preparado", "marinado", "listo", "guiso"], icon: FaMortarPestle },
  { keywords: ["embutido", "fiambre", "mortadela", "salami"], icon: FaHotdog },
  { keywords: ["chorizo", "salchicha", "longaniza"], icon: FaHotdog },
  { keywords: ["tocineta", "tocino", "bacon", "panceta"], icon: FaBacon },
  { keywords: ["pollo", "ave", "gallina", "pavo"], icon: FaDrumstickBite },
  { keywords: ["cerdo", "chancho", "porcino", "lechon", "jamon"], icon: FaBacon },
  { keywords: ["pescado", "marisco", "atun"], icon: FaFish },
  {
    keywords: ["res", "ternera", "vacuno", "carne", "bistec", "lomo", "posta"],
    icon: FaBurger,
  },
];

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

/** Returns the best icon for a category name, or a sensible default. */
export function categoryIcon(category: string): IconType {
  const n = normalize(category);
  for (const rule of RULES) {
    if (rule.keywords.some((k) => n.includes(k))) return rule.icon;
  }
  return FaUtensils;
}
