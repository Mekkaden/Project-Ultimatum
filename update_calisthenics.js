const fs = require('fs');

const filePaths = [
  './lib/workout-data.ts',
  './react-native/lib/workout-data.ts'
];

const videoMap = {
  "Vertical Pull Progression": "https://www.youtube.com/shorts/CdO5BvP6Ti8",
  "Horizontal Press Progression": "https://www.youtube.com/shorts/Vb7k11m4o5o",
  "Squat Pattern Progression": "https://www.youtube.com/shorts/MLoZuAkIyZI",
  "Core Compression Progression": "https://www.youtube.com/shorts/7DoFMV1Dnow",
  "Vertical Press Hold Progression": "https://www.youtube.com/results?search_query=handstand+hold+progression+calisthenics",
  "Horizontal Pull Progression": "https://www.youtube.com/results?search_query=australian+pull+up+form",
  "Vertical Press Progression": "https://www.youtube.com/results?search_query=pike+push+up+form",
  "Lunge Pattern Progression": "https://www.youtube.com/shorts/nDh_BlnLCGc",
  "Core Anti-Extension Progression": "https://www.youtube.com/shorts/7DoFMV1Dnow",
  "Grip & Scapula Progression": "https://www.youtube.com/results?search_query=active+hang+scapula+pull+up",
  "Hip Extension Progression": "https://youtu.be/_oyxCn2iSjU",
  "Core Flexion Progression": "https://www.youtube.com/watch?v=jBtiDLz0y7s",
  "Core Progression": "https://www.youtube.com/shorts/7DoFMV1Dnow",
  "Calf Isolation Progression": "https://www.youtube.com/shorts/baEXLy09Ncc",
  "Isometric Pull Progression": "https://www.youtube.com/results?search_query=isometric+pull+up+hold",
  "Elbow Extension Progression": "https://www.youtube.com/shorts/kwzz9WolqQk",
  "Elbow Flexion Progression": "https://www.youtube.com/shorts/j5f_0rNkPwU",
  "Core / Pull Progression": "https://www.youtube.com/shorts/7DoFMV1Dnow",
  "Scapula Isolation Progression": "https://www.youtube.com/results?search_query=scapular+pull+ups"
};

for (const filePath of filePaths) {
  if (fs.existsSync(filePath)) {
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // We only want to add videoUrl if it's missing in the calisthenics campaigns.
    // The easiest way is to use a regex that matches the prescribedEquipment and injects the videoUrl.
    // But since it's an array of objects, we can match: prescribedEquipment: "...", sets:
    // and replace with: prescribedEquipment: "...", videoUrl: "...", sets:
    
    // Let's do this by line to be safe, or just use regex.
    for (const [equipment, url] of Object.entries(videoMap)) {
      const regex = new RegExp(`(prescribedEquipment:\\s*"${equipment}".*?substitutions:\\s*\\[.*?\\])(\\s*})`, 'g');
      content = content.replace(regex, (match, p1, p2) => {
        // If it already has videoUrl, don't add it again
        if (match.includes('videoUrl:')) return match;
        return `${p1}, videoUrl: "${url}"${p2}`;
      });
    }
    
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${filePath}`);
  }
}
