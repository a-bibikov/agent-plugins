# site-audit

**Find out why a site is not in Google or not cited by ChatGPT, without leaving your coding agent.** Ask Claude Code or Codex for an audit, and you get a report of what to fix, where in your code and why. Nothing on the site or in the code is changed.

```
> Check the site before we ship

SEO: 72/100 (C), 64 of 80 checks run, 20 pages · errors 2 · warnings 5 · notes 3

[error] CAN-2 The canonical is an absolute address on this site — 3 pages
  found: canonical → http://localhost:3000/blog
  source: app/layout.tsx, metadataBase is not set
  fix:   set metadataBase to https://example.com in the root layout

Not checked on a local build: HTTPS, HSTS, security headers (need the live site)
Reports: seo.md for people, seo.json for agents and CI
```

## Who it is for

- **Developers** who want to check a site before a release, the way they run tests: on the production build, before it goes live.
- **Site owners and marketers** who ask «why are we not in search» or «why does ChatGPT not mention us» and want an answer they can hand to developers.
- **Agencies and freelancers** who audit client sites and need a report with the exact file and fix for each problem.

## What it checks

Two skills, each running an open-source npm package:

| Skill | Question it answers | Package |
|---|---|---|
| **seo** | Can Google, Bing and Yandex reach, index and show the site? Status codes, robots.txt, redirects, canonical, sitemap, titles and descriptions, headings, broken links, images, structured data, hreflang, HTTPS. | [search-auditor](https://github.com/a-bibikov/search-auditor), 80 checks |
| **geo** | Can ChatGPT, Claude, Perplexity and Google AI Overviews read, understand and cite the site? AI agents in robots.txt, text without JavaScript, who stands behind the site in JSON-LD, `llms.txt`, freshness, text aimed at AI. | [ai-search-auditor](https://github.com/a-bibikov/ai-search-audit), 50 checks |

You don't have to remember the names. Ask in plain words — «SEO audit of example.com», «why does ChatGPT not cite my blog», «check the site before release» — and the agent picks the skill. In Claude Code you can also call them as `/site-audit:seo` and `/site-audit:geo`.

## How it works

1. **Picks what to audit:** a live URL, or the open project's production build, started locally and checked as if it were already on its public address.
2. **Runs the audit** and writes two reports: Markdown for people, JSON for agents and CI.
3. **Points at the source:** when the site is built from the open project, each finding gets the file it comes from — the layout, the metadata, robots.txt, the sitemap, the JSON-LD component. It only reads the code.
4. **Reports:** the score, every finding with why it matters and how to fix it, what is your decision rather than a code change (texts people read, redirects, whether AI training crawlers may use the site), and the checks only the live site can answer.

## Report only

The plugin never edits files, configs, content or server settings, and never commits. The fixes are made by you, your developers or your own agents, from the report. If you ask it to fix something, it treats that as a separate task and waits for you to confirm it.

It also does not invent anything: a check that could not run is listed as «not checked» with the reason, never as passed, and facts only you have (authors, profiles, prices) are listed as needed, not made up.

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

Needs Node.js 22.18+ and network access: the skills run the packages with `npx` and request the site. In Codex, allow network access when it asks. Nothing else is installed.

## Without an agent

The packages work on their own, in a terminal or in CI:

```bash
npx search-auditor https://example.com
npx ai-search-auditor https://example.com
```

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
