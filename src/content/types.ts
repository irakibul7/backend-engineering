export type ChapterStatus = "published" | "coming-next" | "roadmap";

type VisualBase = {
  label: string;
  alternative: string;
};

type FlowVisual = VisualBase & {
  kind: "flow";
  stages: { title: string; detail: string }[];
};

type DecisionVisual = VisualBase & {
  kind: "decision";
  question: string;
  outcomes: { condition: string; result: string; detail: string }[];
};

type LadderVisual = VisualBase & {
  kind: "ladder";
  request: string;
  entries: { rank: string; pattern: string; result: string; selected?: boolean }[];
};

type TimelineVisual = VisualBase & {
  kind: "timeline";
  phases: { marker: string; title: string; detail: string }[];
};

export type LessonVisual = FlowVisual | DecisionVisual | LadderVisual | TimelineVisual;

export type LessonSection = {
  id: string;
  number: string;
  label?: string;
  title: string;
  introduction: string;
  paragraphs: string[];
  interactive?: "networking";
  callout?: { label: string; body: string };
  code?: { filename: string; source: string };
  codeFirst?: boolean;
  visuals?: LessonVisual[];
  table?: { caption: string; columns: string[]; rows: string[][] };
  checklist?: string[];
  questions?: string[];
  links?: { title: string; url: string }[];
  references?: { title: string; url: string }[];
};

export type Chapter = {
  number: number;
  slug: string;
  title: string;
  duration: string;
  status: ChapterStatus;
  summary: string;
  promise: string;
  tags: string[];
  sections?: LessonSection[];
  sectionIndex?: Pick<LessonSection, "id" | "title">[];
};
