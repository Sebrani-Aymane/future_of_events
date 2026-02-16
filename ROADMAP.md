
## 🎯 Phase 1: Core Functionality (MVP)
**Timeline: 4-6 weeks | Priority: CRITICAL | Status: 🟡 ~80% Complete**

### 1.1 Authentication & Authorization
  - [ ] Magic link authentication
- [ ] **Profile Management**
  - [ ] Complete profile page with avatar upload
  - [ ] Edit profile functionality
  - [ ] Skills & experience editor

### 1.2 Event Management
- [ ] **Event CRUD (Admin)**
  - [ ] Create new event form
  - [ ] Edit event details
  - [ ] Delete/archive events
  - [ ] Publish/unpublish toggle
- [ ] **Event Settings**
  - [ ] Registration open/close controls
  - [ ] Submission window management
  - [ ] Judging period configuration
- [ ] **Event Customization**
  - [ ] Logo & banner upload
  - [ ] Custom branding colors (per event)
  - [ ] Custom schedule builder
  - [ ] Prize configuration
  - [ ] FAQ editor
  - [ ] Rules & judging criteria editor

### 1.3 Registration System
- [x] **Participant Registration**
  - [ ] T-shirt size, dietary restrictions, etc.
  - [ ] Emergency contact info
- [x] **Registration Management (Admin)**
  - [ ] Export CSV
  - [ ] Check-in system (QR code support)
- [ ] **Capacity Management**
  - [ ] Waitlist when event is full
  - [ ] Automatic promotion from waitlist

### 1.4 Team System
- [x] **Team Joining**
  - [ ] Request to join functionality
- [x] **Team Management**
  - [ ] Invite members by email
- [ ] **Team Matching** (Nice to have)
  - [ ] AI-powered team suggestions
  - [ ] Skills-based matching

### 1.5 Project Submission
- [x] **Submission Form**
  - [ ] Screenshot/image upload
- [x] **Submission Management**
  - [ ] Late submission handling

---

## 🎯 Phase 2: Judging & Scoring
**Timeline: 2-3 weeks | Priority: HIGH | Status: 🟡 ~70% Complete**

### 2.1 Judge Portal
- [x] **Judge Assignment**
  - [ ] Invite judges by email
  - [ ] Round-robin assignment algorithm
  - [ ] Conflict of interest flagging
- [x] **Judge Progress**
  - [ ] Deadline reminders
  - [ ] Judge leaderboard (completion rate)

### 2.2 Results & Leaderboard
- [x] **Score Calculation**
  - [ ] Normalize scores across judges
- [x] **Leaderboard**
  - [ ] Category-specific leaderboards
- [ ] **Winner Announcement**
  - [ ] Admin control to publish results
  - [ ] Winner badges on projects
  - [ ] Automated winner email notifications

---

## 🎯 Phase 3: Communication & Engagement
**Timeline: 2-3 weeks | Priority: MEDIUM | Status: 🟡 ~40% Complete**

### 3.1 Announcements System
- [x] **Create Announcements**
  - [ ] Rich text editor
  - [ ] Schedule announcements
  - [ ] Target audience selection (all, teams, judges)
- [ ] **Delivery Channels**
  - [ ] Email notifications
  - [ ] Push notifications (PWA)
- [ ] **Announcement History**
  - [ ] Resend functionality

### 3.2 Activity Feed
- [ ] **Real-time Updates**
  - [ ] New registrations
  - [ ] Team formations
  - [ ] Project submissions
  - [ ] Score submissions
- [ ] **Supabase Realtime Integration**
  - [ ] Live activity stream
  - [ ] Participant count updates
  - [ ] Team status changes

### 3.3 Notifications Center
- [ ] **User Notifications**
  - [ ] Bell icon with unread count
  - [ ] Notification drawer/dropdown
  - [ ] Mark as read functionality
- [ ] **Email Preferences**
  - [ ] Granular email settings
  - [ ] Unsubscribe options

---

## 🎯 Phase 4: Admin & Analytics
**Timeline: 2-3 weeks | Priority: MEDIUM | Status: 🟡 ~50% Complete**

