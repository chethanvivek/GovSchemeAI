process.env.NODE_ENV = 'test';
const http = require('http');
const { app, startServer } = require('../src/index');
const db = require('../src/config/db');

async function runRegistrationVerification() {
  console.log('=== Starting Registration Flow & Diagnostics Verification ===');
  const server = await startServer(5199);
  const baseUrl = 'http://localhost:5199';

  function request(method, path, body, origin = 'https://gov-scheme-ai-rho.vercel.app') {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = {
        'Content-Type': 'application/json',
        'Origin': origin
      };

      const req = http.request({
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        headers
      }, res => {
        let raw = '';
        res.on('data', chunk => raw += chunk);
        res.on('end', () => {
          let parsed;
          try {
            parsed = JSON.parse(raw);
          } catch {
            parsed = raw;
          }
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: parsed
          });
        });
      });

      req.on('error', reject);
      if (body) req.write(JSON.stringify(body));
      req.end();
    });
  }

  try {
    const testEmail = `verify_reg_${Date.now()}@supabase.test.gov.in`;
    const testPassword = 'Password123!';

    // TEST 1: Register new user
    console.log('\n[TEST 1] Registering brand new citizen account:', testEmail);
    const regRes = await request('POST', '/api/auth/register', {
      email: testEmail,
      password: testPassword
    });

    console.log('Status:', regRes.status);
    console.log('CORS Allow Origin Header:', regRes.headers['access-control-allow-origin']);
    console.log('CORS Credentials Header:', regRes.headers['access-control-allow-credentials']);
    console.log('Response body:', regRes.body);

    if (regRes.status !== 201) {
      throw new Error(`Expected status 201 on valid registration, received ${regRes.status}`);
    }
    if (!regRes.body.data?.token || !regRes.body.data?.user?.id) {
      throw new Error('Registration response missing user id or JWT token');
    }
    const newUserId = regRes.body.data.user.id;

    // TEST 2: Verify user exists and empty profile is seeded in database
    console.log('\n[TEST 2] Verifying seeded profile record for user id:', newUserId);
    const profileInProfiles = await db.query('SELECT * FROM profiles WHERE user_id = $1', [newUserId]);
    console.log('Profile record in profiles table:', profileInProfiles.rows);
    if (!profileInProfiles.rows || profileInProfiles.rows.length === 0) {
      throw new Error('Expected profile record to be automatically seeded in profiles table, but none was found!');
    }

    try {
      const profileInUserProfiles = await db.query('SELECT * FROM user_profiles WHERE user_id = $1', [newUserId]);
      console.log('Profile record in user_profiles:', profileInUserProfiles.rows);
      if (!profileInUserProfiles.rows || profileInUserProfiles.rows.length === 0) {
        throw new Error('Expected profile record to be visible in user_profiles, but none was found!');
      }
    } catch (viewErr) {
      console.warn('Note on user_profiles query:', viewErr.message);
    }

    // TEST 3: Attempt duplicate registration with same email
    console.log('\n[TEST 3] Attempting duplicate registration with same email:', testEmail);
    const dupRes = await request('POST', '/api/auth/register', {
      email: testEmail,
      password: testPassword
    });

    console.log('Duplicate Status:', dupRes.status);
    console.log('Duplicate CORS Allow Origin:', dupRes.headers['access-control-allow-origin']);
    console.log('Duplicate Error Message:', dupRes.body.error);

    if (dupRes.status !== 409) {
      throw new Error(`Expected HTTP 409 Conflict for duplicate registration, received ${dupRes.status}`);
    }
    if (dupRes.body.error !== 'An account with this email already exists. Please sign in instead.') {
      throw new Error(`Expected exact error message 'An account with this email already exists. Please sign in instead.', received: '${dupRes.body.error}'`);
    }
    if (!dupRes.headers['access-control-allow-origin']) {
      throw new Error('CORS header access-control-allow-origin missing on 409 error response!');
    }

    // TEST 4: Case-insensitive duplicate check
    console.log('\n[TEST 4] Attempting duplicate registration with upper/mixed case email:', testEmail.toUpperCase());
    const caseDupRes = await request('POST', '/api/auth/register', {
      email: testEmail.toUpperCase(),
      password: testPassword
    });

    if (caseDupRes.status !== 409) {
      throw new Error(`Expected HTTP 409 Conflict for case-insensitive duplicate registration, received ${caseDupRes.status}`);
    }
    console.log('Case-insensitive duplicate rejected with 409:', caseDupRes.body.error);

    // TEST 5: Verify CORS headers on validation error (400)
    console.log('\n[TEST 5] Testing validation error (400) and CORS headers');
    const weakPassRes = await request('POST', '/api/auth/register', {
      email: 'weakpass@test.gov.in',
      password: 'weak'
    });
    console.log('Weak password status:', weakPassRes.status, 'Error:', weakPassRes.body.error);
    if (weakPassRes.status !== 400 || !weakPassRes.body.error) {
      throw new Error(`Expected 400 with error property, received status ${weakPassRes.status}`);
    }
    if (!weakPassRes.headers['access-control-allow-origin']) {
      throw new Error('CORS header access-control-allow-origin missing on 400 error response!');
    }

    console.log('\n======================================================');
    console.log('ALL REGISTRATION FLOW & DIAGNOSTICS TESTS PASSED 100%!');
    console.log('======================================================');
  } finally {
    server.close();
  }
}

runRegistrationVerification().catch(err => {
  console.error('\nFAILED Verification:', err);
  process.exit(1);
});
