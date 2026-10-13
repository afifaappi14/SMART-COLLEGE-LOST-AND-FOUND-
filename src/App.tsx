import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomeView } from './components/HomeView';
import { BrowseView } from './components/BrowseView';
import { ReportLostView } from './components/ReportLostView';
import { ReportFoundView } from './components/ReportFoundView';
import { MyClaimsView } from './components/MyClaimsView';
import { SmartMatchesView } from './components/SmartMatchesView';
import { AdminDashboard } from './components/AdminDashboard';
import { RewardsView } from './components/RewardsView';
import { NotificationsView } from './components/NotificationsView';
import { ClaimModal } from './components/ClaimModal';
import { AbuseReportModal } from './components/AbuseReportModal';
import { PrivacyPolicyModal } from './components/PrivacyPolicyModal';
import { Item, ItemCategory } from './types';

function MainApp() {
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<ItemCategory | 'All'>('All');
  const [searchFilter, setSearchFilter] = useState<string>('');

  // Modals
  const [claimTargetItem, setClaimTargetItem] = useState<Item | null>(null);
  const [abuseTarget, setAbuseTarget] = useState<{
    type: 'item' | 'claim';
    id: string;
    title: string;
  } | null>(null);
  const [privacyModalOpen, setPrivacyModalOpen] = useState<boolean>(false);

  // Triggered from Home category cards
  const handleFilterCategory = (category: ItemCategory) => {
    setSelectedCategoryFilter(category);
    setActiveTab('browse');
  };

  // Triggered from Home search bar
  const handleQuickSearch = (query: string) => {
    setSearchFilter(query);
    setActiveTab('browse');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-emerald-100 selection:text-emerald-900">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <HomeView
            setActiveTab={setActiveTab}
            onSelectItemForClaim={(item) => setClaimTargetItem(item)}
            onFilterCategory={handleFilterCategory}
            onQuickSearch={handleQuickSearch}
          />
        )}

        {activeTab === 'browse' && (
          <BrowseView
            initialCategory={selectedCategoryFilter}
            initialSearch={searchFilter}
            onOpenClaimModal={(item) => setClaimTargetItem(item)}
            onOpenAbuseModal={(item) =>
              setAbuseTarget({ type: 'item', id: item.id, title: item.title })
            }
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'report-lost' && (
          <ReportLostView
            setActiveTab={setActiveTab}
            onItemCreated={() => {}}
          />
        )}

        {activeTab === 'report-found' && (
          <ReportFoundView
            setActiveTab={setActiveTab}
            onItemCreated={() => {}}
          />
        )}

        {activeTab === 'claims' && (
          <MyClaimsView
            setActiveTab={setActiveTab}
            onOpenAbuseModal={(claim) =>
              setAbuseTarget({ type: 'claim', id: claim.id, title: claim.itemTitle })
            }
          />
        )}

        {activeTab === 'matches' && (
          <SmartMatchesView
            onOpenClaimModal={(item) => setClaimTargetItem(item)}
            setActiveTab={setActiveTab}
          />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard setActiveTab={setActiveTab} />
        )}

        {activeTab === 'rewards' && (
          <RewardsView setActiveTab={setActiveTab} />
        )}

        {activeTab === 'notifications' && (
          <NotificationsView setActiveTab={setActiveTab} />
        )}
      </main>

      {/* Footer */}
      <Footer
        onOpenPrivacyModal={() => setPrivacyModalOpen(true)}
        setActiveTab={setActiveTab}
      />

      {/* Claim Submission Modal */}
      <ClaimModal
        item={claimTargetItem}
        isOpen={Boolean(claimTargetItem)}
        onClose={() => setClaimTargetItem(null)}
        onClaimSuccess={() => {
          setActiveTab('claims');
        }}
      />

      {/* Abuse Report Modal */}
      {abuseTarget && (
        <AbuseReportModal
          isOpen={Boolean(abuseTarget)}
          onClose={() => setAbuseTarget(null)}
          targetType={abuseTarget.type}
          targetId={abuseTarget.id}
          targetTitle={abuseTarget.title}
        />
      )}

      {/* Privacy Policy Charter Modal */}
      <PrivacyPolicyModal
        isOpen={privacyModalOpen}
        onClose={() => setPrivacyModalOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
