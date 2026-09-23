import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  Save, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ArrowRight,
  Info,
  Edit3
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export const INDIAN_STATES_AND_UTS = [
  // 28 States
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  // 8 Union Territories
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi (National Capital Territory)",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry"
];

export const OCCUPATIONS = [
  "Student",
  "Farmer / Agricultural Worker",
  "Self-Employed / Freelancer",
  "Daily Wage Worker / Laborer",
  "Small Business Owner / Trader",
  "Salaried / Private Sector Employee",
  "Government Employee",
  "Homemaker",
  "Healthcare Worker",
  "Artisan / Weaver / Craftsman"
];

export const EDUCATION_LEVELS = [
  "Below 10th Standard / Primary School",
  "10th Standard (SSC / Matric)",
  "12th Standard / Intermediate / Higher Secondary",
  "ITI / Vocational Training",
  "Diploma / Polytechnic",
  "Undergraduate (B.Tech, B.Sc, B.Com, B.A, MBBS, etc.)",
  "Postgraduate (M.Tech, M.Sc, M.Com, M.A, MBA, etc.)",
  "Doctorate / Ph.D. / Research Scholar",
  "No Formal Education"
];

export const EMPLOYMENT_STATUSES = [
  "Unemployed (Seeking Job)",
  "Employed (Full-time)",
  "Employed (Part-time)",
  "Self-Employed",
  "Student / Intern",
  "Retired",
  "Not Seeking Employment"
];

export const MARITAL_STATUSES = ['Single', 'Married', 'Divorced', 'Widowed'];

export const SPECIAL_CATEGORIES = [
  'None',
  'SC / ST Community',
  'OBC (Non-Creamy Layer)',
  'Economically Weaker Section (EWS)',
  'Woman Entrepreneur / Applicant',
  'Person with Benchmark Disability (PwD)',
  'Minority Community',
  'Ex-Servicemen'
];

const OTHER_VALUE = "Other";

