export class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}
export function check(ok, message, status = 400) {
  if (!ok) throw new HttpError(status, message);
}
export function validateTest(data) {
  check(data && typeof data === "object", "Expected a test object");
  check(
    typeof data.slug === "string" &&
      /^[a-z0-9][a-z0-9-]{2,79}$/.test(data.slug),
    "Use a slug of 3–80 lowercase letters, digits or hyphens",
  );
  check(
    typeof data.title === "string" &&
      data.title.trim().length > 0 &&
      data.title.length <= 160,
    "Title is required (maximum 160 characters)",
  );
  check(
    Number.isInteger(data.durationMinutes) &&
      data.durationMinutes >= 5 &&
      data.durationMinutes <= 180,
    "Duration must be 5–180 minutes",
  );
  check(
    Array.isArray(data.questions) &&
      data.questions.length > 0 &&
      data.questions.length <= 60,
    "Provide 1–60 questions",
  );
  const ids = new Set();
  const questions = data.questions.map((q) => {
    check(q && typeof q === "object", "Invalid question");
    check(
      (typeof q.id === "string" || Number.isInteger(q.id)) &&
        /^[a-zA-Z0-9][a-zA-Z0-9_-]{0,79}$/.test(String(q.id)) &&
        !Object.hasOwn(Object.prototype, String(q.id)),
      "Invalid question ID",
    );
    check(!ids.has(String(q.id)), "Duplicate question ID");
    ids.add(String(q.id));
    for (const field of ["topic", "question", "solution"])
      check(
        typeof q[field] === "string" &&
          q[field].trim().length > 0 &&
          q[field].length <= 12000,
        `${field} is required (maximum 12,000 characters)`,
      );
    check(
      ["single", "multi"].includes(q.type),
      "Question type must be single or multi",
    );
    check(
      q.options &&
        typeof q.options === "object" &&
        !Array.isArray(q.options) &&
        Object.keys(q.options).sort().join("") === "ABCD",
      "Provide exactly options A, B, C, D",
    );
    check(
      Object.values(q.options).every(
        (v) => typeof v === "string" && v.trim().length > 0 && v.length <= 4000,
      ),
      "Invalid option text",
    );
    check(
      Array.isArray(q.answer) &&
        q.answer.length > 0 &&
        q.answer.every((a) => "ABCD".includes(a) && a.length === 1) &&
        new Set(q.answer).size === q.answer.length,
      "Invalid answer key",
    );
    check(
      q.type !== "single" || q.answer.length === 1,
      "Single-choice questions need exactly one answer",
    );
    const wrong = {};
    for (const key of Object.keys(q.options).filter(
      (k) => !q.answer.includes(k),
    )) {
      const item = q.wrong_options?.[key];
      check(
        item &&
          typeof item.why === "string" &&
          item.why.length > 0 &&
          item.why.length <= 4000 &&
          typeof item.tag === "string" &&
          item.tag.length > 0 &&
          item.tag.length <= 80,
        "Explain every wrong option with why and tag",
      );
      wrong[key] = { why: item.why, tag: item.tag };
    }
    return {
      id: String(q.id),
      topic: q.topic,
      type: q.type,
      level: typeof q.level === "string" ? q.level.slice(0, 80) : "",
      question: q.question,
      options: q.options,
      answer: q.answer,
      solution: q.solution,
      wrong_options: wrong,
    };
  });
  return {
    slug: data.slug,
    title: data.title.trim(),
    durationMinutes: data.durationMinutes,
    questions,
  };
}
export function publicQuestions(questions) {
  return questions.map(({ id, topic, type, level, question, options }) => ({
    id,
    topic,
    type,
    level,
    question,
    options,
  }));
}
export function validateAnswers(input, questions) {
  check(
    input && typeof input === "object" && !Array.isArray(input),
    "Answers must be an object",
  );
  const map = new Map(questions.map((q) => [String(q.id), q]));
  for (const [id, values] of Object.entries(input)) {
    const q = map.get(id);
    check(q, "Unknown question");
    check(
      Array.isArray(values) &&
        values.every((v) => ["A", "B", "C", "D"].includes(v)) &&
        new Set(values).size === values.length,
      "Invalid selection",
    );
    check(
      q.type !== "single" || values.length <= 1,
      "Choose only one option for a single-choice question",
    );
  }
  return input;
}
export function grade(questions, answers) {
  let score = 0;
  const topics = Object.create(null),
    mistakes = Object.create(null);
  for (const q of questions) {
    const selected = Object.hasOwn(answers, q.id) ? answers[q.id] : [];
    const correct =
      selected.length === q.answer.length &&
      selected.every((a) => q.answer.includes(a));
    let marks = 0;
    if (selected.length)
      marks = correct
        ? 4
        : q.type === "single"
          ? -1
          : selected.every((a) => q.answer.includes(a))
            ? selected.length
            : -2;
    score += marks;
    const topic = (topics[q.topic] ||= {
      score: 0,
      max: 0,
      correct: 0,
      attempted: 0,
    });
    topic.score += marks;
    topic.max += 4;
    topic.correct += Number(correct);
    topic.attempted += Number(selected.length > 0);
    for (const a of selected.filter((a) => !q.answer.includes(a))) {
      const tag = q.wrong_options[a]?.tag || "concept";
      mistakes[tag] = (mistakes[tag] || 0) + 1;
    }
  }
  return { score, maxScore: questions.length * 4, topics, mistakes };
}
