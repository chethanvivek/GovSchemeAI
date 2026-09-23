const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const { SEED_SCHEMES } = require('../models/seedData');

let pool = null;
let isPostgresConnected = false;

// Embedded fallback store file in case PostgreSQL / Supabase URL is not configured
const FALLBACK_DATA_DIR = path.join(__dirname, '../../data');
const FALLBACK_DATA_FILE = path.join(FALLBACK_DATA_DIR, 'local_db.json');

function ensureFallbackData() {
  if (!fs.existsSync(FALLBACK_DATA_DIR)) {
    fs.mkdirSync(FALLBACK_DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(FALLBACK_DATA_FILE)) {
    const initialData = {
      users: [],
      profiles: [],
      schemes: SEED_SCHEMES.map((scheme, index) => ({
        id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
        name: scheme.name,
        description: scheme.description,
        benefits: scheme.benefits,
        eligibility_criteria: scheme.eligibility_criteria,
        required_documents: scheme.required_documents,
        applicable_state: scheme.applicable_state,
        official_application_url: scheme.official_application_url,
        official_source_url: scheme.official_source_url,
        category: scheme.category,
        target_group: scheme.target_group,
        created_at: new Date().toISOString()
      })),
      user_schemes: []
    };
    fs.writeFileSync(FALLBACK_DATA_FILE, JSON.stringify(initialData, null, 2));
  } else {
    try {
      const data = JSON.parse(fs.readFileSync(FALLBACK_DATA_FILE, 'utf-8'));
      if (Array.isArray(data.schemes)) {
        let changed = false;
        SEED_SCHEMES.forEach((scheme, index) => {
          const found = data.schemes.find(s => s.name === scheme.name);
          if (!found) {
            data.schemes.push({
              id: `00000000-0000-0000-0000-${String(index + 1).padStart(12, '0')}`,
              ...scheme,
              created_at: new Date().toISOString()
            });
            changed = true;
          } else {
            found.category = scheme.category;
            found.target_group = scheme.target_group;
            found.benefits = scheme.benefits;
            found.eligibility_criteria = scheme.eligibility_criteria;
            found.required_documents = scheme.required_documents;
            found.applicable_state = scheme.applicable_state;
            changed = true;
          }
        });
        if (changed) {
          fs.writeFileSync(FALLBACK_DATA_FILE, JSON.stringify(data, null, 2));
        }
      }
    } catch {
      // Ignore
    }
  }
}

function readFallbackData() {
  ensureFallbackData();
  try {
    const content = fs.readFileSync(FALLBACK_DATA_FILE, 'utf-8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading fallback DB, re-initializing:', err);
    ensureFallbackData();
    return JSON.parse(fs.readFileSync(FALLBACK_DATA_FILE, 'utf-8'));
  }
}

function writeFallbackData(data) {
  ensureFallbackData();
  fs.writeFileSync(FALLBACK_DATA_FILE, JSON.stringify(data, null, 2));
}

/**
 * Initializes the database connection and tables.
 */
async function initDB() {
  const dbUrl = process.env.DATABASE_URL;

  if (dbUrl && dbUrl.trim() !== '' && !dbUrl.includes('postgres:postgres@localhost')) {
    try {
      console.log('Connecting to PostgreSQL / Supabase...');
      pool = new Pool({
        connectionString: dbUrl,
        ssl: dbUrl.includes('localhost') ? false : { rejectUnauthorized: false }
      });

      const client = await pool.connect();
      console.log('Successfully connected to PostgreSQL database!');

      // Run DDL migrations
      const schemaPath = path.join(__dirname, '../models/schema.sql');
      if (fs.existsSync(schemaPath)) {
        const schemaSql = fs.readFileSync(schemaPath, 'utf-8');
        await client.query(schemaSql);
        console.log('Database tables verified and initialized.');
      }

      // Ensure live discovery columns exist
      await client.query(`
        ALTER TABLE schemes ADD COLUMN IF NOT EXISTS is_live_discovered BOOLEAN DEFAULT FALSE;
        ALTER TABLE schemes ADD COLUMN IF NOT EXISTS last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
      `);

      // Synchronize schemes table with expanded SEED_SCHEMES
      console.log(`Synchronizing ${SEED_SCHEMES.length} verified schemes into Supabase PostgreSQL...`);
      for (const scheme of SEED_SCHEMES) {
        const existing = await client.query('SELECT id FROM schemes WHERE name = $1', [scheme.name]);
        if (existing.rows.length === 0) {
          await client.query(
            `INSERT INTO schemes 
              (name, description, benefits, eligibility_criteria, required_documents, applicable_state, official_application_url, official_source_url, category, target_group)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
            [
              scheme.name,
              scheme.description,
              scheme.benefits,
              JSON.stringify(scheme.eligibility_criteria),
              JSON.stringify(scheme.required_documents),
              scheme.applicable_state,
              scheme.official_application_url,
              scheme.official_source_url,
              scheme.category,
              scheme.target_group
            ]
          );
        } else {
          await client.query(
            `UPDATE schemes SET
              description = $2,
              benefits = $3,
              eligibility_criteria = $4,
              required_documents = $5,
              applicable_state = $6,
              official_application_url = $7,
              official_source_url = $8,
              category = $9,
              target_group = $10
             WHERE id = $1`,
            [
              existing.rows[0].id,
              scheme.description,
              scheme.benefits,
              JSON.stringify(scheme.eligibility_criteria),
              JSON.stringify(scheme.required_documents),
              scheme.applicable_state,
              scheme.official_application_url,
              scheme.official_source_url,
              scheme.category,
              scheme.target_group
            ]
          );
        }
      }
      console.log(`Synchronized all ${SEED_SCHEMES.length} schemes successfully.`);

      client.release();
      isPostgresConnected = true;
      return;
    } catch (err) {
      console.warn('PostgreSQL connection attempt failed or credentials not yet set:', err.message);
      console.log('Activating high-fidelity local database layer with full seed data for instant development.');
      isPostgresConnected = false;
    }
  } else {
    console.log('No remote DATABASE_URL specified. Initializing embedded local database engine...');
  }

  ensureFallbackData();
}

/**
 * Universal Query Adapter:
 * Uses PostgreSQL pool when connected; seamlessly handles queries on local store otherwise.
 */
async function query(text, params = []) {
  if (isPostgresConnected && pool) {
    return pool.query(text, params);
  }

  // --- Local Fallback Query Emulator for standard CRUD ---
  const normalized = text.trim().replace(/\s+/g, ' ');
  const data = readFallbackData();

  // 1. SELECT * FROM schemes
  if (normalized.includes('FROM schemes')) {
    let rows = [...data.schemes];

    // Filter by id
    const idMatch = text.match(/id\s*=\s*\$([0-9]+)/i);
    if (idMatch) {
      const paramIdx = parseInt(idMatch[1], 10) - 1;
      const targetId = params[paramIdx];
      rows = rows.filter(s => s.id === targetId);
      return { rows, rowCount: rows.length };
    }

    // Filter by name (e.g. WHERE LOWER(name) = LOWER($1))
    if (normalized.includes('LOWER(name) = LOWER($1)')) {
      const targetName = String(params[0] || '').toLowerCase().trim();
      rows = rows.filter(s => s.name && s.name.toLowerCase().trim() === targetName);
      return { rows, rowCount: rows.length };
    }

    return { rows, rowCount: rows.length };
  }

  // 1b. INSERT INTO schemes
  if (normalized.startsWith('INSERT INTO schemes')) {
    const crypto = require('crypto');
    const newScheme = {
      id: crypto.randomUUID(),
      name: params[0],
      description: params[1],
      benefits: params[2],
      eligibility_criteria: typeof params[3] === 'string' ? JSON.parse(params[3]) : params[3],
      required_documents: typeof params[4] === 'string' ? JSON.parse(params[4]) : params[4],
      applicable_state: params[5] || 'ALL',
      official_application_url: params[6] || '',
      official_source_url: params[7] || '',
      category: params[8] || 'General',
      target_group: params[9] || 'All Citizens',
      is_live_discovered: params[10] !== undefined ? Boolean(params[10]) : true,
      last_updated_at: new Date().toISOString(),
      created_at: new Date().toISOString()
    };
    data.schemes.push(newScheme);
    writeFallbackData(data);
    return { rows: [newScheme], rowCount: 1 };
  }

  // 2. Auth: users
  if (normalized.startsWith('SELECT') && normalized.includes('FROM users') && normalized.includes('email')) {
    const targetEmail = String(params[0] || '').toLowerCase().trim();
    const user = data.users.find(u => u.email && u.email.toLowerCase().trim() === targetEmail);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  if (normalized.startsWith('SELECT') && normalized.includes('FROM users WHERE id = $1')) {
    const user = data.users.find(u => u.id === params[0]);
    return { rows: user ? [user] : [], rowCount: user ? 1 : 0 };
  }

  if (normalized.startsWith('INSERT INTO users')) {
    const crypto = require('crypto');
    const newUser = {
      id: crypto.randomUUID(),
      email: params[0],
      password_hash: params[1],
      created_at: new Date().toISOString()
    };
    data.users.push(newUser);
    writeFallbackData(data);
    return { rows: [newUser], rowCount: 1 };
  }

  // 3. Profiles
  if (normalized.includes('FROM profiles WHERE user_id = $1')) {
    const profile = data.profiles.find(p => p.user_id === params[0]);
    return { rows: profile ? [profile] : [], rowCount: profile ? 1 : 0 };
  }

  if (normalized.includes('INSERT INTO profiles') || normalized.includes('ON CONFLICT (user_id)')) {
    const userId = params[0];
    const existingIndex = data.profiles.findIndex(p => p.user_id === userId);
    const newProfile = {
      user_id: userId,
      age: params[1] !== undefined ? Number(params[1]) : null,
      state: params[2] || '',
      occupation: params[3] || '',
      annual_income: params[4] !== undefined ? Number(params[4]) : null,
      education_level: params[5] || '',
      employment_status: params[6] || '',
      marital_status: params[7] || '',
      special_category: params[8] || '',
      updated_at: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      data.profiles[existingIndex] = newProfile;
    } else {
      data.profiles.push(newProfile);
    }
    writeFallbackData(data);
    return { rows: [newProfile], rowCount: 1 };
  }

  // 4. User Schemes (Tracker)
  if (normalized.includes('FROM user_schemes') && normalized.includes('WHERE user_id = $1') && normalized.includes('JOIN schemes')) {
    const userItems = data.user_schemes.filter(us => us.user_id === params[0]);
    const rows = userItems.map(us => {
      const scheme = data.schemes.find(s => s.id === us.scheme_id) || {};
      return {
        ...us,
        scheme_name: scheme.name,
        scheme_category: scheme.category,
        scheme_benefits: scheme.benefits,
        official_application_url: scheme.official_application_url
      };
    });
    return { rows, rowCount: rows.length };
  }

  if (normalized.includes('FROM user_schemes WHERE user_id = $1 AND scheme_id = $2')) {
    const item = data.user_schemes.find(us => us.user_id === params[0] && us.scheme_id === params[1]);
    return { rows: item ? [item] : [], rowCount: item ? 1 : 0 };
  }

  if (normalized.startsWith('INSERT INTO user_schemes')) {
    const crypto = require('crypto');
    const existing = data.user_schemes.find(us => us.user_id === params[0] && us.scheme_id === params[1]);
    if (existing) {
      existing.status = params[2] || existing.status;
      existing.notes = params[3] !== undefined ? params[3] : existing.notes;
      existing.updated_at = new Date().toISOString();
      writeFallbackData(data);
      return { rows: [existing], rowCount: 1 };
    }
    const newRecord = {
      id: crypto.randomUUID(),
      user_id: params[0],
      scheme_id: params[1],
      status: params[2] || 'Saved',
      notes: params[3] || '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    data.user_schemes.push(newRecord);
    writeFallbackData(data);
    return { rows: [newRecord], rowCount: 1 };
  }

  if (normalized.startsWith('UPDATE user_schemes SET status = $1')) {
    // UPDATE user_schemes SET status = $1, notes = $2, updated_at = NOW() WHERE id = $3 AND user_id = $4
    const item = data.user_schemes.find(us => us.id === params[2] && us.user_id === params[3]);
    if (item) {
      item.status = params[0];
      if (params[1] !== undefined) item.notes = params[1];
      item.updated_at = new Date().toISOString();
      writeFallbackData(data);
      return { rows: [item], rowCount: 1 };
    }
    return { rows: [], rowCount: 0 };
  }

  if (normalized.startsWith('DELETE FROM user_schemes WHERE id = $1 AND user_id = $2')) {
    const initialLen = data.user_schemes.length;
    data.user_schemes = data.user_schemes.filter(us => !(us.id === params[0] && us.user_id === params[1]));
    const removed = initialLen - data.user_schemes.length;
    writeFallbackData(data);
    return { rows: [], rowCount: removed };
  }

  return { rows: [], rowCount: 0 };
}

module.exports = {
  initDB,
  query,
  isPostgres: () => isPostgresConnected
};
