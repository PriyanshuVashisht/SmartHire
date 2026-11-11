import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import {
  Briefcase,
  PlusCircle,
  Users,
  Eye,
  Calendar,
  MoreVertical,
  CheckCircle2,
  XCircle,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../components/Badge';

export const RecruiterJobsPage = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const res = await api.get('/jobs/recruiter/my');
      if (res.success) {
        setJobs(res.jobs);
      }
    } catch (err) {
      console.warn('Failed to load recruiter jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const handleToggleStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'closed' : 'active';
    try {
      const res = await api.put(`/jobs/${jobId}`, { status: newStatus });
      if (res.success) {
        setJobs((prev) =>
          prev.map((j) => (j._id === jobId ? { ...j, status: newStatus } : j))
        );
      }
    } catch (err) {
      console.error('Failed to toggle job status:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Manage Job Listings
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Track applicant inflow, review metrics, and control visibility of your postings
            </p>
          </div>
          <Link
            to="/recruiter/jobs/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/20 transition flex items-center gap-2 self-start sm:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Posting</span>
          </Link>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse h-32" />
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No job openings posted yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Post your first job or internship vacancy to start receiving algorithmic candidate matches.
            </p>
            <Link
              to="/recruiter/jobs/new"
              className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Post a Position
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <h3 className="text-lg font-bold text-slate-900">{job.title}</h3>
                    <Badge variant={job.status === 'active' ? 'success' : 'danger'}>
                      {job.status.toUpperCase()}
                    </Badge>
                    <Badge variant="primary">{job.jobType}</Badge>
                    <Badge variant="neutral">{job.experienceLevel} level</Badge>
                  </div>

                  <p className="text-xs text-slate-500 font-semibold">
                    {job.department} • {job.location} ({job.isRemote ? 'Remote' : 'On-site'}) • Posted on{' '}
                    {new Date(job.createdAt).toLocaleDateString()}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {(job.requiredSkills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px] font-medium"
                      >
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Metrics & Actions */}
                <div className="flex flex-wrap items-center gap-6 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                  <div className="flex items-center gap-4 text-xs text-slate-600">
                    <span className="flex items-center gap-1 font-bold">
                      <Users className="w-4 h-4 text-indigo-600" />
                      <span>{job.applicantsCount || 0} Applicants</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <span>{job.viewsCount || 0} Views</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/recruiter/applicants?jobId=${job._id}`}
                      className="px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition flex items-center gap-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>View Applicants ({job.applicantsCount || 0})</span>
                    </Link>

                    <button
                      onClick={() => handleToggleStatus(job._id, job.status)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold transition ${
                        job.status === 'active'
                          ? 'border border-rose-200 text-rose-600 hover:bg-rose-50'
                          : 'border border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {job.status === 'active' ? 'Close' : 'Reopen'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
