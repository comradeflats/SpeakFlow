# GCP Account Migration Checklist - Vietnam to US

**Date**: December 16, 2024
**Purpose**: Migrate from Vietnam GCP account to US GCP account for hackathon eligibility
**Estimated Time**: 30-45 minutes

---

## Phase 1: Create New US-Based GCP Account

### Step 1: Sign out of current GCP account
- [ ] Go to https://console.cloud.google.com
- [ ] Click your profile icon (top right)
- [ ] Select "Sign out"
- [ ] Clear browser cookies/cache (optional but recommended)

### Step 2: Create new Google account (if needed)
- [ ] Option A: Use existing Google account with US credentials
- [ ] Option B: Create new Google account
  - Go to https://accounts.google.com/signup
  - Use US phone number for verification
  - Ensure recovery email is US-based

### Step 3: Access Google Cloud Console with new account
- [ ] Go to https://console.cloud.google.com
- [ ] Sign in with US-based Google account
- [ ] Accept Terms of Service

### Step 4: Set up billing with US credentials
- [ ] Click "Billing" in left sidebar
- [ ] Click "Add billing account"
- [ ] **CRITICAL**: Enter US billing address
- [ ] Add US payment method (credit/debit card)
- [ ] Verify country is set to "United States"
- [ ] Complete billing setup
- [ ] Activate $300 free trial (if eligible)

**Verification checkpoint**: Billing page should show "Country: United States"

---

## Phase 2: Create New GCP Project

### Step 5: Create project
- [ ] Click "Select a project" dropdown (top left)
- [ ] Click "New Project"
- [ ] Project name: `ielts-ai-practice-us` (or similar)
- [ ] Organization: (None) - unless you have one
- [ ] Location: (leave as default)
- [ ] Click "Create"
- [ ] Wait for project creation (30-60 seconds)
- [ ] **SAVE PROJECT ID** (format: `ielts-ai-practice-us-######`)

**Your new project ID**: ___________________ (write it here)

### Step 6: Enable required APIs
- [ ] Click "APIs & Services" > "Library"
- [ ] Search for "Vertex AI API"
- [ ] Click "Vertex AI API"
- [ ] Click "Enable"
- [ ] Wait for activation (30 seconds)
- [ ] Return to API Library
- [ ] Search for "Cloud Resource Manager API"
- [ ] Click "Cloud Resource Manager API"
- [ ] Click "Enable"
- [ ] Wait for activation

**Verification checkpoint**: Both APIs should show "Enabled" status

---

## Phase 3: Create Service Account

### Step 7: Navigate to service accounts
- [ ] Click "IAM & Admin" > "Service Accounts"
- [ ] Ensure you're in the correct project (check top bar)

### Step 8: Create service account
- [ ] Click "+ CREATE SERVICE ACCOUNT"
- [ ] Service account name: `vertex-ai-service`
- [ ] Service account ID: (auto-filled, e.g., `vertex-ai-service@...`)
- [ ] Description: `Service account for Vertex AI IELTS analysis`
- [ ] Click "CREATE AND CONTINUE"

### Step 9: Grant permissions
- [ ] In "Grant this service account access to project"
- [ ] Click "Select a role" dropdown
- [ ] Search for "Vertex AI User"
- [ ] Select "Vertex AI User"
- [ ] Click "+ ADD ANOTHER ROLE"
- [ ] Search for "Vertex AI Service Agent"
- [ ] Select "Vertex AI Service Agent"
- [ ] Click "Continue"
- [ ] Skip "Grant users access" (click "Done")

**Verification checkpoint**: Service account should appear in list with both roles

### Step 10: Download JSON key
- [ ] Click on the newly created service account email
- [ ] Click "KEYS" tab
- [ ] Click "ADD KEY" > "Create new key"
- [ ] Select "JSON"
- [ ] Click "CREATE"
- [ ] **IMPORTANT**: Save the downloaded JSON file
- [ ] Move file to: `~/.gcp/ielts-vertex-ai-key-us.json`

**Terminal command to move file**:
```bash
# Assuming file downloaded to ~/Downloads/
mv ~/Downloads/ielts-ai-practice-us-*-*.json ~/.gcp/ielts-vertex-ai-key-us.json
chmod 600 ~/.gcp/ielts-vertex-ai-key-us.json
```

**Verification checkpoint**: File should exist at `~/.gcp/ielts-vertex-ai-key-us.json`

---

## Phase 4: Set Budget Alerts

### Step 11: Configure budget
- [ ] Click "Billing" > "Budgets & alerts"
- [ ] Click "+ CREATE BUDGET"
- [ ] Budget name: `Monthly Vertex AI Budget`
- [ ] Projects: Select your new project
- [ ] Time range: Monthly
- [ ] Budget amount: $10
- [ ] Set threshold alerts: 50%, 90%, 100%
- [ ] Add email recipients (your email)
- [ ] Click "Finish"

**Verification checkpoint**: Budget should appear in list

---

## Phase 5: Update Local Environment

