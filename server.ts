import express, { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import {
  INITIAL_USERS,
  INITIAL_ITEMS,
  INITIAL_CLAIMS,
  INITIAL_NOTIFICATIONS,
  INITIAL_AUDIT_LOGS,
  INITIAL_REWARDS,
} from './src/data/mockData';
import {
  Item,
  Claim,
  Notification,
  AuditLog,
  AbuseReport,
  RewardRecord,
  User,
  MatchScoreResult,
} from './src/types';

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// In-Memory Database Store (with reset capability)
let users: User[] = JSON.parse(JSON.stringify(INITIAL_USERS));
let items: Item[] = JSON.parse(JSON.stringify(INITIAL_ITEMS));
let claims: Claim[] = JSON.parse(JSON.stringify(INITIAL_CLAIMS));
let notifications: Notification[] = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
let auditLogs: AuditLog[] = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
let rewards: RewardRecord[] = JSON.parse(JSON.stringify(INITIAL_REWARDS));
let abuseReports: AbuseReport[] = [];

// Rate limiting map: userId -> timestamps of claims submitted
const claimRateLimitMap = new Map<string, number[]>();

// Helper: Get authenticated user from request header (defaults to student Alex Rivera if none provided)
function getRequestUser(req: Request): User {
  const userId = (req.headers['x-user-id'] as string) || 'user_student_1';
  const found = users.find((u) => u.id === userId);
  return found || users[0];
}

// Helper: Create an audit log entry
function logAudit(
  actor: User,
  action: string,
  targetType: AuditLog['targetType'],
  targetId: string,
  details: string
) {
  const log: AuditLog = {
    id: `audit_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    action,
    actorId: actor.id,
    actorName: actor.name,
    actorRole: actor.role,
    targetType,
    targetId,
    details,
  };
  auditLogs.unshift(log);
}

// Helper: Push notification
function sendNotification(
  userId: string,
  title: string,
  message: string,
  type: Notification['type'],
  linkTab?: string,
  linkId?: string
) {
  const notif: Notification = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    userId,
    title,
    message,
    type,
    linkTab,
    linkId,
    read: false,
    createdAt: new Date().toISOString(),
  };
  notifications.unshift(notif);
}

// Helper: Strip private details from item unless user is staff, admin, or the item creator
function sanitizeItemForUser(item: Item, user: User): Item {
  const isAuthorized =
    user.role === 'staff' ||
    user.role === 'admin' ||
    (item.reportedBy && item.reportedBy.id === user.id);

  if (isAuthorized) {
    return item;
  }

  // Create clean public item representation without leaking private verification clues or contact info
  const sanitized: Item = { ...item };
  delete sanitized.privateVerificationDetails;
  delete sanitized.privateContact;
  return sanitized;
}

// ==========================================
// API ROUTES
// ==========================================

// 1. Auth & Personas
app.get('/api/auth/me', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  res.json({ user });
});

app.get('/api/auth/users', (_req: Request, res: Response) => {
  res.json({ users });
});

// 2. Items
app.get('/api/items', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { type, category, status, search, location, sort } = req.query;

  let filtered = [...items];

  if (type && typeof type === 'string') {
    filtered = filtered.filter((i) => i.type === type);
  }

  if (category && typeof category === 'string' && category !== 'All') {
    filtered = filtered.filter((i) => i.category === category);
  }

  if (status && typeof status === 'string' && status !== 'All') {
    filtered = filtered.filter((i) => i.status === status);
  }

  if (location && typeof location === 'string' && location !== 'All') {
    filtered = filtered.filter((i) =>
      i.generalLocation.toLowerCase().includes(location.toLowerCase())
    );
  }

  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (i) =>
        i.title.toLowerCase().includes(q) ||
        i.publicDescription.toLowerCase().includes(q) ||
        (i.brand && i.brand.toLowerCase().includes(q)) ||
        (i.color && i.color.toLowerCase().includes(q)) ||
        i.generalLocation.toLowerCase().includes(q)
    );
  }

  if (sort === 'oldest') {
    filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } else {
    // Default newest
    filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  // Sanitize every item according to caller privileges
  const sanitizedList = filtered.map((item) => sanitizeItemForUser(item, user));
  res.json({ items: sanitizedList, total: sanitizedList.length });
});

app.get('/api/items/:id', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const item = items.find((i) => i.id === req.params.id);

  if (!item) {
    return res.status(404).json({ error: 'Item not found' });
  }

  res.json({ item: sanitizeItemForUser(item, user) });
});

app.post('/api/items', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const {
    type,
    title,
    category,
    brand,
    color,
    publicDescription,
    generalLocation,
    date,
    timeApprox,
    imageUrl,
    rewardAmount,
    finderAcceptsReward,
    privateContact,
    privateVerificationDetails,
  } = req.body;

  // Validation
  if (!type || !title || !category || !publicDescription || !generalLocation || !date) {
    return res.status(400).json({
      error: 'Please complete all required fields: title, category, description, location, and date.',
    });
  }

  if (type !== 'lost' && type !== 'found') {
    return res.status(400).json({ error: 'Invalid item type.' });
  }

  const newItem: Item = {
    id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    type,
    title: title.trim(),
    category,
    brand: brand?.trim() || undefined,
    color: color?.trim() || undefined,
    publicDescription: publicDescription.trim(),
    generalLocation: generalLocation.trim(),
    date,
    timeApprox: timeApprox || undefined,
    imageUrl:
      imageUrl ||
      (category === 'Electronics'
        ? 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=600&auto=format&fit=crop&q=80'
        : category === 'IDs & Cards'
        ? 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80'
        : category === 'Bottles & Cups'
        ? 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80'
        : 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80'),
    status: 'Reported',
    reportedBy: {
      id: user.id,
      name: user.name,
      role: user.role,
      email: user.email,
    },
    rewardAmount: type === 'lost' && Number(rewardAmount) > 0 ? Number(rewardAmount) : 0,
    rewardStatus: type === 'lost' && Number(rewardAmount) > 0 ? 'Offered' : 'None',
    finderAcceptsReward: type === 'found' ? Boolean(finderAcceptsReward) : undefined,
    createdAt: new Date().toISOString(),
    isDemo: false,
    privateContact: privateContact || { email: user.email },
    privateVerificationDetails:
      type === 'found' && privateVerificationDetails
        ? {
            uniqueFeatures: privateVerificationDetails.uniqueFeatures?.trim() || 'Recorded by finder',
            distinguishingMarks: privateVerificationDetails.distinguishingMarks?.trim() || 'Recorded by finder',
            contentsOrAccessories: privateVerificationDetails.contentsOrAccessories?.trim() || 'None reported',
            serialOrModelDetails: privateVerificationDetails.serialOrModelDetails?.trim() || undefined,
            staffInspectionNotes: privateVerificationDetails.staffInspectionNotes?.trim() || undefined,
          }
        : undefined,
  };

  items.unshift(newItem);

  logAudit(
    user,
    type === 'found' ? 'FOUND_ITEM_REPORTED' : 'LOST_ITEM_REPORTED',
    'item',
    newItem.id,
    `Reported ${type} item "${newItem.title}" in ${newItem.generalLocation}.`
  );

  // Notify staff about new report
  users
    .filter((u) => u.role === 'staff')
    .forEach((staff) => {
      sendNotification(
        staff.id,
        `New ${type === 'found' ? 'Found Item' : 'Lost Item'} Reported`,
        `"${newItem.title}" was logged in ${newItem.generalLocation}.`,
        'system',
        'browse',
        newItem.id
      );
    });

  res.status(201).json({ item: sanitizeItemForUser(newItem, user) });
});

// 3. Claims
app.get('/api/claims', (req: Request, res: Response) => {
  const user = getRequestUser(req);

  // Claimants only see their own claims; Staff/Admin see all claims
  let userClaims: Claim[];
  if (user.role === 'staff' || user.role === 'admin') {
    userClaims = claims;
  } else {
    userClaims = claims.filter((c) => c.claimantId === user.id);
  }

  res.json({ claims: userClaims, total: userClaims.length });
});

app.get('/api/claims/:id', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const claim = claims.find((c) => c.id === req.params.id);

  if (!claim) {
    return res.status(404).json({ error: 'Claim not found' });
  }

  // Non-staff claimants can only see their own claim
  if (user.role !== 'staff' && user.role !== 'admin' && claim.claimantId !== user.id) {
    return res.status(403).json({ error: 'Unauthorized to view this claim' });
  }

  // Find corresponding item
  const item = items.find((i) => i.id === claim.itemId);

  res.json({
    claim,
    item: item ? sanitizeItemForUser(item, user) : null,
  });
});

app.post('/api/claims', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { itemId, distinguishingMarks, contentsDescription, approximateDateLost, exactLocationLost, additionalProof } =
    req.body;

  if (!itemId || !distinguishingMarks || !contentsDescription || !approximateDateLost || !exactLocationLost) {
    return res.status(400).json({
      error: 'Please fill in all required private ownership verification details.',
    });
  }

  const targetItem = items.find((i) => i.id === itemId);
  if (!targetItem) {
    return res.status(404).json({ error: 'Found item record not found.' });
  }

  if (targetItem.type !== 'found') {
    return res.status(400).json({ error: 'Claims can only be filed against found item reports.' });
  }

  // Rule: Claimant cannot claim their own found item
  if (targetItem.reportedBy.id === user.id) {
    return res.status(400).json({ error: 'You cannot file an ownership claim on an item that you reported finding.' });
  }

  // Anti-abuse: Rate limiting (max 5 claims submitted in past 1 hour)
  const now = Date.now();
  const oneHourAgo = now - 60 * 60 * 1000;
  const userClaimHistory = (claimRateLimitMap.get(user.id) || []).filter((t) => t > oneHourAgo);

  if (userClaimHistory.length >= 5) {
    return res.status(429).json({
      error: 'Rate limit exceeded: You have submitted multiple claims recently. Please wait before submitting another.',
    });
  }

  userClaimHistory.push(now);
  claimRateLimitMap.set(user.id, userClaimHistory);

  // Check if active claim already exists by this user for this item
  const existingClaim = claims.find(
    (c) =>
      c.itemId === itemId &&
      c.claimantId === user.id &&
      c.status !== 'Stage 1 Rejected' &&
      c.status !== 'Verification Rejected'
  );
  if (existingClaim) {
    return res.status(400).json({
      error: `You already have an active claim (${existingClaim.status}) submitted for this item.`,
    });
  }

  const newClaim: Claim = {
    id: `claim_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    itemId: targetItem.id,
    itemTitle: targetItem.title,
    itemCategory: targetItem.category,
    itemLocation: targetItem.generalLocation,
    itemDate: targetItem.date,
    itemImageUrl: targetItem.imageUrl,
    claimantId: user.id,
    claimantName: user.name,
    claimantEmail: user.email,
    claimantRole: user.role,
    status: 'Stage 1 Pending',
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    claimantEvidence: {
      distinguishingMarks: distinguishingMarks.trim(),
      contentsDescription: contentsDescription.trim(),
      approximateDateLost: approximateDateLost.trim(),
      exactLocationLost: exactLocationLost.trim(),
      additionalProof: additionalProof?.trim() || undefined,
    },
    // Generate secure collection code ahead of time (only shown to claimant once both stages pass)
    handoverCode: `${targetItem.category.substring(0, 2).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`,
    pickupLocation: 'Campus Public Safety & Lost Desk (Student Center Lower Level B-14)',
    pickupHours: 'Mon-Fri 08:30 - 18:00',
    isDemo: false,
  };

  claims.unshift(newClaim);
  targetItem.status = 'Claim In Progress';

  logAudit(
    user,
    'CLAIM_SUBMITTED',
    'claim',
    newClaim.id,
    `Ownership claim submitted for "${targetItem.title}". Stage 1 verification initiated.`
  );

  // Notify staff
  users
    .filter((u) => u.role === 'staff')
    .forEach((staff) => {
      sendNotification(
        staff.id,
        'New Claim: Stage 1 Pending',
        `${user.name} submitted an ownership claim for "${targetItem.title}". Review required.`,
        'claim_update',
        'admin',
        newClaim.id
      );
    });

  // Notify claimant
  sendNotification(
    user.id,
    'Claim Submitted Successfully',
    `Your ownership claim for "${targetItem.title}" has entered Stage 1 claimant verification. An authorized reviewer will inspect your evidence.`,
    'claim_update',
    'claims',
    newClaim.id
  );

  res.status(201).json({ claim: newClaim });
});

