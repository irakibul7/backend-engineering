import type { Chapter, LessonSection } from "../content/chapters";

export type SearchResult = {
  chapter: Chapter;
  score: number;
  section?: Pick<LessonSection, "id" | "title">;
};

function normalize(value: string) {
  return value.toLocaleLowerCase().replace(/\b(?:caching|cached|caches)\b/g, "cache").replace(/[^a-z0-9]+/g, " ").trim();
}

function matchesToken(value: string, token: string) {
  return value.split(" ").some((word) => word.startsWith(token));
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
      const sectionHeadings = normalize((chapter.sectionIndex ?? chapter.sections)?.map((section) => section.title).join(" ") ?? "");
      let score = 0;

      for (const token of tokens) {
        if (title === token) score += 18;
        else if (title.startsWith(token)) score += 12;
        else if (matchesToken(title, token)) score += 8;
        if (tags.split(" ").includes(token)) score += 6;
        else if (matchesToken(tags, token)) score += 3;
        if (matchesToken(summary, token)) score += 2;
        if (matchesToken(promise, token)) score += 1;
        if (matchesToken(sectionHeadings, token)) score += 2;
      }

      const section = chapter.status === "published" ? (chapter.sectionIndex ?? chapter.sections)
        ?.map((section) => ({ section, score: tokens.filter((token) => matchesToken(normalize(section.title), token)).length }))
        .filter((match) => match.score > 0)
        .sort((left, right) => right.score - left.score)[0]?.section : undefined;
      return { chapter, score, section: section ? { id: section.id, title: section.title } : undefined };
    })
    .filter((result) => result.score > 0)
    .sort((left, right) => right.score - left.score || left.chapter.number - right.chapter.number);
}
