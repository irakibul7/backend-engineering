import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/spline-sans/400.css";
import "@fontsource/spline-sans/500.css";
import "@fontsource/spline-sans/600.css";
import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpen,
  Check,
  ChevronDown,
  ChevronRight,
  Clock3,
  Code2,
  FileText,
  Flame,
  LockKeyhole,
  Menu,
  Monitor,
  Moon,
  Search,
  Sun,
} from "lucide-react";
import {
  chapterBySlug,
  chapterHref,
  launchChapters,
  publishedChapters,
  roadmapChapters,
  type Chapter,
  type LessonSection,
  type LessonVisual,
} from "./content/chapters";
import { readReadingProgress, readTheme, recordLearningVisit, toLocalDateKey, writeProgress, writeReadingProgress, writeTheme, type LearningStreak, type ReadingProgress, type Theme } from "./lib/storage";
import { applyDocumentMetadata } from "./lib/seo";

const knownPublishedSlugs = new Set(publishedChapters.map((chapter) => chapter.slug));
const publishedSectionsBySlug = new Map(publishedChapters.map((chapter) => [chapter.slug, new Set(chapter.sections?.map((section) => section.id) ?? [])]));
const emptySectionIds = new Set<string>();
const themes: Theme[] = ["light", "original", "dark"];
const SearchDialog = lazy(() => import("./SearchDialog"));
const NotesPanel = lazy(() => import("./NotesPanel"));

const chapterLabels: Record<number, { difficulty: "Fundamental" | "Important" }> = {
  1: { difficulty: "Fundamental" },
  2: { difficulty: "Fundamental" },
  3: { difficulty: "Fundamental" },
  4: { difficulty: "Important" },
  5: { difficulty: "Important" },
  6: { difficulty: "Important" },
};

function pad(number: number) {
  return String(number).padStart(2, "0");
}

function useRoute() {
  const [path, setPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const update = () => setPath(window.location.pathname);
    window.addEventListener("popstate", update);
    return () => window.removeEventListener("popstate", update);
  }, []);

  const navigate = (href: string) => {
    const url = new URL(href, window.location.origin);
    window.history.pushState({}, "", `${url.pathname}${url.hash}`);
    setPath(url.pathname);
    if (url.hash) {
      window.requestAnimationFrame(() => document.getElementById(url.hash.slice(1))?.scrollIntoView());
    } else {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  };

  return { path, navigate };
}

type InternalLinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string;
  navigate: (href: string) => void;
};

function InternalLink({ href, navigate, onClick, ...props }: InternalLinkProps) {
  return (
    <a
      href={href}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        event.preventDefault();
        navigate(href);
      }}
      {...props}
    />
  );
}

function AppHeader({
  path,
  theme,
  navigate,
  onOpenSearch,
  onOpenNotes,
  onCycleTheme,
}: {
  path: string;
  theme: Theme;
  navigate: (href: string) => void;
  onOpenSearch: () => void;
  onOpenNotes: () => void;
  onCycleTheme: () => void;
}) {
  const ThemeIcon = theme === "dark" ? Moon : theme === "original" ? Monitor : Sun;

  return (
    <header className="app-header">
      <InternalLink className="brand-mark" href="/" navigate={navigate} aria-label="Backend Engineering home">
        <img src="/icon-192.png?v=2" width="44" height="44" alt="" aria-hidden="true" />
      </InternalLink>
      <nav className="primary-nav" aria-label="Primary navigation">
        <InternalLink className={path === "/" ? "is-active" : ""} href="/" navigate={navigate}>Library</InternalLink>
        <InternalLink className={path.startsWith("/roadmap") ? "is-active" : ""} href="/roadmap/" navigate={navigate}>Roadmap</InternalLink>
        <button type="button" onClick={onOpenNotes} aria-label="Open study notes">Notes</button>
      </nav>
      <button className="header-search" type="button" onClick={onOpenSearch} aria-label="Search topics, chapters, and notes">
        <Search size={18} aria-hidden="true" />
        <span>Search topics, chapters, notes…</span>
        <kbd>⌘ K</kbd>
      </button>
      <div className="header-actions">
        <button className="mobile-note-action" type="button" onClick={onOpenNotes} aria-label="Open study notes from mobile header"><FileText size={18} /></button>
        <button type="button" onClick={onCycleTheme} aria-label="Switch color theme" title={`Theme: ${theme}`}><ThemeIcon size={18} /></button>
        <a className="profile-link" href="https://therakibul.me" target="_blank" rel="noreferrer" aria-label="Visit Rakibul Islam's portfolio">RI</a>
      </div>
    </header>
  );
}

