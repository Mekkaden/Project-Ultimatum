const fs = require('fs');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  let inCalisthenics = false;
  
  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('export const CAMPAIGN_CALISTHENICS_')) {
      inCalisthenics = true;
    } else if (inCalisthenics && lines[i].startsWith('export const CAMPAIGN_')) {
      inCalisthenics = false;
    }
    
    if (inCalisthenics) {
      lines[i] = lines[i].replace(/\s*,\s*videoUrl:\s*["'][^"']+["']\s*/g, '');
    }
  }
  
  fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
  console.log(`Processed ${filePath}`);
}

processFile('lib/workout-data.ts');
processFile('react-native/lib/workout-data.ts');
