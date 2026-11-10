const $ = (id) => document.getElementById(id),
  key = "jeepinnacle-attempt-v1";
let session,
  attempt,
  answers = {},
  queue = Promise.resolve(),
  offset = 0,
  submitting = false,
  ready = false,
  loading = true;
const message = (value, error = false) => {
  $("message").textContent = value;
  $("message").className = error ? "status error" : "status";
};
async function api(path, method = "GET", data) {
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Request failed");
  return result;
}
function store() {
  localStorage.setItem(key, JSON.stringify({ ...session, pending: answers }));
}
function renderQuestions() {
  $("questions").replaceChildren();
  attempt.questions.forEach((q, i) => {
    const card = document.createElement("fieldset");
    card.className = "card question";
    const legend = document.createElement("legend");
    legend.className = "number";
    legend.textContent = `Question ${i + 1} · ${q.type === "single" ? "Single correct" : "One or more correct"} · ${q.topic}`;
    card.append(legend);
    const statement = document.createElement("p");
    statement.textContent = q.question;
    card.append(statement);
    for (const [value, label] of Object.entries(q.options)) {
      const option = document.createElement("label");
      option.className = "option";
      const input = document.createElement("input");
      input.type = q.type === "single" ? "radio" : "checkbox";
      input.name = `q-${q.id}`;
      input.value = value;
      input.checked = (answers[q.id] || []).includes(value);
      input.addEventListener("change", () => {
        answers[q.id] = Array.from(
          card.querySelectorAll("input:checked"),
          (el) => el.value,
        );
        try {
          store();
        } catch {
          message("Browser storage is unavailable. Keep this page open.", true);
        }
        progress();
        save();
      });
      const span = document.createElement("span");
      span.textContent = `${value}. ${label}`;
      option.append(input, span);
      card.append(option);
    }
    const clear = document.createElement("button");
    clear.type = "button";
    clear.className = "secondary";
    clear.textContent = "Clear selection";
    clear.onclick = () => {
      card.querySelectorAll("input").forEach((el) => (el.checked = false));
      answers[q.id] = [];
      try {
        store();
      } catch {}
      progress();
      save();
    };
    card.append(clear);
    $("questions").append(card);
  });
  window.MathJax?.typesetPromise?.([$("questions")]).catch(() => {});
  progress();
}
function progress() {
  $("progress").textContent =
    `${Object.values(answers).filter((v) => v.length).length} of ${attempt.questions.length} answered`;
}
function save() {
  const snapshot = structuredClone(answers);
  $("saved").textContent = "Saving…";
  queue = queue
    .catch(() => {})
    .then(async () => {
      if (attempt.submittedAt) return;
      try {
        const r = await api(`/attempts/${session.id}`, "PUT", {
          answers: snapshot,
          revision: attempt.revision,
        });
        attempt.revision = r.revision;
        $("saved").textContent = "Saved";
      } catch (e) {
        $("saved").textContent = "Not saved";
        message(
          `${e.message} Your choices remain on this device. Use Retry save before time runs out.`,
          true,
        );
        $("retry").hidden = false;
      }
    });
  return queue;
}
const retry = document.createElement("button");
retry.id = "retry";
retry.type = "button";
retry.textContent = "Retry save";
retry.hidden = true;
retry.onclick = () => {
  retry.hidden = true;
  save();
};
$("message").after(retry);
function showAttempt(data) {
  attempt = data;
  offset = data.serverTime - Date.now();
  loading = false;
  if (data.report) {
    showReport(data.report);
    return;
  }
  ready = true;
  $("intro").hidden = true;
  $("exam").hidden = false;
  $("result").hidden = true;
  $("exam-title").textContent = data.title;
  renderQuestions();
  tick();
}
function tick() {
  if (!ready || submitting || attempt.submittedAt) return;
  const left = Math.max(
    0,
    Math.ceil((attempt.deadline - Date.now() - offset) / 1000),
  );
  $("timer").textContent =
    `${Math.floor(left / 60)}:${String(left % 60).padStart(2, "0")} remaining`;
  if (left === 0) {
    document
      .querySelectorAll("#answers input,#answers button")
      .forEach((el) => (el.disabled = true));
    submit(true);
  }
}
setInterval(tick, 1000);
async function submit(expired = false) {
  if (submitting) return;
  submitting = true;
  $("submit").disabled = true;
  message(expired ? "Time is up. Submitting saved answers…" : "Submitting…");
  try {
    await queue;
    const result = await api(`/attempts/${session.id}/submit`, "POST", {
      answers,
      revision: attempt.revision,
    });
    attempt = result;
    showReport(result.report);
    message("Your result has been recorded.");
  } catch (e) {
    message(`${e.message} Please retry submitting.`, true);
    $("submit").disabled = false;
  } finally {
    submitting = false;
  }
}
function showReport(report) {
  ready = false;
  $("intro").hidden = true;
  $("exam").hidden = true;
  $("result").hidden = false;
  $("score").textContent = `${report.score} / ${report.maxScore}`;
  $("result-note").textContent =
    "Recorded securely. This score reflects this question set and its marking rules.";
  $("topics").replaceChildren();
  for (const [topic, stats] of Object.entries(report.topics)) {
    const p = document.createElement("p");
    p.textContent = `${topic}: ${stats.score}/${stats.max} · ${stats.correct} correct, ${stats.attempted} attempted`;
    $("topics").append(p);
  }
  $("mistakes").replaceChildren();
  for (const [tag, count] of Object.entries(report.mistakes).sort(
    (a, b) => b[1] - a[1],
  )) {
    const p = document.createElement("p");
    p.textContent = `${tag}: ${count} wrong selection${count === 1 ? "" : "s"}`;
    $("mistakes").append(p);
  }
  if (!Object.keys(report.mistakes).length)
    $("mistakes").textContent =
      "No wrong selections recorded. Check the topic breakdown for unanswered questions.";
  $("book").href =
    `https://wa.me/918310906345?text=${encodeURIComponent(`I would like to discuss the maths readiness result. Score: ${report.score}/${report.maxScore}. Reference: ${session.id}`)}`;
}
$("answers").addEventListener("submit", (e) => {
  e.preventDefault();
  if (confirm("Submit your test? You cannot change answers afterwards."))
    submit();
});
$("new-test").onclick = () => {
  localStorage.removeItem(key);
  location.reload();
};
$("start").addEventListener("submit", async (e) => {
  e.preventDefault();
  $("begin").disabled = true;
  try {
    const params = new URLSearchParams(location.search);
    const result = await api("/attempts", "POST", {
      slug: $("test").value,
      parentName: $("parent").value,
      parentPhone: $("phone").value,
      consent: $("consent").checked,
      source: params.get("utm_source") || params.get("source") || "direct",
      campaign: params.get("utm_campaign") || "",
    });
    session = { id: result.id, token: result.token };
    answers = {};
    try {
      store();
    } catch {
      message("Keep this page open: browser storage is unavailable.", true);
    }
    showAttempt(result);
  } catch (e) {
    message(e.message, true);
    $("begin").disabled = false;
  }
});
async function init() {
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      session = JSON.parse(stored);
      const data = await api(`/attempts/${session.id}`);
      answers = data.submittedAt
        ? data.answers
        : session.pending || data.answers;
      showAttempt(data);
      if (!data.submittedAt && Date.now() + offset < data.deadline) save();
      return;
    }
  } catch (e) {
    message(
      `Could not resume: ${e.message}. You can retry by refreshing, or start again.`,
      true,
    );
    session = null;
  }
  try {
    const tests = await api("/tests");
    $("test").replaceChildren();
    for (const t of tests) {
      const option = document.createElement("option");
      option.value = t.slug;
      option.textContent = t.title;
      option.dataset.duration = t.duration_minutes;
      $("test").append(option);
    }
    const selected = new URLSearchParams(location.search).get("test");
    if (selected && tests.some((t) => t.slug === selected))
      $("test").value = selected;
    const update = () => {
      $("duration").textContent = tests.length
        ? `${$("test").selectedOptions[0].dataset.duration} minutes · timer starts when you begin`
        : "No tests are published yet. Please check back after Gunjan’s review.";
    };
    $("test").onchange = update;
    update();
    $("begin").disabled = !tests.length;
  } catch (e) {
    message(e.message, true);
    $("test").innerHTML = "<option>Tests unavailable</option>";
  }
  loading = false;
}
window.addEventListener("beforeunload", (e) => {
  if (ready && !attempt.submittedAt) {
    e.preventDefault();
    e.returnValue = "";
  }
});
init();
