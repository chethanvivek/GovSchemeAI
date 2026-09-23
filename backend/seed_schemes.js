/**
 * Database Seed Script for Government Schemes
 * Populates the Supabase 'schemes' table with realistic, high-priority data
 * tailored for engineering students in Andhra Pradesh and technical upskilling.
 *
 * Usage:
 *   node seed_schemes.js
 *   (or npm run seed:schemes)
 */

require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

// 1. Initialize Supabase client using environment variables
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

// 2. Define the 5 specific Indian government schemes
const schemesToInsert = [
  {
    name: "Jagananna Vidya Deevena (JVD)",
    category: "Education",
    applicable_state: "Andhra Pradesh",
    target_group: "Students",
    description: "Flagship Andhra Pradesh government scheme providing 100% full fee reimbursement to eligible students from economically weaker sections pursuing Polytechnic, ITI, Degree, and Engineering courses.",
    benefits: "Full fee reimbursement credited directly for eligible degree, polytechnic, and engineering programs.",
    eligibility_criteria: {
      state_resident: "Andhra Pradesh",
      target_courses: ["Polytechnic", "Degree", "Engineering", "B.Tech", "MCA", "MBA"],
      max_annual_income: 250000,
      target_occupations: ["Student"],
      min_age: 16,
      max_age: 30,
      attendance_requirement: "75% minimum college attendance",
      land_holding_limit: "Total land holding should be less than 10 acres of wetland or 25 acres of dryland"
    },
    required_documents: {
      documents: [
        "Student & Mother's Aadhaar Card",
        "Integrated Caste & Income Certificate (from Grama/Ward Sachivalayam)",
        "College Admission Letter & Tuition Fee Challan",
        "Mother's Active Bank Account details (Jnanabhumi linked)",
        "AP State Residence / Domicile Certificate"
      ]
    },
    official_application_url: "https://jnanabhumi.ap.gov.in/",
    official_source_url: "https://navasakam.ap.gov.in/"
  },
  {
    name: "AICTE Pragati Scholarship",
    category: "Education",
    applicable_state: "ALL",
    target_group: "Women",
    description: "All India Council for Technical Education (AICTE) scholarship scheme providing financial support to meritorious girl students admitted to first-year degree and diploma technical programs.",
    benefits: "₹50,000 per annum for every year of study towards college tuition fees, computer purchase, books, and educational equipment.",
    eligibility_criteria: {
      gender: "Female",
      admission_year: "First year of degree/diploma program",
      institution_type: "AICTE approved technical institution",
      target_courses: ["Engineering", "Technology", "Diploma", "B.Tech"],
      max_annual_income: 800000,
      max_eligible_daughters_per_family: 2,
      min_age: 16,
      max_age: 28
    },
    required_documents: {
      documents: [
        "Class 10th and 12th Board Marksheets",
        "AICTE Approved College Admission Letter & Allotment Order",
        "Tuition Fee Receipt for current academic year",
        "Annual Family Income Certificate issued by competent authority",
        "Student Aadhaar Card & Aadhaar-seeded Bank Passbook"
      ]
    },
    official_application_url: "https://scholarships.gov.in/",
    official_source_url: "https://www.aicte-india.org/schemes/students-development-schemes/Pragati"
  },
  {
    name: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY)",
    category: "Employment/Upskilling",
    applicable_state: "ALL",
    target_group: "Unemployed youth / Students",
    description: "Flagship skill development initiative by Ministry of Skill Development and Entrepreneurship (MSDE) offering free industry-relevant technical and future-skills training with formal certification.",
    benefits: "Free government-funded technical training and certification, skill assessment, and placement assistance.",
    eligibility_criteria: {
      nationality: "Indian",
      min_age: 15,
      max_age: 45,
      target_profile: ["Unemployed youth", "Students", "School/College dropouts", "Job seekers"],
      objective: "Seeking technical upskilling, industry certification, or vocational competence"
    },
    required_documents: {
      documents: [
        "Aadhaar Card",
        "Voter ID / Government Issued Photo Identification",
        "Educational Qualification Certificate / Marksheet",
        "Recent Passport Size Photograph",
        "Bank Account Details"
      ]
    },
    official_application_url: "https://www.pmkvyofficial.org/",
    official_source_url: "https://www.msde.gov.in/en/schemes-initiatives/schemes-programmes-under-msde/pradhan-mantri-kaushal-vikas-yojana"
  },
  {
    name: "Post Matric Scholarship for SC/ST/OBC (Andhra Pradesh)",
    category: "Social Welfare",
    applicable_state: "Andhra Pradesh",
    target_group: "Minorities/SC/ST/OBC",
    description: "State welfare scholarship implemented by Andhra Pradesh Social Welfare Department assisting SC, ST, OBC, and minority students in pursuing post-matriculation and higher engineering degrees.",
    benefits: "Maintenance allowance and fee concessions for post-matriculation, technical, and professional degree studies.",
    eligibility_criteria: {
      state_resident: "Andhra Pradesh",
      target_communities: ["SC", "ST", "OBC", "Minorities"],
      education_level: "Post-Matriculation (Intermediate, Polytechnic, Engineering, Degree, PG)",
      max_annual_income: 250000,
      target_occupations: ["Student"],
      min_age: 16,
      max_age: 32
    },
    required_documents: {
      documents: [
        "Integrated Community & Caste Certificate",
        "Annual Family Income Certificate",
        "Student & Parent Aadhaar Cards",
        "Previous Class Marksheet (SSC / Intermediate)",
        "College Bonafide Certificate & Admission Proof",
        "Student's Bank Account Passbook (Aadhaar linked)"
      ]
    },
    official_application_url: "https://jnanabhumi.ap.gov.in/",
    official_source_url: "https://socialwelfare.ap.gov.in/"
  },
  {
    name: "National Fellowship and Scholarship for Higher Education of ST Students",
    category: "Education",
    applicable_state: "ALL",
    target_group: "ST Students",
    description: "Central sector scholarship by Ministry of Tribal Affairs empowering meritorious Scheduled Tribe (ST) students admitted to premier technical institutions (IITs, NITs, Central Universities) to pursue graduate and postgraduate studies.",
    benefits: "Full tuition fee reimbursement, living expenses of ₹3,000/month, annual books & stationery allowance of ₹5,000, and computer grant of ₹45,000 one-time.",
    eligibility_criteria: {
      target_community: "Scheduled Tribe (ST)",
      academic_qualification: "Passed 12th grade / Higher Secondary",
      institution_requirement: "Secured admission in identified premier institutions (like NITs, IITs, top central universities)",
      max_annual_income: 600000,
      target_occupations: ["Student"],
      min_age: 17,
      max_age: 30
    },
    required_documents: {
      documents: [
        "Valid ST Caste Certificate issued by competent Revenue Authority",
        "Current Financial Year Family Income Certificate",
        "Class 12th Board Marksheet and Passing Certificate",
        "Admission Letter & Fee Receipt from premier institute (NIT/IIT/University)",
        "Student Aadhaar Card & Seeded Bank Account Details"
      ]
    },
    official_application_url: "https://scholarships.gov.in/",
    official_source_url: "https://tribal.nic.in/ScholarshiP.aspx"
  }
];

