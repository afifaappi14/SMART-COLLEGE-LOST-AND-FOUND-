import React from 'react';
import { X, ShieldCheck, Lock, EyeOff, UserCheck, AlertCircle, FileCheck2 } from 'lucide-react';

interface PrivacyPolicyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PrivacyPolicyModal: React.FC<PrivacyPolicyModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-2xl w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-3 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Collegiate Privacy Charter & Safety Policy</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Privacy-First Architecture & Dual Verification
          </h2>
          <p className="text-slate-300 text-xs mt-1">
            Compliant with Campus Safety Standards, Student FERPA Regulations, and Ethical Property Recovery.
          </p>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-slate-700 text-xs sm:text-sm">
          {/* Principle 1: Zero-Leak Public Listings */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <EyeOff className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                1. Zero-Leak Public Listings (Basic Information Only)
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                When someone reports a found item, only high-level details (category, generic description, campus building, and date) are visible to the public. <strong>Identifying marks, stickers, serial numbers, case contents, and personal engravings are kept strictly private in our encrypted vault.</strong> Potential claimants must provide these details without prompting.
              </p>
            </div>
          </div>

          {/* Principle 2: Independent Dual Verification */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                2. Independent Dual Verification Guarantee
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                To guarantee zero fraudulent handovers, two separate evaluations are enforced by the system:
              </p>
              <ul className="list-disc pl-5 mt-2 space-y-1 text-slate-600 text-xs">
                <li>
                  <strong>Stage 1 (Claimant Evidence Review):</strong> An authorized reviewer verifies claimant answers against the private vault details without disclosing the expected answers.
                </li>
                <li>
                  <strong>Stage 2 (Independent Physical/Staff Inspection):</strong> A <em>different</em> authorized staff member independently inspects the physical item and verifies registry records. The same person cannot review both stages, and claimants can never review their own claims.
                </li>
              </ul>
            </div>
          </div>

          {/* Principle 3: No Sensitive Credential Harassment */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                3. We Never Ask for Passwords or Banking Credentials
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                The platform will <strong>never</strong> ask claimants or finders for device unlock passcodes, Apple IDs, OTPs, credit card numbers, or social security details. Physical handover requires in-person presentation of your University Student/Staff ID card at the authorized Campus Safety Desk.
              </p>
            </div>
          </div>

          {/* Principle 4: Voluntary Rewards & Zero Ransom Policy */}
          <div className="flex gap-4">
            <div className="w-10 h-10 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
              <FileCheck2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm mb-1">
                4. Voluntary Rewards & Zero Ransom Policy
              </h3>
              <p className="text-slate-600 leading-relaxed text-xs">
                Rewards are strictly voluntary tokens of gratitude offered by the owner. Under university regulations, finders are legally and ethically prohibited from conditioning the return of lost belongings on financial compensation or tips.
              </p>
            </div>
          </div>

          {/* Principle 5: FERPA and Auditability */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
            <div className="flex items-center gap-2 text-slate-900 font-bold text-xs mb-1">
              <AlertCircle className="w-4 h-4 text-emerald-600" />
              <span>FERPA & University Data Protection</span>
            </div>
            <p className="text-slate-600 text-xs leading-relaxed">
              All verification actions, handovers, and claims are logged in an immutable audit ledger. You have the right to request deletion or redaction of your lost item reports upon resolution by contacting the Central Recovery Desk at <span className="font-mono text-slate-800">lostandfound@campus.edu</span>.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors cursor-pointer"
          >
            I Understand & Agree
          </button>
        </div>
      </div>
    </div>
  );
};
