import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../api/axiosClient';
import {
  Users,
  Briefcase,
  Sparkles,
  Download,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MessageSquare,
  AlertCircle,
  FileText,
} from 'lucide-react';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Badge } from '../components/Badge';
import { Modal } from '../components/Modal';

export const ApplicantManagementPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [applicants, setApplicants] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedJob, setSelectedJob] = useState(searchParams.get('jobId') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [sortBy, setSortBy] = useState('score_desc');

  // Status update modal
  const [activeApp, setActiveApp] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState('');

  const fetchApplicants = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (selectedJob) params.append('jobId', selectedJob);
      if (statusFilter !== 'all') params.append('status', statusFilter);
      params.append('sortBy', sortBy);

      const [appsRes, jobsRes] = await Promise.all([
        api.get(`/recruiter/applicants?${params.toString()}`),
        api.get('/jobs/recruiter/my'),
      ]);

      if (appsRes.success) setApplicants(appsRes.applications);
      if (jobsRes.success) setJobs(jobsRes.jobs);
    } catch (err) {
      console.warn('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplicants();
  }, [selectedJob, statusFilter, sortBy]);

  const openStatusModal = (app, status) => {
    setActiveApp(app);
    setNewStatus(status);
    setStatusNote('');
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!activeApp || !newStatus) return;

    setUpdating(true);
    try {
      const res = await api.patch(`/applications/${activeApp._id}/status`, {
        status: newStatus,
        note: statusNote,
      });

      if (res.success) {
        setApplicants((prev) =>
          prev.map((a) => (a._id === activeApp._id ? { ...a, status: newStatus } : a))
        );
        setMessage(`Candidate status updated to ${newStatus.replace('_', ' ')}.`);
        setActiveApp(null);
      }
    } catch (err) {
      alert(err || 'Failed to update status.');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold mb-1 border border-indigo-100">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Algorithmic Candidate Ranking</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Applicant Pipeline & Candidate Ranking
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Review received resumes ranked by SmartHire's explainable 5-factor compatibility scores
            </p>
          </div>
        </div>

        {/* Message notification */}
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs font-semibold flex items-center justify-between">
            <span>{message}</span>
            <button onClick={() => setMessage('')} className="font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Filter Controls Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center gap-4 text-xs font-medium">
          {/* Job Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Job:</span>
            <select
              value={selectedJob}
              onChange={(e) => setSelectedJob(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none"
            >
              <option value="">All Job Listings ({jobs.length})</option>
              {jobs.map((j) => (
                <option key={j._id} value={j._id}>
                  {j.title} ({j.applicantsCount} apps)
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none"
            >
              <option value="all">All Statuses</option>
              <option value="applied">Applied</option>
              <option value="under_review">Under Review</option>
              <option value="shortlisted">Shortlisted</option>
              <option value="interviewing">Interviewing</option>
              <option value="hired">Hired</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          {/* Sort By Filter */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="font-bold text-slate-600">Sort By:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-semibold text-slate-800 focus:outline-none"
            >
              <option value="score_desc">Highest Match Score First</option>
              <option value="score_asc">Lowest Match Score First</option>
              <option value="recent">Most Recently Applied</option>
            </select>
          </div>
        </div>

        {/* Applicants List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse h-40" />
            ))}
          </div>
        ) : applicants.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
            <Users className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No applicants match this filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try selecting "All Job Listings" or clearing status filters to view all submissions.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {applicants.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5 hover:shadow-md transition"
              >
                {/* Candidate row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-base border border-indigo-200 shrink-0">
                      {app.candidate?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2.5">
                        <h3 className="text-lg font-bold text-slate-900">{app.candidate?.name}</h3>
                        <Badge
                          variant={
                            app.status === 'shortlisted'
                              ? 'success'
                              : app.status === 'interviewing'
                              ? 'warning'
                              : app.status === 'hired'
                              ? 'success'
                              : app.status === 'rejected'
                              ? 'danger'
                              : 'primary'
                          }
                          size="md"
                        >
                          {app.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {app.candidate?.email} • Applied for <strong className="text-slate-700">{app.job?.title}</strong> on{' '}
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  {/* Match score */}
                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <MatchScoreBadge score={app.matchScore?.overallScore} size="lg" />
                  </div>
                </div>

                {/* Compatibility Metrics Breakdown Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Skill Coverage
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {app.matchScore?.skillCoverage || 0}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Education Match
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {app.matchScore?.educationMatch || 0}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Experience Match
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {app.matchScore?.experienceMatch || 0}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Location Alignment
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {app.matchScore?.locationMatch || 0}%
                    </span>
                  </div>
                </div>

                {/* Skills tags */}
                {app.matchScore?.matchedSkills?.length > 0 && (
                  <div className="space-y-1.5 text-xs">
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                      Verified Matched Skills:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {app.matchScore.matchedSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-800 font-semibold text-xs border border-emerald-200"
                        >
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recruiter Notes or Explanation */}
                {app.matchScore?.explanation && (
                  <div className="text-xs text-slate-500 italic bg-white p-2.5 rounded-xl border border-slate-100">
                    "{app.matchScore.explanation}"
                  </div>
                )}

                {app.coverNote && (
                  <div className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <strong className="text-slate-700">Applicant Cover Note:</strong> {app.coverNote}
                  </div>
                )}

                {/* Recruiter Actions Bar */}
                <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-4">
                  <div>
                    {app.resume && (
                      <a
                        href={`/api/resumes/${app.resume._id || app.resume}/download`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition"
                      >
                        <Download className="w-3.5 h-3.5 text-indigo-600" />
                        <span>Download Resume ({app.resume.fileType?.toUpperCase() || 'PDF'})</span>
                      </a>
                    )}
                  </div>

                  {/* Status buttons */}
                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => openStatusModal(app, 'shortlisted')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs border border-emerald-200 transition"
                    >
                      Shortlist
                    </button>
                    <button
                      onClick={() => openStatusModal(app, 'interviewing')}
                      className="px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 font-bold text-xs border border-amber-200 transition"
                    >
                      Invite for Interview
                    </button>
                    <button
                      onClick={() => openStatusModal(app, 'hired')}
                      className="px-3 py-1.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs border border-indigo-200 transition"
                    >
                      Mark Hired
                    </button>
                    <button
                      onClick={() => openStatusModal(app, 'rejected')}
                      className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs border border-rose-200 transition"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Status Modal */}
      <Modal
        isOpen={!!activeApp}
        onClose={() => setActiveApp(null)}
        title={`Update Status: ${activeApp?.candidate?.name}`}
      >
        <form onSubmit={handleUpdateStatus} className="space-y-4">
          <p className="text-xs text-slate-600">
            Updating status to{' '}
            <strong className="text-indigo-600 uppercase">{newStatus.replace('_', ' ')}</strong> for{' '}
            {activeApp?.job?.title}. The candidate will receive an immediate notification in their portal.
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Feedback / Note to Candidate (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="e.g. Congratulations! We would like to invite you for a 45-minute technical discussion..."
              value={statusNote}
              onChange={(e) => setStatusNote(e.target.value)}
              className="w-full p-3 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setActiveApp(null)}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={updating}
              className="px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md transition disabled:opacity-50"
            >
              {updating ? 'Updating...' : 'Confirm Status Update'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
