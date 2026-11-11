# site-audit

A [Claude Code](https://code.claude.com) plugin that audits a site for classic search and AI search, fixes what it finds in your code and checks again.

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
2. **Runs the audit** and reads a short summary of the JSON report: every check that found something, why it matters, how to fix it and where.
3. **Fixes at the source,** errors first: the layout, the metadata, robots.txt, the sitemap, the JSON-LD component. It asks before it changes text people read, redirects, robots.txt rules or your policy on AI training crawlers, and it never invents data such as ratings, authors or profiles.
4. **Runs the audit again** and tells you the score before and after, what changed and what is left — including checks that only the live site can answer.

## Layout

```
.claude-plugin/plugin.json
skills/seo/SKILL.md, fixes.md     classic search: how to run, where each group is fixed
skills/geo/SKILL.md, fixes.md     AI search
scripts/summarize.mjs             a JSON report → a short list to work from
```

## License

MIT © [Aleksandr Bibikov](https://albibikov.com)