async function seedSchemes() {
  console.log('====================================================');
  console.log('  Seeding Government Schemes into Supabase Database ');
  console.log('====================================================\n');

  // Verify Supabase credentials
  if (!supabaseUrl || !supabaseKey || supabaseKey.includes('your_')) {
    console.warn('[Notice] SUPABASE_URL or valid SUPABASE_KEY / SUPABASE_ANON_KEY not configured in .env.');
    console.warn('[Notice] Falling back to PostgreSQL connection via DATABASE_URL to populate Supabase tables directly...\n');

    const db = require('./src/config/db');
    await db.initDB();

    for (const scheme of schemesToInsert) {
      const existing = await db.query('SELECT id FROM schemes WHERE name = $1', [scheme.name]);
      if (existing.rows && existing.rows.length > 0) {
        await db.query(
          `UPDATE schemes SET
            category = $2,
            applicable_state = $3,
            target_group = $4,
            description = $5,
            benefits = $6,
            eligibility_criteria = $7,
            required_documents = $8,
            official_application_url = $9,
            official_source_url = $10
          WHERE name = $1`,
          [
            scheme.name,
            scheme.category,
            scheme.applicable_state,
            scheme.target_group,
            scheme.description,
            scheme.benefits,
            JSON.stringify(scheme.eligibility_criteria),
            JSON.stringify(scheme.required_documents),
            scheme.official_application_url,
            scheme.official_source_url
          ]
        );
        console.log(`[Updated] ${scheme.name}`);
      } else {
        await db.query(
          `INSERT INTO schemes 
            (name, category, applicable_state, target_group, description, benefits, eligibility_criteria, required_documents, official_application_url, official_source_url)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
          [
            scheme.name,
            scheme.category,
            scheme.applicable_state,
            scheme.target_group,
            scheme.description,
            scheme.benefits,
            JSON.stringify(scheme.eligibility_criteria),
            JSON.stringify(scheme.required_documents),
            scheme.official_application_url,
            scheme.official_source_url
          ]
        );
        console.log(`[Inserted] ${scheme.name}`);
      }
    }

    console.log('\n====================================================');
    console.log('✓ Successfully seeded all 5 government schemes into the Supabase database!');
    console.log('  Schemes are now active for AI recommendation matching.');
    console.log('====================================================\n');
    process.exit(0);
  }

  // Supabase JS Client execution
  console.log(`Connecting to Supabase at: ${supabaseUrl}`);
  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    for (const scheme of schemesToInsert) {
      // Check if scheme already exists by name
      const { data: existing, error: fetchErr } = await supabase
        .from('schemes')
        .select('id, name')
        .eq('name', scheme.name);

      if (fetchErr) {
        throw fetchErr;
      }

      if (existing && existing.length > 0) {
        const { error: updateErr } = await supabase
          .from('schemes')
          .update({
            category: scheme.category,
            applicable_state: scheme.applicable_state,
            target_group: scheme.target_group,
            description: scheme.description,
            benefits: scheme.benefits,
            eligibility_criteria: scheme.eligibility_criteria,
            required_documents: scheme.required_documents,
            official_application_url: scheme.official_application_url,
            official_source_url: scheme.official_source_url
          })
          .eq('name', scheme.name);

        if (updateErr) throw updateErr;
        console.log(`[Updated] ${scheme.name}`);
      } else {
        const { error: insertErr } = await supabase
          .from('schemes')
          .insert([scheme]);

        if (insertErr) throw insertErr;
        console.log(`[Inserted] ${scheme.name}`);
      }
    }

    console.log('\n====================================================');
    console.log('✓ Successfully seeded all 5 government schemes into Supabase schemes table!');
    console.log('  Total schemes inserted/synchronized: 5');
    console.log('  Category distribution: Education (3), Employment/Upskilling (1), Social Welfare (1)');
    console.log('====================================================\n');
  } catch (error) {
    console.error('Supabase seeding error:', error.message || error);
    process.exit(1);
  }
}

seedSchemes();
