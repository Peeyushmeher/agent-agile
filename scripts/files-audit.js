#!/usr/bin/env node
// Wave 2 reality check: diff the actual changed files against declared card
// ownership and reported files_touched, so an edit a worker omitted from its
// report cannot hide. Run from the repo root before committing the wave's work
// (or pass an explicit base ref as the second argument).
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';

const epicDir = process.argv[2];
if (!epicDir) { console.error('usage: files-audit.js <epic-dir> [base-ref]'); process.exit(2); }
const baseRef = process.argv[3] ?? 'HEAD';

const storiesDir = join(epicDir, 'stories');
const entries = readdirSync(storiesDir);
const cards = entries.filter(f => /^S\d+.*\.md$/.test(f) && !f.endsWith('.report.md'));
const reports = entries.filter(f => f.endsWith('.report.md'));

const owned = new Set();
for (const card of cards) {
  const m = readFileSync(join(storiesDir, card), 'utf8').match(/```files\n([\s\S]*?)```/);
  if (!m) continue;
  for (const line of m[1].split('\n').map(s => s.trim()).filter(Boolean)) owned.add(line);
}

const reported = new Set();
for (const report of reports) {
  const m = readFileSync(join(storiesDir, report), 'utf8').match(/files_touched:\n((?:\s+-\s+.*\n?)*)/);
  if (!m) continue;
  for (const line of m[1].split('\n')) {
    const f = line.replace(/^\s+-\s+/, '').trim();
    if (f) reported.add(f);
  }
}

const git = cmd => execSync(cmd, { encoding: 'utf8' }).split('\n').map(s => s.trim()).filter(Boolean);
const changed = new Set([
  ...git(`git diff --name-only ${baseRef}`),
  ...git('git ls-files --others --exclude-standard'),
]);

// ponytail: planning artifacts (reports, STATE, DEMO) are legitimate wave writes, not code
const code = [...changed].filter(f => !f.startsWith('.planning/') && !f.startsWith('.planning\\'));

const unowned = code.filter(f => !owned.has(f)).sort();
const unreported = code.filter(f => !reported.has(f)).sort();

if (unowned.length || unreported.length) {
  console.log(JSON.stringify({ ok: false, unowned, unreported }));
  process.exit(1);
}
console.log(JSON.stringify({ ok: true }));
