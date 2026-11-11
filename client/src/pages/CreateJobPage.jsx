import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosClient';
import {
  Briefcase,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Building2,
  DollarSign,
  MapPin,
  GraduationCap,
} from 'lucide-react';

export const CreateJobPage = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState('Engineering');
  const [jobType, setJobType] = useState('full-time');
  const [experienceLevel, setExperienceLevel] = useState('entry');
  const [minExperienceYears, setMinExperienceYears] = useState(1);
  const [minEducation, setMinEducation] = useState('Bachelors');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [salaryMin, setSalaryMin] = useState(600000);
  const [salaryMax, setSalaryMax] = useState(1200000);
  const [description, setDescription] = useState('');
  const [responsibilitiesText, setResponsibilitiesText] = useState('');
  const [requirementsText, setRequirementsText] = useState('');

  // Skills
  const [requiredSkills, setRequiredSkills] = useState([
    { name: 'JavaScript', weight: 1 },
    { name: 'React', weight: 2 },
  ]);
  const [newSkill, setNewSkill] = useState('');
  const [newWeight, setNewWeight] = useState(1);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkill.trim()) return;

    if (requiredSkills.some((s) => s.name.toLowerCase() === newSkill.trim().toLowerCase())) {
      return;
    }

    setRequiredSkills([...requiredSkills, { name: newSkill.trim(), weight: Number(newWeight) }]);
    setNewSkill('');
    setNewWeight(1);
  };

  const handleRemoveSkill = (skillName) => {
    setRequiredSkills(requiredSkills.filter((s) => s.name !== skillName));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requiredSkills.length === 0) {
      setError('Please add at least one required technical skill.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const payload = {
        title,
        department,
        jobType,
        experienceLevel,
        minExperienceYears: Number(minExperienceYears),
        minEducation,
        location,
        isRemote,
        salary: {
          min: Number(salaryMin),
          max: Number(salaryMax),
          currency: 'INR',
          isDisclosed: true,
        },
        description,
        responsibilities: responsibilitiesText
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean),
        requirements: requirementsText
          .split('\n')
          .map((r) => r.trim())
          .filter(Boolean),
        requiredSkills,
      };

      const res = await api.post('/jobs', payload);
      if (res.success) {
        navigate(`/jobs/${res.job._id}`);
      }
    } catch (err) {
      setError(err || 'Failed to post job listing.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Create Job / Internship Opening
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Specify skills and criteria to enable algorithmic applicant matching
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50 self-start sm:self-auto"
          >
            <span>{loading ? 'Publishing...' : 'Publish Vacancy'}</span>
          </button>
        </div>

        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Basic Information */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Core Position Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Job Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Senior Backend Engineer"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Department
              </label>
              <input
                type="text"
                placeholder="e.g. Core Infrastructure, Cloud Platform"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Position Type
              </label>
              <select
                value={jobType}
                onChange={(e) => setJobType(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-medium"
              >
                <option value="full-time">Full-time</option>
                <option value="internship">Internship</option>
                <option value="part-time">Part-time</option>
                <option value="contract">Contract</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-medium"
              >
                <option value="intern">Intern</option>
                <option value="entry">Entry Level</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior Level</option>
                <option value="lead">Lead</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min. Experience (Years)
              </label>
              <input
                type="number"
                min="0"
                max="20"
                value={minExperienceYears}
                onChange={(e) => setMinExperienceYears(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Location (City / State) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bengaluru, Karnataka"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Min. Education Requirement
              </label>
              <select
                value={minEducation}
                onChange={(e) => setMinEducation(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-900 font-medium"
              >
                <option value="Bachelors">Bachelors Degree (B.Tech / B.E. / BCA / BS)</option>
                <option value="Masters">Masters Degree (M.Tech / MS / MCA)</option>
                <option value="Doctorate">PhD / Doctorate</option>
                <option value="Any">Any / Self-taught</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            <input
              type="checkbox"
              id="remoteCheck"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="w-4 h-4 text-indigo-600 rounded border-slate-300"
            />
            <label htmlFor="remoteCheck" className="text-xs font-bold text-slate-700 cursor-pointer">
              Remote Work Allowed (Full Remote or Hybrid)
            </label>
          </div>
        </div>

        {/* Salary Range */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Compensation (Annual CTC in INR)
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Minimum Annual CTC (₹)
              </label>
              <input
                type="number"
                step="50000"
                value={salaryMin}
                onChange={(e) => setSalaryMin(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                ₹{(salaryMin / 100000).toFixed(1)} Lakhs / year
              </span>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Maximum Annual CTC (₹)
              </label>
              <input
                type="number"
                step="50000"
                value={salaryMax}
                onChange={(e) => setSalaryMax(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
              <span className="text-[10px] text-slate-500 font-semibold mt-0.5 block">
                ₹{(salaryMax / 100000).toFixed(1)} Lakhs / year
              </span>
            </div>
          </div>
        </div>

        {/* Required Technical Skills & Weights (Crucial for recommendation engine!) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Required Technical Skills & Importance Weight
            </h2>
            <p className="text-xs text-slate-500">
              These skills constitute 50% of the candidate recommendation algorithm matching score.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="e.g. Node.js, Express, MongoDB, Docker..."
              value={newSkill}
              onChange={(e) => setNewSkill(e.target.value)}
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
            <select
              value={newWeight}
              onChange={(e) => setNewWeight(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white text-slate-700 font-semibold"
            >
              <option value={1}>Normal Weight (1x)</option>
              <option value={2}>High Priority (2x)</option>
              <option value={3}>Critical Must-Have (3x)</option>
            </select>
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition shrink-0"
            >
              Add Skill
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            {requiredSkills.map((skill) => (
              <span
                key={skill.name}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs font-semibold"
              >
                <span>{skill.name}</span>
                <span className="text-[10px] text-indigo-500">({skill.weight}x)</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill.name)}
                  className="text-indigo-400 hover:text-rose-600 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Text descriptions */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3">
            Description & Specifications
          </h2>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Job Description *
            </label>
            <textarea
              rows={4}
              required
              placeholder="Detailed overview of the role and objectives..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Responsibilities (One item per line)
            </label>
            <textarea
              rows={3}
              placeholder="Design and implement REST APIs&#10;Optimize database query performance&#10;Collaborate with frontend engineers"
              value={responsibilitiesText}
              onChange={(e) => setResponsibilitiesText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Requirements (One item per line)
            </label>
            <textarea
              rows={3}
              placeholder="Strong command of JavaScript & TypeScript&#10;Experience with NoSQL databases&#10;Excellent communication skills"
              value={requirementsText}
              onChange={(e) => setRequirementsText(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <span>{loading ? 'Publishing...' : 'Publish Vacancy Now'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
