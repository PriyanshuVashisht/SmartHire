import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import {
  Search,
  Filter,
  Briefcase,
  MapPin,
  Building2,
  DollarSign,
  Sparkles,
  ArrowRight,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Badge } from '../components/Badge';
import { MatchScoreBadge } from '../components/MatchScoreBadge';

export const JobsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { isCandidate } = useAuth();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalJobs, setTotalJobs] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Filters state
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [jobType, setJobType] = useState(searchParams.get('jobType') || 'all');
  const [experienceLevel, setExperienceLevel] = useState(searchParams.get('experienceLevel') || 'all');
  const [remoteOnly, setRemoteOnly] = useState(searchParams.get('remoteOnly') === 'true');
  const [page, setPage] = useState(Number(searchParams.get('page')) || 1);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (jobType !== 'all') params.append('jobType', jobType);
      if (experienceLevel !== 'all') params.append('experienceLevel', experienceLevel);
      if (remoteOnly) params.append('remoteOnly', 'true');
      params.append('page', page);
      params.append('limit', 10);

      const res = await api.get(`/jobs?${params.toString()}`);
      if (res.success) {
        setJobs(res.jobs);
        setTotalJobs(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.warn('Failed to load jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [searchParams, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    const newParams = new URLSearchParams();
    if (search) newParams.set('search', search);
    if (jobType !== 'all') newParams.set('jobType', jobType);
    if (experienceLevel !== 'all') newParams.set('experienceLevel', experienceLevel);
    if (remoteOnly) newParams.set('remoteOnly', 'true');
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const clearFilters = () => {
    setSearch('');
    setJobType('all');
    setExperienceLevel('all');
    setRemoteOnly(false);
    setPage(1);
    setSearchParams({});
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Explore Jobs & Internships
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Browse through verified vacancies and find your perfect role
            </p>
          </div>
          {isCandidate && (
            <Link
              to="/candidate/recommendations"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white px-4 py-2.5 rounded-xl font-semibold text-xs shadow-md shadow-indigo-600/20 transition self-start md:self-auto"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              <span>Switch to AI Match View</span>
            </Link>
          )}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by title, department, or required skill (e.g. React, Node.js)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-2.5 rounded-xl text-sm transition shrink-0"
            >
              Search
            </button>
          </form>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
            <div className="flex items-center gap-1.5 font-bold text-slate-600">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Filters:</span>
            </div>

            {/* Job Type Dropdown */}
            <select
              value={jobType}
              onChange={(e) => {
                setJobType(e.target.value);
                setPage(1);
                const p = new URLSearchParams(searchParams);
                if (e.target.value === 'all') p.delete('jobType');
                else p.set('jobType', e.target.value);
                setSearchParams(p);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">All Job Types</option>
              <option value="full-time">Full-time</option>
              <option value="internship">Internship</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
            </select>

            {/* Experience Level Dropdown */}
            <select
              value={experienceLevel}
              onChange={(e) => {
                setExperienceLevel(e.target.value);
                setPage(1);
                const p = new URLSearchParams(searchParams);
                if (e.target.value === 'all') p.delete('experienceLevel');
                else p.set('experienceLevel', e.target.value);
                setSearchParams(p);
              }}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-slate-700 font-medium focus:outline-none"
            >
              <option value="all">All Experience Levels</option>
              <option value="intern">Intern</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
            </select>

            {/* Remote Only Toggle */}
            <label className="flex items-center gap-2 cursor-pointer font-medium text-slate-700 select-none">
              <input
                type="checkbox"
                checked={remoteOnly}
                onChange={(e) => {
                  setRemoteOnly(e.target.checked);
                  setPage(1);
                  const p = new URLSearchParams(searchParams);
                  if (!e.target.checked) p.delete('remoteOnly');
                  else p.set('remoteOnly', 'true');
                  setSearchParams(p);
                }}
                className="w-4 h-4 text-indigo-600 rounded border-slate-300 focus:ring-indigo-500"
              />
              <span>Remote Only</span>
            </label>

            {(search || jobType !== 'all' || experienceLevel !== 'all' || remoteOnly) && (
              <button
                type="button"
                onClick={clearFilters}
                className="ml-auto text-xs text-rose-600 hover:text-rose-800 font-bold flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Reset Filters</span>
              </button>
            )}
          </div>
        </div>

        {/* Results Count */}
        <div className="flex items-center justify-between text-xs text-slate-500 font-medium">
          <p>
            Showing <span className="font-bold text-slate-800">{jobs.length}</span> of{' '}
            <span className="font-bold text-slate-800">{totalJobs}</span> open positions
          </p>
        </div>

        {/* Jobs List */}
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 animate-pulse space-y-3">
                <div className="h-5 bg-slate-200 rounded w-1/3"></div>
                <div className="h-4 bg-slate-100 rounded w-1/4"></div>
                <div className="h-12 bg-slate-50 rounded"></div>
              </div>
            ))}
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-4">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No jobs match your criteria</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Try adjusting your search terms, removing filters, or resetting your filter preferences.
            </p>
            <button
              onClick={clearFilters}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-700 transition"
            >
              Clear All Filters
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row md:items-center justify-between gap-6"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 p-2 flex items-center justify-center shrink-0 overflow-hidden">
                      {job.company?.logo ? (
                        <img
                          src={job.company.logo}
                          alt={job.company.name}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <Building2 className="w-6 h-6 text-slate-400" />
                      )}
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          to={`/jobs/${job._id}`}
                          className="text-lg font-bold text-slate-900 hover:text-indigo-600 transition"
                        >
                          {job.title}
                        </Link>
                        <Badge variant={job.jobType === 'internship' ? 'warning' : 'primary'}>
                          {job.jobType}
                        </Badge>
                        <Badge variant="neutral">{job.experienceLevel} level</Badge>
                      </div>
                      <p className="text-xs font-semibold text-slate-500 mt-0.5">
                        {job.company?.name || 'Verified Recruiter'} • {job.department}
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">
                    {job.description}
                  </p>

                  {/* Skills tags */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mr-1">
                      Required:
                    </span>
                    {(job.requiredSkills || []).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50/70 text-indigo-700 border border-indigo-100"
                      >
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Right metadata & action */}
                <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 pt-4 md:pt-0 border-slate-100 gap-3 shrink-0">
                  <div className="text-left md:text-right">
                    {job.salary?.isDisclosed && job.salary.min > 0 && (
                      <p className="text-base font-extrabold text-slate-900">
                        ₹{(job.salary.min / 100000).toFixed(1)}L - ₹{(job.salary.max / 100000).toFixed(1)}L
                      </p>
                    )}
                    <p className="text-xs text-slate-500 flex items-center md:justify-end gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{job.isRemote ? 'Remote' : job.location}</span>
                    </p>
                  </div>

                  <Link
                    to={`/jobs/${job._id}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 transition shadow-sm"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-6">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-xs font-bold text-slate-700">
              Page {page} of {totalPages}
            </span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-600 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
