export type UserRole = 'student' | 'finder' | 'staff' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  department: string;
  studentId?: string;
  avatarUrl?: string;
  title?: string;
}

export type ItemType = 'lost' | 'found';

export type ItemCategory =
  | 'Electronics'
  | 'IDs & Cards'
  | 'Stationery'
  | 'Bottles & Cups'
  | 'Bags & Wallets'
  | 'Accessories & Clothing'
  | 'Keys'
  | 'Other';

export type ItemStatus =
  | 'Reported'
  | 'Claim In Progress'
  | 'Verified'
  | 'Returned'
  | 'Closed';

export interface PrivateVerificationDetails {
  uniqueFeatures: string;
  distinguishingMarks: string;
  contentsOrAccessories: string;
  serialOrModelDetails?: string;
  staffInspectionNotes?: string;
  secretVerificationCriteria?: string;
}

export interface PrivateContactInfo {
  email: string;
  phone?: string;
  preferredContactMethod?: string;
}

export interface Item {
  id: string;
  type: ItemType;
  title: string;
  category: ItemCategory;
  brand?: string;
  color?: string;
  publicDescription: string;
  generalLocation: string;
  date: string;
  timeApprox?: string;
  imageUrl?: string;
  status: ItemStatus;
  reportedBy: {
    id: string;
    name: string;
    role: UserRole;
    email?: string;
  };
  rewardAmount?: number;
  rewardStatus?: 'None' | 'Offered' | 'Accepted' | 'Pending' | 'Paid' | 'Cancelled';
  finderAcceptsReward?: boolean;
  createdAt: string;
  isDemo?: boolean;
  // Private fields only served to authorized users
  privateContact?: PrivateContactInfo;
  privateVerificationDetails?: PrivateVerificationDetails;
}

export type ClaimStatus =
  | 'Claim Submitted'
  | 'Stage 1 Pending'
  | 'Stage 1 Approved'
  | 'Stage 1 Rejected'
  | 'Stage 2 Pending'
  | 'Stage 2 Approved'
  | 'Verification Rejected'
  | 'Under Manual Review'
  | 'Verified — Ready for Collection'
  | 'Handover Confirmed'
  | 'Returned';

export interface ClaimantEvidence {
  distinguishingMarks: string;
  contentsDescription: string;
  approximateDateLost: string;
  exactLocationLost: string;
  additionalProof?: string;
  supportingDocUrl?: string;
}

export interface VerificationStageRecord {
  reviewerId: string;
  reviewerName: string;
  reviewerRole: string;
  decision: 'Approved' | 'Rejected' | 'Manual Review';
  timestamp: string;
  notes: string;
}

export interface HandoverRecord {
  staffId: string;
  staffName: string;
  recipientName: string;
  recipientStudentId: string;
  timestamp: string;
  handoverLocation: string;
  handoverCodeUsed: string;
  notes: string;
}

export interface Claim {
  id: string;
  itemId: string;
  itemTitle: string;
  itemCategory: ItemCategory;
  itemLocation: string;
  itemDate: string;
  itemImageUrl?: string;
  claimantId: string;
  claimantName: string;
  claimantEmail: string;
  claimantRole: UserRole;
  status: ClaimStatus;
  submittedAt: string;
  updatedAt: string;
  claimantEvidence: ClaimantEvidence;
  stage1Review?: VerificationStageRecord;
  stage2Review?: VerificationStageRecord;
  handoverRecord?: HandoverRecord;
  handoverCode?: string;
  pickupLocation?: string;
  pickupHours?: string;
  manualReviewReason?: string;
  rejectionReasonSafe?: string;
  isDemo?: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'claim_update' | 'match_found' | 'stage_approval' | 'collection_ready' | 'handover_done' | 'reward_update' | 'system';
  linkTab?: string;
  linkId?: string;
  read: boolean;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  actorId: string;
  actorName: string;
  actorRole: string;
  targetType: 'item' | 'claim' | 'handover' | 'reward' | 'abuse_report' | 'auth';
  targetId: string;
  details: string;
  ipHash?: string;
}

export interface AbuseReport {
  id: string;
  reportedBy: {
    id: string;
    name: string;
  };
  targetType: 'item' | 'claim';
  targetId: string;
  targetTitle: string;
  reason: string;
  status: 'Pending' | 'Reviewed' | 'Dismissed';
  createdAt: string;
  resolutionNotes?: string;
}

export interface MatchScoreResult {
  lostItem: Item;
  foundItem: Item;
  score: number;
  factors: {
    categoryMatch: boolean;
    nameSimilarity: number;
    colorMatch: boolean;
    brandMatch: boolean;
    locationMatch: boolean;
    dateProximity: boolean;
  };
  explanation: string;
}

export interface RewardRecord {
  id: string;
  claimId: string;
  itemId: string;
  itemTitle: string;
  amount: number;
  payerId: string;
  payerName: string;
  payeeId: string;
  payeeName: string;
  status: 'Offered' | 'Accepted' | 'Pending' | 'Paid' | 'Cancelled';
  isDemo: boolean;
  transactionRef: string;
  createdAt: string;
  paidAt?: string;
  notes?: string;
}
