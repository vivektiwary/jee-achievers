// Runs against local Wrangler only; creates synthetic tests and contacts.
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
const host = "http://localhost:8788",
  admin = "local-development-only-admin-key-123456789";
async function call(path, { method = "GET", data, token, origin } = {}) {
  const r = await fetch(host + "/api" + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(origin ? { Origin: origin } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  return { status: r.status, data: await r.json() };
}
const q = {
  id: "1",
  topic: "Arithmetic",
  type: "single",
  question: "2+2?",
  options: { A: "3", B: "4", C: "5", D: "6" },
  answer: ["B"],
  solution: "Addition",
  wrong_options: {
    A: { tag: "arithmetic", why: "Too small" },
    C: { tag: "arithmetic", why: "Too large" },
    D: { tag: "concept", why: "Wrong operation" },
  },
};
const spec = {
  slug: "integration-" + Date.now(),
  title: "Synthetic integration test",
  durationMinutes: 5,
  questions: [q],
};
assert.equal((await call("/admin/responses")).status, 401);
assert.equal(
  (
    await call("/admin/tests", {
      method: "POST",
      token: admin,
      data: { ...spec, questions: [] },
    })
  ).status,
  400,
);
const draft = await call("/admin/tests", {
  method: "POST",
  token: admin,
  data: spec,
});
assert.equal(draft.status, 201);
assert.ok(!(await call("/tests")).data.some((t) => t.slug === spec.slug));
assert.equal(
  (
    await call("/admin/tests/" + draft.data.id + "/publish", {
      method: "POST",
      token: admin,
    })
  ).status,
  200,
);
const start = {
  slug: spec.slug,
  parentName: "Synthetic parent",
  parentPhone: "9999999999",
  consent: true,
  source: "integration",
};
assert.equal(
  (
    await call("/attempts", {
      method: "POST",
      data: { ...start, consent: false },
    })
  ).status,
  400,
);
assert.equal(
  (
    await call("/attempts", {
      method: "POST",
      data: start,
      origin: "https://attacker.example",
    })
  ).status,
  403,
);
const result = await call("/attempts", { method: "POST", data: start });
assert.equal(result.status, 201);
const a = result.data;
assert.equal(a.questions[0].answer, undefined);
assert.equal(a.questions[0].solution, undefined);
assert.equal(a.questions[0].wrong_options, undefined);
const path = "/attempts/" + a.id;
assert.equal((await call(path)).status, 404);
assert.equal(
  (
    await call(path, {
      method: "PUT",
      token: a.token,
      data: { answers: { 1: ["A", "B"] }, revision: 0 },
    })
  ).status,
  400,
);
const saved = await call(path, {
  method: "PUT",
  token: a.token,
  data: { answers: { 1: ["B"] }, revision: 0 },
});
assert.equal(saved.data.revision, 1);
assert.equal(
  (
    await call(path, {
      method: "PUT",
      token: a.token,
      data: { answers: { 1: ["A"] }, revision: 0 },
    })
  ).status,
  409,
);
const resumed = await call(path, { token: a.token });
assert.deepEqual(resumed.data.answers, { 1: ["B"] });
// Publish a new version; the original attempt must still use its old answer key.
const next = await call("/admin/tests", {
  method: "POST",
  token: admin,
  data: {
    ...spec,
    questions: [
      {
        ...q,
        answer: ["A"],
        wrong_options: {
          B: { tag: "concept", why: "New version" },
          C: q.wrong_options.C,
          D: q.wrong_options.D,
        },
      },
    ],
  },
});
await call("/admin/tests/" + next.data.id + "/publish", {
  method: "POST",
  token: admin,
});
const submitted = await call(path + "/submit", {
  method: "POST",
  token: a.token,
  data: { answers: { 1: ["B"] }, revision: 1 },
});
assert.equal(submitted.data.report.score, 4);
assert.equal(
  (
    await call(path + "/submit", {
      method: "POST",
      token: a.token,
      data: { answers: { 1: ["A"] }, revision: 0 },
    })
  ).data.report.score,
  4,
);
assert.equal(
  (
    await call(path, {
      method: "PUT",
      token: a.token,
      data: { answers: {}, revision: 2 },
    })
  ).status,
  409,
);
const late = (await call("/attempts", { method: "POST", data: start })).data;
await call("/attempts/" + late.id, {
  method: "PUT",
  token: late.token,
  data: { answers: { 1: ["B"] }, revision: 0 },
});
execFileSync(
  "npx",
  [
    "wrangler",
    "d1",
    "execute",
    "DB",
    "--local",
    "--command",
    `UPDATE attempts SET deadline=1 WHERE id='${late.id}'`,
  ],
  { stdio: "pipe" },
);
assert.equal(
  (
    await call("/attempts/" + late.id, {
      method: "PUT",
      token: late.token,
      data: { answers: { 1: ["A"] }, revision: 1 },
    })
  ).status,
  409,
);
const expired = await call("/attempts/" + late.id + "/submit", {
  method: "POST",
  token: late.token,
  data: { answers: { 1: ["A"] }, revision: 1 },
});
assert.equal(expired.data.report.score, -1);
assert.equal(
  (
    await call("/inquiries", {
      method: "POST",
      data: {
        kind: "newsletter",
        consent: true,
        payload: { email: "synthetic@example.test" },
        source: "integration",
      },
    })
  ).status,
  201,
);
assert.equal(
  (
    await call("/inquiries", {
      method: "POST",
      data: {
        kind: "newsletter",
        consent: false,
        payload: { email: "synthetic@example.test" },
      },
    })
  ).status,
  400,
);
const responses = await call("/admin/responses", { token: admin });
assert.ok(responses.data.rows.some((r) => r.id === a.id));
assert.ok(responses.data.rows.every((r) => !r.token_hash));
const detail = await call("/admin/responses/" + a.id, { token: admin });
assert.equal(detail.data.token_hash, undefined);
assert.deepEqual(JSON.parse(detail.data.answers_json), { 1: ["B"] });
for (const id of [draft.data.id, next.data.id])
  await call("/admin/tests/" + id + "/unpublish", {
    method: "POST",
    token: admin,
  });
console.log(
  "Integration passed: draft isolation, admin auth, consent, origin checks, answer secrecy, autosave/resume, conflict handling, immutable test versions, marking, idempotency, deadline enforcement, inquiries and response retrieval.",
);
