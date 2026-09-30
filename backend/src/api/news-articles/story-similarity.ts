/**
 * Finds articles from different sources that report the same story, using
 * TF-IDF vectors and cosine similarity (the same weighting idea as the scraper's
 * summarizer, applied to whole articles instead of sentences).
 *
 * Only articles in the same language are compared: an English and a Nepali
 * article share almost no words, so TF-IDF cannot match them.
 */

export type ArticleLanguage = "en" | "ne";

export interface StoryDocument {
  id: string;
  title: string;
  content: string;
}

export interface StoryArticle extends StoryDocument {
  sourceId: string;
  /** Current lead, or null when the article is not grouped (or is a lead itself) */
  storyId: string | null;
}

/*
 * Thresholds, tuned on real scraped articles. Two articles are the same story when
 * both their full text and their titles are similar, or their full text is nearly
 * identical. Needing both signals avoids grouping different stories on one topic:
 * e.g. "12 dead in Baglung floods" vs "Floods claim 27 lives across Nepal" scored
 * 0.27 on full text but only 0.24 on titles, while "BP Highway reopens after
 * five-day disruption" vs "... four-day closure" scored 0.37 and 0.53.
 */
export const CONTENT_THRESHOLD = 0.2;
export const TITLE_THRESHOLD = 0.28;
export const STRONG_CONTENT_THRESHOLD = 0.5;

export function isSameStory(contentScore: number, titleScore: number): boolean {
  return (
    contentScore >= STRONG_CONTENT_THRESHOLD ||
    (contentScore >= CONTENT_THRESHOLD && titleScore >= TITLE_THRESHOLD)
  );
}

const DEVANAGARI = /[ऀ-ॿ]/g;
const LATIN = /[A-Za-z]/g;

/** "ne" when the text is mostly Devanagari script, otherwise "en". */
export function detectLanguage(text: string): ArticleLanguage {
  const devanagari = text.match(DEVANAGARI)?.length ?? 0;
  const latin = text.match(LATIN)?.length ?? 0;
  return devanagari > latin ? "ne" : "en";
}

/**
 * Lower-cased words; \p{M} keeps Devanagari vowel signs attached to their letters.
 * Zero-width joiners are removed first: some Nepali sites put them inside conjuncts
 * (झोलुङ्‍गे vs झोलुङ्गे), which would otherwise split one word into two.
 */
export function tokenize(text: string): string[] {
  const cleaned = text.replace(/[​-‍]/g, "").toLowerCase();
  return (cleaned.match(/[\p{L}\p{M}\p{N}]+/gu) ?? []).filter(
    (token) => token.length > 1,
  );
}

/**
 * Builds an L2-normalised TF-IDF vector for every document.
 * The title is counted twice because it names the story most directly.
 * TF is sublinear (1 + log count) so long articles do not dominate, and IDF is
 * smoothed so a word found in every document still gets a small weight.
 */
export function buildTfIdfVectors(
  documents: StoryDocument[],
): Map<string, Map<string, number>> {
  const termCounts = documents.map((doc) => {
    const counts = new Map<string, number>();
    for (const token of tokenize(`${doc.title} ${doc.title} ${doc.content}`)) {
      counts.set(token, (counts.get(token) ?? 0) + 1);
    }
    return counts;
  });

  const documentFrequency = new Map<string, number>();
  for (const counts of termCounts) {
    for (const term of counts.keys()) {
      documentFrequency.set(term, (documentFrequency.get(term) ?? 0) + 1);
    }
  }

  const n = documents.length;
  const vectors = new Map<string, Map<string, number>>();
  documents.forEach((doc, i) => {
    const vector = new Map<string, number>();
    let norm = 0;
    for (const [term, count] of termCounts[i]) {
      const idf = Math.log((n + 1) / (documentFrequency.get(term)! + 1)) + 1;
      const weight = (1 + Math.log(count)) * idf;
      vector.set(term, weight);
      norm += weight * weight;
    }
    norm = Math.sqrt(norm) || 1;
    for (const [term, weight] of vector) vector.set(term, weight / norm);
    vectors.set(doc.id, vector);
  });
  return vectors;
}

/** Cosine similarity of two L2-normalised vectors (their dot product). */
export function cosineSimilarity(
  a: Map<string, number>,
  b: Map<string, number>,
): number {
  const [small, large] = a.size < b.size ? [a, b] : [b, a];
  let dot = 0;
  for (const [term, weight] of small) {
    const other = large.get(term);
    if (other !== undefined) dot += weight * other;
  }
  return dot;
}

/**
 * Assigns each pending article to the story of the most similar earlier article
 * from a different source in the same language.
 *
 * `articles` must be sorted oldest first. Only earlier articles are considered, so
 * a story's lead is always its oldest article and groups can never form a cycle.
 * Articles that already have a storyId are never pending but can be matched: the
 * new article then joins their lead's story.
 *
 * @returns pending article id -> lead id, only for the articles that matched
 */
export function findSameStoryLeads(
  articles: StoryArticle[],
  pendingIds: Set<string>,
): Map<string, string> {
  const assignments = new Map<string, string>();

  for (const language of ["en", "ne"] as ArticleLanguage[]) {
    const docs = articles.filter(
      (a) => detectLanguage(`${a.title} ${a.content}`) === language,
    );
    // IDF is computed per language over the recent articles being compared
    const contentVectors = buildTfIdfVectors(docs);
    const titleVectors = buildTfIdfVectors(
      docs.map((d) => ({ id: d.id, title: d.title, content: "" })),
    );

    docs.forEach((article, i) => {
      if (!pendingIds.has(article.id)) return;

      let best: { lead: string; score: number } | null = null;
      for (const earlier of docs.slice(0, i)) {
        if (earlier.sourceId === article.sourceId) continue;
        const contentScore = cosineSimilarity(
          contentVectors.get(article.id)!,
          contentVectors.get(earlier.id)!,
        );
        const titleScore = cosineSimilarity(
          titleVectors.get(article.id)!,
          titleVectors.get(earlier.id)!,
        );
        if (!isSameStory(contentScore, titleScore)) continue;
        if (!best || contentScore > best.score) {
          // Join the earlier article's story, which may have been set in this pass
          const lead = assignments.get(earlier.id) ?? earlier.storyId ?? earlier.id;
          best = { lead, score: contentScore };
        }
      }
      if (best) assignments.set(article.id, best.lead);
    });
  }
  return assignments;
}
