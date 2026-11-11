import assert from "node:assert/strict";
import { test } from "node:test";
import { onboardingSchema, projectSchema } from "./validation.ts";

const ok = (v: unknown) => onboardingSchema.safeParse(v).success;

test("onboarding validation", () => {
  assert(ok({ role: "participant", displayName: "Ada", tagIds: [] }));
  assert(ok({ role: "investor", displayName: "Ada", tagIds: ["3", "5"] }));
  assert(!ok({ role: "investor", displayName: "Ada", tagIds: [] }));
  assert(!ok({ role: "admin", displayName: "Ada", tagIds: [] }));
  assert(!ok({ role: "participant", displayName: " a ", tagIds: [] }));
  assert(!ok({ role: "investor", displayName: "Ada", tagIds: ["x"] }));
});

test("project validation", () => {
  const id = "0b9f6a0e-1111-4222-8333-444455556666";
  const base = {
    title: "Smart ERP",
    summary: "An ERP for small shops.",
    description: "",
    team: "",
    tagIds: ["1"],
    imagePaths: [`${id}/${id}.png`],
    status: "published",
  };
  const ok = (v: unknown) => projectSchema.safeParse(v).success;
  assert(ok(base));
  assert(ok({ ...base, imagePaths: [], status: "draft" }));
  assert(!ok({ ...base, title: "ab" }));
  assert(!ok({ ...base, tagIds: [] }));
  assert(!ok({ ...base, tagIds: ["1", "2", "3", "4", "5", "6"] }));
  assert(!ok({ ...base, imagePaths: ["../other/secret.png"] }));
  assert(!ok({ ...base, imagePaths: ["https://evil.example/x.png"] }));
  assert(!ok({ ...base, status: "deleted" }));
});
