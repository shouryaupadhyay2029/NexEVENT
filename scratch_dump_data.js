import fs from 'fs';

const configPath = 'C:\\Users\\Shourya Upadhyay\\.config\\configstore\\firebase-tools.json';
const data = JSON.parse(fs.readFileSync(configPath, 'utf8'));
const tokens = data.tokens;

async function getAccessToken() {
  const now = Date.now();
  if (tokens.access_token && tokens.expires_at && now < (tokens.expires_at - 60000)) {
    return tokens.access_token;
  }
  
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
  return tokenData.access_token;
}

function parseValue(valueObj) {
  if (!valueObj) return null;
  const type = Object.keys(valueObj)[0];
  const val = valueObj[type];
  if (type === 'stringValue') return val;
  if (type === 'booleanValue') return val;
  if (type === 'integerValue') return parseInt(val);
  if (type === 'doubleValue') return parseFloat(val);
  if (type === 'timestampValue') return val;
  if (type === 'nullValue') return null;
  if (type === 'arrayValue') {
    return (val.values || []).map(v => parseValue(v));
  }
  if (type === 'mapValue') {
    const res = {};
    const fields = val.fields || {};
    for (const k of Object.keys(fields)) {
      res[k] = parseValue(fields[k]);
    }
    return res;
  }
  return val;
}

function parseFirestoreDocument(doc) {
  const fields = doc.fields || {};
  const res = {
    _id: doc.name.split('/').pop(),
    _path: doc.name.split('/documents/')[1]
  };
  for (const k of Object.keys(fields)) {
    res[k] = parseValue(fields[k]);
  }
  return res;
}

async function fetchCollection(collectionName, token) {
  let documents = [];
  let pageToken = '';
  const projectId = 'nexevent-67bd4';
  
  do {
    const pageTokenParam = pageToken ? `&pageToken=${pageToken}` : '';
    const url = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/${collectionName}?pageSize=300${pageTokenParam}`;
    const resp = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!resp.ok) {
      if (resp.status === 404) {
        console.warn(`[warn] Collection ${collectionName} returned 404 (does not exist yet)`);
        break;
      }
      throw new Error(`HTTP Error for ${collectionName}: ${resp.status} - ${await resp.text()}`);
    }
    const json = await resp.json();
    if (json.documents) {
      documents.push(...json.documents);
    }
    pageToken = json.nextPageToken || '';
  } while (pageToken);
  
  return documents.map(doc => parseFirestoreDocument(doc));
}

async function run() {
  try {
    const token = await getAccessToken();
    const collections = [
      'users',
      'events',
      'registrations',
      'organizerInvites',
      'clubs',
      'notifications',
      'activities',
      'adminLogs'
    ];
    
    const dump = {};
    for (const col of collections) {
      console.log(`Fetching collection: ${col}...`);
      dump[col] = await fetchCollection(col, token);
      console.log(`Fetched ${dump[col].length} documents for ${col}.`);
    }
    
    fs.writeFileSync('scratch_firestore_dump.json', JSON.stringify(dump, null, 2));
    console.log("Firestore data dump created successfully as scratch_firestore_dump.json!");
  } catch (e) {
    console.error("Execution failed:", e.stack);
  }
}

run();
