export type Theme = "light" | "original" | "dark";

const PROGRESS_KEY = "bfp:progress:v1";
const THEME_KEY = "bfp:preferences:v1";
const NOTES_PREFIX = "bfp:notes:v1:";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function readProgress(knownSlugs: Set<string>) {
  if (!canUseStorage()) return new Set<string>();

  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? "null") as unknown;
    if (!parsed || typeof parsed !== "object") return new Set<string>();
    const completed = (parsed as { completedChapterSlugs?: unknown }).completedChapterSlugs;
    if (!Array.isArray(completed)) return new Set<string>();
    return new Set(completed.filter((value): value is string => typeof value === "string" && knownSlugs.has(value)));
  } catch {
    return new Set<string>();
  }
}

export function writeProgress(completed: Set<string>) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(
      PROGRESS_KEY,
      JSON.stringify({ schemaVersion: 1, completedChapterSlugs: [...completed].sort(), updatedAt: new Date().toISOString() }),
    );
    return true;
  } catch {
    return false;
  }
}

export function readTheme(): Theme {
  if (!canUseStorage()) return "light";
  try {
    const parsed = JSON.parse(window.localStorage.getItem(THEME_KEY) ?? "null") as { theme?: unknown } | null;
    return parsed?.theme === "original" || parsed?.theme === "dark" || parsed?.theme === "light" ? parsed.theme : "light";
  } catch {
    return "light";
  }
}

export function writeTheme(theme: Theme) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(THEME_KEY, JSON.stringify({ schemaVersion: 1, theme }));
    return true;
  } catch {
    return false;
  }
}

export function readNote(scope: string) {
  if (!canUseStorage()) return "";
  try {
    const parsed = JSON.parse(window.localStorage.getItem(`${NOTES_PREFIX}${scope}`) ?? "null") as { markdown?: unknown } | null;
    return typeof parsed?.markdown === "string" ? parsed.markdown : "";
  } catch {
    return "";
  }
}

export function writeNote(scope: string, markdown: string) {
  if (!canUseStorage()) return false;
  try {
    window.localStorage.setItem(
      `${NOTES_PREFIX}${scope}`,
      JSON.stringify({ schemaVersion: 1, scope: scope === "master" ? "master" : "chapter", chapterSlug: scope === "master" ? undefined : scope, markdown, updatedAt: new Date().toISOString() }),
    );
    return true;
  } catch {
    return false;
  }
}