function ProgressSegments({ progress }: { progress: number }) {
  return <span className="progress-segments" aria-hidden="true">{[0, 1, 2, 3].map((segment) => <i className={progress > segment * 25 ? "is-filled" : ""} key={segment} />)}</span>;
}

function SyllabusRow({
  chapter,
  progress,
  onToggle,
  navigate,
}: {
  chapter: Chapter;
  progress: number;
  onToggle: (slug: string) => void;
  navigate: (href: string) => void;
}) {
  const labels = chapterLabels[chapter.number];
  const available = chapter.status === "published";
  const complete = progress === 100;
  const copy = <><strong>{chapter.title}</strong><span>{chapter.summary}</span></>;

  return (
    <article id={chapter.slug} className={`syllabus-row ${chapter.number === 1 ? "is-current" : ""} ${available ? "" : "is-coming-next"}`}>
      <span className="syllabus-number">{pad(chapter.number)}</span>
      {available
        ? <InternalLink className="syllabus-copy" href={chapterHref(chapter)} navigate={navigate}>{copy}</InternalLink>
        : <div className="syllabus-copy">{copy}</div>}
      <span className="syllabus-difficulty">{labels?.difficulty ?? "Important"}</span>
      <span className="syllabus-duration">{chapter.duration}</span>
      {available ? (
        <button
          className="row-progress"
          type="button"
          onClick={() => onToggle(chapter.slug)}
          aria-label={complete ? `Reset chapter ${chapter.number} reading progress` : `Mark chapter ${chapter.number} complete`}
          aria-pressed={complete}
        >
          <ProgressSegments progress={progress} />
          <span>{progress}%</span>
        </button>
      ) : <span className="syllabus-availability">Coming next</span>}
      {available
        ? <InternalLink className="row-arrow" href={chapterHref(chapter)} navigate={navigate} aria-label={`Open ${chapter.title}`}><ChevronRight size={18} /></InternalLink>
        : <span className="row-arrow row-arrow--muted" aria-hidden="true" />}
    </article>
  );
}

function FeatureLine({ icon: Icon, title, body, action }: { icon: typeof Code2; title: string; body: string; action?: () => void }) {
  const content = <><span className="feature-icon"><Icon size={17} aria-hidden="true" /></span><span><strong>{title}</strong><small>{body}</small></span></>;
  return action ? <button className="feature-line" type="button" onClick={action}>{content}</button> : <div className="feature-line">{content}</div>;
}

function LearningStreakPanel({ streak }: { streak: LearningStreak }) {
  const today = new Date();
  const mondayOffset = (today.getDay() + 6) % 7;
  const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate() - mondayOffset);
  const activeDates = new Set(streak.activeDates);
  const dayNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
  const week = Array.from({ length: 7 }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    const active = activeDates.has(toLocalDateKey(date));
    const future = date > today;
    const status = active ? "completed" : future ? "upcoming" : "not completed";
    return {
      label: dayNames[index][0],
      fullLabel: `${dayNames[index]}, ${date.toLocaleDateString(undefined, { month: "long", day: "numeric" })}: ${status}`,
      active,
      future,
    };
  });

  return (
    <section className="streak-panel" aria-labelledby="streak-heading">
      <Flame size={27} aria-hidden="true" />
      <div className="streak-copy">
        <span id="streak-heading">Learning streak</span>
        <strong>{streak.currentStreak} <small>{streak.currentStreak === 1 ? "day" : "days"}</small></strong>
        <small>Best: {streak.bestStreak}</small>
      </div>
      <div className="streak-week" role="list" aria-label={`${streak.currentStreak}-day current learning streak`}>
        {week.map((day, index) => (
          <span key={`${day.label}-${index}`} role="listitem" aria-label={day.fullLabel} title={day.fullLabel}>
            <b aria-hidden="true">{day.label}</b>
            <i aria-hidden="true" className={day.active ? "is-active" : day.future ? "is-future" : ""} />
          </span>
        ))}
      </div>
    </section>
  );
}

