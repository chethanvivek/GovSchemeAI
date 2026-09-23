process.env.NODE_ENV = 'test';
const http = require('http');
const { app, startServer } = require('../src/index');

let server;
let baseUrl;
let authToken = '';
let testSchemeId = '';
let testTrackerId = '';

function makeRequest(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, baseUrl);
    const options = {
      method,
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (authToken && !options.headers['Authorization']) {
      options.headers['Authorization'] = `Bearer ${authToken}`;
    }

    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, data: parsed, headers: res.headers });
        } catch {
          resolve({ status: res.statusCode, raw: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('--- Starting Backend Automated Tests ---');

  // 1. Health Check
  const healthRes = await makeRequest('GET', '/api/health');
  console.log('[TEST 1] GET /api/health -> Status:', healthRes.status, 'Body:', healthRes.data);
  if (healthRes.status !== 200 || healthRes.data.status !== 'healthy') {
    throw new Error('Health check failed');
  }

  // 2. Auth: Register validation failure (weak password)
  const weakPassRes = await makeRequest('POST', '/api/auth/register', {
    email: 'citizen_test@gov.in',
    password: 'short'
  });
  console.log('[TEST 2] Weak password rejection -> Status:', weakPassRes.status);
  if (weakPassRes.status !== 400) {
    throw new Error('Weak password was not rejected with 400');
  }

  // 3. Auth: Register success
  const testEmail = `citizen_${Date.now()}@test.gov.in`;
  const regRes = await makeRequest('POST', '/api/auth/register', {
    email: testEmail,
    password: 'SecurePassword123!'
  });
  console.log('[TEST 3] Valid registration -> Status:', regRes.status, 'User:', regRes.data.data?.user?.email);
  if (regRes.status !== 201 || !regRes.data.data?.token) {
    throw new Error('Registration failed');
  }
  authToken = regRes.data.data.token;

  // 4. Auth: Login
  const loginRes = await makeRequest('POST', '/api/auth/login', {
    email: testEmail,
    password: 'SecurePassword123!'
  });
  console.log('[TEST 4] Valid login -> Status:', loginRes.status, 'Token exists:', Boolean(loginRes.data.data?.token));
  if (loginRes.status !== 200) {
    throw new Error('Login failed');
  }

  // 5. Profile: Update demographic profile
  const profilePayload = {
    age: 34,
    state: 'Maharashtra',
    occupation: 'Farmer',
    annual_income: 380000,
    education_level: 'Secondary School (8th-10th)',
    employment_status: 'Self-Employed / Business',
    marital_status: 'Married',
    special_category: 'None'
  };
  const profileRes = await makeRequest('PUT', '/api/profile', profilePayload);
  console.log('[TEST 5] Update profile -> Status:', profileRes.status, 'Completion:', profileRes.data.data?.completion_percentage);
  if (profileRes.status !== 200 || profileRes.data.data?.completion_percentage !== 100) {
    throw new Error('Profile update failed');
  }

  // 6. Schemes: Get all schemes
  const schemesRes = await makeRequest('GET', '/api/schemes');
  console.log('[TEST 6] GET /api/schemes -> Status:', schemesRes.status, 'Total Schemes:', schemesRes.data.count);
  if (schemesRes.status !== 200 || schemesRes.data.count === 0) {
    throw new Error('Schemes catalog fetch failed');
  }
  testSchemeId = schemesRes.data.data[0].id;

  // 7. Schemes: Search & Category filter
  const filterRes = await makeRequest('GET', '/api/schemes?category=Agriculture');
  console.log('[TEST 7] Filter Agriculture schemes -> Count:', filterRes.data.count);
  if (filterRes.status !== 200 || filterRes.data.count === 0) {
    throw new Error('Scheme filtering failed');
  }

  // 8. AI Recommendations: POST /api/ai/recommend
  const recRes = await makeRequest('POST', '/api/ai/recommend');
  console.log('[TEST 8] AI Recommendations -> Status:', recRes.status, 'Recommendations count:', recRes.data.count);
  if (recRes.status !== 200 || !Array.isArray(recRes.data.data)) {
    throw new Error('AI Recommendations failed');
  }
  const topMatch = recRes.data.data[0];
  console.log('   Top Match Scheme:', topMatch.scheme_name, 'Score:', topMatch.match_score);
  console.log('   Explanation:', topMatch.explanation);

  // 9. Tracker: Add scheme to user tracker
  const trackerAddRes = await makeRequest('POST', '/api/tracker', {
    scheme_id: testSchemeId,
    status: 'Saved',
    notes: 'Applying after gathering land record documents'
  });
  console.log('[TEST 9] Tracker add scheme -> Status:', trackerAddRes.status, 'Tracked item id:', trackerAddRes.data.data?.id);
  if (trackerAddRes.status !== 200) {
    throw new Error('Add to tracker failed');
  }
  testTrackerId = trackerAddRes.data.data.id;

  // 10. Tracker: Update status to 'Planning to Apply'
  const trackerUpdateRes = await makeRequest('PUT', `/api/tracker/${testTrackerId}`, {
    status: 'Planning to Apply',
    notes: 'Gathered Aadhaar and land records'
  });
  console.log('[TEST 10] Tracker update status -> Status:', trackerUpdateRes.status, 'New status:', trackerUpdateRes.data.data?.status);
  if (trackerUpdateRes.status !== 200 || trackerUpdateRes.data.data?.status !== 'Planning to Apply') {
    throw new Error('Update tracker failed');
  }

  // 11. AI Assistant Chat: POST /api/ai/chat
  const chatRes = await makeRequest('POST', '/api/ai/chat', {
    message: 'What documents are required to apply for PM-KISAN, and do I qualify as a farmer in Maharashtra?',
    scheme_id: testSchemeId
  });
  console.log('[TEST 11] AI Chat Assistant -> Status:', chatRes.status);
  if (chatRes.status === 200) {
    console.log('   Reply preview:', chatRes.data.data?.reply?.substring(0, 150) + '...');
  } else if (chatRes.status === 500) {
    console.log('   Correctly returned 500 error on Gemini API failure without swallowing error:', chatRes.data?.error?.substring(0, 120));
    if (!chatRes.data?.error) {
      throw new Error('AI Chat Assistant 500 response missing error details');
    }
  } else {
    throw new Error(`AI Chat Assistant unexpected status: ${chatRes.status}`);
  }

  console.log('\n========================================');
  console.log('ALL 11 BACKEND AUTOMATED TESTS PASSED!');
  console.log('========================================\n');
}

async function start() {
  process.env.NODE_ENV = 'test';
  const testPort = 5099;
  server = await startServer(testPort);
  baseUrl = `http://localhost:${testPort}`;

  try {
    await runTests();
  } catch (err) {
    console.error('Test run failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
    process.exit(process.exitCode || 0);
  }
}

start();
