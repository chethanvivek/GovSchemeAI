process.env.NODE_ENV = 'test';
const http = require('http');
const { app, startServer } = require('../src/index');

async function testProfileEndpoint() {
  console.log('--- Testing Profile Validation & PUT /api/profile ---');
  const server = await startServer(5099);
  const baseUrl = 'http://localhost:5099';

  function req(method, path, body, token) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const r = http.request({
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
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
    // 1. Register test user
    const testEmail = `profile_test_${Date.now()}@gov.in`;
    const regRes = await req('POST', '/api/auth/register', {
      email: testEmail,
      password: 'SecurePassword123!'
    });
    const token = regRes.body.data.token;
    console.log('✓ Registered test user:', testEmail);

    // 2. Test Zod validation failure: age < 16
    const invalidAgeRes = await req('PUT', '/api/profile', {
      age: 15,
      state: 'Andhra Pradesh',
      occupation: 'Student',
      annual_income: 0,
      education_level: 'Undergraduate',
      employment_status: 'Unemployed'
    }, token);

    console.log('✓ Age 15 rejected (Status:', invalidAgeRes.status, ') Message:', invalidAgeRes.body.error || invalidAgeRes.body.message);
    if (invalidAgeRes.status !== 400) {
      throw new Error(`Expected status 400 for age 15, got ${invalidAgeRes.status}`);
    }

    // 3. Test Zod validation success: age = 16 (minimum valid age)
    const validProfileRes = await req('PUT', '/api/profile', {
      age: 16,
      state: 'Andhra Pradesh',
      occupation: 'Student',
      annual_income: 0,
      education_level: 'Undergraduate',
      employment_status: 'Unemployed'
    }, token);

    console.log('✓ Age 16 accepted (Status:', validProfileRes.status, ') Profile:', validProfileRes.body.profile?.age);
    if (validProfileRes.status !== 200 || validProfileRes.body.profile?.age !== 16) {
      throw new Error(`Expected status 200 with age 16, got ${validProfileRes.status}`);
    }

    // 4. Test GET /api/profile
    const getRes = await req('GET', '/api/profile', null, token);
    console.log('✓ GET /api/profile returned saved profile. State:', getRes.body.data?.profile?.state);
    if (getRes.status !== 200 || getRes.body.data?.profile?.state !== 'Andhra Pradesh') {
      throw new Error('Failed to retrieve saved profile');
    }

    console.log('\nAll Profile Validation & Endpoint tests PASSED successfully!');
  } finally {
    server.close();
  }
}

testProfileEndpoint().catch(err => {
  console.error('Test error:', err);
  process.exit(1);
});
