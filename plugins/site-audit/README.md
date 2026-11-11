# site-audit

A plugin for [Claude Code](https://code.claude.com), [Codex](https://developers.openai.com/codex) and other coding agents that audits a site for classic search and AI search and gives you a report of what to fix, where and why. It is read-only: it never changes your code, content or settings. You, your developers or your own agents make the fixes from the report.

- **`/site-audit:seo`** runs [search-auditor](https://github.com/a-bibikov/search-auditor): 80 checks of what keeps a site out of Google, Bing and Yandex — indexing, robots.txt, redirects, canonical, sitemap, titles, headings, links, images, structured data, hreflang, HTTPS.
- **`/site-audit:geo`** runs [ai-search-auditor](https://github.com/a-bibikov/ai-search-audit): 50 checks of what ChatGPT, Claude, Perplexity and AI Overviews read, understand and cite — AI agents in robots.txt, text without JavaScript, entities in JSON-LD, llms.txt, freshness, prompt injection.

You don't have to type the commands: ask the agent for an SEO audit, an AI search audit or why the site is not cited, and it picks the right skill.

## Install

Claude Code:

```
/plugin marketplace add a-bibikov/agent-plugins
/plugin install site-audit@albibikov
```

Codex:

```bash
codex plugin marketplace add a-bibikov/agent-plugins
codex plugin add site-audit@albibikov
```

In Codex the skills are `site-audit:seo` and `site-audit:geo`. The audit needs network access: if the sandbox blocks `npx`, allow it for that command.

Needs Node.js 22.18+ and access to the npm registry: the skills run the packages with `npx`, nothing else is installed.

## What it does

1. **Picks what to audit:** a live URL, or this project's production build started locally, with `--base` set to the public address.
2. **Runs the audit** and writes two reports: Markdown for people and JSON for agents and CI.
3. **Points at the source** when the site is built from the open project: the layout, the metadata, robots.txt, the sitemap or the JSON-LD component each finding comes from. It only reads the code.
4. **Delivers the report:** the score, every finding with why it matters and how to fix it, what needs your decision rather than a code change (texts people read, redirects, your policy on AI training crawlers), and the checks that only the live site can answer.

If you then ask it to fix something, it treats that as a separate task and waits for you to confirm it.

## Layout

```
plugin.json                       manifest for Codex and other Agent Plugins clients
.claude-plugin/plugin.json        manifest for Claude Code
skills/seo/SKILL.md               classic search: how to run the audit and report
skills/seo/references/fixes.md    where each group of checks comes from in the code
skills/geo/SKILL.md               AI search
skills/geo/references/fixes.md    where each group of checks comes from in the code
scripts/serve.mjs                 starts a local build in the background and waits until it answers
scripts/summarize.mjs             a JSON report → a short summary
```

## License

MIT © [Aleksandr Bibikov](https://albibikov.com)
