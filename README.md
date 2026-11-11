# claude-plugins

[Claude Code](https://code.claude.com) plugins by [Aleksandr Bibikov](https://albibikov.com). Add the marketplace once, then install any plugin from it:

```
/plugin marketplace add a-bibikov/claude-plugins
/plugin install site-audit@albibikov
```

## Plugins

| Plugin | What it does |
|---|---|
| [site-audit](plugins/site-audit) | Audits a site for classic search ([search-auditor](https://github.com/a-bibikov/search-auditor)) and AI search ([ai-search-auditor](https://github.com/a-bibikov/ai-search-audit)), fixes the findings in your code and runs the audit again. Skills: `/site-audit:seo`, `/site-audit:geo` |

## Adding a plugin

Each plugin lives in `plugins/<name>/` with its own `.claude-plugin/plugin.json` and README, and gets an entry in [.claude-plugin/marketplace.json](.claude-plugin/marketplace.json). Raise the plugin's `version` with every change: installed copies update only when it changes. The Validate workflow runs `claude plugin validate --strict` on the marketplace and every plugin.

## License

MIT © [Aleksandr Bibikov](https://albibikov.com)