### 4.1 Admin Dashboard
- [ ] **Data Visualizations**
  - [ ] Charts using Recharts or Chart.js
  - [ ] Participant demographics
  - [ ] Skill distribution
  - [ ] School/organization breakdown

### 4.2 Participant Management
- [x] **Participant Details**
  - [ ] Check-in status

### 4.4 Export & Reporting
- [ ] **Data Export**
  - [ ] CSV export for participants
  - [ ] CSV export for teams
  - [ ] CSV export for projects & scores
- [ ] **Reports**
  - [ ] Post-event summary report
  - [ ] Judge performance report
  - [ ] Sponsor visibility report

---

## 🎯 Phase 5: Multi-Event & SaaS Features
**Timeline: 3-4 weeks | Priority: MEDIUM**

### 5.1 Multi-Event Support
- [ ] **Event Switching**
  - [ ] Event selector in nav
  - [ ] Event-scoped data
  - [ ] Cross-event participant profiles
- [ ] **Event Templates**
  - [ ] Clone existing event
  - [ ] Pre-built templates
  - [ ] Save custom templates

### 5.2 Organization Management
- [ ] **Organization Accounts**
  - [ ] Create organization
  - [ ] Invite team members
  - [ ] Role management (owner, admin, member)
- [ ] **Branding**
  - [ ] Custom subdomain
  - [ ] White-label options
  - [ ] Custom email domain

### 5.3 Subscription & Billing
- [ ] **Pricing Tiers**
  - [ ] Free tier (limited participants)
  - [ ] Pro tier (more participants, features)
  - [ ] Enterprise tier (custom)
- [ ] **Stripe Integration**
  - [ ] Subscription management
  - [ ] Usage-based billing
  - [ ] Invoice generation
- [ ] **Trial Period**
  - [ ] 14-day free trial
  - [ ] Trial expiration handling

---

## 🎯 Phase 6: Enhanced Features
**Timeline: Ongoing | Priority: LOW**

### 6.1 Sponsor Management
- [ ] **Sponsor Portal**
  - [ ] Sponsor registration
  - [ ] Visibility packages
  - [ ] Logo placement management
- [ ] **Sponsor Analytics**
  - [ ] Brand impressions
  - [ ] Engagement metrics
  - [ ] Lead capture

### 6.2 Mentor System
- [ ] **Mentor Registration**
  - [ ] Mentor profiles
  - [ ] Availability scheduling
  - [ ] Expertise tags
- [ ] **Booking System**
  - [ ] Teams book mentor sessions
  - [ ] Calendar integration
  - [ ] Video call links

### 6.3 Virtual Event Support
- [ ] **Video Integration**
  - [ ] Embed virtual meeting rooms
  - [ ] Live streaming support
  - [ ] Recording & playback
- [ ] **Virtual Booths**
  - [ ] Sponsor virtual booths
  - [ ] Interactive elements

### 6.4 Mobile App
- [ ] **React Native App**
  - [ ] Push notifications
  - [ ] QR code scanning
  - [ ] Offline support
- [ ] **PWA Enhancement**
  - [ ] Install prompt
  - [ ] Offline page caching

---

## 🔧 Technical Debt & Improvements

### Code Quality
- [ ] **Testing**
  - [ ] Unit tests with Vitest
  - [ ] Integration tests
  - [ ] E2E tests with Playwright
  - [ ] Minimum 80% coverage target
- [ ] **Error Handling**
  - [ ] Global error boundary
  - [ ] API error handling utilities
  - [ ] User-friendly error messages
  - [ ] Error logging (Sentry)
- [ ] **Performance**
  - [ ] Image optimization (next/image)
  - [ ] Code splitting
  - [ ] Lazy loading components
  - [ ] Bundle size analysis

### DevOps
- [ ] **CI/CD Pipeline**
  - [ ] GitHub Actions workflow
  - [ ] Automated testing on PR
  - [ ] Preview deployments
  - [ ] Production deployment
- [ ] **Monitoring**
  - [ ] Uptime monitoring
  - [ ] Performance monitoring (Vercel Analytics)
  - [ ] Error tracking (Sentry)
