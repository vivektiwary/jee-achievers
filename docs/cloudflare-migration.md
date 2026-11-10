# Cloudflare migration and launch

## 1. Authenticate and create resources

```sh
npx wrangler login --scopes account:read user:read pages:write d1:write zone:read
npx wrangler whoami
npx wrangler d1 create jeepinnacle --location apac
```

Copy the returned `database_id` into `wrangler.jsonc`, replacing the all-zero placeholder. Select the intended account with `CLOUDFLARE_ACCOUNT_ID` if there is more than one. The APAC location is a placement hint, not a guarantee of Indian data residency.

```sh
npm run db:remote
npx wrangler pages project create jeepinnacle --production-branch main
npx wrangler pages secret put ADMIN_TOKEN --project-name jeepinnacle
```

Use a random administrator secret of at least 32 characters. Keep it in a password manager. Do not put it in the repository, build arguments, client code or a shareable URL. For local development only, `.dev.vars` is ignored.

## 2. Deploy and verify

```sh
npm ci
npm test
npm run deploy -- --project-name jeepinnacle --branch main
```

Verify the returned `*.pages.dev` URL, the marketing pages, `/test/` and `/admin/`. Import the real bank through `/admin/` (or `scripts/import-bank.mjs`) as a draft. Test live storage using a clearly identified synthetic record; inspect it in `/admin/`. Don't publish the real test until Gunjan approves the question set and marking. Do not import local integration-test data into the live database.

## 3. Move the custom domain without breaking email

The existing canonical address is `www.jeepinnacle.com`. The registrar can remain GoDaddy.

1. Inspect the current Cloudflare zone and registrar nameservers first. If Cloudflare is already authoritative, don't change nameservers unnecessarily.
2. Before a nameserver change, copy and compare **all** existing DNS records, particularly MX, SPF, DKIM, DMARC, domain verification and other service records. Keep existing mail records intact. Record the old web records for rollback.
3. In the Pages project's **Custom domains**, add `www.jeepinnacle.com` and follow Cloudflare's displayed DNS instructions. Add the apex domain if it will also be served or redirected. Verify the issued certificate before switching public links.
4. If required, update GoDaddy nameservers to exactly the pair assigned to the zone. Wait for Cloudflare's active status.
5. Set redirect rules for `jeepinnacle.com`, `jeepinnacle.in` and `www.jeepinnacle.in` to `https://www.jeepinnacle.com`, preserving path and query string. The `.in` zone also needs its own active DNS/redirect configuration. `netlify.toml` has no effect on Cloudflare.
6. Verify the home page, all existing SEO paths, `/test/`, `/api/tests`, form storage and admin access on the custom domain. Verify email routing independently if email exists.
7. Only then retire the old GitHub Pages custom-domain configuration. Keep its manual workflow for a static-site rollback; the assessment/API needs Cloudflare.

The API uses the same origin as the page and rejects cross-origin browser writes. The `pages.dev` URL remains a fallback during DNS propagation.

## 4. Continuous deployment (optional)

The GitHub workflow `.github/workflows/cloudflare.yml` runs migrations and deploys only when all setup is complete:

- Add GitHub environment secrets `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` for `production`. Use a token scoped to this account with Pages Edit and D1 Edit; never store your personal OAuth session as a repository secret.
- Set repository variable `CLOUDFLARE_DEPLOY_ENABLED=true` after verifying the first deployment.
- Merge the migration branch into `main`. Subsequent pushes deploy the allowlisted static build plus Pages Functions.

If you prefer Cloudflare's Git integration, connect this repo, set build command `npm run build`, output `dist`, bind D1 as `DB`, configure `ADMIN_TOKEN`, and apply migrations separately before deployment. Do not enable both deployment paths simultaneously.

## Sharing after review

Publish the approved version and use the student link, for example:

```text
https://www.jeepinnacle.com/test/?test=maths-readiness-v1&utm_source=instagram&utm_campaign=readiness-launch
```

Use a different `utm_source` for WhatsApp, YouTube or QR posters. Sources/campaigns are saved with attempts. Share `/admin/` and the secret only with authorised teachers. The review HTML and question bank in the notes workspace contain answers and must not be added to public assets.
