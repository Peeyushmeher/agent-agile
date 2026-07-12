#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!/^\d+\.\d+\.\d+/.test(version ?? '')) { console.error('usage: bump-version.js <semver>'); process.exit(2); }

const registry = JSON.parse(readFileSync('.version-bump.json', 'utf8'));
for (const { path, field } of registry.files) {
  const doc = JSON.parse(readFileSync(path, 'utf8'));
  const keys = field.split('.');
  let node = doc;
  for (const k of keys.slice(0, -1)) node = node[k];
  node[keys.at(-1)] = version;
  writeFileSync(path, JSON.stringify(doc, null, 2) + '\n');
  console.log(`${path} ${field} -> ${version}`);
}
