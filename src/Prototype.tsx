import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/600-italic.css";
import "@fontsource/jetbrains-mono/500.css";
import "@fontsource/spline-sans/400.css";
import "@fontsource/spline-sans/500.css";
import "@fontsource/spline-sans/600.css";
import { useEffect, useMemo, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import {
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Check,
  ChevronRight,
  ExternalLink,
  FileText,
  Menu,
  Search,
  X,
} from "lucide-react";
import {
  chapterBySlug,
  chapterHref,
  chapters,
  publishedChapters,
  roadmapChapters,
  type Chapter,
} from "./content/chapters";
import { searchChapters } from "./lib/search";
import { readNote, readProgress, readTheme, writeNote, writeProgress, writeTheme, type Theme } from "./lib/storage";

const knownPublishedSlugs = new Set(publishedChapters.map((chapter) => chapter.slug));
const themes: Theme[] = ["light", "original", "dark"];

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
    window.scrollTo({ top: 0, behavior: "auto" });
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

function ChapterCard({
  chapter,
  complete,
  onToggle,
  navigate,
}: {
  chapter: Chapter;
  complete: boolean;
  onToggle: (slug: string) => void;
  navigate: (href: string) => void;
}) {
  const published = chapter.status === "published";
  return (
    <article className={`chapter-row ${published ? "" : "chapter-row--roadmap"}`} id={chapter.slug}>
      <button
        className={`completion-button ${complete ? "completion-button--done" : ""}`}
        type="button"
        aria-label={`Mark chapter ${chapter.number} ${complete ? "incomplete" : "complete"}`}
        aria-pressed={complete}
        disabled={!published}
        onClick={() => onToggle(chapter.slug)}
      >
        {complete ? <Check size={16} strokeWidth={2.8} aria-hidden="true" /> : null}
      </button>
      <InternalLink className="chapter-card" href={chapterHref(chapter)} navigate={navigate}>
        <span className="chapter-number">{pad(chapter.number)}</span>
        <span className="chapter-copy">
          <strong>{chapter.title}</strong>
          <span>{chapter.summary}</span>
        </span>
        <span className={`chapter-status ${published ? "chapter-status--published" : ""}`}>
          {published ? chapter.duration : "Roadmap"}
        </span>
        <ChevronRight size={18} strokeWidth={1.7} aria-hidden="true" />
      </InternalLink>
    </article>
  );
}

function CatalogPage({
  completed,
  onToggle,
  onOpenSearch,
  navigate,
}: {
  completed: Set<string>;
  onToggle: (slug: string) => void;
  onOpenSearch: () => void;
  navigate: (href: string) => void;
}) {
  return (
    <main className="catalog-shell" id="main-content">
      <section className="catalog-hero" aria-labelledby="series-title">
        <p className="kicker">A 24-topic backend reference series</p>
        <h1 id="series-title">
          Backend from <em>First Principles.</em>
        </h1>
        <p className="hero-lead">
          A TypeScript-first field guide to the systems behind backend frameworks: protocols, data boundaries, reliability,
          security, and production delivery. Six complete foundation chapters launch first; eighteen more are public on the roadmap.
        </p>
        <div className="hero-tools" aria-label="Series summary and search">
          <span className="meta-pill"><strong>24</strong> topics</span>
          <span className="meta-pill"><strong>6</strong> launch chapters</span>
          <span className="meta-pill">TypeScript</span>
          <span className="meta-pill meta-pill--progress">{completed.size} of 6 completed</span>
          <button className="search-trigger" type="button" onClick={onOpenSearch}>
            <Search size={17} aria-hidden="true" />
            <span>Search…</span>
            <kbd>Ctrl K</kbd>
          </button>
        </div>
        <div className="section-rule" aria-hidden="true" />
      </section>

      <section className="chapter-section" aria-labelledby="launch-heading">
        <div className="chapter-section-heading">
          <div>
            <p className="kicker">Launch collection</p>
            <h2 id="launch-heading">The foundations</h2>
          </div>
          <p>Complete lessons, written and tested as one connected path.</p>
        </div>
        <div className="chapter-list">
          {publishedChapters.map((chapter) => (
            <ChapterCard key={chapter.slug} chapter={chapter} complete={completed.has(chapter.slug)} onToggle={onToggle} navigate={navigate} />
          ))}
        </div>
      </section>

      <section className="chapter-section roadmap-preview" aria-labelledby="roadmap-heading">
        <div className="chapter-section-heading">
          <div>
            <p className="kicker">Public roadmap</p>
            <h2 id="roadmap-heading">What comes next</h2>
          </div>
          <p>Every planned field manual is visible. Nothing unfinished is presented as published.</p>
        </div>
        <div className="chapter-list">
          {roadmapChapters.slice(0, 6).map((chapter) => (
            <ChapterCard key={chapter.slug} chapter={chapter} complete={false} onToggle={onToggle} navigate={navigate} />
          ))}
        </div>
        <InternalLink className="roadmap-link" href="/roadmap/" navigate={navigate}>
          View all 18 roadmap topics <ArrowRight size={17} aria-hidden="true" />
        </InternalLink>
      </section>

      <section className="author-card" aria-labelledby="author-heading">
        <p className="kicker">Built in public</p>
        <h2 id="author-heading">A field guide by Rakibul Islam</h2>
        <p>
          Written from production experience across cloud systems, APIs, AI platforms, and blockchain infrastructure. Technical claims are grounded in primary standards and official documentation.
        </p>
        <div className="author-actions">
          <a className="primary-action" href="https://therakibul.me" target="_blank" rel="noreferrer">
            Visit portfolio <ExternalLink size={16} aria-hidden="true" />
          </a>
          <a className="secondary-action" href="https://github.com/irakibul7" target="_blank" rel="noreferrer">
            GitHub <ExternalLink size={15} aria-hidden="true" />
          </a>
        </div>
      </section>

      <footer className="editorial-footer">
        <p className="footer-quote">“Understand the boundary, and the framework becomes a choice.”</p>
        <p>Backend from First Principles · TypeScript field manual series.</p>
        <p>Written and maintained by <a href="https://therakibul.me">Rakibul Islam</a>.</p>
      </footer>
    </main>
  );
}

function RoadmapPage({ navigate }: { navigate: (href: string) => void }) {
  return (
    <main className="catalog-shell inner-page" id="main-content">
      <InternalLink className="back-link" href="/" navigate={navigate}><ArrowLeft size={16} /> Back to the series</InternalLink>
      <section className="catalog-hero compact-hero">
        <p className="kicker">Public roadmap · chapters 07–24</p>
        <h1>Built deliberately, <em>not all at once.</em></h1>
        <p className="hero-lead">The next eighteen field manuals will ship as complete, reviewed chapters. Their order follows the dependency path from API contracts and durable data to distributed systems and real-time delivery.</p>
        <div className="section-rule" aria-hidden="true" />
      </section>
      <section className="chapter-section" aria-label="Roadmap chapters">
        <div className="chapter-list">
          {roadmapChapters.map((chapter) => (
            <ChapterCard key={chapter.slug} chapter={chapter} complete={false} onToggle={() => undefined} navigate={navigate} />
          ))}
        </div>
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

  return (
    <figure className="code-block">
      <figcaption><span>{filename}</span><button type="button" onClick={copy}>{copied ? "Copied" : "Copy"}</button></figcaption>
      <pre><code>{source}</code></pre>
    </figure>
  );
}

function LessonPage({ chapter, navigate }: { chapter: Chapter; navigate: (href: string) => void }) {
  const [contentsOpen, setContentsOpen] = useState(false);
  const previous = chapters.find((item) => item.number === chapter.number - 1);
  const next = chapters.find((item) => item.number === chapter.number + 1);
  const lessonTitleLead = chapter.title.replace(/\s+as a state machine$/i, "");

  if (!chapter.sections?.length) {
    return (
      <main className="catalog-shell inner-page" id="main-content">
        <InternalLink className="back-link" href="/" navigate={navigate}><ArrowLeft size={16} /> Back to the series</InternalLink>
        <section className="catalog-hero compact-hero">
          <p className="kicker">Launch collection · chapter {pad(chapter.number)}</p>
          <h1>{chapter.title}</h1>
          <p className="hero-lead">{chapter.promise}</p>
          <div className="section-rule" aria-hidden="true" />
          <p className="lesson-status-note">This chapter is in the approved launch collection. Its complete editorial and technical review is scheduled after the catalog slice.</p>
        </section>
      </main>
    );
  }

  return (
    <div className="lesson-layout">
      <button className="mobile-contents-button" type="button" onClick={() => setContentsOpen(true)} aria-expanded={contentsOpen}>
        <Menu size={17} /> Contents
      </button>
      {contentsOpen ? <button className="drawer-backdrop" type="button" aria-label="Close contents" onClick={() => setContentsOpen(false)} /> : null}
      <aside className={`lesson-toc ${contentsOpen ? "lesson-toc--open" : ""}`} aria-label="Chapter contents">
        <div className="toc-brand"><strong>Backend /</strong><em>first principles</em><span>Chapter {pad(chapter.number)} · Field manual</span></div>
        <nav>
          {chapter.sections.map((section) => (
            <a key={section.id} href={`#${section.id}`} onClick={() => setContentsOpen(false)}>
              <span>{section.number}</span>{section.title}
            </a>
          ))}
        </nav>
      </aside>
      <main className="lesson-main" id="main-content">
        <section className="lesson-hero">
          <p className="kicker">A detailed TypeScript backend reference</p>
          <h1>{lessonTitleLead} <em>as a state machine.</em></h1>
          <p>{chapter.promise} This chapter connects protocol behavior to the decisions a production TypeScript service must make.</p>
          <div className="lesson-meta"><span>Application layer</span><span>TypeScript 5+</span><span>{chapter.sections.length} sections</span><span>{chapter.duration}</span></div>
          <div className="section-rule" aria-hidden="true" />
        </section>
        <div className="lesson-content">
          {chapter.sections.map((section) => (
            <section key={section.id} id={section.id} className="lesson-section">
              <p className="section-label">{section.number} / Foundation</p>
              <h2>{section.title}</h2>
              <p className="section-intro">{section.introduction}</p>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.callout ? <aside className="lesson-callout"><strong>{section.callout.label}</strong><p>{section.callout.body}</p></aside> : null}
              {section.code ? <CodeBlock filename={section.code.filename} source={section.code.source} /> : null}
              {section.checklist ? <ul className="lesson-checklist">{section.checklist.map((item) => <li key={item}><Check size={16} />{item}</li>)}</ul> : null}
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

function SearchDialog({ onClose, navigate }: { onClose: () => void; navigate: (href: string) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchChapters(chapters, query), [query]);

  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search chapters">
        <div className="search-field">
          <Search size={20} aria-hidden="true" />
          <input ref={inputRef} autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Escape" && onClose()} placeholder="Search chapters, topics…" aria-label="Search chapters and topics" />
          <kbd>ESC</kbd>
        </div>
        <div className="search-results" aria-live="polite">
          {!query ? <p className="search-helper">Type to search all published and roadmap topics.</p> : null}
          {query && !results.length ? <p className="search-helper">No topic matches “{query}”. Try a protocol, system, or tool name.</p> : null}
          {results.map(({ chapter }) => (
            <button key={chapter.slug} type="button" onClick={() => { navigate(chapterHref(chapter)); onClose(); }}>
              <span className="chapter-number">{pad(chapter.number)}</span>
              <span><strong>{chapter.title}</strong><small>{chapter.status === "published" ? chapter.duration : "Roadmap"}</small></span>
              <ArrowRight size={17} aria-hidden="true" />
            </button>
          ))}
        </div>
      </section>
    </div>
  );
}

function NotesPanel({ scope, onClose }: { scope: string; onClose: () => void }) {
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [markdown, setMarkdown] = useState(() => readNote(scope));
  const [saved, setSaved] = useState(true);

  useEffect(() => {
    if (saved) return;
    const timer = window.setTimeout(() => setSaved(writeNote(scope, markdown)), 350);
    return () => window.clearTimeout(timer);
  }, [markdown, saved, scope]);

  const exportNote = () => {
    const blob = new Blob([markdown], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `backend-first-principles-${scope}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="notes-layer" role="presentation">
      <button className="notes-backdrop" type="button" aria-label="Close study notes" onClick={onClose} />
      <aside className="notes-panel" role="dialog" aria-modal="true" aria-label="Study notes">
        <header><div><h2>Study Notes</h2><span className={saved ? "saved-state" : "saving-state"}>{saved ? "Saved" : "Saving"}</span></div><button type="button" onClick={onClose} aria-label="Close study notes"><X size={18} /></button></header>
        <p className="note-scope">{scope === "master" ? "All launch chapters" : scope.replaceAll("-", " ")}</p>
        <div className="note-tabs" role="tablist" aria-label="Note view">
          <button type="button" role="tab" aria-selected={mode === "edit"} onClick={() => setMode("edit")}>Edit</button>
          <button type="button" role="tab" aria-selected={mode === "preview"} onClick={() => setMode("preview")}>Preview</button>
        </div>
        {mode === "edit" ? (
          <textarea value={markdown} onChange={(event) => { setMarkdown(event.target.value); setSaved(false); }} placeholder="# Study notes\n\nWrite private Markdown notes here…" aria-label="Study notes Markdown editor" />
        ) : (
          <div className="note-preview"><ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeSanitize]}>{markdown || "_Nothing to preview yet._"}</ReactMarkdown></div>
        )}
        <footer><span>{markdown.trim() ? markdown.trim().split(/\s+/).length : 0} words</span><button type="button" onClick={exportNote} disabled={!markdown}>Export Markdown</button></footer>
      </aside>
    </div>
  );
}

export function Prototype() {
  const { path, navigate } = useRoute();
  const [completed, setCompleted] = useState(() => readProgress(knownPublishedSlugs));
  const [theme, setTheme] = useState<Theme>(() => readTheme());
  const [searchOpen, setSearchOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);

  const lessonSlug = path.startsWith("/chapters/") ? path.split("/").filter(Boolean).at(-1) : undefined;
  const lesson = lessonSlug ? chapterBySlug(lessonSlug) : undefined;
  const noteScope = lesson?.slug ?? "master";
  const noteCount = readNote(noteScope).trim() ? 1 : 0;

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    writeTheme(theme);
  }, [theme]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target;
      const editable = target instanceof Element && target.matches("input, textarea, [contenteditable='true']");
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.key === "/" && !editable) {
        event.preventDefault();
        setSearchOpen(true);
      } else if (event.altKey && event.key.toLowerCase() === "n") {
        event.preventDefault();
        setNotesOpen(true);
      } else if (event.key === "Escape") {
        setSearchOpen(false);
        setNotesOpen(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const toggleComplete = (slug: string) => {
    if (!knownPublishedSlugs.has(slug)) return;
    setCompleted((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      writeProgress(next);
      return next;
    });
  };

  const cycleTheme = () => {
    setTheme((current) => themes[(themes.indexOf(current) + 1) % themes.length]);
  };

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      {lesson ? <LessonPage chapter={lesson} navigate={navigate} /> : path.startsWith("/roadmap") ? <RoadmapPage navigate={navigate} /> : <CatalogPage completed={completed} onToggle={toggleComplete} onOpenSearch={() => setSearchOpen(true)} navigate={navigate} />}
      <nav className="study-controls" aria-label="Study controls and quick navigation">
        <button type="button" onClick={cycleTheme} aria-label="Switch color theme"><span>{theme[0].toUpperCase() + theme.slice(1)}</span></button>
        <button type="button" onClick={() => setNotesOpen(true)} aria-label="Open study notes"><FileText size={14} /><span>Notes</span><strong>{noteCount}</strong></button>
        <button type="button" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} aria-label="Scroll to top"><ArrowUp size={16} /></button>
      </nav>
      {searchOpen ? <SearchDialog onClose={() => setSearchOpen(false)} navigate={navigate} /> : null}
      {notesOpen ? <NotesPanel key={noteScope} scope={noteScope} onClose={() => setNotesOpen(false)} /> : null}
    </>
  );
}