function CatalogPage({
  readingProgress,
  streak,
  onToggle,
  onOpenNotes,
  navigate,
}: {
  readingProgress: ReadingProgress;
  streak: LearningStreak;
  onToggle: (slug: string) => void;
  onOpenNotes: () => void;
  navigate: (href: string) => void;
}) {
  const publishedCount = publishedChapters.length;
  const comingNextCount = launchChapters.filter((chapter) => chapter.status === "coming-next").length;
  const totalSections = publishedChapters.reduce((total, chapter) => total + (chapter.sections?.length ?? 0), 0);
  const readSections = publishedChapters.reduce((total, chapter) => total + (readingProgress.get(chapter.slug)?.size ?? 0), 0);
  const progress = totalSections === 0 ? 0 : Math.round((readSections / totalSections) * 100);
  const completed = new Set(publishedChapters.filter((chapter) => (chapter.sections?.length ?? 0) > 0 && readingProgress.get(chapter.slug)?.size === chapter.sections?.length).map((chapter) => chapter.slug));

  return (
    <main className="catalog-layout" id="main-content">
      <aside className="catalog-intro">
        <p className="eyebrow">Engineer’s field notebook</p>
        <h1>Backend <br />Engineering</h1>
        <p className="intro-copy">Understand the systems behind reliable backend software—protocols, boundaries, data, security, resilience, and production delivery.</p>
        <LearningStreakPanel streak={streak} />
        <section className="progress-panel" aria-labelledby="progress-heading">
          <div className="progress-heading"><span id="progress-heading">Reading progress</span><strong>{completed.size} <small>of {publishedCount}</small></strong><b>{progress}%</b></div>
          <div className="progress-track" role="progressbar" aria-label="Overall reading progress" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}><i style={{ width: `${progress}%` }} /></div>
        </section>
        <section className="continue-panel" aria-labelledby="continue-heading">
          <span>Currently reading</span>
          <h2 id="continue-heading">HTTP as a State Machine</h2>
          <small>Chapter 01</small>
          <InternalLink className="continue-action" href={chapterHref(publishedChapters[0])} navigate={navigate}><BookOpen size={17} /> Continue HTTP</InternalLink>
        </section>
        <div className="feature-list">
          <FeatureLine icon={Code2} title="Practical examples" body="Concepts connected to working systems" />
          <FeatureLine icon={LockKeyhole} title="Private study notes" body="Your notes stay local to this device" action={onOpenNotes} />
          <FeatureLine icon={Clock3} title="Focused lessons" body="Designed for deliberate reading" />
          <FeatureLine icon={BadgeCheck} title="Built for engineers" body="Written, tested, and reviewed" />
        </div>
      </aside>
      <section className="curriculum-panel" aria-labelledby="launch-heading">
        <header className="syllabus-header">
          <h2 id="launch-heading">Launch chapters</h2>
          <span>Difficulty</span><span>Est. time</span><span>Progress</span>
        </header>
        <div className="syllabus-list">
          {launchChapters.map((chapter) => {
            const total = chapter.sections?.length ?? 0;
            const chapterProgress = total === 0 ? 0 : Math.round(((readingProgress.get(chapter.slug)?.size ?? 0) / total) * 100);
            return <SyllabusRow key={chapter.slug} chapter={chapter} progress={chapterProgress} onToggle={onToggle} navigate={navigate} />;
          })}
        </div>
        <details className="roadmap-band" open>
          <summary>
            <span className="roadmap-symbol"><BookOpen size={19} /></span>
            <span><strong>Roadmap <em>(18 topics)</em></strong><small>The curriculum beyond the launch chapters—protocols, data, reliability, security, and production delivery.</small></span>
            <ChevronDown size={18} aria-hidden="true" />
          </summary>
          <div className="roadmap-band-content">
            <p>{roadmapChapters.slice(0, 8).map((chapter) => chapter.title).join(" · ")} · 10 more</p>
            <InternalLink href="/roadmap/" navigate={navigate}>View all 18 roadmap topics <ArrowRight size={15} /></InternalLink>
          </div>
        </details>
        <footer className="catalog-footnote"><span>{publishedCount} complete chapters. {comingNextCount} coming next. {roadmapChapters.length} on the roadmap.</span><span>By <a href="https://therakibul.me">Rakibul Islam</a></span></footer>
      </section>
    </main>
  );
}

