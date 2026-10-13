import React, { useState, useEffect } from 'react';
import { Item, ItemCategory } from '../types';
import { api } from '../services/api';
import {
  ShieldCheck,
  Search,
  PlusCircle,
  FileCheck2,
  CheckCircle2,
  Clock,
  Sparkles,
  MapPin,
  Tag,
  ArrowRight,
  EyeOff,
  UserCheck,
  Award,
  Layers,
  Smartphone,
  CreditCard,
  BookOpen,
  Coffee,
  Briefcase,
  Shirt,
  Key,
  HelpCircle,
  AlertCircle,
} from 'lucide-react';

interface HomeViewProps {
  setActiveTab: (tab: string) => void;
  onSelectItemForClaim: (item: Item) => void;
  onFilterCategory: (category: ItemCategory) => void;
  onQuickSearch: (query: string) => void;
}

const CATEGORIES: { label: ItemCategory; icon: any; countNote?: string }[] = [
  { label: 'Electronics', icon: Smartphone },
  { label: 'IDs & Cards', icon: CreditCard },
  { label: 'Stationery', icon: BookOpen },
  { label: 'Bottles & Cups', icon: Coffee },
  { label: 'Bags & Wallets', icon: Briefcase },
  { label: 'Accessories & Clothing', icon: Shirt },
  { label: 'Keys', icon: Key },
  { label: 'Other', icon: HelpCircle },
];

