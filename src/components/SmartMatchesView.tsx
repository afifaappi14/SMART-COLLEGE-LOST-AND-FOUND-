import React, { useState, useEffect } from 'react';
import { MatchScoreResult, Item } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  ShieldCheck,
  MapPin,
  Calendar,
  Tag,
  ArrowRight,
  Info,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';

interface SmartMatchesViewProps {
  onOpenClaimModal: (item: Item) => void;
  setActiveTab: (tab: string) => void;
}

export const SmartMatchesView: React.FC<SmartMatchesViewProps> = ({
  onOpenClaimModal,
  setActiveTab,
}) => {
  const { currentUser } = useAuth();
  const [matches, setMatches] = useState<MatchScoreResult[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await api.getMatches();
      setMatches(res.matches);
    } catch (err) {
      console.error('Failed to load matches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [currentUser]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-purple-700 uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Algorithmic Matching Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Potential Item Matches
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
            Our multi-attribute matching algorithm cross-references reported lost items with found items on category, description keywords, brand, color, location, and dates.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchMatches}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer"
            title="Refresh Matches"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setActiveTab('report-lost')}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Report Another Lost Item
          </button>
        </div>
      </div>

      {/* Mandatory Disclaimer Box */}
      <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/80 text-amber-900 text-xs flex items-start gap-3">
        <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <strong className="font-bold text-amber-950">Important Verification Guardrail:</strong>
          <p className="text-[11px] leading-relaxed text-amber-900">
            A match confidence score is an automated discovery estimate based on public metadata. <strong>It does NOT prove legal or physical ownership</strong>, and it never bypasses Stage 1 or Stage 2 verification. You must still substantiate private identifying characteristics before release.
          </p>
        </div>
      </div>

      {/* Match Cards */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Computing attribute correlations...</div>
      ) : matches.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 mx-auto flex items-center justify-center">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No confident correlations found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            As more students and staff log lost and found belongings, potential matches will automatically appear here.
          </p>
          <button
            onClick={() => setActiveTab('browse')}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
          >
            Browse Full Catalog
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {matches.map((m, idx) => {
            const scoreColor =
              m.score >= 80
                ? 'bg-emerald-600 text-white'
                : m.score >= 60
                ? 'bg-purple-600 text-white'
                : 'bg-amber-500 text-white';

            return (
              <div
                key={`${m.lostItem.id}_${m.foundItem.id}_${idx}`}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md transition-all p-6 sm:p-7 space-y-5"
              >
                {/* Header with Match Confidence */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-xs font-black px-3 py-1.5 rounded-xl uppercase tracking-wider shadow-xs ${scoreColor}`}
                    >
                      {m.score}% Potential Match
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      Category: {m.lostItem.category}
                    </span>
                  </div>

                  <button
                    onClick={() => onOpenClaimModal(m.foundItem)}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer ml-auto"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Initiate Ownership Claim</span>
                  </button>
                </div>

                {/* Side-by-Side Comparison */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Lost Item */}
                  <div className="p-4 rounded-2xl bg-amber-50/40 border border-amber-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-500 text-white">
                        Reported Lost
                      </span>
                      <span className="text-[11px] text-slate-500">{m.lostItem.date}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {m.lostItem.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {m.lostItem.publicDescription}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{m.lostItem.generalLocation}</span>
                    </div>
                  </div>

                  {/* Found Item */}
                  <div className="p-4 rounded-2xl bg-emerald-50/40 border border-emerald-100 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        Reported Found
                      </span>
                      <span className="text-[11px] text-slate-500">{m.foundItem.date}</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug">
                      {m.foundItem.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {m.foundItem.publicDescription}
                    </p>

                    <div className="flex items-center gap-1.5 text-xs text-slate-500 pt-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="truncate">{m.foundItem.generalLocation}</span>
                    </div>
                  </div>
                </div>

                {/* Factors Breakdown */}
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2 text-xs">
                  <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Score Attribution Factors
                  </div>
                  <div className="flex flex-wrap gap-2 text-[11px]">
                    <span
                      className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 ${
                        m.factors.categoryMatch
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Same Category
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-lg font-semibold flex items-center gap-1 ${
                        m.factors.nameSimilarity > 0.3
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3" /> Keyword Similarity (
                      {Math.round(m.factors.nameSimilarity * 100)}%)
                    </span>
                    {m.factors.brandMatch && (
                      <span className="px-2.5 py-1 rounded-lg font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Brand Matched
                      </span>
                    )}
                    {m.factors.colorMatch && (
                      <span className="px-2.5 py-1 rounded-lg font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Color Matched
                      </span>
                    )}
                    {m.factors.locationMatch && (
                      <span className="px-2.5 py-1 rounded-lg font-semibold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> Nearby Campus Building
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
