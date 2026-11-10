const $ = (id) => document.getElementById(id);
let token = "",
  responseOffset = 0,
  inquiryOffset = 0;
const message = (value, error = false) => {
  $("message").textContent = value;
  $("message").className = error ? "status error" : "status";
};
async function api(path, method = "GET", data) {
  const res = await fetch(`/api/admin${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
  const result = await res.json();
  if (!res.ok) throw new Error(result.error || "Request failed");
  return result;
}
function table(container, headers, rows, append = false) {
  let table = container.querySelector("table");
  if (!append || !table) {
    table = document.createElement("table");
    const tr = document.createElement("tr");
    for (const title of headers) {
      const th = document.createElement("th");
      th.textContent = title;
      tr.append(th);
    }
    table.append(tr);
    container.replaceChildren(table);
  }
  for (const cells of rows) {
    const tr = document.createElement("tr");
    for (const value of cells) {
      const td = document.createElement("td");
      if (value instanceof Node) td.append(value);
      else td.textContent = value ?? "—";
      tr.append(td);
    }
    table.append(tr);
  }
  if (!rows.length && !append) {
    const p = document.createElement("p");
    p.textContent = "Nothing recorded yet.";
    container.append(p);
  }
}
function button(label, fn) {
  const b = document.createElement("button");
  b.className = "secondary";
  b.textContent = label;
  b.onclick = async () => {
    b.disabled = true;
    try {
      await fn();
    } catch (e) {
      message(e.message, true);
    } finally {
      b.disabled = false;
    }
  };
  return b;
}
const date = (value) =>
  value ? new Date(value).toLocaleString() : "In progress";
async function tests() {
  const rows = await api("/tests");
  table(
    $("tests"),
    ["Title", "Version", "Status", "Action"],
    rows.map((t) => {
      const controls = document.createElement("div");
      controls.append(button("Review", () => review(t.id)));
      controls.append(
        button(t.published ? "Unpublish" : "Publish", async () => {
          if (
            !confirm(
              t.published
                ? "Stop new attempts for this version?"
                : "Publish this reviewed version for students?",
            )
          )
            return;
          const result = await api(
            `/tests/${t.id}/${t.published ? "unpublish" : "publish"}`,
            "POST",
          );
          await tests();
          message(
            result.url
              ? `Published. Share: ${location.origin}${result.url}&utm_source=instagram`
              : "Unpublished. Existing attempts can still finish.",
          );
        }),
      );
      if (t.published) {
        const link = document.createElement("a");
        link.href = `/test/?test=${encodeURIComponent(t.slug)}`;
        link.textContent = " Student link";
        controls.append(link);
      }
      return [
        t.title,
        date(t.created_at),
        t.published ? "Published" : "Draft",
        controls,
      ];
    }),
  );
}
async function responses(more = false) {
  const data = await api(`/responses?offset=${more ? responseOffset : 0}`);
  table(
    $("responses"),
    [
      "Parent",
      "Phone",
      "Source / campaign",
      "Test",
      "Score",
      "Submitted",
      "Detail",
    ],
    data.rows.map((r) => [
      r.parent_name,
      r.parent_phone,
      `${r.source} / ${r.campaign || "—"}`,
      r.title,
      r.report_json
        ? `${JSON.parse(r.report_json).score}/${JSON.parse(r.report_json).maxScore}`
        : "—",
      date(r.submitted_at),
      button("Open", async () => {
        const detail = await api(`/responses/${r.id}`);
        for (const key of ["answers_json", "report_json", "questions_json"])
          if (detail[key]) detail[key] = JSON.parse(detail[key]);
        $("detail").textContent = JSON.stringify(detail, null, 2);
        $("detail-card").hidden = false;
        $("detail-card").scrollIntoView({ behavior: "smooth" });
      }),
    ]),
    more,
  );
  responseOffset = data.nextOffset;
  $("more-responses").hidden = responseOffset === null;
}
async function inquiries(more = false) {
  const data = await api(`/inquiries?offset=${more ? inquiryOffset : 0}`);
  table(
    $("inquiries"),
    ["Received", "Type", "Source", "Details"],
    data.rows.map((r) => [
      date(r.created_at),
      r.kind,
      r.source,
      JSON.stringify(JSON.parse(r.payload_json)),
    ]),
    more,
  );
  inquiryOffset = data.nextOffset;
  $("more-inquiries").hidden = inquiryOffset === null;
}
async function refresh() {
  await tests();
  await responses();
  await inquiries();
}
$("login").onsubmit = async (e) => {
  e.preventDefault();
  token = $("key").value;
  try {
    await refresh();
    $("key").value = "";
    $("login").hidden = true;
    $("workspace").hidden = false;
    message("Workspace ready.");
  } catch (e) {
    token = "";
    message(e.message, true);
  }
};
$("logout").onclick = () => {
  token = "";
  location.reload();
};
$("refresh").onclick = () => refresh().catch((e) => message(e.message, true));
$("more-responses").onclick = () =>
  responses(true).catch((e) => message(e.message, true));
$("more-inquiries").onclick = () =>
  inquiries(true).catch((e) => message(e.message, true));
$("file").onchange = async () => {
  const file = $("file").files[0];
  if (!file) return;
  if (file.size > 256000) {
    message("Choose a file smaller than 256 KB.", true);
    return;
  }
  $("bank").value = await file.text();
};
$("upload").onclick = async () => {
  const b = $("upload");
  b.disabled = true;
  try {
    const parsed = JSON.parse($("bank").value);
    const data = Array.isArray(parsed)
      ? {
          slug: $("slug").value,
          title: $("title").value,
          durationMinutes: Number($("minutes").value),
          questions: parsed,
        }
      : parsed;
    const r = await api("/tests", "POST", data);
    message(`Draft saved (${r.id}). Review before publishing.`);
    await tests();
  } catch (e) {
    message(e.message, true);
  } finally {
    b.disabled = false;
  }
};

async function review(id) {
  const test = await api(`/tests/${id}`);
  $("review").replaceChildren();
  const title = document.createElement("h3");
  title.textContent = test.title;
  $("review").append(title);
  for (const [i, q] of JSON.parse(test.questions_json).entries()) {
    const section = document.createElement("article");
    section.className = "card";
    const add = (tag, text) => {
      const el = document.createElement(tag);
      el.textContent = text;
      section.append(el);
    };
    add("h3", `${i + 1}. ${q.topic} · ${q.type}`);
    add("p", q.question);
    for (const [key, value] of Object.entries(q.options))
      add("p", `${key}. ${value}`);
    add("strong", `Answer: ${q.answer.join(", ")}`);
    add("p", q.solution);
    for (const [key, value] of Object.entries(q.wrong_options))
      add("p", `${key}: ${value.why} (${value.tag})`);
    $("review").append(section);
  }
  $("review-card").hidden = false;
  $("review-card").scrollIntoView({ behavior: "smooth" });
  if (window.MathJax?.startup?.promise) await window.MathJax.startup.promise;
  await window.MathJax?.typesetPromise?.([$("review")]);
}
