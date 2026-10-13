import React, { useState } from 'react';
import { api } from '../services/api';
import { X, ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface AbuseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'item' | 'claim';
  targetId: string;
  targetTitle: string;
}

export const AbuseReportModal: React.FC<AbuseReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetTitle,
}) => {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;

    try {
      setSubmitting(true);
      setError(null);
      await api.reportAbuse({
        targetType,
        targetId,
        targetTitle,
        reason,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setReason('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-150">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-2.5 text-rose-600 mb-2">
          <ShieldAlert className="w-5 h-5" />
          <h3 className="font-bold text-sm text-slate-900">Report Inappropriate or Suspicious Content</h3>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          Reporting: <strong className="text-slate-800">{targetTitle}</strong>
        </p>

        {success ? (
          <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-center text-xs flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 animate-bounce" />
            <p className="font-semibold">Abuse report dispatched to Campus Public Safety.</p>
            <p className="text-[11px] text-emerald-600">Our administrative team reviews all flags within 4 hours.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 text-rose-700 text-xs">
                {error}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reason for report
              </label>
              <textarea
                required
                rows={3}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Describe why this item or claim appears fraudulent, misleading, or abusive..."
                className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-rose-500 focus:ring-2 focus:ring-rose-200 outline-none"
              />
            </div>

            <div className="text-[11px] text-slate-400">
              Campus policy strictly penalizes fraudulent claims and prank listings.
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Submitting...' : 'Send to Campus Safety'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
