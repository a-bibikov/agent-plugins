---
description: Audits a website for AI search (ChatGPT, Claude, Perplexity, Gemini, Google AI Overviews) with ai-search-auditor — AI agents in robots.txt, text without JavaScript, who stands behind the site in JSON-LD, answer-first articles, llms.txt, freshness, prompt injection — then fixes what it finds in the site's code and runs the audit again. Use when asked for a GEO, AEO or AI SEO audit, about llms.txt, or why a site is not cited by AI assistants.
allowed-tools: Bash(npx --yes ai-search-auditor@latest *), Bash(node *scripts/serve.mjs*), Bash(node *scripts/summarize.mjs*), Bash(npm run build), Bash(mkdir -p *)
---

# AI search audit with ai-search-auditor

`ai-search-auditor` (npm) runs 56 checks of what AI search reads, understands and cites, and reports each finding with what is wrong, why it matters and how to fix it. Your job: run it, fix what can be fixed in this project, run it again, and report.

For classic search (Google, Bing, Yandex indexing) use the `seo` skill of this plugin; offer it at the end.

## 1. Decide what to audit

- **A live site** — the user gives a URL, or the project's site is deployed: audit the URL.
- **This project, not deployed yet or with unreleased changes** — build it and audit the local production build, with `--base` set to the public origin so the report shows public addresses. Use the production build, not the dev server.

  Typical commands (run each as its own command), from `package.json` scripts:
  - Next.js: `npm run build`, then `npx next start -p 3456`
  - Astro, Vite, Eleventy and other static sites: `npm run build`, then `npx --yes serve <out dir> -l 3456`
  - Anything else: the project's own `build` and `start`

  Start it with the plugin's script: one command that runs the server in the background, waits until it answers and prints `ready`. Do not write shell loops with `curl` and `sleep`: Claude Code's permission checks refuse them.

  ```bash
  node "${CLAUDE_PLUGIN_ROOT}/scripts/serve.mjs" start --port 3456 -- npx next start -p 3456
  ```

  Environment variables go after `--` as usual (`-- NEXT_PUBLIC_SITE_URL=https://example.com npx next start -p 3456`). If it prints the end of the server log instead of `ready`, the server failed: fix that first. When you are done: `node "${CLAUDE_PLUGIN_ROOT}/scripts/serve.mjs" stop --port 3456`.

A local build cannot show what a CDN or bot protection does to real AI agents (check BOT-3 on the live site).

## 2. Run the audit

Requires Node.js 22.18 or newer and access to the npm registry. If either is missing, say so and stop instead of guessing.

Run these as three separate commands, not joined with `;` or `&&`:

```bash
mkdir -p "${TMPDIR:-/tmp}/site-audit"
npx --yes ai-search-auditor@latest <url> [--base https://example.com] --pages 20 --json --out "${TMPDIR:-/tmp}/site-audit/geo.json" --fail-on never > /dev/null
node "${CLAUDE_PLUGIN_ROOT}/scripts/summarize.mjs" "${TMPDIR:-/tmp}/site-audit/geo.json" --all
```

- `--pages all` audits every page in the sitemap. `--lang ru` writes the report in Russian.
- To check only llms.txt and llms-full.txt: `npx --yes ai-search-auditor@latest llms-txt <url> --json --out "${TMPDIR:-/tmp}/site-audit/llms.json"`.
- Read the summary, not the raw JSON. Open `${TMPDIR:-/tmp}/site-audit/geo.json` only for a detail the summary leaves out.

## 3. Fix

Work from errors to warnings to notes. [fixes.md](fixes.md) maps every group to the usual place in the code. Fix at the source: one layout or one JSON-LD component fixes every page built from it.

Rules:

- **Fix in the code, never in the report.** Do not hide pages, silence checks or add `disable` to the config to raise the score.
- **Policy is the user's call.** Whether training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended…) may use the site (BOT-2, BOT-8) is a decision, not a bug: explain the trade-off and ask. Never block AI search agents (BOT-1, BOT-6) without being asked.
- **Never invent data:** no fake authors, `sameAs` profiles, dates, ratings or prices in JSON-LD. Ask for the real profiles and facts.
- **Ask before rewriting what the site says:** answer-first openings (ANS), conclusions and headings change the author's text — propose the wording.
- **Never add text addressed to AI** to pages, comments or llms.txt to steer answers (SAF): it is prompt injection and gets sites dropped. If the site already has such text, point it out and propose removing it.
- **llms.txt is optional.** Without it the LLM group is skipped and costs nothing; offer to create one, do not insist.
- **«Not checked» is not «passed»:** say which checks need the live site or content the site does not have.

## 4. Check again and report

Rebuild, restart, run step 2 again and compare. Report in a few lines: the score before and after, what you changed (file and why), what is left and why — a policy decision, text the author should write, a check that needs the live site. Then offer the `seo` skill for classic search.