### Step 12: Update .env.local
- [ ] Open `/Users/comradeflats/Desktop/hackathon/.env.local`
- [ ] Update these lines:

**OLD (Vietnam account)**:
```bash
GCP_PROJECT_ID=ielts-ai-practice
GOOGLE_APPLICATION_CREDENTIALS=/Users/comradeflats/.gcp/ielts-vertex-ai-key.json
```

**NEW (US account)**:
```bash
GCP_PROJECT_ID=ielts-ai-practice-us-######  # Your actual project ID
GOOGLE_APPLICATION_CREDENTIALS=/Users/comradeflats/.gcp/ielts-vertex-ai-key-us.json
```

**Keep unchanged**:
```bash
NEXT_PUBLIC_ELEVENLABS_API_KEY=sk_0872466b58b96d02e02dc570c9f64245ef60467e2cef654b
NEXT_PUBLIC_ELEVENLABS_AGENT_ID=agent_4701kcjsxnphfssthmb7p5914kc6
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyAPtsd8-a637_2gfk2ib0hboOFxxFDN49U
GCP_LOCATION=us-central1
```

---

## Phase 6: Testing

### Step 13: Test local development
- [ ] Open terminal in project directory
- [ ] Run: `npm run dev`
- [ ] Wait for server to start
- [ ] Verify no credential errors in console

### Step 14: Test practice page
- [ ] Open browser to http://localhost:3000/practice
- [ ] Select a part (1, 2, or 3)
- [ ] Start conversation with ElevenLabs agent
- [ ] Record short audio response (10-15 seconds)
- [ ] Wait for analysis to complete

**Expected result**:
- Analysis should complete in 5-15 seconds
- Scores should appear (Fluency, Lexical, Grammar, Pronunciation)
- Feedback should quote IELTS band descriptors
- Verbatim transcript should be shown

**If errors occur**:
- Check browser console for error messages
- Check terminal for API errors
- Verify service account JSON file exists
- Verify project ID is correct in `.env.local`

### Step 15: Verify Vertex AI logs
- [ ] Go to https://console.cloud.google.com
- [ ] Navigate to "Vertex AI" > "Workbench" or "Model Garden"
- [ ] Check for recent API calls
- [ ] Verify no permission errors

**Verification checkpoint**: Logs should show successful API calls

---

## Phase 7: Cleanup (Optional)

### Step 16: Archive old GCP project
- [ ] Sign in to OLD GCP account (Vietnam)
- [ ] Go to https://console.cloud.google.com
- [ ] Select project `ielts-ai-practice`
- [ ] Click "Settings"
- [ ] Click "Shut down" (at bottom)
- [ ] Type project ID to confirm
- [ ] Click "SHUT DOWN"

**Note**: You have 30 days to restore before permanent deletion

### Step 17: Backup old credentials (optional)
- [ ] Archive old key: `mv ~/.gcp/ielts-vertex-ai-key.json ~/.gcp/ielts-vertex-ai-key-vietnam-backup.json`

---

## Troubleshooting

### Issue: "Permission denied" errors
**Solution**:
- Verify service account has "Vertex AI User" role
- Check `GOOGLE_APPLICATION_CREDENTIALS` path is correct
- Ensure JSON file has read permissions (`chmod 600`)

### Issue: "Project not found"
**Solution**:
- Verify `GCP_PROJECT_ID` matches exactly (including numbers)
- Check you're signed into correct GCP account
- Ensure project is selected in console (top bar)

### Issue: "Quota exceeded"
**Solution**:
- Check free tier limits: 1,500 Vertex AI requests/day
- Verify billing is enabled
- Check budget hasn't been hit

### Issue: "Invalid credentials"
**Solution**:
- Re-download service account JSON key
- Verify file is valid JSON (open in text editor)
- Ensure no extra characters or line breaks

---

## Success Criteria

**Migration is complete when**:
- [x] New GCP project created with US billing
- [x] Vertex AI API enabled
- [x] Service account created with proper roles
- [x] JSON key downloaded and saved
- [x] Budget alert configured
- [x] `.env.local` updated
- [x] Local dev server starts without errors
- [x] Practice page successfully analyzes audio
- [x] Scores and feedback display correctly

---

## Post-Migration Next Steps

After successful migration, resume development with:

1. **Pronunciation Heatmap** (6-8 hours) - Competitive advantage feature
2. **Structured Question Database** (2-3 hours) - Improve IELTS authenticity
3. **Supabase Setup** (4-6 hours) - Enable progress tracking
4. **Cloud Run Deployment** (4-6 hours) - Required for submission
5. **Demo Video** (4-6 hours) - Required for submission

Refer to `/Users/comradeflats/.claude/plans/parallel-herding-thunder.md` for complete roadmap.

---

## Important Notes

- **DO NOT commit** service account JSON files to git
- **DO NOT share** service account keys publicly
- **VERIFY** country is "United States" in billing settings
- **TEST thoroughly** before deploying to production
- **KEEP** old credentials backed up until migration is verified

---

**END OF CHECKLIST**

*Last updated: December 16, 2024*
