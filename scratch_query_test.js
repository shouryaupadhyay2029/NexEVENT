import fs from 'fs';

const configPath = 'C:\\Users\\Shourya Upadhyay\\.config\\configstore\\firebase-tools.json';
const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const tokens = data.tokens;

async function getAccessToken() {
  const now = Date.now();
  if (tokens.access_token && tokens.expires_at && now < (tokens.expires_at - 60000)) {
    console.log("Using cached access token");
    return tokens.access_token;
  }
  
  console.log("Refreshing access token...");
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      grant_type: 'refresh_token',
      client_id: '563584335869-fgrhgmd47bqnekij5i8b5pr03ho849e6.apps.googleusercontent.com',
      client_secret: 'j9iVZfS8kkCEFUPaAeJV0sAi',
      refresh_token: tokens.refresh_token
    })
  });
  
  if (!resp.ok) {
    throw new Error("Failed to refresh token: " + await resp.text());
  }
  
  const tokenData = await resp.json();
  console.log("Token refreshed successfully!");
  return tokenData.access_token;
}

async function run() {
  try {
    const token = await getAccessToken();
    const projectId = 'nexevent-67bd4';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/clubs`;
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!resp.ok) {
      throw new Error(`HTTP Error: ${resp.status} - ${await resp.text()}`);
    }
    const json = await resp.json();
    console.log("Retrieved clubs successfully. Number of clubs:", json.documents ? json.documents.length : 0);
  } catch (e) {
    console.error("Error:", e.message);
  }
}

run();
