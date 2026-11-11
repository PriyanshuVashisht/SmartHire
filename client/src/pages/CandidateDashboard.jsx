import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import {
  Briefcase,
  Sparkles,
  FileText,
  UserCheck,
  Clock,
  ArrowRight,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Calendar,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Badge } from '../components/Badge';

export const CandidateDashboard = () => {
  const { user, profile } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const [recRes, appRes] = await Promise.all([
          api.get('/recommendations/jobs?limit=4'),
          api.get('/applications/me'),
        ]);

        if (recRes.success) setRecommendations(recRes.recommendations);
        if (appRes.success) setApplications(appRes.applications);
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Compute profile completeness
  const calculateCompleteness = () => {
    let score = 20; // user exists
    if (profile?.headline) score += 15;
    if (profile?.skills?.length > 0) score += 25;
    if (profile?.education?.length > 0) score += 15;
    if (profile?.experience?.length > 0) score += 15;
    if (profile?.resume) score += 10;
    return Math.min(100, score);
  };

  const completeness = calculateCompleteness();
  const shortlistedCount = applications.filter((a) => a.status === 'shortlisted').length;
  const interviewingCount = applications.filter((a) => a.status === 'interviewing').length;
  const bestMatch = recommendations.length > 0 ? recommendations[0].match.overallScore : 0;

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Banner */}
        <div className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
          <div className="relative z-10 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300">
              Candidate Workspace
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Welcome back, {user?.name}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-indigo-100 max-w-xl">
              {profile?.headline || 'Complete your profile to boost your personalized job match accuracy.'}
            </p>
          </div>

          {/* Profile Completeness Ring */}
          <div className="relative z-10 flex items-center gap-4 bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
            <div className="w-14 h-14 rounded-full bg-indigo-600 border-4 border-indigo-400 flex items-center justify-center font-black text-sm">
              {completeness}%
            </div>
            <div className="text-xs space-y-1">
              <p className="font-bold text-white">Profile Completeness</p>
              <p className="text-indigo-200">
                {completeness === 100
                  ? 'All details optimized!'
                  : 'Add skills & resume to hit 100%'}
              </p>
              {completeness < 100 && (
                <Link
                  to="/candidate/profile"
                  className="font-bold text-white underline hover:text-indigo-200"
                >
                  Complete profile →
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Applications"
            value={applications.length}
            icon={Briefcase}
            color="indigo"
          />
          <StatCard
            title="Shortlisted"
            value={shortlistedCount}
            icon={CheckCircle2}
            color="emerald"
          />
          <StatCard
            title="Interview Rounds"
            value={interviewingCount}
            icon={Calendar}
            color="amber"
          />
          <StatCard
            title="Top Match Score"
            value={`${bestMatch}%`}
            icon={Sparkles}
            color="sky"
          />
        </div>

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Top Job Recommendations (2 cols) */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-600" />
                  <span>Personalized Job Recommendations</span>
                </h2>
                <p className="text-xs text-slate-500">
                  Ranked by our 5-factor weighted algorithm based on your skills & profile
                </p>
              </div>
              <Link
                to="/candidate/recommendations"
                className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
              >
                <span>View all</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-40" />
            ) : recommendations.length === 0 ? (
              <div className="bg-white p-8 text-center rounded-2xl border border-slate-200 space-y-2">
                <Sparkles className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-sm font-bold text-slate-700">No recommendations found yet</p>
                <p className="text-xs text-slate-500">
                  Upload your resume or add skills in your profile to start receiving AI-matched jobs.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {recommendations.map(({ job, match, isApplied, applicationStatus }) => (
                  <div
                    key={job._id}
                    className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2.5">
                        <h3 className="font-bold text-slate-900 text-base">{job.title}</h3>
                        <MatchScoreBadge score={match.overallScore} size="sm" />
                      </div>
                      <p className="text-xs font-semibold text-slate-500">
                        {job.company?.name} • {job.location} • {job.jobType}
                      </p>
                      <p className="text-[11px] text-slate-600 italic">
                        "{match.explanation}"
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isApplied ? (
                        <Badge variant="success">Applied ({applicationStatus})</Badge>
                      ) : (
                        <Link
                          to={`/jobs/${job._id}`}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs rounded-xl transition"
                        >
                          View & Apply
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Actions & Recent Applications (1 col) */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Quick Profile Actions</h3>
              <div className="space-y-2">
                <Link
                  to="/candidate/resume"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition border border-slate-100 text-xs font-semibold text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>Upload / Parse Resume</span>
                  </span>
                  <span>→</span>
                </Link>
                <Link
                  to="/candidate/profile"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition border border-slate-100 text-xs font-semibold text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-600" />
                    <span>Update Skills & Education</span>
                  </span>
                  <span>→</span>
                </Link>
                <Link
                  to="/candidate/recommendations"
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-indigo-50 hover:text-indigo-700 transition border border-slate-100 text-xs font-semibold text-slate-700"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Skill-Gap Analysis</span>
                  </span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            {/* Recent Applications Sidebar */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900">Recent Applications</h3>
                <Link
                  to="/candidate/applications"
                  className="text-xs font-bold text-indigo-600 hover:underline"
                >
                  View all
                </Link>
              </div>

              {applications.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-4">No applications submitted yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.slice(0, 3).map((app) => (
                    <div key={app._id} className="text-xs space-y-1">
                      <p className="font-bold text-slate-800 line-clamp-1">{app.job?.title}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">{app.job?.company?.name}</span>
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
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
