import { cp, mkdir, rm, writeFile } from "node:fs/promises";
await rm("dist", { recursive: true, force: true });
await mkdir("dist", { recursive: true });
// Explicit allowlist: never ship source, private question banks, secrets or migrations.
for (const path of [
  "index.html",
  "assets",
  "manifest.webmanifest",
  "robots.txt",
  "sitemap.xml",
  "teacher-in-marathahalli",
  "best-teacher-spice-garden-bangalore",
  "iit-jee-maths-coaching-marathahalli",
  "test-page",
  "admin",
]) {
  await cp(path, `dist/${path === "test-page" ? "test" : path}`, {
    recursive: true,
  });
}
await writeFile(
  "dist/_routes.json",
  JSON.stringify({ version: 1, include: ["/api/*"], exclude: [] }),
);
await writeFile(
  "dist/_headers",
  `/*\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: strict-origin-when-cross-origin\n  Permissions-Policy: camera=(), microphone=(), geolocation=()\n/test/*\n  Cache-Control: no-store\n  X-Robots-Tag: noindex\n/admin/*\n  Cache-Control: no-store\n  X-Robots-Tag: noindex\n`,
);
