/**
 * Every news site names its sections differently ("national", "nepal", "news";
 * "money" vs "business"; one section per province...). Scraped tags are mapped
 * onto this fixed set of main categories when articles are saved, so the website
 * can filter all sources the same way.
 *
 * Keep in sync with frontend/src/lib/categories.ts (labels and tab order) and the
 * backfill in prisma/migrations/20260930000002_main_categories.
 */
export const MAIN_CATEGORIES = [
  "national",
  "politics",
  "business",
  "world",
  "regional",
  "sports",
  "entertainment",
  "technology",
  "health",
  "opinion",
] as const;

export type MainCategory = (typeof MAIN_CATEGORIES)[number];

// Scraped section name -> main category. Names that are already a main category
// map to themselves; anything unknown falls back to "national".
const SECTION_TO_CATEGORY: Record<string, MainCategory> = {
  nepal: "national",
  news: "national",
  education: "national",
  environment: "national",
  "photo-feature": "national",
  money: "business",
  markets: "business",
  international: "world",
  province: "regional",
  kathmandu: "regional",
  "art-culture": "entertainment",
  lifestyle: "entertainment",
  "science-and-tech": "technology",
};

/** Maps a scraped tag such as "/money/", "photo_feature" or "gandaki-pradesh" to a main category. */
export function toMainCategory(tag: string): MainCategory {
  const section = tag
    .toLowerCase()
    .replace(/^\/+|\/+$/g, "")
    .replace(/_/g, "-")
    .trim();

  if ((MAIN_CATEGORIES as readonly string[]).includes(section)) {
    return section as MainCategory;
  }
  // Ekantipur has one section per province, e.g. "gandaki-pradesh"
  if (section.endsWith("-pradesh")) return "regional";
  return SECTION_TO_CATEGORY[section] ?? "national";
}
