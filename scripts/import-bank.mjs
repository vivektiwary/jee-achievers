import { readFile } from "node:fs/promises";
import { validateTest } from "../lib/platform.js";
const [file, base = "http://localhost:8788"] = process.argv.slice(2);
if (!file || !process.env.ADMIN_TOKEN) {
  console.error(
    "Usage: ADMIN_TOKEN=<secret> node scripts/import-bank.mjs /absolute/questions.json https://your-host",
  );
  process.exit(1);
}
const parsed = JSON.parse(await readFile(file, "utf8"));
const data = validateTest(
  Array.isArray(parsed)
    ? {
        slug: "maths-readiness-v1",
        title: "JEE Maths Readiness Test",
        durationMinutes: 75,
        questions: parsed,
      }
    : parsed,
);
const response = await fetch(new URL("/api/admin/tests", base), {
  method: "POST",
  headers: {
    Authorization: `Bearer ${process.env.ADMIN_TOKEN}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(data),
});
const result = await response.json();
if (!response.ok) throw new Error(result.error);
console.log(JSON.stringify(result));
console.log("Draft imported. Review and publish in /admin/.");
