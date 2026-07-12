import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

test('generates codex manifests mirroring claude manifests', () => {
  execFileSync('node', ['scripts/gen-codex-manifests.js']);
  const claude = JSON.parse(readFileSync('.claude-plugin/plugin.json', 'utf8'));
  const codex = JSON.parse(readFileSync('.codex-plugin/plugin.json', 'utf8'));
  assert.equal(codex.name, claude.name);
  assert.equal(codex.version, claude.version);
  assert.equal(codex.skills, './skills/');
  const mkt = JSON.parse(readFileSync('.agents/plugins/marketplace.json', 'utf8'));
  assert.equal(mkt.plugins[0].name, claude.name);
});
