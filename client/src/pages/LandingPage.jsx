import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axiosClient';
import {
  Briefcase,
  Sparkles,
  TrendingUp,
  FileCheck2,
  Users,
  Search,
  ArrowRight,
  CheckCircle2,
  Building2,
  MapPin,
  Clock,
  ShieldCheck,
  Award,
} from 'lucide-react';
import { MatchScoreBadge } from '../components/MatchScoreBadge';
import { Badge } from '../components/Badge';

export const LandingPage = () => {
  const { isAuthenticated, isCandidate, isRecruiter, isAdmin } = useAuth();
  const [featuredJobs, setFeaturedJobs] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const res = await api.get('/jobs?limit=4');
        if (res.success) {
          setFeaturedJobs(res.jobs);
        }
      } catch (err) {
        console.warn('Failed to load featured jobs:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchFeatured();
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/jobs');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-indigo-900 via-indigo-950 to-slate-900 text-white pt-20 pb-24 px-4 sm:px-6 lg:px-8">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 right-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-5xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-xs font-semibold text-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Explainable Weighted Matching Algorithm (Skills 50%, Edu 15%, Exp 15%)</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight">
            Connecting Top Talent with Opportunities Through{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-purple-400">
              Intelligent Matching
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Upload your resume, automatically extract skills, and receive transparent, explainable job and internship recommendations tailored to your background.
          </p>

          {/* Search Bar Form */}
          <form
            onSubmit={handleSearch}
            className="max-w-3xl mx-auto bg-white p-2 rounded-2xl shadow-2xl flex flex-col sm:flex-row gap-2 border border-slate-200"
          >
            <div className="flex-1 flex items-center px-4 py-2 gap-3 text-slate-700">
              <Search className="w-5 h-5 text-indigo-600 shrink-0" />
              <input
                type="text"
                placeholder="Job title, technical skills (e.g. React, Node.js), or keywords..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent focus:outline-none text-sm text-slate-900 placeholder:text-slate-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-6 py-3 rounded-xl transition flex items-center justify-center gap-2 shadow-md shadow-indigo-600/30 shrink-0"
            >
              <span>Find Matches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick CTA links */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-400">
            <span>Popular searches:</span>
            {['React Developer', 'Full Stack MERN', 'AI/ML Intern', 'Python', 'Cloud DevOps'].map(
              (tag) => (
                <button
                  key={tag}
                  onClick={() => navigate(`/jobs?search=${encodeURIComponent(tag)}`)}
                  className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white transition"
                >
                  {tag}
                </button>
              )
            )}
          </div>
        </div>
      </section>

      {/* Value Pillars */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
            Why SmartHire Outperforms Generic Job Boards
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Engineered with Transparency & Precision
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Explainable Recommendation Engine</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              No black-box mystery. SmartHire computes a weighted 0–100 match score based on skills (50%), education (15%), experience (15%), preferences (10%), and location (10%).
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <FileCheck2 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Automated Resume Parsing</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Upload your PDF/DOCX resume and extract verified skills against our controlled skill taxonomy of 200+ technologies. Seamlessly review and edit extracted tags.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition">
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Skill-Gap Identification</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Immediately view which required job skills you have mastered and which skills you are missing, empowering targeted career development before applying.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Jobs Section */}
      <section className="bg-slate-100 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Featured Job Openings</h2>
              <p className="text-sm text-slate-500">Explore hand-picked positions from top organizations</p>
            </div>
            <Link
              to="/jobs"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-600 hover:text-indigo-800"
            >
              <span>View all available listings</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featuredJobs.map((job) => (
              <div
                key={job._id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center p-1.5 shrink-0 overflow-hidden">
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
                        <h3 className="font-bold text-slate-900 text-lg leading-snug line-clamp-1">
                          {job.title}
                        </h3>
                        <p className="text-xs font-medium text-slate-500">
                          {job.company?.name || 'Verified Employer'} • {job.department}
                        </p>
                      </div>
                    </div>
                    <Badge variant={job.jobType === 'internship' ? 'warning' : 'primary'}>
                      {job.jobType}
                    </Badge>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2 mb-4">
                    {job.description}
                  </p>

                  {/* Skills badges */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {(job.requiredSkills || []).slice(0, 4).map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-700"
                      >
                        {typeof skill === 'string' ? skill : skill.name}
                      </span>
                    ))}
                    {(job.requiredSkills || []).length > 4 && (
                      <span className="text-[11px] font-medium px-1.5 py-0.5 text-slate-400">
                        +{(job.requiredSkills || []).length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                <div className="border-t border-slate-100 pt-4 flex items-center justify-between text-xs text-slate-500">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {job.isRemote ? 'Remote' : job.location}
                    </span>
                    {job.salary?.isDisclosed && job.salary.min > 0 && (
                      <span className="font-semibold text-slate-900">
                        ₹{(job.salary.min / 100000).toFixed(1)}L - ₹{(job.salary.max / 100000).toFixed(1)}L
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/jobs/${job._id}`}
                    className="font-semibold text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                  >
                    Details <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Steps Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-widest text-indigo-600 mb-2">
            The SmartHire End-to-End Workflow
          </h2>
          <p className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            How Candidates & Recruiters Connect
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[
            {
              step: '01',
              title: 'Create & Complete Profile',
              desc: 'Sign up, specify target roles, locations, education, and upload your resume for automatic parsing.',
            },
            {
              step: '02',
              title: 'Evaluate Match Score',
              desc: 'Our engine computes your compatibility % against active jobs, pinpointing matched and missing skills.',
            },
            {
              step: '03',
              title: 'One-Click Application',
              desc: 'Apply securely with custom cover notes. Application deduplication ensures fair submission integrity.',
            },
            {
              step: '04',
              title: 'Recruiter Review & Status',
              desc: 'Recruiters view ranked candidates by match %, shortlist or schedule interviews, and update your status in real time.',
            },
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white p-6 rounded-2xl border border-slate-200 relative overflow-hidden"
            >
              <span className="text-5xl font-black text-slate-100 absolute -top-2 right-2 pointer-events-none">
                {item.step}
              </span>
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-sm mb-4">
                {item.step}
              </div>
              <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
              <p className="text-xs text-slate-600 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Banner */}
      <section className="bg-gradient-to-r from-indigo-600 to-indigo-800 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h2 className="text-3xl sm:text-4xl font-extrabold">
            Ready to find your next career opportunity?
          </h2>
          <p className="text-base text-indigo-100 max-w-2xl mx-auto">
            Join thousands of ambitious students and professionals using SmartHire to discover personalized job recommendations with complete algorithmic transparency.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <Link
              to="/register"
              className="bg-white text-indigo-700 font-bold px-6 py-3 rounded-xl hover:bg-indigo-50 shadow-lg transition"
            >
              Create Free Account
            </Link>
            <Link
              to="/login"
              className="bg-indigo-700/60 text-white border border-white/20 font-semibold px-6 py-3 rounded-xl hover:bg-indigo-700 transition"
            >
              Test with Demo Account
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};
