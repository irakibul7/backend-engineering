import { lazy, Suspense, useEffect, useState } from "react";
import { X } from "lucide-react";
import { readNote, writeNote } from "./lib/storage";

const MarkdownPreview = lazy(() => import("./MarkdownPreview"));

export default function NotesPanel({ scope, onClose }: { scope: string; onClose: () => void }) {
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
    anchor.download = `backend-engineering-${scope}.md`;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="notes-layer" role="presentation">
      <button className="notes-backdrop" type="button" aria-label="Close study notes" onClick={onClose} />
      <aside className="notes-panel" role="dialog" aria-modal="true" aria-label="Study notes">
        <header><div><h2>Study notes</h2><span className={saved ? "saved-state" : "saving-state"}>{saved ? "Saved" : "Saving"}</span></div><button type="button" onClick={onClose} aria-label="Close study notes"><X size={18} /></button></header>
        <p className="note-scope">{scope === "master" ? "All launch chapters" : scope.replaceAll("-", " ")}</p>
        <div className="note-tabs" role="tablist" aria-label="Note view"><button type="button" role="tab" aria-selected={mode === "edit"} onClick={() => setMode("edit")}>Edit</button><button type="button" role="tab" aria-selected={mode === "preview"} onClick={() => setMode("preview")}>Preview</button></div>
        {mode === "edit" ? <textarea value={markdown} onChange={(event) => { setMarkdown(event.target.value); setSaved(false); }} placeholder="# Study notes\n\nWrite private Markdown notes here…" aria-label="Study notes Markdown editor" /> : <div className="note-preview"><Suspense fallback={<p>Preparing preview…</p>}><MarkdownPreview markdown={markdown} /></Suspense></div>}
        <footer><span>{markdown.trim() ? markdown.trim().split(/\s+/).length : 0} words</span><button type="button" onClick={exportNote} disabled={!markdown}>Export Markdown</button></footer>
      </aside>
    </div>
  );
}
