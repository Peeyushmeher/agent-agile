import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const ALLOWED_KEYS = new Set(['name', 'description', 'license', 'metadata', 'allowed-tools']);
const BANNED = /Meher|Obsidian|vault|Yerrslife|\bOpus\b|\bSonnet\b|\bFable\b|\bHaiku\b/;

function* walk(dir) {
  for (const e of readdirSync(dir)) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) yield* walk(p);
    else if (p.endsWith('.md')) yield p;
  }
}

function frontmatter(body) {
  const m = body.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const keys = m[1].split('\n').filter(l => /^[a-z-]+:/.test(l)).map(l => l.split(':')[0]);
  const desc = m[1].match(/^description:\s*(.*)$/m);
  const name = m[1].match(/^name:\s*(.*)$/m);
  return { keys, description: desc?.[1] ?? '', name: name?.[1]?.trim() ?? '' };
}

test('skill frontmatter: allowed keys, dir-matching name, trigger-only description', () => {
  for (const dir of readdirSync('skills')) {
    const body = readFileSync(join('skills', dir, 'SKILL.md'), 'utf8');
    const fm = frontmatter(body);
    assert.ok(fm, `${dir}: missing frontmatter`);
    for (const k of fm.keys) assert.ok(ALLOWED_KEYS.has(k), `${dir}: illegal frontmatter key '${k}'`);
    assert.equal(fm.name, dir, `${dir}: name must match directory`);
    assert.ok(fm.description.startsWith('Use when'), `${dir}: description must start with 'Use when'`);
    assert.ok(fm.description.length <= 1024, `${dir}: description too long`);
  }
});

test('no banned strings, no @-includes, in shipped content', () => {
  for (const root of ['skills', 'agents', 'playbooks']) {
    for (const file of walk(root)) {
      const body = readFileSync(file, 'utf8');
      assert.ok(!BANNED.test(body), `${file}: contains banned string`);
      assert.ok(!/^@\.?\//m.test(body), `${file}: uses @-include`);
      assert.ok(!/\b(TODO|TBD)\b/.test(body), `${file}: placeholder text`);
    }
  }
});

test('every referenced playbook file exists', () => {
  for (const root of ['skills', 'agents']) {
    for (const file of walk(root)) {
      const body = readFileSync(file, 'utf8');
      for (const [, ref] of body.matchAll(/playbooks\/([\w./-]+\.md)/g))
        assert.ok(existsSync(join('playbooks', ref)), `${file}: references missing playbooks/${ref}`);
    }
  }
});