// 4. Strong Dual Verification - Stage 1 (Privileged Backend Endpoint)
app.post('/api/verify/stage1', (req: Request, res: Response) => {
  const reviewer = getRequestUser(req);
  const { claimId, decision, notes } = req.body;

  // Authorization check
  if (reviewer.role !== 'staff' && reviewer.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Only authorized college staff or administrators can perform Stage 1 reviews.' });
  }

  const claim = claims.find((c) => c.id === claimId);
  if (!claim) {
    return res.status(404).json({ error: 'Claim not found.' });
  }

  // Claimants cannot review their own claim
  if (claim.claimantId === reviewer.id) {
    return res.status(403).json({ error: 'Security violation: Claimants cannot verify or approve their own claim.' });
  }

  if (claim.status !== 'Stage 1 Pending' && claim.status !== 'Under Manual Review') {
    return res.status(400).json({ error: `Cannot perform Stage 1 on a claim with status: ${claim.status}.` });
  }

  if (decision !== 'Approved' && decision !== 'Rejected' && decision !== 'Manual Review') {
    return res.status(400).json({ error: 'Invalid decision. Must be Approved, Rejected, or Manual Review.' });
  }

  claim.stage1Review = {
    reviewerId: reviewer.id,
    reviewerName: reviewer.name,
    reviewerRole: reviewer.department || reviewer.role,
    decision,
    timestamp: new Date().toISOString(),
    notes: notes?.trim() || `Stage 1 reviewed by ${reviewer.name}`,
  };
  claim.updatedAt = new Date().toISOString();

  if (decision === 'Approved') {
    claim.status = 'Stage 2 Pending';
    logAudit(
      reviewer,
      'STAGE_1_APPROVED',
      'claim',
      claim.id,
      `Stage 1 Approved by ${reviewer.name}. Evidence matches private record. Sent to Stage 2 independent review.`
    );

    sendNotification(
      claim.claimantId,
      'Stage 1 Verification Passed',
      `Your ownership verification for "${claim.itemTitle}" passed Stage 1! It is now advancing to independent Stage 2 staff inspection.`,
      'stage_approval',
      'claims',
      claim.id
    );

    // Notify other staff that Stage 2 is ready
    users
      .filter((u) => u.role === 'staff' && u.id !== reviewer.id)
      .forEach((otherStaff) => {
        sendNotification(
          otherStaff.id,
          'Stage 2 Review Required',
          `Claim for "${claim.itemTitle}" was approved by ${reviewer.name}. An independent reviewer is needed for Stage 2.`,
          'stage_approval',
          'admin',
          claim.id
        );
      });
  } else if (decision === 'Rejected') {
    claim.status = 'Stage 1 Rejected';
    claim.rejectionReasonSafe = 'Submitted ownership details did not sufficiently match the verified characteristics of the item.';

    logAudit(
      reviewer,
      'STAGE_1_REJECTED',
      'claim',
      claim.id,
      `Stage 1 Rejected by ${reviewer.name}. Reason: ${notes || 'Mismatch in distinguishing details'}.`
    );

    sendNotification(
      claim.claimantId,
      'Claim Verification Update',
      `Your claim for "${claim.itemTitle}" could not be validated during Stage 1 ownership review.`,
      'claim_update',
      'claims',
      claim.id
    );
  } else {
    claim.status = 'Under Manual Review';
    claim.manualReviewReason = notes || 'Additional evidence requested or ambiguous details.';

    logAudit(
      reviewer,
      'STAGE_1_MANUAL_REVIEW',
      'claim',
      claim.id,
      `Claim marked for manual review by ${reviewer.name}: ${notes}.`
    );

    sendNotification(
      claim.claimantId,
      'Additional Verification Review',
      `Your claim for "${claim.itemTitle}" is under manual administrative review. Staff may contact you for further clarification.`,
      'claim_update',
      'claims',
      claim.id
    );
  }

  res.json({ claim });
});

