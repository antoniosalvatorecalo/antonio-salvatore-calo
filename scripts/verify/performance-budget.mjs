import { readFileSync, statSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const budget = JSON.parse(readFileSync(resolve(root, 'performance-budget.json'), 'utf8'));
const html = readFileSync(resolve(root, 'dist/index.html'), 'utf8');

const assetPaths = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map(
  ([, assetPath]) => assetPath,
);
const bytesFor = (extension) =>
  assetPaths
    .filter((assetPath) => assetPath.endsWith(extension))
    .reduce(
      (total, assetPath) => total + statSync(resolve(root, 'dist', assetPath.slice(1))).size,
      0,
    );

const initialJsBytes = bytesFor('.js');
const initialCssBytes = bytesFor('.css');
const failures = [];
if (initialJsBytes > budget.maxInitialJsBytes) {
  failures.push(`initial JS ${initialJsBytes} B exceeds ${budget.maxInitialJsBytes} B`);
}
if (initialCssBytes > budget.maxInitialCssBytes) {
  failures.push(`initial CSS ${initialCssBytes} B exceeds ${budget.maxInitialCssBytes} B`);
}

console.log(`Initial assets: JS ${initialJsBytes} B; CSS ${initialCssBytes} B.`);
if (failures.length) throw new Error(`Performance budget failed: ${failures.join('; ')}`);
