# JEE Pinnacle on Cloudflare

The existing marketing site plus a maths assessment platform, hosted on **Cloudflare Pages + Pages Functions + D1**. No application framework or external database service is required.

- `/test/`: parent consent, published test selection, server-timed attempts, autosave/resume, server-side marking, topic and mistake reports, and a WhatsApp discussion link.
- `/admin/`: secret-protected teacher workspace. Import questions as JSON, review maths/keys/explanations, publish or unpublish a version, and inspect attempts and inquiries.
- Existing contact/newsletter forms now save to D1, report errors honestly, and require consent.

Question keys and solutions live in D1. They are never included in public test responses or the static build. **Do not commit question banks containing keys to this public repository.** Import the existing bank from its separate local location. New banks start as drafts; publish only after teacher review.

## Local development

Requires Node 22 and npm.

```sh
npm ci
cp .dev.vars.example .dev.vars
# Replace ADMIN_TOKEN in .dev.vars with a random secret of at least 32 characters.
npm run db:local
npm run dev
```

Open the local URL printed by Wrangler (normally http://localhost:8788). The zero database UUID in the initial config is a local placeholder; production needs the real UUID.

At `/admin/`, sign in using `ADMIN_TOKEN`, choose the existing `questions.json`, and save a draft. Review it and publish for local testing. Files up to 256 KB and up to 60 questions are supported. The upload can be a questions array or a full object:

```json
{
  "slug": "maths-readiness-v1",
  "title": "JEE Maths Readiness Test",
  "durationMinutes": 75,
  "questions": []
}
```

Each question needs `id`, `topic`, `type` (`single`/`multi`), `question`, `options` (A–D), `answer` (array), `solution`, and `wrong_options` mapping each incorrect letter to `{ "tag": "condition", "why": "..." }`. Optional `level` is displayed with question metadata. Use `\\(` and `\\)` in JSON for inline LaTeX; the page renders it using MathJax.

An alternative importer is available; set `ADMIN_TOKEN` in your environment, then run:

```sh
node scripts/import-bank.mjs /absolute/path/to/questions.json http://localhost:8788
```

The importer only creates a draft. Review and publish through the workspace.

## Production setup and domain migration

See [docs/cloudflare-migration.md](docs/cloudflare-migration.md). The old GitHub Pages deployment stays online until DNS is moved. Its workflow is now manual for rollback. The Cloudflare workflow is disabled until the account secrets and enable variable have been configured.

`npm run build` copies an explicit allowlist to `dist/`; never deploy the repository root. Functions are compiled by Wrangler separately. Private banks, secrets, migrations, scripts and unrelated files are excluded from public assets.

## Marking and timing

- Single correct: +4 correct, −1 wrong, 0 unanswered.
- Multiple correct: +4 exact set, +1 per selected correct option when incomplete, −2 if any wrong option is included, 0 unanswered.
- Each published version is immutable; corrections are uploaded as a new version of the same slug. Existing attempts reference their original version.
- The server sets the deadline. Late submission grades only answers already saved before the deadline. There is no background auto-submit: an abandoned attempt remains visible as in progress, with its saved responses, until the browser submits it.
- An attempt key is stored in the visitor's browser and authorises only that attempt. Parent contact data is returned only to the teacher workspace. Shared devices should be avoided.
- Autosaves use revision checks to prevent silent concurrent overwrites. On a conflict, reload before continuing. Offline choices stay in browser storage; reconnect and save **before** the deadline.

## Data access and operations

Tables: `tests`, `attempts`, `inquiries`, `rate_limits`. All queries use bound parameters. Admin uses a shared secret kept in tab memory, not browser persistent storage; rotate the secret when administrators change. Use HTTPS for production.

```sh
npx wrangler d1 execute DB --remote --command "SELECT source, COUNT(*) FROM attempts GROUP BY source"
```

Responses and inquiries are paginated in the workspace. Questions and detailed responses are available only through authenticated administrator routes. The assessment start and inquiry endpoints are limited to 10 requests per IP per hour; admin routes to 300. This lightweight D1 limiter is not bot verification; consider Turnstile for ad campaigns if abuse appears. D1 rates and limits should be monitored in the Cloudflare dashboard.

To fulfil an access/deletion request, verify the parent independently, then use the D1 console or parameterised administrative tooling. The workspace intentionally does not provide a destructive delete button. Establish an appropriate retention schedule before promoting the assessment; this version has no automatic purge of parent records.

MathJax is loaded from jsDelivr; the assessment itself has no analytics integration. Existing marketing embeds and review features are retained.

## Verification

```sh
npm test
npm run build
```

`node test/integration.mjs` is a **local-only** integration suite against a Wrangler server using its documented synthetic admin key (see the file). It creates synthetic tests/attempts, checks auth/consent/answer secrecy, autosave, versioning, expiry, retries and response retrieval. It updates only the local database. Do not point it at production.

For the original 30-question bank, the separate `verify.py` in the notes workspace confirms the maths. That bank and its answer-key verification script are intentionally outside this public repository.
