const fs = require('fs');

let content = fs.readFileSync('lib/workout-data.ts', 'utf8');

const updates = [
  { match: /Hanging Leg Raise/i, url: "https://www.youtube.com/shorts/7DoFMV1Dnow" },
  { match: /Donkey Kickback/i, url: "https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr" },
  { match: /Flat DB Press|Dumbbell Chest Press|DB Chest Press/i, url: "https://www.youtube.com/shorts/1V3vpcaxRYQ" },
  { match: /Assisted Pull-?Up/i, url: "https://www.youtube.com/shorts/CdO5BvP6Ti8" },
  { match: /Seated DB Press|DB Shoulder Press|Dumbbell Shoulder Press/i, url: "https://www.youtube.com/shorts/OLePvpxQEGk" },
  { match: /Single Arm DB Row|DB Row|Dumbbell Row/i, url: "https://www.youtube.com/shorts/OL8yGrkXyiQ" },
  { match: /Front Raise|Front Delt Raise/i, url: "https://www.youtube.com/shorts/NdQE5Fhfqn4" },
  { match: /Overhead Extension/i, url: "https://www.youtube.com/shorts/68NDeHB1WSc" },
];

let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.includes('{ slotName:') || line.includes('prescribedEquipment:')) {
    for (let rule of updates) {
      if (rule.match.test(line)) {
        if (line.includes('videoUrl')) {
          line = line.replace(/videoUrl:\s*"[^"]*"/, `videoUrl: "${rule.url}"`);
        } else {
          // Find the end of the object (before the trailing }, )
          line = line.replace(/(\}\s*,?\s*)$/, `, videoUrl: "${rule.url}" $1`);
        }
      }
    }
    lines[i] = line;
  }
}

fs.writeFileSync('lib/workout-data.ts', lines.join('\n'));
console.log("Fixed workout-data.ts");
