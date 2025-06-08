const fs = require('fs');
const { makeBadge } = require('badge-maker');

const summaryPath = './coverage/coverage-summary.json';
if (!fs.existsSync(summaryPath)) {
  console.error('Coverage summary not found');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(summaryPath, 'utf-8'));
const pct = Math.round(data.total.statements.pct);

function getColor(p) {
  if (p >= 90) return 'brightgreen';
  if (p >= 80) return 'green';
  if (p >= 70) return 'yellowgreen';
  if (p >= 60) return 'yellow';
  if (p >= 50) return 'orange';
  return 'red';
}

const svg = makeBadge({ label: 'coverage', message: `${pct}%`, color: getColor(pct) });
fs.mkdirSync('./coverage', { recursive: true });
fs.writeFileSync('./coverage/badge.svg', svg);
console.log('Coverage badge generated at coverage/badge.svg');
