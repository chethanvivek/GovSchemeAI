const db = require('../config/db');
const { discoverSchemeWithSearch } = require('../services/geminiService');

/**
 * Fetch schemes with search, category, state, and target group filtering
 * GET /api/schemes
 */
async function getSchemes(req, res, next) {
  try {
    const { search, category, state, target_group, sort } = req.query;

    const result = await db.query('SELECT * FROM schemes ORDER BY name ASC');
    let schemes = result.rows || [];

    // Filter: search text
    if (search && search.trim() !== '') {
      const q = search.toLowerCase().trim();
      schemes = schemes.filter(
        s =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.category && s.category.toLowerCase().includes(q)) ||
          (s.target_group && s.target_group.toLowerCase().includes(q))
      );
    }

    // Filter: category
    if (category && category !== 'ALL') {
      schemes = schemes.filter(s => s.category && s.category.toLowerCase() === category.toLowerCase());
    }

    // Filter: state
    if (state && state !== 'ALL') {
      schemes = schemes.filter(
        s => s.applicable_state === 'ALL' || (s.applicable_state && s.applicable_state.toLowerCase() === state.toLowerCase())
      );
    }

    // Filter: target_group
    if (target_group && target_group !== 'ALL') {
      schemes = schemes.filter(
        s => s.target_group && s.target_group.toLowerCase() === target_group.toLowerCase()
      );
    }

    // Sorting
    if (sort === 'name_desc') {
      schemes.sort((a, b) => b.name.localeCompare(a.name));
    } else if (sort === 'newest') {
      schemes.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
    } else {
      // Default: name_asc
      schemes.sort((a, b) => a.name.localeCompare(b.name));
    }

    return res.status(200).json({
      success: true,
      count: schemes.length,
      data: schemes
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Fetch single scheme by ID
 * GET /api/schemes/:id
 */
async function getSchemeById(req, res, next) {
  try {
    const { id } = req.params;

    const result = await db.query('SELECT * FROM schemes WHERE id = $1', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Government scheme not found'
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (err) {
    next(err);
  }
}

/**
 * Real-time web discovery and automatic database synchronization for uncataloged schemes
 * POST /api/schemes/discover-live
 */
async function discoverLiveScheme(req, res, next) {
  try {
    const query = (req.body.query || req.query.query || '').trim();
    const state = req.body.state || req.query.state || 'ALL';
    const category = req.body.category || req.query.category || 'ALL';

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required for live web discovery'
      });
    }

    // 1. Check if scheme already exists in local database by exact or close name match
    const existing = await db.query(
      'SELECT * FROM schemes WHERE LOWER(name) = LOWER($1) OR LOWER(name) LIKE LOWER($2) LIMIT 1',
      [query, `%${query}%`]
    );

    if (existing.rows && existing.rows.length > 0) {
      return res.status(200).json({
        success: true,
        is_live_discovered: false,
        message: 'Scheme found in database',
        data: existing.rows[0]
      });
    }

    // 2. Discover scheme using Gemini with Google Search Grounding (or verified fallback)
    const discovered = await discoverSchemeWithSearch(query, { state, category });

    // 3. Double-check if the normalized discovered name exists in the database
    const exactNameMatch = await db.query(
      'SELECT * FROM schemes WHERE LOWER(name) = LOWER($1) LIMIT 1',
      [discovered.name]
    );

    if (exactNameMatch.rows && exactNameMatch.rows.length > 0) {
      return res.status(200).json({
        success: true,
        is_live_discovered: false,
        message: 'Scheme already available in database',
        data: exactNameMatch.rows[0]
      });
    }

    // 4. Ingest newly discovered scheme into Supabase schemes table
    const insertResult = await db.query(
      `INSERT INTO schemes (
        name, description, benefits, eligibility_criteria, required_documents,
        applicable_state, official_application_url, official_source_url,
        category, target_group, is_live_discovered, last_updated_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, true, NOW())
      RETURNING *`,
      [
        discovered.name,
        discovered.description,
        discovered.benefits,
        typeof discovered.eligibility_criteria === 'object'
          ? JSON.stringify(discovered.eligibility_criteria)
          : discovered.eligibility_criteria,
        typeof discovered.required_documents === 'object'
          ? JSON.stringify(discovered.required_documents)
          : discovered.required_documents,
        discovered.applicable_state || 'ALL',
        discovered.official_application_url,
        discovered.official_source_url,
        discovered.category,
        discovered.target_group
      ]
    );

    const savedScheme = insertResult.rows?.[0] || {
      ...discovered,
      is_live_discovered: true,
      last_updated_at: new Date().toISOString()
    };

    return res.status(201).json({
      success: true,
      is_live_discovered: true,
      message: 'New scheme successfully discovered from web and synchronized to database',
      data: savedScheme
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getSchemes,
  getSchemeById,
  discoverLiveScheme
};
