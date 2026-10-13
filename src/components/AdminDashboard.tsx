import React, { useState, useEffect } from 'react';
import { Claim, Item, AuditLog, AbuseReport } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  UserCheck,
  Award,
  AlertTriangle,
  FileText,
  Lock,
  Layers,
  Search,
  Eye,
  RefreshCw,
  QrCode,
  Check,
  AlertCircle,
  HelpCircle,
  Sparkles,
} from 'lucide-react';

interface AdminDashboardProps {
  setActiveTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ setActiveTab }) => {
  const { currentUser, isStaffOrAdmin, switchUser } = useAuth();

  const [activeSubTab, setActiveSubTab] = useState<'queue' | 'handover' | 'catalog' | 'abuse' | 'audit'>('queue');
  const [claims, setClaims] = useState<Claim[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [abuseReports, setAbuseReports] = useState<AbuseReport[]>([]);
  const [loading, setLoading] = useState(true);

  // Reviewing modal / drawer state
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  // Handover execution state
  const [handoverCodeInput, setHandoverCodeInput] = useState('');
  const [recipientStudentIdInput, setRecipientStudentIdInput] = useState('');
  const [handoverNotesInput, setHandoverNotesInput] = useState('');
  const [handoverTargetClaim, setHandoverTargetClaim] = useState<Claim | null>(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [claimsRes, itemsRes, auditRes, abuseRes] = await Promise.all([
        api.getClaims(),
        api.getItems(),
        api.getAuditLogs(),
        api.getAbuseReports(),
      ]);

      setClaims(claimsRes.claims);
      setItems(itemsRes.items);
      setAuditLogs(auditRes.auditLogs);
      setAbuseReports(abuseRes.abuseReports);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isStaffOrAdmin) {
      fetchDashboardData();
    }
  }, [currentUser, isStaffOrAdmin]);

  // Stage 1 Action
  const handleStage1Decision = async (decision: 'Approved' | 'Rejected' | 'Manual Review') => {
    if (!selectedClaim) return;
    setActionError(null);
    setActionSuccess(null);

    try {
      setActionLoading(true);
      const res = await api.verifyStage1({
        claimId: selectedClaim.id,
        decision,
        notes: reviewNotes || `${decision} by ${currentUser?.name}`,
      });

      setActionSuccess(`Stage 1 successfully marked ${decision}!`);
      setSelectedClaim(res.claim);
      setReviewNotes('');
      await fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || 'Stage 1 action failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Stage 2 Action
  const handleStage2Decision = async (decision: 'Approved' | 'Rejected' | 'Manual Review') => {
    if (!selectedClaim) return;
    setActionError(null);
    setActionSuccess(null);

    try {
      setActionLoading(true);
      const res = await api.verifyStage2({
        claimId: selectedClaim.id,
        decision,
        notes: reviewNotes || `Stage 2 independent physical review ${decision} by ${currentUser?.name}`,
      });

      setActionSuccess(`Stage 2 Independent Verification marked ${decision}!`);
      setSelectedClaim(res.claim);
      setReviewNotes('');
      await fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || 'Stage 2 action failed');
    } finally {
      setActionLoading(false);
    }
  };

  // Execute Handover
  const handleExecuteHandover = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverTargetClaim) return;
    setActionError(null);
    setActionSuccess(null);

    try {
      setActionLoading(true);
      await api.confirmHandover({
        claimId: handoverTargetClaim.id,
        handoverCode: handoverCodeInput.trim().toUpperCase(),
        recipientStudentId: recipientStudentIdInput.trim(),
        notes: handoverNotesInput.trim() || undefined,
      });

      // Confetti burst on successful official handover
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // canvas fallback
      }

      setActionSuccess(`Handover confirmed! Item marked Returned.`);
      setHandoverCodeInput('');
      setRecipientStudentIdInput('');
      setHandoverNotesInput('');
      setHandoverTargetClaim(null);
      await fetchDashboardData();
    } catch (err: any) {
      setActionError(err.message || 'Handover confirmation failed');
    } finally {
      setActionLoading(false);
    }
  };

  // If user is a student, show gentle role switch banner for easy evaluation
  if (!isStaffOrAdmin) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-3xl bg-purple-100 text-purple-700 mx-auto flex items-center justify-center">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900">
            Authorized Staff Desk Restricted
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
            You are currently signed in as <strong className="text-slate-800">{currentUser?.name}</strong> (Role: {currentUser?.role}). The Admin & Verification Desk is protected for Campus Public Safety and Student Affairs Reviewers.
          </p>
        </div>

        <div className="p-6 rounded-3xl bg-white border border-slate-200 max-w-lg mx-auto space-y-4 text-xs shadow-sm">
          <div className="font-bold text-slate-900 text-sm">
            Quick Persona Switcher (For Testing & Evaluation):
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => switchUser('user_staff_1')}
              className="p-3 rounded-2xl bg-purple-50 hover:bg-purple-100 text-purple-800 border border-purple-200 font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
            >
              <span>Officer Marcus Chen</span>
              <span className="text-[10px] text-purple-600 font-medium">Reviewer 1 (Public Safety)</span>
            </button>

            <button
              onClick={() => switchUser('user_staff_2')}
              className="p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200 font-bold transition-all flex flex-col items-center gap-1 cursor-pointer"
            >
              <span>Dean Sarah Jenkins</span>
              <span className="text-[10px] text-blue-600 font-medium">Reviewer 2 (Student Affairs)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Count queues
  const stage1Count = claims.filter((c) => c.status === 'Stage 1 Pending').length;
  const stage2Count = claims.filter((c) => c.status === 'Stage 2 Pending').length;
  const readyHandoverCount = claims.filter((c) => c.status === 'Verified — Ready for Collection').length;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Campus Operations & Review Terminal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Admin & Dual Verification Desk
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Logged in as <strong className="text-slate-800">{currentUser?.name}</strong> ({currentUser?.title}). Enforces independent secondary reviews and authorized physical handovers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchDashboardData}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Terminal"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <div className="px-3 py-1.5 rounded-xl bg-purple-100 text-purple-800 text-xs font-bold flex items-center gap-1.5">
            <UserCheck className="w-4 h-4 text-purple-700" />
            <span>Staff Authorized</span>
          </div>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveSubTab('queue')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'queue'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Verification Queue</span>
          {(stage1Count > 0 || stage2Count > 0) && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-amber-500 text-white">
              {stage1Count + stage2Count}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('handover')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'handover'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Desk Handover Terminal</span>
          {readyHandoverCount > 0 && (
            <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-500 text-white">
              {readyHandoverCount}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('catalog')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'catalog'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>All Campus Reports ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('abuse')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'abuse'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle className="w-4 h-4" />
          <span>Abuse Reports ({abuseReports.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('audit')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'audit'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Immutable Audit Ledger</span>
        </button>
      </div>

      {/* SUB-TAB 1: DUAL VERIFICATION QUEUE */}
      {activeSubTab === 'queue' && (
        <div className="space-y-6">
          {/* Quick Metrics */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-amber-900">{stage1Count}</div>
                <div className="text-xs font-semibold text-amber-700">Stage 1 Pending Review</div>
              </div>
              <Clock className="w-8 h-8 text-amber-400" />
            </div>

            <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-purple-900">{stage2Count}</div>
                <div className="text-xs font-semibold text-purple-700">Stage 2 Independent Pending</div>
              </div>
              <ShieldCheck className="w-8 h-8 text-purple-400" />
            </div>

            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between">
              <div>
                <div className="text-2xl font-black text-emerald-900">{readyHandoverCount}</div>
                <div className="text-xs font-semibold text-emerald-700">Ready for Desk Handover</div>
              </div>
              <Award className="w-8 h-8 text-emerald-400" />
            </div>
          </div>

          {/* Claims Table / Cards */}
          <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900">
                Pending Verification Tasks
              </h2>
              <span className="text-xs text-slate-400">Click any claim to inspect evidence side-by-side</span>
            </div>

            <div className="divide-y divide-slate-100">
              {claims.length === 0 ? (
                <div className="p-8 text-center text-xs text-slate-400">No active claims in queue.</div>
              ) : (
                claims.map((c) => {
                  const targetItem = items.find((i) => i.id === c.itemId);
                  const isStage1Reviewer = c.stage1Review?.reviewerId === currentUser?.id;
                  const isClaimant = c.claimantId === currentUser?.id;

                  return (
                    <div
                      key={c.id}
                      onClick={() => setSelectedClaim(c)}
                      className={`p-5 hover:bg-slate-50 transition-colors cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                        selectedClaim?.id === c.id ? 'bg-purple-50/50' : ''
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 uppercase">
                            {c.itemCategory}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                              c.status === 'Stage 1 Pending'
                                ? 'bg-amber-100 text-amber-800'
                                : c.status === 'Stage 2 Pending'
                                ? 'bg-purple-100 text-purple-800'
                                : c.status === 'Verified — Ready for Collection'
                                ? 'bg-emerald-100 text-emerald-800'
                                : c.status === 'Returned'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {c.status}
                          </span>
                        </div>

                        <h3 className="font-bold text-slate-900 text-sm">{c.itemTitle}</h3>

                        <div className="text-xs text-slate-500 flex flex-wrap gap-2">
                          <span>Claimant: <strong className="text-slate-700">{c.claimantName}</strong> ({c.claimantEmail})</span>
                          <span>•</span>
                          <span>Location: {c.itemLocation}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {c.status === 'Stage 2 Pending' && isStage1Reviewer && (
                          <span className="text-[11px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-lg border border-rose-200">
                            Independent Reviewer Required (You reviewed Stage 1)
                          </span>
                        )}

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClaim(c);
                          }}
                          className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-purple-600 text-white text-xs font-bold transition-colors cursor-pointer"
                        >
                          Inspect & Verify
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* SIDE-BY-SIDE EVIDENCE COMPARATOR DRAWER / MODAL */}
          {selectedClaim && (
            <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                {/* Modal Header */}
                <div className="bg-gradient-to-r from-slate-900 via-purple-950 to-slate-900 text-white p-6 relative">
                  <button
                    onClick={() => {
                      setSelectedClaim(null);
                      setActionError(null);
                      setActionSuccess(null);
                    }}
                    className="absolute top-5 right-5 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white cursor-pointer"
                  >
                    <XCircle className="w-5 h-5" />
                  </button>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-2 border border-purple-500/30">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Side-by-Side Dual Verification Comparator</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                    {selectedClaim.itemTitle}
                  </h2>
                  <div className="text-xs text-purple-200/80 mt-1 flex items-center gap-3">
                    <span>Claim Ref: {selectedClaim.id}</span>
                    <span>•</span>
                    <span>Status: <strong className="text-white">{selectedClaim.status}</strong></span>
                  </div>
                </div>

                {/* Notifications / Feedback */}
                {actionError && (
                  <div className="p-4 bg-rose-50 border-b border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{actionError}</span>
                  </div>
                )}
                {actionSuccess && (
                  <div className="p-4 bg-emerald-50 border-b border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>{actionSuccess}</span>
                  </div>
                )}

                {/* Comparison Body */}
                <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
                  {/* Side-by-Side Grids */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* LEFT COLUMN: CLAIMANT'S SUBMITTED PROOF */}
                    <div className="bg-amber-50/50 rounded-2xl p-5 border border-amber-200 space-y-3">
                      <div className="flex items-center justify-between pb-2 border-b border-amber-200">
                        <span className="text-xs font-bold text-amber-900 uppercase tracking-wider flex items-center gap-1.5">
                          <UserCheck className="w-4 h-4 text-amber-700" />
                          <span>Claimant Evidence</span>
                        </span>
                        <span className="text-[10px] font-bold bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md">
                          {selectedClaim.claimantName}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs text-slate-700">
                        <div>
                          <strong className="block text-slate-900">Distinguishing Marks / Scratches:</strong>
                          <p className="mt-0.5 bg-white p-2.5 rounded-xl border border-amber-200/60">
                            {selectedClaim.claimantEvidence.distinguishingMarks}
                          </p>
                        </div>

                        <div>
                          <strong className="block text-slate-900">Contents / Inside Details:</strong>
                          <p className="mt-0.5 bg-white p-2.5 rounded-xl border border-amber-200/60">
                            {selectedClaim.claimantEvidence.contentsDescription}
                          </p>
                        </div>

                        <div>
                          <strong className="block text-slate-900">Reported Lost Location & Time:</strong>
                          <p className="mt-0.5 bg-white p-2 rounded-xl border border-amber-200/60">
                            {selectedClaim.claimantEvidence.exactLocationLost} ({selectedClaim.claimantEvidence.approximateDateLost})
                          </p>
                        </div>

                        {selectedClaim.claimantEvidence.additionalProof && (
                          <div>
                            <strong className="block text-slate-900">Additional Proof / Receipts:</strong>
                            <p className="mt-0.5 bg-white p-2 rounded-xl border border-amber-200/60">
                              {selectedClaim.claimantEvidence.additionalProof}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* RIGHT COLUMN: FINDER / STAFF SECURE VAULT RECORD */}
                    {(() => {
                      const itemRecord = items.find((i) => i.id === selectedClaim.itemId);
                      const vault = itemRecord?.privateVerificationDetails;

                      return (
                        <div className="bg-emerald-50/50 rounded-2xl p-5 border border-emerald-200 space-y-3">
                          <div className="flex items-center justify-between pb-2 border-b border-emerald-200">
                            <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                              <Lock className="w-4 h-4 text-emerald-700" />
                              <span>Private Vault Record</span>
                            </span>
                            <span className="text-[10px] font-bold bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-md">
                              Confidential Ground Truth
                            </span>
                          </div>

                          {vault ? (
                            <div className="space-y-2 text-xs text-slate-700">
                              <div>
                                <strong className="block text-slate-900">Vault Distinguishing Marks:</strong>
                                <p className="mt-0.5 bg-white p-2.5 rounded-xl border border-emerald-200/60 font-medium text-emerald-950">
                                  {vault.distinguishingMarks}
                                </p>
                              </div>

                              <div>
                                <strong className="block text-slate-900">Vault Contents / Accessories:</strong>
                                <p className="mt-0.5 bg-white p-2.5 rounded-xl border border-emerald-200/60 font-medium text-emerald-950">
                                  {vault.contentsOrAccessories}
                                </p>
                              </div>

                              <div>
                                <strong className="block text-slate-900">Physical Features & Serial:</strong>
                                <p className="mt-0.5 bg-white p-2.5 rounded-xl border border-emerald-200/60 font-medium text-emerald-950">
                                  {vault.uniqueFeatures} {vault.serialOrModelDetails ? `• Serial: ${vault.serialOrModelDetails}` : ''}
                                </p>
                              </div>

                              {vault.staffInspectionNotes && (
                                <div>
                                  <strong className="block text-slate-900">Physical Custody / Locker Bay:</strong>
                                  <p className="mt-0.5 bg-white p-2 rounded-xl border border-emerald-200/60 text-slate-600">
                                    {vault.staffInspectionNotes}
                                  </p>
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="p-4 bg-white rounded-xl text-xs text-slate-500">
                              No private vault recorded yet. Staff inspection required.
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* Stage 1 & 2 Historical Review Audit Trail */}
                  <div className="space-y-2 text-xs">
                    <h3 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">
                      Verification History
                    </h3>

                    {selectedClaim.stage1Review && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Stage 1 ({selectedClaim.stage1Review.decision}):</strong> by {selectedClaim.stage1Review.reviewerName} at {new Date(selectedClaim.stage1Review.timestamp).toLocaleString()}
                          <div className="italic text-slate-600 mt-0.5">"{selectedClaim.stage1Review.notes}"</div>
                        </div>
                      </div>
                    )}

                    {selectedClaim.stage2Review && (
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <strong>Stage 2 ({selectedClaim.stage2Review.decision}):</strong> by {selectedClaim.stage2Review.reviewerName} at {new Date(selectedClaim.stage2Review.timestamp).toLocaleString()}
                          <div className="italic text-slate-600 mt-0.5">"{selectedClaim.stage2Review.notes}"</div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Reviewer Inputs */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-slate-900">
                      Reviewer Assessment Notes <span className="text-slate-400 font-normal">(Recorded in permanent audit log)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={reviewNotes}
                      onChange={(e) => setReviewNotes(e.target.value)}
                      placeholder="Enter verification assessment notes, cross-reference marks, or reason for rejection/manual review..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:border-purple-500 outline-none"
                    />
                  </div>
                </div>

                {/* Modal Action Bar */}
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                  <div className="text-xs text-slate-500">
                    Acting as: <strong className="text-slate-800">{currentUser?.name}</strong>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {/* STAGE 1 BUTTONS */}
                    {selectedClaim.status === 'Stage 1 Pending' && (
                      <>
                        <button
                          onClick={() => handleStage1Decision('Rejected')}
                          disabled={actionLoading}
                          className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Reject Stage 1
                        </button>
                        <button
                          onClick={() => handleStage1Decision('Manual Review')}
                          disabled={actionLoading}
                          className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                        >
                          Request More Proof
                        </button>
                        <button
                          onClick={() => handleStage1Decision('Approved')}
                          disabled={actionLoading}
                          className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve Stage 1</span>
                        </button>
                      </>
                    )}

                    {/* STAGE 2 BUTTONS */}
                    {selectedClaim.status === 'Stage 2 Pending' && (
                      <>
                        {selectedClaim.stage1Review?.reviewerId === currentUser?.id ? (
                          <div className="text-xs text-rose-600 font-bold bg-rose-50 px-3 py-1.5 rounded-xl border border-rose-200">
                            Independent reviewer required. Please switch persona to Reviewer 2.
                          </div>
                        ) : (
                          <>
                            <button
                              onClick={() => handleStage2Decision('Rejected')}
                              disabled={actionLoading}
                              className="px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Reject Stage 2
                            </button>
                            <button
                              onClick={() => handleStage2Decision('Manual Review')}
                              disabled={actionLoading}
                              className="px-3.5 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold transition-colors cursor-pointer"
                            >
                              Flag Committee
                            </button>
                            <button
                              onClick={() => handleStage2Decision('Approved')}
                              disabled={actionLoading}
                              className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
                            >
                              <Check className="w-4 h-4" />
                              <span>Approve Stage 2 (Release for Collection)</span>
                            </button>
                          </>
                        )}
                      </>
                    )}

                    {/* Ready for handover quick jump */}
                    {selectedClaim.status === 'Verified — Ready for Collection' && (
                      <button
                        onClick={() => {
                          setHandoverTargetClaim(selectedClaim);
                          setHandoverCodeInput(selectedClaim.handoverCode || '');
                          setSelectedClaim(null);
                          setActiveSubTab('handover');
                        }}
                        className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
                      >
                        <Award className="w-4 h-4" />
                        <span>Open Handover Desk</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 2: HANDOVER TERMINAL */}
      {activeSubTab === 'handover' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Handover List */}
          <div className="lg:col-span-6 space-y-4">
            <h2 className="text-sm font-bold text-slate-900">
              Verified Items Awaiting Campus Pickup ({readyHandoverCount})
            </h2>

            {readyHandoverCount === 0 ? (
              <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-500">
                No items currently awaiting desk handover. Complete Stage 1 & 2 verifications to queue items here.
              </div>
            ) : (
              claims
                .filter((c) => c.status === 'Verified — Ready for Collection')
                .map((c) => (
                  <div
                    key={c.id}
                    onClick={() => {
                      setHandoverTargetClaim(c);
                      setHandoverCodeInput(c.handoverCode || '');
                    }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer bg-white ${
                      handoverTargetClaim?.id === c.id
                        ? 'border-emerald-500 shadow-md ring-2 ring-emerald-100'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="text-[10px] font-bold text-emerald-700 uppercase">
                          {c.itemCategory}
                        </div>
                        <h3 className="font-bold text-slate-900 text-sm mt-0.5">{c.itemTitle}</h3>
                      </div>
                      <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-900 px-2 py-0.5 rounded-md">
                        PIN: {c.handoverCode}
                      </span>
                    </div>

                    <div className="text-xs text-slate-500 mt-2 space-y-0.5">
                      <div>Claimant: <strong className="text-slate-800">{c.claimantName}</strong></div>
                      <div>Pickup Point: {c.pickupLocation}</div>
                    </div>
                  </div>
                ))
            )}
          </div>

          {/* Handover Form */}
          <div className="lg:col-span-6 bg-white rounded-3xl border border-slate-200 p-6 sm:p-7 shadow-xs space-y-5">
            <div className="pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Award className="w-5 h-5 text-emerald-600" />
                <span>Authorized Physical Handover Terminal</span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Verify recipient student ID and claimant handover code before physically returning property.
              </p>
            </div>

            {actionSuccess && (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{actionSuccess}</span>
              </div>
            )}
            {actionError && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600" />
                <span>{actionError}</span>
              </div>
            )}

            {handoverTargetClaim ? (
              <form onSubmit={handleExecuteHandover} className="space-y-4">
                <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200 text-xs space-y-1">
                  <div className="font-bold text-emerald-900">
                    Handing over: {handoverTargetClaim.itemTitle}
                  </div>
                  <div className="text-slate-600">
                    Recipient Student: <strong>{handoverTargetClaim.claimantName}</strong> ({handoverTargetClaim.claimantEmail})
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Student Presented Handover Code / PIN <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={handoverCodeInput}
                    onChange={(e) => setHandoverCodeInput(e.target.value)}
                    placeholder="e.g. WF-8831"
                    className="w-full text-xs sm:text-sm font-mono p-3 rounded-xl border border-slate-200 focus:border-emerald-500 uppercase outline-none"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    The claimant presents this code from their "My Claims" dashboard.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Inspected Student/Staff ID Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientStudentIdInput}
                    onChange={(e) => setRecipientStudentIdInput(e.target.value)}
                    placeholder="e.g. CS-2024-8831 or Staff Badge ID"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Staff Custody Handover Notes
                  </label>
                  <input
                    type="text"
                    value={handoverNotesInput}
                    onChange={(e) => setHandoverNotesInput(e.target.value)}
                    placeholder="e.g. Student ID inspected, physical voucher signed at Desk B-14"
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>{actionLoading ? 'Processing Handover...' : 'Confirm Handover & Mark Returned'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center text-xs text-slate-400">
                Select a verified claim from the left list to confirm physical handover.
              </div>
            )}
          </div>
        </div>
      )}

      {/* SUB-TAB 3: ALL REPORTS & MODERATION */}
      {activeSubTab === 'catalog' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900">
              Campus Belongings Catalog ({items.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Title</th>
                  <th className="p-3.5">Category</th>
                  <th className="p-3.5">Location</th>
                  <th className="p-3.5">Reported By</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5">Reward</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {items.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="p-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.type === 'found' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3.5 font-bold text-slate-900">{item.title}</td>
                    <td className="p-3.5">{item.category}</td>
                    <td className="p-3.5">{item.generalLocation}</td>
                    <td className="p-3.5">{item.reportedBy.name}</td>
                    <td className="p-3.5">
                      <span className="font-semibold">{item.status}</span>
                    </td>
                    <td className="p-3.5">
                      {item.rewardAmount ? `$${item.rewardAmount} (${item.rewardStatus})` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUB-TAB 4: ABUSE REPORTS */}
      {activeSubTab === 'abuse' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-600" />
              <span>Flagged Abuse & Prank Listings</span>
            </h2>
            <span className="text-xs text-slate-500">Auto-flagging & Student Submissions</span>
          </div>

          {abuseReports.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No abuse reports currently logged. The system is clean.
            </div>
          ) : (
            <div className="space-y-3">
              {abuseReports.map((rep) => (
                <div key={rep.id} className="p-4 rounded-2xl bg-rose-50/50 border border-rose-200 text-xs space-y-2">
                  <div className="flex items-center justify-between font-bold text-rose-900">
                    <span>Target: {rep.targetTitle} ({rep.targetType})</span>
                    <span className="text-[10px] bg-rose-200 px-2 py-0.5 rounded">{rep.status}</span>
                  </div>
                  <p className="text-slate-700"><strong>Reason:</strong> {rep.reason}</p>
                  <div className="text-[11px] text-slate-400">
                    Reported by {rep.reportedBy.name} on {new Date(rep.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* SUB-TAB 5: IMMUTABLE AUDIT LEDGER */}
      {activeSubTab === 'audit' && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Immutable System Audit Ledger
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Every verification, reviewer decision, status change, and handover is permanently recorded.
              </p>
            </div>
          </div>

          <div className="divide-y divide-slate-100 text-xs">
            {auditLogs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-50 flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                <div className="flex-1 space-y-0.5">
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slate-800 font-medium">{log.details}</p>
                  <div className="text-[11px] text-slate-500">
                    Actor: <strong className="text-slate-700">{log.actorName}</strong> ({log.actorRole}) • Target: {log.targetType} #{log.targetId}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
