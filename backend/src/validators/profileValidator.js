const { z } = require("zod");

// 28 Indian States & 8 Union Territories
const VALID_STATES = [
  'ALL',
  // 28 States
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  // 8 Union Territories
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi (National Capital Territory)',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
  'Other'
];

const VALID_OCCUPATIONS = [
  'Student',
  'Farmer / Agricultural Worker',
  'Farmer',
  'Agriculture Laborer',
  'Self-Employed / Freelancer',
  'Self-Employed / Business',
  'Daily Wage Worker / Laborer',
  'Street Vendor / Daily Wage',
  'Small Business Owner / Trader',
  'Salaried / Private Sector Employee',
  'Salaried Employee',
  'Government Employee',
  'Homemaker',
  'Healthcare Worker',
  'Artisan / Weaver / Craftsman',
  'Artisan / Craftsman',
  'Retired / Senior Citizen',
  'Unemployed / Job Seeker',
  'Other'
];

const VALID_EDUCATION_LEVELS = [
  'Below 10th Standard / Primary School',
  '10th Standard (SSC / Matric)',
  '12th Standard / Intermediate / Higher Secondary',
  'ITI / Vocational Training',
  'Diploma / Polytechnic',
  'Undergraduate (B.Tech, B.Sc, B.Com, B.A, MBBS, etc.)',
  'Undergraduate',
  'Postgraduate (M.Tech, M.Sc, M.Com, M.A, MBA, etc.)',
  'Postgraduate',
  'Doctorate / Ph.D. / Research Scholar',
  'No Formal Education',
  'Other'
];

const VALID_EMPLOYMENT_STATUSES = [
  'Unemployed (Seeking Job)',
  'Unemployed',
  'Employed (Full-time)',
  'Employed',
  'Employed (Part-time)',
  'Self-Employed',
  'Student / Intern',
  'Student',
  'Retired',
  'Not Seeking Employment',
  'Homemaker',
  'Other'
];

const profileSchema = z.object({
  age: z.coerce
    .number({ invalid_type_error: "Age must be a number" })
    .min(16, "Must be at least 16 years old")
    .max(120, "Please enter a valid age"),
  state: z.string().trim().min(2, "State / Region is required"),
  occupation: z.string().trim().min(2, "Occupation is required"),
  annual_income: z.coerce
    .number({ invalid_type_error: "Income must be a number" })
    .min(0, "Income cannot be negative"),
  education_level: z.string().trim().min(2, "Education level is required"),
  employment_status: z.string().trim().min(2, "Employment status is required"),
  marital_status: z.string().optional().default("Single"),
  special_category: z.string().optional().default("None")
});

module.exports = { 
  profileSchema,
  VALID_STATES,
  VALID_OCCUPATIONS,
  VALID_EDUCATION_LEVELS,
  VALID_EMPLOYMENT_STATUSES
};
