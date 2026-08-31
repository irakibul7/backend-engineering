import { useMemo, useRef, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { chapterHref, chapters } from "./content/chapters";
import { searchChapters } from "./lib/search";

function pad(number: number) {
  return String(number).padStart(2, "0");
}

export default function SearchDialog({ onClose, navigate }: { onClose: () => void; navigate: (href: string) => void }) {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const results = useMemo(() => searchChapters(chapters, query), [query]);

  return (
    <div className="modal-layer" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="search-dialog" role="dialog" aria-modal="true" aria-label="Search chapters">
        <div className="search-field"><Search size={20} aria-hidden="true" /><input ref={inputRef} autoFocus value={query} onChange={(event) => setQuery(event.target.value)} onKeyDown={(event) => event.key === "Escape" && onClose()} placeholder="Search chapters, topics…" aria-label="Search chapters and topics" /><kbd>ESC</kbd></div>
        <div className="search-results" aria-live="polite">
          {!query ? <p className="search-helper">Search every published chapter and planned topic.</p> : null}
          {query && !results.length ? <p className="search-helper">No topic matches “{query}”. Try a protocol, system, or tool name.</p> : null}
          {results.map(({ chapter }) => <button key={chapter.slug} type="button" onClick={() => { navigate(chapterHref(chapter)); onClose(); }}><span className="search-result-number">{pad(chapter.number)}</span><span><strong>{chapter.title}</strong><small>{chapter.status === "published" ? chapter.duration : chapter.status === "coming-next" ? "Coming next" : "Roadmap"}</small></span><ArrowRight size={17} aria-hidden="true" /></button>)}
        </div>
      </section>
    </div>
  );
}
