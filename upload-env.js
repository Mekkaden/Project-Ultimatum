const fs = require('fs');
const { execSync } = require('child_process');

const envContent = fs.readFileSync('.env.local', 'utf-8');
const lines = envContent.split('\n');

for (const line of lines) {
  if (!line || line.trim().startsWith('#')) continue;
  
  const separatorIdx = line.indexOf('=');
  if (separatorIdx === -1) continue;
  
  const key = line.slice(0, separatorIdx).trim();
  let value = line.slice(separatorIdx + 1).trim();
  
  // Remove surrounding quotes if they exist
  if (value.startsWith('"') && value.endsWith('"')) {
    value = value.slice(1, -1);
  }
  
  console.log(`Pushing ${key}...`);
  try {
    execSync(`vercel env rm ${key} production,preview,development -y`, { stdio: 'ignore' });
  } catch (e) {
    // It's fine if it doesn't exist
  }
  
  try {
    // Use child_process.execSync with input buffer
    execSync(`vercel env add ${key} production,preview,development`, {
      input: Buffer.from(value)
    });
    console.log(`✅ Successfully added ${key}`);
  } catch (e) {
    console.error(`❌ Failed to add ${key}`);
  }
}
