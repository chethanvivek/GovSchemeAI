const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GEMINI_API_KEY || '';
let ai = null;

if (apiKey && apiKey.trim() !== '' && apiKey !== 'your_google_gemini_api_key_here') {
  try {
    ai = new GoogleGenAI({ apiKey });
    console.log('Gemini GenAI SDK initialized successfully.');
  } catch (err) {
    console.warn('Failed to initialize Google GenAI SDK:', err.message);
  }
} else {
  console.log('GEMINI_API_KEY not configured. Rule-based heuristic simulation engine will assist recommendation queries.');
}

const SYSTEM_INSTRUCTION = `You are an expert Government Scheme and Scholarship Advisor AI. Your goal is to assess citizen eligibility for verified Central, State, and recognized educational trust/CSR scholarship opportunities (e.g. National Means-cum-Merit, Central Sector PM-USP, Post-Matric, Jagananna Vidya Deevena, AICTE Pragati, Reliance Foundation, Tata Trusts).
You evaluate both public government welfare programs and recognized educational trusts/CSR scholarships provided in the prompt context.
You MUST NOT invent or hallucinate unsupported programs or criteria outside the provided context.
When advising students on scholarships, always provide:
1. Complete Eligibility Breakdown (household income limit, minimum academic percentage/marks, state domicile requirement, eligible courses).
2. Financial Benefits (annual stipend amount, fee reimbursement, hostel allowance).
3. Application Process & Mandatory Documents (marksheet, income certificate, Aadhaar, bank passbook).
4. Direct Official Portal / Application URL for submission.
Always clearly categorize criteria into 'matched', 'unmet', and 'missing information'. Respond strictly in JSON matching the requested schema.`;

module.exports = {
  getAI: () => ai,
  SYSTEM_INSTRUCTION
};
