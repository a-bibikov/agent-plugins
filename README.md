# agent-plugins

Plugins for coding agents by [Aleksandr Bibikov](https://albibikov.com): [Claude Code](https://code.claude.com), [Codex](https://developers.openai.com/codex) and other clients of the Agent Plugins standard. Add the marketplace once, then install any plugin from it.

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

## Plugins

| Plugin | What it does |
|---|---|
| [site-audit](plugins/site-audit) | Why a site is not in Google or not cited by ChatGPT: audits it for classic search ([search-auditor](https://github.com/a-bibikov/search-auditor)) and AI search ([ai-search-auditor](https://github.com/a-bibikov/ai-search-audit)) and reports what to fix, in which file of your project and why. Read-only: the fixes stay with you. Skills: `site-audit:seo`, `site-audit:geo` |

## Adding a plugin

Each plugin lives in `plugins/<name>/` with its skills in `skills/<skill>/SKILL.md`, a README and two manifests with the same name, version and description:

- `plugin.json`: Agent Plugins for Codex and other clients, with Codex's card under `extensions.com.openai`;
- `.claude-plugin/plugin.json`: Claude Code.

It also gets an entry in both marketplaces: [.agents/plugins/marketplace.json](.agents/plugins/marketplace.json) (Codex) and [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json) (Claude Code).

Raise `version` in both manifests with every change: installed copies update only when it changes. Skills refer to bundled scripts as `${CLAUDE_PLUGIN_ROOT}/scripts/…` and tell other agents the relative path, since only Claude Code fills that variable in. The Validate workflow runs `claude plugin validate --strict`, checks that the manifests agree, and installs every plugin in Codex.

## License

MIT © [Aleksandr Bibikov](https://albibikov.com)
