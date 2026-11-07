const fs = require('fs');

let content = fs.readFileSync('lib/workout-data.ts', 'utf8');

// Replace logic:
// 1. Hanging Leg Raise (or Raises) -> https://www.youtube.com/shorts/7DoFMV1Dnow
// 2. Donkey Kickback -> https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr
// 3. Dumbbell Chest Press / Flat DB Press -> https://www.youtube.com/shorts/1V3vpcaxRYQ
// 4. Assisted Pull-Up / Assisted Pullup -> https://www.youtube.com/shorts/CdO5BvP6Ti8
// 5. Seated DB Press / DB Shoulder Press -> https://www.youtube.com/shorts/OLePvpxQEGk
// 6. DB Row / Single Arm DB Row / Dumbbell Row -> https://www.youtube.com/shorts/OL8yGrkXyiQ
// 7. Front Raise / Front Delt Raise -> https://www.youtube.com/shorts/NdQE5Fhfqn4
// 8. Overhead Extension / Rope Overhead Extension / Bar Overhead Extension -> Use a consistent link. Currently what is it? "https://www.youtube.com/shorts/68NDeHB1WSc"

// Since it's a big JS file, let's just do regex replacements on lines that match the exercise names.

const updates = [
  { match: /Hanging Leg Raise/i, url: "https://www.youtube.com/shorts/7DoFMV1Dnow" },
  { match: /Donkey Kickback/i, url: "https://www.youtube.com/watch?v=KgghFOMKnkE&pp=ygUPZG9ua2V5IGtpY2tiYWNr" },
  { match: /Flat DB Press|Dumbbell Chest Press|DB Chest Press/i, url: "https://www.youtube.com/shorts/1V3vpcaxRYQ" },
  { match: /Assisted Pull-?Up/i, url: "https://www.youtube.com/shorts/CdO5BvP6Ti8" },
  { match: /Seated DB Press|DB Shoulder Press|Dumbbell Shoulder Press/i, url: "https://www.youtube.com/shorts/OLePvpxQEGk" },
  { match: /Single Arm DB Row|DB Row|Dumbbell Row/i, url: "https://www.youtube.com/shorts/OL8yGrkXyiQ" },
  { match: /Front Raise|Front Delt Raise/i, url: "https://www.youtube.com/shorts/NdQE5Fhfqn4" },
  { match: /Overhead Extension/i, url: "https://www.youtube.com/shorts/68NDeHB1WSc" }, // enforcing same link
];

let lines = content.split('\n');
for (let i = 0; i < lines.length; i++) {
  let line = lines[i];
  if (line.includes('videoUrl')) {
    for (let rule of updates) {
      if (rule.match.test(line)) {
        // Replace the videoUrl string
        line = line.replace(/videoUrl:\s*"[^"]*"/, `videoUrl: "${rule.url}"`);
      }
    }
    lines[i] = line;
  }
}

fs.writeFileSync('lib/workout-data.ts', lines.join('\n'));
console.log("Updated workout-data.ts");