// 5. Strong Dual Verification - Stage 2 (Privileged Backend Endpoint)
app.post('/api/verify/stage2', (req: Request, res: Response) => {
  const reviewer = getRequestUser(req);
  const { claimId, decision, notes } = req.body;

  // Authorization check
  if (reviewer.role !== 'staff' && reviewer.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Only authorized staff or administrators can perform Stage 2 reviews.' });
  }

  const claim = claims.find((c) => c.id === claimId);
  if (!claim) {
    return res.status(404).json({ error: 'Claim not found.' });
  }

  // CRITICAL RULE 1: Stage 2 can ONLY happen if Stage 1 was approved
  if (claim.status !== 'Stage 2 Pending' && claim.status !== 'Under Manual Review') {
    return res.status(400).json({
      error: `Stage 2 verification cannot begin. Stage 1 must be approved first. Current status: ${claim.status}.`,
    });
  }

  if (!claim.stage1Review || claim.stage1Review.decision !== 'Approved') {
    return res.status(400).json({ error: 'Stage 1 approval record missing or rejected. Cannot proceed to Stage 2.' });
  }

  // CRITICAL RULE 2: INDEPENDENT REVIEWER REQUIREMENT
  // The person who reviewed Stage 1 CANNOT review Stage 2!
  if (claim.stage1Review.reviewerId === reviewer.id) {
    return res.status(403).json({
      error: `Security constraint violated: Dual verification requires an independent second reviewer. ${reviewer.name} performed Stage 1 and cannot approve Stage 2. Please have another staff member complete Stage 2.`,
    });
  }

  // Claimant cannot review their own claim
  if (claim.claimantId === reviewer.id) {
    return res.status(403).json({ error: 'Security violation: Claimants cannot verify or approve their own claim.' });
  }

  if (decision !== 'Approved' && decision !== 'Rejected' && decision !== 'Manual Review') {
    return res.status(400).json({ error: 'Invalid decision. Must be Approved, Rejected, or Manual Review.' });
  }

  claim.stage2Review = {
    reviewerId: reviewer.id,
    reviewerName: reviewer.name,
    reviewerRole: reviewer.department || reviewer.role,
    decision,
    timestamp: new Date().toISOString(),
    notes: notes?.trim() || `Stage 2 independent physical review verified by ${reviewer.name}`,
  };
  claim.updatedAt = new Date().toISOString();

  if (decision === 'Approved') {
    claim.status = 'Verified — Ready for Collection';
    const item = items.find((i) => i.id === claim.itemId);
    if (item) {
      item.status = 'Verified';
    }

    logAudit(
      reviewer,
      'STAGE_2_APPROVED',
      'claim',
      claim.id,
      `Stage 2 Independent Verification Approved by ${reviewer.name}. Item marked Verified — Ready for Collection.`
    );

    sendNotification(
      claim.claimantId,
      '🎉 Item Verified — Ready for Collection!',
      `Both verification stages passed! Please bring your campus ID and Handover Code [${claim.handoverCode}] to ${claim.pickupLocation}.`,
      'collection_ready',
      'claims',
      claim.id
    );
  } else if (decision === 'Rejected') {
    claim.status = 'Verification Rejected';
    claim.rejectionReasonSafe = 'Item physical inspection did not reconcile with claim evidence during secondary review.';

    logAudit(
      reviewer,
      'STAGE_2_REJECTED',
      'claim',
      claim.id,
      `Stage 2 Rejected by ${reviewer.name}. Reason: ${notes || 'Secondary inspection failure'}.`
    );

    sendNotification(
      claim.claimantId,
      'Verification Not Approved',
      `Stage 2 independent review for "${claim.itemTitle}" could not be confirmed.`,
      'claim_update',
      'claims',
      claim.id
    );
  } else {
    claim.status = 'Under Manual Review';
    claim.manualReviewReason = notes || 'Stage 2 reviewer flagged for supervisory committee review.';

    logAudit(
      reviewer,
      'STAGE_2_MANUAL_REVIEW',
      'claim',
      claim.id,
      `Stage 2 sent to manual review by ${reviewer.name}.`
    );

    sendNotification(
      claim.claimantId,
      'Manual Review In Progress',
      `Your claim for "${claim.itemTitle}" requires senior desk inspection before release.`,
      'claim_update',
      'claims',
      claim.id
    );
  }

  res.json({ claim });
});

