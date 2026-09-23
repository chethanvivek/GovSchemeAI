/**
 * Verified Indian Government Welfare, Educational, and Legal Schemes
 * Grounded in official portal rules and eligibility standards.
 * Covers: Scholarship, Education, Agriculture, Healthcare, Business/Startup, Social Welfare.
 */

const SEED_SCHEMES = [
  // --- 1. SCHOLARSHIPS & HIGHER EDUCATION GRANTS ---
  {
    name: "Jagananna Vidya Deevena & Vasathi Deevena (AP Full Fee Reimbursement)",
    description: "Flagship Andhra Pradesh Government scholarship scheme providing 100% complete tuition fee reimbursement directly to mothers for students pursuing ITI, Polytechnic, Degree, B.Tech, MBA, MCA, and Pharmacy courses, along with Vasathi Deevena annual financial grant of up to ₹20,000 for hostel, food, and boarding expenses.",
    benefits: "100% full tuition fee reimbursement credited on quarterly basis (Vidya Deevena) plus ₹10,000 (ITI), ₹15,000 (Polytechnic), and ₹20,000 (Degree/Engineering) annual hostel & food allowance (Vasathi Deevena).",
    eligibility_criteria: {
      min_age: 16,
      max_age: 30,
      states: ["Andhra Pradesh"],
      education_level: ["Undergraduate", "Higher Secondary (11th-12th)", "Postgraduate"],
      max_annual_income: 250000,
      occupations: ["Student"],
      land_limit: "Total land holding should be less than 10 acres of wet land or 25 acres of dry land",
      attendance_requirement: "Minimum 75% college attendance"
    },
    required_documents: [
      "Student & Mother's Aadhaar Card",
      "Integrated Caste & Income Certificate from Grama/Ward Sachivalayam",
      "College Admission Letter & Tuition Fee Challan",
      "Mother's Active Bank Account details (Jnanabhumi linked)",
      "AP State Residence / Domicile Certificate"
    ],
    applicable_state: "Andhra Pradesh",
    official_application_url: "https://jnanabhumi.ap.gov.in/",
    official_source_url: "https://navasakam.ap.gov.in/",
    category: "Scholarship",
    target_group: "Students"
  },
  {
    name: "Reliance Foundation Undergraduate Scholarship",
    description: "Premier private CSR scholarship by Reliance Foundation providing financial assistance and leadership development to meritorious undergraduate students across India from low-income families pursuing full-time degrees.",
    benefits: "Up to ₹2,00,000 financial grant over the full duration of degree studies, accompanied by mentorship, career development webinars, and an active alumni network.",
    eligibility_criteria: {
      min_age: 17,
      max_age: 26,
      states: ["ALL"],
      education_level: ["Undergraduate"],
      max_annual_income: 1500000,
      occupations: ["Student"],
      academic_requirement: "Minimum 60% aggregate marks in 12th standard examination; currently enrolled in 1st year full-time undergraduate degree program in India",
      preference: "Family income under ₹2,50,000 gets highest priority"
    },
    required_documents: [
      "Class 10th and 12th Board Marksheets",
      "Current College / University Bonafide Certificate",
      "Family Income Proof (ITR / Salary Slip / Government Income Certificate)",
      "Student Aadhaar Card",
      "Passport Size Photograph"
    ],
    applicable_state: "ALL",
    official_application_url: "https://www.scholarships.reliancefoundation.org/",
    official_source_url: "https://www.reliancefoundation.org/our-work/education/scholarships",
    category: "Scholarship",
    target_group: "Students"
  },
  {
    name: "Central Sector Scheme of Scholarship for College and University Students (PM-USP)",
    description: "Centrally sponsored scholarship under Pradhan Mantri Uchchatar Shiksha Protsahan (PM-USP) implemented by the Department of Higher Education for meritorious students from low-income families pursuing graduate and postgraduate studies.",
    benefits: "₹12,000 per annum at graduation level for the first 3 years and ₹20,000 per annum at postgraduate level, paid directly via DBT into student's Aadhaar-seeded bank account.",
    eligibility_criteria: {
      min_age: 17,
      max_age: 25,
      states: ["ALL"],
      education_level: ["Undergraduate", "Postgraduate"],
      max_annual_income: 450000,
      occupations: ["Student"],
      academic_requirement: "Above 80th percentile in the relevant stream in Class 12 board examination; enrolled in a recognized regular degree course"
    },
    required_documents: [
      "Class 12th Marksheet and Passing Certificate",
      "Annual Family Income Certificate issued by Revenue Authority",
      "Student Aadhaar Card",
      "College Admission Proof / Student ID Card",
      "Bank Account details (Aadhaar linked)"
    ],
    applicable_state: "ALL",
    official_application_url: "https://scholarships.gov.in/",
    official_source_url: "https://education.gov.in/scholarships-education-loan",
    category: "Scholarship",
    target_group: "Students"
  },
  {
    name: "National Means-cum-Merit Scholarship Scheme (NMMSS)",
    description: "Centrally sponsored scholarship scheme implemented to award meritorious students of economically weaker sections to arrest their drop-out at class VIII and encourage them to continue studies at secondary stage.",
    benefits: "Scholarship amount of ₹12,000 per annum (₹1,000 per month) from Class IX to Class XII.",
    eligibility_criteria: {
      min_age: 12,
      max_age: 22,
      states: ["ALL"],
      education_level: ["Secondary School (8th-10th)", "Higher Secondary (11th-12th)", "Undergraduate"],
      max_annual_income: 350000,
      occupations: ["Student"],
      academic_requirement: "Minimum 55% marks or equivalent grade in Class VII / VIII examination"
    },
    required_documents: [
      "Student Aadhaar Card",
      "Class 7th / 8th Marksheet",
      "Parental Income Certificate",
      "Caste / Community Certificate (if applicable)",
      "Bank Account details of the student"
    ],
    applicable_state: "ALL",
    official_application_url: "https://scholarships.gov.in/",
    official_source_url: "https://education.gov.in/scholarships-education-loan",
    category: "Scholarship",
    target_group: "Students"
  },
  {
    name: "Post-Matric Scholarship for SC/ST/OBC Students",
    description: "Comprehensive central and state welfare scheme to provide financial assistance to students belonging to Scheduled Castes, Scheduled Tribes, and Other Backward Classes studying at post-matriculation or post-secondary stages.",
    benefits: "Complete maintenance allowance, mandatory non-refundable fees reimbursement, study tour charges, and thesis typing charges up to ₹13,500/year depending on course level.",
    eligibility_criteria: {
      min_age: 15,
      max_age: 35,
      states: ["ALL"],
      education_level: ["Higher Secondary (11th-12th)", "Undergraduate", "Postgraduate", "Doctorate (Ph.D)"],
      max_annual_income: 250000,
      occupations: ["Student"],
      special_category: ["SC", "ST", "OBC", "EWS"]
    },
    required_documents: [
      "Caste / Community Certificate issued by competent revenue authority",
      "Family Income Certificate (below ₹2.5 Lakhs)",
      "Previous Qualifying Examination Marksheet",
      "College Admission Receipt & Fee Structure",
      "Student Aadhaar linked Bank Passbook"
    ],
    applicable_state: "ALL",
    official_application_url: "https://scholarships.gov.in/",
    official_source_url: "https://socialjustice.gov.in/schemes/post-matric-scholarship-sc",
    category: "Scholarship",
    target_group: "Students"
  },
  {
    name: "AICTE Pragati & Saksham Scholarship for Technical Education",
    description: "Ministry of Education scheme executed by AICTE to empower young girls (Pragati) and specially-abled students with >40% disability (Saksham) admitted to AICTE approved technical diploma and degree programs.",
    benefits: "₹50,000 per annum for every year of study towards tuition fee reimbursement, purchase of books, equipment, computer/laptop, and software.",
    eligibility_criteria: {
      min_age: 16,
      max_age: 30,
      states: ["ALL"],
      education_level: ["Undergraduate", "Postgraduate"],
      max_annual_income: 800000,
      occupations: ["Student"],
      special_qualifiers: "Girls admitted to 1st year / lateral entry (Pragati) or differently-abled students with >=40% disability (Saksham)"
    },
    required_documents: [
      "AICTE College Admission Allotment Letter",
      "Tuition Fee Receipt",
      "Family Income Certificate issued by Tehsildar / Competent Authority",
      "Disability Certificate (if applying under Saksham)",
      "Class 10th and 12th Board Marksheets"
    ],
    applicable_state: "ALL",
    official_application_url: "https://www.aicte-india.org/schemes/students-development-schemes/Pragati",
    official_source_url: "https://scholarships.gov.in/",
    category: "Scholarship",
    target_group: "Students"
  },
  {
    name: "Tata Trusts Higher Education & Medical Grants",
    description: "Prestigious philanthropic educational support by Tata Trusts to meritorious students pursuing undergraduate, postgraduate, and professional medical/healthcare degrees in recognized institutions in India.",
    benefits: "Need-cum-merit partial or full tuition fee grant ranging from ₹30,000 up to ₹1,50,000 per academic year, easing financial burdens for needy families.",
    eligibility_criteria: {
      min_age: 17,
      max_age: 30,
      states: ["ALL"],
      education_level: ["Undergraduate", "Postgraduate"],
      max_annual_income: 500000,
      occupations: ["Student"],
      academic_requirement: "Consistent first-class or minimum 60% in previous semesters/examinations"
    },
    required_documents: [
      "Marksheets of all past academic semesters",
      "Official Fee Structure & College Bonafide Letter",
      "Family Income Certificate / ITR of parents",
      "Student Aadhaar Card & Bank Account Details",
      "Statement of Purpose (SOP)"
    ],
    applicable_state: "ALL",
    official_application_url: "https://www.tatatrusts.org/our-work/individual-grants-programme/education-grants",
    official_source_url: "https://www.tatatrusts.org/",
    category: "Scholarship",
    target_group: "Students"
  },

  // --- 2. EDUCATION & SKILL TRAINING ---
  {
    name: "Pradhan Mantri Kaushal Vikas Yojana (PMKVY 4.0 - Skill Training)",
    description: "The flagship skill certification scheme of the Ministry of Skill Development and Entrepreneurship (MSDE) implemented by NSDC to enable Indian youth to take up industry-relevant, future-ready skill training.",
    benefits: "100% completely free industry skill courses (AI, Robotics, IoT, Healthcare, Drone technology), government certification, assessment, job placement support, and ₹8,000 stipend reward upon course completion.",
    eligibility_criteria: {
      min_age: 15,
      max_age: 45,
      states: ["ALL"],
      education_level: ["Secondary School (8th-10th)", "Higher Secondary (11th-12th)", "Undergraduate", "Postgraduate"],
      occupations: ["Student", "Unemployed", "Self-Employed"],
      max_annual_income: 800000
    },
    required_documents: [
      "Aadhaar Card",
      "Voter ID / Driving License",
      "Bank Account Passbook (Aadhaar linked)",
      "Educational Qualification Marksheet (Class 10th or 12th)",
      "Passport size photographs"
    ],
    applicable_state: "ALL",
    official_application_url: "https://www.pmkvyofficial.org/",
    official_source_url: "https://www.msde.gov.in/schemes-initiatives/schemes-initiatives-list/pmkvy",
    category: "Education",
    target_group: "Students"
  },

  // --- 3. AGRICULTURE & FARMER SUPPORT ---
  {
    name: "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
    description: "A Central Sector scheme to provide income support to all landholding farmer families across the country to supplement their financial needs for procuring various inputs related to agriculture and allied activities.",
    benefits: "Direct financial benefit of ₹6,000 per annum payable in three equal installments of ₹2,000 directly into the bank accounts of eligible farmer families.",
    eligibility_criteria: {
      min_age: 18,
      max_age: 100,
      occupations: ["Farmer", "Agriculture Laborer"],
      max_annual_income: 600000,
      states: ["ALL"],
      excluded_categories: ["Institutional landholders", "Holding constitutional posts", "Income tax payers"]
    },
    required_documents: [
      "Aadhaar Card linked with Bank Account",
      "Land Ownership Documents (RoR / Khata / Khasra)",
      "Active Bank Account Passbook",
      "Citizenship / Domicile Certificate"
    ],
    applicable_state: "ALL",
    official_application_url: "https://pmkisan.gov.in/",
    official_source_url: "https://pmkisan.gov.in/Documents.aspx",
    category: "Agriculture",
    target_group: "Farmers"
  },

  // --- 4. HEALTHCARE ---
  {
    name: "Ayushman Bharat - PM-JAY (Pradhan Mantri Jan Arogya Yojana)",
    description: "The world's largest government-funded healthcare assurance scheme, providing a financial health protection cover to vulnerable and low-income families for secondary and tertiary care hospitalization.",
    benefits: "Cashless and paperless access to healthcare services providing a health cover of ₹5,00,000 per family per year for over 1,949 medical and surgical procedures.",
    eligibility_criteria: {
      min_age: 0,
      max_age: 120,
      max_annual_income: 250000,
      states: ["ALL"],
      occupations: ["Any"],
      socio_economic_criteria: "Listed in SECC 2011 database or NFSA beneficiary or low-income household"
    },
    required_documents: [
      "Aadhaar Card / Government Identity Proof",
      "Ration Card / Family Composition Certificate",
      "Income Certificate from Competent Authority",
      "Mobile Number linked to Aadhaar"
    ],
    applicable_state: "ALL",
    official_application_url: "https://beneficiary.nha.gov.in/",
    official_source_url: "https://pmjay.gov.in/about/pmjay",
    category: "Healthcare",
    target_group: "Low-Income Families"
  },

  // --- 5. BUSINESS & STARTUP ---
  {
    name: "Pradhan Mantri MUDRA Yojana (PMMY)",
    description: "Provides collateral-free institutional credit up to ₹10 Lakhs to micro and small non-corporate enterprises and self-employed individuals for income generating activities in manufacturing, trading, and services.",
    benefits: "Collateral-free micro loans in 3 tiers: Shishu (up to ₹50,000), Kishore (₹50,001 to ₹5 Lakhs), and Tarun (₹5 Lakhs to ₹10 Lakhs) at competitive concessional interest rates.",
    eligibility_criteria: {
      min_age: 18,
      max_age: 65,
      states: ["ALL"],
      occupations: ["Self-Employed", "Self-Employed / Business", "Unemployed"],
      max_annual_income: 1500000,
      business_status: "New or existing micro enterprise; no past bank defaults"
    },
    required_documents: [
      "Proof of Identity (Aadhaar, Voter ID, PAN)",
      "Proof of Residence (Electricity bill, Ration card)",
      "Business Establishment / Registration Proof or Trade License",
      "Bank Account Statements for past 6 months",
      "Project quotation / Business Proposal"
    ],
    applicable_state: "ALL",
    official_application_url: "https://www.mudra.org.in/",
    official_source_url: "https://www.mudra.org.in/Offerings",
    category: "Business/Startup",
    target_group: "Unemployed"
  },
  {
    name: "Stand-Up India Scheme for Women and SC/ST Entrepreneurs",
    description: "Facilitates bank loans between ₹10 lakh and ₹1 Crore to at least one Scheduled Caste (SC) or Scheduled Tribe (ST) borrower and at least one woman borrower per bank branch for setting up a greenfield enterprise.",
    benefits: "Composite loan (including term loan and working capital) covering up to 85% of project cost with low collateral requirements and interest rate concessions.",
    eligibility_criteria: {
      min_age: 18,
      max_age: 70,
      target_genders: ["Female", "Any if SC/ST"],
      enterprise_type: "Greenfield project in manufacturing, services, agri-allied, or trading sector",
      borrower_standing: "Borrower must not be in default to any bank or financial institution"
    },
    required_documents: [
      "Identity and Address Proof (Aadhaar, PAN Card)",
      "Caste Certificate (for SC/ST applicants)",
      "Detailed Project Report (DPR) / Business Plan",
      "Proof of Registered Office / Lease / Land",
      "Last 3 years ITR (if existing) or personal net worth statement"
    ],
    applicable_state: "ALL",
    official_application_url: "https://www.standupmitra.in/",
    official_source_url: "https://www.standupmitra.in/Home/SUISchemes",
    category: "Business/Startup",
    target_group: "Women"
  },
  {
    name: "PM SVANidhi (Street Vendor's AtmaNirbhar Nidhi)",
    description: "A micro-credit facility scheme for urban, peri-urban, and rural street vendors to restart their livelihoods, providing affordable working capital credit and incentivizing digital transactions.",
    benefits: "Initial collateral-free working capital loan of ₹10,000, graduating to ₹20,000 and ₹50,000 on timely repayment, with 7% interest subsidy and cashback on digital transactions up to ₹1,200/year.",
    eligibility_criteria: {
      min_age: 18,
      max_age: 75,
      occupations: ["Street Vendor", "Hawker", "Daily Wage Earner", "Self-Employed", "Unemployed"],
      max_annual_income: 300000,
      vending_status: "Engaged in street vending in urban/semi-urban areas"
    },
    required_documents: [
      "Aadhaar Card",
      "Vending Certificate / Identity Card issued by Urban Local Body (ULB) / Town Vending Committee (TVC)",
      "Bank Account Passbook / Statement",
      "Mobile number linked with Aadhaar"
    ],
    applicable_state: "ALL",
    official_application_url: "https://pmsvanidhi.mohua.gov.in/",
    official_source_url: "https://mohua.gov.in/cms/pmsvanidhi.php",
    category: "Business/Startup",
    target_group: "Unemployed"
  },

  // --- 6. SOCIAL WELFARE & HOUSING ---
  {
    name: "Pradhan Mantri Awas Yojana (PMAY - Urban / Gramin)",
    description: "Flagship mission by the Ministry of Housing and Urban Affairs to provide all-weather pucca housing with basic civic amenities to all eligible urban and rural families.",
    benefits: "Direct interest subsidy of up to ₹2.67 Lakhs on home loans for EWS/LIG categories or financial grant up to ₹1.2 Lakh to ₹1.3 Lakh for pucca house construction in rural regions.",
    eligibility_criteria: {
      min_age: 21,
      max_age: 70,
      max_annual_income: 600000,
      states: ["ALL"],
      housing_status: "Must not own a pucca house anywhere in India"
    },
    required_documents: [
      "Aadhaar Card of all family members",
      "Income Proof / Salary Slips / ITR / Tehsildar Certificate",
      "Affidavit of not owning a pucca house in India",
      "Bank Account Statement (6 months)",
      "Land / Property details or construction blueprint"
    ],
    applicable_state: "ALL",
    official_application_url: "https://pmaymis.gov.in/",
    official_source_url: "https://mohua.gov.in/cms/pradhan-mantri-awas-yojana.php",
    category: "Social Welfare",
    target_group: "Low-Income Families"
  },
  {
    name: "Mahila Samman Savings Certificate (MSSC)",
    description: "A specialized one-time small savings scheme tailored by the Ministry of Finance exclusively for women and girls to foster secure, high-yield financial savings.",
    benefits: "Fixed deposit scheme offering attractive interest rate of 7.5% per annum compounded quarterly with flexible partial withdrawal up to 40% after one year.",
    eligibility_criteria: {
      min_age: 18,
      max_age: 120,
      target_genders: ["Female"],
      states: ["ALL"],
      min_deposit: 1000,
      max_deposit: 200000
    },
    required_documents: [
      "Identity Proof (Aadhaar Card)",
      "PAN Card",
      "Recent Passport Size Photograph",
      "Post Office / Bank Account Passbook"
    ],
    applicable_state: "ALL",
    official_application_url: "https://www.indiapost.gov.in/",
    official_source_url: "https://dea.gov.in/mahila-samman-savings-certificate-scheme",
    category: "Social Welfare",
    target_group: "Women"
  },
  {
    name: "Atal Pension Yojana (APY)",
    description: "A government-backed universal social security pension scheme primarily focused on the unorganized sector workers, guaranteeing a defined monthly pension after retirement.",
    benefits: "Guaranteed minimum monthly pension of ₹1,000, ₹2,000, ₹3,000, ₹4,000 or ₹5,000 per month starting at age 60 until death, followed by return of accumulated pension corpus to the nominee.",
    eligibility_criteria: {
      min_age: 18,
      max_age: 40,
      states: ["ALL"],
      tax_status: "Must not be an income tax payer",
      sector: "Open to all Indian citizens, predominantly unorganized sector workers"
    },
    required_documents: [
      "Aadhaar Card",
      "Savings Bank Account with Auto-Debit facility",
      "Active Mobile Number"
    ],
    applicable_state: "ALL",
    official_application_url: "https://enps.nsdl.com/eNPS/ApySubRegistration.html",
    official_source_url: "https://www.pfrda.org.in/index1.cshtml?lsid=38",
    category: "Social Welfare",
    target_group: "Senior Citizens"
  },
  {
    name: "Free Legal Aid - National Legal Services Authority (NALSA)",
    description: "Statutory free legal assistance and representation under the Legal Services Authorities Act, 1987, ensuring that justice is not denied to any citizen by reason of economic or other disabilities.",
    benefits: "Free advocate representation in civil, criminal, and revenue courts, payment of court fees, drafting of legal pleadings, and free certified copies of judgments.",
    eligibility_criteria: {
      min_age: 18,
      max_age: 120,
      states: ["ALL"],
      special_qualifiers: ["Women", "Children", "Persons with Disabilities", "Victims of trafficking", "SC/ST", "Custodial inmates"],
      max_annual_income: 300000
    },
    required_documents: [
      "Identity Proof (Aadhaar, Voter ID, or Ration Card)",
      "Income Certificate / Affidavit of low income",
      "Court notice / Case summons / Brief summary of legal dispute",
      "Disability certificate or Caste certificate (if qualifying under special category)"
    ],
    applicable_state: "ALL",
    official_application_url: "https://nalsa.gov.in/lsams/",
    official_source_url: "https://nalsa.gov.in/acts-rules/eligibility-criteria",
    category: "Social Welfare",
    target_group: "Low-Income Families"
  }
];

module.exports = { SEED_SCHEMES };