- [ ] **Database**
  - [ ] Database backups
  - [ ] Migration strategy
  - [ ] Seed data scripts

### Security
- [ ] **Security Audit**
  - [ ] RLS policies review
  - [ ] API rate limiting
  - [ ] Input sanitization
  - [ ] CORS configuration
- [ ] **Compliance**
  - [ ] GDPR compliance
  - [ ] Privacy policy
  - [ ] Terms of service
  - [ ] Cookie consent

---

## 🐛 Known Bugs & Fixes Needed

### High Priority
- [ ] Fix: Form validation error display improvements
- [ ] Fix: Mobile navigation menu functionality
- [ ] Fix: Generate proper Supabase types (`supabase gen types typescript`)

### Medium Priority
- [ ] Fix: Countdown timer timezone handling
- [ ] Fix: Button loading states (some forms)
- [ ] Fix: Toast notification positioning

### Low Priority
- [ ] Fix: Smooth scroll behavior on Safari
- [ ] Fix: Focus trap in modals
- [ ] Fix: Keyboard navigation improvements

---

## 📱 Missing Pages to Build

### Public Pages
- [ ] `/events/[slug]/projects` - Project gallery (separate page)
- [ ] `/privacy` - Privacy policy
- [ ] `/terms` - Terms of service
- [ ] `/pricing` - SaaS pricing page
- [ ] `/contact` - Contact form
- [ ] `/about` - About the platform

### Dashboard Pages
- [ ] `/dashboard/[eventSlug]/schedule` - Personal schedule view
- [ ] `/dashboard/[eventSlug]/resources` - Event resources/downloads
- [ ] `/settings/profile` - Profile settings
- [ ] `/settings/notifications` - Notification preferences
- [ ] `/settings/security` - Password & security

### Admin Pages
- [ ] `/admin/[eventSlug]/teams` - Team management
- [ ] `/admin/[eventSlug]/judges` - Judge management
- [ ] `/admin/[eventSlug]/scores` - Scoring overview
- [ ] `/admin/[eventSlug]/announcements` - Create announcements
- [ ] `/admin/[eventSlug]/settings` - Event settings
- [ ] `/admin/[eventSlug]/export` - Data export
- [ ] `/admin/events/new` - Create new event
- [ ] `/admin/organization` - Organization settings

### Judge Pages
- [ ] `/judge/[eventSlug]/queue` - Project queue (separate view)
- [ ] `/judge/[eventSlug]/history` - Scoring history
- [ ] `/judge/[eventSlug]/project/[id]` - Individual project scoring (dedicated page)

---

## 📋 API Endpoints Needed

