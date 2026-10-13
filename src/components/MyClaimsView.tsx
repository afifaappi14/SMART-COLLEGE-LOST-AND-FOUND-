import React, { useState, useEffect } from 'react';
import { Claim } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  MapPin,
  Lock,
  Sparkles,
  QrCode,
  Calendar,
  UserCheck,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';

interface MyClaimsViewProps {
  setActiveTab: (tab: string) => void;
  onOpenAbuseModal: (claim: any) => void;
}

export const MyClaimsView: React.FC<MyClaimsViewProps> = ({ setActiveTab }) => {
  const { currentUser, switchUser } = useAuth();
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await api.getClaims();
      setClaims(res.claims);
      if (res.claims.length > 0 && !selectedClaim) {
        setSelectedClaim(res.claims[0]);
      } else if (selectedClaim) {
        // update selected
        const updated = res.claims.find((c) => c.id === selectedClaim.id);
        if (updated) setSelectedClaim(updated);
      }
    } catch (err) {
      console.error('Failed to load claims:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, [currentUser]);

  const getStatusBadge = (status: Claim['status']) => {
    switch (status) {
      case 'Stage 1 Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800">Stage 1 Review Pending</span>;
      case 'Stage 2 Pending':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800">Stage 2 Independent Review Pending</span>;
      case 'Verified — Ready for Collection':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 animate-pulse">Ready for Desk Pickup</span>;
      case 'Handover Confirmed':
      case 'Returned':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Item Returned to Owner</span>;
      case 'Stage 1 Rejected':
      case 'Verification Rejected':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800">Verification Rejected</span>;
      case 'Under Manual Review':
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-orange-100 text-orange-800">Under Committee Review</span>;
      default:
        return <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-800">{status}</span>;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Dual Verification Tracking</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            My Ownership Claims
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Track your submitted claims through Stage 1 claimant verification and Stage 2 independent staff inspection.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchClaims}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Claims"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('browse')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Find & Claim Items
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading claims record...</div>
      ) : claims.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <FileText className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No active ownership claims yet</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            You haven't submitted any ownership claims under <strong className="text-slate-800">{currentUser?.name}</strong>. Browse found campus items to file a claim.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setActiveTab('browse')}
              className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
            >
              Browse Found Belongings
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Claims Sidebar List */}
          <div className="lg:col-span-5 space-y-3">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
              Active Claim Records ({claims.length})
            </h2>

            {claims.map((claim) => {
              const isSelected = selectedClaim?.id === claim.id;
              return (
                <div
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer text-left ${
                    isSelected
                      ? 'bg-white border-emerald-500 shadow-md ring-2 ring-emerald-100'
                      : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                      {claim.itemCategory}
                    </span>
                    {getStatusBadge(claim.status)}
                  </div>

                  <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                    {claim.itemTitle}
                  </h3>

                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{claim.itemLocation}</span>
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
                    <span>Submitted: {new Date(claim.submittedAt).toLocaleDateString()}</span>
                    {claim.handoverCode && claim.status === 'Verified — Ready for Collection' && (
                      <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        PIN: {claim.handoverCode}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Claim Detail & Verification Workflow Journey */}
          {selectedClaim && (
            <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 sm:p-8 space-y-6">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-slate-100">
                <div>
                  <div className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Claim Ref: {selectedClaim.id}
                  </div>
                  <h2 className="text-xl font-black text-slate-900 mt-0.5">
                    {selectedClaim.itemTitle}
                  </h2>
                  <div className="text-xs text-slate-500 mt-1 flex items-center gap-2">
                    <span>Category: {selectedClaim.itemCategory}</span>
                    <span>•</span>
                    <span>Found in: {selectedClaim.itemLocation}</span>
                  </div>
                </div>
                <div>{getStatusBadge(selectedClaim.status)}</div>
              </div>

              {/* Ready for Collection Banner (When both stages pass) */}
              {selectedClaim.status === 'Verified — Ready for Collection' && (
                <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-900 to-teal-950 text-white space-y-3 shadow-lg">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-emerald-400 animate-bounce" />
                    <h3 className="font-bold text-sm tracking-tight text-white">
                      Ownership Verified! Ready for Campus Collection
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-white/10 p-3 rounded-xl backdrop-blur-xs">
                    <div>
                      <div className="text-emerald-300 font-semibold text-[11px]">Collection Point</div>
                      <div className="font-bold text-white mt-0.5">{selectedClaim.pickupLocation}</div>
                    </div>
                    <div>
                      <div className="text-emerald-300 font-semibold text-[11px]">Desk Operating Hours</div>
                      <div className="font-bold text-white mt-0.5">{selectedClaim.pickupHours}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-white text-slate-900 rounded-xl flex items-center justify-between">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-slate-400">
                        Authorized Handover Verification PIN
                      </div>
                      <div className="text-lg font-black tracking-widest text-emerald-700">
                        {selectedClaim.handoverCode}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-slate-500">
                      <div>Required at Desk:</div>
                      <strong className="text-slate-800">Student ID Card + This PIN</strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Returned Banner */}
              {selectedClaim.status === 'Returned' && selectedClaim.handoverRecord && (
                <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs space-y-2">
                  <div className="flex items-center gap-2 font-bold text-blue-800">
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span>Physical Handover Officially Confirmed</span>
                  </div>
                  <div className="text-xs text-blue-700 space-y-1">
                    <div>
                      <strong>Handed over by:</strong> {selectedClaim.handoverRecord.staffName}
                    </div>
                    <div>
                      <strong>Recipient ID:</strong> {selectedClaim.handoverRecord.recipientStudentId}
                    </div>
                    <div>
                      <strong>Timestamp:</strong> {new Date(selectedClaim.handoverRecord.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
              )}

              {/* The 4-Stage Progress Tracker */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Verification Lifecycle & Audit Progression
                </h3>

                <div className="space-y-3 text-xs">
                  {/* Step 1: Claim Submission */}
                  <div className="p-3.5 rounded-2xl border border-slate-200 bg-slate-50 flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">1. Claim Submitted to Vault</strong>
                        <span className="text-[11px] text-slate-400">
                          {new Date(selectedClaim.submittedAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-slate-600 text-[11px] mt-0.5">
                        Your private evidence and distinguishing features were sealed for staff review.
                      </p>
                    </div>
                  </div>

                  {/* Step 2: Stage 1 Claimant Verification */}
                  <div
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      selectedClaim.stage1Review?.decision === 'Approved'
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : selectedClaim.status === 'Stage 1 Rejected'
                        ? 'border-rose-200 bg-rose-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {selectedClaim.stage1Review?.decision === 'Approved' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : selectedClaim.status === 'Stage 1 Rejected' ? (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : (
                      <Clock className="w-5 h-5 text-amber-500 shrink-0 mt-0.5 animate-spin" />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">
                          2. Stage 1: Claimant Ownership Verification
                        </strong>
                        <span className="text-[11px] font-bold text-slate-600">
                          {selectedClaim.stage1Review?.decision || 'In Review'}
                        </span>
                      </div>

                      {selectedClaim.stage1Review ? (
                        <div className="mt-1 text-[11px] text-slate-700">
                          <div>
                            <strong>Reviewer:</strong> {selectedClaim.stage1Review.reviewerName} (
                            {selectedClaim.stage1Review.reviewerRole})
                          </div>
                          <div className="text-slate-600 mt-0.5 italic">
                            "{selectedClaim.stage1Review.notes}"
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          Authorized staff reviewer checks your distinguishing features against private vault details.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 3: Stage 2 Independent Review */}
                  <div
                    className={`p-3.5 rounded-2xl border transition-all flex items-start gap-3 ${
                      selectedClaim.stage2Review?.decision === 'Approved'
                        ? 'border-emerald-200 bg-emerald-50/60'
                        : selectedClaim.status === 'Verification Rejected'
                        ? 'border-rose-200 bg-rose-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {selectedClaim.stage2Review?.decision === 'Approved' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                    ) : selectedClaim.status === 'Verification Rejected' ? (
                      <XCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    ) : selectedClaim.status === 'Stage 2 Pending' ? (
                      <Clock className="w-5 h-5 text-purple-600 shrink-0 mt-0.5 animate-pulse" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <strong className="text-slate-900 font-bold">
                          3. Stage 2: Independent Staff Physical Inspection
                        </strong>
                        <span className="text-[11px] font-bold text-slate-600">
                          {selectedClaim.stage2Review?.decision || (selectedClaim.status === 'Stage 2 Pending' ? 'Awaiting 2nd Reviewer' : 'Locked')}
                        </span>
                      </div>

                      {selectedClaim.stage2Review ? (
                        <div className="mt-1 text-[11px] text-slate-700">
                          <div>
                            <strong>Independent Reviewer:</strong> {selectedClaim.stage2Review.reviewerName} (
                            {selectedClaim.stage2Review.reviewerRole})
                          </div>
                          <div className="text-slate-600 mt-0.5 italic">
                            "{selectedClaim.stage2Review.notes}"
                          </div>
                        </div>
                      ) : (
                        <p className="text-slate-500 text-[11px] mt-0.5">
                          A <em>distinct</em> second reviewer inspects the physical item. Unlocks only after Stage 1 passes.
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Step 4: Secure Handover & Return */}
                  <div
                    className={`p-3.5 rounded-2xl border flex items-start gap-3 ${
                      selectedClaim.status === 'Returned'
                        ? 'border-blue-200 bg-blue-50/50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    {selectedClaim.status === 'Returned' ? (
                      <CheckCircle2 className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                    ) : (
                      <Lock className="w-5 h-5 text-slate-400 shrink-0 mt-0.5" />
                    )}

                    <div className="flex-1">
                      <strong className="text-slate-900 font-bold">
                        4. Physical Handover at Campus Desk
                      </strong>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Item physically returned to owner with recorded Student ID check and handover PIN voucher.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Claimant's Submitted Evidence Preview */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5" />
                  <span>Your Submitted Evidence</span>
                </div>
                <div className="text-xs space-y-1.5 text-slate-600">
                  <div>
                    <strong className="text-slate-800">Distinguishing marks:</strong>{' '}
                    {selectedClaim.claimantEvidence.distinguishingMarks}
                  </div>
                  <div>
                    <strong className="text-slate-800">Contents / details:</strong>{' '}
                    {selectedClaim.claimantEvidence.contentsDescription}
                  </div>
                  <div>
                    <strong className="text-slate-800">Lost location:</strong>{' '}
                    {selectedClaim.claimantEvidence.exactLocationLost}
                  </div>
                </div>
              </div>

              {/* Demo Helper: Switch to Staff to test review! */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 text-xs text-purple-900 flex items-center justify-between">
                <div>
                  <div className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-purple-600" />
                    <span>Demo Workflow Shortcut</span>
                  </div>
                  <p className="text-[11px] text-purple-700 mt-0.5">
                    Switch to Reviewer 1 (Marcus Chen) or Reviewer 2 (Sarah Jenkins) to review this claim right now!
                  </p>
                </div>
                <button
                  onClick={async () => {
                    await switchUser('user_staff_1');
                    setActiveTab('admin');
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs cursor-pointer shadow-xs shrink-0"
                >
                  Switch to Staff Desk
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
