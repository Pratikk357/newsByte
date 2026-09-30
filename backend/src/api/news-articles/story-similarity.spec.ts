import {
  StoryArticle,
  buildTfIdfVectors,
  cosineSimilarity,
  detectLanguage,
  findSameStoryLeads,
  isSameStory,
  tokenize,
} from "./story-similarity";

const article = (
  id: string,
  sourceId: string,
  title: string,
  content: string,
  storyId: string | null = null,
): StoryArticle => ({ id, sourceId, title, content, storyId });

const BP_HIGHWAY =
  "The BP Highway reopened on Tuesday after landslides and floods blocked the road " +
  "at Sindhuli for several days. Vehicles stranded at Khurkot and Nepalthok resumed " +
  "their journeys once the Department of Roads cleared the debris.";

const unrelated = [
  article("u1", "kp", "Parliament passes the education bill", "The House passed the school education bill with a two-thirds majority after a long debate on teacher appointments."),
  article("u2", "kp", "Nepal beat Afghanistan in cricket", "Nepal won by five wickets in the second match of the tri-series held at Mulpani cricket ground."),
  article("u3", "ht", "Central bank keeps policy rate unchanged", "Nepal Rastra Bank kept its policy rate unchanged in the quarterly review of the monetary policy."),
  article("u4", "ht", "Tourist arrivals rise in September", "More than one hundred thousand tourists visited Nepal in September, the tourism board said."),
];

describe("story-similarity", () => {
  it("detects Nepali by its Devanagari script", () => {
    expect(detectLanguage("प्रतिनिधिसभाको बैठक बस्दै")).toBe("ne");
    expect(detectLanguage("BP Highway reopens after floods")).toBe("en");
  });

  it("removes zero-width joiners so a Nepali word is not split", () => {
    expect(tokenize("झोलुङ्‍गे पुल")).toEqual(tokenize("झोलुङ्गे पुल"));
    expect(tokenize("झोलुङ्गे पुल")).toEqual(["झोलुङ्गे", "पुल"]);
  });

  it("scores identical documents 1 and documents with no shared words 0", () => {
    const vectors = buildTfIdfVectors([
      { id: "a", title: "BP Highway reopens", content: BP_HIGHWAY },
      { id: "b", title: "BP Highway reopens", content: BP_HIGHWAY },
      { id: "c", title: "Cricket", content: "Mulpani tri-series victory." },
    ]);
    expect(cosineSimilarity(vectors.get("a")!, vectors.get("b")!)).toBeCloseTo(1);
    expect(cosineSimilarity(vectors.get("a")!, vectors.get("c")!)).toBe(0);
  });

  it("needs similar titles unless the full text is nearly identical", () => {
    expect(isSameStory(0.37, 0.53)).toBe(true); // BP Highway pair
    expect(isSameStory(0.27, 0.24)).toBe(false); // two different flood stories
    expect(isSameStory(0.94, 0.1)).toBe(true);
  });

  it("groups the same story from two sources under the older article", () => {
    const articles = [
      ...unrelated,
      article("kp1", "kp", "BP Highway reopens after five-day disruption", BP_HIGHWAY),
      article("ht1", "ht", "BP Highway reopens after four-day closure", BP_HIGHWAY),
    ];
    const leads = findSameStoryLeads(articles, new Set(["kp1", "ht1"]));
    expect(leads).toEqual(new Map([["ht1", "kp1"]]));
  });

  it("does not group articles from the same source", () => {
    const articles = [
      ...unrelated,
      article("kp1", "kp", "BP Highway reopens after five-day disruption", BP_HIGHWAY),
      article("kp2", "kp", "BP Highway reopens after four-day closure", BP_HIGHWAY),
    ];
    expect(findSameStoryLeads(articles, new Set(["kp1", "kp2"])).size).toBe(0);
  });

  it("joins an existing story through its lead", () => {
    const articles = [
      ...unrelated,
      article("kp1", "kp", "BP Highway reopens after five-day disruption", BP_HIGHWAY),
      article("ht1", "ht", "BP Highway reopens after four-day closure", BP_HIGHWAY, "kp1"),
      article("rep1", "rep", "BP Highway reopens after four-day closure", BP_HIGHWAY),
    ];
    // rep1 is most similar to ht1, which already belongs to kp1's story
    expect(findSameStoryLeads(articles, new Set(["rep1"]))).toEqual(
      new Map([["rep1", "kp1"]]),
    );
  });

  it("does not match an English article with a Nepali one", () => {
    const articles = [
      ...unrelated,
      article("kp1", "kp", "House meeting today", "The House of Representatives meets today at 1pm."),
      article("ok1", "ok", "प्रतिनिधिसभा बैठक बस्दै", "प्रतिनिधिसभाको बैठक आज अपराह्न १ बजे बस्दैछ ।"),
    ];
    expect(findSameStoryLeads(articles, new Set(["kp1", "ok1"])).size).toBe(0);
  });
});
