import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import {
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  GraduationCap,
  Clock,
  Sparkles,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Share2,
  Send,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Modal } from '../components/Modal';

export const JobDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isAuthenticated, isCandidate, user } = useAuth();

  const [job, setJob] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverNote, setCoverNote] = useState('');
  const [applicationSuccess, setApplicationSuccess] = useState(false);
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [existingStatus, setExistingStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchJobAndMatch = async () => {
      try {
        setLoading(true);
        const res = await api.get(`/jobs/${id}`);
        if (res.success) {
          setJob(res.job);
        }

        // If candidate, check match score and whether already applied
        if (isAuthenticated && isCandidate) {
          try {
            const matchRes = await api.get(`/recommendations/jobs/${id}/match`);
            if (matchRes.success) {
              setMatchData(matchRes.match);
            }
          } catch (e) {
            // Ignored
          }

          try {
            const myAppsRes = await api.get('/applications/me');
            if (myAppsRes.success) {
              const matchedApp = myAppsRes.applications.find(
                (app) => app.job?._id === id || app.job === id
              );
              if (matchedApp) {
                setAlreadyApplied(true);
                setExistingStatus(matchedApp.status);
              }
            }
          } catch (e) {
            // Ignored
          }
        }
      } catch (err) {
        console.error('Failed to load job details:', err);
        setError('Job not found or could not be loaded.');
      } finally {
        setLoading(false);
      }
    };

    fetchJobAndMatch();
  }, [id, isAuthenticated, isCandidate]);

  const handleApply = async (e) => {
    e.preventDefault();
    setApplying(true);
    setError('');

    try {
      const res = await api.post('/applications', {
        jobId: id,
        coverNote,
      });

      if (res.success) {
        setApplicationSuccess(true);
        setAlreadyApplied(true);
        setExistingStatus('applied');
        setApplyModalOpen(false);
      }
    } catch (err) {
      setError(err || 'Failed to submit application. Please try again.');
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center max-w-md shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
          <h2 className="text-lg font-bold text-slate-900 mb-1">Position Not Available</h2>
          <p className="text-xs text-slate-500 mb-4">{error || 'This job listing does not exist.'}</p>
          <Link
            to="/jobs"
            className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
          >
            Back to All Jobs
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Back Link */}
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Listings</span>
        </button>

        {/* Success Alert if just applied */}
        {applicationSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>
                <strong>Application successfully submitted!</strong> You can track this application in your dashboard.
              </span>
            </div>
            <Link
              to="/candidate/applications"
              className="font-bold underline text-emerald-900 hover:text-emerald-950"
            >
              View Application Tracker
            </Link>
          </div>
        )}

        {/* Header Hero Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-200 p-2.5 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              {job.company?.logo ? (
                <img
                  src={job.company.logo}
                  alt={job.company.name}
                  className="w-full h-full object-contain"
                />
              ) : (
                <Building2 className="w-8 h-8 text-slate-400" />
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {job.title}
                </h1>
                <Badge variant={job.jobType === 'internship' ? 'warning' : 'primary'}>
                  {job.jobType}
                </Badge>
                {job.status === 'closed' && <Badge variant="danger">Closed</Badge>}
              </div>

              <p className="text-sm font-semibold text-slate-600">
                {job.company?.name || 'Verified Employer'} • {job.department}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 pt-1">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {job.isRemote ? 'Remote (India)' : job.location}
                </span>
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                  Min. {job.minEducation}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                  {job.minExperienceYears > 0 ? `${job.minExperienceYears}+ yrs experience` : 'Freshers / Interns welcome'}
                </span>
              </div>
            </div>
          </div>

          {/* Action CTA */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0">
            {job.salary?.isDisclosed && job.salary.min > 0 && (
              <div className="text-left md:text-right">
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Salary Range</p>
                <p className="text-2xl font-black text-slate-900">
                  ₹{(job.salary.min / 100000).toFixed(1)}L - ₹{(job.salary.max / 100000).toFixed(1)}L
                </p>
              </div>
            )}

            {isCandidate ? (
              alreadyApplied ? (
                <div className="flex flex-col items-start md:items-end gap-1">
                  <Badge variant="success" size="lg">
                    Applied: {existingStatus.replace('_', ' ').toUpperCase()}
                  </Badge>
                  <Link
                    to="/candidate/applications"
                    className="text-xs font-bold text-indigo-600 hover:underline"
                  >
                    View Status Timeline
                  </Link>
                </div>
              ) : job.status === 'closed' ? (
                <button
                  disabled
                  className="px-6 py-3 rounded-xl bg-slate-200 text-slate-400 font-bold text-xs cursor-not-allowed"
                >
                  Position Closed
                </button>
              ) : (
                <button
                  onClick={() => setApplyModalOpen(true)}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-7 py-3 rounded-xl text-sm shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>Apply Now</span>
                </button>
              )
            ) : !isAuthenticated ? (
              <Link
                to="/login"
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition"
              >
                Log In as Candidate to Apply
              </Link>
            ) : null}
          </div>
        </div>

        {/* Two-Column Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content (2 cols) */}
          <div className="lg:col-span-2 space-y-6">
            {/* Description */}
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-base font-bold text-slate-900 mb-2">Job Description</h2>
                <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                  {job.description}
                </p>
              </div>

              {/* Responsibilities */}
              {job.responsibilities && job.responsibilities.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Key Responsibilities</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {job.responsibilities.map((resp, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                        <span>{resp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Requirements */}
              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Qualifications & Requirements</h3>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {job.requirements.map((req, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Required Skills Badges */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-3">Required Technical Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {(job.requiredSkills || []).map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200"
                    >
                      {typeof skill === 'string' ? skill : skill.name}
                    </span>
                  ))}
                </div>
              </div>

              {/* Optional Skills */}
              {job.optionalSkills && job.optionalSkills.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-900 mb-3">Preferred / Good-to-Have Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.optionalSkills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg bg-slate-100 text-slate-600 font-medium text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar / Match Score Breakdown (1 col) */}
          <div className="space-y-6">
            {/* Explainable Recommendation Breakdown Card */}
            {isCandidate && matchData && (
              <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-xl space-y-4 border border-indigo-800">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-indigo-400" />
                    <h3 className="font-bold text-sm">Explainable Match Score</h3>
                  </div>
                  <MatchScoreBadge score={matchData.overallScore} showLabel={false} size="lg" />
                </div>

                <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm space-y-1.5 text-xs">
                  <div className="flex justify-between font-semibold">
                    <span>Overall Match:</span>
                    <span className="text-indigo-300 font-bold">{matchData.overallScore}%</span>
                  </div>
                  <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-400 h-full rounded-full transition-all duration-500"
                      style={{ width: `${matchData.overallScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-300 pt-1">
                    <span>Skill Coverage:</span>
                    <span>{matchData.skillCoverage}%</span>
                  </div>
                </div>

                {/* Matched vs Missing Skills */}
                <div className="space-y-2 text-xs">
                  <p className="font-bold text-slate-200">Skills Breakdown:</p>
                  <div className="space-y-1.5">
                    {matchData.matchedSkills?.length > 0 && (
                      <div>
                        <span className="text-[11px] text-emerald-400 font-semibold block mb-1">
                          ✓ Matched ({matchData.matchedSkills.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {matchData.matchedSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-medium text-[11px] border border-emerald-500/30"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {matchData.missingSkills?.length > 0 && (
                      <div className="pt-2">
                        <span className="text-[11px] text-rose-300 font-semibold block mb-1">
                          ✕ Missing Skills ({matchData.missingSkills.length}):
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {matchData.missingSkills.map((s, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-medium text-[11px] border border-rose-500/30"
                            >
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Explanation text */}
                <div className="pt-2 border-t border-white/10 text-xs text-slate-300 leading-relaxed">
                  <p className="font-semibold text-indigo-200 mb-1">Algorithmic Explanation:</p>
                  <p className="text-[11px] italic">{matchData.explanation}</p>
                </div>
              </div>
            )}

            {/* Company Info Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <h3 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-2">
                About the Organization
              </h3>
              <div>
                <h4 className="font-bold text-slate-800 text-sm">{job.company?.name}</h4>
                <p className="text-xs text-slate-500 mt-1">{job.company?.industry}</p>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                {job.company?.description || 'A verified hiring partner on the SmartHire recruitment network.'}
              </p>
              <div className="space-y-1.5 text-xs text-slate-500 border-t border-slate-100 pt-3">
                <p>
                  <strong>Headquarters:</strong> {job.company?.headquarters || job.company?.location}
                </p>
                <p>
                  <strong>Company Size:</strong> {job.company?.size || '100+'} employees
                </p>
                {job.company?.website && (
                  <p>
                    <strong>Website:</strong>{' '}
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="text-indigo-600 hover:underline"
                    >
                      {job.company.website}
                    </a>
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={`Apply for ${job.title}`}
      >
        <form onSubmit={handleApply} className="space-y-4">
          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-900">
            <p className="font-bold mb-1">Submitting Application</p>
            <p>
              Your SmartHire profile and latest uploaded resume will be transmitted directly to{' '}
              <strong>{job.company?.name}</strong> along with your {matchData?.overallScore || 0}% match analysis.
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
              Cover Note / Introduction (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Highlight relevant projects, your motivation for this role, or explain how your background matches their requirements..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setApplyModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={applying}
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2 disabled:opacity-50"
            >
              {applying ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Submit Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
