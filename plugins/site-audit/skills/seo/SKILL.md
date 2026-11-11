---
description: Audits a website for classic search (Google, Bing, Yandex) with search-auditor — indexing, robots.txt, redirects, canonical, sitemap, titles and descriptions, headings, broken links, images, structured data, hreflang, HTTPS — then fixes what it finds in the site's code and runs the audit again. Use when asked for an SEO audit, technical SEO, why pages are not indexed, or to check a site before a release.
---

# SEO audit with search-auditor

`search-auditor` (npm) runs 80 checks of classic search and reports each finding with what is wrong, why it matters and how to fix it. Your job: run it, fix what can be fixed in this project, run it again, and report.

For AI search (ChatGPT, Claude, Perplexity, llms.txt) use the `geo` skill of this plugin; offer it at the end.

## 1. Decide what to audit

- **A live site** — the user gives a URL, or the project's site is deployed: audit the URL.
- **This project, not deployed yet or with unreleased changes** — build it and audit the local production build, with `--base` set to the public origin so the report shows public addresses. Use the production build, not the dev server: dev servers add scripts and skip optimizations.

  Typical commands, from `package.json` scripts:
  - Next.js: `npm run build && npx next start -p 3456`
  - Astro, Vite, Eleventy and other static sites: `npm run build && npx --yes serve <out dir> -l 3456` (`dist`, `out`, `_site`, `build`)
  - Anything else: the project's own `build` and `start`

  Start the server in the background, wait until `curl -s -o /dev/null -w '%{http_code}' http://127.0.0.1:3456/` answers 200, and stop it when you are done.

If you do not know the public origin, ask; without `--base` sitemap and canonical checks compare against the wrong host.

## 2. Run the audit

Requires Node.js 22.18 or newer and access to the npm registry. If either is missing, say so and stop instead of guessing.

```bash
out="${TMPDIR:-/tmp}/site-audit"; mkdir -p "$out"
npx --yes search-auditor@latest <url> [--base https://example.com] --pages 20 --json --out "$out/seo.json" --fail-on never > /dev/null
node "${CLAUDE_PLUGIN_ROOT}/scripts/summarize.mjs" "$out/seo.json" --all
```

- `--pages all` audits every page in the sitemap; use it for small sites or when the user asks for everything. The default samples 20 pages across templates.
- `--lang ru` writes the report in Russian when the user writes in Russian; check IDs stay the same.
- Read the summary, not the raw JSON: the file is large. Open `$out/seo.json` only for a detail the summary leaves out (`findings[]` has `rule`, `level`, `where`, `message`, `why`, `fix`; `rules[]` has every check with its `status`).

## 3. Fix

Work from errors to warnings to notes. For each check, find where the site produces it — [fixes.md](fixes.md) maps every group to the usual place in the code — and fix it at the source: one template or layout fixes every page built from it.

Rules:

- **Fix in the code, never in the report.** Do not hide pages, silence checks or add `disable` to the config to raise the score.
- **Ask before changing what the site says or allows:** titles, descriptions and headings shown to people (propose the text), redirects of existing addresses, robots.txt rules, noindex on live pages.
- **Never invent data:** no fake ratings, prices, dates, authors or addresses in structured data.
- **«Not checked» is not «passed»:** checks of HTTPS, certificates, security headers and server speed need the live site and are skipped on a local build — say so instead of fixing blind.
- A note (`info`) is a recommendation; fix it when it is cheap, otherwise list it.

## 4. Check again and report

Rebuild, restart, run step 2 again and compare. Report in a few lines: the score before and after, what you changed (file and why), what is left and why — a decision for the user, a check that needs the live site, something outside this project (DNS, CDN, hosting). Then offer the `geo` skill for AI search.
