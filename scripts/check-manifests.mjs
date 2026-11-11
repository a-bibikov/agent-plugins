#!/usr/bin/env node
// Every plugin ships two manifests and sits in two marketplaces, one set for Claude Code and one for Codex and other
// Agent Plugins clients. They must name the same plugins, and each plugin's manifests the same name, version and
// description: otherwise one agent installs an update the other never sees.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const read = (file) => JSON.parse(readFileSync(file, "utf8"));
const errors = [];
const names = (file) => read(file).plugins.map((p) => p.name).sort().join(", ");

const claudeMarket = names(".claude-plugin/marketplace.json");
const agentsMarket = names(".agents/plugins/marketplace.json");
if (claudeMarket !== agentsMarket) errors.push(`marketplaces list different plugins: Claude Code [${claudeMarket}], Codex [${agentsMarket}]`);

for (const dir of readdirSync("plugins")) {
  const portable = join("plugins", dir, "plugin.json");
  const claude = join("plugins", dir, ".claude-plugin", "plugin.json");
  for (const f of [portable, claude]) if (!existsSync(f)) errors.push(`${f} is missing`);
  if (!existsSync(portable) || !existsSync(claude)) continue;
  const a = read(portable);
  const b = read(claude);
  for (const key of ["name", "version", "description"]) if (a[key] !== b[key]) errors.push(`${dir}: ${key} differs: ${portable} «${a[key]}», ${claude} «${b[key]}»`);
  if (a.name !== dir) errors.push(`${dir}: the folder and the plugin name differ («${a.name}»)`);
  if (!a.$schema?.startsWith("https://agent-plugins.org/schemas/")) errors.push(`${portable}: no Agent Plugins $schema`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`manifests agree: ${agentsMarket}`);
