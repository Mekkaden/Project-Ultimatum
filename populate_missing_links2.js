const fs = require('fs');

const keywordToUrl = {
  'tricep': 'https://www.youtube.com/shorts/kwzz9WolqQk',
  'kelso shrug': 'https://www.youtube.com/shorts/5v2tTaOKQtI',
  'bar pushdown': 'https://youtube.com/shorts/bLVeOunB-c0',
  'hip thrust': 'https://www.youtube.com/watch?v=pUdIL5x0fWg',
  'barbell row': 'https://www.youtube.com/shorts/OL8yGrkXyiQ',
  'incline db press': 'https://youtube.com/shorts/JtR_jfdHYwY',
  'superset': 'https://www.instagram.com/p/Cvk5D_-sgif/',
  'weighted dips': 'https://youtu.be/Hdc7Mw6BIEE',
  'seated row': 'https://www.youtube.com/shorts/_GziHDdJY10',
};

if (fs.existsSync('react-native/lib/workout-data.ts')) {
  let content = fs.readFileSync('react-native/lib/workout-data.ts', 'utf8');
  let lines = content.split('\n');

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    if (line.includes('{ slotName:') && !line.includes('videoUrl')) {
      let eqMatch = line.match(/prescribedEquipment:\s*"([^"]+)"/);
      if (eqMatch) {
        let eq = eqMatch[1];
        let url = null;
        
        let lowerEq = eq.toLowerCase();
        for (let key in keywordToUrl) {
          if (lowerEq.includes(key)) {
            url = keywordToUrl[key];
            break;
          }
        }

        if (url) {
          line = line.replace(/(\}\s*,?\s*)$/, `, videoUrl: "${url}" $1`);
          lines[i] = line;
        } else {
          console.log('STILL missing RN:', eq);
        }
      }
    }
  }

  fs.writeFileSync('react-native/lib/workout-data.ts', lines.join('\n'));
  console.log('Done mapping missing URLs for RN (pass 2).');
}
