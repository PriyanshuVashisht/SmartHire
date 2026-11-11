import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import {
  FileText,
  Upload,
  CheckCircle2,
  AlertCircle,
  Download,
  Sparkles,
  Plus,
  X,
  FileCheck,
  Calendar,
  GraduationCap,
  Briefcase,
  Layers,
} from 'lucide-react';
import { Badge } from '../components/Badge';

export const ResumePage = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [resumeData, setResumeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Skills management state
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillLevel, setNewSkillLevel] = useState('intermediate');
  const [savingSkills, setSavingSkills] = useState(false);

  const fetchResume = async () => {
    try {
      setLoading(true);
      const res = await api.get('/resumes/me');
      if (res.success) {
        setResumeData(res.resume);
      }
    } catch (err) {
      console.warn('No resume found or failed to fetch:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResume();
    if (profile?.skills) {
      setSkills(profile.skills);
    }
  }, [profile]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const ext = file.name.split('.').pop().toLowerCase();
      if (!['pdf', 'docx', 'doc'].includes(ext)) {
        setMessage({ text: 'Only PDF and DOCX files are supported.', type: 'error' });
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setMessage({ text: 'File size exceeds maximum limit of 10MB.', type: 'error' });
        return;
      }
      setSelectedFile(file);
      setMessage({ text: '', type: '' });
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setUploading(true);
    setMessage({ text: '', type: '' });

    const formData = new FormData();
    formData.append('resume', selectedFile);

    try {
      const res = await api.post('/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (res.success) {
        setMessage({
          text: `Resume parsed successfully! Extracted ${res.resume.extractedSkills.length} skills.`,
          type: 'success',
        });
        setSelectedFile(null);
        await fetchResume();
        await refreshProfile();
      }
    } catch (err) {
      setMessage({
        text: err || 'Failed to upload or parse resume. Please try again.',
        type: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (!newSkillName.trim()) return;

    const exists = skills.some(
      (s) => s.name.toLowerCase() === newSkillName.trim().toLowerCase()
    );

    if (exists) {
      setMessage({ text: 'This skill is already in your profile.', type: 'error' });
      return;
    }

    const updated = [
      ...skills,
      {
        name: newSkillName.trim(),
        level: newSkillLevel,
        category: 'Technical',
      },
    ];

    setSkills(updated);
    setNewSkillName('');
    setMessage({ text: '', type: '' });
  };

  const handleRemoveSkill = (skillNameToRemove) => {
    const updated = skills.filter((s) => s.name !== skillNameToRemove);
    setSkills(updated);
  };

  const handleSaveSkills = async () => {
    setSavingSkills(true);
    try {
      const res = await api.put('/candidates/me', { skills });
      if (res.success) {
        setMessage({ text: 'Skills updated successfully in your profile!', type: 'success' });
        await refreshProfile();
      }
    } catch (err) {
      setMessage({ text: err || 'Failed to save skills.', type: 'error' });
    } finally {
      setSavingSkills(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                Automated Resume Parser & Skills Taxonomy
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">
                Resume Management & Verified Skills
              </h1>
              <p className="text-xs text-slate-500 mt-1 max-w-xl">
                Upload your latest resume to automatically populate technical skills, experience metrics, and education qualifications used in the recommendation engine.
              </p>
            </div>
            {resumeData && (
              <a
                href={`/api/resumes/${resumeData._id}/download`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 font-bold text-xs text-slate-700 transition shrink-0"
              >
                <Download className="w-4 h-4 text-indigo-600" />
                <span>Download Saved Resume</span>
              </a>
            )}
          </div>
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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Upload Dropzone (1 col) */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Upload className="w-4 h-4 text-indigo-600" />
                <span>Upload New Resume</span>
              </h2>

              <form onSubmit={handleUpload} className="space-y-4">
                <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center transition bg-slate-50/50">
                  <input
                    type="file"
                    id="resumeUpload"
                    accept=".pdf,.docx,.doc"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <label htmlFor="resumeUpload" className="cursor-pointer block space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800">
                        {selectedFile ? selectedFile.name : 'Click to select or drag & drop'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        Supported: PDF, DOCX (Max 10MB)
                      </p>
                    </div>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={!selectedFile || uploading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-4 rounded-xl text-xs shadow-md shadow-indigo-600/20 transition flex items-center justify-center gap-2 disabled:opacity-40"
                >
                  {uploading ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Parse & Extract Information</span>
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Current Resume Metadata Card */}
            {resumeData && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Active Resume Metadata
                </h3>
                <div className="space-y-2 text-xs">
                  <p className="flex justify-between font-semibold text-slate-700">
                    <span>File Name:</span>
                    <span className="text-slate-900 truncate max-w-[160px]">
                      {resumeData.originalFilename}
                    </span>
                  </p>
                  <p className="flex justify-between font-semibold text-slate-700">
                    <span>File Format:</span>
                    <span className="uppercase text-indigo-600 font-bold">{resumeData.fileType}</span>
                  </p>
                  <p className="flex justify-between font-semibold text-slate-700">
                    <span>Uploaded:</span>
                    <span className="text-slate-500">
                      {new Date(resumeData.uploadedAt).toLocaleDateString()}
                    </span>
                  </p>
                  <p className="flex justify-between font-semibold text-slate-700">
                    <span>Detected Experience:</span>
                    <span className="text-slate-900 font-bold">
                      {resumeData.parsedData?.experienceYears || 0} years
                    </span>
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Interactive Skills Taxonomy & Extracted Info (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Extracted Skills Management Card */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-600" />
                    <span>Candidate Skills Inventory ({skills.length})</span>
                  </h2>
                  <p className="text-xs text-slate-500">
                    Skills extracted from your resume or manually added. Directly influences your 50% skill match score.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleSaveSkills}
                  disabled={savingSkills}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50 self-start sm:self-auto"
                >
                  {savingSkills ? 'Saving...' : 'Save Skills Changes'}
                </button>
              </div>

              {/* Add New Skill Form */}
              <form onSubmit={handleAddSkill} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  placeholder="Add skill (e.g. React, Node.js, Docker, Python)..."
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                />
                <select
                  value={newSkillLevel}
                  onChange={(e) => setNewSkillLevel(e.target.value)}
                  className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white focus:outline-none"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
                <button
                  type="submit"
                  className="bg-slate-900 hover:bg-slate-800 text-white font-bold px-4 py-2 rounded-xl text-xs transition flex items-center justify-center gap-1 shrink-0"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Skill</span>
                </button>
              </form>

              {/* Skills Tags List */}
              <div className="space-y-3">
                {skills.length === 0 ? (
                  <div className="p-8 text-center bg-slate-50 rounded-2xl border border-slate-100 text-xs text-slate-400">
                    No skills registered yet. Upload a resume or add skills using the form above.
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill, idx) => (
                      <div
                        key={idx}
                        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-900 border border-indigo-200 text-xs font-semibold shadow-sm group"
                      >
                        <span>{skill.name}</span>
                        <span className="text-[10px] text-indigo-500 font-normal uppercase">
                          ({skill.level})
                        </span>
                        <button
                          type="button"
                          onClick={() => handleRemoveSkill(skill.name)}
                          className="text-indigo-400 hover:text-rose-600 transition"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Extracted Text Preview Card */}
            {resumeData?.extractedText && (
              <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
                <h3 className="text-sm font-bold text-slate-900">Extracted Raw Text Preview</h3>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 max-h-48 overflow-y-auto text-xs text-slate-600 font-mono leading-relaxed whitespace-pre-wrap">
                  {resumeData.extractedText}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
