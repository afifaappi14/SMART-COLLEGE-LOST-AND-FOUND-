import React from 'react';
import { Notification } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CheckCircle2,
  Clock,
  Sparkles,
  Award,
  Coins,
  ShieldCheck,
  CheckCheck,
  ArrowRight,
} from 'lucide-react';

interface NotificationsViewProps {
  setActiveTab: (tab: string) => void;
}

export const NotificationsView: React.FC<NotificationsViewProps> = ({ setActiveTab }) => {
  const { notifications, refreshNotifications, currentUser } = useAuth();

  const handleMarkAsRead = async (id: string) => {
    await api.markNotificationRead(id);
    await refreshNotifications();
  };

  const handleMarkAllAsRead = async () => {
    await api.markAllNotificationsRead();
    await refreshNotifications();
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'stage_approval':
        return <ShieldCheck className="w-5 h-5 text-emerald-600" />;
      case 'collection_ready':
        return <Sparkles className="w-5 h-5 text-purple-600" />;
      case 'handover_done':
        return <Award className="w-5 h-5 text-blue-600" />;
      case 'match_found':
        return <Sparkles className="w-5 h-5 text-amber-600" />;
      case 'reward_update':
        return <Coins className="w-5 h-5 text-emerald-600" />;
      default:
        return <Bell className="w-5 h-5 text-slate-500" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
            <Bell className="w-3.5 h-3.5" />
            <span>Activity & Verification Feed</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time updates on dual verification stages, algorithmic matches, desk handovers, and claims for{' '}
            <strong className="text-slate-800">{currentUser?.name}</strong>.
          </p>
        </div>

        {notifications.length > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors self-start sm:self-auto"
          >
            <CheckCheck className="w-4 h-4 text-emerald-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {/* Notifications List */}
      {notifications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Bell className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No notifications yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When you submit a report or claim, stage progress and collection notifications will show up here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => {
                if (!notif.read) handleMarkAsRead(notif.id);
                if (notif.linkTab) setActiveTab(notif.linkTab);
              }}
              className={`p-5 rounded-2xl border transition-all cursor-pointer flex items-start gap-4 ${
                !notif.read
                  ? 'bg-white border-emerald-300 shadow-sm ring-1 ring-emerald-200/50'
                  : 'bg-white border-slate-200/80 hover:border-slate-300 opacity-90'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
                {getNotificationIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                    <span>{notif.title}</span>
                    {!notif.read && (
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    )}
                  </h3>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    {new Date(notif.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  {notif.message}
                </p>

                {notif.linkTab && (
                  <div className="pt-1.5 flex items-center gap-1 text-[11px] font-bold text-emerald-700 hover:text-emerald-800">
                    <span>Open {notif.linkTab.replace('-', ' ')}</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
