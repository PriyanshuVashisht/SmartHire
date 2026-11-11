import React from 'react';
import { Link } from 'react-router-dom';
import { useNotifications } from '../context/NotificationContext';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Briefcase,
  Sparkles,
  ArrowRight,
  Clock,
} from 'lucide-react';
import { Badge } from '../components/Badge';

export const NotificationsPage = () => {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Activity & Notifications
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Stay updated on status updates, applicant submissions, and intelligent recommendations
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs rounded-xl transition self-start sm:self-auto"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>

        {/* Notifications list */}
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-5 rounded-2xl border border-slate-200 animate-pulse h-20" />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-3">
            <Bell className="w-10 h-10 text-slate-300 mx-auto" />
            <h3 className="text-base font-bold text-slate-800">You're all caught up!</h3>
            <p className="text-xs text-slate-500">
              No new alerts or notifications at this time.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {notifications.map((n) => (
              <div
                key={n._id}
                className={`p-5 rounded-2xl border transition flex items-start justify-between gap-4 ${
                  n.isRead
                    ? 'bg-white border-slate-200 text-slate-700'
                    : 'bg-indigo-50/50 border-indigo-200 text-slate-900 shadow-sm'
                }`}
              >
                <div className="flex items-start gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      n.isRead ? 'bg-slate-100 text-slate-500' : 'bg-indigo-600 text-white shadow-sm'
                    }`}
                  >
                    {n.type === 'application_status' ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : n.type === 'new_application' ? (
                      <Briefcase className="w-5 h-5" />
                    ) : (
                      <Sparkles className="w-5 h-5" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-bold text-sm text-slate-900">{n.title}</h4>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-indigo-600 inline-block" />
                      )}
                    </div>
                    <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>
                    <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1 pt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(n.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 shrink-0">
                  {n.link && (
                    <Link
                      to={n.link}
                      onClick={() => !n.isRead && markAsRead(n._id)}
                      className="px-3 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200 font-bold text-xs text-indigo-600 transition flex items-center gap-1 shadow-sm"
                    >
                      <span>View</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  )}
                  {!n.isRead && (
                    <button
                      onClick={() => markAsRead(n._id)}
                      className="text-xs text-slate-400 hover:text-slate-600 font-semibold"
                    >
                      Dismiss
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
