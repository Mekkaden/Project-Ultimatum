const fs = require('fs');

const keywordToUrl = {
  'face pull': 'https://www.youtube.com/shorts/5v2tTaOKQtI', 
  'crossover': 'https://www.youtube.com/shorts/g3T7LsEeDWQ', 
  'trap raise': 'https://www.youtube.com/shorts/5v2tTaOKQtI', 
  'shoulder press': 'https://www.youtube.com/shorts/OLePvpxQEGk',
  'pulldown': 'https://youtu.be/Hdc7Mw6BIEE',
  'leg curl': 'https://youtube.com/shorts/FMCq0hT3KRU',
  'crunch': 'https://www.youtube.com/watch?v=jBtiDLz0y7s',
  'upright row': 'https://www.youtube.com/shorts/OLePvpxQEGk', 
  'curl': 'https://www.youtube.com/shorts/j5f_0rNkPwU', 
  'rdl': 'https://youtu.be/_oyxCn2iSjU',
  'peck deck': 'https://www.youtube.com/shorts/5v2tTaOKQtI', 
  'calf': 'https://www.youtube.com/shorts/baEXLy09Ncc',
  'abduction': 'https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr', 
  'kickback': 'https://www.youtube.com/shorts/kwzz9WolqQk', 
  'pull-through': 'https://youtu.be/_oyxCn2iSjU', 
  'press down': 'https://www.youtube.com/shorts/kwzz9WolqQk', 
  'kettlebell swing': 'https://youtu.be/_oyxCn2iSjU', 
  'skull crusher': 'https://www.youtube.com/shorts/kwzz9WolqQk', 
  'squat': 'https://www.youtube.com/shorts/MLoZuAkIyZI',
  'hyperextension': 'https://youtu.be/_oyxCn2iSjU', 
  'band walk': 'https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr', 
  'vacuum': 'https://www.youtube.com/watch?v=pSHjTRCQxIw&t=29s&pp=ygUKcGxhbmsgZm9ybdIHCQmjCwGHKiGM7w%3D%3D', 
  'preacher': 'https://www.youtube.com/watch?v=rsrN-avWD60&pp=ygUNcHJlYWNoZXIgY3VybA%3D%3D',
};

const exactMatch = {
  'Cable Rope Kickback': 'https://www.youtube.com/shorts/kwzz9WolqQk',
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
        let url = exactMatch[eq];
        
        if (!url) {
          let lowerEq = eq.toLowerCase();
          for (let key in keywordToUrl) {
            if (lowerEq.includes(key)) {
              url = keywordToUrl[key];
              break;
            }
          }
        }

        if (url) {
          line = line.replace(/(\}\s*,?\s*)$/, `, videoUrl: "${url}" $1`);
          lines[i] = line;
        } else {
          console.log('Still missing RN:', eq);
        }
      }
    }
  }

  fs.writeFileSync('react-native/lib/workout-data.ts', lines.join('\n'));
  console.log('Done mapping missing URLs for RN.');
}