function RoadmapPage() {
  return (
    <main className="roadmap-page" id="main-content">
      <header className="page-intro">
        <p className="eyebrow">Public curriculum</p>
        <h1>What comes after<br />the foundations.</h1>
        <p>Eighteen planned field guides connect API contracts and durable data to distributed systems and real-time delivery. A topic becomes a lesson only after it is complete and reviewed.</p>
      </header>
      <section className="roadmap-index" aria-label="Roadmap chapters">
        <div className="roadmap-index-head"><span>Topic</span><span>System focus</span><span>Status</span></div>
        {roadmapChapters.map((chapter) => (
          <article className="roadmap-row" id={chapter.slug} key={chapter.slug}>
            <span>{pad(chapter.number)}</span>
            <div><strong>{chapter.title}</strong><small>{chapter.promise}</small></div>
            <span>{chapter.tags.slice(0, 2).join(" · ")}</span>
            <b>Planned</b>
          </article>
        ))}
      </section>
    </main>
  );
}

function CodeBlock({ filename, source }: { filename: string; source: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(source);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      setCopied(false);
    }
  };
  return <figure className="code-block"><figcaption><span>{filename}</span><button type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button></figcaption><pre tabIndex={0}><code>{source}</code></pre></figure>;
}

function FlowVisual({ visual }: { visual: Extract<LessonVisual, { kind: "flow" }> }) {
  return (
    <ol className={`visual-flow ${visual.stages.length > 5 ? "visual-flow--extended" : ""}`} aria-label="Ordered system flow">
      {visual.stages.map((stage, index) => (
        <li key={stage.title}>
          <span className="visual-index">{String(index + 1).padStart(2, "0")}</span>
          <strong>{stage.title}</strong>
          <p>{stage.detail}</p>
          {index < visual.stages.length - 1 ? <ArrowRight size={17} aria-hidden="true" /> : null}
        </li>
      ))}
    </ol>
  );
}

function DecisionVisual({ visual }: { visual: Extract<LessonVisual, { kind: "decision" }> }) {
  return (
    <div className="visual-decision">
      <p className="decision-question"><span>Decision</span>{visual.question}</p>
      <ol>
        {visual.outcomes.map((outcome) => (
          <li key={outcome.condition}>
            <span>{outcome.condition}</span>
            <ArrowRight size={17} aria-hidden="true" />
            <div><strong>{outcome.result}</strong><p>{outcome.detail}</p></div>
          </li>
        ))}
      </ol>
    </div>
  );
}