export default function ProfilePage() {
  const { profile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    age: '',
    stateSelect: '',
    stateCustom: '',
    occupationSelect: '',
    occupationCustom: '',
    annual_income: '',
    educationSelect: '',
    educationCustom: '',
    employmentSelect: '',
    employmentCustom: '',
    marital_status: 'Single',
    special_category: 'None'
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Accurately restore selected and custom values from active profile
  useEffect(() => {
    if (profile) {
      // 1. State
      let stSelect = '';
      let stCustom = '';
      if (profile.state) {
        if (INDIAN_STATES_AND_UTS.includes(profile.state)) {
          stSelect = profile.state;
        } else {
          stSelect = OTHER_VALUE;
          stCustom = profile.state;
        }
      }

      // 2. Occupation
      let occSelect = '';
      let occCustom = '';
      if (profile.occupation) {
        const found = OCCUPATIONS.find(o => o.toLowerCase() === profile.occupation.toLowerCase());
        if (found) {
          occSelect = found;
        } else {
          occSelect = OTHER_VALUE;
          occCustom = profile.occupation;
        }
      }

      // 3. Education
      let eduSelect = '';
      let eduCustom = '';
      if (profile.education_level) {
        const foundEdu = EDUCATION_LEVELS.find(e => e.toLowerCase() === profile.education_level.toLowerCase() || e.toLowerCase().startsWith(profile.education_level.toLowerCase()));
        if (foundEdu) {
          eduSelect = foundEdu;
        } else {
          eduSelect = OTHER_VALUE;
          eduCustom = profile.education_level;
        }
      }

      // 4. Employment
      let empSelect = '';
      let empCustom = '';
      if (profile.employment_status) {
        const foundEmp = EMPLOYMENT_STATUSES.find(e => e.toLowerCase() === profile.employment_status.toLowerCase() || e.toLowerCase().startsWith(profile.employment_status.toLowerCase()));
        if (foundEmp) {
          empSelect = foundEmp;
        } else {
          empSelect = OTHER_VALUE;
          empCustom = profile.employment_status;
        }
      }

      setFormData({
        age: profile.age !== null && profile.age !== undefined ? profile.age : '',
        stateSelect: stSelect,
        stateCustom: stCustom,
        occupationSelect: occSelect,
        occupationCustom: occCustom,
        annual_income: profile.annual_income !== null && profile.annual_income !== undefined ? profile.annual_income : '',
        educationSelect: eduSelect,
        educationCustom: eduCustom,
        employmentSelect: empSelect,
        employmentCustom: empCustom,
        marital_status: profile.marital_status || 'Single',
        special_category: profile.special_category || 'None'
      });
    } else {
      setFormData({
        age: '',
        stateSelect: '',
        stateCustom: '',
        occupationSelect: '',
        occupationCustom: '',
        annual_income: '',
        educationSelect: '',
        educationCustom: '',
        employmentSelect: '',
        employmentCustom: '',
        marital_status: 'Single',
        special_category: 'None'
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    const ageNum = Number(formData.age);
    if (ageNum < 16 || ageNum > 120) {
      setError('Age must be between 16 and 120 years.');
      return;
    }

    const incomeNum = Number(formData.annual_income);
    if (incomeNum < 0) {
      setError('Annual income cannot be negative.');
      return;
    }

    // Resolve State
    let finalState = formData.stateSelect;
    if (formData.stateSelect === OTHER_VALUE) {
      if (!formData.stateCustom.trim() || formData.stateCustom.trim().length < 2) {
        setError('Please enter your state/region name (at least 2 characters).');
        return;
      }
      finalState = formData.stateCustom.trim();
    }
    if (!finalState) {
      setError('Please select or specify your state / region.');
      return;
    }

    // Resolve Occupation
    let finalOccupation = formData.occupationSelect;
    if (formData.occupationSelect === OTHER_VALUE) {
      if (!formData.occupationCustom.trim() || formData.occupationCustom.trim().length < 2) {
        setError('Please specify your occupation (at least 2 characters).');
        return;
      }
      finalOccupation = formData.occupationCustom.trim();
    }
    if (!finalOccupation) {
      setError('Please select or specify your primary occupation.');
      return;
    }

    // Resolve Education
    let finalEducation = formData.educationSelect;
    if (formData.educationSelect === OTHER_VALUE) {
      if (!formData.educationCustom.trim() || formData.educationCustom.trim().length < 2) {
        setError('Please specify your education qualification (at least 2 characters).');
        return;
      }
      finalEducation = formData.educationCustom.trim();
    }
    if (!finalEducation) {
      setError('Please select or specify your highest education completed.');
      return;
    }

    // Resolve Employment
    let finalEmployment = formData.employmentSelect;
    if (formData.employmentSelect === OTHER_VALUE) {
      if (!formData.employmentCustom.trim() || formData.employmentCustom.trim().length < 2) {
        setError('Please specify your employment status (at least 2 characters).');
        return;
      }
      finalEmployment = formData.employmentCustom.trim();
    }
    if (!finalEmployment) {
      setError('Please select or specify your employment status.');
      return;
    }

    try {
      setLoading(true);
      const res = await api.put('/profile', {
        age: ageNum,
        state: finalState,
        occupation: finalOccupation,
        annual_income: incomeNum,
        education_level: finalEducation,
        employment_status: finalEmployment,
        marital_status: formData.marital_status,
        special_category: formData.special_category
      });

      if (res.data.success) {
        setSuccess(true);
        if (refreshProfile) await refreshProfile();
      }
    } catch (err) {
      console.error('Profile update error:', err);
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to update profile. Please verify your inputs.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const formattedIncomeLakhs = formData.annual_income 
    ? (Number(formData.annual_income) / 100000).toFixed(2)
    : '0.00';

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              Demographic Profile Manager
            </h1>
          </div>
          <p className="text-xs text-slate-500">
            Used by Gemini AI strictly on the backend to evaluate scheme qualifications. No names or identity numbers stored.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-full border border-emerald-200">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          Strict PII Anonymization
        </div>
      </div>

      {/* Notifications */}
      {success && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900 flex items-center justify-between gap-3 animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
            <span>
              <strong>Profile saved successfully!</strong> Your demographic indicators are now active for Gemini AI recommendation matching.
            </span>
          </div>
          <button
            onClick={() => navigate('/dashboard')}
            className="flex items-center gap-1 font-bold text-emerald-700 hover:text-emerald-900 whitespace-nowrap"
          >
            Go to Recommendations <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Profile Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Age */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Age (Years) *
            </label>
            <input
              type="number"
              name="age"
              required
              min="16"
              max="120"
              value={formData.age}
              onChange={handleChange}
              placeholder="e.g. 21"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Citizen must be between 16 and 120 years of age.
            </span>
          </div>

          {/* Annual Income */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Annual Household Income (₹ INR) *
            </label>
            <input
              type="number"
              name="annual_income"
              required
              min="0"
              step="5000"
              value={formData.annual_income}
              onChange={handleChange}
              placeholder="e.g. 200000"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            />
            <span className="text-[11px] text-emerald-700 font-semibold mt-1 block">
              Approx. ₹{formattedIncomeLakhs} Lakhs / year
            </span>
          </div>

          {/* State / UT */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              State / Union Territory *
            </label>
            <select
              name="stateSelect"
              required
              value={formData.stateSelect}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              <option value="">Select State or UT</option>
              <optgroup label="28 Indian States">
                {INDIAN_STATES_AND_UTS.slice(0, 28).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </optgroup>
              <optgroup label="8 Union Territories">
                {INDIAN_STATES_AND_UTS.slice(28).map(ut => (
                  <option key={ut} value={ut}>{ut}</option>
                ))}
              </optgroup>
              <option value={OTHER_VALUE}>✨ Other (Specify manually)...</option>
            </select>

            {/* Interactive Other Field */}
            {formData.stateSelect === OTHER_VALUE && (
              <div className="relative pt-1">
                <Edit3 className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="stateCustom"
                  value={formData.stateCustom}
                  onChange={handleChange}
                  placeholder="Enter your state/region name"
                  className="w-full bg-white border-2 border-emerald-400 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>
            )}
          </div>

          {/* Occupation */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Primary Occupation *
            </label>
            <select
              name="occupationSelect"
              required
              value={formData.occupationSelect}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              <option value="">Select Primary Occupation</option>
              {OCCUPATIONS.map(occ => (
                <option key={occ} value={occ}>{occ}</option>
              ))}
              <option value={OTHER_VALUE}>✨ Other (Specify manually)...</option>
            </select>

            {/* Interactive Other Field */}
            {formData.occupationSelect === OTHER_VALUE && (
              <div className="relative pt-1">
                <Edit3 className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="occupationCustom"
                  value={formData.occupationCustom}
                  onChange={handleChange}
                  placeholder="Specify your occupation"
                  className="w-full bg-white border-2 border-emerald-400 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>
            )}
          </div>

          {/* Education Level */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Highest Education Completed *
            </label>
            <select
              name="educationSelect"
              required
              value={formData.educationSelect}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              <option value="">Select Education Level</option>
              {EDUCATION_LEVELS.map(edu => (
                <option key={edu} value={edu}>{edu}</option>
              ))}
              <option value={OTHER_VALUE}>✨ Other (Specify manually)...</option>
            </select>

            {/* Interactive Other Field */}
            {formData.educationSelect === OTHER_VALUE && (
              <div className="relative pt-1">
                <Edit3 className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="educationCustom"
                  value={formData.educationCustom}
                  onChange={handleChange}
                  placeholder="Specify your education qualification"
                  className="w-full bg-white border-2 border-emerald-400 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>
            )}
          </div>

          {/* Employment Status */}
          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Current Employment Status *
            </label>
            <select
              name="employmentSelect"
              required
              value={formData.employmentSelect}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              <option value="">Select Employment Status</option>
              {EMPLOYMENT_STATUSES.map(emp => (
                <option key={emp} value={emp}>{emp}</option>
              ))}
              <option value={OTHER_VALUE}>✨ Other (Specify manually)...</option>
            </select>

            {/* Interactive Other Field */}
            {formData.employmentSelect === OTHER_VALUE && (
              <div className="relative pt-1">
                <Edit3 className="w-4 h-4 text-emerald-600 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  name="employmentCustom"
                  value={formData.employmentCustom}
                  onChange={handleChange}
                  placeholder="Specify your employment status"
                  className="w-full bg-white border-2 border-emerald-400 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all"
                />
              </div>
            )}
          </div>

          {/* Marital Status */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Marital Status
            </label>
            <select
              name="marital_status"
              value={formData.marital_status}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              {MARITAL_STATUSES.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
          </div>

          {/* Special Categories */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Special Reservation / Category
            </label>
            <select
              name="special_category"
              value={formData.special_category}
              onChange={handleChange}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
            >
              {SPECIAL_CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

        </div>

        {/* Data Security Note */}
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 flex items-start gap-3 text-xs text-slate-600">
          <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            <strong>Privacy Safeguard:</strong> This information is stored securely in your isolated profile. During AI recommendation processing, data is stripped of identifiers and forwarded anonymously to Google Gemini to calculate eligibility compatibility.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-5 py-2.5 text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 text-xs sm:text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md shadow-emerald-700/20 transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving Profile...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" /> Save Profile & Update Recommendations
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
