import React from 'react';
import { ShieldCheck, Heart, MapPin, Phone, Mail, Clock, ShieldAlert, Award } from 'lucide-react';

interface FooterProps {
  onOpenPrivacyModal: () => void;
  setActiveTab: (tab: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onOpenPrivacyModal, setActiveTab }) => {
  return (
    <footer className="bg-slate-900 text-slate-300 mt-20 border-t border-slate-800">
      {/* Upper Footer: Value Proposition & Security Principles */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Overview */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-900 font-bold shadow-md">
                <ShieldCheck className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-white text-lg tracking-tight">Smart Campus L&F</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              University asset recovery system designed with privacy-first architecture, independent dual verification, and secure physical handovers.
            </p>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/80 text-[11px] text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
              <span>Zero-Leak Architecture Active</span>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Direct Navigation</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => setActiveTab('browse')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Browse Campus Listings
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('report-lost')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Report a Lost Item
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('report-found')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Report a Found Belonging
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('claims')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Check Claim Status
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveTab('matches')}
                  className="hover:text-emerald-400 transition-colors cursor-pointer"
                >
                  Smart Matching Engine
                </button>
              </li>
            </ul>
          </div>

          {/* Verification Protocol */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Dual Verification Rules</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-emerald-400">•</span>
                <span>Stage 1: Claimant describes unlisted private features</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-emerald-400">•</span>
                <span>Stage 2: Independent secondary staff verification</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-emerald-400">•</span>
                <span>Handover: Secure code & Student ID verification</span>
              </li>
              <li className="flex items-start gap-1.5">
                <span className="font-bold text-emerald-400">•</span>
                <span>Rewards: 100% voluntary; zero release fee policy</span>
              </li>
            </ul>
          </div>

          {/* Campus Desk Contact */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-white">Central Recovery Desk</h4>
            <div className="space-y-2 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Student Center, Room B-14 (Campus Public Safety Desk)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Mon – Fri: 08:30 – 18:00</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Ext. 4020 / +1 (555) 019-4020</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>lostandfound@campus.edu</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Legal, Privacy & Compliance */}
        <div className="mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 Smart Campus Lost & Found System. Built for collegiate student safety and ethical property return.
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onOpenPrivacyModal}
              className="text-slate-400 hover:text-emerald-400 transition-colors underline cursor-pointer"
            >
              Privacy Policy & FERPA Charter
            </button>
            <span>•</span>
            <span className="text-slate-500">Anti-Abuse Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
