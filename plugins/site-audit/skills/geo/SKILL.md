---
name: geo
description: Runs an AI search (GEO, AEO) audit of a website for ChatGPT, Claude, Perplexity, Gemini and Google AI Overviews with the ai-search-auditor npm package (50 checks of AI agents in robots.txt, text without JavaScript, who stands behind the site in JSON-LD, llms.txt, freshness and prompt injection) and delivers a report of what to fix, where and why. Read-only, it never changes the site's code or data. Use when the user asks for a GEO, AEO or AI SEO audit, asks about llms.txt or AI crawlers such as GPTBot and ClaudeBot, or asks why AI assistants do not cite or find the site. Not for classic Google indexing, canonical, sitemap or broken links (use the seo skill), and not for making the fixes.
license: MIT
compatibility: Claude Code, Codex and other agents that load Agent Skills. Needs Node.js 22.18 or newer and network access to the npm registry and to the audited site.
allowed-tools: Read, Grep, Glob, Bash(npx --yes ai-search-auditor@latest *), Bash(node *scripts/serve.mjs*), Bash(node *scripts/summarize.mjs*), Bash(npm run build), Bash(mkdir -p *)
metadata:
  author: Aleksandr Bibikov
  package: ai-search-auditor
---

# AI search audit with ai-search-auditor

`ai-search-auditor` checks what AI search reads, understands and cites on a site, and reports every finding with what is wrong, where, why it matters and how to fix it. Run it and deliver the report. The fixes are made afterwards by the user, their developers or their own agents, working from the report.

## Important

- **Report only. Never change anything.** Do not edit, create or delete files in the project, do not change configs, content, robots.txt, llms.txt, JSON-LD, CDN or bot protection settings, and do not commit. This holds even when a fix looks obvious or small: write it into the report instead.
- **If the user asks to fix something, stop the skill first.** Say that the audit is finished and that the fixes are a separate task, and make them only after the user confirms that task outside this skill.
- **Policy is the user's call.** Whether training crawlers (GPTBot, ClaudeBot, CCBot, Google-Extended…) may use the site (BOT-2, BOT-8) is a decision, not a bug: in the report, explain the trade-off and leave the choice to the user. Never recommend blocking AI search agents (BOT-1, BOT-6).
- **Never invent data.** When a fix needs facts the site does not have (authors, `sameAs` profiles, dates, prices), say that they are needed, not what they should be.
- **Never recommend text addressed to AI** in pages, comments or llms.txt to steer answers (SAF): it is prompt injection and gets sites dropped. If the site already has such text, report it.
- **llms.txt is optional.** Without it the LLM group is skipped and costs nothing. Mention it as an option, not as a failure.
- **"Not checked" is not "passed".** List the checks that need the live site or content the site does not have.
- **Run every command on its own.** Do not join commands with `;` or `&&`, and do not write shell loops with `curl` and `sleep`: agents' permission checks refuse them. The plugin's scripts do the waiting.
- **The scripts are in the plugin's `scripts/` folder.** Claude Code writes its path below as `${CLAUDE_PLUGIN_ROOT}/scripts`. If you see `${CLAUDE_PLUGIN_ROOT}` literally, use the absolute path of `../../scripts` relative to this SKILL.md instead.
- **The audit needs the network.** `npx` downloads the package and the audit requests the site. If a command fails because the sandbox has no network, ask the user to allow network access for it; do not guess the findings.

# Instructions

## Step 1. Choose what to audit

- **A live site:** the user gives a URL, or the project is already deployed. Audit the URL and go to step 2.
- **This project, not deployed yet or with unreleased changes:** audit a local production build, not the dev server, with `--base` set to the public origin so the report shows public addresses. If you do not know the origin, ask.

Building writes only the build output, not the project's code. If the build fails, report the error and stop: do not fix the build.

Build, then start the server with the plugin's script. It runs the server in the background, waits until it answers and prints `ready`:

```bash
npm run build
node "${CLAUDE_PLUGIN_ROOT}/scripts/serve.mjs" start --port 3456 -- npx next start -p 3456
```

The command after `--` is the project's own start command:

| Project | Start command |
|---|---|
| Next.js | `npx next start -p 3456` |
| Astro, Vite, Eleventy, other static output | `npx --yes serve dist -l 3456` (or `out`, `_site`, `build`) |
| Anything else | the `start` script from `package.json`, on port 3456 |

Environment variables go after `--` as usual: `-- NEXT_PUBLIC_SITE_URL=https://example.com npx next start -p 3456`.

Expected output:

```
ready 200 http://127.0.0.1:3456/
```

A local build cannot show what a CDN or bot protection does to real AI agents: BOT-3 needs the live site.

## Step 2. Run the audit

One run writes both reports: the JSON to standard output and the Markdown to `--out`.

