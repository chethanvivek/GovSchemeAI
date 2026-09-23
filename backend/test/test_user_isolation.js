process.env.NODE_ENV = 'test';
const http = require('http');
const { app, startServer } = require('../src/index');

async function testUserIsolation() {
  console.log('--- Testing Multi-User Session & User-Data Isolation ---');
  const server = await startServer(5098);
  const baseUrl = 'http://localhost:5098';

  function req(method, path, body = null, token = null) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const r = http.request({
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        headers
      }, res => {
        let raw = '';
        res.on('data', c => raw += c);
        res.on('end', () => {
          try {
            resolve({ status: res.statusCode, body: JSON.parse(raw) });
          } catch {
            resolve({ status: res.statusCode, raw });
          }
        });
      });
      r.on('error', reject);
      if (body) r.write(JSON.stringify(body));
      r.end();
    });
  }

  try {
    // 1. Register User A
    const userA_Email = `user_a_${Date.now()}@gov.in`;
    const regResA = await req('POST', '/api/auth/register', {
      email: userA_Email,
      password: 'Password123!'
    });
    console.log('[Step 1] User A Registered:', userA_Email, '| profileComplete:', regResA.body.profileComplete);
    if (regResA.body.profileComplete !== false) {
      throw new Error('New user A should have profileComplete: false');
    }
    const tokenA = regResA.body.data.token;

    // Check /api/user/me for User A
    const meResA = await req('GET', '/api/user/me', null, tokenA);
    console.log('[Step 2] User A /api/user/me -> profileComplete:', meResA.body.profileComplete);
    if (meResA.body.profileComplete !== false || meResA.body.data?.has_profile !== false) {
      throw new Error('User A initial /api/user/me should report no profile');
    }

    // 2. User A completes profile
    const updateResA = await req('PUT', '/api/profile', {
      age: 21,
      state: 'Andhra Pradesh',
      occupation: 'Student',
      annual_income: 180000,
      education_level: 'Undergraduate',
      employment_status: 'Unemployed'
    }, tokenA);
    console.log('[Step 3] User A updated profile -> Status:', updateResA.status, '| profileComplete:', updateResA.body.profileComplete);
    if (updateResA.body.profileComplete !== true) {
      throw new Error('User A profile update failed');
    }

    // 3. User A adds scheme to tracker
    const schemesRes = await req('GET', '/api/schemes', null, tokenA);
    const testSchemeId = schemesRes.body.data[0].id;
    const addTrackerRes = await req('POST', '/api/tracker', {
      scheme_id: testSchemeId,
      status: 'Saved',
      notes: 'User A personal saved scheme'
    }, tokenA);
    console.log('[Step 4] User A added tracker item -> ID:', addTrackerRes.body.data?.id);

    // Verify User A tracker count = 1
    const trackerA = await req('GET', '/api/tracker', null, tokenA);
    console.log('[Step 5] User A tracker count:', trackerA.body.count);
    if (trackerA.body.count !== 1) {
      throw new Error('User A should have 1 tracked scheme');
    }

    // 4. Register User B (different account)
    const userB_Email = `user_b_${Date.now()}@gov.in`;
    const regResB = await req('POST', '/api/auth/register', {
      email: userB_Email,
      password: 'Password123!'
    });
    const tokenB = regResB.body.data.token;
    console.log('[Step 6] User B Registered:', userB_Email, '| profileComplete:', regResB.body.profileComplete);

    // Login User B to verify login returns profileComplete: false
    const loginResB = await req('POST', '/api/auth/login', {
      email: userB_Email,
      password: 'Password123!'
    });
    console.log('[Step 7] User B Login -> profileComplete:', loginResB.body.profileComplete);
    if (loginResB.body.profileComplete !== false) {
      throw new Error('User B login should have profileComplete: false');
    }

    // Verify User B has NO profile via /api/profile
    const profileResB = await req('GET', '/api/profile', null, tokenB);
    console.log('[Step 8] User B /api/profile -> profile:', profileResB.body.data?.profile, '| profileComplete:', profileResB.body.profileComplete);
    if (profileResB.body.data?.profile !== null || profileResB.body.profileComplete !== false) {
      throw new Error('CRITICAL BUG: User B received User A profile data!');
    }

    // Verify User B has ZERO tracker items (strict user isolation)
    const trackerB = await req('GET', '/api/tracker', null, tokenB);
    console.log('[Step 9] User B /api/tracker count:', trackerB.body.count);
    if (trackerB.body.count !== 0) {
      throw new Error('CRITICAL BUG: User B received User A tracker items!');
    }

    console.log('\n====================================================');
    console.log('✓ ALL USER ISOLATION & SESSION CHECKS PASSED!');
    console.log('  - Different accounts have completely isolated profiles.');
    console.log('  - Incomplete accounts return profileComplete: false.');
    console.log('  - Tracker histories are strictly user-isolated.');
    console.log('====================================================\n');
  } finally {
    server.close();
  }
}

testUserIsolation().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
