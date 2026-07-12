#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const epicDir = process.argv[2];
if (!epicDir) { console.error('usage: collision-check.js <epic-dir>'); process.exit(2); }

const storiesDir = join(epicDir, 'stories');
const cards = readdirSync(storiesDir)
  .filter(f => /^S\d+.*\.md$/.test(f) && !f.endsWith('.report.md'));

const owners = new Map(); // file path -> [story names]
for (const card of cards) {
  const body = readFileSync(join(storiesDir, card), 'utf8');
  const m = body.match(/```files\n([\s\S]*?)```/);
  if (!m) continue;
  for (const line of m[1].split('\n').map(s => s.trim()).filter(Boolean)) {
    if (!owners.has(line)) owners.set(line, []);
    owners.get(line).push(card);
  }
}

const collisions = [...owners.entries()]
  .filter(([, s]) => s.length > 1)
  .map(([file, stories]) => ({ file, stories: stories.sort() }));

if (collisions.length) { console.log(JSON.stringify({ ok: false, collisions })); process.exit(1); }
console.log(JSON.stringify({ ok: true }));