function LadderVisual({ visual }: { visual: Extract<LessonVisual, { kind: "ladder" }> }) {
  return (
    <div className="visual-ladder">
      <p className="ladder-request"><span>Incoming request</span><code>{visual.request}</code></p>
      <ol>
        {visual.entries.map((entry) => (
          <li key={entry.pattern} className={entry.selected ? "is-selected" : undefined} aria-current={entry.selected ? "true" : undefined}>
            <span>{entry.rank}</span>
            <code>{entry.pattern}</code>
            <p>{entry.result}</p>
            <strong>{entry.selected ? "Selected" : "Candidate"}</strong>
          </li>
        ))}
      </ol>
    </div>
  );
}

function TimelineVisual({ visual }: { visual: Extract<LessonVisual, { kind: "timeline" }> }) {
  return (
    <ol className="visual-timeline" aria-label="Ordered rollout phases">
      {visual.phases.map((phase) => (
        <li key={phase.marker}>
          <span>{phase.marker}</span>
          <div><strong>{phase.title}</strong><p>{phase.detail}</p></div>
        </li>
      ))}
    </ol>
  );
}

function LessonVisualFigure({ visual }: { visual: LessonVisual }) {
  return (
    <figure className={`lesson-visual lesson-visual--${visual.kind}`} aria-label={visual.label}>
      <figcaption><span>System visual</span><strong>{visual.label}</strong></figcaption>
      {visual.kind === "flow" ? <FlowVisual visual={visual} /> : null}
      {visual.kind === "decision" ? <DecisionVisual visual={visual} /> : null}
      {visual.kind === "ladder" ? <LadderVisual visual={visual} /> : null}
      {visual.kind === "timeline" ? <TimelineVisual visual={visual} /> : null}
      <details className="visual-alternative">
        <summary>Read diagram as text</summary>
        <p>{visual.alternative}</p>
      </details>
    </figure>
  );
}

function LessonTable({ table }: { table: NonNullable<LessonSection["table"]> }) {
  return (
    <div className="lesson-table-wrap" role="region" tabIndex={0} aria-label={`${table.caption}. Scroll horizontally to inspect every column.`}>
      <table>
        <caption>{table.caption}</caption>
        <thead><tr>{table.columns.map((column) => <th key={column} scope="col">{column}</th>)}</tr></thead>
        <tbody>{table.rows.map((row) => <tr key={row.join("|")}>{row.map((cell, index) => index === 0 ? <th key={cell} scope="row">{cell}</th> : <td key={`${index}-${cell}`}>{cell}</td>)}</tr>)}</tbody>
      </table>
    </div>
  );
}