### Authentication
- `POST /api/auth/register`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`

### Events
- `GET /api/events`
- `GET /api/events/[slug]`
- `POST /api/events`
- `PUT /api/events/[id]`
- `DELETE /api/events/[id]`

### Registrations
- `POST /api/events/[slug]/register`
- `GET /api/events/[slug]/registrations`
- `PUT /api/registrations/[id]`
- `DELETE /api/registrations/[id]`

### Teams
- `POST /api/events/[slug]/teams`
- `GET /api/events/[slug]/teams`
- `PUT /api/teams/[id]`
- `POST /api/teams/[id]/join`
- `POST /api/teams/[id]/leave`

### Projects
- `POST /api/events/[slug]/projects`
- `GET /api/events/[slug]/projects`
- `PUT /api/projects/[id]`
- `GET /api/projects/[id]`

### Scores
- `POST /api/projects/[id]/scores`
- `GET /api/projects/[id]/scores`
- `PUT /api/scores/[id]`

---

## 🎨 Design System Improvements

### Components Needed
- [ ] Data table with sorting, filtering, pagination
- [ ] Date picker component
- [ ] Time picker component
- [ ] Rich text editor (for descriptions)
- [ ] Image cropper (for avatar upload)
- [ ] Tag input component
- [ ] Combobox / Autocomplete
- [ ] Command palette (⌘K)
- [ ] Confirmation dialog
- [ ] Toast notifications (already have Sonner)
- [ ] Loading spinner variants
- [ ] Empty state illustrations
- [ ] Error state component

### UX Improvements
- [ ] Add skeleton loading screens
- [ ] Improve form feedback
- [ ] Add success animations
- [ ] Implement optimistic updates
- [ ] Add keyboard shortcuts

---

## 💰 Monetization Readiness

### Before Selling
- [ ] Stripe integration complete
- [ ] Pricing page designed
- [ ] Free tier limitations implemented
- [ ] Billing dashboard
- [ ] Cancel subscription flow
- [ ] Upgrade/downgrade flow
- [ ] Invoice email templates

### Marketing
- [ ] Landing page optimization
- [ ] SEO meta tags
- [ ] Open Graph images
- [ ] Analytics integration
- [ ] Testimonials section
- [ ] Case studies

---

## 📅 Suggested Timeline

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Core Functionality | 4-6 weeks | � ~80% Complete |
| Phase 2: Judging & Scoring | 2-3 weeks | 🟡 ~70% Complete |
| Phase 3: Communication | 2-3 weeks | 🟡 ~40% Complete |
| Phase 4: Admin & Analytics | 2-3 weeks | 🟡 ~50% Complete |
| Phase 5: Multi-Event & SaaS | 3-4 weeks | 🔴 Not Started |
| Phase 6: Enhanced Features | Ongoing | 🔴 Not Started |

**Overall Progress:** ~55% Complete
**Estimated Time to MVP:** 3-4 weeks (remaining)
**Estimated Time to Full Product:** 10-14 weeks (remaining)

---

## 🎯 Quick Wins (Do Next)

### Immediate Priority
1. ✅ ~~Connect authentication with Supabase Auth~~
2. ✅ ~~Replace mock data on dashboard with real queries~~
3. ✅ ~~Build registration form that writes to database~~
4. ✅ ~~Implement team creation flow~~
5. ✅ ~~Add basic project submission form~~
6. ✅ ~~Create simple judge scoring interface~~
7. ✅ ~~Build participant list page for admin~~

### Next Up
1. Generate proper Supabase database types
2. Build profile settings page (`/settings/profile`)
3. Add CSV export functionality for admin
4. Create event creation form (`/admin/events/new`)
5. Implement email notifications (registration confirmations)
6. Add real-time updates with Supabase Realtime
7. Build admin announcement creation page

### Technical Debt
1. Run `supabase gen types typescript` to fix type issues
2. Add comprehensive error boundaries
3. Implement proper form validation feedback
4. Add unit tests for critical paths

---

*Last updated: February 10, 2026*
============================================================
# OAuth Configuration Guide - Fix GitHub & Google Login

## 🎯 Problem
OAuth providers (GitHub, Google) need to know where to redirect users after authentication. You need to configure redirect URLs in both Supabase AND the OAuth provider consoles.

## 📋 Step 1: Configure Supabase Auth Settings

1. Go to your Supabase Dashboard:
   https://app.supabase.com/project/cdezzoutlmymojjbkyzm/auth/url-configuration

2. Add these to **Site URL**:
   ```
   http://localhost:3000
   ```

3. Add these to **Redirect URLs** (one per line):
   ```
   http://localhost:3000/auth/callback
   http://localhost:3000
   https://*.githubpreview.dev/auth/callback
   https://*.githubpreview.dev
   ```

4. Click **Save**

## 📋 Step 2: Configure GitHub OAuth

### A. Get Your Callback URL

First, you need your actual Codespaces URL:
- Look at your PORTS tab in VS Code
- Find port 3000
- Copy the URL (format: `https://username-repo-xxxxx.githubpreview.dev`)

### B. Configure GitHub OAuth App

1. Go to: https://github.com/settings/developers
2. Click **OAuth Apps** → **New OAuth App** (or edit existing)
3. Fill in:
   ```
   Application name: Your Hackathon App (Dev)
   Homepage URL: https://your-codespace-url.githubpreview.dev
   Authorization callback URL: https://cdezzoutlmymojjbkyzm.supabase.co/auth/v1/callback
   ```
4. Click **Register application**
5. Click **Generate a new client secret**
6. **Copy** the Client ID and Client Secret

