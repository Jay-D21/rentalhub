# 🛠️ RentalHub — Tech Stack & Tools

**Last updated:** June 1, 2026 | **Version:** 1.0

> Every language, framework, tool, API, and service we're using — from frontend to backend to infrastructure. This is the single source of truth for the engineering team.

---

## Quick Overview

```
┌──────────────────────────────────────────────────────────────────┐
│  FRONTEND         Next.js 14 (React) + Flutter (Phase 2)       │
│  BACKEND          Supabase (PostgreSQL + Auth + Edge Functions)  │
│  PAYMENTS         Razorpay (Route + Escrow)                      │
│  AI               OpenAI GPT-4o / GPT-4o-mini                   │
│  REAL-TIME        Supabase Realtime (WebSocket)                  │
│  CACHE            Upstash Redis                                  │
│  SEARCH           pgvector (semantic) + PostgreSQL (full-text)   │
│  FILES            Supabase Storage + Cloudflare R2               │
│  AUTH / KYC       Supabase Auth + DigiLocker + MSG91             │
│  NOTIFICATIONS    WhatsApp (Wati) + Push (FCM) + Email (Resend)  │
│  LOGISTICS        Dunzo / Porter API                             │
│  HOSTING          Vercel (web) + Supabase (backend)              │
│  MONITORING       Sentry + PostHog + Grafana                     │
└──────────────────────────────────────────────────────────────────┘
```

---

## 1. Frontend

### 1.1 Web Application (Phase 1 — Primary)

