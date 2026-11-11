import React, { useState, useEffect } from 'react';
import api from '../api/axiosClient';
import {
  Shield,
  Users,
  Briefcase,
  FileCheck2,
  AlertTriangle,
  Building2,
  Lock,
  Unlock,
  CheckCircle2,
  XCircle,
  Eye,
  Search,
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { Badge } from '../components/Badge';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
} from 'recharts';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  // User management search/filter
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [actionMessage, setActionMessage] = useState('');

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [dashRes, usersRes, reportsRes] = await Promise.all([
        api.get('/admin/dashboard'),
        api.get(`/admin/users?role=${roleFilter}&search=${userSearch}`),
        api.get('/admin/reports'),
      ]);

      if (dashRes.success) setStats(dashRes.stats);
      if (usersRes.success) setUsers(usersRes.users);
      if (reportsRes.success) setReports(reportsRes.reports);
    } catch (err) {
      console.warn('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [roleFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchAdminData();
  };

  const handleToggleUserStatus = async (userId) => {
    try {
      const res = await api.patch(`/admin/users/${userId}/status`);
      if (res.success) {
        setUsers((prev) =>
          prev.map((u) => (u._id === userId ? { ...u, isSuspended: res.user.isSuspended } : u))
        );
        setActionMessage(res.message);
      }
    } catch (err) {
      alert(err || 'Failed to toggle user status.');
    }
  };

  const roleChartData = [
    { name: 'Candidates', value: stats?.totalCandidates || 0, color: '#6366f1' },
    { name: 'Recruiters', value: stats?.totalRecruiters || 0, color: '#10b981' },
    { name: 'Admins', value: stats?.totalAdmins || 0, color: '#a855f7' },
  ];

  const appBreakdownData = stats?.applicationBreakdown
    ? [
        { name: 'Applied', count: stats.applicationBreakdown.applied, fill: '#6366f1' },
        { name: 'Shortlisted', count: stats.applicationBreakdown.shortlisted, fill: '#10b981' },
        { name: 'Interviewing', count: stats.applicationBreakdown.interviewing, fill: '#f59e0b' },
        { name: 'Hired', count: stats.applicationBreakdown.hired, fill: '#06b6d4' },
        { name: 'Rejected', count: stats.applicationBreakdown.rejected, fill: '#f43f5e' },
      ]
    : [];

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-950 via-slate-900 to-indigo-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold border border-purple-500/30">
              <Shield className="w-3.5 h-3.5" />
              <span>Platform Administration & Governance</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Administrative Command Center
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Live metrics, account governance, content moderation, and fraud prevention
            </p>
          </div>
        </div>

        {/* Action message banner */}
        {actionMessage && (
          <div className="p-3 bg-purple-50 border border-purple-200 rounded-xl text-purple-900 text-xs font-semibold flex items-center justify-between">
            <span>{actionMessage}</span>
            <button onClick={() => setActionMessage('')} className="font-bold">
              ✕
            </button>
          </div>
        )}

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Registered Users"
            value={stats?.totalUsers || 0}
            icon={Users}
            color="indigo"
          />
          <StatCard
            title="Total Job Listings"
            value={stats?.totalJobs || 0}
            icon={Briefcase}
            color="emerald"
            change={`${stats?.activeJobs || 0} Active Vacancies`}
          />
          <StatCard
            title="Applications Processed"
            value={stats?.totalApplications || 0}
            icon={FileCheck2}
            color="sky"
          />
          <StatCard
            title="Registered Companies"
            value={stats?.totalCompanies || 0}
            icon={Building2}
            color="amber"
          />
        </div>

        {/* Two Visual Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* User Distribution Pie Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900">User Demographics by Role</h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleChartData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={80}
                    paddingAngle={4}
                  >
                    {roleChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 text-xs font-semibold text-slate-600">
              {roleChartData.map((item) => (
                <div key={item.name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                  <span>
                    {item.name}: {item.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Application Pipeline Bar Chart */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-3">
            <h2 className="text-sm font-bold text-slate-900">Platform-Wide Application Outcomes</h2>
            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={appBreakdownData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {appBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* User Governance Table */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">User Account Management</h2>
              <p className="text-xs text-slate-500">
                Inspect accounts, filter roles, and toggle suspensions for platform compliance
              </p>
            </div>

            {/* Filter & Search */}
            <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white text-slate-800 font-semibold focus:outline-none"
              >
                <option value="all">All Roles</option>
                <option value="candidate">Candidates</option>
                <option value="recruiter">Recruiters</option>
                <option value="admin">Administrators</option>
              </select>

              <div className="relative">
                <input
                  type="text"
                  placeholder="Search name or email..."
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  className="pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none"
                />
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              </div>
            </form>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-bold border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Account Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-slate-400 text-[11px]">{u.email}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 capitalize font-semibold text-slate-700">
                      <Badge
                        variant={
                          u.role === 'admin'
                            ? 'warning'
                            : u.role === 'recruiter'
                            ? 'info'
                            : 'neutral'
                        }
                        size="xs"
                      >
                        {u.role}
                      </Badge>
                    </td>
                    <td className="py-3.5 px-4">
                      {u.isSuspended ? (
                        <span className="inline-flex items-center gap-1 font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-md text-[11px] border border-rose-200">
                          <Lock className="w-3 h-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px] border border-emerald-200">
                          <CheckCircle2 className="w-3 h-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {u.role !== 'admin' && (
                        <button
                          onClick={() => handleToggleUserStatus(u._id)}
                          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition ${
                            u.isSuspended
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          }`}
                        >
                          {u.isSuspended ? 'Activate Account' : 'Suspend Account'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
