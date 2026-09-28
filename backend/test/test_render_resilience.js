process.env.NODE_ENV = 'test';
const http = require('http');
const { app, startServer } = require('../src/index');
const db = require('../src/config/db');

async function runRenderResilienceTests() {
  console.log('=== Starting Render & 502 Resilience Verification ===');

  // Test 1: Verify trust proxy is enabled
  console.log('\n[TEST 1] Checking trust proxy setting...');
  const trustProxy = app.get('trust proxy');
  console.log('trust proxy value:', trustProxy);
  if (!trustProxy) {
    throw new Error('Expected trust proxy to be enabled (1 or true)');
  }

  const server = await startServer(5188);
  const baseUrl = 'http://127.0.0.1:5188';

  function request(method, path, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(path, baseUrl);
      const reqHeaders = {
        'Content-Type': 'application/json',
        'Origin': 'https://gov-scheme-ai-rho.vercel.app',
        'X-Forwarded-For': '198.51.100.1',
        ...headers
      };

      const req = http.request({
        method,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        headers: reqHeaders
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
    // Test 2: Verify server listens on 0.0.0.0
    console.log('\n[TEST 2] Verifying server address binding...');
    const address = server.address();
    console.log('Server address info:', address);
    if (address.address !== '0.0.0.0' && address.address !== '::') {
      throw new Error(`Expected server to bind to 0.0.0.0, but got ${address.address}`);
    }

    // Test 3: Health check endpoint /api/health returns 200 with status and timestamp
    console.log('\n[TEST 3] Testing GET /api/health...');
    const healthRes = await request('GET', '/api/health');
    console.log('Health check response:', healthRes.body);
    if (healthRes.status !== 200) {
      throw new Error(`Expected status 200 from /api/health, got ${healthRes.status}`);
    }
    if (healthRes.body.status !== 'healthy' || !healthRes.body.timestamp) {
      throw new Error('Health check payload missing status: healthy or timestamp');
    }

    // Test 4: Root health check alias /health
    console.log('\n[TEST 4] Testing GET /health alias...');
    const rootHealthRes = await request('GET', '/health');
    if (rootHealthRes.status !== 200 || rootHealthRes.body.status !== 'healthy') {
      throw new Error('Root /health alias failed');
    }

    // Test 5: Validation error (missing fields) returns 400 Bad Request
    console.log('\n[TEST 5] Testing 400 Bad Request on invalid inputs...');
    const badReq1 = await request('POST', '/api/auth/register', {});
    console.log('Missing body response status:', badReq1.status, 'Error:', badReq1.body.error);
    if (badReq1.status !== 400 || !badReq1.body.error) {
      throw new Error(`Expected 400 Bad Request with error message, got ${badReq1.status}`);
    }

    const badReq2 = await request('POST', '/api/auth/register', { email: 'notanemail', password: 'Short' });
    console.log('Invalid email response status:', badReq2.status, 'Error:', badReq2.body.error);
    if (badReq2.status !== 400 || !badReq2.body.error) {
      throw new Error(`Expected 400 Bad Request for invalid email, got ${badReq2.status}`);
    }

    // Test 6: Valid registration returns 201
    const testEmail = `render_test_${Date.now()}@example.gov.in`;
    console.log('\n[TEST 6] Testing valid registration:', testEmail);
    const regRes = await request('POST', '/api/auth/register', {
      email: testEmail,
      password: 'StrongPassword123!'
    });
    console.log('Valid registration status:', regRes.status);
    if (regRes.status !== 201 || !regRes.body.data?.token) {
      throw new Error(`Expected 201 on valid registration, got ${regRes.status}`);
    }

    // Test 7: Duplicate registration returns 409 Conflict
    console.log('\n[TEST 7] Testing 409 Conflict on duplicate email...');
    const dupRes = await request('POST', '/api/auth/register', {
      email: testEmail,
      password: 'StrongPassword123!'
    });
    console.log('Duplicate status:', dupRes.status, 'Error:', dupRes.body.error);
    if (dupRes.status !== 409 || !dupRes.body.error) {
      throw new Error(`Expected 409 Conflict for duplicate email, got ${dupRes.status}`);
    }

    console.log('\n======================================================');
    console.log('ALL RENDER & 502 RESILIENCE VERIFICATIONS PASSED 100%!');
    console.log('======================================================\n');
  } finally {
    server.close();
  }
}

runRenderResilienceTests()
  .then(() => {
    process.exit(0);
  })
  .catch(err => {
    console.error('\nFAILED Resilience Verification:', err);
    process.exit(1);
  });
