# due.college — College Deadline Tracker

> Never miss a college application deadline. Add your schools, get reminders, keep parents in the loop.

[![Next.js](https://img.shields.io/badge/Next.js-14-black)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://typescriptlang.org)
[![Supabase](https://img.shields.io/badge/Supabase-database-green)](https://supabase.com)
[![Clerk](https://img.shields.io/badge/Clerk-auth-purple)](https://clerk.com)

---

## What it does

- 🎓 Track ED1, ED2, EA, REA, RD, FAFSA, and Decision deadlines for 50+ schools
- ⏰ Email + SMS reminders at 30, 14, 7, 3, and 1 day before each deadline
- 👪 Parent read-only dashboard with SMS opt-in
- 📅 Google Calendar export (.ics)
- ⚠️ Conflict detection when multiple deadlines land in the same week
- 💳 Stripe subscriptions (Free / Plus $4.99 / Family $7.99)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 App Router |
| Styling | Tailwind CSS |
| Auth | Clerk (Google + email/password) |
| Database | Supabase (PostgreSQL) |
| Email | Resend |
| SMS | Twilio |
| Background Jobs | Inngest |
| Notifications | Knock.app |
| Payments | Stripe |
| Analytics | Vercel Analytics |

---

## Setup Guide

### 1. Clone & install

```bash
git clone https://github.com/yourusername/due-college.git
cd due-college
npm install
```

### 2. Environment variables

```bash
cp .env.example .env.local
```

Fill in every value in `.env.local`. See the comments in `.env.example` for where to get each key.

### 3. Supabase setup

1. Create a new project at [supabase.com](https://supabase.com)
2. In the SQL editor, run both migration files **in order**:
   - `supabase/migrations/001_initial_schema.sql` — creates all tables + RLS policies
   - `supabase/migrations/002_seed_data.sql` — inserts 50 colleges + all deadlines
3. Copy your project URL and keys into `.env.local`

### 4. Clerk setup

1. Create an app at [clerk.com](https://clerk.com)
2. Enable Google OAuth and email/password sign-in
3. Set these redirect URLs in the Clerk dashboard:
   - Sign-in URL: `/login`
   - Sign-up URL: `/start`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`
4. Copy your publishable key and secret key into `.env.local`

### 5. Resend setup

1. Create an account at [resend.com](https://resend.com)
2. Add and verify your sending domain (or use `@resend.dev` for testing)
3. Update the `from` address in email sending calls if needed
4. Copy your API key into `.env.local`

### 6. Twilio setup

1. Create an account at [twilio.com](https://twilio.com)
2. Get a phone number with SMS capability
3. Copy your Account SID, Auth Token, and phone number into `.env.local`

### 7. Inngest setup

1. Create an account at [inngest.com](https://inngest.com)
2. Create a new app
3. Copy your Event Key and Signing Key into `.env.local`
4. For local development, run the Inngest dev server:
   ```bash
   npx inngest-cli@latest dev
   ```
   Then start your Next.js app and register functions at:
   `http://localhost:8288` → Add app URL: `http://localhost:3000/api/inngest`

### 8. Stripe setup

1. Create an account at [stripe.com](https://stripe.com)
2. Create two subscription products in the Stripe Dashboard:
   - **Plus** — $4.99/month recurring
   - **Family** — $7.99/month recurring
3. Copy the Price IDs (starts with `price_`) into `.env.local`
4. Set up a webhook endpoint pointing to `https://yourdomain.com/api/stripe/webhook`
5. Enable these events:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
6. Copy the webhook signing secret into `.env.local`

### 9. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Screens

| Route | Description | Auth |
|---|---|---|
| `/` | Homepage with college search | Public |
| `/start` | Sign-up / email capture | Public |
| `/login` | Sign-in page | Public |
| `/dashboard` | Main deadline dashboard | 🔒 Required |
| `/school/[id]` | School detail + deadline table | Public |
| `/invite` | Invite parent form | 🔒 Required |
| `/parent/[token]` | Parent read-only view | Public (token) |
| `/settings` | Profile + notification prefs | 🔒 Required |
| `/upgrade` | Pricing / Stripe checkout | 🔒 Required |

---

## Database Schema

```
colleges              → 50 pre-seeded schools
deadlines             → All deadlines per school (ED1, EA, RD, FAFSA, Decision…)
users                 → Clerk-linked user profiles + subscription tier
user_colleges         → Which schools each user is tracking
user_deadline_status  → "Mark as submitted" per deadline per user
parent_connections    → Parent invite tokens + contact info
notification_preferences → Per-user reminder settings
```

---

## Inngest Background Functions

| Function | Trigger | What it does |
|---|---|---|
| `scheduleReminders` | `app/college.added` | Schedules all reminder events for 30/14/7/3/1 days before each deadline |
| `sendEmailReminder` | `app/reminder.email` | Sends deadline reminder email via Resend with checklist |
| `sendSMSReminder` | `app/reminder.sms` | Sends SMS via Twilio (Plus/Family only) |
| `sendParentReminder` | `app/reminder.parent` | Emails + SMSes parent (Family only for SMS) |
| `weeklyFamilySummary` | Cron: Sunday 9am | Weekly digest email to student + parent (Family only) |
| `conflictDetection` | `app/conflict.check` | Alerts user if multiple deadlines land in the same week |

---

## Subscription Tiers

| Feature | Free | Plus | Family |
|---|---|---|---|
| Email reminders | ✅ | ✅ | ✅ |
| Schools tracked | Up to 10 | Unlimited | Unlimited |
| Deadline dashboard | ✅ | ✅ | ✅ |
| Parent read-only view | ✅ | ✅ | ✅ |
| SMS reminders (student) | ❌ | ✅ | ✅ |
| Google Calendar export | ❌ | ✅ | ✅ |
| Conflict alerts | ❌ | ✅ | ✅ |
| Submitted tracking | ❌ | ✅ | ✅ |
| Parent SMS reminders | ❌ | ❌ | ✅ |
| Weekly family summary | ❌ | ❌ | ✅ |
| Price | $0 | $4.99/mo | $7.99/mo |

---

## Deployment (Vercel)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set env vars in Vercel dashboard or via CLI:
vercel env add NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
# ... (repeat for all vars in .env.example)
```

After deploying:
1. Update your Stripe webhook URL to your production domain
2. Update Clerk redirect URLs to your production domain
3. Update `NEXT_PUBLIC_APP_URL` to your production URL
4. Register Inngest functions at `https://yourdomain.com/api/inngest`

---

## Project Structure

```
src/
├── app/
│   ├── layout.tsx               # Root layout with Clerk + Analytics
│   ├── page.tsx                 # Homepage (/)
│   ├── start/page.tsx           # Sign-up (/start)
│   ├── login/page.tsx           # Sign-in (/login)
│   ├── dashboard/page.tsx       # Main dashboard (/dashboard)
│   ├── school/[id]/page.tsx     # School detail (/school/[id])
│   ├── invite/page.tsx          # Parent invite (/invite)
│   ├── parent/[token]/page.tsx  # Parent read-only (/parent/[token])
│   ├── settings/page.tsx        # Settings (/settings)
│   ├── upgrade/page.tsx         # Pricing (/upgrade)
│   └── api/                     # All API routes
│       ├── colleges/
│       ├── deadlines/
│       ├── user-colleges/
│       ├── user-deadlines/
│       ├── deadline-status/
│       ├── user-profile/
│       ├── notification-preferences/
│       ├── invite-parent/
│       ├── parent-view/[token]/
│       ├── stripe/checkout/
│       ├── stripe/webhook/
│       └── inngest/
├── components/
│   ├── CollegeSearch.tsx        # Live college search with dropdown
│   ├── DeadlineCard.tsx         # Individual deadline card
│   ├── DeadlineTable.tsx        # Full deadline table for school detail
│   ├── ConflictAlert.tsx        # Yellow conflict warning banner
│   ├── MobileNav.tsx            # Bottom nav for mobile
│   └── PricingCard.tsx          # Pricing tier card
├── emails/
│   ├── welcome.ts               # Welcome email
│   ├── deadline-reminder.ts     # Reminder email with checklist
│   ├── conflict-alert.ts        # Conflict alert email
│   ├── parent-invite.ts         # Parent invite email
│   ├── submission-confirmation.ts # Submission confirmation email
│   └── weekly-summary.ts        # Weekly family summary email
├── inngest/
│   ├── client.ts                # Inngest client
│   └── functions/
│       ├── schedule-reminders.ts
│       ├── send-email-reminder.ts
│       ├── send-sms-reminder.ts
│       ├── send-parent-reminder.ts
│       ├── weekly-family-summary.ts
│       └── conflict-detection.ts
├── lib/
│   ├── types.ts                 # All TypeScript types
│   ├── utils.ts                 # Date helpers, color utils, ICS generator
│   ├── supabase.ts              # Client-side Supabase
│   └── supabase-server.ts       # Server-side Supabase (service role)
└── middleware.ts                # Clerk auth middleware
supabase/
├── migrations/
│   ├── 001_initial_schema.sql   # Tables + RLS policies
│   └── 002_seed_data.sql        # 50 colleges + deadlines
```

---

## Contributing

PRs welcome. Please open an issue first for large changes.

---

## License

MIT
