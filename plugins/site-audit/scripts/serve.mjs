#!/usr/bin/env node
// Starts a local production server for the audit in the background, waits until it answers, and stops it later.
// One command instead of a shell loop with curl and sleep, which Claude Code's permission checks often refuse.
//
//   node serve.mjs start [--port 3456] [--timeout 180] -- <command to start the server>
//   node serve.mjs stop  [--port 3456]
//
// The command runs in a shell, so `NEXT_PUBLIC_SITE_URL=https://example.com npx next start -p 3456` works as is.
// start prints `ready <status> http://127.0.0.1:<port>/` and exits 0, leaving the server running;
// on a crash or timeout it prints the end of the server log and exits 1. The log and pid live in the temp folder.
import { spawn, execFileSync } from 'node:child_process';
import { openSync, readFileSync, writeFileSync, rmSync, existsSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const usage = 'usage: node serve.mjs start [--port 3456] [--timeout 180] -- <command>\n       node serve.mjs stop [--port 3456]';
const argv = process.argv.slice(2);
const action = argv.shift();
const dash = argv.indexOf('--');
const opts = dash === -1 ? argv : argv.slice(0, dash);
const command = dash === -1 ? [] : argv.slice(dash + 1);
const opt = (name, fallback) => {
  const i = opts.indexOf(`--${name}`);
  return i === -1 ? fallback : Number(opts[i + 1]);
};
const port = opt('port', 3456);
const timeout = opt('timeout', 180);
if (!Number.isInteger(port) || !(timeout > 0)) fail(usage, 2);

const dir = join(tmpdir(), 'site-audit');
mkdirSync(dir, { recursive: true });
const pidFile = join(dir, `server-${port}.pid`);
const logFile = join(dir, `server-${port}.log`);
const url = `http://127.0.0.1:${port}/`;
const self = `node "${process.argv[1]}"`;

if (action === 'stop') {
  stop();
  console.log(`stopped ${url}`);
} else if (action === 'start') {
  if (!command.length) fail(usage, 2);
  if (await status()) fail(`port ${port} is already answering: stop that server first (${self} stop --port ${port}) or pick another port`);
  const log = openSync(logFile, 'w');
  const child = spawn(command.join(' '), {
    shell: true,
    detached: process.platform !== 'win32',
    stdio: ['ignore', log, log],
    windowsHide: true,
  });
  writeFileSync(pidFile, String(child.pid));
  let exited = null;
  child.on('exit', (code, signal) => { exited = signal ?? code; });
  child.unref();

  const deadline = Date.now() + timeout * 1000;
  while (Date.now() < deadline) {
    if (exited !== null) fail(`the server exited (${exited}) before answering\n${tail()}`);
    const code = await status();
    if (code) {
      console.log(`ready ${code} ${url}\nlog: ${logFile}\nstop: ${self} stop --port ${port}`);
      process.exit(0);
    }
    await new Promise((r) => setTimeout(r, 500));
  }
  stop();
  fail(`no answer from ${url} in ${timeout} s\n${tail()}`);
} else {
  fail(usage, 2);
}

// Any HTTP answer below 500 means the server is up (a redirect or a 404 home page is the audit's business).
async function status() {
  try {
    const res = await fetch(url, { redirect: 'manual', signal: AbortSignal.timeout(3000) });
    return res.status < 500 ? res.status : 0;
  } catch {
    return 0;
  }
}

function stop() {
  if (!existsSync(pidFile)) return;
  const pid = Number(readFileSync(pidFile, 'utf8'));
  rmSync(pidFile, { force: true });
  try {
    if (process.platform === 'win32') execFileSync('taskkill', ['/pid', String(pid), '/T', '/F'], { stdio: 'ignore' });
    else process.kill(-pid, 'SIGTERM'); // the whole group: npx, the shell and the server under it
  } catch {
    // already gone
  }
}

function tail() {
  try {
    return readFileSync(logFile, 'utf8').trim().split('\n').slice(-20).join('\n');
  } catch {
    return '';
  }
}

function fail(message, code = 1) {
  console.error(message);
  process.exit(code);
}
