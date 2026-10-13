import React, { useState } from 'react';
import { ItemCategory } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  PlusCircle,
  ShieldCheck,
  AlertCircle,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  DollarSign,
  MapPin,
  Calendar,
} from 'lucide-react';

interface ReportLostViewProps {
  setActiveTab: (tab: string) => void;
  onItemCreated: () => void;
}

const CATEGORIES: ItemCategory[] = [
  'Electronics',
  'IDs & Cards',
  'Stationery',
  'Bottles & Cups',
  'Bags & Wallets',
  'Accessories & Clothing',
  'Keys',
  'Other',
];

const COMMON_CAMPUS_LOCATIONS = [
  'Main College Library (1st Floor)',
  'Main College Library (2nd Floor Silent)',
  'Student Center (Hub Plaza)',
  'Student Center (Food Court)',
  'Engineering & Science Hall (Lab 304)',
  'Engineering & Science Hall (Lecture 1)',
  'Central Cafeteria (South Dining)',
  'Campus Sports Complex & Gym',
  'North Dormitories (Courtyard & Shuttle)',
  'Campus Shuttle Bus Transit Stop',
];

export const ReportLostView: React.FC<ReportLostViewProps> = ({
  setActiveTab,
  onItemCreated,
}) => {
  const { currentUser } = useAuth();
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Electronics');
  const [brand, setBrand] = useState('');
  const [color, setColor] = useState('');
  const [publicDescription, setPublicDescription] = useState('');
  const [generalLocation, setGeneralLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeApprox, setTimeApprox] = useState('14:00');
  const [imageUrl, setImageUrl] = useState('');
  const [phone, setPhone] = useState('');
  const [rewardAmount, setRewardAmount] = useState('0');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !publicDescription.trim() || !generalLocation.trim() || !date) {
      setError('Please provide the item name, description, last-seen location, and date.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.createItem({
        type: 'lost',
        title: title.trim(),
        category,
        brand: brand.trim() || undefined,
        color: color.trim() || undefined,
        publicDescription: publicDescription.trim(),
        generalLocation: generalLocation.trim(),
        date,
        timeApprox: timeApprox || undefined,
        imageUrl: imageUrl.trim() || undefined,
        rewardAmount: Number(rewardAmount) || 0,
        privateContact: {
          email: currentUser?.email || 'student@campus.edu',
          phone: phone.trim() || undefined,
        },
      });

      setCreatedItemId(res.item.id);
      setSuccess(true);
      onItemCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to submit lost item report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setTitle('');
    setBrand('');
    setColor('');
    setPublicDescription('');
    setGeneralLocation('');
    setRewardAmount('0');
    setSuccess(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold mb-2 border border-amber-200">
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Lost Belonging Declaration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Report a Lost Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          Log what you lost. Our smart matching engine will immediately scan newly found campus items for potential matches.
        </p>
      </div>

      {success ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Report Successfully Logged!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-md mx-auto">
              Your lost item report has been safely added to the campus database. Your contact information is kept strictly private.
            </p>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveTab('matches')}
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-4 h-4" />
              <span>Check Instant Smart Matches</span>
            </button>
            <button
              onClick={() => setActiveTab('browse')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              Browse Catalog
            </button>
            <button
              onClick={handleResetForm}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Report Another Item
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Core Information Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>1. Item Details</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Item Name / Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Apple 67W USB-C Charger & Cable"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Category <span className="text-rose-500">*</span>
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as ItemCategory)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 bg-white font-medium text-slate-800 focus:border-emerald-500 outline-none cursor-pointer"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Brand / Manufacturer
                </label>
                <input
                  type="text"
                  value={brand}
                  onChange={(e) => setBrand(e.target.value)}
                  placeholder="e.g. Apple, Hydro Flask, Sony, Nike"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Primary Color
                </label>
                <input
                  type="text"
                  value={color}
                  onChange={(e) => setColor(e.target.value)}
                  placeholder="e.g. Matte Black, White, Navy Blue"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Description & Circumstances <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={publicDescription}
                onChange={(e) => setPublicDescription(e.target.value)}
                placeholder="Describe where and when you noticed it missing, general characteristics, etc."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>
          </div>

          {/* Location & Time Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              <span>2. Last-Seen Location & Date</span>
            </h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Campus Location <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={generalLocation}
                  onChange={(e) => setGeneralLocation(e.target.value)}
                  placeholder="e.g. Engineering & Science Hall (Lab 304, 3rd Floor)"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>

              {/* Suggestions chips */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                <span className="text-[11px] text-slate-400 self-center mr-1">Quick Select:</span>
                {COMMON_CAMPUS_LOCATIONS.slice(0, 5).map((loc) => (
                  <button
                    key={loc}
                    type="button"
                    onClick={() => setGeneralLocation(loc)}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    {loc.split('(')[0].trim()}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Date Lost <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-800 mb-1">
                    Approximate Time
                  </label>
                  <input
                    type="time"
                    value={timeApprox}
                    onChange={(e) => setTimeApprox(e.target.value)}
                    className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Optional Media, Voluntary Reward & Contact Privacy Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-purple-500"></span>
              <span>3. Optional Photo, Voluntary Reward & Privacy</span>
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Optional Photo URL
                </label>
                <input
                  type="url"
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://... (image link of item or similar model)"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Optional Voluntary Gratitude Reward ($ USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    min="0"
                    step="5"
                    value={rewardAmount}
                    onChange={(e) => setRewardAmount(e.target.value)}
                    placeholder="0"
                    className="w-full text-xs sm:text-sm pl-7 pr-3 py-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  100% voluntary token of appreciation. Never a condition for returning item.
                </p>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Private Contact Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 000-0000"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-600 flex items-start gap-2 mt-2">
                  <Lock className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    <strong>Strict Privacy Guarantee:</strong> Your phone number and email will never appear in public catalogs. Only authorized campus staff verifying your return can view your contact information.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={() => setActiveTab('browse')}
              className="px-5 py-3 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{submitting ? 'Submitting Report...' : 'Publish Lost Item Report'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