| Component | Technology | Why |
|-----------|-----------|-----|
| **Framework** | [Next.js 14](https://nextjs.org/) (App Router) | SSR for SEO, ISR for listings, API routes as backend proxy, React ecosystem |
| **Language** | TypeScript | Type safety across frontend, shared types with backend |
| **Styling** | Tailwind CSS v3 | Rapid iteration, design tokens, responsive utilities |
| **Animations** | Framer Motion | Scroll reveals, page transitions, micro-interactions |
| **State Management** | Zustand | Lightweight, no boilerplate, scales well |
| **Form Handling** | React Hook Form + Zod | Validated forms for booking, listing creation, signup |
| **Data Fetching** | TanStack Query (React Query) | Caching, optimistic updates, real-time sync |
| **Maps** | Google Maps JavaScript API | Listing locations, nearby search, delivery tracking |
| **Image Handling** | Next.js `<Image>` + Cloudflare CDN | Optimized loading, WebP conversion, lazy loading |
| **PWA** | next-pwa | Installable on mobile, offline-first browse, push notifications |
| **Icons** | Lucide React | Consistent, lightweight SVG icon set |
| **Font** | DM Serif Display + Outfit (Google Fonts) | Brand typography — warm editorial serif + clean sans-serif |

### 1.2 Landing Page (Current)

| Component | Technology | Notes |
|-----------|-----------|-------|
| **Structure** | Vanilla HTML5 | Zero dependencies, instant load |
| **Styling** | Vanilla CSS | Custom properties, mobile-first breakpoints (480/768/1024px) |
| **Interactions** | Vanilla JavaScript | IntersectionObserver reveals, counters, ticker, toast system |
| **Product Photos** | AI-generated PNG assets | 6 listing images via Google Imagen |

### 1.3 Mobile App (Phase 2)

| Component | Technology | Why |
|-----------|-----------|-----|
| **Framework** | [Flutter](https://flutter.dev/) (Dart) | Single codebase → iOS + Android, native performance |
| **State** | Riverpod | Production-grade state management for Flutter |
| **HTTP** | Dio | Interceptors for auth tokens, retry logic |
| **Push** | Firebase Cloud Messaging (FCM) | Native push notifications |
| **Camera** | `camera` + `image_picker` | In-app photo capture for handover evidence |
| **Maps** | Google Maps Flutter | Pickup/delivery location selection |
| **Local Storage** | Hive / SharedPreferences | Offline caching, draft listings |

---

## 2. Backend

### 2.1 Core Platform

| Component | Technology | Why |
|-----------|-----------|-----|
| **Platform** | [Supabase](https://supabase.com/) | Open-source Firebase alternative: Auth + DB + Storage + Realtime + Edge Functions — all in one |
| **Database** | PostgreSQL 15 (via Supabase) | ACID, JSONB for flexible schemas, mature ecosystem |
| **Vector Search** | pgvector extension | Semantic search over listing embeddings (1536-dim vectors from OpenAI) |
| **API Layer** | Supabase REST (PostgREST) + Next.js API Routes | Auto-generated CRUD APIs + custom business logic endpoints |
| **Edge Functions** | Supabase Edge Functions (Deno) | Webhook handlers, payment callbacks, notification triggers |
| **ORM / Query Builder** | Supabase JS Client + Drizzle ORM | Type-safe database queries, migrations |
| **Cron Jobs** | Supabase pg_cron | Scheduled tasks: stale listing cleanup, trust score recalculation, payout processing |
| **Real-time** | Supabase Realtime (WebSocket) | Live booking status updates, chat, delivery tracking |

### 2.2 Authentication & Identity

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Auth Provider** | Supabase Auth | JWT token management, session handling, refresh rotation |
| **Phone OTP** | [MSG91](https://msg91.com/) | SMS OTP delivery for phone verification (India-optimized) |
| **Identity KYC** | [DigiLocker API](https://digilocker.gov.in/) | Aadhaar name/DOB verification — government-grade KYC |
| **Business KYC** | Manual review + GST API | GST certificate verification, PAN validation for vendors |
| **Security** | Row Level Security (RLS) | Database-level access control — users see only their own data |
| **Rate Limiting** | Upstash Redis | API rate limits: 100 req/min per user, 10 bookings/hr |
| **Session** | JWT (1-hour access) + 30-day refresh token | Automatic silent refresh |

### 2.3 Caching & Performance

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Cache** | [Upstash Redis](https://upstash.com/) | Serverless Redis — booking locks (10-min TTL), session cache, rate limiting |
| **CDN** | Cloudflare R2 + CDN | Photo/document delivery at edge, zero egress fees |
| **SSR/ISR** | Next.js + Vercel Edge Network | Server-rendered pages for SEO, ISR for listing detail pages |

---

## 3. Database Schema

### Language: SQL (PostgreSQL 15)

**Core Tables:**

| Table | Records (Est. Year 1) | Key Feature |
|-------|----------------------|-------------|
| `users` | 30,000 | Trust score (0-100), KYC status, location |
| `listings` | 15,000 | pgvector embedding (1536-dim), availability calendar (JSONB) |
| `bookings` | 8,000 | 16-state state machine, OTP codes |
| `transactions` | 24,000 | Razorpay IDs, 12 transaction types |
| `reviews` | 6,000 | Two-way blind reveal, photo evidence |
| `disputes` | 400 | AI triage status, resolution amount |
| `listing_photos` | 60,000 | Write-once storage, GPS metadata, hash |
| `booking_photos` | 32,000 | Pre/post handover evidence, timestamped |
| `notifications` | 100,000+ | Multi-channel delivery status tracking |

**Key PostgreSQL Extensions:**
- `pgvector` — Vector similarity search for AI-powered listing discovery
- `pg_cron` — Scheduled background jobs (payouts, cleanup, trust recalculation)
- `pgroonga` or `pg_trgm` — Full-text search with fuzzy matching for Hindi + English

---

## 4. Payments & Financial

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Payment Gateway** | [Razorpay](https://razorpay.com/) | UPI, Cards, Wallets, Net Banking — India's leading gateway |
| **Escrow** | Razorpay Route | Hold rental amount + deposit until return confirmed |
| **Split Payments** | Razorpay Route (Linked Accounts) | Auto-split: 88% to lender, 12% platform commission |
| **Payouts** | Razorpay Payouts | T+2 automatic bank transfer to lender |
| **Refunds** | Razorpay Refunds API | Instant refund for cancellations, partial for disputes |
| **Webhooks** | Razorpay Webhook → Supabase Edge Function | Payment confirmation, refund status, payout completion |
| **Invoicing** | Auto-generated (GST-compliant) | Digital invoice for every transaction |

**Money Flow Per Booking:**
```
Renter pays → Razorpay → Escrow (rental + deposit + protection fee)
                                    ↓ (after safe return)
                             ├── 88% → Lender bank account (T+2)
                             ├── 12% → Platform revenue
                             ├── Deposit → Back to renter
                             └── Protection fee → Platform pool
```

---

## 5. AI & Machine Learning

| Feature | Model | Purpose |
|---------|-------|---------|
| **Semantic Search** | OpenAI `text-embedding-3-small` | Convert search queries + listing descriptions → 1536-dim vectors for similarity matching |
| **Intent Parsing** | GPT-4o-mini | Parse "camera for wedding shoot this weekend" → `{category: cameras, occasion: wedding, urgency: 3_days}` |
| **Listing Optimization** | GPT-4o-mini | Auto-improve titles, suggest competitive pricing based on market data |
| **Damage Detection** | GPT-4o Vision | Compare pre-rental vs post-rental photos → `{damage_detected: bool, confidence: 0-1, details: "..."}` |
| **Fraud Detection** | Custom rules + GPT-4o-mini | Anomaly detection: unusual booking patterns, fake listings, identity red flags |
| **Support Chatbot** | GPT-4o-mini (fine-tuned) | First-line support: booking help, refund status, listing guidance |
| **Dispute Triage** | GPT-4o | Analyze evidence (photos, chat, GPS logs) → recommend resolution for human reviewer |

**AI Cost Estimate (Month 6):**
```
Embeddings:     ~$15/month   (10K listings × 3 updates/month)
Search intent:  ~$30/month   (50K searches × GPT-4o-mini)
Damage detect:  ~$50/month   (2K returns × GPT-4o Vision)
Support bot:    ~$20/month   (5K conversations)
─────────────────────────────
Total AI cost:  ~$115/month  (~₹9,600)
```

---

## 6. Notifications

| Channel | Provider | Use Cases |
|---------|----------|-----------|
| **WhatsApp** | [Wati](https://www.wati.io/) / AiSensy (WhatsApp Business API) | Booking confirmations, payment receipts, return reminders, dispute updates — primary channel |
| **Push Notifications** | Firebase Cloud Messaging (FCM) | Real-time: delivery tracking, new booking alert, chat messages |
| **Email** | [Resend](https://resend.com/) | Transactional: KYC verification, payout receipts, dispute resolution reports |
| **SMS** | [MSG91](https://msg91.com/) | OTP only — phone verification at signup |
| **In-App** | Supabase Realtime | Notification bell, live booking status, chat bubbles |

**Template Engine:** Pre-built WhatsApp templates (approved by Meta) for all 12 booking lifecycle events.

---

## 7. Logistics

| Component | Provider | Purpose |
|-----------|----------|---------|
| **Delivery** | [Dunzo](https://www.dunzo.com/) API (primary) | Intracity delivery: pickup from lender → drop to renter |
| **Backup Delivery** | [Porter](https://porter.in/) API | Fallback for larger items or Dunzo unavailability |
| **Tracking** | Dunzo/Porter webhook events | Real-time location updates pushed to renter via WebSocket |
| **Pricing** | Dynamic (API quote) | Delivery fee calculated per-booking based on distance |
| **Self Pickup** | In-app coordination | Share area (not exact address) → reveal full address after booking → OTP handover |

---

## 8. Hosting & Infrastructure

| Component | Provider | Purpose |
|-----------|----------|---------|
| **Web Hosting** | [Vercel](https://vercel.com/) | Next.js hosting with edge network, automatic SSL, preview deployments |
| **Backend** | [Supabase Cloud](https://supabase.com/) | Managed PostgreSQL, Auth, Storage, Edge Functions, Realtime |
| **File Storage** | Supabase Storage + [Cloudflare R2](https://cloudflare.com/r2) | Photos & documents — write-once policy, CDN delivery, zero egress |
| **Redis** | [Upstash](https://upstash.com/) | Serverless Redis — pay per request, no server management |
| **DNS** | Cloudflare | DNS management, DDoS protection, edge caching |
| **SSL** | Auto (Vercel + Cloudflare) | HTTPS everywhere, auto-renewal |
| **Domain** | rentalhub.in | Primary domain |
| **Landing Page** | GitHub Pages | Current marketing page at `jay-d21.github.io/rentalhub` |

**Infrastructure Cost Estimate (Month 1-6):**
```
Vercel (Pro):         $20/month
Supabase (Pro):       $25/month
Upstash Redis:         $0/month   (free tier: 10K req/day)
Cloudflare R2:         $0/month   (free tier: 10GB storage)
Domain:               $10/year
─────────────────────────────────
Total infra:          ~$45/month  (~₹3,750)
```

---

## 9. Monitoring & Analytics

| Component | Tool | Purpose |
|-----------|------|---------|
| **Error Tracking** | [Sentry](https://sentry.io/) | Crash reports, error grouping, release tracking |
| **Product Analytics** | [PostHog](https://posthog.com/) | User funnels, feature flags, session recordings, A/B testing |
| **Infrastructure Monitoring** | Supabase Dashboard + Grafana | DB performance, API latency, storage usage |
| **Uptime** | [Better Uptime](https://betterstack.com/) | Downtime alerts via SMS/Slack |
| **Logging** | Vercel Logs + Supabase Logs | Request logs, function execution logs, DB query logs |
| **Business Dashboard** | Custom (Next.js admin panel) | Revenue, bookings, trust scores, disputes, category performance |

---

## 10. Security

| Layer | Implementation | Details |
|-------|---------------|---------|
| **Identity** | Supabase Auth (JWT) + MSG91 OTP + DigiLocker | Multi-factor: phone + Aadhaar |
| **Authorization** | Row Level Security (RLS) + RBAC | Roles: renter, lender, vendor, admin, super_admin |
| **Data Encryption** | AES-256 at rest | KYC data (Aadhaar, PAN) encrypted in database |
| **PII Protection** | API response filtering | Phone, Aadhaar number NEVER exposed in API responses |
| **Payment Security** | Razorpay (PCI-DSS Level 1) | Zero card data on our servers |
| **Webhook Verification** | HMAC signature check | All Razorpay/Dunzo webhooks signature-verified |
| **Fraud Prevention** | Velocity checks + device fingerprinting | Max 3 bookings/day, new user caps at ₹5,000 |
| **Photo Evidence** | Write-once storage + GPS + timestamp + hash | Immutable handover records for disputes |
| **Compliance** | DPDPA (India Data Protection) | Explicit consent, data deletion on request, 6-hour breach reporting |
| **Rate Limiting** | Upstash Redis | 100 req/min per user, 10 booking attempts/hour |

---

## 11. Development & Collaboration Tools

| Category | Tool | Purpose |
|----------|------|---------|
| **Version Control** | [Git](https://git-scm.com/) + [GitHub](https://github.com/Jay-D21/rentalhub) | Source code, PR reviews, CI/CD |
| **CI/CD** | Vercel (auto-deploy on push) + GitHub Actions | Auto deploy preview on PR, production on merge to main |
| **Package Manager** | pnpm | Fast, disk-efficient Node.js package management |
| **Linting** | ESLint + Prettier | Code quality and formatting consistency |
| **Type Checking** | TypeScript (strict mode) | Catch bugs at compile time |
| **Testing** | Vitest (unit) + Playwright (E2E) | Component tests + full user flow testing |
| **Database Migrations** | Drizzle Kit | Version-controlled schema changes |
| **API Testing** | Hoppscotch / Postman | Manual API endpoint testing |
| **Design** | Figma | UI/UX design, component library, prototyping |
| **Communication** | Slack / Discord | Team communication |
| **Documentation** | Markdown (in-repo) + Notion | Technical docs in repo, product docs in Notion |
| **Task Management** | Linear / GitHub Issues | Sprint planning, bug tracking |

---

## 12. Third-Party API Summary

| API | Purpose | Pricing Model | Est. Monthly Cost |
|-----|---------|---------------|-------------------|
| Razorpay | Payments, escrow, payouts | 2% per transaction | ~₹3,000 (Month 6) |
| DigiLocker | Aadhaar KYC verification | Free (government API) | ₹0 |
| MSG91 | SMS OTP | ₹0.20 per SMS | ~₹600 |
| OpenAI | AI search, damage detection, chatbot | Usage-based | ~₹9,600 |
| Wati (WhatsApp) | WhatsApp Business messages | ₹2,499/month + per message | ~₹4,000 |
| Resend | Transactional email | Free tier (3K emails/month) | ₹0 |
| Dunzo | Delivery | Per-delivery fee (passed to user) | ₹0 (user pays) |
| Google Maps | Location services | $200 free credit/month | ₹0 |
| FCM | Push notifications | Free | ₹0 |
| Sentry | Error tracking | Free tier (5K events) | ₹0 |
| PostHog | Analytics | Free tier (1M events) | ₹0 |

**Total Third-Party Cost (Month 6): ~₹17,200/month (~$207)**

---

## 13. Languages Used

| Language | Where | % of Codebase |
|----------|-------|---------------|
| **TypeScript** | Next.js frontend + API routes | ~55% |
| **SQL** | PostgreSQL schemas, queries, RLS policies, migrations | ~15% |
| **Dart** | Flutter mobile app (Phase 2) | ~20% (Phase 2) |
| **HTML/CSS/JS** | Landing page, email templates | ~8% |
| **Deno/TypeScript** | Supabase Edge Functions | ~2% |

---

## 14. Architecture Diagram

```
                    ┌─────────────────┐
                    │   USERS          │
                    │  (Renter/Lender) │
                    └────────┬────────┘
                             │
                    ┌────────▼────────┐
                    │  Vercel Edge     │
                    │  (Next.js SSR)   │
                    │  + Cloudflare    │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                   │
  ┌────────▼─────┐  ┌───────▼──────┐  ┌────────▼─────┐
  │ Supabase     │  │ Upstash      │  │ External     │
  │ ─────────    │  │ Redis        │  │ APIs         │
  │ • PostgreSQL │  │ ─────────    │  │ ─────────    │
  │ • Auth       │  │ • Locks      │  │ • Razorpay   │
  │ • Storage    │  │ • Cache      │  │ • DigiLocker │
  │ • Realtime   │  │ • Rate limit │  │ • Dunzo      │
  │ • Edge Funcs │  │              │  │ • OpenAI     │
  │ • pgvector   │  │              │  │ • Wati       │
  └──────────────┘  └──────────────┘  │ • MSG91      │
                                       │ • FCM        │
                                       │ • Resend     │
                                       │ • Google Maps│
                                       └──────────────┘
```

---

## 15. Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# Razorpay
RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=

# OpenAI
OPENAI_API_KEY=

# DigiLocker
DIGILOCKER_CLIENT_ID=
DIGILOCKER_CLIENT_SECRET=

# MSG91
MSG91_AUTH_KEY=
MSG91_TEMPLATE_ID=

# WhatsApp (Wati)
WATI_API_URL=
WATI_API_TOKEN=

# Email (Resend)
RESEND_API_KEY=

# Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_KEY=

# Redis (Upstash)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Sentry
SENTRY_DSN=

# PostHog
NEXT_PUBLIC_POSTHOG_KEY=
```

---

> [!IMPORTANT]
> **This document should be updated every time a new tool, API, or technology is added to the stack.** If it's not in this document, it shouldn't be in the codebase.

---

*© 2026 RentalHub. Internal engineering document.*
