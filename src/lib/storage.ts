export type Theme = "light" | "original" | "dark";

export type LearningStreak = {
  currentStreak: number;
  bestStreak: number;
  lastVisitDate: string;
  activeDates: string[];
};

const PROGRESS_KEY = "backend-engineering:progress:v1";
const THEME_KEY = "backend-engineering:preferences:v1";
const NOTES_PREFIX = "backend-engineering:notes:v1:";
const STREAK_KEY = "backend-engineering:streak:v1";
const LEGACY_PROGRESS_KEY = "bfp:progress:v1";
const LEGACY_THEME_KEY = "bfp:preferences:v1";
const LEGACY_NOTES_PREFIX = "bfp:notes:v1:";

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

export function toLocalDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function calendarDayNumber(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return Number.NaN;
  return Math.floor(Date.UTC(year, month - 1, day) / 86_400_000);
}

export function readLearningStreak(): LearningStreak {
  const empty = { currentStreak: 0, bestStreak: 0, lastVisitDate: "", activeDates: [] };
  if (!canUseStorage()) return empty;

  try {
    const parsed = JSON.parse(window.localStorage.getItem(STREAK_KEY) ?? "null") as Partial<LearningStreak> | null;
    if (!parsed || typeof parsed !== "object") return empty;
    return {
      currentStreak: Number.isInteger(parsed.currentStreak) && (parsed.currentStreak ?? -1) >= 0 ? parsed.currentStreak! : 0,
      bestStreak: Number.isInteger(parsed.bestStreak) && (parsed.bestStreak ?? -1) >= 0 ? parsed.bestStreak! : 0,
      lastVisitDate: typeof parsed.lastVisitDate === "string" ? parsed.lastVisitDate : "",
      activeDates: Array.isArray(parsed.activeDates) ? parsed.activeDates.filter((value): value is string => typeof value === "string") : [],
    };
  } catch {
    return empty;
  }
}

export function recordLearningVisit(now = new Date()): LearningStreak {
  const today = toLocalDateKey(now);
  const current = readLearningStreak();
  if (current.lastVisitDate === today) return current;

  const daysSinceLastVisit = calendarDayNumber(today) - calendarDayNumber(current.lastVisitDate);
  const currentStreak = daysSinceLastVisit === 1 ? current.currentStreak + 1 : 1;
  const activeDates = [...new Set([...current.activeDates, today])]
    .filter((date) => {
      const age = calendarDayNumber(today) - calendarDayNumber(date);
      return Number.isFinite(age) && age >= 0 && age < 14;
    })
    .sort();
  const next = {
    currentStreak,
    bestStreak: Math.max(current.bestStreak, currentStreak),
    lastVisitDate: today,
    activeDates,
  };

  if (canUseStorage()) {
    try {
      window.localStorage.setItem(STREAK_KEY, JSON.stringify({ schemaVersion: 1, ...next }));
    } catch {
      return next;
    }
  }
  return next;
}

export function readProgress(knownSlugs: Set<string>) {
  if (!canUseStorage()) return new Set<string>();

  try {
    const parsed = JSON.parse(window.localStorage.getItem(PROGRESS_KEY) ?? window.localStorage.getItem(LEGACY_PROGRESS_KEY) ?? "null") as unknown;
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
    const parsed = JSON.parse(window.localStorage.getItem(THEME_KEY) ?? window.localStorage.getItem(LEGACY_THEME_KEY) ?? "null") as { theme?: unknown } | null;
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
    const parsed = JSON.parse(window.localStorage.getItem(`${NOTES_PREFIX}${scope}`) ?? window.localStorage.getItem(`${LEGACY_NOTES_PREFIX}${scope}`) ?? "null") as { markdown?: unknown } | null;
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
