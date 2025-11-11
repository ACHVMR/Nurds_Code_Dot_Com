const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..', 'src');
const exts = ['.js', '.jsx', '.ts', '.tsx', '.css'];

const replacements = [
  [/bg-gradient-to-r/g, 'bg-linear-to-r'],
  [/bg-gradient-to-br/g, 'bg-linear-to-br'],
  [/bg-gradient-to-b/g, 'bg-linear-to-b'],
  [/\bflex-grow\b/g, 'grow'],
  [/\bflex-shrink-0\b/g, 'shrink-0'],
];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walk(full);
    } else if (exts.includes(path.extname(entry.name))) {
      processFile(full);
    }
  }
}

function processFile(file) {
  try {
    const original = fs.readFileSync(file, 'utf8');
    let updated = original;
    for (const [pattern, repl] of replacements) {
      updated = updated.replace(pattern, repl);
    }
    if (updated !== original) {
      fs.writeFileSync(file, updated, 'utf8');
      console.log('Updated:', path.relative(process.cwd(), file));
    }
  } catch (err) {
    console.error('Error processing', file, err.message);
  }
}

console.log('Starting Tailwind utility replacements under src/');
walk(root);
console.log('Done. Please re-run your lint/compile checks.');
