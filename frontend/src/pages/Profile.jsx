import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Coins, 
  Activity, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  Sparkles,
  Edit3
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

// 28 Indian States & 8 Union Territories
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

export const OCCUPATION_OPTIONS = [
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

export const EDUCATION_OPTIONS = [
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

export const EMPLOYMENT_OPTIONS = [
  "Unemployed (Seeking Job)",
  "Employed (Full-time)",
  "Employed (Part-time)",
  "Self-Employed",
  "Student / Intern",
  "Retired",
  "Not Seeking Employment"
];

const OTHER_VALUE = "Other";

// Zod Schema allowing flexible strings for custom specified values
const profileFormSchema = z.object({
  age: z.coerce
    .number({ invalid_type_error: "Age must be a number" })
    .min(16, "Must be at least 16 years old")
    .max(120, "Please enter a valid age"),
  state_select: z.string().min(1, "Please select your state or choose 'Other'"),
  state_custom: z.string().optional(),
  occupation_select: z.string().min(1, "Please select an occupation or choose 'Other'"),
  occupation_custom: z.string().optional(),
  annual_income: z.coerce
    .number({ invalid_type_error: "Income must be a number" })
    .min(0, "Income cannot be negative"),
  education_level_select: z.string().min(1, "Please select education level or choose 'Other'"),
  education_level_custom: z.string().optional(),
  employment_status_select: z.string().min(1, "Please select employment status or choose 'Other'"),
  employment_status_custom: z.string().optional()
}).superRefine((data, ctx) => {
  if (data.state_select === OTHER_VALUE && (!data.state_custom || data.state_custom.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["state_custom"],
      message: "Please enter your state/region name (at least 2 characters)"
    });
  }
  if (data.occupation_select === OTHER_VALUE && (!data.occupation_custom || data.occupation_custom.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["occupation_custom"],
      message: "Please specify your occupation (at least 2 characters)"
    });
  }
  if (data.education_level_select === OTHER_VALUE && (!data.education_level_custom || data.education_level_custom.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["education_level_custom"],
      message: "Please specify your education qualification (at least 2 characters)"
    });
  }
  if (data.employment_status_select === OTHER_VALUE && (!data.employment_status_custom || data.employment_status_custom.trim().length < 2)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["employment_status_custom"],
      message: "Please specify your employment status (at least 2 characters)"
    });
  }
});

