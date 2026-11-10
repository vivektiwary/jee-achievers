import test from "node:test";
import assert from "node:assert/strict";
import {
  validateTest,
  publicQuestions,
  validateAnswers,
  grade,
} from "../lib/platform.js";
const single = {
  id: "1",
  topic: "Algebra",
  type: "single",
  question: "2 + 2?",
  options: { A: "3", B: "4", C: "5", D: "6" },
  answer: ["B"],
  solution: "Add two and two.",
  wrong_options: {
    A: { tag: "arithmetic", why: "Too small" },
    C: { tag: "arithmetic", why: "Too large" },
    D: { tag: "concept", why: "Wrong operation" },
  },
};
const multi = {
  ...single,
  id: "2",
  type: "multi",
  answer: ["A", "B", "C"],
  wrong_options: { D: { tag: "concept", why: "Not correct" } },
};
const spec = {
  slug: "readiness-v1",
  title: "Test",
  durationMinutes: 75,
  questions: [single, multi],
};
test("validates a question set and strips undeclared properties", () => {
  const result = validateTest({
    ...spec,
    questions: [{ ...single, html: "bad" }],
  });
  assert.equal(result.questions[0].html, undefined);
});
test("public question projections never contain answer keys or explanations", () => {
  const q = publicQuestions([single])[0];
  assert.deepEqual(Object.keys(q), [
    "id",
    "topic",
    "type",
    "level",
    "question",
    "options",
  ]);
  assert.ok(!JSON.stringify(q).includes("Too small"));
});
test("rejects malformed banks before publishing", () => {
  for (const bad of [
    { ...spec, questions: [single, single] },
    { ...spec, questions: [{ ...single, answer: ["A", "B"] }] },
    { ...spec, questions: [{ ...single, wrong_options: {} }] },
    { ...spec, durationMinutes: 0 },
  ])
    assert.throws(() => validateTest(bad));
});
test("validates selections and question IDs", () => {
  assert.throws(() => validateAnswers({ 9: ["A"] }, [single]));
  assert.throws(() => validateAnswers({ 1: ["A", "B"] }, [single]));
  assert.throws(() => validateAnswers({ 1: ["E"] }, [single]));
  assert.throws(() => validateAnswers({ 2: ["A", "A"] }, [multi]));
});
test("marks single correct, wrong and unanswered", () => {
  assert.equal(grade([single], { 1: ["B"] }).score, 4);
  assert.equal(grade([single], { 1: ["A"] }).score, -1);
  assert.equal(grade([single], {}).score, 0);
});
test("marks multi exact, partial, wrong and unanswered", () => {
  for (const [selected, expected] of [
    [["A", "B", "C"], 4],
    [["A", "C"], 2],
    [["B"], 1],
    [["A", "D"], -2],
    [[], 0],
  ])
    assert.equal(grade([multi], { 2: selected }).score, expected);
});
test("aggregates topics and mistake patterns", () => {
  const report = grade([single, multi], { 1: ["A"], 2: ["A", "D"] });
  assert.equal(report.score, -3);
  assert.equal(report.topics.Algebra.max, 8);
  assert.deepEqual({ ...report.mistakes }, { arithmetic: 1, concept: 1 });
});

test("rejects reserved question IDs and handles reserved topic names safely", () => {
  assert.throws(() =>
    validateTest({ ...spec, questions: [{ ...single, id: "constructor" }] }),
  );
  const report = grade([{ ...single, topic: "constructor" }], { 1: ["B"] });
  assert.equal(report.topics.constructor.score, 4);
});
