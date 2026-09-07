import { tracingSections } from "./lessons/tracing-a-slow-request.ts";
import { jobsSections } from "./lessons/reliable-background-jobs.ts";
import { paymentSections } from "./lessons/idempotent-payment-endpoint.ts";
import { chapters as catalog } from "./catalog.ts";
import type { Chapter, LessonSection } from "./types";
export type { Chapter, LessonSection, LessonVisual } from "./types";
import { httpSections } from "./lessons/http-as-a-state-machine.ts";
import { routingSections } from "./lessons/routing-and-request-dispatch.ts";
import { serializationSections } from "./lessons/representation-and-serialization.ts";
import { identitySections } from "./lessons/identity-authentication-authorization.ts";
import { validationSections } from "./lessons/validation-at-trust-boundaries.ts";
import { layeredRequestSections } from "./lessons/layered-request-handling.ts";

import { networkingSections } from "./lessons/networking-and-packet-routing.ts";

const sections: Record<string, LessonSection[]> = {
  "tracing-a-slow-request": tracingSections,
  "reliable-background-jobs": jobsSections,
  "idempotent-payment-endpoint": paymentSections,
  "networking-and-packet-routing": networkingSections,
  "http-as-a-state-machine": httpSections,
  "routing-and-request-dispatch": routingSections,
  "representation-and-serialization": serializationSections,
  "identity-authentication-authorization": identitySections,
  "validation-at-trust-boundaries": validationSections,
  "layered-request-handling": layeredRequestSections,
};
export const chapters: Chapter[] = catalog.map((chapter) => ({ ...chapter, sections: sections[chapter.slug] }));

export const publishedChapters = chapters.filter((chapter) => chapter.status === "published");
export const launchChapters = chapters.filter((chapter) => chapter.status === "published");
export const roadmapChapters = chapters.filter((chapter) => chapter.status === "roadmap");

export function chapterHref(chapter: Chapter) {
  if (chapter.status === "published") return `/chapters/${chapter.slug}/`;
  if (chapter.status === "coming-next") return `/#${chapter.slug}`;
  return `/roadmap/#${chapter.slug}`;
}

export function chapterBySlug(slug: string) {
  return publishedChapters.find((chapter) => chapter.slug === slug);
}
