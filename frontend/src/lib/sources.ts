// Readable names for the source ids the scrapers send (e.g. "thehimalayantimes")
const SOURCE_NAMES: Record<string, string> = {
  ekantipur: "Ekantipur",
  kathmandupost: "The Kathmandu Post",
  onlinekhabar: "Onlinekhabar",
  thehimalayantimes: "The Himalayan Times",
};

export const sourceName = (source: string) => SOURCE_NAMES[source] ?? source;

// Another source's article about the same story (the API's "coverage" field)
export interface StoryCoverage {
  id: string;
  title: string;
  source: string;
  url: string;
}

/** Distinct readable source names, e.g. for "Also covered by ..." */
export const coverageSources = (coverage: StoryCoverage[] = []) =>
  [...new Set(coverage.map((c) => sourceName(c.source)))];
