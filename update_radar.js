const fs = require('fs');

let content = fs.readFileSync('components/StatRadarChart.tsx', 'utf8');

// 1. Remove HYP from labels
content = content.replace(
  'const labels = ["STR", "HYP", "VOL", "CON", "DIS"];',
  'const labels = ["STR", "VOL", "CON", "DIS"];'
);

// 2. Remove stats.hyp from values
content = content.replace(
  'const values = [stats.str, stats.hyp, stats.vol, stats.con, stats.dis];',
  'const values = [stats.str, stats.vol, stats.con, stats.dis];'
);

// 3. Replace hardcoded grid polygon points array from 5 items to 4
content = content.replace(
  /points={getPoints\(level, \[100, 100, 100, 100, 100\]\)}/g,
  'points={getPoints(level, Array(labels.length).fill(100))}'
);

// 4. Replace hardcoded / 5 with / labels.length
content = content.replace(/\(Math\.PI \* 2 \* i\) \/ 5/g, '(Math.PI * 2 * i) / labels.length');

fs.writeFileSync('components/StatRadarChart.tsx', content, 'utf8');
console.log('Radar chart updated');
