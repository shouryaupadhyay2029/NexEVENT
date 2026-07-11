import fs from 'fs';

const configPath = 'C:\\Users\\Shourya Upadhyay\\.config\\configstore\\firebase-tools.json';
try {
  const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  console.log("Keys in firebase-tools.json:", Object.keys(data));
  if (data.tokens) {
    console.log("Keys in data.tokens:", Object.keys(data.tokens));
  }
  if (data.user) {
    console.log("User email:", data.user.email);
  }
} catch (e) {
  console.error("Error reading config:", e.message);
}
