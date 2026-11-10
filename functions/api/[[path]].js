import {
  HttpError,
  check,
  validateTest,
  publicQuestions,
  validateAnswers,
  grade,
} from "../../lib/platform.js";
const json = (data, status = 200) =>
  Response.json(data, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
const digest = async (value) =>
  Array.from(
    new Uint8Array(
      await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value)),
    ),
  )
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
const now = () => Date.now();
async function body(request) {
  check(
    request.headers.get("content-type")?.includes("application/json"),
    "Use application/json",
    415,
  );
  check(
    Number(request.headers.get("content-length") || 0) <= 256000,
    "Request too large",
    413,
  );
  const reader = request.body?.getReader();
  check(reader, "Request body required");
  let size = 0;
  const parts = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    size += value.length;
    if (size > 256000) {
      await reader.cancel();
      throw new HttpError(413, "Request too large");
    }
    parts.push(value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const p of parts) {
    bytes.set(p, offset);
    offset += p.length;
  }
  try {
    return JSON.parse(new TextDecoder().decode(bytes));
  } catch {
    throw new HttpError(400, "Invalid JSON");
  }
}
async function admin(request, env) {
  check(
    env.ADMIN_TOKEN && env.ADMIN_TOKEN.length >= 32,
    "Administration is not configured",
    503,
  );
  const supplied = request.headers.get("authorization") || "";
  const a = await digest(supplied),
    b = await digest(`Bearer ${env.ADMIN_TOKEN}`);
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  check(diff === 0, "Sign in with the administrator key", 401);
}
async function rate(request, env, scope, limit) {
  const ip = request.headers.get("CF-Connecting-IP") || "local";
  const key = await digest(`${scope}:${ip}:${Math.floor(now() / 3600000)}`);
  const row = await env.DB.prepare(
    "INSERT INTO rate_limits(key,count,expires_at) VALUES (?,1,?) ON CONFLICT(key) DO UPDATE SET count=count+1 RETURNING count",
  )
    .bind(key, now() + 3600000)
    .first();
  check(row.count <= limit, "Too many requests. Please try again later.", 429);
  await env.DB.prepare("DELETE FROM rate_limits WHERE expires_at < ?")
    .bind(now())
    .run();
}
function text(value, max = 160) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}
async function getAttempt(request, env, id) {
  const row = await env.DB.prepare(
    "SELECT a.*, t.questions_json,t.title FROM attempts a JOIN tests t ON t.id=a.test_id WHERE a.id=?",
  )
    .bind(id)
    .first();
  check(
    row &&
      (await digest(request.headers.get("authorization") || "")) ===
        row.token_hash,
    "Attempt not found",
    404,
  );
  return row;
}
function attemptView(row) {
  return {
    id: row.id,
    title: row.title,
    deadline: row.deadline,
    serverTime: now(),
    answers: JSON.parse(row.answers_json),
    revision: row.revision,
    submittedAt: row.submitted_at,
    report: row.report_json ? JSON.parse(row.report_json) : null,
    questions: publicQuestions(JSON.parse(row.questions_json)),
  };
}
export async function onRequest({ request, env }) {
  try {
    const url = new URL(request.url),
      path = url.pathname.replace(/\/$/, "");
    const method = request.method;
    if (!["GET", "POST", "PUT"].includes(method))
      return json({ error: "Method not allowed" }, 405);
    if (method !== "GET") {
      const origin = request.headers.get("origin");
      check(
        !origin || origin === url.origin,
        "Cross-origin request rejected",
        403,
      );
    }
    check(env.DB, "Database is not configured", 503);
    if (path.startsWith("/api/admin/")) {
      await rate(request, env, "admin", 300);
      await admin(request, env);
      if (path === "/api/admin/tests" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT id,slug,title,duration_minutes,published,created_at FROM tests ORDER BY created_at DESC LIMIT 100",
        ).all();
        return json(results);
      }
      if (path === "/api/admin/tests" && method === "POST") {
        const input = await body(request),
          test = validateTest(input);
        const id = crypto.randomUUID();
        await env.DB.prepare(
          "INSERT INTO tests(id,slug,title,duration_minutes,questions_json,published,created_at) VALUES (?,?,?,?,?,0,?)",
        )
          .bind(
            id,
            test.slug,
            test.title,
            test.durationMinutes,
            JSON.stringify(test.questions),
            now(),
          )
          .run();
        return json({ id, slug: test.slug, published: false }, 201);
      }
      const testDetail = path.match(/^\/api\/admin\/tests\/([^/]+)$/);
      if (testDetail && method === "GET") {
        const row = await env.DB.prepare("SELECT * FROM tests WHERE id=?")
          .bind(testDetail[1])
          .first();
        check(row, "Test not found", 404);
        return json(row);
      }
      const publish = path.match(/^\/api\/admin\/tests\/([^/]+)\/publish$/);
      if (publish && method === "POST") {
        const row = await env.DB.prepare("SELECT id,slug FROM tests WHERE id=?")
          .bind(publish[1])
          .first();
        check(row, "Test not found", 404);
        await env.DB.batch([
          env.DB.prepare(
            "UPDATE tests SET published=0 WHERE slug=? AND published=1",
          ).bind(row.slug),
          env.DB.prepare("UPDATE tests SET published=1 WHERE id=?").bind(
            row.id,
          ),
        ]);
        return json({ url: `/test/?test=${row.slug}` });
      }
      const unpublish = path.match(/^\/api\/admin\/tests\/([^/]+)\/unpublish$/);
      if (unpublish && method === "POST") {
        await env.DB.prepare("UPDATE tests SET published=0 WHERE id=?")
          .bind(unpublish[1])
          .run();
        return json({ ok: true });
      }
      const offset = Number(url.searchParams.get("offset") || 0);
      check(
        Number.isInteger(offset) && offset >= 0 && offset <= 100000,
        "Invalid offset",
      );
      if (path === "/api/admin/responses" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT a.id,a.parent_name,a.parent_phone,a.source,a.campaign,a.started_at,a.submitted_at,a.report_json,t.title FROM attempts a JOIN tests t ON t.id=a.test_id ORDER BY a.started_at DESC LIMIT 50 OFFSET ?",
        )
          .bind(offset)
          .all();
        return json({
          rows: results,
          nextOffset: results.length === 50 ? offset + 50 : null,
        });
      }
      const detail = path.match(/^\/api\/admin\/responses\/([^/]+)$/);
      if (detail && method === "GET") {
        const row = await env.DB.prepare(
          "SELECT a.*,t.title,t.questions_json FROM attempts a JOIN tests t ON t.id=a.test_id WHERE a.id=?",
        )
          .bind(detail[1])
          .first();
        check(row, "Response not found", 404);
        delete row.token_hash;
        return json(row);
      }
      if (path === "/api/admin/inquiries" && method === "GET") {
        const { results } = await env.DB.prepare(
          "SELECT * FROM inquiries ORDER BY created_at DESC LIMIT 50 OFFSET ?",
        )
          .bind(offset)
          .all();
        return json({
          rows: results,
          nextOffset: results.length === 50 ? offset + 50 : null,
        });
      }
    }
    if (path === "/api/tests" && method === "GET") {
      const { results } = await env.DB.prepare(
        "SELECT slug,title,duration_minutes FROM tests WHERE published=1 ORDER BY created_at DESC LIMIT 100",
      ).all();
      return json(results);
    }
    if (path === "/api/attempts" && method === "POST") {
      await rate(request, env, "start", 10);
      const data = await body(request);
      const parentName = text(data.parentName, 100),
        phone = text(data.parentPhone, 30).replace(/[\s()-]/g, "");
      check(
        parentName.length >= 2 && /^\+?[0-9]{10,15}$/.test(phone),
        "Enter the parent’s name and a valid phone number",
      );
      check(data.consent === true, "Parent or guardian consent is required");
      const test = await env.DB.prepare(
        "SELECT * FROM tests WHERE slug=? AND published=1",
      )
        .bind(text(data.slug, 80))
        .first();
      check(test, "This test is not available yet", 404);
      const id = crypto.randomUUID(),
        token = crypto.randomUUID() + crypto.randomUUID();
      const started = now();
      await env.DB.prepare(
        "INSERT INTO attempts(id,token_hash,test_id,parent_name,parent_phone,consent_version,consent_at,source,campaign,started_at,deadline) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      )
        .bind(
          id,
          await digest(`Bearer ${token}`),
          test.id,
          parentName,
          phone,
          "parent-v1",
          started,
          text(data.source, 100) || "direct",
          text(data.campaign, 100),
          started,
          started + test.duration_minutes * 60000,
        )
        .run();
      return json(
        {
          id,
          token,
          deadline: started + test.duration_minutes * 60000,
          serverTime: now(),
          title: test.title,
          questions: publicQuestions(JSON.parse(test.questions_json)),
          answers: {},
          revision: 0,
        },
        201,
      );
    }
    const match = path.match(/^\/api\/attempts\/([^/]+)(\/submit)?$/);
    if (match) {
      const row = await getAttempt(request, env, match[1]);
      if (method === "GET" && !match[2]) return json(attemptView(row));
      if (method === "PUT" && !match[2]) {
        check(!row.submitted_at, "This attempt is already submitted", 409);
        check(
          now() <= row.deadline,
          "Time is up. Submit your saved answers.",
          409,
        );
        const data = await body(request);
        validateAnswers(data.answers, JSON.parse(row.questions_json));
        check(
          data.revision === row.revision,
          "Answers changed in another tab. Reload to continue.",
          409,
        );
        const result = await env.DB.prepare(
          "UPDATE attempts SET answers_json=?,revision=revision+1 WHERE id=? AND submitted_at IS NULL AND revision=? AND deadline>=?",
        )
          .bind(JSON.stringify(data.answers), row.id, row.revision, now())
          .run();
        check(
          result.meta.changes === 1,
          "Attempt changed. Reload to continue.",
          409,
        );
        return json({ saved: true, revision: row.revision + 1 });
      }
      if (method === "POST" && match[2]) {
        if (row.submitted_at) return json(attemptView(row));
        const data = await body(request);
        const questions = JSON.parse(row.questions_json);
        // Late submissions grade only answers saved before the server deadline.
        const answers =
          now() <= row.deadline
            ? validateAnswers(data.answers, questions)
            : JSON.parse(row.answers_json);
        check(
          data.revision === row.revision,
          "Answers changed in another tab. Reload to continue.",
          409,
        );
        const report = grade(questions, answers);
        const result = await env.DB.prepare(
          "UPDATE attempts SET submitted_at=?,answers_json=?,report_json=?,revision=revision+1 WHERE id=? AND submitted_at IS NULL AND revision=?",
        )
          .bind(
            now(),
            JSON.stringify(answers),
            JSON.stringify(report),
            row.id,
            row.revision,
          )
          .run();
        check(
          result.meta.changes === 1,
          "Attempt changed. Reload to continue.",
          409,
        );
        return json(attemptView(await getAttempt(request, env, row.id)));
      }
    }
    if (path === "/api/inquiries" && method === "POST") {
      await rate(request, env, "inquiry", 10);
      const data = await body(request);
      check(data.consent === true, "Consent is required");
      check(["contact", "newsletter"].includes(data.kind), "Invalid form");
      const payload = data.payload;
      check(payload && typeof payload === "object", "Invalid form");
      check(
        !payload["bot-field"] && !payload["newsletter-bot-field"],
        "Unable to submit this form",
      );
      check(
        typeof payload.email === "string" &&
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email) &&
          payload.email.length <= 254,
        "Enter a valid email",
      );
      const clean = { email: payload.email };
      if (data.kind === "contact") {
        check(
          /^\+?[0-9\s()-]{10,20}$/.test(payload.phone || ""),
          "Enter a valid parent phone number",
        );
        for (const key of ["student", "phone", "class", "message"])
          clean[key] = text(payload[key], key === "message" ? 2000 : 120);
        clean.batch = Array.isArray(payload.batch)
          ? payload.batch.slice(0, 10).map((v) => text(v, 80))
          : [];
      }
      const id = crypto.randomUUID();
      await env.DB.prepare("INSERT INTO inquiries VALUES (?,?,?,?,?,?)")
        .bind(
          id,
          data.kind,
          JSON.stringify(clean),
          text(data.source, 100) || "direct",
          now(),
          now(),
        )
        .run();
      return json({ id, saved: true }, 201);
    }
    return json({ error: "Not found" }, 404);
  } catch (error) {
    if (error instanceof HttpError)
      return json({ error: error.message }, error.status);
    console.error("API failure", error?.name);
    return json(
      { error: "We could not save this request. Please try again." },
      500,
    );
  }
}
