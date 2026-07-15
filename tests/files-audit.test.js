import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, execSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';

const script = resolve('scripts/files-audit.js');

function fixture() {
  const repo = mkdtempSync(join(tmpdir(), 'aa-audit-'));
  execSync('git init -q && git -c user.name=aa -c user.email=aa@test commit -q --allow-empty -m base', { cwd: repo });
  const stories = join(repo, '.planning', 'epics', 'EPIC-01', 'stories');
  mkdirSync(stories, { recursive: true });
  writeFileSync(join(stories, 'S1.md'), '# S1\n```files\nsrc/a.js\n```\n');
  return { repo, stories };
}

test('clean wave passes: touched file is owned and reported', () => {
  const { repo, stories } = fixture();
  mkdirSync(join(repo, 'src'));
  writeFileSync(join(repo, 'src', 'a.js'), 'x');
  writeFileSync(join(stories, 'S1.report.md'), '```yaml\nstory: S1\nstatus: PASS\nfiles_touched:\n  - src/a.js\n```\n');
  const out = execFileSync('node', [script, '.planning/epics/EPIC-01'], { cwd: repo, encoding: 'utf8' });
  assert.equal(JSON.parse(out).ok, true);
});

test('omitted files_touched entry is caught as unreported', () => {
  const { repo, stories } = fixture();
  mkdirSync(join(repo, 'src'));
  writeFileSync(join(repo, 'src', 'a.js'), 'x');
  writeFileSync(join(repo, 'src', 'sneaky.js'), 'x'); // touched, not owned, not reported
  writeFileSync(join(stories, 'S1.report.md'), '```yaml\nstory: S1\nstatus: PASS\nfiles_touched:\n  - src/a.js\n```\n');
  let failed = false;
  try {
    execFileSync('node', [script, '.planning/epics/EPIC-01'], { cwd: repo, encoding: 'utf8' });
  } catch (e) {
    failed = true;
    const out = JSON.parse(e.stdout);
    assert.equal(out.ok, false);
    assert.deepEqual(out.unowned, ['src/sneaky.js']);
    assert.deepEqual(out.unreported, ['src/sneaky.js']);
  }
  assert.ok(failed, 'audit should exit non-zero');
});
