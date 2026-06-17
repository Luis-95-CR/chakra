import {
  Beef,
  Ham,
  Drumstick,
  Flame,
  Croissant,
  CookingPot,
  HandPlatter,
  Fish,
  Utensils,
  type LucideIcon,
} from "lucide-react";

// Maps category names (matched by keyword) to an icon. Matching is
// accent-/case-insensitive and order-sensitive: the first rule whose keyword is
// contained in the category name wins, so put the most specific rules first.
const RULES: { keywords: string[]; icon: LucideIcon }[] = [
  { keywords: ["parrilla", "asado", "bbq", "grill"], icon: Flame },
  { keywords: ["pate", "terrina"], icon: Utensils },
  { keywords: ["preparado", "marinado", "listo", "guiso"], icon: CookingPot },
  { keywords: ["embutido", "fiambre", "mortadela", "salami"], icon: Utensils },
  { keywords: ["chorizo", "salchicha", "longaniza"], icon: Ham },
  { keywords: ["tocineta", "tocino", "bacon", "panceta"], icon: Ham },
  { keywords: ["pollo", "ave", "gallina", "pavo"], icon: Drumstick },
  { keywords: ["cerdo", "chancho", "porcino", "lechon", "jamon"], icon: Ham },
  { keywords: ["pescado", "marisco", "atun"], icon: Fish },
  {
    keywords: ["res", "ternera", "vacuno", "carne", "bistec", "lomo", "posta"],
    icon: Beef,
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
export function categoryIcon(category: string): LucideIcon {
  const n = normalize(category);
  for (const rule of RULES) {
    if (rule.keywords.some((k) => n.includes(k))) return rule.icon;
  }
  return Utensils;
}