export const HomeView: React.FC<HomeViewProps> = ({
  setActiveTab,
  onSelectItemForClaim,
  onFilterCategory,
  onQuickSearch,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [recentItems, setRecentItems] = useState<Item[]>([]);
  const [stats, setStats] = useState({
    totalReports: 0,
    possibleMatches: 0,
    verifiedReturns: 0,
    pendingClaims: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHomeData = async () => {
      try {
        setLoading(true);
        const [itemsRes, claimsRes, matchesRes] = await Promise.all([
          api.getItems({ sort: 'newest' }),
          api.getClaims(),
          api.getMatches(),
        ]);

        const allItems = itemsRes.items;
        setRecentItems(allItems.slice(0, 6));

        const verifiedCount = allItems.filter((i) => i.status === 'Returned' || i.status === 'Verified').length;
        const pendingCount = claimsRes.claims.filter(
          (c) => c.status === 'Stage 1 Pending' || c.status === 'Stage 2 Pending'
        ).length;

        setStats({
          totalReports: allItems.length,
          possibleMatches: matchesRes.matches.length,
          verifiedReturns: verifiedCount,
          pendingClaims: pendingCount,
        });
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadHomeData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      onQuickSearch(searchQuery.trim());
      setActiveTab('browse');
    }
  };

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-8 pb-14 bg-gradient-to-b from-emerald-50/60 via-slate-50 to-white border-b border-slate-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-3xl mx-auto space-y-5">
            {/* Tagline Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-100/80 border border-emerald-300 text-emerald-900 text-xs font-bold shadow-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-700" />
              <span>Campus Security & Asset Recovery System</span>
              <span className="text-emerald-500">•</span>
              <span className="text-emerald-700 font-semibold">Dual Verification Verified</span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              Lost something on campus? <br />
              <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Recover it safely & privately.
              </span>
            </h1>

            {/* Subtext */}
            <p className="text-sm sm:text-base text-slate-600 leading-relaxed max-w-2xl mx-auto">
              Smart Campus Lost & Found protects your personal details. Public listings show only basic information, while our <strong className="text-slate-800">independent dual verification</strong> ensures items are returned solely to their genuine owners.
            </p>

            {/* Interactive Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="mt-6 flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto bg-white p-2 rounded-2xl shadow-lg border border-slate-200"
            >
              <div className="flex items-center gap-2.5 px-3 w-full text-slate-400">
                <Search className="w-5 h-5 text-emerald-600 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by item name, brand, location (e.g. 'Hydro Flask', 'Library')..."
                  className="w-full text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 outline-none bg-transparent"
                />
              </div>
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs sm:text-sm transition-colors cursor-pointer shrink-0 flex items-center justify-center gap-2"
              >
                <span>Search</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick Action CTA Buttons */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => setActiveTab('report-lost')}
                className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Report Lost Item</span>
              </button>

              <button
                onClick={() => setActiveTab('report-found')}
                className="px-5 py-2.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center gap-2 cursor-pointer"
              >
                <EyeOff className="w-4 h-4 text-emerald-600" />
                <span>Report Found Item (Privacy Vault)</span>
              </button>

              <button
                onClick={() => setActiveTab('matches')}
                className="px-4 py-2.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Sparkles className="w-4 h-4 text-purple-600" />
                <span>Smart Match Engine ({stats.possibleMatches})</span>
              </button>
            </div>
          </div>

          {/* Real-time Statistics Cards */}
          <div className="mt-12 grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                <Layers className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                  {stats.totalReports}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">Campus Reports</div>
                <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Live & Demo Records</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                  {stats.possibleMatches}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">Algorithmic Matches</div>
                <div className="text-[10px] text-purple-600 font-bold uppercase tracking-wider">Similarity Scored</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                  {stats.verifiedReturns}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">Verified Returns</div>
                <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">Handover Confirmed</div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 border border-slate-200/80 shadow-xs flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                  {stats.pendingClaims}
                </div>
                <div className="text-xs text-slate-500 font-medium mt-1">Pending Dual Reviews</div>
                <div className="text-[10px] text-amber-600 font-bold uppercase tracking-wider">Stage 1 & 2 Queue</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The 4-Step Dual Verification Process Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>How Safe Recovery Works</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Independent Dual Verification Protocol
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 mt-2">
            Designed to guarantee that items are returned strictly to rightful owners with zero leak of private characteristics.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Step 1 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative group hover:border-emerald-300 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 font-black text-sm flex items-center justify-center mb-4 border border-emerald-200">
              01
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
              <EyeOff className="w-4 h-4 text-emerald-600" />
              <span>Public Basic Listing</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Finders post only basic information (e.g., "Black water bottle found in Library"). Secret marks and contents remain locked in the secure vault.
            </p>
          </div>

          {/* Step 2 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative group hover:border-blue-300 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 font-black text-sm flex items-center justify-center mb-4 border border-blue-200">
              02
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
              <UserCheck className="w-4 h-4 text-blue-600" />
              <span>Stage 1: Claimant Proof</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              The claimant signs in and describes distinguishing marks (stickers, serial quirks, exact contents). Reviewer 1 approves or rejects evidence.
            </p>
          </div>

          {/* Step 3 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative group hover:border-purple-300 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-700 font-black text-sm flex items-center justify-center mb-4 border border-purple-200">
              03
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Stage 2: Independent Review</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              A <em>different</em> authorized staff member independently inspects the physical item. The same reviewer cannot bypass secondary review.
            </p>
          </div>

          {/* Step 4 */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs relative group hover:border-amber-300 transition-all">
            <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 font-black text-sm flex items-center justify-center mb-4 border border-amber-200">
              04
            </div>
            <h3 className="font-bold text-slate-900 text-sm mb-1.5 flex items-center gap-1.5">
              <Award className="w-4 h-4 text-amber-600" />
              <span>Secure Desk Handover</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Both stages approve. Claimant brings student ID & unique Handover PIN to Student Center B-14. Staff records the handover and logs the audit trail.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Explore by Category</h2>
            <p className="text-xs text-slate-500">Filter lost and found items by campus belongings type</p>
          </div>
          <button
            onClick={() => setActiveTab('browse')}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  onFilterCategory(cat.label);
                  setActiveTab('browse');
                }}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-500 hover:shadow-md transition-all flex flex-col items-center text-center group cursor-pointer"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-100 group-hover:bg-emerald-50 text-slate-600 group-hover:text-emerald-600 flex items-center justify-center mb-2 transition-colors">
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {cat.label}
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Recently Reported Items */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
              <Clock className="w-3.5 h-3.5" />
              <span>Fresh Campus Activity</span>
            </div>
            <h2 className="text-xl font-black text-slate-900">Recently Reported Belongings</h2>
          </div>
          <button
            onClick={() => setActiveTab('browse')}
            className="text-xs font-bold text-slate-700 hover:text-emerald-700 flex items-center gap-1 cursor-pointer"
          >
            <span>Browse Full Database</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">Loading campus reports...</div>
        ) : recentItems.length === 0 ? (
          <div className="p-8 rounded-3xl bg-white border border-slate-200 text-center text-xs text-slate-500">
            No active reports yet. Be the first to report a lost or found belonging.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => {
              const isFound = item.type === 'found';
              return (
                <div
                  key={item.id}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col"
                >
                  {/* Image / Header Safe Media */}
                  <div className="h-44 relative bg-slate-100 overflow-hidden">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${
                          isFound
                            ? 'bg-emerald-600 text-white'
                            : 'bg-amber-500 text-white'
                        }`}
                      >
                        {item.type}
                      </span>
                      {item.isDemo && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
                          Demo Sample
                        </span>
                      )}
                    </div>

                    <div className="absolute top-3 right-3">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs ${
                          item.status === 'Returned'
                            ? 'bg-blue-600 text-white'
                            : item.status === 'Verified'
                            ? 'bg-purple-600 text-white'
                            : item.status === 'Claim In Progress'
                            ? 'bg-amber-600 text-white'
                            : 'bg-slate-900/80 text-white'
                        }`}
                      >
                        {item.status}
                      </span>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider mb-1">
                        <Tag className="w-3 h-3" />
                        <span>{item.category}</span>
                        {item.brand && (
                          <>
                            <span>•</span>
                            <span className="text-slate-500 font-semibold">{item.brand}</span>
                          </>
                        )}
                      </div>
                      <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {item.publicDescription}
                      </p>
                    </div>

                    <div className="space-y-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.generalLocation}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>Date: {item.date}</span>
                        </span>
                        {item.rewardAmount && item.rewardAmount > 0 ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Reward: ${item.rewardAmount}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="pt-2">
                      {isFound && item.status !== 'Returned' ? (
                        <button
                          onClick={() => onSelectItemForClaim(item)}
                          className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShieldCheck className="w-4 h-4" />
                          <span>Claim This Item (Dual Verification)</span>
                        </button>
                      ) : (
                        <button
                          onClick={() => setActiveTab('browse')}
                          className="w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                        >
                          View Details in Catalog
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* College Policy & Zero Ransom Charter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900 text-white relative overflow-hidden border border-slate-800">
          <div className="max-w-3xl space-y-3 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold border border-emerald-500/30">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Campus Policy Code #804</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-bold tracking-tight">
              Ethical Student Return & Anti-Extortion Safeguards
            </h3>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Under university regulations, <strong>property recovery cannot be conditioned upon rewards or payments</strong>. Finders who assist in returning belongings receive official campus citizenship commendations. Any attempted demand for money or withholding of student belongings is strictly prohibited and subject to dean review.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
