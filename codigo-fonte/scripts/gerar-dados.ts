// Gera dados/site.json com o conteúdo inicial (só usado na primeira publicação).
import { writeFileSync, mkdirSync } from 'node:fs';
import { defaultSiteData } from '../src/lib/site-data';
const out = process.argv[2] || 'out';
mkdirSync(`${out}/dados`, { recursive: true });
const data = { ...defaultSiteData(), updatedAt: new Date().toISOString() };
writeFileSync(`${out}/dados/site.json`, JSON.stringify(data, null, 2) + '\n');
console.log('dados/site.json:', data.packages.length, 'pacotes,', data.portfolio.length, 'projetos,', data.faqs.length, 'perguntas');
