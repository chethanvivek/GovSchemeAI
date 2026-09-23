const db = require('../config/db');

/**
 * Fetch all tracked schemes for the authenticated user
 * GET /api/tracker
 */
async function getTrackedSchemes(req, res, next) {
  try {
    const userId = req.user.id;
    const sql = `
      SELECT 
        us.id,
        us.user_id,
        us.scheme_id,
        us.status,
        us.notes,
        us.created_at,
        us.updated_at,
        s.name AS scheme_name,
        s.category AS scheme_category,
        s.benefits AS scheme_benefits,
        s.official_application_url,
        s.applicable_state
      FROM user_schemes us
      JOIN schemes s ON us.scheme_id = s.id
      WHERE us.user_id = $1
      ORDER BY us.updated_at DESC
    `;

    const result = await db.query(sql, [userId]);
    return res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Add or update scheme in user's tracker
 * POST /api/tracker
 */
async function addTrackedScheme(req, res, next) {
  try {
    const userId = req.user.id;
    const { scheme_id, status, notes } = req.body;

    // Verify scheme exists
    const schemeCheck = await db.query('SELECT id, name FROM schemes WHERE id = $1', [scheme_id]);
    if (schemeCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Scheme not found'
      });
    }

    // Check if already tracked
    const existing = await db.query(
      'SELECT id FROM user_schemes WHERE user_id = $1 AND scheme_id = $2',
      [userId, scheme_id]
    );

    let savedItem;
    if (existing.rows.length > 0) {
      // Update existing tracker record
      const updateSql = `
        UPDATE user_schemes 
        SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
        WHERE user_id = $3 AND scheme_id = $4
        RETURNING *
      `;
      const updateRes = await db.query(updateSql, [status || 'Saved', notes, userId, scheme_id]);
      savedItem = updateRes.rows[0];
    } else {
      // Insert new tracker record
      const insertSql = `
        INSERT INTO user_schemes (user_id, scheme_id, status, notes, created_at, updated_at)
        VALUES ($1, $2, $3, $4, NOW(), NOW())
        RETURNING *
      `;
      const insertRes = await db.query(insertSql, [
        userId,
        scheme_id,
        status || 'Saved',
        notes || ''
      ]);
      savedItem = insertRes.rows[0];
    }

    return res.status(200).json({
      success: true,
      message: 'Scheme added to application tracker',
      data: savedItem
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Update tracked scheme status or notes
 * PUT /api/tracker/:id
 */
async function updateTrackedScheme(req, res, next) {
  try {
    const userId = req.user.id;
    const trackerId = req.params.id;
    const { status, notes } = req.body;

    const updateSql = `
      UPDATE user_schemes 
      SET status = $1, notes = COALESCE($2, notes), updated_at = NOW()
      WHERE id = $3 AND user_id = $4
      RETURNING *
    `;

    const result = await db.query(updateSql, [status, notes, trackerId, userId]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Tracked scheme record not found or unauthorized'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Application status updated',
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Remove scheme from tracker
 * DELETE /api/tracker/:id
 */
async function removeTrackedScheme(req, res, next) {
  try {
    const userId = req.user.id;
    const trackerId = req.params.id;

    await db.query('DELETE FROM user_schemes WHERE id = $1 AND user_id = $2', [trackerId, userId]);

    return res.status(200).json({
      success: true,
      message: 'Scheme removed from application tracker'
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getTrackedSchemes,
  addTrackedScheme,
  updateTrackedScheme,
  removeTrackedScheme
};
