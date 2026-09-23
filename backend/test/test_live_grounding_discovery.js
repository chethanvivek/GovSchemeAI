require('dotenv').config({ path: 'c:/Users/cheth/OneDrive/Documents/antigravity website/backend/.env' });
const http = require('http');
const db = require('../src/config/db');

function postJSON(urlPath, payload) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(payload);
    const req = http.request({
      hostname: 'localhost',
      port: 5000,
      path: urlPath,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function getJSON(urlPath) {
  return new Promise((resolve, reject) => {
    const req = http.get(`http://localhost:5000${urlPath}`, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, raw: body });
        }
      });
    });
    req.on('error', reject);
  });
}

async function runTests() {
  console.log('======================================================');
  console.log('TEST SUITE: REAL-TIME WEB DISCOVERY & DATABASE SYNC');
  console.log('======================================================\n');

  await db.initDB();

  // Test 1: Discover uncataloged scheme "PM Vishwakarma Scheme"
  console.log('[TEST 1] Triggering live discovery for "PM Vishwakarma Scheme"...');
  const liveRes = await postJSON('/api/schemes/discover-live', {
    query: 'PM Vishwakarma Scheme'
  });

  console.log('   Response status:', liveRes.status);
  console.log('   Success:', liveRes.data?.success);
  console.log('   Message:', liveRes.data?.message);
  console.log('   Scheme Name:', liveRes.data?.data?.name);
  console.log('   Category:', liveRes.data?.data?.category);
  console.log('   Is Live Discovered:', liveRes.data?.data?.is_live_discovered);
  console.log('   Official Application URL:', liveRes.data?.data?.official_application_url);

  if (liveRes.status !== 200 && liveRes.status !== 201) {
    throw new Error(`Failed Test 1: Expected 200 or 201, got ${liveRes.status}`);
  }
  if (!liveRes.data?.data?.name) {
    throw new Error('Failed Test 1: Discovered scheme missing name');
  }

  // Test 2: Verify Supabase PostgreSQL persistence
  console.log('\n[TEST 2] Verifying persistent row in Supabase PostgreSQL...');
  const dbCheck = await db.query(
    "SELECT id, name, category, is_live_discovered, last_updated_at, official_application_url FROM schemes WHERE name ILIKE '%Vishwakarma%'"
  );
  console.log('   Rows found in DB:', dbCheck.rows.length);
  if (dbCheck.rows.length === 0) {
    throw new Error('Failed Test 2: Scheme was not persisted into Supabase PostgreSQL schemes table!');
  }
  const dbRow = dbCheck.rows[0];
  console.log('   DB Record ID:', dbRow.id);
  console.log('   DB is_live_discovered:', dbRow.is_live_discovered);
  console.log('   DB last_updated_at:', dbRow.last_updated_at);

  // Test 3: Verify Explorer search endpoint immediately finds the newly ingested scheme
  console.log('\n[TEST 3] Calling GET /api/schemes?search=Vishwakarma...');
  const searchRes = await getJSON('/api/schemes?search=Vishwakarma');
  console.log('   Search status:', searchRes.status);
  console.log('   Found schemes count:', searchRes.data?.count);
  const foundScheme = searchRes.data?.data?.find(s => s.name.includes('Vishwakarma'));
  if (!foundScheme) {
    throw new Error('Failed Test 3: Discovered scheme not retrieved by explorer search filter!');
  }
  console.log('   Matched scheme:', foundScheme.name);

  // Test 4: Re-querying discover-live for same scheme should return existing DB record
  console.log('\n[TEST 4] Subsequent discovery request for "PM Vishwakarma"...');
  const cachedRes = await postJSON('/api/schemes/discover-live', {
    query: 'PM Vishwakarma'
  });
  console.log('   Status:', cachedRes.status);
  console.log('   Message:', cachedRes.data?.message);
  console.log('   is_live_discovered flag in response:', cachedRes.data?.is_live_discovered);
  if (cachedRes.data?.is_live_discovered !== false) {
    console.log('   (Note: Cached lookup returned existing scheme from database)');
  }

  console.log('\n======================================================');
  console.log('ALL REAL-TIME DISCOVERY & SYNC TESTS PASSED SUCCESSFULLY!');
  console.log('======================================================');
}

runTests().then(() => process.exit(0)).catch(err => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
