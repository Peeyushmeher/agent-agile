import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('installs skills, agents, playbooks into dest', () => {
  const dest = mkdtempSync(join(tmpdir(), 'aa-install-'));
  execFileSync('node', ['bin/install.js', '--claude', '--dest', dest]);
  assert.ok(existsSync(join(dest, 'skills', 'aa-grill', 'SKILL.md')));
  assert.ok(existsSync(join(dest, 'agents', 'aa-worker.md')));
  assert.ok(existsSync(join(dest, 'agent-agile', 'playbooks', 'system.md')));
});

test('dry-run writes nothing', () => {
  const dest = mkdtempSync(join(tmpdir(), 'aa-dry-'));
  const out = execFileSync('node', ['bin/install.js', '--claude', '--dest', dest, '--dry-run'], { encoding: 'utf8' });
  assert.match(out, /skills[\\/]aa-grill/);
  assert.ok(!existsSync(join(dest, 'skills')));
});
