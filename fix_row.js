const fs = require('fs');
const EXTERNAL_JSON = '/Users/richardshajimekkaden/.gemini/antigravity-ide/brain/c7b02ec7-864c-48bc-86cd-a4f5c5a154b8/.system_generated/steps/1211/content.md';
let rawJsonStr = fs.readFileSync(EXTERNAL_JSON, 'utf8');
rawJsonStr = rawJsonStr.split('---\n')[1] || rawJsonStr; 
const exerciseDB = JSON.parse(rawJsonStr);
const RAW = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/';

// Check if 0874 exists
const ex1 = exerciseDB.find(e => e.gif_url && e.gif_url.includes('0874'));
console.log("0874:", ex1 ? ex1.name + " -> " + ex1.gif_url : "NOT FOUND");

// Find cable row exercises
const rows = exerciseDB.filter(e => e.name.toLowerCase().includes('cable row') || e.name.toLowerCase().includes('seated row'));
rows.slice(0,5).forEach(r => console.log(r.name, "->", r.gif_url));

// Also check the seated cable row specifically
const seated = exerciseDB.filter(e => e.name.toLowerCase().includes('seated') && e.name.toLowerCase().includes('row'));
console.log("\nSeated rows:");
seated.slice(0,5).forEach(r => console.log(r.name, "->", r.gif_url));