### C. Add to Supabase

1. Go to: https://app.supabase.com/project/cdezzoutlmymojjbkyzm/auth/providers
2. Find **GitHub** → Click **Enable**
3. Enter:
   - Client ID: (from GitHub)
   - Client Secret: (from GitHub)
4. Click **Save**

## 📋 Step 3: Configure Google OAuth

### A. Create Google OAuth Credentials

1. Go to: https://console.cloud.google.com/apis/credentials
2. Click **+ CREATE CREDENTIALS** → **OAuth client ID**
3. If prompted, configure OAuth consent screen first:
   - User Type: **External**
   - App name: Your Hackathon App
   - User support email: your@email.com
   - Developer contact: your@email.com
   - Click **Save and Continue** through all steps

4. Back to Create OAuth client ID:
   - Application type: **Web application**
   - Name: Hackathon App (Dev)
   
5. **Authorized JavaScript origins**:
   ```
   https://cdezzoutlmymojjbkyzm.supabase.co
   https://your-codespace-url.githubpreview.dev
   ```

6. **Authorized redirect URIs**:
   ```
   https://cdezzoutlmymojjbkyzm.supabase.co/auth/v1/callback
   ```

7. Click **CREATE**
8. **Copy** the Client ID and Client Secret

### B. Add to Supabase

1. Go to: https://app.supabase.com/project/cdezzoutlmymojjbkyzm/auth/providers
2. Find **Google** → Click **Enable**
3. Enter:
   - Client ID: (from Google)
   - Client Secret: (from Google)
4. Click **Save**

## 📋 Step 4: Update Your .env.local (Optional)

You can remove these lines from `.env.local` since Supabase handles OAuth:
```diff
- GOOGLE_CLIENT_ID=...
- GOOGLE_CLIENT_SECRET=...
```

These are only needed if you're handling OAuth yourself (which you're not - Supabase handles it).

## 📋 Step 5: Restart Docker

```bash
docker compose down
docker compose up --build
```

## ✅ Testing OAuth

1. Open your app in the browser (via Codespaces port forwarding)
2. Go to Register or Login page
3. Click **"Continue with GitHub"** or **"Continue with Google"**
4. You should be redirected to the provider
5. After authorizing, you'll be redirected back to your app

## 🔍 Troubleshooting

### Error: "redirect_uri_mismatch"
**Problem**: The redirect URL doesn't match what's configured
**Solution**: 
- Double-check the redirect URI in Google/GitHub matches EXACTLY:
  `https://cdezzoutlmymojjbkyzm.supabase.co/auth/v1/callback`

### Error: "Invalid redirect URI"
**Problem**: The site URL isn't whitelisted in Supabase
**Solution**:
- Go to Supabase → Auth → URL Configuration
- Add your Codespaces URL to Redirect URLs

### OAuth button does nothing
**Problem**: OAuth not enabled in Supabase
**Solution**:
- Check Supabase → Auth → Providers
- Make sure GitHub/Google are enabled and have credentials

### Error: "Access blocked: This app's request is invalid"
**Problem**: Google OAuth consent screen not configured
**Solution**:
- Go to Google Cloud Console → OAuth consent screen
- Fill in required fields and add test users

## 📝 For Production Deployment

When you deploy to production, you'll need to:

1. **Update Supabase URLs**:
   - Add production domain to Redirect URLs
   - Update Site URL

2. **Update GitHub OAuth**:
   - Create new OAuth app OR
   - Add production callback URL to existing app

3. **Update Google OAuth**:
   - Add production domain to Authorized origins
   - Keep the same Supabase callback URL

4. **Environment Variables**:
   - Update `NEXT_PUBLIC_APP_URL` and `NEXT_PUBLIC_SITE_URL` to production URLs

## 🎯 Quick Reference

**Supabase Callback URL** (use this everywhere):
```
https://cdezzoutlmymojjbkyzm.supabase.co/auth/v1/callback
```

**Your Codespaces URL** (get from PORTS tab):
```
https://your-username-repo-xxxxx.githubpreview.dev
```

This callback URL is the SAME for both GitHub and Google OAuth!