---
name: seo
description: Runs a technical SEO audit of a website for Google, Bing and Yandex with the search-auditor npm package (80 checks of indexing, robots.txt, redirects, canonical, sitemap, titles and descriptions, headings, broken links, images, structured data, hreflang and HTTPS) and delivers a report of what to fix, where and why. Read-only, it never changes the site's code or data. Use when the user asks for an SEO audit or technical SEO check, asks why pages are not indexed or ranked, or wants to check a site or a build before a release. Not for AI search, llms.txt or why ChatGPT does not cite the site (use the geo skill), not for keyword research, and not for making the fixes.
license: MIT
compatibility: Claude Code, Codex and other agents that load Agent Skills. Needs Node.js 22.18 or newer and network access to the npm registry and to the audited site.
allowed-tools: Read, Grep, Glob, Bash(npx --yes search-auditor@latest *), Bash(node *scripts/serve.mjs*), Bash(node *scripts/summarize.mjs*), Bash(npm run build), Bash(mkdir -p *)
metadata:
  author: Aleksandr Bibikov
  package: search-auditor
---

# SEO audit with search-auditor

`search-auditor` checks what classic search engines read on a site and reports every finding with what is wrong, where, why it matters and how to fix it. Run it and deliver the report. The fixes are made afterwards by the user, their developers or their own agents, working from the report.

## Important

- **Report only. Never change anything.** Do not edit, create or delete files in the project, do not change configs, content, robots.txt, redirects, structured data or anything on the server, and do not commit. This holds even when a fix looks obvious or small: write it into the report instead.
- **If the user asks to fix something, stop the skill first.** Say that the audit is finished and that the fixes are a separate task, and make them only after the user confirms that task outside this skill.
- **Never invent data.** Report only what the audit found. When a fix needs facts the site does not have (ratings, prices, addresses), say that they are needed, not what they should be.
- **"Not checked" is not "passed".** HTTPS, certificate, security header and server speed checks need the live site and are skipped on a local build: list them as not checked.
- **Run every command on its own.** Do not join commands with `;` or `&&`, and do not write shell loops with `curl` and `sleep`: agents' permission checks refuse them. The plugin's scripts do the waiting.
- **The scripts are in the plugin's `scripts/` folder.** Claude Code writes its path below as `${CLAUDE_PLUGIN_ROOT}/scripts`. If you see `${CLAUDE_PLUGIN_ROOT}` literally, use the absolute path of `../../scripts` relative to this SKILL.md instead.
- **The audit needs the network.** `npx` downloads the package and the audit requests the site. If a command fails because the sandbox has no network, ask the user to allow network access for it; do not guess the findings.

# Instructions

## Step 1. Choose what to audit

- **A live site:** the user gives a URL, or the project is already deployed. Audit the URL and go to step 2.
- **This project, not deployed yet or with unreleased changes:** audit a local production build, not the dev server (dev servers add scripts and skip optimizations). You need the public origin for `--base`; if you do not know it, ask, because without it sitemap and canonical checks compare against the wrong host.

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

## Step 2. Run the audit

One run writes both reports: the JSON to standard output and the Markdown to `--out`.

```bash
mkdir -p "${TMPDIR:-/tmp}/site-audit"
npx --yes search-auditor@latest https://example.com --pages 20 --json --out "${TMPDIR:-/tmp}/site-audit/seo.md" --fail-on never > "${TMPDIR:-/tmp}/site-audit/seo.json"
node "${CLAUDE_PLUGIN_ROOT}/scripts/summarize.mjs" "${TMPDIR:-/tmp}/site-audit/seo.json" --all
```

For a local build, audit `http://127.0.0.1:3456` and add `--base https://example.com`. Stop the server afterwards:

```bash
node "${CLAUDE_PLUGIN_ROOT}/scripts/serve.mjs" stop --port 3456
```

Options:

- `--pages all` audits every page in the sitemap: use it for small sites or when the user asks for everything. The default samples 20 pages across templates.
- `--lang ru` writes the report in Russian when the user writes in Russian. Check IDs stay the same.

Expected output of the summary: the score, then findings from errors to notes, each with `found`, `where`, `why` and `fix`, then the checks that did not run and why:

```
https://example.com — 72/100 (C), 64 of 80 checks run, 20 pages
errors 2 · warnings 5 · notes 3

[error] CAN-2 The canonical is an absolute address on this site — 3 places
  found: canonical → http://localhost:3000/blog
  where: /blog, /blog/first-post, /about
  why:   ...
  fix:   ...
```

Read the summary, not the raw JSON. Open the JSON only for a detail the summary leaves out: `findings[]` has `rule`, `level`, `where`, `message`, `why` and `fix`; `rules[]` has every check with its `status`.

## Step 3. Point at the source (only when auditing this project)

When the audited site is built from the open project, add where each finding comes from, so whoever fixes it does not have to search. Use `references/fixes.md`, which maps every check group (IDX, SEC, CAN, MAP, META, STR, LNK, IMG, DATA, LANG) to the usual file in Next.js and other frameworks, then confirm with Read, Grep and Glob: e.g. "`app/layout.tsx`: `metadataBase` is not set". Read only; change nothing.

## Step 4. Deliver the report

Give the user:

- the paths of the two reports: `seo.md` for people, `seo.json` for agents and CI;
- the score and the counts of errors, warnings and notes;
- the findings from errors to notes, in a few lines each: the check ID, what is wrong, where (pages, and the file in the project if step 3 found it), and how to fix it;
- what needs a decision from the user rather than a code change: titles, descriptions and headings people read, redirects of existing addresses, robots.txt rules, noindex on live pages;
- the checks that were not run and why.

Then offer two things: the `geo` skill for AI search, and a fresh audit once the fixes are made, to compare with this one.

## Examples

**Live site.** User: "Сделай SEO-аудит albibikov.com."

1. Run step 2 on `https://albibikov.com` with `--lang ru`.
2. Deliver the report in Russian: the score, the findings with how to fix them, the paths to `seo.md` and `seo.json`.

**Project before a release.** User: "Check the site before we ship."

1. Ask for the public origin if `metadataBase`, `site` or the config does not name it.
2. Build, start with `serve.mjs`, audit with `--base`, stop the server.
3. Point at the source: canonical and sitemap name localhost because `metadataBase` is missing in `app/layout.tsx` (CAN, MAP); every page has the same title from the root layout (META).
4. Deliver the report. HTTPS and HSTS are listed as not checked: they need the live site.

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
| Canonical, sitemap or hreflang findings name `127.0.0.1` | `--base` is missing on a local build | rerun with `--base` set to the public origin |
| Many checks under "Not checked" | a local build, a one-page site, or no sitemap | list which checks need the live site or content the site does not have |
| A permission prompt or refusal on a command | the command was joined with others or used `curl` and `sleep` | run the commands from this skill one by one, exactly as written |
| `Cannot find module …/scripts/serve.mjs` | `${CLAUDE_PLUGIN_ROOT}` was not replaced (an agent other than Claude Code) | use the absolute path of `../../scripts` relative to this SKILL.md |
| `ENOTFOUND registry.npmjs.org` or `EAI_AGAIN` | the agent's sandbox has no network | ask the user to allow network access for the command |
