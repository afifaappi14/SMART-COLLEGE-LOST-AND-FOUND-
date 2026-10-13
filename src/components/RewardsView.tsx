import React, { useState, useEffect } from 'react';
import { RewardRecord } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Coins,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertCircle,
  CreditCard,
  Lock,
  ArrowRight,
  Info,
  DollarSign,
  X,
  FileCheck2,
} from 'lucide-react';

interface RewardsViewProps {
  setActiveTab: (tab: string) => void;
}

export const RewardsView: React.FC<RewardsViewProps> = ({ setActiveTab }) => {
  const { currentUser } = useAuth();
  const [rewards, setRewards] = useState<RewardRecord[]>([]);
  const [loading, setLoading] = useState(true);

  // Demo Payment Checkout Modal
  const [payingReward, setPayingReward] = useState<RewardRecord | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'campus_pay'>('campus_pay');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccessRef, setPaymentSuccessRef] = useState<string | null>(null);

  const fetchRewards = async () => {
    try {
      setLoading(true);
      const res = await api.getRewards();
      setRewards(res.rewards);
    } catch (err) {
      console.error('Failed to load rewards:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRewards();
  }, [currentUser]);

  const handleExecuteDemoPay = async () => {
    if (!payingReward) return;
    try {
      setProcessingPayment(true);
      const res = await api.payDemoReward(payingReward.id);

      try {
        confetti({
          particleCount: 80,
          spread: 60,
          origin: { y: 0.7 },
        });
      } catch (e) {}

      setPaymentSuccessRef(res.reward.transactionRef);
      await fetchRewards();
    } catch (err) {
      console.error('Failed to pay demo reward:', err);
    } finally {
      setProcessingPayment(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Coins className="w-3.5 h-3.5" />
            <span>Voluntary Gratitude & Rewards</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Campus Recognition & Rewards
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Gratitude tokens offered by item owners to thank honest finders. Under campus policy, rewards are strictly voluntary and never required for property recovery.
          </p>
        </div>

        <button
          onClick={() => setActiveTab('browse')}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
        >
          Browse Catalog
        </button>
      </div>

      {/* Campus Policy Code #804 Notice */}
      <div className="p-4 rounded-2xl bg-slate-900 text-white text-xs flex items-start gap-3 border border-slate-800">
        <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-emerald-400">Strict Anti-Extortion & Free Recovery Policy:</strong>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            All lost and found services, search tools, claims, and verified desk handovers are <strong>100% free</strong>. Finders may never condition the return of student property on payment. Any reward offered is purely an optional post-return token of gratitude.
          </p>
        </div>
      </div>

      {/* Rewards List */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading reward transactions...</div>
      ) : rewards.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 mx-auto flex items-center justify-center">
            <Coins className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No reward records active</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            When an item owner offers a voluntary reward and a verified return is confirmed at the desk, reward settlements appear here.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((rew) => {
            const isPayer = rew.payerId === currentUser?.id;
            const isPayee = rew.payeeId === currentUser?.id;

            return (
              <div
                key={rew.id}
                className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-slate-900">
                      ${rew.amount}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        rew.status === 'Paid'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {rew.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {rew.itemTitle}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Offered by: <strong>{rew.payerName}</strong> → Finder: <strong>{rew.payeeName}</strong>
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 space-y-1">
                    <div>Ref: <span className="font-mono">{rew.transactionRef}</span></div>
                    {rew.isDemo && (
                      <div className="text-emerald-700 font-semibold">
                        • Verified Demo Mode Gateway (No real money transferred)
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div>
                  {rew.status !== 'Paid' && isPayer ? (
                    <button
                      onClick={() => {
                        setPayingReward(rew);
                        setPaymentSuccessRef(null);
                      }}
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Fulfill Gratitude Reward (Demo Flow)</span>
                    </button>
                  ) : rew.status === 'Paid' ? (
                    <div className="text-center text-xs font-semibold text-emerald-700 bg-emerald-50 py-2 rounded-xl border border-emerald-100 flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Voluntary Reward Settled</span>
                    </div>
                  ) : (
                    <div className="text-center text-xs text-slate-400 py-2">
                      Awaiting fulfillment by owner
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DEMO PAYMENT MODAL */}
      {payingReward && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setPayingReward(null)}
              className="absolute top-5 right-5 p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-bold mb-2">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Certified Demo Payment Simulator</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                Fulfill Voluntary Reward
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                For "{payingReward.itemTitle}" to finder {payingReward.payeeName}.
              </p>
            </div>

            {paymentSuccessRef ? (
              <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto animate-bounce" />
                <h3 className="font-bold text-slate-900 text-sm">
                  Simulated Transaction Confirmed!
                </h3>
                <p className="text-xs text-slate-600">
                  Transaction Reference: <strong className="font-mono">{paymentSuccessRef}</strong>
                </p>
                <div className="text-[11px] text-emerald-700">
                  Notice: This was a simulated demo payment. No real credit card or bank money was charged.
                </div>
                <button
                  onClick={() => setPayingReward(null)}
                  className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
                >
                  Close Receipt
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Amount display */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-bold uppercase">Reward Amount</span>
                  <span className="text-2xl font-black text-emerald-700">${payingReward.amount}.00</span>
                </div>

                {/* Simulated Payment Method Selection */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold text-slate-800">
                    Select Simulated Payment Option
                  </label>
                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('campus_pay')}
                      className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                        paymentMethod === 'campus_pay'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Campus Pay
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                        paymentMethod === 'card'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Test Card
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('upi')}
                      className={`p-3 rounded-xl border text-center font-bold cursor-pointer transition-all ${
                        paymentMethod === 'upi'
                          ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                          : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      Demo UPI
                    </button>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                  <strong>Explicit Demo Notice:</strong> This platform does not store card numbers, UPI PINs, or bank credentials. Simulated payments verify workflow compliance without financial risk.
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setPayingReward(null)}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleExecuteDemoPay}
                    disabled={processingPayment}
                    className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer disabled:opacity-50"
                  >
                    {processingPayment ? 'Simulating Processing...' : `Confirm $${payingReward.amount} Reward`}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
