import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import {
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowRight,
  Sparkles,
  MessageSquare,
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { MatchScoreBadge } from '../components/MatchScoreBadge';

const STATUS_STEPS = ['applied', 'under_review', 'shortlisted', 'interviewing', 'hired'];

export const ApplicationsPage = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApplications = async () => {
      try {
        setLoading(true);
        const res = await api.get('/applications/me');
        if (res.success) {
          setApplications(res.applications);
        }
      } catch (err) {
        console.warn('Failed to load applications:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchApplications();
  }, []);

  const getStatusVariant = (status) => {
    switch (status) {
      case 'shortlisted':
        return 'success';
      case 'interviewing':
        return 'warning';
      case 'hired':
        return 'success';
      case 'rejected':
        return 'danger';
      case 'under_review':
        return 'info';
      default:
        return 'primary';
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Application Tracker
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Real-time recruitment pipeline tracking for your submitted job applications
            </p>
          </div>
          <Link
            to="/jobs"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-600/20 transition self-start sm:self-auto"
          >
            Find More Jobs
          </Link>
        </div>

        {/* Applications List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 animate-pulse h-48" />
            ))}
          </div>
        ) : applications.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
            <Briefcase className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">You haven't submitted any applications yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Browse vacancies or check out your personalized recommendations to start applying.
            </p>
            <Link
              to="/candidate/recommendations"
              className="inline-block px-5 py-2.5 bg-indigo-600 text-white font-bold text-xs rounded-xl shadow-md transition"
            >
              Explore AI Recommendations
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {applications.map((app) => (
              <div
                key={app._id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6 hover:shadow-md transition"
              >
                {/* Top Card Bar */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0">
                      {app.job?.company?.logo ? (
                        <img
                          src={app.job.company.logo}
                          alt={app.job.company.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/jobs/${app.job?._id}`}
                          className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition"
                        >
                          {app.job?.title}
                        </Link>
                        <Badge variant={getStatusVariant(app.status)} size="md">
                          {app.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {app.job?.company?.name} • {app.job?.location} • Applied on{' '}
                        {new Date(app.appliedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-start sm:self-auto">
                    {app.matchScore?.overallScore && (
                      <MatchScoreBadge score={app.matchScore.overallScore} size="md" />
                    )}
                  </div>
                </div>

                {/* Status Timeline Progression */}
                {app.status !== 'rejected' ? (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Recruitment Pipeline Progress
                    </span>
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {[
                        { key: 'applied', label: '1. Applied' },
                        { key: 'under_review', label: '2. Review' },
                        { key: 'shortlisted', label: '3. Shortlisted' },
                        { key: 'interviewing', label: '4. Interview' },
                      ].map((step, idx) => {
                        const stepIndex = STATUS_STEPS.indexOf(step.key);
                        const currentStatusIndex = STATUS_STEPS.indexOf(app.status);
                        const isCompleted = currentStatusIndex >= stepIndex;
                        const isCurrent = app.status === step.key;

                        return (
                          <div
                            key={step.key}
                            className={`p-2 rounded-xl text-xs font-bold transition ${
                              isCurrent
                                ? 'bg-indigo-600 text-white shadow-sm'
                                : isCompleted
                                ? 'bg-indigo-100 text-indigo-800'
                                : 'bg-slate-200/60 text-slate-400'
                            }`}
                          >
                            <span>{step.label}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>
                      Application status: <strong>Not Selected</strong>. You may continue exploring other open positions that match your skillset.
                    </span>
                  </div>
                )}

                {/* Recruiter Feedback / Notes */}
                {app.recruiterNotes && (
                  <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 space-y-1">
                    <div className="flex items-center gap-1.5 font-bold">
                      <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                      <span>Note from Hiring Team:</span>
                    </div>
                    <p className="italic">"{app.recruiterNotes}"</p>
                  </div>
                )}

                {/* Cover note submitted */}
                {app.coverNote && (
                  <div className="text-xs text-slate-500 border-t border-slate-100 pt-3">
                    <strong className="text-slate-700">Your Submitted Note:</strong> {app.coverNote}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
