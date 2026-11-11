import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Sparkles, Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="font-bold text-lg text-slate-900">
                Smart<span className="text-indigo-600">Hire</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Intelligent job and internship recommendation platform powered by rule-based explainable matching algorithms and automated resume parsing.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span>Weighted 5-Factor Evaluation Model</span>
            </div>
          </div>

          {/* Candidates */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              For Candidates
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/jobs" className="hover:text-indigo-600 transition">
                  Browse Jobs & Internships
                </Link>
              </li>
              <li>
                <Link to="/candidate/recommendations" className="hover:text-indigo-600 transition">
                  Explainable Job Recommendations
                </Link>
              </li>
              <li>
                <Link to="/candidate/resume" className="hover:text-indigo-600 transition">
                  Resume Parser & Skills Analyzer
                </Link>
              </li>
              <li>
                <Link to="/candidate/applications" className="hover:text-indigo-600 transition">
                  Track Applied Jobs
                </Link>
              </li>
            </ul>
          </div>

          {/* Recruiters */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              For Recruiters
            </h4>
            <ul className="space-y-2 text-sm text-slate-600">
              <li>
                <Link to="/recruiter/jobs/new" className="hover:text-indigo-600 transition">
                  Post Job Opening
                </Link>
              </li>
              <li>
                <Link to="/recruiter/applicants" className="hover:text-indigo-600 transition">
                  Algorithmic Candidate Ranking
                </Link>
              </li>
              <li>
                <Link to="/recruiter/dashboard" className="hover:text-indigo-600 transition">
                  Recruitment Metrics & Pipeline
                </Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-indigo-600 transition">
                  Register Company
                </Link>
              </li>
            </ul>
          </div>

          {/* Project Details */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 mb-3">
              Project & System
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed mb-3">
              B.Tech IT Minor Project. Full MERN Stack with MongoDB, Express, React, Node.js, and Tailwind CSS.
            </p>
            <div className="flex flex-col gap-1 text-xs text-slate-500">
              <span>Status: Production Ready v1.0</span>
              <span>Explainable Rule-Based Algorithm</span>
              <span>Secure Role-Based Authentication</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-100 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-600">
          <p>© {new Date().getFullYear()} SmartHire Platform. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-2 sm:mt-0">
            Engineered with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for Academic Excellence
          </p>
        </div>
      </div>
    </footer>
  );
};
