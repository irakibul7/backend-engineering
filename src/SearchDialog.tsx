import { useMemo, useRef, useState } from "react";
import { ArrowRight, Search, X } from "lucide-react";
import { chapterHref, chapters } from "./content/chapters";
import { searchChapters, type SearchResult } from "./lib/search";
import { useModalFocus } from "./lib/useModalFocus";

function pad(number: number) {
  return String(number).padStart(2, "0");
}

export default function SearchDialog({ onClose, navigate, returnFocus }: { returnFocus: HTMLElement | null; onClose: () => void; navigate: (href: string) => void }) {
  const [query, setQuery] = useState("");
  const dialogRef = useModalFocus(returnFocus);
  const inputRef = useRef<HTMLInputElement>(null);
  const resultRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const results = useMemo(() => searchChapters(chapters, query), [query]);
  const openResult = ({ chapter, section }: SearchResult) => {
    navigate(`${chapterHref(chapter)}${section ? `#${section.id}` : ""}`);
    onClose();
  };

  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section ref={dialogRef} tabIndex={-1} className="search-dialog" role="dialog" aria-modal="true" aria-label="Search chapters" onKeyDown={(event) => {
        if (event.key === "Escape") { event.stopPropagation(); onClose(); }
      }}>
        <div className="search-field">
          <Search size={20} aria-hidden="true" />
          <input ref={inputRef} data-modal-initial value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => {
            if (event.key === "ArrowDown" || event.key === "ArrowUp") {
              event.preventDefault();
              resultRefs.current[event.key === "ArrowDown" ? 0 : results.length - 1]?.focus();
            } else if (event.key === "Enter" && results[0]) { event.preventDefault(); openResult(results[0]); }
          }} placeholder="Search chapters, topics…" aria-label="Search chapters and topics" />
          <button type="button" className="search-close" aria-label="Close search" onClick={onClose}><X size={18} aria-hidden="true" /></button>
        </div>
        <div className="search-results" aria-live="polite">
          {!query.trim() ? <p className="search-helper">Search published chapters, their sections, and planned topics.</p> : null}
          {query.trim() && !results.length ? <p className="search-helper">No topic matches “{query}”. Try a protocol, system, or tool name.</p> : null}
          {results.map((result, index) => {
            const { chapter, section } = result;
            return <button key={chapter.slug} ref={(element) => { resultRefs.current[index] = element; }} type="button" onClick={() => openResult(result)} onKeyDown={(event) => {
              if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
              event.preventDefault();
              const next = index + (event.key === "ArrowDown" ? 1 : -1);
              if (next < 0 || next >= results.length) inputRef.current?.focus();
              else resultRefs.current[next]?.focus();
            }}><span className="search-result-number">{pad(chapter.number)}</span><span><strong>{chapter.title}</strong><small>{chapter.status === "published" ? (section ? `Section: ${section.title}` : chapter.duration) : chapter.status === "coming-next" ? "Coming next" : "Roadmap"}</small></span><ArrowRight size={17} aria-hidden="true" /></button>;
          })}
        </div>
      </section>
    </div>
  );
}
