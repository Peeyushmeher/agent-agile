#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const plugin = JSON.parse(readFileSync('.claude-plugin/plugin.json', 'utf8'));
const marketplace = JSON.parse(readFileSync('.claude-plugin/marketplace.json', 'utf8'));

mkdirSync('.codex-plugin', { recursive: true });
writeFileSync('.codex-plugin/plugin.json',
  JSON.stringify({ ...plugin, skills: './skills/' }, null, 2) + '\n');

mkdirSync('.agents/plugins', { recursive: true });
writeFileSync('.agents/plugins/marketplace.json',
  JSON.stringify({
    name: marketplace.name,
    owner: marketplace.owner,
    plugins: marketplace.plugins.map(p => ({ name: p.name, source: { source: 'url', url: './' }, description: p.description }))
  }, null, 2) + '\n');

console.log('generated .codex-plugin/plugin.json and .agents/plugins/marketplace.json');
