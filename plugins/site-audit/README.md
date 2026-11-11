# site-audit

A [Claude Code](https://code.claude.com) plugin that audits a site for classic search and AI search and gives you a report of what to fix, where and why. It is read-only: it never changes your code, content or settings. You, your developers or your own agents make the fixes from the report.

- **`/site-audit:seo`** runs [search-auditor](https://github.com/a-bibikov/search-auditor): 80 checks of what keeps a site out of Google, Bing and Yandex — indexing, robots.txt, redirects, canonical, sitemap, titles, headings, links, images, structured data, hreflang, HTTPS.
- **`/site-audit:geo`** runs [ai-search-auditor](https://github.com/a-bibikov/ai-search-audit): 56 checks of what ChatGPT, Claude, Perplexity and AI Overviews read, understand and cite — AI agents in robots.txt, text without JavaScript, entities in JSON-LD, answer-first articles, llms.txt, freshness, prompt injection.

You don't have to type the commands: ask Claude for an SEO audit, an AI search audit or why the site is not cited, and it picks the right skill.

## Install

```
/plugin marketplace add a-bibikov/claude-plugins
/plugin install site-audit@albibikov
```

Needs Node.js 22.18+ and access to the npm registry: the skills run the packages with `npx`, nothing else is installed.

## What it does

1. **Picks what to audit:** a live URL, or this project's production build started locally, with `--base` set to the public address.
2. **Runs the audit** and writes two reports: Markdown for people and JSON for agents and CI.
3. **Points at the source** when the site is built from the open project: the layout, the metadata, robots.txt, the sitemap or the JSON-LD component each finding comes from. It only reads the code.
4. **Delivers the report:** the score, every finding with why it matters and how to fix it, what needs your decision rather than a code change (texts people read, redirects, your policy on AI training crawlers), and the checks that only the live site can answer.

If you then ask it to fix something, it treats that as a separate task and waits for you to confirm it.

## Layout

```
.claude-plugin/plugin.json
skills/seo/SKILL.md               classic search: how to run the audit and report
skills/seo/references/fixes.md    where each group of checks comes from in the code
skills/geo/SKILL.md               AI search
skills/geo/references/fixes.md    where each group of checks comes from in the code
scripts/serve.mjs                 starts a local build in the background and waits until it answers
scripts/summarize.mjs             a JSON report → a short summary
```

## License

MIT © [Aleksandr Bibikov](https://albibikov.com)