function LessonPage({
  chapter,
  readSectionIds,
  onReadSections,
  navigate,
}: {
  chapter: Chapter;
  readSectionIds: Set<string>;
  onReadSections: (slug: string, sectionIds: string[]) => void;
  navigate: (href: string) => void;
}) {
  const [contentsOpen, setContentsOpen] = useState(false);
  const previous = publishedChapters.find((item) => item.number === chapter.number - 1);
  const next = publishedChapters.find((item) => item.number === chapter.number + 1);
  const totalSections = chapter.sections?.length ?? 0;
  const lessonProgress = totalSections === 0 ? 0 : Math.round((readSectionIds.size / totalSections) * 100);

  useEffect(() => {
    if (!chapter.sections?.length || typeof IntersectionObserver === "undefined") return;
    const sentinels = document.querySelectorAll<HTMLElement>(`[data-chapter-read="${chapter.slug}"]`);
    const observer = new IntersectionObserver((entries) => {
      const newlyRead = entries
        .filter((entry) => entry.isIntersecting)
        .map((entry) => (entry.target as HTMLElement).dataset.sectionRead)
        .filter((sectionId): sectionId is string => Boolean(sectionId));
      if (newlyRead.length) onReadSections(chapter.slug, newlyRead);
    }, { rootMargin: "0px 0px -20% 0px", threshold: 0 });
    sentinels.forEach((sentinel) => observer.observe(sentinel));
    return () => observer.disconnect();
  }, [chapter.sections, chapter.slug, onReadSections]);

  if (!chapter.sections?.length) {
    return (
      <main className="placeholder-lesson" id="main-content">
        <InternalLink className="back-link" href="/" navigate={navigate}><ArrowLeft size={16} /> Library</InternalLink>
        <p className="eyebrow">Launch chapter {pad(chapter.number)}</p>
        <h1>{chapter.title}</h1>
        <p>{chapter.promise}</p>
        <aside>This lesson is in the approved launch collection. Its full editorial and technical review follows the catalog checkpoint.</aside>
      </main>
    );
  }

  return (
    <div className="lesson-workspace">
      <button className="mobile-contents-button" type="button" onClick={() => setContentsOpen(true)} aria-expanded={contentsOpen}><Menu size={17} /> Contents</button>
      {contentsOpen ? <button className="drawer-backdrop" type="button" aria-label="Close contents" onClick={() => setContentsOpen(false)} /> : null}
      <aside className={`lesson-toc ${contentsOpen ? "lesson-toc--open" : ""}`} aria-label="Chapter contents">
        <InternalLink className="toc-back" href="/" navigate={navigate}><ArrowLeft size={15} /> Library</InternalLink>
        <div className="toc-brand"><strong>Chapter {pad(chapter.number)}</strong><span>{chapter.title}</span><small>{chapter.duration} · {chapter.sections.length} sections · {lessonProgress}% read</small></div>
        <nav>{chapter.sections.map((section) => <a key={section.id} href={`#${section.id}`} onClick={() => setContentsOpen(false)}><span>{section.number}</span>{section.title}</a>)}</nav>
      </aside>
      <main className="lesson-main" id="main-content">
        <section className="lesson-hero">
          <p className="eyebrow">Backend Engineering · Field guide {pad(chapter.number)}</p>
          <h1>{chapter.title}</h1>
          <p>{chapter.promise} This chapter connects protocol behavior to the decisions a production service must make.</p>
          <div className="lesson-meta"><span>Application layer</span><span>{chapter.sections.length} sections</span><span>{chapter.duration}</span><span aria-live="polite">{lessonProgress}% read</span></div>
        </section>
        <div className="lesson-content">
          {chapter.sections.map((section) => (
            <section key={section.id} id={section.id} className="lesson-section">
              <p className="section-label">{section.number} / {section.label ?? "Foundation"}</p>
              <h2>{section.title}</h2>
              <p className="section-intro">{section.introduction}</p>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.codeFirst && section.code ? <CodeBlock filename={section.code.filename} source={section.code.source} /> : null}
              {section.callout ? <aside className="lesson-callout"><strong>{section.callout.label}</strong><p>{section.callout.body}</p></aside> : null}
              {section.visuals?.map((visual) => <LessonVisualFigure key={visual.label} visual={visual} />)}
              {!section.codeFirst && section.code ? <CodeBlock filename={section.code.filename} source={section.code.source} /> : null}
              {section.table ? <LessonTable table={section.table} /> : null}
              {section.checklist ? <ul className="lesson-checklist">{section.checklist.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul> : null}
              {section.questions ? <div className="lesson-questions"><h3>Design questions</h3><ol>{section.questions.map((question) => <li key={question}>{question}</li>)}</ol></div> : null}
              {section.references ? (
                <div className="lesson-references">
                  <h3>Primary references</h3>
                  <ul>{section.references.map((reference) => <li key={reference.url}><a href={reference.url} target="_blank" rel="noreferrer">{reference.title}<ArrowRight size={14} aria-hidden="true" /></a></li>)}</ul>
                </div>
              ) : null}
              <span className="section-read-sentinel" data-chapter-read={chapter.slug} data-section-read={section.id} aria-hidden="true" />
            </section>
          ))}
        </div>
        <nav className="chapter-navigation" aria-label="Chapter navigation">
          {previous ? <InternalLink href={chapterHref(previous)} navigate={navigate}><ArrowLeft size={17} /><span>Previous<strong>{previous.title}</strong></span></InternalLink> : <span />}
          {next ? <InternalLink href={chapterHref(next)} navigate={navigate}><span>Next<strong>{next.title}</strong></span><ArrowRight size={17} /></InternalLink> : null}
        </nav>
      </main>
    </div>
  );
}