```bash
mkdir -p "${TMPDIR:-/tmp}/site-audit"
npx --yes ai-search-auditor@latest https://example.com --pages 20 --json --out "${TMPDIR:-/tmp}/site-audit/geo.md" --fail-on never > "${TMPDIR:-/tmp}/site-audit/geo.json"
node "${CLAUDE_PLUGIN_ROOT}/scripts/summarize.mjs" "${TMPDIR:-/tmp}/site-audit/geo.json" --all
```

For a local build, audit `http://127.0.0.1:3456` and add `--base https://example.com`. Stop the server afterwards:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/serve.mjs" stop --port 3456
```

Options:

- `--pages all` audits every page in the sitemap.
- `--lang ru` writes the report in Russian when the user writes in Russian. Check IDs stay the same.
- To check only llms.txt and llms-full.txt: `npx --yes ai-search-auditor@latest llms-txt https://example.com --json --out "${TMPDIR:-/tmp}/site-audit/llms.md" > "${TMPDIR:-/tmp}/site-audit/llms.json"`.

Expected output of the summary: the score, then findings from errors to notes, each with `found`, `where`, `why` and `fix`, then the checks that did not run and why:

```
https://example.com — 65/100 (D), 38 of 50 checks run, 20 pages
errors 1 · warnings 2 · notes 2

[error] ENT-1 The author or company is a defined entity — 1 place
  found: No Person or Organization with name and url in JSON-LD on any audited page
  where: site
  why:   AI search cannot tell who stands behind the site, so it trusts it less.
  fix:   Add JSON-LD Person (or Organization) to the home or about page with a stable `@id` ...
```

Read the summary, not the raw JSON. Open the JSON only for a detail the summary leaves out.

## Step 3. Point at the source (only when auditing this project)

When the audited site is built from the open project, add where each finding comes from, so whoever fixes it does not have to search. Use `references/fixes.md`, which maps every check group (BOT, TXT, ENT, LLM, UPD, SAF) to the usual place in the code, then confirm with Read, Grep and Glob: e.g. "`components/JsonLd.tsx`: the Person has no `@id`". Read only; change nothing.

## Step 4. Deliver the report

Give the user:

- the paths of the two reports: `geo.md` for people, `geo.json` for agents and CI;
- the score and the counts of errors, warnings and notes;
- the findings from errors to notes, in a few lines each: the check ID, what is wrong, where (pages, and the file in the project if step 3 found it), and how to fix it;
- what needs a decision from the user rather than a code change: the policy on training crawlers, facts only the user has (profiles, authors, `sameAs` links);
- what is outside the code: CDN and bot protection settings (BOT-3);
- the checks that were not run and why.

Then offer two things: the `seo` skill for classic search, and a fresh audit once the fixes are made, to compare with this one.

## Examples

**Why AI does not cite the site.** User: "Почему ChatGPT не цитирует мой блог?"

1. Run step 2 on the live URL with `--lang ru`.
2. Deliver the report in Russian. For example: BOT-3, ChatGPT-User gets 403 from the CDN's bot protection, so the setting to change is in the CDN, not in the code; TXT-1, the articles render only in the browser and need server rendering.

**Before a release.** User: "Check the site for AI search before we ship."

1. Build, start with `serve.mjs`, audit with `--base`, stop the server.
2. Point at the source: the Person in the root layout has no `@id` and articles do not point at it (ENT-1, ENT-2); there is no `og:image` in the shared metadata (ENT-4).
3. Deliver the report, with the training crawler policy and the author's profiles listed as the user's decisions, and BOT-3 as not checked.

**The user asks to fix it.** User: "Ok, fix all of that."

The audit is done; fixing is a separate task. Say so, and start making changes only once the user confirms that task.

## Troubleshooting

| Problem | Cause | Solution |
|---|---|---|
| The build fails | an error in the project | report the error and stop; do not fix it |
| `serve.mjs` prints the end of the log instead of `ready` | the start command failed or the build is missing | report the log lines it printed; check the command after `--` |
| `port 3456 is already answering` | a server from an earlier run is still up | `serve.mjs stop --port 3456`, or pick another port in both places |
| `ENOENT` when writing the report | the folder for the reports does not exist | run the `mkdir -p` command from step 2 first |
| `npx` fails, or `Unsupported engine` | Node.js older than 22.18, or no access to the npm registry | say so and stop; do not guess the findings |
| The whole LLM group is under "Not checked" | the site has no llms.txt | expected; mention llms.txt as an option, not as a failure |
| BOT-3 passes locally but AI agents are blocked in real life | a CDN or bot protection sits in front of the live site | audit the live URL; the fix is in the CDN or hosting settings |
| A permission prompt or refusal on a command | the command was joined with others or used `curl` and `sleep` | run the commands from this skill one by one, exactly as written |
| `Cannot find module …/scripts/serve.mjs` | `${CLAUDE_PLUGIN_ROOT}` was not replaced (an agent other than Claude Code) | use the absolute path of `../../scripts` relative to this SKILL.md |
| `ENOTFOUND registry.npmjs.org` or `EAI_AGAIN` | the agent's sandbox has no network | ask the user to allow network access for the command |
