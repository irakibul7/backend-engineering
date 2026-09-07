import { chapterBySlug } from "./catalog";
import type { Chapter, LessonSection } from "./types";

const loaders: Record<string, () => Promise<LessonSection[]>> = {
  "tracing-a-slow-request": () => import("./lessons/tracing-a-slow-request").then((module) => module.tracingSections),
  "reliable-background-jobs": () => import("./lessons/reliable-background-jobs").then((module) => module.jobsSections),
  "idempotent-payment-endpoint": () => import("./lessons/idempotent-payment-endpoint").then((module) => module.paymentSections),
  "networking-and-packet-routing": () => import("./lessons/networking-and-packet-routing").then((module) => module.networkingSections),
  "http-as-a-state-machine": () => import("./lessons/http-as-a-state-machine").then((module) => module.httpSections),
  "routing-and-request-dispatch": () => import("./lessons/routing-and-request-dispatch").then((module) => module.routingSections),
  "representation-and-serialization": () => import("./lessons/representation-and-serialization").then((module) => module.serializationSections),
  "identity-authentication-authorization": () => import("./lessons/identity-authentication-authorization").then((module) => module.identitySections),
  "validation-at-trust-boundaries": () => import("./lessons/validation-at-trust-boundaries").then((module) => module.validationSections),
  "layered-request-handling": () => import("./lessons/layered-request-handling").then((module) => module.layeredRequestSections),
};
const loaded = new Map<string, Chapter>();
export function getLoadedLesson(slug: string) { return loaded.get(slug); }
export async function loadLesson(slug: string): Promise<Chapter | undefined> {
  if (loaded.has(slug)) return loaded.get(slug);
  const metadata = chapterBySlug(slug);
  if (!metadata || !loaders[slug]) return undefined;
  const chapter = { ...metadata, sections: await loaders[slug]() };
  loaded.set(slug, chapter);
  return chapter;
}