export function Prototype() {
  const { path, navigate } = useRoute();
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>(() => readReadingProgress(publishedSectionsBySlug));
  const [streak] = useState(() => recordLearningVisit());
  const [theme, setTheme] = useState<Theme>(() => readTheme());
  const [searchOpen, setSearchOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const lessonSlug = path.startsWith("/chapters/") ? path.split("/").filter(Boolean).at(-1) : undefined;
  const lesson = lessonSlug ? chapterBySlug(lessonSlug) : undefined;
  const noteScope = lesson?.slug ?? "master";

  useEffect(() => { document.documentElement.dataset.theme = theme; writeTheme(theme); }, [theme]);
  useEffect(() => { applyDocumentMetadata(path, publishedChapters); }, [path]);
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const editable = target instanceof Element && target.matches("input, textarea, [contenteditable='true']");
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") { event.preventDefault(); setSearchOpen(true); }
      else if (event.key === "/" && !editable) { event.preventDefault(); setSearchOpen(true); }
      else if (event.altKey && event.key.toLowerCase() === "n") { event.preventDefault(); setNotesOpen(true); }
      else if (event.key === "Escape") { setSearchOpen(false); setNotesOpen(false); }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    writeReadingProgress(readingProgress);
    const completed = new Set(
      [...knownPublishedSlugs].filter((slug) => {
        const total = publishedSectionsBySlug.get(slug)?.size ?? 0;
        return total > 0 && readingProgress.get(slug)?.size === total;
      }),
    );
    writeProgress(completed);
  }, [readingProgress]);

  const markSectionsRead = useCallback((slug: string, sectionIds: string[]) => {
    const knownSections = publishedSectionsBySlug.get(slug);
    if (!knownSections) return;
    setReadingProgress((current) => {
      const currentSections = current.get(slug) ?? emptySectionIds;
      const validNewSections = sectionIds.filter((sectionId) => knownSections.has(sectionId) && !currentSections.has(sectionId));
      if (!validNewSections.length) return current;
      const next = new Map(current);
      next.set(slug, new Set([...currentSections, ...validNewSections]));
      return next;
    });
  }, []);

  const toggleComplete = useCallback((slug: string) => {
    if (!knownPublishedSlugs.has(slug)) return;
    const knownSections = publishedSectionsBySlug.get(slug);
    if (!knownSections?.size) return;
    setReadingProgress((current) => {
      const next = new Map(current);
      if (current.get(slug)?.size === knownSections.size) next.delete(slug);
      else next.set(slug, new Set(knownSections));
      return next;
    });
  }, []);
  const cycleTheme = () => setTheme((current) => themes[(themes.indexOf(current) + 1) % themes.length]);

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <AppHeader path={path} theme={theme} navigate={navigate} onOpenSearch={() => setSearchOpen(true)} onOpenNotes={() => setNotesOpen(true)} onCycleTheme={cycleTheme} />
      {lesson ? <LessonPage chapter={lesson} readSectionIds={readingProgress.get(lesson.slug) ?? emptySectionIds} onReadSections={markSectionsRead} navigate={navigate} /> : path.startsWith("/roadmap") ? <RoadmapPage /> : <CatalogPage readingProgress={readingProgress} streak={streak} onToggle={toggleComplete} onOpenNotes={() => setNotesOpen(true)} navigate={navigate} />}
      {searchOpen ? <Suspense fallback={null}><SearchDialog onClose={() => setSearchOpen(false)} navigate={navigate} /></Suspense> : null}
      {notesOpen ? <Suspense fallback={null}><NotesPanel scope={noteScope} onClose={() => setNotesOpen(false)} /></Suspense> : null}
    </>
  );
}
