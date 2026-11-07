// Catalogue integrity check: run with `node scripts/audit-catalogue.mjs`.
//
// Validates that the movement catalogue, the campaign label map and the GIF
// database agree, so a rename or a typo can never ship a missing or
// mismatched form guide.

import fs from "node:fs";

const read = (p) => fs.readFileSync(new URL(`../${p}`, import.meta.url), "utf8");

const catalogueSrc = read("lib/exercise-catalogue.ts");
const aliasesSrc = read("lib/exercise-aliases.ts");
const dbSrc = read("lib/exercise-db.ts");
const workoutSrc = read("lib/workout-data.ts");

const gifIds = new Set([...dbSrc.matchAll(/\["([^"]+)","/g)].map((m) => m[1]));

const movements = [...catalogueSrc.matchAll(/M\("([^"]+)", "([^"]+)", "([^"]+)", "([^"]+)"/g)].map(
  ([, name, equipment, muscles, gifId]) => ({ name, equipment, muscles, gifId }),
);

const movementsByName = new Map();
const problems = [];

for (const m of movements) {
  if (movementsByName.has(m.name)) problems.push(`duplicate movement name: ${m.name}`);
  movementsByName.set(m.name, m);
  if (!gifIds.has(m.gifId)) problems.push(`unknown gif id: ${m.name} -> ${m.gifId}`);
}

const aliases = [...aliasesSrc.matchAll(/^\s{2}(?:"([^"]+)"|([A-Za-z][\w -]*)):\s*"([^"]+)",/gm)].map(
  ([, quoted, bare, movement]) => ({ label: quoted ?? bare, movement }),
);
const aliasMap = new Map();
const PRESCRIBED = new Map(
  [...workoutSrc.matchAll(/prescribedEquipment: "([^"]+)"/g)].map((m) => [m[1], m[1]]),
);
for (const a of aliases) {
  if (!PRESCRIBED.has(a.label)) continue;
  if (!movementsByName.has(a.movement)) problems.push(`alias points at unknown movement: ${a.label} -> ${a.movement}`);
  aliasMap.set(PRESCRIBED.get(a.label), a.movement);
}

const usedLabels = new Set(
  [...workoutSrc.matchAll(/prescribedEquipment: "([^"]+)"/g)].map((m) => m[1]),
);

const unmapped = [...usedLabels].filter((label) => !aliasMap.has(label));
if (unmapped.length) problems.push(`campaign labels with no catalogue mapping:\n  - ${unmapped.join("\n  - ")}`);

// Every progression key must resolve to a real movement, and each progression
// should be reachable from the movement the campaigns prescribe.
const progressionsSrc = read("lib/progressions.ts");
const progressionKeys = [...progressionsSrc.matchAll(/^\s{2}"([^"]+ Progression)": \{/gm)].map((m) => m[1]);
const progressionTargets = [...progressionsSrc.matchAll(/"([^"]+ Progression)": "([^"]+)",/g)].map(
  ([, key, movement]) => ({ key, movement }),
);
for (const key of progressionKeys) {
  if (!progressionTargets.some((t) => t.key === key)) problems.push(`progression has no target movement: ${key}`);
}
for (const t of progressionTargets) {
  if (!movementsByName.has(t.movement)) problems.push(`progression target unknown: ${t.key} -> ${t.movement}`);
}

const unreachable = progressionTargets.filter(
  (t) => ![...usedLabels].some((label) => aliasMap.get(label) === t.movement),
);
if (unreachable.length) {
  problems.push(
    `progression targets not prescribed by any campaign movement:\n  - ${unreachable
      .map((t) => `${t.key} -> ${t.movement}`)
      .join("\n  - ")}`,
  );
}

console.log(`actions: ${(catalogueSrc.match(/^  \{\n    name: "/gm) ?? []).length}`);
console.log(`movements: ${movements.length} (unique: ${movementsByName.size})`);
console.log(`gif ids used: ${new Set(movements.map((m) => m.gifId)).size}`);
console.log(`alias labels: ${aliasMap.size}`);
console.log(`campaign labels: ${usedLabels.size}, unmapped: ${unmapped.length}`);

if (problems.length) {
  console.error(`\n${problems.length} problem(s):`);
  for (const p of problems) console.error(`- ${p}`);
  process.exit(1);
}
console.log("\nCatalogue OK");