// 6. Authorized Handover Workflow (Privileged Backend Endpoint)
app.post('/api/handover/confirm', (req: Request, res: Response) => {
  const staff = getRequestUser(req);
  const { claimId, handoverCode, recipientStudentId, notes } = req.body;

  if (staff.role !== 'staff' && staff.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Only authorized staff or administrators can execute physical handovers.' });
  }

  const claim = claims.find((c) => c.id === claimId);
  if (!claim) {
    return res.status(404).json({ error: 'Claim not found.' });
  }

  if (claim.status !== 'Verified — Ready for Collection') {
    return res.status(400).json({
      error: `Item cannot be handed over. Both verification stages must be approved first. Current status: ${claim.status}.`,
    });
  }

  if (!handoverCode || handoverCode.trim().toUpperCase() !== (claim.handoverCode || '').toUpperCase()) {
    return res.status(400).json({
      error: 'Invalid Handover PIN/Code. Please confirm the student code presented in the Claimant Portal.',
    });
  }

  if (!recipientStudentId || !recipientStudentId.trim()) {
    return res.status(400).json({ error: 'Recipient Student/Staff ID is required for audit verification.' });
  }

  // Update claim & handover record
  claim.status = 'Returned';
  claim.handoverRecord = {
    staffId: staff.id,
    staffName: staff.name,
    recipientName: claim.claimantName,
    recipientStudentId: recipientStudentId.trim(),
    timestamp: new Date().toISOString(),
    handoverLocation: claim.pickupLocation || 'Public Safety Lost & Found Desk',
    handoverCodeUsed: handoverCode.trim().toUpperCase(),
    notes: notes?.trim() || 'Physical ID verified, receipt voucher signed, item returned.',
  };
  claim.updatedAt = new Date().toISOString();

  // Mark item status as Returned
  const item = items.find((i) => i.id === claim.itemId);
  if (item) {
    item.status = 'Returned';
  }

  logAudit(
    staff,
    'HANDOVER_COMPLETED',
    'handover',
    claim.id,
    `Physical handover confirmed for "${claim.itemTitle}". Recipient ID: ${recipientStudentId.trim()}. Handover staff: ${staff.name}.`
  );

  // Notify claimant
  sendNotification(
    claim.claimantId,
    'Item Returned Successfully!',
    `Your item "${claim.itemTitle}" has been officially handed over. Thank you for using Smart Campus Lost & Found!`,
    'handover_done',
    'claims',
    claim.id
  );

  // Notify finder
  if (item && item.reportedBy && item.reportedBy.id) {
    sendNotification(
      item.reportedBy.id,
      'Found Item Returned to Owner',
      `Great news! The "${item.title}" you reported finding was verified and safely returned to its rightful owner. Thank you for your campus citizenship!`,
      'handover_done',
      'browse',
      item.id
    );

    // If reward offered, create or activate reward record
    if (item.rewardAmount && item.rewardAmount > 0 && item.finderAcceptsReward) {
      const existingReward = rewards.find((r) => r.itemId === item.id);
      if (!existingReward) {
        const newReward: RewardRecord = {
          id: `rew_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
          claimId: claim.id,
          itemId: item.id,
          itemTitle: item.title,
          amount: item.rewardAmount,
          payerId: claim.claimantId,
          payerName: claim.claimantName,
          payeeId: item.reportedBy.id,
          payeeName: item.reportedBy.name,
          status: 'Accepted',
          isDemo: true,
          transactionRef: `DEMO-REF-${Math.floor(100000 + Math.random() * 900000)}`,
          createdAt: new Date().toISOString(),
          notes: 'Voluntary thank-you reward ready for optional settlement.',
        };
        rewards.unshift(newReward);
      }
    }
  }

  res.json({ claim, item });
});

// 7. Smart Matching Engine
app.get('/api/matching', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const lostList = items.filter((i) => i.type === 'lost' && (user.role === 'staff' || user.role === 'admin' || i.reportedBy.id === user.id));
  const foundList = items.filter((i) => i.type === 'found' && i.status !== 'Returned');

  const matches: MatchScoreResult[] = [];

  for (const lost of lostList) {
    for (const found of foundList) {
      let score = 0;
      const factors = {
        categoryMatch: false,
        nameSimilarity: 0,
        colorMatch: false,
        brandMatch: false,
        locationMatch: false,
        dateProximity: false,
      };

      // 1. Category match (+30 pts)
      if (lost.category === found.category) {
        factors.categoryMatch = true;
        score += 30;
      }

      // 2. Title & description word overlap (up to +30 pts)
      const lostWords = `${lost.title} ${lost.publicDescription}`.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
      const foundWords = `${found.title} ${found.publicDescription}`.toLowerCase().split(/\W+/).filter((w) => w.length > 2);
      const setFound = new Set(foundWords);
      let matchCount = 0;
      for (const w of lostWords) {
        if (setFound.has(w)) matchCount++;
      }
      const similarityRatio = lostWords.length > 0 ? matchCount / Math.max(lostWords.length, 6) : 0;
      factors.nameSimilarity = Math.min(1, similarityRatio);
      score += Math.round(factors.nameSimilarity * 30);

      // 3. Color match (+15 pts)
      if (lost.color && found.color && (
        lost.color.toLowerCase().includes(found.color.toLowerCase()) ||
        found.color.toLowerCase().includes(lost.color.toLowerCase())
      )) {
        factors.colorMatch = true;
        score += 15;
      }

      // 4. Brand match (+15 pts)
      if (lost.brand && found.brand && (
        lost.brand.toLowerCase().includes(found.brand.toLowerCase()) ||
        found.brand.toLowerCase().includes(lost.brand.toLowerCase())
      )) {
        factors.brandMatch = true;
        score += 15;
      }

      // 5. Location proximity (+10 pts)
      if (
        lost.generalLocation &&
        found.generalLocation &&
        (lost.generalLocation.toLowerCase().includes(found.generalLocation.toLowerCase()) ||
          found.generalLocation.toLowerCase().includes(lost.generalLocation.toLowerCase()))
      ) {
        factors.locationMatch = true;
        score += 10;
      }

      // Cap at 95% to maintain clear distinction that algorithmic score is not proof of ownership
      const finalScore = Math.min(95, Math.max(0, score));

      if (finalScore >= 35) {
        matches.push({
          lostItem: sanitizeItemForUser(lost, user),
          foundItem: sanitizeItemForUser(found, user),
          score: finalScore,
          factors,
          explanation: `Algorithmic estimate: ${
            factors.categoryMatch ? 'Same category; ' : ''
          }${factors.brandMatch ? 'Matching brand; ' : ''}${
            factors.colorMatch ? 'Matching color; ' : ''
          }${factors.locationMatch ? 'Nearby campus location; ' : ''}Confidence: ${finalScore}%. (Note: This is an automated estimate and does not replace Stage 1 & Stage 2 verification).`,
        });
      }
    }
  }

  matches.sort((a, b) => b.score - a.score);
  res.json({ matches });
});

// 8. Notifications
app.get('/api/notifications', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const userNotifs = notifications.filter((n) => n.userId === user.id);
  res.json({ notifications: userNotifs });
});

app.put('/api/notifications/:id/read', (req: Request, res: Response) => {
  const notif = notifications.find((n) => n.id === req.params.id);
  if (notif) {
    notif.read = true;
  }
  res.json({ success: true });
});

app.put('/api/notifications/mark-all-read', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  notifications.forEach((n) => {
    if (n.userId === user.id) n.read = true;
  });
  res.json({ success: true });
});

// 9. Rewards & Demo Payment Gateway
app.get('/api/rewards', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  let userRewards = rewards;
  if (user.role !== 'staff' && user.role !== 'admin') {
    userRewards = rewards.filter((r) => r.payerId === user.id || r.payeeId === user.id);
  }
  res.json({ rewards: userRewards });
});

app.post('/api/rewards/demo-pay', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { rewardId } = req.body;

  const reward = rewards.find((r) => r.id === rewardId);
  if (!reward) {
    return res.status(404).json({ error: 'Reward record not found' });
  }

  if (reward.payerId !== user.id && user.role !== 'admin') {
    return res.status(403).json({ error: 'Only the reward offerer can fulfill the payment.' });
  }

  // Update status
  reward.status = 'Paid';
  reward.paidAt = new Date().toISOString();
  reward.transactionRef = `DEMO-CONFIRMED-${Math.floor(1000000 + Math.random() * 9000000)}`;

  logAudit(
    user,
    'REWARD_PAID',
    'reward',
    reward.id,
    `Voluntary reward of $${reward.amount} marked paid via simulated Demo Payment Gateway (Ref: ${reward.transactionRef}).`
  );

  sendNotification(
    reward.payeeId,
    'Voluntary Reward Received (Demo Mode)',
    `${user.name} sent a voluntary gratitude reward of $${reward.amount} for "${reward.itemTitle}".`,
    'reward_update',
    'rewards',
    reward.id
  );

  res.json({ success: true, reward });
});

// 10. Audit Logs & Abuse Reports (Protected)
app.get('/api/audit-logs', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role !== 'staff' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized: Audit logs are restricted to staff and administrators.' });
  }
  res.json({ auditLogs });
});

app.get('/api/abuse-reports', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  if (user.role !== 'staff' && user.role !== 'admin') {
    return res.status(403).json({ error: 'Unauthorized to view abuse reports.' });
  }
  res.json({ abuseReports });
});

app.post('/api/abuse-reports', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  const { targetType, targetId, targetTitle, reason } = req.body;

  if (!targetType || !targetId || !reason) {
    return res.status(400).json({ error: 'Please specify the target and reason for the report.' });
  }

  const report: AbuseReport = {
    id: `rep_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
    reportedBy: {
      id: user.id,
      name: user.name,
    },
    targetType,
    targetId,
    targetTitle: targetTitle || 'Campus Item/Claim',
    reason: reason.trim(),
    status: 'Pending',
    createdAt: new Date().toISOString(),
  };

  abuseReports.unshift(report);

  logAudit(
    user,
    'ABUSE_REPORTED',
    'abuse_report',
    report.id,
    `Reported abuse on ${targetType} "${targetTitle}": ${reason.trim()}`
  );

  res.status(201).json({ report });
});

// 11. System Reset
app.post('/api/reset-demo', (req: Request, res: Response) => {
  const user = getRequestUser(req);
  items = JSON.parse(JSON.stringify(INITIAL_ITEMS));
  claims = JSON.parse(JSON.stringify(INITIAL_CLAIMS));
  notifications = JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS));
  auditLogs = JSON.parse(JSON.stringify(INITIAL_AUDIT_LOGS));
  rewards = JSON.parse(JSON.stringify(INITIAL_REWARDS));
  abuseReports = [];
  claimRateLimitMap.clear();

  logAudit(user, 'SYSTEM_RESET', 'auth', 'system', 'Demo database reloaded to default sample state.');
  res.json({ success: true, message: 'Database reset to initial sample records.' });
});

// ==========================================
// Dev & Production Server Mounting
// ==========================================
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    // Vite middleware mode in development
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    // Production static serve
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Campus Lost & Found server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
