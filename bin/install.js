#!/usr/bin/env node
import { cpSync, mkdirSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const BANNER = [
  '    _    ____ _____ _   _ _____      _    ____ ___ _     _____ ',
  '   / \\  / ___| ____| \\ | |_   _|    / \\  / ___|_ _| |   | ____|',
  '  / _ \\| |  _|  _| |  \\| | | |     / _ \\| |  _ | || |   |  _|  ',
  ' / ___ \\ |_| | |___| |\\  | | |    / ___ \\ |_| || || |___| |___ ',
  '/_/   \\_\\____|_____|_| \\_| |_|   /_/   \\_\\____|___|_____|_____|',
  '',
  "  decide if it's the right thing - then build it right, cheaper",
  ''
].join('\n');

const src = join(dirname(fileURLToPath(import.meta.url)), '..');
const args = process.argv.slice(2);
console.log(BANNER);
const has = f => args.includes(f);
const destFlag = args.indexOf('--dest');

// --global is the default (absence of --local); accepted for docs symmetry.
if (has('--opencode')) console.log('OpenCode reads Claude skill paths natively - installing to Claude paths.');
const harnesses = new Set();
if (has('--codex')) harnesses.add('codex');
if (has('--claude') || has('--opencode') || harnesses.size === 0) harnesses.add('claude');
const local = has('--local');
const roots = destFlag !== -1 ? [args[destFlag + 1]]
  : [...harnesses].map(h => h === 'codex'
    ? (local ? join(process.cwd(), '.agents') : join(homedir(), '.agents'))
    : (local ? join(process.cwd(), '.claude') : join(homedir(), '.claude')));

const jobs = [];
for (const root of roots) {
  for (const skill of readdirSync(join(src, 'skills')))
    jobs.push([join(src, 'skills', skill), join(root, 'skills', skill)]);
  for (const agent of readdirSync(join(src, 'agents')))
    jobs.push([join(src, 'agents', agent), join(root, 'agents', agent)]);
  jobs.push([join(src, 'playbooks'), join(root, 'agent-agile', 'playbooks')]);
  jobs.push([join(src, 'scripts'), join(root, 'agent-agile', 'scripts')]);
}

for (const [from, to] of jobs) {
  console.log(`${has('--dry-run') ? '[dry-run] ' : ''}${from} -> ${to}`);
  if (!has('--dry-run')) { mkdirSync(dirname(to), { recursive: true }); cpSync(from, to, { recursive: true }); }
}
console.log(has('--dry-run') ? 'Dry run - nothing written.' : `Installed agent-agile to ${roots.join(', ')}. Run /aa-help to start.`);
