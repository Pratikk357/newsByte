// Main categories in tab order. The backend maps every site's own section names
// onto these (backend/src/api/categories/main-categories.ts); keep the two in sync.
export const CATEGORIES = [
  { id: "all", label: "All" },
  { id: "national", label: "National" },
  { id: "politics", label: "Politics" },
  { id: "business", label: "Business" },
  { id: "world", label: "World" },
  { id: "regional", label: "Regional" },
  { id: "sports", label: "Sports" },
  { id: "entertainment", label: "Entertainment" },
  { id: "technology", label: "Technology" },
  { id: "health", label: "Health" },
  { id: "opinion", label: "Opinion" },
];

const LABELS = Object.fromEntries(CATEGORIES.map((c) => [c.id, c.label]));

/** Readable name for a category id, e.g. "world" -> "World" */
export const categoryLabel = (id?: string) => (id ? LABELS[id] ?? id : undefined);
