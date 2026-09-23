const db = require('../config/db');

/**
 * Fetch profile for authenticated user
 * GET /api/profile
 */
async function getProfile(req, res, next) {
  try {
    const result = await db.query('SELECT * FROM profiles WHERE user_id = $1', [req.user.id]);
    const profile = result.rows[0] || null;

    let completionPercentage = 0;
    let isProfileComplete = false;
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
        profile,
        profileComplete: isProfileComplete,
        completion_percentage: completionPercentage,
        is_complete: isProfileComplete
      }
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Create or update profile for authenticated user
 * PUT /api/profile
 */
async function updateProfile(req, res, next) {
  try {
    const userId = req.user.id;
    const {
      age,
      state,
      occupation,
      annual_income,
      education_level,
      employment_status,
      marital_status,
      special_category
    } = req.body;

    // Atomic Upsert into profiles table
    const upsertSql = `
      INSERT INTO profiles 
        (user_id, age, state, occupation, annual_income, education_level, employment_status, marital_status, special_category, updated_at)
      VALUES 
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
      ON CONFLICT (user_id) DO UPDATE SET
        age = EXCLUDED.age,
        state = EXCLUDED.state,
        occupation = EXCLUDED.occupation,
        annual_income = EXCLUDED.annual_income,
        education_level = EXCLUDED.education_level,
        employment_status = EXCLUDED.employment_status,
        marital_status = EXCLUDED.marital_status,
        special_category = EXCLUDED.special_category,
        updated_at = NOW()
      RETURNING *;
    `;

    const result = await db.query(upsertSql, [
      userId,
      age,
      state,
      occupation,
      annual_income,
      education_level,
      employment_status,
      marital_status || 'Single',
      special_category || 'None'
    ]);

    const savedProfile = result.rows[0];

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      profileComplete: true,
      profile: savedProfile,
      data: {
        profile: savedProfile,
        profileComplete: true,
        completion_percentage: 100,
        is_complete: true
      }
    });
  } catch (err) {
    if (err.name === 'ZodError') {
      return res.status(400).json({ error: "Validation failed", details: err.errors });
    }
    console.error("[Profile Update Error]:", err);
    next(err);
  }
}

module.exports = {
  getProfile,
  updateProfile
};
