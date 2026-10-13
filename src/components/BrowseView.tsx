import React, { useState, useEffect } from 'react';
import { Item, ItemCategory } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Search,
  Filter,
  ShieldCheck,
  MapPin,
  Calendar,
  Clock,
  Tag,
  ArrowUpDown,
  Lock,
  EyeOff,
  AlertTriangle,
  X,
  CheckCircle2,
  Share2,
  Flag,
} from 'lucide-react';

interface BrowseViewProps {
  initialCategory?: ItemCategory | 'All';
  initialSearch?: string;
  onOpenClaimModal: (item: Item) => void;
  onOpenAbuseModal: (item: Item) => void;
  setActiveTab: (tab: string) => void;
}

const CATEGORIES: (ItemCategory | 'All')[] = [
  'All',
  'Electronics',
  'IDs & Cards',
  'Stationery',
  'Bottles & Cups',
  'Bags & Wallets',
  'Accessories & Clothing',
  'Keys',
  'Other',
];

const CAMPUS_LOCATIONS = [
  'All',
  'Main College Library',
  'Student Center',
  'Central Cafeteria',
  'Engineering & Science Hall',
  'North Dormitories',
  'Sports Complex',
];

export const BrowseView: React.FC<BrowseViewProps> = ({
  initialCategory = 'All',
  initialSearch = '',
  onOpenClaimModal,
  onOpenAbuseModal,
  setActiveTab,
}) => {
  const { currentUser, isStaffOrAdmin } = useAuth();
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(initialSearch);
  const [typeFilter, setTypeFilter] = useState<'All' | 'lost' | 'found'>('All');
  const [categoryFilter, setCategoryFilter] = useState<ItemCategory | 'All'>(initialCategory);
  const [locationFilter, setLocationFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Detail Modal State
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await api.getItems({
        type: typeFilter === 'All' ? undefined : typeFilter,
        category: categoryFilter === 'All' ? undefined : categoryFilter,
        location: locationFilter === 'All' ? undefined : locationFilter,
        status: statusFilter === 'All' ? undefined : statusFilter,
        search: search.trim() || undefined,
        sort: sortBy,
      });
      setItems(res.items);
    } catch (err) {
      console.error('Failed to load items:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [typeFilter, categoryFilter, locationFilter, statusFilter, sortBy]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchItems();
  };

  const handleResetFilters = () => {
    setSearch('');
    setTypeFilter('All');
    setCategoryFilter('All');
    setLocationFilter('All');
    setStatusFilter('All');
    setSortBy('newest');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 space-y-6">
      {/* Top Banner & Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 uppercase tracking-wider mb-1">
            <Search className="w-3.5 h-3.5" />
            <span>Campus Catalog</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Browse Lost & Found Belongings
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Public records only show basic information. Identifying marks remain safely stored in our private vault.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('report-lost')}
            className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all cursor-pointer"
          >
            Report Lost
          </button>
          <button
            onClick={() => setActiveTab('report-found')}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
          >
            Report Found (Private Vault)
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        {/* Search input */}
        <form onSubmit={handleSearchSubmit} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by keywords, brand, color, or location..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
          >
            Apply Search
          </button>
        </form>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100 text-xs">
          {/* Type Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setTypeFilter('All')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                typeFilter === 'All' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Types
            </button>
            <button
              onClick={() => setTypeFilter('lost')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                typeFilter === 'lost' ? 'bg-white text-amber-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lost Only
            </button>
            <button
              onClick={() => setTypeFilter('found')}
              className={`px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer ${
                typeFilter === 'found' ? 'bg-white text-emerald-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Found Only
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as any)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none cursor-pointer"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                Category: {cat}
              </option>
            ))}
          </select>

          {/* Location Dropdown */}
          <select
            value={locationFilter}
            onChange={(e) => setLocationFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none cursor-pointer"
          >
            {CAMPUS_LOCATIONS.map((loc) => (
              <option key={loc} value={loc}>
                Location: {loc}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none cursor-pointer"
          >
            <option value="All">All Statuses</option>
            <option value="Reported">Reported</option>
            <option value="Claim In Progress">Claim In Progress</option>
            <option value="Verified">Verified</option>
            <option value="Returned">Returned</option>
          </select>

          {/* Sort By */}
          <div className="ml-auto flex items-center gap-1.5 text-slate-500">
            <ArrowUpDown className="w-3.5 h-3.5" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-2.5 py-1.5 rounded-xl border border-slate-200 bg-white font-medium text-slate-700 outline-none cursor-pointer"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
          </div>

          <button
            onClick={handleResetFilters}
            className="text-slate-500 hover:text-rose-600 font-semibold px-2 py-1 transition-colors cursor-pointer"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Item List / Grid */}
      {loading ? (
        <div className="p-16 text-center text-xs text-slate-400">Loading catalog reports...</div>
      ) : items.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white border border-slate-200 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
            <Filter className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm">No items found matching criteria</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Try resetting your search query or broadening your location and category filters.
          </p>
          <button
            onClick={handleResetFilters}
            className="px-4 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold cursor-pointer"
          >
            Reset All Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => {
            const isFound = item.type === 'found';
            const canClaim = isFound && item.status !== 'Returned' && item.reportedBy.id !== currentUser?.id;

            return (
              <div
                key={item.id}
                className="bg-white rounded-3xl border border-slate-200 shadow-xs hover:shadow-md hover:border-slate-300 transition-all overflow-hidden flex flex-col justify-between"
              >
                <div>
                  {/* Photo Header */}
                  <div className="h-48 relative bg-slate-100 overflow-hidden group">
                    <img
                      src={item.imageUrl}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex gap-1.5">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-xs ${
                          isFound ? 'bg-emerald-600 text-white' : 'bg-amber-500 text-white'
                        }`}
                      >
                        {item.type}
                      </span>
                      {item.isDemo && (
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-slate-900/80 text-white">
                          Sample
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

                    {isFound && (
                      <div className="absolute bottom-2 left-3 bg-slate-950/70 text-emerald-400 text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-xs">
                        <Lock className="w-3 h-3" />
                        <span>Private details protected</span>
                      </div>
                    )}
                  </div>

                  {/* Body Content */}
                  <div className="p-5 space-y-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                      <Tag className="w-3 h-3" />
                      <span>{item.category}</span>
                      {item.brand && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500 font-semibold">{item.brand}</span>
                        </>
                      )}
                      {item.color && (
                        <>
                          <span>•</span>
                          <span className="text-slate-500 font-semibold">{item.color}</span>
                        </>
                      )}
                    </div>

                    <h3 className="font-bold text-slate-900 text-base leading-snug line-clamp-1">
                      {item.title}
                    </h3>

                    <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                      {item.publicDescription}
                    </p>

                    <div className="space-y-1.5 pt-2 border-t border-slate-100 text-xs text-slate-500">
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate">{item.generalLocation}</span>
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{item.date}</span>
                        </span>
                        {item.rewardAmount && item.rewardAmount > 0 ? (
                          <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                            Reward: ${item.rewardAmount}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-5 pt-0 space-y-2">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedItem(item)}
                      className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold transition-colors cursor-pointer"
                    >
                      View Details
                    </button>

                    {canClaim ? (
                      <button
                        onClick={() => onOpenClaimModal(item)}
                        className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4" />
                        <span>Claim Item</span>
                      </button>
                    ) : null}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => onOpenAbuseModal(item)}
                      className="text-[11px] text-slate-400 hover:text-rose-600 flex items-center gap-1 transition-colors cursor-pointer"
                    >
                      <Flag className="w-3 h-3" />
                      <span>Report</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-xl w-full border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Image */}
            <div className="h-56 relative bg-slate-900 overflow-hidden">
              <img
                src={selectedItem.imageUrl}
                alt={selectedItem.title}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-4 right-4 p-2 rounded-full bg-slate-950/60 hover:bg-slate-950 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
              <div className="absolute bottom-4 left-4 flex gap-2">
                <span
                  className={`text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-xs ${
                    selectedItem.type === 'found' ? 'bg-emerald-600' : 'bg-amber-500'
                  }`}
                >
                  {selectedItem.type}
                </span>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-slate-900/80 text-white backdrop-blur-xs">
                  {selectedItem.status}
                </span>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto text-slate-800 text-xs sm:text-sm">
              <div>
                <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
                  {selectedItem.category}
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-0.5">
                  {selectedItem.title}
                </h2>
              </div>

              {/* Public Description */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Public Listing Description
                </div>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {selectedItem.publicDescription}
                </p>
              </div>

              {/* Attributes Grid */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Location</span>
                  <span className="font-semibold text-slate-800">{selectedItem.generalLocation}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Date Logged</span>
                  <span className="font-semibold text-slate-800">{selectedItem.date}</span>
                </div>
                {selectedItem.brand && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Brand</span>
                    <span className="font-semibold text-slate-800">{selectedItem.brand}</span>
                  </div>
                )}
                {selectedItem.color && (
                  <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="text-slate-400 block text-[10px] uppercase font-bold">Color</span>
                    <span className="font-semibold text-slate-800">{selectedItem.color}</span>
                  </div>
                )}
              </div>

              {/* Authorized Staff / Finder View for Private Clues */}
              {selectedItem.privateVerificationDetails ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 space-y-2">
                  <div className="flex items-center gap-1.5 font-bold text-xs text-emerald-800">
                    <Lock className="w-4 h-4 text-emerald-700" />
                    <span>Private Vault Verification Record (Staff & Author View)</span>
                  </div>
                  <div className="text-xs space-y-1">
                    <div>
                      <strong>Unique Features:</strong> {selectedItem.privateVerificationDetails.uniqueFeatures}
                    </div>
                    <div>
                      <strong>Distinguishing Marks:</strong> {selectedItem.privateVerificationDetails.distinguishingMarks}
                    </div>
                    <div>
                      <strong>Contents:</strong> {selectedItem.privateVerificationDetails.contentsOrAccessories}
                    </div>
                  </div>
                </div>
              ) : selectedItem.type === 'found' ? (
                <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <div>
                    <strong>Privacy Vault Active:</strong> Identifying features, scratches, and contents are concealed to prevent false claims. Claimants must provide them independently.
                  </div>
                </div>
              ) : null}

              {/* Reward info */}
              {selectedItem.rewardAmount && selectedItem.rewardAmount > 0 ? (
                <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold">Voluntary Owner Reward:</span> ${selectedItem.rewardAmount}
                    <div className="text-[10px] text-purple-700">Payable after verified physical return</div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-purple-200 text-purple-900 uppercase">
                    {selectedItem.rewardStatus}
                  </span>
                </div>
              ) : null}
            </div>

            {/* Modal Actions */}
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
              <button
                onClick={() => {
                  onOpenAbuseModal(selectedItem);
                  setSelectedItem(null);
                }}
                className="text-xs text-slate-500 hover:text-rose-600 flex items-center gap-1 cursor-pointer"
              >
                <Flag className="w-3.5 h-3.5" />
                <span>Flag Suspicious</span>
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedItem(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Close
                </button>
                {selectedItem.type === 'found' && selectedItem.status !== 'Returned' && selectedItem.reportedBy.id !== currentUser?.id && (
                  <button
                    onClick={() => {
                      onOpenClaimModal(selectedItem);
                      setSelectedItem(null);
                    }}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Claim This Belonging</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
