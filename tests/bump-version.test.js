import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync } from 'node:fs';

test('bumps every registered manifest in lockstep', () => {
  const registry = JSON.parse(readFileSync('.version-bump.json', 'utf8'));
  const before = registry.files.map(f => readFileSync(f.path, 'utf8'));
  try {
    execFileSync('node', ['scripts/bump-version.js', '9.9.9-test']);
    for (const f of registry.files) {
      const doc = JSON.parse(readFileSync(f.path, 'utf8'));
      const val = f.field.split('.').reduce((o, k) => o[k], doc);
      assert.equal(val, '9.9.9-test', `${f.path} ${f.field}`);
    }
  } finally {
    registry.files.forEach((f, i) => writeFileSync(f.path, before[i]));
  }
});
