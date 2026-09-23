const db = require('../config/db');
const geminiService = require('../services/geminiService');

const MANDATORY_DISCLAIMER = 'Disclaimer: Scheme information and AI recommendations are for informational assistance only. Final eligibility and approvals are determined by the respective government authorities.';

/**
 * Generate AI-powered eligibility recommendations for authenticated user
 * POST /api/ai/recommend
 */
async function recommendSchemes(req, res, next) {
  try {
    const userId = req.user.id;

    // Fetch user profile
    const profileRes = await db.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
    const profile = profileRes.rows[0];

    if (!profile || !profile.age || !profile.state || !profile.occupation) {
      return res.status(400).json({
        success: false,
        message: 'Please complete your demographic profile before requesting AI scheme recommendations.',
        requires_profile: true
      });
    }

    // Fetch schemes to evaluate
    const schemesRes = await db.query('SELECT * FROM schemes ORDER BY name ASC');
    const schemes = schemesRes.rows || [];

    if (schemes.length === 0) {
      return res.status(200).json({
        success: true,
        data: [],
        disclaimer: MANDATORY_DISCLAIMER
      });
    }

    // Generate recommendations using Gemini service (with fallback heuristic)
    const recommendations = await geminiService.generateRecommendations(profile, schemes);

    // Merge scheme details (name, category, official URLs) with recommendation scores
    const enrichedResults = recommendations.map(rec => {
      const scheme = schemes.find(s => s.id === rec.scheme_id);
      return {
        ...rec,
        scheme_name: scheme ? scheme.name : 'Government Scheme',
        category: scheme ? scheme.category : 'General',
        target_group: scheme ? scheme.target_group : 'Citizens',
        applicable_state: scheme ? scheme.applicable_state : 'ALL',
        official_application_url: scheme ? scheme.official_application_url : null,
        official_source_url: scheme ? scheme.official_source_url : null,
        benefits: scheme ? scheme.benefits : null
      };
    });

    return res.status(200).json({
      success: true,
      count: enrichedResults.length,
      data: enrichedResults,
      disclaimer: MANDATORY_DISCLAIMER
    });
  } catch (err) {
    next(err);
  }
}

/**
 * AI Scheme Assistant Chat Endpoint
 * POST /api/ai/chat
 */
async function chatSchemeAssistant(req, res, next) {
  try {
    const userId = req.user ? req.user.id : null;
    const { message, scheme_id } = req.body;

    // Fetch scheme context if specified
    let schemeContext = null;
    if (scheme_id) {
      const schemeRes = await db.query('SELECT * FROM schemes WHERE id = $1', [scheme_id]);
      if (schemeRes.rows.length > 0) {
        schemeContext = schemeRes.rows[0];
      }
    }

    // Fetch profile context if user is authenticated
    let userProfile = null;
    if (userId) {
      const profRes = await db.query('SELECT * FROM profiles WHERE user_id = $1', [userId]);
      if (profRes.rows.length > 0) {
        userProfile = profRes.rows[0];
      }
    }

    const aiResult = await geminiService.chatWithAssistant(message, schemeContext, userProfile);

    return res.status(200).json({
      success: true,
      data: {
        reply: aiResult.reply,
        disclaimer: MANDATORY_DISCLAIMER
      }
    });
  } catch (err) {
    console.error("Gemini Error:", err);
    return res.status(500).json({
      success: false,
      message: err.message || 'Gemini API call failed',
      error: err.message || String(err)
    });
  }
}

module.exports = {
  recommendSchemes,
  chatSchemeAssistant,
  MANDATORY_DISCLAIMER
};
