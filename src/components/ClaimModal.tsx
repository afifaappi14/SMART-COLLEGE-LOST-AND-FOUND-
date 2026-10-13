import React, { useState } from 'react';
import { Item } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  X,
  ShieldCheck,
  AlertCircle,
  Sparkles,
  Lock,
  Calendar,
  MapPin,
  CheckCircle2,
  FileText,
} from 'lucide-react';

interface ClaimModalProps {
  item: Item | null;
  isOpen: boolean;
  onClose: () => void;
  onClaimSuccess: () => void;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  item,
  isOpen,
  onClose,
  onClaimSuccess,
}) => {
  const { currentUser } = useAuth();
  const [distinguishingMarks, setDistinguishingMarks] = useState('');
  const [contentsDescription, setContentsDescription] = useState('');
  const [approximateDateLost, setApproximateDateLost] = useState('');
  const [exactLocationLost, setExactLocationLost] = useState('');
  const [additionalProof, setAdditionalProof] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !item) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!distinguishingMarks.trim() || !contentsDescription.trim() || !approximateDateLost.trim() || !exactLocationLost.trim()) {
      setError('Please provide all mandatory verification details to substantiate ownership.');
      return;
    }

    try {
      setSubmitting(true);
      await api.submitClaim({
        itemId: item.id,
        distinguishingMarks,
        contentsDescription,
        approximateDateLost,
        exactLocationLost,
        additionalProof,
      });

      onClaimSuccess();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to submit ownership claim.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold mb-2 border border-emerald-400/30">
            <ShieldCheck className="w-4 h-4" />
            <span>Stage 1 Claimant Ownership Verification</span>
          </div>
          <h2 className="text-xl font-bold tracking-tight">Claim: {item.title}</h2>
          <div className="flex items-center gap-3 text-xs text-emerald-200/90 mt-1">
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              Found in: {item.generalLocation}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Date: {item.date}
            </span>
          </div>
        </div>

        {/* Security Notice */}
        <div className="p-4 bg-amber-50/70 border-b border-amber-200/60 text-xs text-amber-900 flex items-start gap-2.5">
          <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div>
            <strong className="font-bold text-amber-900">Privacy Safeguard:</strong> The finder recorded specific identifying marks in a private vault. To prevent fraudulent claims, you must independently describe distinguishing characteristics below.
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Claimant Identity Preview */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-center justify-between">
            <div>
              <span className="text-slate-500">Claimant Account: </span>
              <strong className="text-slate-900 font-semibold">{currentUser?.name}</strong>
              <span className="text-slate-500"> ({currentUser?.email})</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 uppercase">
              {currentUser?.role}
            </span>
          </div>

          {/* Distinguishing Marks */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              1. Distinguishing Marks or Unique Features <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              Specific scratches, stickers, keychains, engraved initials, wear marks, or custom accessories.
            </p>
            <textarea
              required
              rows={3}
              value={distinguishingMarks}
              onChange={(e) => setDistinguishingMarks(e.target.value)}
              placeholder="e.g. Small yellow Pikachu sticker near the top lid, slight dent on the bottom stainless rim from dropping it on concrete..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Contents / Accessories */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              2. Contents, Accessories, or Internal Details <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-500 mb-1.5">
              What was inside or attached? (e.g. liquid type, cable length, bookmark position, case model).
            </p>
            <textarea
              required
              rows={2}
              value={contentsDescription}
              onChange={(e) => setContentsDescription(e.target.value)}
              placeholder="e.g. Straw cap attached; had Earl Grey tea residue; serial batch ending in 32-9..."
              className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Location and Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                3. Exact Location Where You Lost It <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={exactLocationLost}
                onChange={(e) => setExactLocationLost(e.target.value)}
                placeholder="e.g. Study carrel #24, 2nd floor library"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                4. Approximate Date & Time Lost <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={approximateDateLost}
                onChange={(e) => setApproximateDateLost(e.target.value)}
                placeholder="e.g. Oct 10 around 14:00"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
              />
            </div>
          </div>

          {/* Optional Additional Proof */}
          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              5. Additional Proof or Evidence (Optional)
            </label>
            <input
              type="text"
              value={additionalProof}
              onChange={(e) => setAdditionalProof(e.target.value)}
              placeholder="e.g. Receipt invoice reference, phone screenshot of bluetooth pairing, photo from camera roll"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none transition-all"
            />
          </div>

          {/* Notice about dual verification */}
          <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-[11px] text-slate-500 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>
              Submitting this claim begins <strong>Stage 1 Claimant Verification</strong>. Once approved by Reviewer 1, it will undergo <strong>Stage 2 Independent Staff Inspection</strong> before a Handover Code is generated.
            </span>
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <span>Submitting to Review Vault...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4" />
                  <span>Submit Ownership Claim</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
