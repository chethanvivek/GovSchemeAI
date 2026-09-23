const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_gov_schemes_2026_secure';
const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
};

function generateToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

/**
 * Register a new user
 * POST /api/auth/register
 */
async function register(req, res, next) {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    // Check if user already exists
    const existing = await db.query(
      'SELECT id FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))',
      [cleanEmail]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists'
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Insert user
    const insertRes = await db.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING id, email, created_at',
      [cleanEmail, passwordHash]
    );

    const newUser = insertRes.rows[0];
    const token = generateToken(newUser);

    // Set cookie
    res.cookie('token', token, COOKIE_OPTIONS);

    return res.status(201).json({
      success: true,
      message: 'Account created successfully',
      profileComplete: false,
      data: {
        user: { id: newUser.id, email: newUser.email },
        token,
        profileComplete: false,
        completion_percentage: 0
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Authenticate existing user
 * POST /api/auth/login
 */
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const cleanEmail = (email || '').trim().toLowerCase();

    console.log(`[Auth Login] Login attempt received for email: "${cleanEmail}"`);

    // Query custom public.users table directly with case-insensitive trimmed email
    const result = await db.query(
      'SELECT id, email, password_hash FROM users WHERE LOWER(TRIM(email)) = LOWER(TRIM($1))',
      [cleanEmail]
    );

    if (!result || result.rows.length === 0) {
      console.log(`[Auth Login] User not found for email: "${cleanEmail}"`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const user = result.rows[0];
    console.log(`[Auth Login] User found: ID=${user.id}, email="${user.email}". Comparing password hash...`);

    // Verify password with bcrypt.compare(plainTextPassword, passwordHash)
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      console.log(`[Auth Login] Hash mismatch: Password comparison failed for user "${user.email}"`);
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    console.log(`[Auth Login] Password verified successfully for user: "${user.email}"`);

    const token = generateToken(user);
    res.cookie('token', token, COOKIE_OPTIONS);

    // Look up profile dynamically by user.id in Supabase
    const profileRes = await db.query('SELECT * FROM profiles WHERE user_id = $1', [user.id]);
    const profile = profileRes.rows[0] || null;

    let isProfileComplete = false;
    let completionPercentage = 0;
    if (profile) {
      const requiredFields = ['age', 'state', 'occupation', 'annual_income', 'education_level', 'employment_status'];
      const filledCount = requiredFields.filter(f => profile[f] !== null && profile[f] !== undefined && profile[f] !== '').length;
      completionPercentage = Math.round((filledCount / requiredFields.length) * 100);
      isProfileComplete = filledCount === requiredFields.length;
    }

    return res.status(200).json({
      success: true,
      message: 'Authentication successful',
      profileComplete: isProfileComplete,
      data: {
        user: { id: user.id, email: user.email },
        token,
        profileComplete: isProfileComplete,
        completion_percentage: completionPercentage
      }
    });
  } catch (err) {
    console.error('[Auth Login] Unexpected error during login authentication:', err);
    next(err);
  }
}

/**
 * Get current authenticated user info & profile status
 * GET /api/auth/me or GET /api/user/me
 */
async function getMe(req, res, next) {
  try {
    const userRes = await db.query('SELECT id, email, created_at FROM users WHERE id = $1', [
      req.user.id
    ]);

    if (userRes.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'User account not found'
      });
    }

    const user = userRes.rows[0];

    // Look up profile strictly by authenticated req.user.id
    const profileRes = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);
    const profile = profileRes.rows[0] || null;

    let isProfileComplete = false;
    let completionPercentage = 0;
    if (profile) {
      const requiredFields = ['age', 'state', 'occupation', 'annual_income', 'education_level', 'employment_status'];
      const filledCount = requiredFields.filter(f => profile[f] !== null && profile[f] !== undefined && profile[f] !== '').length;
      completionPercentage = Math.round((filledCount / requiredFields.length) * 100);
      isProfileComplete = filledCount === requiredFields.length;
    }

    return res.status(200).json({
      success: true,
      profileComplete: isProfileComplete,
      data: {
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile,
        has_profile: Boolean(profile),
        profileComplete: isProfileComplete,
        profile_complete: isProfileComplete,
        completion_percentage: completionPercentage
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Logout
 * POST /api/auth/logout
 */
async function logout(req, res) {
  res.clearCookie('token', COOKIE_OPTIONS);
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully'
  });
}

module.exports = {
  register,
  login,
  getMe,
  logout
};
