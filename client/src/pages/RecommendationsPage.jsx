import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosClient';
import {
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  Building2,
  MapPin,
  ArrowRight,
  Info,
  Layers,
  AlertTriangle,
} from 'lucide-react';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Badge } from '../components/Badge';

export const RecommendationsPage = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [weights, setWeights] = useState({});
  const [loading, setLoading] = useState(true);
  const [minScore, setMinScore] = useState(40);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/recommendations/jobs?minScore=${minScore}&limit=30`);
      if (res.success) {
        setRecommendations(res.recommendations);
        setWeights(res.weightsUsed || {});
      }
    } catch (err) {
      console.warn('Failed to load recommendations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendations();
  }, [minScore]);

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-bold border border-indigo-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Explainable Rule-Based Recommendation Engine</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Personalized Job Recommendations & Skill-Gap Analysis
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
                Every percentage score below is computed dynamically using our transparent 5-factor weighted algorithm based on your profile and verified resume data.
              </p>
            </div>
          </div>

          {/* Configurable Weights Breakdown */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 border-t border-white/10 text-xs">
            <div className="bg-white/5 rounded-xl p-2.5 text-center">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Technical Skills</span>
              <span className="text-indigo-300 font-extrabold text-base">50% Weight</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Education Level</span>
              <span className="text-indigo-300 font-extrabold text-base">15% Weight</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Experience Years</span>
              <span className="text-indigo-300 font-extrabold text-base">15% Weight</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Job Preferences</span>
              <span className="text-indigo-300 font-extrabold text-base">10% Weight</span>
            </div>
            <div className="bg-white/5 rounded-xl p-2.5 text-center col-span-2 sm:col-span-1">
              <span className="text-slate-400 block text-[10px] font-bold uppercase">Location Match</span>
              <span className="text-indigo-300 font-extrabold text-base">10% Weight</span>
            </div>
          </div>
        </div>

        {/* Filter Slider Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-indigo-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-900">Minimum Compatibility Threshold</h3>
              <p className="text-xs text-slate-500">Only display jobs matching at least this threshold</p>
            </div>
          </div>

          <div className="flex items-center gap-4 w-full sm:w-72">
            <input
              type="range"
              min="0"
              max="90"
              step="5"
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
            />
            <span className="px-3 py-1 bg-indigo-50 text-indigo-700 font-bold rounded-lg text-xs border border-indigo-200 shrink-0">
              ≥ {minScore}%
            </span>
          </div>
        </div>

        {/* Recommendations List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse h-48" />
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
            <Sparkles className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">No jobs met the {minScore}% match threshold</h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Try sliding the minimum threshold lower, or update your profile skills and resume to increase compatibility.
            </p>
            <button
              onClick={() => setMinScore(0)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold hover:bg-indigo-700 transition"
            >
              Show All Matches (≥ 0%)
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {recommendations.map(({ job, match, isApplied, applicationStatus }) => (
              <div
                key={job._id}
                className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm hover:shadow-md transition space-y-5"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                      {job.company?.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-7 h-7 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="text-xl font-bold text-slate-900 hover:text-indigo-600 transition"
                        >
                          {job.title}
                        </Link>
                        <Badge variant={job.jobType === 'internship' ? 'warning' : 'primary'}>
                          {job.jobType}
                        </Badge>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-1">
                        {job.company?.name} • {job.location} ({job.isRemote ? 'Remote' : 'On-site'})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-start sm:self-auto">
                    <MatchScoreBadge score={match.overallScore} size="lg" />
                    {isApplied ? (
                      <Badge variant="success" size="lg">
                        Applied ({applicationStatus})
                      </Badge>
                    ) : (
                      <Link
                        to={`/jobs/${job._id}`}
                        className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-md shadow-indigo-600/20 transition flex items-center gap-1.5"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Score Breakdown Metrics Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Skill Coverage
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {match.skillCoverage}% ({match.matchedSkills?.length}/{match.matchedSkills?.length + match.missingSkills?.length} skills)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Education Match
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {match.educationMatch}% (Requires {job.minEducation})
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Experience Match
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {match.experienceMatch}% (Requires {job.minExperienceYears} yrs)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[10px] font-bold uppercase">
                      Location Alignment
                    </span>
                    <span className="font-extrabold text-slate-800 text-sm">
                      {match.locationMatch}% ({job.isRemote ? 'Remote' : job.location})
                    </span>
                  </div>
                </div>

                {/* Skills Gap Analysis Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  {/* Matched Skills */}
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-800">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Your Matched Skills ({match.matchedSkills?.length || 0})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {match.matchedSkills?.length > 0 ? (
                        match.matchedSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200"
                          >
                            ✓ {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400 italic">No direct required skills matched.</span>
                      )}
                    </div>
                  </div>

                  {/* Missing Skills (Skill Gap) */}
                  <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-rose-800">
                      <AlertTriangle className="w-4 h-4 text-rose-600" />
                      <span>Identified Skill Gaps ({match.missingSkills?.length || 0})</span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {match.missingSkills?.length > 0 ? (
                        match.missingSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2.5 py-1 rounded-lg bg-rose-100 text-rose-800 font-semibold text-xs border border-rose-200"
                          >
                            ✕ {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-emerald-700 font-semibold">
                          🎉 Zero skill gaps! You meet 100% of required technical skills.
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Natural Language Explanation */}
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs text-slate-600 flex items-start gap-2">
                  <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
                  <p>
                    <strong className="text-slate-800">System Explanation:</strong> {match.explanation}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
