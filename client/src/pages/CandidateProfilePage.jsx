import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import {
  User,
  Briefcase,
  GraduationCap,
  FolderGit2,
  Save,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  MapPin,
  Phone,
  Layers,
} from 'lucide-react';

export const CandidateProfilePage = () => {
  const { user, profile, refreshProfile } = useAuth();

  const [name, setName] = useState('');
  const [headline, setHeadline] = useState('');
  const [bio, setBio] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');

  // Preferences
  const [prefRoles, setPrefRoles] = useState('');
  const [prefTypes, setPrefTypes] = useState(['full-time']);
  const [prefLocations, setPrefLocations] = useState('');
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [expectedSalaryMin, setExpectedSalaryMin] = useState(0);

  // Education list
  const [education, setEducation] = useState([]);

  // Experience list
  const [experience, setExperience] = useState([]);

  // Projects list
  const [projects, setProjects] = useState([]);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (user) {
      setName(user.name || '');
    }
    if (profile) {
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      if (profile.jobPreferences) {
        setPrefRoles((profile.jobPreferences.roles || []).join(', '));
        setPrefTypes(profile.jobPreferences.types || ['full-time']);
        setPrefLocations((profile.jobPreferences.preferredLocations || []).join(', '));
        setRemoteOnly(Boolean(profile.jobPreferences.remoteOnly));
        setExpectedSalaryMin(profile.jobPreferences.expectedSalary?.min || 0);
      }
      setEducation(profile.education || []);
      setExperience(profile.experience || []);
      setProjects(profile.projects || []);
    }
  }, [user, profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const payload = {
        name,
        headline,
        bio,
        phone,
        location,
        jobPreferences: {
          roles: prefRoles.split(',').map((r) => r.trim()).filter(Boolean),
          types: prefTypes,
          preferredLocations: prefLocations.split(',').map((l) => l.trim()).filter(Boolean),
          remoteOnly,
          expectedSalary: { min: Number(expectedSalaryMin), max: 0, currency: 'INR' },
        },
        education,
        experience,
        projects,
      };

      const res = await api.put('/candidates/me', payload);
      if (res.success) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({ text: err || 'Failed to update profile.', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Education helpers
  const addEducation = () => {
    setEducation([
      ...education,
      {
        institution: '',
        degree: 'B.Tech',
        fieldOfStudy: '',
        startYear: new Date().getFullYear() - 4,
        endYear: new Date().getFullYear(),
        grade: '',
      },
    ]);
  };
  const removeEducation = (index) => {
    setEducation(education.filter((_, i) => i !== index));
  };
  const updateEducation = (index, field, value) => {
    const copy = [...education];
    copy[index][field] = value;
    setEducation(copy);
  };

  // Experience helpers
  const addExperience = () => {
    setExperience([
      ...experience,
      {
        title: '',
        company: '',
        location: '',
        startDate: '',
        endDate: '',
        isCurrent: true,
        description: '',
      },
    ]);
  };
  const removeExperience = (index) => {
    setExperience(experience.filter((_, i) => i !== index));
  };
  const updateExperience = (index, field, value) => {
    const copy = [...experience];
    copy[index][field] = value;
    setExperience(copy);
  };

  // Project helpers
  const addProject = () => {
    setProjects([
      ...projects,
      {
        title: '',
        description: '',
        technologies: [],
        link: '',
        github: '',
      },
    ]);
  };
  const removeProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index));
  };
  const updateProject = (index, field, value) => {
    const copy = [...projects];
    if (field === 'technologies') {
      copy[index][field] = value.split(',').map((t) => t.trim());
    } else {
      copy[index][field] = value;
    }
    setProjects(copy);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <form onSubmit={handleSave} className="max-w-4xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Edit Candidate Profile
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Your profile data directly feeds the 5-factor matching algorithm
            </p>
          </div>
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50 self-start sm:self-auto"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>

        {/* Message Alert */}
        {message.text && (
          <div
            className={`p-4 rounded-2xl flex items-center gap-2 text-xs font-semibold ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {message.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        {/* Basic Personal Details */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <User className="w-4 h-4 text-indigo-600" />
            <span>Personal & Contact Information</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Professional Headline
              </label>
              <input
                type="text"
                placeholder="e.g. Full Stack MERN Developer | React & Node.js"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Current Location
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Karnataka"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Phone Number
              </label>
              <input
                type="text"
                placeholder="e.g. +91 98765 43210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Professional Bio
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of your technical background, passions, and achievements..."
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900"
            />
          </div>
        </div>

        {/* Job Preferences (10% weight) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            <span>Job Preferences (10% Recommendation Weight)</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Target Roles (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Frontend Developer, Full Stack Engineer"
                value={prefRoles}
                onChange={(e) => setPrefRoles(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
                Preferred Locations (Comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Bengaluru, Mumbai, Remote"
                value={prefLocations}
                onChange={(e) => setPrefLocations(e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs text-slate-900"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 pt-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => setRemoteOnly(e.target.checked)}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300"
              />
              <span>Remote Only Preferences</span>
            </label>
          </div>
        </div>

        {/* Education (15% weight) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>Education Records (15% Recommendation Weight)</span>
            </h2>
            <button
              type="button"
              onClick={addEducation}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Degree</span>
            </button>
          </div>

          {education.map((edu, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeEducation(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Institution</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. National Institute of Technology"
                    value={edu.institution}
                    onChange={(e) => updateEducation(idx, 'institution', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Degree</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. B.Tech, M.Tech, BCA"
                    value={edu.degree}
                    onChange={(e) => updateEducation(idx, 'degree', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Field of Study</label>
                  <input
                    type="text"
                    placeholder="e.g. Information Technology"
                    value={edu.fieldOfStudy}
                    onChange={(e) => updateEducation(idx, 'fieldOfStudy', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Experience (15% weight) */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-indigo-600" />
              <span>Work Experience (15% Recommendation Weight)</span>
            </h2>
            <button
              type="button"
              onClick={addExperience}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Experience</span>
            </button>
          </div>

          {experience.map((exp, idx) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 relative">
              <button
                type="button"
                onClick={() => removeExperience(idx)}
                className="absolute top-3 right-3 text-slate-400 hover:text-rose-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Job Title</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Software Engineer"
                    value={exp.title}
                    onChange={(e) => updateExperience(idx, 'title', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-600 mb-1">Company</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Acme Tech Solutions"
                    value={exp.company}
                    onChange={(e) => updateExperience(idx, 'company', e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Responsibilities and achievements..."
                  value={exp.description}
                  onChange={(e) => updateExperience(idx, 'description', e.target.value)}
                  className="w-full p-2.5 rounded-lg border border-slate-200 text-xs bg-white"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Submit Bottom Card */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 transition flex items-center gap-2 disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving Profile...' : 'Save All Profile Changes'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
