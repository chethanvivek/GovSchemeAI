process.env.NODE_ENV = 'test';
const http = require('http');
const { app, startServer } = require('../src/index');

async function testCustomProfile() {
  console.log('--- Testing Custom "Other" Profile Fields in Backend ---');
  const server = await startServer(5097);
  const baseUrl = 'http://localhost:5097';

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
    // 1. Register test user
    const testEmail = `custom_profile_${Date.now()}@gov.in`;
    const regRes = await req('POST', '/api/auth/register', {
      email: testEmail,
      password: 'Password123!'
    });
    const token = regRes.body.data.token;
    console.log('✓ Registered user:', testEmail);

    // 2. Submit profile with custom manual strings
    const customPayload = {
      age: 26,
      state: "Overseas Indian Mission Territory",
      occupation: "Robotics & Embedded Systems Specialist",
      annual_income: 420000,
      education_level: "Integrated Dual Degree (B.Tech + M.Tech in Nanotechnology)",
      employment_status: "Independent Research Contractor"
    };

    const updateRes = await req('PUT', '/api/profile', customPayload, token);
    console.log('✓ PUT /api/profile with custom strings -> Status:', updateRes.status, '| Message:', updateRes.body.message);
    if (updateRes.status !== 200 || updateRes.body.profile?.occupation !== customPayload.occupation) {
      throw new Error(`Failed to save custom profile values. Status: ${updateRes.status}`);
    }

    // 3. Retrieve profile to verify persistence of custom values
    const getRes = await req('GET', '/api/profile', null, token);
    console.log('✓ GET /api/profile restored:');
    console.log('   - State:', getRes.body.data.profile.state);
    console.log('   - Occupation:', getRes.body.data.profile.occupation);
    console.log('   - Education:', getRes.body.data.profile.education_level);
    console.log('   - Employment:', getRes.body.data.profile.employment_status);

    if (
      getRes.body.data.profile.state !== customPayload.state ||
      getRes.body.data.profile.occupation !== customPayload.occupation ||
      getRes.body.data.profile.education_level !== customPayload.education_level ||
      getRes.body.data.profile.employment_status !== customPayload.employment_status
    ) {
      throw new Error('Custom values did not match persisted values in database');
    }

    console.log('\n====================================================');
    console.log('✓ All Custom String & "Other" Validation Tests PASSED!');
    console.log('====================================================\n');
  } finally {
    server.close();
  }
}

testCustomProfile().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
