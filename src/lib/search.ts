import type { Chapter } from "../content/chapters";

export type SearchResult = {
  chapter: Chapter;
  score: number;
};

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

export function searchChapters(chapters: Chapter[], rawQuery: string): SearchResult[] {
  const query = normalize(rawQuery);
  if (!query) return [];

  const tokens = query.split(/\s+/);

  return chapters
    .map((chapter) => {
      const title = normalize(chapter.title);
      const summary = normalize(chapter.summary);
      const tags = normalize(chapter.tags.join(" "));
      const promise = normalize(chapter.promise);
      let score = 0;

      for (const token of tokens) {
        if (title === token) score += 18;
        else if (title.startsWith(token)) score += 12;
        else if (title.includes(token)) score += 8;
        if (tags.split(" ").includes(token)) score += 6;
        else if (tags.includes(token)) score += 3;
        if (summary.includes(token)) score += 2;
        if (promise.includes(token)) score += 1;
      }

      return { chapter, score };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.chapter.number - right.chapter.number);
}
