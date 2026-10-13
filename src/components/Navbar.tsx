import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  FileText,
  Sparkles,
  Bell,
  Coins,
  ShieldAlert,
  RotateCcw,
  CheckCircle2,
  Menu,
  X,
  ExternalLink,
  Lock,
} from 'lucide-react';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenPrivacyModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab, onOpenPrivacyModal }) => {
  const { currentUser, users, switchUser, unreadCount, isStaffOrAdmin, resetDatabase } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = async () => {
    if (confirm('Reset database to clean initial state with sample demo records?')) {
      await resetDatabase();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 3000);
    }
  };

  const navItems = [
    { id: 'home', label: 'Home', icon: ShieldCheck },
    { id: 'browse', label: 'Browse Items', icon: Search },
    { id: 'report-lost', label: 'Report Lost', icon: PlusCircle },
    {
      id: 'report-found',
      label: 'Report Found',
      icon: PlusCircle,
      badge: 'Privacy Vault',
    },
    { id: 'claims', label: 'My Claims', icon: FileText },
    { id: 'matches', label: 'Smart Matches', icon: Sparkles },
    { id: 'rewards', label: 'My Rewards', icon: Coins },
    {
      id: 'admin',
      label: 'Admin Desk',
      icon: ShieldAlert,
      roleBadge: isStaffOrAdmin ? 'Staff' : 'Protected',
      isStaffOnly: true,
    },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Campus Sub-bar */}
      <div className="bg-slate-900 text-slate-300 text-xs py-1.5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-medium text-slate-100">Smart Campus Lost & Found System</span>
            <span className="hidden md:inline text-slate-400">• Official Student Safety & Asset Recovery</span>
          </div>
          <div className="flex items-center gap-4 text-slate-300">
            <button
              onClick={onOpenPrivacyModal}
              className="hover:text-emerald-300 transition-colors cursor-pointer flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy & FERPA Protocol</span>
            </button>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-slate-400">Desk: Student Center B-14 (08:30 - 18:00)</span>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Brand */}
          <div
            onClick={() => setActiveTab('home')}
            className="flex items-center gap-3 cursor-pointer group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-slate-900 text-lg leading-tight tracking-tight flex items-center gap-1.5">
                Smart Campus <span className="text-emerald-600">Lost & Found</span>
              </div>
              <div className="text-[11px] font-medium text-slate-500 flex items-center gap-1">
                <span>Dual Verification</span>
                <span className="text-slate-300">•</span>
                <span className="text-emerald-600 font-semibold">Zero-Leak Privacy</span>
              </div>
            </div>
          </div>

          {/* Desktop Nav Items */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`relative px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold border border-emerald-200/60 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white uppercase tracking-wider">
                      {item.badge}
                    </span>
                  )}
                  {item.roleBadge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isStaffOrAdmin
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {item.roleBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Right Action Tools: Notifications, Switch Persona & Reset */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification Bell */}
            <button
              onClick={() => setActiveTab('notifications')}
              className="relative p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {/* Persona Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300 transition-all cursor-pointer"
              >
                <img
                  src={currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={currentUser?.name}
                  className="w-7 h-7 rounded-full object-cover border border-slate-200"
                />
                <div className="text-left hidden md:block">
                  <div className="text-xs font-bold text-slate-800 leading-none">{currentUser?.name}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5 capitalize flex items-center gap-1">
                    <span
                      className={`inline-block w-1.5 h-1.5 rounded-full ${
                        currentUser?.role === 'admin'
                          ? 'bg-rose-500'
                          : currentUser?.role === 'staff'
                          ? 'bg-purple-500'
                          : 'bg-emerald-500'
                      }`}
                    ></span>
                    <span className="font-semibold text-slate-700">{currentUser?.role}</span>
                  </div>
                </div>
              </button>

              {userDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                  onClick={() => setUserDropdownOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100">
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Interactive Role Switcher
                    </div>
                    <div className="text-xs text-slate-600 mt-0.5">
                      Switch personas to test dual verification & staff workflows:
                    </div>
                  </div>

                  <div className="py-1">
                    {users.map((u) => {
                      const isSelected = u.id === currentUser?.id;
                      return (
                        <button
                          key={u.id}
                          onClick={() => switchUser(u.id)}
                          className={`w-full px-4 py-2 text-left flex items-center justify-between transition-colors cursor-pointer ${
                            isSelected ? 'bg-emerald-50/80 text-emerald-900' : 'hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <img
                              src={u.avatarUrl}
                              alt={u.name}
                              className="w-7 h-7 rounded-full object-cover border border-slate-200"
                            />
                            <div>
                              <div className="text-xs font-bold flex items-center gap-1.5">
                                <span>{u.name}</span>
                                {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                              </div>
                              <div className="text-[10px] text-slate-500">
                                {u.title || u.department}
                              </div>
                            </div>
                          </div>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md uppercase tracking-wider ${
                              u.role === 'admin'
                                ? 'bg-rose-100 text-rose-700'
                                : u.role === 'staff'
                                ? 'bg-purple-100 text-purple-700'
                                : 'bg-emerald-100 text-emerald-800'
                            }`}
                          >
                            {u.role}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <div className="px-3 pt-2 mt-1 border-t border-slate-100">
                    <button
                      onClick={handleReset}
                      className="w-full py-1.5 px-3 rounded-lg text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
                      <span>Reset Demo Sample Records</span>
                    </button>
                    {resetSuccess && (
                      <div className="text-[11px] text-emerald-600 text-center font-medium mt-1">
                        Database restored to initial state!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="xl:hidden py-3 border-t border-slate-200 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full px-3 py-2.5 rounded-lg text-sm font-semibold flex items-center justify-between transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-800 font-bold'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-600 text-white">
                      {item.badge}
                    </span>
                  )}
                  {item.roleBadge && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-purple-100 text-purple-700">
                      {item.roleBadge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </header>
  );
};
