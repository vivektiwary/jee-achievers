# JEEAchievers Static Site

Marketing site for the fictional **JEEAchievers** IIT-JEE coaching network. The project ships as a static bundle designed for drop-in hosting on Netlify, Vercel, GitHub Pages, or any CDN.

## Features

- **SEO-first build**: enriched `<head>` metadata, JSON-LD for organization, course, FAQs, and breadcrumbs, plus sitemap and robots directives.
- **Rich landing page**: hero, programs, differentiators, results, testimonials, reviews, contact form, and FAQ blocks styled with a modern gradient system.
- **Testimonials & reviews**: interactive slider with local persistence and configurable hooks to ingest Google or UrbanPro reviews.
- **Offline-friendly touches**: PWA manifest, touch icons, downloadable brochure placeholder, and accessible fallbacks.

## Getting started

1. Open `index.html` in any modern browser to preview the experience locally.
2. Adjust contact details, statistics, and CTA links directly inside `index.html`.
3. Configure live review imports by updating the `REVIEW_ENDPOINTS` map inside `assets/js/main.js` or defining `window.reviewConfig` before loading the script.

## Project structure

```
├── index.html             # Single-page experience
├── assets
│   ├── css/style.css      # Global styles and layout helpers
│   ├── js/main.js         # Navigation, forms, and testimonial logic
│   └── img/               # Brand assets and sharing previews
├── manifest.webmanifest   # PWA metadata
├── robots.txt             # Crawl directives
└── sitemap.xml            # Search engine discovery hints
```

## Deployment tips

- Update the canonical domain inside `index.html`, `sitemap.xml`, and `robots.txt` before going live.
- Supply production review API endpoints (with the required CORS headers) to surface third-party ratings on the site.
- Replace the placeholder brochure link with a real PDF and extend the manifest icons if publishing to app stores.

## Continuous deployment

This repository ships with a GitHub Actions workflow that publishes the static bundle to **GitHub Pages** every time `main` is updated or when the workflow is triggered manually:

1. Enable GitHub Pages in the repository settings and select **GitHub Actions** as the source.
2. Merge changes into `main` (or re-run the workflow) to build the site and deploy the artifact.
3. Monitor the workflow run for the published page URL and any status updates.
4. After the run finishes, open the live Pages site in a new tab to confirm the latest hero, testimonials, and forms render without caching artifacts.
