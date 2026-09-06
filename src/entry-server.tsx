import { renderToString } from "react-dom/server";
import { Prototype } from "./Prototype";
import { chapterBySlug } from "./content/chapters";

export function renderRoute(path: string) {
  const slug = path.startsWith("/chapters/") ? path.split("/").filter(Boolean).at(-1) : undefined;
  return renderToString(<Prototype initialPath={path} initialChapter={slug ? chapterBySlug(slug) : undefined} />);
}
