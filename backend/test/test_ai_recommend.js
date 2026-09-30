require('dotenv').config({ path: './.env' });
const { generateRecommendations } = require('../src/services/geminiService');

const profile = {
  age: 22,
  state: 'Karnataka',
  annual_income: 180000,
  occupation: 'Student',
  education_level: 'Undergraduate',
  employment_status: 'Unemployed'
};

const schemes = [
  {
    id: 'test-scheme-1',
    name: 'National Scholarship Portal Post-Matric',
    category: 'Scholarship',
    target_group: 'Students',
    applicable_state: 'ALL',
    benefits: 'Full tuition subsidy and maintenance allowance',
    eligibility_criteria: { min_age: 18, max_age: 25, max_annual_income: 250000, education_level: ['Undergraduate'] },
    required_documents: ['Aadhaar', 'Income Certificate', 'Student ID']
  }
];

async function run() {
  console.log('Testing generateRecommendations with GEMINI_MODEL =', process.env.GEMINI_MODEL);
  const start = Date.now();
  try {
    const res = await generateRecommendations(profile, schemes);
    console.log(`Success in ${Date.now() - start}ms! Got ${res.length} recommendations:`);
    console.log(JSON.stringify(res[0], null, 2));
  } catch (err) {
    console.error(`Failed in ${Date.now() - start}ms:`, err);
  }
}

run();
