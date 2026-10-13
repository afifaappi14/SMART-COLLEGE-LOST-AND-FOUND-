# Smart Campus Lost & Found System

A privacy-first, full-stack college lost-and-found web application with **independent dual verification**, zero-leak found-item reporting, algorithmic smart matching, and secure desk handovers.

---

## 🛡️ Core Innovation: Strong Independent Dual Verification

Public found-item listings contain **only a basic public description** (e.g., *"Black water bottle found near college library"*). Distinguishing marks, stickers, serial numbers, engravings, and internal contents are locked in a **secure server vault**.

No item is released until **two independent verification stages** are passed and an authorized desk handover is executed:

1. **Stage 1 (Claimant Ownership Verification):** The claimant signs in and describes unprompted distinguishing marks, stickers, contents, and purchase proof. An authorized reviewer (Reviewer 1, e.g. Officer Marcus Chen) evaluates the evidence against vault notes without disclosing expected answers.
2. **Stage 2 (Independent Physical/Staff Inspection):** A **different** authorized reviewer (Reviewer 2, e.g. Dean Sarah Jenkins) independently verifies the physical item and campus registry.
   - *Security rule:* The Stage 1 reviewer cannot approve Stage 2.
   - *Security rule:* Claimants can never approve their own claim.
   - *Security rule:* Finders cannot unilaterally bypass verification.
3. **Secure Desk Handover:** Once both stages pass, the system generates a secure 6-character Handover PIN and collection notice for the Campus Safety Desk (Student Center B-14). An authorized staff member verifies the student's physical University ID card and enters the PIN to confirm release and mark the item **Returned**.

---

## ⚡ Quick Demo & Evaluation Guide

The platform includes **pre-loaded sample records** and an **interactive Persona Switcher** in the top navigation bar to test the entire workflow end-to-end:

### Pre-Configured Test Personas:
- **Alex Rivera (`user_student_1`):** Undergraduate Student (Lost Apple Charger & Umbrella; Claimed Water Bottle & Sony Earbuds).
- **Priya Sharma (`user_finder_1`):** Biology Student / Lab Assistant (Reported found Water Bottle & Earbuds).
- **Officer Marcus Chen (`user_staff_1`):** Lead Campus Safety Officer (Stage 1 Reviewer).
- **Dean Sarah Jenkins (`user_staff_2`):** Associate Dean of Student Affairs (Stage 2 Independent Reviewer).
- **Director Taylor Brooks (`user_admin_1`):** Chief Operations Administrator.

### Testing the Dual Verification Workflow:
1. **Test Stage 1:**
   - Switch persona to **Officer Marcus Chen** (`Reviewer 1`).
   - Navigate to **Admin Desk** → **Verification Queue**.
   - Select the claim for *Black Stainless Steel Water Bottle* (Claim ref `claim_demo_1`).
   - Inspect the **Side-by-Side Comparator** (Claimant Evidence vs Private Vault Record).
   - Click **Approve Stage 1**. Status advances to `Stage 2 Pending`.
2. **Test Independent Reviewer Enforcement:**
   - While still signed in as **Officer Marcus Chen**, attempt to approve Stage 2. The system blocks this action because dual verification requires an independent second reviewer!
   - Switch persona to **Dean Sarah Jenkins** (`Reviewer 2`).
   - Click **Approve Stage 2 (Release for Collection)**. Status advances to `Verified — Ready for Collection`.
3. **Test Desk Handover:**
   - Switch persona to **Alex Rivera** (`Student / Claimant`).
   - Open **My Claims**. Observe that the collection instructions and **Handover Code PIN** (`WF-8831`) are revealed.
   - Switch back to staff, open **Admin Desk** → **Desk Handover Terminal**.
   - Enter student ID `CS-2024-8831` and the PIN `WF-8831`.
   - Click **Confirm Handover**. The item is marked **Returned**, celebration confetti fires, and immutable audit logs are stamped!
4. **Test Reset:**
   - Click the persona avatar in the top right → **Reset Demo Sample Records** to restore seed data at any time.

---

## 📦 Architecture & Folder Structure

```
├── /server.ts                         # Express full-stack API server with privacy filters & audit logging
├── /firestore.rules                   # Production Cloud Firestore security rules with vault isolation
├── /index.html                        # HTML entry point with Plus Jakarta Sans & metadata
├── /metadata.json                     # AI Studio metadata
├── /package.json                      # Full-stack configuration & dependencies
├── /src
│   ├── /context
│   │   └── AuthContext.tsx            # Multi-persona session switcher and notification sync
│   ├── /data
│   │   └── mockData.ts                # Realistic seed datasets for the 6 required sample items
│   ├── /types
│   │   └── index.ts                   # Domain models: User, Item, Claim, AuditLog, AbuseReport, Reward
│   ├── /services
│   │   └── api.ts                     # REST client with automatic x-user-id header routing
│   ├── /components
│   │   ├── Navbar.tsx                 # Navigation bar with role badges and live notification counter
│   │   ├── Footer.tsx                 # Central Desk hours, FERPA statement, and campus contact info
│   │   ├── HomeView.tsx               # Hero, live metrics, 4-step workflow guide, category cards
│   │   ├── BrowseView.tsx             # Search, category/status/location filters, safe modals
│   │   ├── ReportLostView.tsx         # Lost item declaration with private contact hiding
│   │   ├── ReportFoundView.tsx        # Basic public description + Private Vault Clues Section
│   │   ├── ClaimModal.tsx             # Stage 1 Claimant ownership evidence submission
│   │   ├── MyClaimsView.tsx           # Claimant progress timeline, PIN reveal, pickup hours
│   │   ├── SmartMatchesView.tsx       # Multi-criteria scoring engine (weights & factor checklist)
│   │   ├── AdminDashboard.tsx         # Side-by-side comparator, Stage 1 & 2 actions, Handover desk
│   │   ├── RewardsView.tsx            # Voluntary thank-you rewards + Certified Demo Payment Gateway
│   │   ├── NotificationsView.tsx      # Real-time notification center (read/unread, deep links)
│   │   ├── AbuseReportModal.tsx       # Flagging inappropriate content & false claims
│   │   └── PrivacyPolicyModal.tsx     # Student privacy charter & FERPA compliance statement
│   ├── App.tsx                        # Root layout and view coordinator
│   ├── main.tsx                       # React 19 root bootstrap
│   └── index.css                      # Tailwind v4 utility baseline
```

---

## 🔒 Security & Data Vault Model

| Collection / Resource | Public Access | Claimant Access | Finder Access | Staff / Admin Access |
| :--- | :--- | :--- | :--- | :--- |
| **`items` (Public Catalog)** | Read Only (Generic title, location, category, date) | Read Only | Edit before claim | Full Management |
| **`privateVerificationDetails` (Vault)** | **Blocked (403)** | **Blocked (403)** | Read/Write own record | Full Inspection |
| **`claims`** | Blocked | Read own claim & status | Blocked from private notes | Full side-by-side review |
| **`auditLogs`** | Blocked | Blocked | Blocked | Read Only (Immutable) |

---

## 🚀 Running Locally

1. **Install dependencies:**
   ```bash
   npm install
   ```
2. **Start the full-stack server (Dev mode with Vite & Express):**
   ```bash
   npm run dev
   ```
3. Open `http://localhost:3000` in your browser.