export default function Profile() {
  const { profile, fetchProfile, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      age: 18,
      state_select: "Andhra Pradesh",
      state_custom: "",
      occupation_select: "Student",
      occupation_custom: "",
      annual_income: 0,
      education_level_select: "Undergraduate (B.Tech, B.Sc, B.Com, B.A, MBBS, etc.)",
      education_level_custom: "",
      employment_status_select: "Student / Intern",
      employment_status_custom: ""
    }
  });

  const selectedState = watch("state_select");
  const selectedOccupation = watch("occupation_select");
  const selectedEducation = watch("education_level_select");
  const selectedEmployment = watch("employment_status_select");

  // Restore profile values accurately when profile loads or updates
  useEffect(() => {
    if (profile) {
      // 1. Resolve State
      let stateSelect = "Andhra Pradesh";
      let stateCustom = "";
      if (profile.state) {
        if (INDIAN_STATES_AND_UTS.includes(profile.state)) {
          stateSelect = profile.state;
        } else {
          stateSelect = OTHER_VALUE;
          stateCustom = profile.state;
        }
      }

      // 2. Resolve Occupation
      let occSelect = "Student";
      let occCustom = "";
      if (profile.occupation) {
        const found = OCCUPATION_OPTIONS.find(o => o.toLowerCase() === profile.occupation.toLowerCase());
        if (found) {
          occSelect = found;
        } else if (profile.occupation.toLowerCase().includes("farmer")) {
          occSelect = "Farmer / Agricultural Worker";
        } else {
          occSelect = OTHER_VALUE;
          occCustom = profile.occupation;
        }
      }

      // 3. Resolve Education Level
      let eduSelect = "Undergraduate (B.Tech, B.Sc, B.Com, B.A, MBBS, etc.)";
      let eduCustom = "";
      if (profile.education_level) {
        const foundEdu = EDUCATION_OPTIONS.find(e => e.toLowerCase() === profile.education_level.toLowerCase() || e.toLowerCase().startsWith(profile.education_level.toLowerCase()));
        if (foundEdu) {
          eduSelect = foundEdu;
        } else if (profile.education_level === "Undergraduate") {
          eduSelect = "Undergraduate (B.Tech, B.Sc, B.Com, B.A, MBBS, etc.)";
        } else if (profile.education_level === "Postgraduate") {
          eduSelect = "Postgraduate (M.Tech, M.Sc, M.Com, M.A, MBA, etc.)";
        } else {
          eduSelect = OTHER_VALUE;
          eduCustom = profile.education_level;
        }
      }

      // 4. Resolve Employment Status
      let empSelect = "Student / Intern";
      let empCustom = "";
      if (profile.employment_status) {
        const foundEmp = EMPLOYMENT_OPTIONS.find(e => e.toLowerCase() === profile.employment_status.toLowerCase() || e.toLowerCase().startsWith(profile.employment_status.toLowerCase()));
        if (foundEmp) {
          empSelect = foundEmp;
        } else if (profile.employment_status === "Unemployed") {
          empSelect = "Unemployed (Seeking Job)";
        } else if (profile.employment_status === "Employed") {
          empSelect = "Employed (Full-time)";
        } else if (profile.employment_status === "Student") {
          empSelect = "Student / Intern";
        } else {
          empSelect = OTHER_VALUE;
          empCustom = profile.employment_status;
        }
      }

      reset({
        age: profile.age ?? 18,
        state_select: stateSelect,
        state_custom: stateCustom,
        occupation_select: occSelect,
        occupation_custom: occCustom,
        annual_income: profile.annual_income ?? 0,
        education_level_select: eduSelect,
        education_level_custom: eduCustom,
        employment_status_select: empSelect,
        employment_status_custom: empCustom
      });
    } else {
      reset({
        age: 18,
        state_select: "Andhra Pradesh",
        state_custom: "",
        occupation_select: "Student",
        occupation_custom: "",
        annual_income: 0,
        education_level_select: "Undergraduate (B.Tech, B.Sc, B.Com, B.A, MBBS, etc.)",
        education_level_custom: "",
        employment_status_select: "Student / Intern",
        employment_status_custom: ""
      });
    }
  }, [profile, reset]);

  const onSubmit = async (formData) => {
    setIsSubmitting(true);
    setSubmitMessage("");
    setIsSuccess(false);

    // Resolve final values (using custom string when 'Other' is chosen)
    const finalPayload = {
      age: Number(formData.age),
      state: formData.state_select === OTHER_VALUE ? formData.state_custom.trim() : formData.state_select,
      occupation: formData.occupation_select === OTHER_VALUE ? formData.occupation_custom.trim() : formData.occupation_select,
      annual_income: Number(formData.annual_income),
      education_level: formData.education_level_select === OTHER_VALUE ? formData.education_level_custom.trim() : formData.education_level_select,
      employment_status: formData.employment_status_select === OTHER_VALUE ? formData.employment_status_custom.trim() : formData.employment_status_select
    };

    try {
      const baseUrl = (import.meta.env.VITE_API_URL || '/api').replace(/\/$/, '');
      const token = localStorage.getItem('token') || localStorage.getItem('scheme_auth_token') || '';

      const response = await fetch(`${baseUrl}/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': token ? `Bearer ${token}` : ''
        },
        body: JSON.stringify(finalPayload)
      });

      const resData = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(resData.message || resData.error || "Failed to update profile. Please verify your inputs.");
      }

      setIsSuccess(true);
      setSubmitMessage("Profile updated successfully! AI can now match you with targeted schemes.");

      if (refreshProfile) await refreshProfile();
      else if (fetchProfile) await fetchProfile();
    } catch (error) {
      setIsSuccess(false);
      setSubmitMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="bg-white shadow-xl rounded-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-govnavy-900 via-indigo-900 to-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-emerald-400">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Citizen Demographic Profile</h1>
              <p className="text-xs text-slate-300">
                Grounded matching criteria for personalized government welfare & scholarship discovery.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Status Message */}
          {submitMessage && (
            <div className={`p-4 rounded-xl text-sm flex items-start justify-between gap-3 border ${
              isSuccess 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}>
              <div className="flex items-center gap-2">
                {isSuccess ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
                )}
                <span>{submitMessage}</span>
              </div>
              {isSuccess && (
                <button
                  type="button"
                  onClick={() => navigate('/dashboard')}
                  className="inline-flex items-center gap-1 font-bold text-xs text-emerald-700 hover:text-emerald-900 underline whitespace-nowrap"
                >
                  View Recommendations <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            
            {/* 1. Age & Income */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Age */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" /> Age (Years) *
                </label>
                <input 
                  type="number" 
                  min="16"
                  max="120"
                  {...register('age')} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. 21"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Must be between 16 and 120 years old</span>
                {errors.age && <span className="text-rose-500 text-xs mt-1 block">{errors.age.message}</span>}
              </div>

              {/* Annual Income */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Coins className="w-3.5 h-3.5 text-slate-400" /> Annual Family Income (₹ INR) *
                </label>
                <input 
                  type="number" 
                  min="0"
                  step="5000"
                  {...register('annual_income')} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                  placeholder="e.g. 200000"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">Used to verify income ceiling eligibility</span>
                {errors.annual_income && <span className="text-rose-500 text-xs mt-1 block">{errors.annual_income.message}</span>}
              </div>
            </div>

            {/* 2. State / Region */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-slate-400" /> State / Region / UT *
              </label>
              <select 
                {...register('state_select')} 
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="">Select your State or Union Territory...</option>
                <optgroup label="28 Indian States">
                  {INDIAN_STATES_AND_UTS.slice(0, 28).map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </optgroup>
                <optgroup label="8 Union Territories">
                  {INDIAN_STATES_AND_UTS.slice(28).map(ut => (
                    <option key={ut} value={ut}>{ut}</option>
                  ))}
                </optgroup>
                <option value={OTHER_VALUE}>✨ Other (Specify manually)...</option>
              </select>
              {errors.state_select && <span className="text-rose-500 text-xs block">{errors.state_select.message}</span>}

              {/* Interactive Other Field */}
              {selectedState === OTHER_VALUE && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="relative">
                    <Edit3 className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                    <input 
                      type="text"
                      {...register('state_custom')}
                      placeholder="Enter your state/region name (e.g. Overseas, Custom Territory)"
                      className="w-full bg-white border-2 border-indigo-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    />
                  </div>
                  {errors.state_custom && <span className="text-rose-500 text-xs mt-1 block">{errors.state_custom.message}</span>}
                </div>
              )}
            </div>

            {/* 3. Occupation */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Primary Occupation *
              </label>
              <select 
                {...register('occupation_select')} 
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="">Select your primary occupation...</option>
                {OCCUPATION_OPTIONS.map(occ => (
                  <option key={occ} value={occ}>{occ}</option>
                ))}
                <option value={OTHER_VALUE}>✨ Other (Specify manually)...</option>
              </select>
              {errors.occupation_select && <span className="text-rose-500 text-xs block">{errors.occupation_select.message}</span>}

              {/* Interactive Other Field */}
              {selectedOccupation === OTHER_VALUE && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="relative">
                    <Edit3 className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                    <input 
                      type="text"
                      {...register('occupation_custom')}
                      placeholder="Specify your occupation (e.g. Research Assistant, Architect, Electrician)"
                      className="w-full bg-white border-2 border-indigo-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    />
                  </div>
                  {errors.occupation_custom && <span className="text-rose-500 text-xs mt-1 block">{errors.occupation_custom.message}</span>}
                </div>
              )}
            </div>

            {/* 4. Education Level */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-slate-400" /> Education Qualification *
              </label>
              <select 
                {...register('education_level_select')} 
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="">Select highest education completed or pursuing...</option>
                {EDUCATION_OPTIONS.map(edu => (
                  <option key={edu} value={edu}>{edu}</option>
                ))}
                <option value={OTHER_VALUE}>✨ Other (Specify manually)...</option>
              </select>
              {errors.education_level_select && <span className="text-rose-500 text-xs block">{errors.education_level_select.message}</span>}

              {/* Interactive Other Field */}
              {selectedEducation === OTHER_VALUE && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="relative">
                    <Edit3 className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                    <input 
                      type="text"
                      {...register('education_level_custom')}
                      placeholder="Specify your education qualification (e.g. Post-Doctoral Fellowship, Chartered Accountancy)"
                      className="w-full bg-white border-2 border-indigo-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    />
                  </div>
                  {errors.education_level_custom && <span className="text-rose-500 text-xs mt-1 block">{errors.education_level_custom.message}</span>}
                </div>
              )}
            </div>

            {/* 5. Employment Status */}
            <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-slate-400" /> Employment Status *
              </label>
              <select 
                {...register('employment_status_select')} 
                className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                <option value="">Select current employment status...</option>
                {EMPLOYMENT_OPTIONS.map(emp => (
                  <option key={emp} value={emp}>{emp}</option>
                ))}
                <option value={OTHER_VALUE}>✨ Other (Specify manually)...</option>
              </select>
              {errors.employment_status_select && <span className="text-rose-500 text-xs block">{errors.employment_status_select.message}</span>}

              {/* Interactive Other Field */}
              {selectedEmployment === OTHER_VALUE && (
                <div className="pt-2 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="relative">
                    <Edit3 className="w-4 h-4 text-indigo-500 absolute left-3.5 top-3" />
                    <input 
                      type="text"
                      {...register('employment_status_custom')}
                      placeholder="Specify your employment status (e.g. Freelance Consultant, On Sabbatical)"
                      className="w-full bg-white border-2 border-indigo-400 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all"
                    />
                  </div>
                  {errors.employment_status_custom && <span className="text-rose-500 text-xs mt-1 block">{errors.employment_status_custom.message}</span>}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-end gap-3 border-t border-slate-200">
              <button 
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-5 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-100 transition-all"
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSubmitting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-8 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-400 cursor-pointer transition-all"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Saving Demographic Profile...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Save Profile & Update Recommendations
                  </>
                )}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
