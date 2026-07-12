import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

function makeEpic(stories) {
  const dir = mkdtempSync(join(tmpdir(), 'aa-epic-'));
  mkdirSync(join(dir, 'stories'));
  for (const [name, files] of Object.entries(stories)) {
    writeFileSync(join(dir, 'stories', name),
      `# ${name}\n**Files it owns:**\n\`\`\`files\n${files.join('\n')}\n\`\`\`\n`);
  }
  return dir;
}

test('disjoint stories pass', () => {
  const dir = makeEpic({ 'S1.md': ['src/a.js'], 'S2.md': ['src/b.js'] });
  const out = execFileSync('node', ['scripts/collision-check.js', dir], { encoding: 'utf8' });
  assert.deepEqual(JSON.parse(out), { ok: true });
});

test('colliding stories fail with the file named', () => {
  const dir = makeEpic({ 'S1.md': ['src/a.js', 'src/shared.js'], 'S2.md': ['src/shared.js'] });
  let failed = false;
  try {
    execFileSync('node', ['scripts/collision-check.js', dir], { encoding: 'utf8' });
  } catch (e) {
    failed = true;
    const report = JSON.parse(e.stdout);
    assert.equal(report.ok, false);
    assert.deepEqual(report.collisions, [{ file: 'src/shared.js', stories: ['S1.md', 'S2.md'] }]);
  }
  assert.ok(failed, 'expected exit code 1');
});

test('report files are ignored', () => {
  const dir = makeEpic({ 'S1.md': ['src/a.js'], 'S1.report.md': ['src/a.js'] });
  const out = execFileSync('node', ['scripts/collision-check.js', dir], { encoding: 'utf8' });
  assert.deepEqual(JSON.parse(out), { ok: true });
});
