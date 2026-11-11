import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import {
  Briefcase,
  Users,
  CheckCircle2,
  Calendar,
  Sparkles,
  PlusCircle,
  ArrowRight,
  Building2,
  Filter,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Badge } from '../components/Badge';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

export const RecruiterDashboard = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecruiterData = async () => {
      try {
        setLoading(true);
        const [statsRes, appsRes] = await Promise.all([
          api.get('/recruiter/stats'),
          api.get('/recruiter/applicants?sortBy=score_desc'),
        ]);

        if (statsRes.success) setStats(statsRes.stats);
        if (appsRes.success) setApplicants(appsRes.applications);
      } catch (err) {
        console.warn('Failed to load recruiter data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecruiterData();
  }, []);

  const chartData = [
    { name: 'Total', count: stats?.totalApplicants || 0, fill: '#6366f1' },
    { name: 'Shortlisted', count: stats?.shortlistedCount || 0, fill: '#10b981' },
    { name: 'Interviewing', count: stats?.interviewingCount || 0, fill: '#f59e0b' },
    { name: 'Hired', count: stats?.hiredCount || 0, fill: '#06b6d4' },
    { name: 'Rejected', count: stats?.rejectedCount || 0, fill: '#f43f5e' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Bar */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Employer Talent Portal
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Recruiter Hub — {profile?.company?.name || 'Your Company'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Welcome, {user?.name} ({profile?.designation || 'Hiring Lead'}). Manage job openings and evaluate AI-ranked candidates.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link
              to="/recruiter/jobs/new"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Post New Position</span>
            </Link>
            <Link
              to="/recruiter/company"
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 font-semibold px-4 py-2.5 rounded-xl text-xs transition"
            >
              Company Profile
            </Link>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Active Job Postings"
            value={stats?.activeJobs || 0}
            icon={Briefcase}
            color="indigo"
          />
          <StatCard
            title="Total Applicants"
            value={stats?.totalApplicants || 0}
            icon={Users}
            color="sky"
          />
          <StatCard
            title="Shortlisted Candidates"
            value={stats?.shortlistedCount || 0}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Avg. Applicant Match"
            value={`${stats?.avgScore || 0}%`}
            icon={Sparkles}
            color="amber"
          />
        </div>

        {/* Two Column Layout: Chart & Top Applicants */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recruitment Funnel Chart (1 col) */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">Application Pipeline Metrics</h2>
              <p className="text-xs text-slate-500">Applicant status distribution</p>
            </div>

            <div className="h-64 w-full pt-4">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Ranked Applicants (2 cols) */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  <span>Highest Match Score Applicants</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Ranked by SmartHire's explainable 5-factor compatibility algorithm
                </p>
              </div>
              <Link
                to="/recruiter/applicants"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View all applicants</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : applicants.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <Users className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No applicants yet</p>
                <p className="text-xs text-slate-400">
                  Applicants will appear here ranked automatically as candidates apply.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {applicants.slice(0, 5).map((app) => (
                  <div
                    key={app._id}
                    className="p-4 rounded-2xl border border-slate-100 bg-slate-50/70 hover:bg-slate-100/70 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-sm border border-indigo-200 shrink-0">
                        {app.candidate?.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-slate-900">{app.candidate?.name}</h4>
                        <p className="text-xs text-slate-500">
                          Applied for: <strong className="text-slate-700">{app.job?.title}</strong> •{' '}
                          {new Date(app.appliedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <MatchScoreBadge score={app.matchScore?.overallScore} size="sm" />
                      <Badge
                        variant={
                          app.status === 'shortlisted'
                            ? 'success'
                            : app.status === 'interviewing'
                            ? 'warning'
                            : app.status === 'rejected'
                            ? 'danger'
                            : 'primary'
                        }
                        size="xs"
                      >
                        {app.status.replace('_', ' ')}
                      </Badge>
                      <Link
                        to={`/recruiter/applicants?jobId=${app.job?._id}`}
                        className="text-xs font-bold text-indigo-600 hover:underline"
                      >
                        Manage →
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
