import React, { useState } from 'react';
import { ItemCategory } from '../types';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  ShieldCheck,
  EyeOff,
  Lock,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  Sparkles,
  ArrowRight,
  MapPin,
  Calendar,
  Layers,
  Key,
} from 'lucide-react';

interface ReportFoundViewProps {
  setActiveTab: (tab: string) => void;
  onItemCreated: () => void;
}

const CATEGORIES: ItemCategory[] = [
  'Bottles & Cups',
  'Electronics',
  'IDs & Cards',
  'Stationery',
  'Bags & Wallets',
  'Accessories & Clothing',
  'Keys',
  'Other',
];

const COMMON_CAMPUS_LOCATIONS = [
  'Main College Library (1st Floor Reading Room)',
  'Main College Library (2nd Floor Silent Study)',
  'Student Center (Hub Plaza ATM & Lounge)',
  'Central Cafeteria (South Dining Booths)',
  'Engineering & Science Hall (Lab 304)',
  'Campus Sports Complex & Locker Room',
  'North Dormitories (Courtyard & Shuttle Stop)',
];

export const ReportFoundView: React.FC<ReportFoundViewProps> = ({
  setActiveTab,
  onItemCreated,
}) => {
  const { currentUser } = useAuth();

  // 1. Basic Public Description ONLY
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ItemCategory>('Bottles & Cups');
  const [generalLocation, setGeneralLocation] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeApprox, setTimeApprox] = useState('12:30');
  const [publicDescription, setPublicDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [finderAcceptsReward, setFinderAcceptsReward] = useState(true);

  // 2. Private Verification Vault (Never Public)
  const [uniqueFeatures, setUniqueFeatures] = useState('');
  const [distinguishingMarks, setDistinguishingMarks] = useState('');
  const [contentsOrAccessories, setContentsOrAccessories] = useState('');
  const [serialOrModelDetails, setSerialOrModelDetails] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!title.trim() || !publicDescription.trim() || !generalLocation.trim() || !date) {
      setError('Please provide the basic public item name, description, location, and date.');
      return;
    }

    if (!uniqueFeatures.trim() && !distinguishingMarks.trim() && !contentsOrAccessories.trim()) {
      setError('Please record at least one private verification detail in the secure vault so claimants can be tested.');
      return;
    }

    try {
      setSubmitting(true);
      await api.createItem({
        type: 'found',
        title: title.trim(),
        category,
        publicDescription: publicDescription.trim(),
        generalLocation: generalLocation.trim(),
        date,
        timeApprox: timeApprox || undefined,
        imageUrl: imageUrl.trim() || undefined,
        finderAcceptsReward,
        privateVerificationDetails: {
          uniqueFeatures: uniqueFeatures.trim() || 'Recorded by finder at submission',
          distinguishingMarks: distinguishingMarks.trim() || 'Recorded by finder at submission',
          contentsOrAccessories: contentsOrAccessories.trim() || 'None reported',
          serialOrModelDetails: serialOrModelDetails.trim() || undefined,
        },
      });

      setSuccess(true);
      onItemCreated();
    } catch (err: any) {
      setError(err.message || 'Failed to submit found item report.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setTitle('');
    setGeneralLocation('');
    setPublicDescription('');
    setImageUrl('');
    setUniqueFeatures('');
    setDistinguishingMarks('');
    setContentsOrAccessories('');
    setSerialOrModelDetails('');
    setSuccess(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      {/* Title */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-2 border border-emerald-300">
          <EyeOff className="w-3.5 h-3.5 text-emerald-700" />
          <span>Privacy-First Found Item Registration</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          Report a Found Item
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Help return belongings securely. Provide only a <strong>basic public description</strong>. Sensitive identifying marks are stored separately in our <strong>private verification vault</strong> to prevent false claims.
        </p>
      </div>

      {success ? (
        <div className="p-8 sm:p-12 rounded-3xl bg-white border border-slate-200 shadow-sm text-center space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-slate-900">
              Found Item Safely Vaulted!
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
              Your public listing is now visible with only basic information. Your private verification details have been encrypted into the secure staff review vault.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 max-w-md mx-auto text-xs text-left text-slate-600 space-y-1.5">
            <div className="flex items-center gap-2 font-bold text-slate-900">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Next Steps in Recovery:</span>
            </div>
            <div>• Please deposit physical property at Student Center Desk B-14 when convenient.</div>
            <div>• When a student files a claim, staff will cross-reference your vault notes.</div>
            <div>• You will receive notifications as verification proceeds.</div>
          </div>

          <div className="pt-4 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => setActiveTab('browse')}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer"
            >
              View Public Listing
            </button>
            <button
              onClick={handleReset}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              Report Another Found Belonging
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-8">
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* SECTION 1: PUBLIC BASIC DESCRIPTION ONLY */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                  <span>Section 1: Basic Public Information Only</span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  This minimal information will be visible to students in the campus search catalog.
                </p>
              </div>
              <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Publicly Visible
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Item Name / Generic Title <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Black Water Bottle, Blue Spiral Notebook, Wireless Earbuds"
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

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  General Location Found <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={generalLocation}
                  onChange={(e) => setGeneralLocation(e.target.value)}
                  placeholder="e.g. Main College Library near 2nd Floor study tables"
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
                />
                <div className="flex flex-wrap gap-1.5 pt-1.5">
                  <span className="text-[10px] text-slate-400 self-center">Presets:</span>
                  {COMMON_CAMPUS_LOCATIONS.slice(0, 4).map((loc) => (
                    <button
                      key={loc}
                      type="button"
                      onClick={() => setGeneralLocation(loc)}
                      className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                    >
                      {loc.split('(')[0].trim()}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-800 mb-1">
                  Date Found <span className="text-rose-500">*</span>
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
                  Approximate Time Found
                </label>
                <input
                  type="time"
                  value={timeApprox}
                  onChange={(e) => setTimeApprox(e.target.value)}
                  className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Short, Basic Public Description <span className="text-rose-500">*</span>
              </label>
              <p className="text-[11px] text-slate-500 mb-1.5">
                Keep this concise and generic. <strong>Do NOT mention stickers, unique scratches, contents, or serial numbers here.</strong>
              </p>
              <textarea
                required
                rows={2}
                value={publicDescription}
                onChange={(e) => setPublicDescription(e.target.value)}
                placeholder="e.g. Black water bottle found on a study table near the library 2nd floor quiet area."
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Optional Safe Photo URL (No Secret Clues Visible)
              </label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... (Only upload safe angle that does not reveal identifying stickers or serials)"
                className="w-full text-xs sm:text-sm p-3 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none"
              />
            </div>

            <div className="pt-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="acceptReward"
                checked={finderAcceptsReward}
                onChange={(e) => setFinderAcceptsReward(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="acceptReward" className="text-xs text-slate-700 font-medium cursor-pointer">
                I am open to receiving an optional voluntary student thank-you reward if offered (Never demanded).
              </label>
            </div>
          </div>

          {/* SECTION 2: PRIVATE VERIFICATION DETAILS VAULT (NEVER PUBLIC) */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-xl space-y-5 relative overflow-hidden">
            {/* Background accent badge */}
            <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Lock className="w-5 h-5 text-emerald-400" />
                  <h2 className="text-base font-bold text-white tracking-tight">
                    Section 2: Private Verification Details Vault
                  </h2>
                </div>
                <p className="text-xs text-slate-400">
                  Strictly confidential. These secrets will <strong>NEVER</strong> be displayed to claimants or in search results.
                </p>
              </div>
              <span className="text-[10px] font-black px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 uppercase tracking-wider">
                Staff Vault Only
              </span>
            </div>

            <div className="p-3.5 rounded-2xl bg-emerald-950/50 border border-emerald-800/60 text-xs text-emerald-200/90 leading-relaxed flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span>
                <strong>How Dual Verification Uses This:</strong> When a claimant files an ownership request, they will be challenged to independently describe these features. Reviewer 1 (Stage 1) checks their answers against this vault, and Reviewer 2 (Stage 2) inspects the physical item.
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  1. Unique Scratches, Marks, Stickers, or Keychains <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  rows={2}
                  value={distinguishingMarks}
                  onChange={(e) => setDistinguishingMarks(e.target.value)}
                  placeholder="e.g. Small yellow Pikachu sticker placed near the lid threading; dent on bottom edge..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-200 mb-1">
                  2. Distinctive Contents, Liquids, or Accessories
                </label>
                <textarea
                  rows={2}
                  value={contentsOrAccessories}
                  onChange={(e) => setContentsOrAccessories(e.target.value)}
                  placeholder="e.g. Wide mouth flex straw cap; had iced tea residue inside; yellow index cards inside back pocket..."
                  className="w-full text-xs p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 focus:ring-1 focus:ring-emerald-400 outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    3. Specific Physical / Material Features
                  </label>
                  <input
                    type="text"
                    value={uniqueFeatures}
                    onChange={(e) => setUniqueFeatures(e.target.value)}
                    placeholder="e.g. 32oz wide mouth, matte black stainless steel"
                    className="w-full text-xs p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-200 mb-1">
                    4. Serial, Model, or Engraving Clues
                  </label>
                  <input
                    type="text"
                    value={serialOrModelDetails}
                    onChange={(e) => setSerialOrModelDetails(e.target.value)}
                    placeholder="e.g. Batch code starting with W32-9, initials engraved 'AR'"
                    className="w-full text-xs p-3 rounded-xl bg-slate-800/80 border border-slate-700 text-white placeholder:text-slate-500 focus:border-emerald-400 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Submission Bar */}
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
              className="px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>{submitting ? 'Encrypting & Storing...' : 'Register Found Belonging to Vault'}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
};
