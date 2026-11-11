import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

// Public Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { JobsPage } from './pages/JobsPage';
import { JobDetailPage } from './pages/JobDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';

// Candidate Pages
import { CandidateDashboard } from './pages/CandidateDashboard';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ResumePage } from './pages/ResumePage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { CandidateProfilePage } from './pages/CandidateProfilePage';

// Recruiter Pages
import { RecruiterDashboard } from './pages/RecruiterDashboard';
import { RecruiterJobsPage } from './pages/RecruiterJobsPage';
import { CreateJobPage } from './pages/CreateJobPage';
import { ApplicantManagementPage } from './pages/ApplicantManagementPage';
import { CompanyProfilePage } from './pages/CompanyProfilePage';

// Admin & General Pages
import { AdminDashboard } from './pages/AdminDashboard';
import { NotificationsPage } from './pages/NotificationsPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <div className="flex flex-col min-h-screen bg-slate-50 text-slate-800">
            <Navbar />
            <main className="flex-1">
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/jobs" element={<JobsPage />} />
                <Route path="/jobs/:id" element={<JobDetailPage />} />

                {/* Candidate Protected Routes */}
                <Route
                  path="/candidate/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <CandidateDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/recommendations"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <RecommendationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/resume"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <ResumePage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/applications"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <ApplicationsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/candidate/profile"
                  element={
                    <ProtectedRoute allowedRoles={['candidate']}>
                      <CandidateProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Recruiter Protected Routes */}
                <Route
                  path="/recruiter/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                      <RecruiterDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/jobs"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                      <RecruiterJobsPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/jobs/new"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                      <CreateJobPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/applicants"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                      <ApplicantManagementPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/recruiter/company"
                  element={
                    <ProtectedRoute allowedRoles={['recruiter', 'admin']}>
                      <CompanyProfilePage />
                    </ProtectedRoute>
                  }
                />

                {/* Admin Protected Routes */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <ProtectedRoute allowedRoles={['admin']}>
                      <AdminDashboard />
                    </ProtectedRoute>
                  }
                />

                {/* Authenticated General Routes */}
                <Route
                  path="/notifications"
                  element={
                    <ProtectedRoute>
                      <NotificationsPage />
                    </ProtectedRoute>
                  }
                />

                {/* Catch-all 404 Route */}
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
