# 🛠️ RentalHub — Complete Tech Stack & Engineering Blueprint

**Version:** 3.0 (Final) | **Last updated:** June 1, 2026

> The definitive engineering reference for RentalHub. Every tool, language, framework, API, database, and service — with exact versions, costs, alternatives considered, and phase-wise migration paths.
>
> **Decision rationale:** See [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) for the Council-style debate behind each choice.

---

## Table of Contents

1. [Stack at a Glance](#1-stack-at-a-glance)
2. [Design Principles](#2-design-principles)
3. [Frontend — Web](#3-frontend--web)
4. [Frontend — Mobile](#4-frontend--mobile)
5. [Frontend — Landing Page](#5-frontend--landing-page)
6. [Backend — Core Platform](#6-backend--core-platform)
7. [Backend — AI Microservice](#7-backend--ai-microservice)
8. [Database](#8-database)
9. [Authentication & Identity](#9-authentication--identity)
10. [Payments & Financial](#10-payments--financial)
11. [AI & Machine Learning](#11-ai--machine-learning)
12. [Search & Discovery](#12-search--discovery)
13. [File Storage & CDN](#13-file-storage--cdn)
14. [Caching & Queues](#14-caching--queues)
15. [Real-Time](#15-real-time)
16. [Notifications](#16-notifications)
17. [Logistics & Delivery](#17-logistics--delivery)
18. [Hosting & Infrastructure](#18-hosting--infrastructure)
19. [Security](#19-security)
20. [Monitoring & Observability](#20-monitoring--observability)
21. [Development Tools](#21-development-tools)
22. [Third-Party API Registry](#22-third-party-api-registry)
23. [Languages & Codebase Split](#23-languages--codebase-split)
24. [Architecture Diagram](#24-architecture-diagram)
25. [Environment Variables](#25-environment-variables)
26. [Cost Projections](#26-cost-projections)
27. [Phase-Wise Roadmap](#27-phase-wise-roadmap)

---

## 1. Stack at a Glance

```
╔══════════════════════════════════════════════════════════════════════╗
║  LAYER              PHASE 1 (Now)              PHASE 2 (18+ mo)   ║
╠══════════════════════════════════════════════════════════════════════╣
║  Web Frontend       Next.js 14 (TypeScript)    Same                ║
║  Mobile             React Native + Expo        Same (or Flutter)   ║
║  Backend Core       Supabase (PostgreSQL)       + microservices     ║
║  Backend Logic      Next.js API Routes          + dedicated Node    ║
║  Backend AI         FastAPI (Python)            + self-hosted LLM   ║
║  Database           PostgreSQL 15 (Supabase)   + Citus sharding    ║
║  Vector Search      pgvector                   + Typesense          ║
║  Payments           Razorpay Route             + Juspay orchestr.  ║
║  AI (90% calls)     Gemini Flash               + self-hosted emb.  ║
║  AI (10% critical)  GPT-4o / GPT-4o Vision     Same                ║
║  Object Storage     Cloudflare R2 + Supabase   Same                ║
║  Cache / Queue      Upstash Redis + BullMQ     + ElastiCache       ║
║  Real-time          Supabase Realtime (WS)     Same                ║
║  Notifications      Wati + FCM + Resend        + Novu               ║
║  Delivery           Dunzo / Porter             Same                ║
║  Hosting            Vercel + Supabase Cloud    + AWS ECS            ║
║  Monitoring         Sentry + PostHog           + Grafana/Prom      ║
║  CI/CD              Vercel Auto + GH Actions   Same                ║
╚══════════════════════════════════════════════════════════════════════╝
```

**Primary Language:** TypeScript (72% of codebase — web + mobile + API + edge functions)

---

## 2. Design Principles

These five rules govern every technology choice:

| # | Principle | What it Means |
|---|-----------|--------------|
| 1 | **One language stack** | TypeScript everywhere (web, mobile, API, Edge). One hiring pipeline, one mental model. Python only for ML inference. |
| 2 | **Managed services until the bill hurts** | Don't hire a DevOps engineer when a $25/mo SaaS does the job. Migrate to self-hosted when monthly cost exceeds the salary equivalent. |
| 3 | **Clean abstractions** | Never call Razorpay/Supabase/OpenAI directly from business logic. Always through a service wrapper. Any vendor swap = changing 1 adapter file. |
| 4 | **PostgreSQL is the foundation** | Everything else is a feature layer. The database is the one thing we never throw away. |
| 5 | **Monitor before migrating** | Don't add Typesense "just in case." Add it when PostgreSQL search latency crosses 200ms in production logs. Every migration has a measurable trigger. |

---

## 3. Frontend — Web

### Framework: Next.js 14 (App Router)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | [Next.js](https://nextjs.org/) | 14.x (App Router) | SSR for SEO, ISR for listing pages, API routes for business logic |
| **Language** | TypeScript | 5.x (strict mode) | Type safety, shared types with mobile & backend |
| **Styling** | Tailwind CSS | 3.x | Utility-first, responsive design tokens, dark mode |
| **Animations** | Framer Motion | 11.x | Scroll reveals, page transitions, micro-interactions, layout animations |
| **State Management** | Zustand | 4.x | Lightweight global state — shared library with React Native |
| **Server State** | TanStack Query | 5.x | API caching, optimistic updates, infinite scroll, real-time sync |
| **Forms** | React Hook Form + Zod | 7.x + 3.x | Validated forms with type-safe schemas — schemas shared with mobile |
| **Maps** | Google Maps JS API | 3.x | Listing locations, nearby search, delivery tracking |
| **Image Optimization** | Next.js `<Image>` | Built-in | WebP/AVIF auto-conversion, lazy loading, responsive sizes |
| **PWA** | next-pwa | 5.x | Installable on mobile, offline browse, push via service worker |
| **Icons** | Lucide React | 0.4x | Consistent, tree-shakable SVG icon set (240+ icons) |
| **Typography** | DM Serif Display + Outfit | Google Fonts | Brand fonts: warm editorial serif + clean geometric sans |
| **Charts** | Recharts | 2.x | Earnings dashboard, booking analytics, trust score graphs |
| **Date Handling** | date-fns | 3.x | Lightweight date formatting/manipulation (no Moment.js bloat) |
| **i18n** | next-intl | 3.x | Hindi + English + Marathi (Phase 2, Pune-first) |

**Key Architecture Decisions:**
- **App Router** (not Pages Router): React Server Components for faster initial load, streaming SSR
- **ISR** for listing detail pages: SEO-indexed, revalidated every 60 seconds
- **API Routes** handle all business logic (booking engine, payments, trust scoring)
- **Edge Middleware** for geo-detection (redirect to nearest city), auth token validation

**Why Next.js over Remix/SvelteKit:** Largest hiring pool in India (10x more devs), best ISR implementation for SEO, native Supabase & Vercel integration, React ecosystem compatibility with React Native.

---

## 4. Frontend — Mobile

### Framework: React Native + Expo

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | [React Native](https://reactnative.dev/) | 0.76+ (New Architecture) | iOS + Android from one TypeScript codebase |
| **Dev Platform** | [Expo](https://expo.dev/) | SDK 52+ | Managed builds, OTA updates, prebuild for native modules |
| **Navigation** | Expo Router | 4.x | File-based routing (mirrors Next.js App Router patterns) |
| **State** | Zustand | 4.x | Same state library as web — shared store logic |
| **Server State** | TanStack Query | 5.x | Same data layer as web — shared query hooks |
| **Forms** | React Hook Form + Zod | 7.x + 3.x | Same validation schemas as web — zero duplication |
| **Camera** | expo-camera + expo-image-picker | SDK 52 | Photo capture for handover evidence, KYC selfie |
| **Maps** | react-native-maps | 1.x | Google Maps for listing locations, delivery tracking |
| **Push Notifications** | expo-notifications + FCM | SDK 52 | Managed push tokens, rich notifications with images |
| **Local Storage** | react-native-mmkv | 2.x | Ultra-fast key-value store (10x faster than AsyncStorage) |
| **OTA Updates** | EAS Update | Latest | Ship bug fixes instantly without App Store/Play Store review |
| **Payments** | Razorpay React Native SDK | 3.x | UPI, cards, wallets — native checkout sheet |
| **Biometrics** | expo-local-authentication | SDK 52 | FaceID / fingerprint for app unlock & payment confirmation |
| **Image Compression** | expo-image-manipulator | SDK 52 | Compress photos before upload (save bandwidth on 4G) |
| **Animations** | Reanimated | 3.x | 60fps native animations for pull-to-refresh, swipe gestures |
| **Gesture Handling** | react-native-gesture-handler | 2.x | Swipe cards, pinch-to-zoom on listing photos |

**Code Sharing with Web (TypeScript Unification):**
```
SHARED (npm workspace / monorepo):
├── packages/shared/
│   ├── types/          → TypeScript interfaces (User, Listing, Booking)
│   ├── validation/     → Zod schemas (createListing, bookItem, signup)
│   ├── constants/      → Categories, trust tiers, booking states
│   ├── utils/          → formatCurrency(), calculateTrustScore()
│   └── api/            → Supabase client, query hooks, API wrappers

WEB-ONLY (apps/web/):
├── Server Components, SSR, SEO, ISR

MOBILE-ONLY (apps/mobile/):
├── Camera, biometrics, push tokens, native gestures
```

**Estimated code sharing: 30-35%** (types, validation, API layer, business logic)

**Why React Native over Flutter:**
1. TypeScript shared with Next.js web — one language, one hiring pipeline
2. 3x larger developer pool in India (JavaScript dominance)
3. Expo Router mirrors Next.js App Router — consistent dev patterns
4. CodePush/EAS Update for OTA fixes — critical for early-stage rapid iteration

**Migration trigger to Flutter:** If camera/photo reliability for damage detection proves inadequate after 1,000+ handovers, evaluate Flutter for mobile-only while keeping web on Next.js.

---

## 5. Frontend — Landing Page

### Current Implementation (Vanilla, Zero Dependencies)

| Component | Technology | Details |
|-----------|-----------|---------|
| **Structure** | HTML5 | Semantic markup, single `index.html` |
| **Styling** | Vanilla CSS | Custom properties, mobile-first breakpoints (480/768/1024px) |
| **Interactions** | Vanilla JavaScript | IntersectionObserver reveals, animated counters, infinite ticker, toast system |
| **Product Photos** | AI-generated PNG | 6 listing images (camera, PS5, camping, drone, guitar, projector) |
| **Hosting** | GitHub Pages | `jay-d21.github.io/rentalhub` — zero cost |
| **Performance** | <1.5s first paint | No build step, no dependencies, instant load |

**Why Vanilla:** Landing page is a marketing asset, not a web app. Zero dependencies = zero build step = instant deployment = no breaking updates. Will be rebuilt in Next.js when the main app goes live.

---

## 6. Backend — Core Platform

### Platform: Supabase (Batteries-Included BaaS)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Platform** | [Supabase](https://supabase.com/) | Auth + Database + Storage + Realtime + Edge Functions — all managed |
| **Database** | PostgreSQL 15 | ACID transactions, JSONB, Row Level Security, mature ecosystem |
| **Auth** | Supabase Auth | JWT management, session rotation, social login (Google, Apple) |
| **Storage** | Supabase Storage (S3-backed) | Private files (KYC, handover evidence) with RLS-gated access |
| **Realtime** | Supabase Realtime (WebSocket) | Live booking status, chat, delivery tracking, notification bell |
| **Edge Functions** | Deno runtime | Lightweight triggers: webhook acknowledgment, notification dispatch, scheduled cleanup |
| **Cron** | pg_cron (PostgreSQL extension) | Scheduled jobs: trust score recalculation (daily), stale listing cleanup (weekly), analytics (nightly) |
| **API** | PostgREST (auto-generated REST) | CRUD operations auto-generated from schema — no boilerplate |
| **ORM** | Drizzle ORM | Type-safe queries, schema declarations, migration management |
| **Region** | AWS Mumbai (ap-south-1) | <50ms latency for Indian users |

### Business Logic: Next.js API Routes (Vercel Serverless)

| Module | Handles | Why Separate from Supabase |
|--------|---------|---------------------------|
| **Booking Engine** | Reserve → Lock → Confirm → State transitions | Complex state machine (16 states) needs transactional safety |
| **Payment Flow** | Razorpay order creation, webhook processing, refunds | Critical path — must survive Supabase outages |
| **Trust Scoring** | Calculate & update trust scores on events | Multi-table aggregation + business rules |
| **Admin Dashboard** | Revenue reports, dispute queue, user management | Custom queries, role-based views |
| **Search Orchestration** | Parse intent (AI) → vector search → rank → filter | Combines AI + database + business rules |

**Architecture rationale:** Supabase handles 70% of the backend (Auth, CRUD, Storage, Realtime). Next.js API Routes handle 30% (complex business logic on a separate, highly available service). If Supabase has a brief outage, users can't browse — but no payment is lost.

---

## 7. Backend — AI Microservice

### Framework: FastAPI (Python)

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Framework** | [FastAPI](https://fastapi.tiangolo.com/) | 0.110+ | High-performance async Python API for ML inference |
| **Runtime** | Python | 3.12 | Required for ML libraries, OpenAI/Google SDK |
| **AI SDK** | `google-generativeai` + `openai` | Latest | Multi-provider AI calls |
| **Image Processing** | Pillow + OpenCV | Latest | Pre-process photos before AI analysis (resize, normalize) |
| **Hosting** | Google Cloud Run (Mumbai) | Serverless | Auto-scales to zero when idle, scales to 100 instances under load |
| **Container** | Docker | Multi-stage build | Consistent deployment, fast cold starts |

**Endpoints:**

| Endpoint | Model Used | Latency Target | Purpose |
|----------|-----------|----------------|---------|
| `POST /ai/embed` | Gemini text-embedding-004 | <200ms | Generate listing embeddings for semantic search |
| `POST /ai/intent` | Gemini Flash | <300ms | Parse search query → structured filters |
| `POST /ai/optimize-listing` | Gemini Flash | <500ms | Improve listing title, description, pricing suggestion |
| `POST /ai/damage-detect` | GPT-4o Vision | <3s | Compare before/after photos → damage assessment |
| `POST /ai/dispute-triage` | GPT-4o | <5s | Analyze evidence → resolution recommendation |
| `POST /ai/chat` | Gemini Flash | <400ms | Support chatbot responses |
| `POST /ai/fraud-check` | Gemini Flash + rules | <300ms | Anomaly detection on new bookings |

**Why Python (not TypeScript for AI):** Google and OpenAI SDKs are Python-first. Image processing libraries (Pillow, OpenCV) are Python-native. ML community and resources are overwhelmingly Python. FastAPI's async performance matches Node.js for I/O-bound AI API calls.

---

## 8. Database

### Engine: PostgreSQL 15 via Supabase

**Core Tables:**

| Table | Est. Records (Year 1) | Key Columns | Key Feature |
|-------|----------------------|-------------|-------------|
| `users` | 30,000 | phone, name, type, kyc_status, trust_score, location | Trust score (0-100), KYC tier, geo coordinates |
| `listings` | 15,000 | title, category, price_daily, status, embedding, availability | pgvector 1536-dim embedding, JSONB availability calendar |
| `bookings` | 8,000 | listing_id, renter_id, status, handover_otp, return_otp | 16-state state machine, OTP handover verification |
| `transactions` | 24,000 | booking_id, amount, type, razorpay_payment_id | 12 transaction types, Razorpay reference IDs |
| `reviews` | 6,000 | booking_id, reviewer_id, rating, comment, is_visible | Two-way blind reveal (both submit before either sees) |
| `disputes` | 400 | booking_id, type, evidence_photos, status, resolution_amount | AI triage status, resolution amount |
| `listing_photos` | 60,000 | listing_id, url, hash, gps_lat, gps_lng, created_at | Write-once, GPS metadata, SHA-256 hash for integrity |
| `booking_photos` | 32,000 | booking_id, phase (pre/post), url, hash, timestamp | Immutable handover evidence with timestamps |
| `notifications` | 100,000+ | user_id, channel, template_id, status, sent_at | Multi-channel delivery tracking |
| `chat_messages` | 50,000+ | booking_id, sender_id, message, created_at | Booking-scoped conversation |

**PostgreSQL Extensions:**

| Extension | Purpose |
|-----------|---------|
| `pgvector` | Vector similarity search for AI-powered listing discovery (HNSW index) |
| `pg_cron` | Scheduled background jobs without external scheduler |
| `pg_trgm` | Trigram-based fuzzy text search (handles typos in Hindi + English) |
| `PostGIS` | Geographic queries: radius search, distance calculation, bounding box |
| `pgcrypto` | AES-256 encryption for KYC data at rest |

**Row Level Security (RLS):**
```sql
-- Users can only read their own data
CREATE POLICY "users_own_data" ON users
  FOR SELECT USING (auth.uid() = id);

-- Lenders can only modify their own listings
CREATE POLICY "lender_own_listings" ON listings
  FOR ALL USING (auth.uid() = lender_id);

-- Booking data visible only to involved parties
CREATE POLICY "booking_parties" ON bookings
  FOR SELECT USING (auth.uid() = renter_id OR auth.uid() = lender_id);
```

**Scaling plan:**
- **0–100K users:** Single Supabase Pro instance (vertical scaling)
- **100K–1M users:** Add read replicas for search-heavy queries
- **1M–10M users:** Evaluate Citus (PostgreSQL sharding extension) or CockroachDB migration
- **10M+ users:** Dedicated PostgreSQL cluster on AWS RDS with Citus

---

## 9. Authentication & Identity

| Layer | Technology | Details |
|-------|-----------|---------|
| **Auth Provider** | Supabase Auth | JWT access tokens (1-hour), refresh tokens (30-day), automatic silent refresh |
| **Phone Verification** | [MSG91](https://msg91.com/) | SMS OTP — ₹0.20/SMS, India-optimized delivery, 4-digit OTP with 5-min expiry |
| **Identity KYC (Tier 2)** | [DigiLocker API](https://digilocker.gov.in/) | Government API — Aadhaar name + DOB verification. Free. No Aadhaar number stored. |
| **Business KYC (Tier 3)** | GST API + Manual review | GST certificate verification, PAN validation, trade name matching |
| **Social Login** | Supabase Auth (Google, Apple) | OAuth2 — optional, supplements phone-based auth |
| **Session Management** | JWT + Refresh Token Rotation | Access token: 1 hour. Refresh token: 30 days, single-use (rotation prevents replay attacks) |
| **Rate Limiting** | Upstash Redis | 100 req/min per user, 10 booking attempts/hour, 5 OTP requests/hour |
| **Authorization** | Row Level Security + RBAC | Roles: `renter`, `individual_lender`, `vendor`, `admin`, `super_admin` |

**KYC Tiers:**

| Tier | Requirements | Privileges |
|------|-------------|------------|
| **Tier 3** (Basic) | Phone number verified | Browse, search. Cannot book or list. |
| **Tier 2** (Verified) | + Aadhaar via DigiLocker | Book items up to ₹5,000. List items. |
| **Tier 1** (Trusted) | + Trust score ≥ 70, 5+ completed rentals | No booking caps. Featured badges. Priority support. |

---

## 10. Payments & Financial

### Gateway: Razorpay (Phase 1) → Juspay Orchestration (Phase 2)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Payment Gateway** | [Razorpay](https://razorpay.com/) | UPI, cards, wallets, net banking — 96% success rate |
| **Escrow** | Razorpay Route | Hold rental + deposit in escrow until return confirmed |
| **Split Payments** | Razorpay Route (Linked Accounts) | Auto-split: 88% lender, 12% platform on settlement |
| **Payouts** | Razorpay Payouts | T+2 bank transfer to lender, instant UPI payout option |
| **Refunds** | Razorpay Refunds API | Full refund on cancellation, partial on dispute resolution |
| **Webhooks** | Razorpay → BullMQ → Process | Payment confirmation, refund status, payout completion |
| **Invoicing** | Auto-generated (GST-compliant) | Digital invoice PDF for every transaction |

**Money Flow Per Booking:**
```
RENTER PAYS ────┐
                │
    ┌───────────▼──────────────┐
    │     RAZORPAY ESCROW      │
    │  ┌─────────────────────┐ │
    │  │ Rental amount       │ │
    │  │ Security deposit    │ │
    │  │ Protection fee (6%) │ │
    │  │ Delivery fee        │ │
    │  └─────────────────────┘ │
    └───────────┬──────────────┘
                │
        ┌───────┴────── (After safe return confirmed) ──────┐
        │                                                     │
   ┌────▼─────┐  ┌──────────┐  ┌────────────┐  ┌──────────┐
   │ 88%      │  │ 12%      │  │ Deposit    │  │ Protect. │
   │ → Lender │  │ → Platform│  │ → Renter   │  │ → Pool   │
   │ (T+2)    │  │ (revenue) │  │ (refund)   │  │ (reserve)│
   └──────────┘  └──────────┘  └────────────┘  └──────────┘
```

**Phase 2: Juspay Orchestration (at ₹1Cr+ monthly GMV)**
```
User Payment → Juspay → Routes to:
  ├── Razorpay (primary, 70% traffic)
  ├── Cashfree (lower fees, 20% traffic)
  └── PayU (fallback, 10% traffic)

Benefits: 99.9% uptime, automatic failover, A/B test success rates
```

**Payment abstraction layer:**
```typescript
// Our code NEVER calls Razorpay directly
interface PaymentService {
  createOrder(booking: Booking): Promise<PaymentOrder>;
  processWebhook(payload: WebhookPayload): Promise<void>;
  initiateRefund(transactionId: string, amount: number): Promise<Refund>;
  processPayout(lenderId: string, amount: number): Promise<Payout>;
}

// Phase 1: RazorpayPaymentService implements PaymentService
// Phase 2: JuspayPaymentService implements PaymentService (swap 1 file)
```

---

## 11. AI & Machine Learning

### Strategy: Multi-Provider (Gemini primary, GPT-4o for critical)

| Feature | Provider | Model | Latency | Cost per 1K calls | Purpose |
|---------|----------|-------|---------|-------------------|---------|
| **Embeddings** | Google | `text-embedding-004` | ~100ms | $0.0001 | Listing & search query vectors (768-dim) |
| **Search Intent** | Google | Gemini 2.0 Flash | ~200ms | $0.005 | Parse natural language → structured filters |
| **Listing Optimize** | Google | Gemini 2.0 Flash | ~300ms | $0.005 | Auto-improve titles, pricing suggestions |
| **Chatbot** | Google | Gemini 2.0 Flash | ~250ms | $0.005 | First-line support, booking help |
| **Fraud Detection** | Google | Gemini 2.0 Flash + rules | ~200ms | $0.005 | Anomaly flagging on new bookings |
| **Damage Detection** | OpenAI | GPT-4o Vision | ~2s | $0.50 | Before/after photo comparison (money-critical) |
| **Dispute Triage** | OpenAI | GPT-4o | ~3s | $0.30 | Evidence analysis → resolution recommendation |

**Why Multi-Provider:**
- Gemini Flash: 33x cheaper than GPT-4o-mini, Google Mumbai PoP = lowest latency in India
- GPT-4o: Superior vision accuracy for damage detection — where a wrong call costs real money
- Fallback routing: If Gemini is down → route to GPT-4o-mini. If OpenAI is down → route to Gemini Pro.

**Monthly AI Cost Projection:**

| Scale | Embeddings | Search | Damage | Chatbot | Disputes | Total |
|-------|-----------|--------|--------|---------|----------|-------|
| 10K users | $0.50 | $0.50 | $10 | $1 | $2 | **$14/mo** |
| 100K users | $5 | $5 | $100 | $10 | $20 | **$140/mo** |
| 1M users | $50 | $50 | $500 | $50 | $100 | **$750/mo** |

**Self-hosting trigger:** When monthly AI API spend exceeds $2,000/mo → deploy Llama 3.1 / Mistral on GPU instance for embeddings and chatbot (80% of calls). Keep GPT-4o for damage detection.

---

## 12. Search & Discovery

### Phase 1: PostgreSQL-Native (0-15K listings)

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Semantic Search** | pgvector (HNSW index) | "Camera for wedding" → finds DSLRs, mirrorless, video cameras |
| **Full-Text Search** | PostgreSQL `tsvector` + `pg_trgm` | Keyword matching with typo tolerance, Hindi/English |
| **Geo Search** | PostGIS | "Near Koregaon Park" → radius filter with distance ranking |
| **Faceted Filters** | SQL `WHERE` clauses | Category, price range, condition, availability, trust tier |
| **Ranking** | Custom SQL scoring | `0.4 × relevance + 0.3 × trust_score + 0.2 × proximity + 0.1 × recency` |

**Search Pipeline:**
```
User types "camera for wedding this weekend near KP"
  ↓
1. AI Intent Parsing (Gemini Flash)
   → {category: "cameras", occasion: "wedding", dates: "Sat-Sun", area: "Koregaon Park"}
  ↓
2. Vector Search (pgvector)
   → Top 50 semantically similar listings
  ↓
3. Filters (SQL WHERE)
   → Available on Sat-Sun, within 5km of KP, status = 'available'
  ↓
4. Ranking (trust + proximity + rating)
   → Final 20 results, ordered by composite score
  ↓
5. Return to user (<200ms total)
```

### Phase 2: + Typesense (15K+ listings)

| What Changes | Why |
|-------------|-----|
| Add [Typesense](https://typesense.org/) as a search index | <50ms faceted search with typo tolerance |
| Sync PostgreSQL → Typesense via CDC | Typesense is read-optimized, PostgreSQL remains source of truth |
| Keep pgvector for semantic | Typesense handles text/facets, pgvector handles AI similarity |

**Migration trigger:** When PostgreSQL search latency exceeds 200ms at p95 in production.

---

## 13. File Storage & CDN

### Hybrid Strategy: R2 (public) + Supabase Storage (private)

| Storage | Provider | Content | % of Files | Why |
|---------|----------|---------|-----------|-----|
| **Public media** | [Cloudflare R2](https://cloudflare.com/r2) | Listing photos, profile images, public assets | 80% | Zero egress fees, global CDN, fast delivery |
| **Private/Evidence** | Supabase Storage | Handover evidence, KYC documents, dispute attachments | 20% | RLS integration, audit logging, hash verification |

**Cloudflare R2 details:**
- Storage: $0.015/GB/month
- Egress: **$0** (zero, unlimited)
- CDN: Built-in, edge nodes in Mumbai, Chennai, Delhi, Hyderabad
- Operations: 1M Class A (write) free, 10M Class B (read) free

**Photo Processing Pipeline:**
```
User uploads photo (mobile/web)
  ↓
1. Client-side compression (expo-image-manipulator / browser canvas)
   → Resize to max 2048px, JPEG quality 85%
  ↓
2. Upload to R2 (listing photos) or Supabase Storage (evidence)
  ↓
3. Generate SHA-256 hash → store in PostgreSQL
  ↓
4. Generate thumbnail (256px) via Cloudflare Image Resizing
  ↓
5. Generate embedding via AI microservice (for visual search, Phase 2)
```

**Storage Cost Projection:**

| Year | Total Storage | R2 Cost | Supabase Cost | S3 Equivalent | Savings |
|------|-------------|---------|---------------|---------------|---------|
| Year 1 | 500 GB | $7.50/mo | Included in plan | $45/mo + egress | 80% |
| Year 2 | 5 TB | $75/mo | $25/mo | $450/mo + egress | 78% |
| Year 3 | 50 TB | $750/mo | $50/mo | $4,500/mo + egress | 82% |

---

## 14. Caching & Queues

### Cache: Upstash Redis (Serverless)

| Use Case | TTL | Data |
|----------|-----|------|
| Booking locks | 10 minutes | `lock:{listing_id}` → `{user_id, expires_at}` |
| Session cache | 1 hour | `session:{user_id}` → JWT payload |
| Rate limiting | 1 minute | `rate:{user_id}:{endpoint}` → request count |
| Search cache | 5 minutes | `search:{query_hash}` → result IDs |
| Listing view count | 24 hours | `views:{listing_id}` → count (batch write to DB nightly) |

### Message Queue: BullMQ (Redis-backed)

| Queue | Priority | Retry Policy | Purpose |
|-------|----------|-------------|---------|
| `payment-webhooks` | Critical | 5 retries, exponential backoff | Process Razorpay webhook events |
| `notifications` | High | 3 retries, 30s delay | Send WhatsApp, push, email |
| `ai-inference` | Medium | 2 retries, 60s delay | Damage detection, embedding generation |
| `payout-processing` | Critical | 5 retries, exponential backoff | T+2 lender bank transfers |
| `trust-update` | Low | 1 retry | Recalculate trust score after review/dispute |
| `dead-letter` | — | Manual review | Failed jobs that exhausted retries |

**Why BullMQ over SQS:** Already using Redis (Upstash) for caching. BullMQ runs on the same Redis instance — no additional infrastructure. Dashboard (Bull Board) for monitoring. Native TypeScript. Dead letter queue support.

---

## 15. Real-Time

### Supabase Realtime (WebSocket)

| Feature | Channel | Data |
|---------|---------|------|
| **Booking status** | `booking:{id}` | Status transitions: confirmed → ready → in_transit → active |
| **Chat messages** | `chat:{booking_id}` | Real-time text + image messages between renter/lender |
| **Delivery tracking** | `delivery:{booking_id}` | GPS coordinates from delivery agent (Dunzo/Porter webhook) |
| **Notification bell** | `notifications:{user_id}` | New notification count, real-time updates |
| **Listing availability** | `listing:{id}` | Toggle available/unavailable in real-time |
| **Admin dashboard** | `admin:metrics` | Live booking count, revenue, active disputes |

**Client connection:**
```typescript
// Subscribe to booking updates
const channel = supabase.channel(`booking:${bookingId}`)
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'bookings',
    filter: `id=eq.${bookingId}`
  }, (payload) => {
    updateBookingStatus(payload.new.status);
  })
  .subscribe();
```

---

## 16. Notifications

| Channel | Provider | Use Cases | Cost |
|---------|----------|-----------|------|
| **WhatsApp** | [Wati](https://www.wati.io/) (WhatsApp Business API) | Booking confirmations, payment receipts, return reminders, dispute updates | ₹2,499/mo + ₹0.50/message |
| **Push** | Firebase Cloud Messaging + Expo | Delivery tracking, new booking alert, chat messages | Free |
| **Email** | [Resend](https://resend.com/) | KYC verification, payout receipts, dispute resolution reports | Free tier (3K/month) |
| **SMS** | [MSG91](https://msg91.com/) | OTP only — phone verification | ₹0.20/SMS |
| **In-App** | Supabase Realtime | Notification bell, live status, chat bubbles | Included |

**Notification Matrix (12 lifecycle events):**

| Event | Renter Gets | Lender Gets | Primary Channel |
|-------|------------|------------|----------------|
| Booking created | "Confirmed! ₹X paid." | "New booking! Accept?" | WhatsApp + Push |
| Lender accepts | "Lender confirmed!" | "Prepare item for [date]." | Push |
| Lender no-response (2h) | "Auto-cancelled. Full refund." | "Missed booking. Score affected." | WhatsApp |
| Delivery dispatched | "On the way! Track →" | "Item picked up." | Push + WhatsApp |
| Handover complete | "Enjoy! Return by [date]." | "Delivered to renter." | Push |
| 24h before return | "Return reminder." | "Expect return tomorrow." | WhatsApp |
| Return completed | "Deposit refunded! Rate →" | "Item back! Payout in 2 days." | WhatsApp |
| Damage dispute | "Reviewing damage report." | "We received your report." | WhatsApp |
| Dispute resolved | "Resolved: [outcome]." | "Resolved: ₹X awarded." | WhatsApp + Email |
| Payout processed | — | "₹X deposited to bank." | WhatsApp |
| New review | "You got ⭐ X/5" | "You got ⭐ X/5" | Push |
| Listing stale (14d) | — | "Still available? Update listing." | WhatsApp |

---

## 17. Logistics & Delivery

| Component | Provider | Details |
|-----------|----------|---------|
| **Primary Delivery** | [Dunzo](https://www.dunzo.com/) API | Intracity: pickup from lender → drop to renter. API quote per delivery. |
| **Fallback Delivery** | [Porter](https://porter.in/) API | Larger items or Dunzo unavailability. Higher weight capacity. |
| **Tracking** | Dunzo/Porter webhook events | Real-time GPS → Supabase Realtime → user app |
| **Pricing** | Dynamic (API quote) | Fee calculated per-booking based on distance + weight. Passed to renter. |
| **Self Pickup** | In-app coordination | Area shared pre-booking → full address after payment → OTP at handover |

**Self-Pickup OTP Flow:**
```
1. Renter books → sees lender's AREA only (e.g., "Koregaon Park")
2. Payment confirmed → full address revealed to renter
3. Renter arrives → app generates 4-digit OTP
4. Lender enters OTP in their app → handover confirmed
5. Both take photos → uploaded as evidence → booking status = "active"
```

---

## 18. Hosting & Infrastructure

| Component | Provider | Plan | Monthly Cost | Purpose |
|-----------|----------|------|-------------|---------|
| **Web + API** | [Vercel](https://vercel.com/) | Pro ($20/mo) | $20 | Next.js hosting, edge network, preview deployments, auto SSL |
| **Backend** | [Supabase Cloud](https://supabase.com/) | Pro ($25/mo) | $25 | PostgreSQL, Auth, Storage, Realtime, Edge Functions |
| **AI Service** | [Google Cloud Run](https://cloud.google.com/) | Pay-per-use | ~$10 | FastAPI container, auto-scale to zero, Mumbai region |
| **Cache/Queue** | [Upstash](https://upstash.com/) | Pay-per-use | $0-10 | Redis — booking locks, rate limiting, BullMQ |
| **Public Storage** | [Cloudflare R2](https://cloudflare.com/r2) | Pay-per-use | $0-10 | Listing photos, CDN, zero egress |
| **DNS + DDoS** | [Cloudflare](https://cloudflare.com/) | Free | $0 | DNS management, DDoS protection, edge caching |
| **Domain** | rentalhub.in | Annual | ~$10/yr | Primary domain |
| **Landing Page** | GitHub Pages | Free | $0 | `jay-d21.github.io/rentalhub` |

**Total Infrastructure (Phase 1): ~₹5,500/month (~$65)**

**Phase 2 Migration (at $500+/mo Vercel bill):**
- Move Next.js to AWS ECS via [OpenNext](https://opennext.js.org/)
- Move Redis to AWS ElastiCache
- Keep Supabase for database (or migrate to AWS RDS)
- Estimated savings: 40-60% at high scale

---

## 19. Security

### 5-Layer Security Architecture

```
╔═══════════════════════════════════════════════════════════╗
║  LAYER 1: IDENTITY                                        ║
║  ├── Supabase Auth (JWT, refresh rotation)                ║
║  ├── Phone OTP (MSG91) — proof of phone ownership         ║
║  ├── DigiLocker — proof of identity (Aadhaar-linked)      ║
║  └── Session: 1-hour access, 30-day refresh, single-use   ║
╠═══════════════════════════════════════════════════════════╣
║  LAYER 2: AUTHORIZATION                                   ║
║  ├── Row Level Security (RLS) — database-level ACL        ║
║  ├── RBAC: renter, lender, vendor, admin, super_admin     ║
║  └── Rate limiting: 100 req/min, 10 bookings/hr           ║
╠═══════════════════════════════════════════════════════════╣
║  LAYER 3: DATA PROTECTION                                 ║
║  ├── KYC data encrypted at rest (AES-256 via pgcrypto)    ║
║  ├── PII never exposed in API responses                   ║
║  ├── Photos: write-once, SHA-256 hash, GPS + timestamp    ║
║  └── DPDPA compliance: consent, deletion, breach SOP      ║
╠═══════════════════════════════════════════════════════════╣
║  LAYER 4: PAYMENT SECURITY                                ║
║  ├── Razorpay handles PCI-DSS (Level 1)                   ║
║  ├── Zero card data on our servers                        ║
║  ├── Webhook HMAC signature verification                  ║
║  └── Idempotency keys on all payment operations           ║
╠═══════════════════════════════════════════════════════════╣
║  LAYER 5: FRAUD PREVENTION                                ║
║  ├── Velocity: max 3 bookings/day per new user            ║
║  ├── Value cap: first 3 bookings ≤ ₹5,000 each           ║
║  ├── Device fingerprinting (basic)                        ║
║  ├── GPS verification on photo uploads                    ║
║  ├── AI anomaly detection (Gemini Flash)                  ║
║  └── Manual review queue for bookings > ₹10,000           ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 20. Monitoring & Observability

| Category | Tool | Purpose | Cost |
|----------|------|---------|------|
| **Error Tracking** | [Sentry](https://sentry.io/) | Crash reports, error grouping, release tracking | Free (5K events/mo) |
| **Product Analytics** | [PostHog](https://posthog.com/) | Funnels, feature flags, session recordings, A/B tests | Free (1M events/mo) |
| **Uptime** | [BetterStack](https://betterstack.com/) | Downtime alerts via SMS/Slack, status page | Free tier |
| **Infra Metrics** | Supabase Dashboard | DB performance, API latency, storage usage | Included |
| **Logs** | Vercel Logs + Supabase Logs | Request logs, function execution, DB queries | Included |
| **APM (Phase 2)** | Grafana Cloud + Prometheus | Custom metrics, dashboards, alerting | Free tier |
| **Business Dashboard** | Custom (Next.js admin) | Revenue, bookings, trust scores, disputes, categories | Built in-house |

**Key Alerts:**
- Booking success rate drops below 90% → Slack #critical
- Payment webhook processing time > 5s → PagerDuty
- Database connection pool > 80% utilization → Slack #infra
- API error rate > 2% for 5 minutes → SMS to CTO

---

## 21. Development Tools

| Category | Tool | Purpose |
|----------|------|---------|
| **Version Control** | Git + [GitHub](https://github.com/Jay-D21/rentalhub) | Source code, PR reviews, branch protection |
| **Monorepo** | Turborepo | Manage web + mobile + shared packages in one repo |
| **Package Manager** | pnpm | Fast, disk-efficient, workspace support |
| **CI/CD** | Vercel (auto-deploy) + GitHub Actions | Preview deploys on PR, production on merge to main |
| **Linting** | ESLint + Prettier | Code quality + formatting consistency |
| **Type Checking** | TypeScript (strict mode) | Compile-time bug detection |
| **Unit Tests** | Vitest | Fast, Vite-powered test runner |
| **E2E Tests** | Playwright | Full browser automation: booking flow, payment flow |
| **Mobile Testing** | Detox (Phase 2) | E2E testing for React Native |
| **DB Migrations** | Drizzle Kit | Version-controlled, type-safe schema changes |
| **API Testing** | Hoppscotch | Manual endpoint testing (open-source Postman) |
| **Design** | Figma | UI/UX design, component library, prototyping |
| **Communication** | Slack / Discord | Team chat, #dev, #alerts, #general |
| **Documentation** | Markdown (in-repo) + Notion | Tech docs in repo, product/ops docs in Notion |
| **Task Management** | Linear | Sprint planning, bug tracking, roadmap |

---

## 22. Third-Party API Registry

| API | Category | Pricing | Est. Cost (Month 6) | Replaceable With |
|-----|----------|---------|---------------------|-----------------|
| **Razorpay** | Payments | 2% per txn | ₹3,000 | Cashfree, PayU |
| **DigiLocker** | KYC | Free (govt) | ₹0 | Aadhaar API (paid) |
| **MSG91** | SMS OTP | ₹0.20/SMS | ₹600 | Twilio, Gupshup |
| **Google Gemini** | AI (primary) | Usage-based | ₹400 | OpenAI, Anthropic |
| **OpenAI** | AI (critical) | Usage-based | ₹4,200 | Gemini Pro, Claude |
| **Wati** | WhatsApp | ₹2,499/mo + msg | ₹4,000 | AiSensy, Gupshup |
| **Resend** | Email | Free tier | ₹0 | SendGrid, Postmark |
| **Dunzo** | Delivery | Per-delivery | ₹0 (user pays) | Porter, Shadowfax |
| **Google Maps** | Geo | $200 free credit | ₹0 | Mapbox, OpenStreetMap |
| **FCM** | Push | Free | ₹0 | OneSignal, Expo Push |
| **Sentry** | Errors | Free tier | ₹0 | Bugsnag, Datadog |
| **PostHog** | Analytics | Free tier | ₹0 | Mixpanel, Amplitude |

**Total Third-Party Cost (Month 6): ~₹12,200/month (~$147)**

*(Down from ₹17,200/month in v1.0 — savings from Gemini Flash replacing OpenAI for 90% of AI calls)*

---

## 23. Languages & Codebase Split

| Language | Where | % of Code | Developers Needed |
|----------|-------|-----------|------------------|
| **TypeScript** | Next.js web + React Native mobile + API routes + Edge Functions | 72% | 2-3 full-stack engineers |
| **SQL** | PostgreSQL schemas, RLS policies, migrations, complex queries | 12% | Same engineers (SQL is a skill, not a hire) |
| **Python** | FastAPI AI microservice (damage detection, embeddings, chatbot) | 6% | 1 ML engineer (or full-stack with Python) |
| **HTML/CSS/JS** | Landing page, email templates | 8% | Same engineers |
| **Deno/TS** | Supabase Edge Functions (lightweight triggers) | 2% | Same engineers |

**Total engineering team needed (Phase 1): 3-4 engineers**
- 2× Full-stack TypeScript (Next.js + React Native + Supabase)
- 1× Full-stack with Python/ML skills (AI microservice + data)
- 1× Product/Design (Figma + UX research)

---

## 24. Architecture Diagram

```
                         ┌──────────────────────┐
                         │       CLIENTS          │
                         │                        │
                         │  🌐 Next.js PWA        │
                         │  📱 React Native App   │
                         │  👤 Admin Dashboard     │
                         └──────────┬─────────────┘
                                    │
                         ┌──────────▼─────────────┐
                         │    EDGE / CDN            │
                         │                          │
                         │  Vercel Edge Network     │
                         │  Cloudflare R2 CDN       │
                         └──────────┬───────────────┘
                                    │
              ┌─────────────────────┼─────────────────────┐
              │                     │                       │
    ┌─────────▼──────┐   ┌─────────▼──────┐   ┌──────────▼──────┐
    │  SUPABASE       │   │  VERCEL         │   │  CLOUD RUN       │
    │  ────────       │   │  SERVERLESS     │   │  (AI SERVICE)    │
    │  • PostgreSQL   │   │  ────────       │   │  ────────        │
    │  • Auth (JWT)   │   │  • Booking      │   │  • FastAPI       │
    │  • Storage      │   │    Engine       │   │  • Gemini Flash  │
    │  • Realtime WS  │   │  • Payment      │   │  • GPT-4o Vision │
    │  • Edge Funcs   │   │    Flow         │   │  • Embeddings    │
    │  • pgvector     │   │  • Trust Score  │   │  • Damage Detect │
    │  • PostGIS      │   │  • Search       │   │  • Chatbot       │
    │  • pg_cron      │   │    Orchestrate  │   │                  │
    └────────┬────────┘   └────────┬────────┘   └────────┬─────────┘
             │                     │                      │
             └─────────────────────┼──────────────────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              │                    │                      │
    ┌─────────▼──────┐   ┌────────▼───────┐   ┌─────────▼──────┐
    │  UPSTASH REDIS  │   │  EXTERNAL APIs  │   │  CLOUDFLARE R2  │
    │  ────────       │   │  ────────       │   │  ────────       │
    │  • Booking      │   │  • Razorpay     │   │  • Listing      │
    │    locks        │   │  • DigiLocker   │   │    photos       │
    │  • BullMQ       │   │  • Dunzo/Porter │   │  • Profile      │
    │    queues       │   │  • Wati         │   │    images       │
    │  • Rate limit   │   │  • MSG91        │   │  • Zero egress  │
    │  • Session      │   │  • FCM / Resend │   │  • Global CDN   │
    │    cache        │   │  • Google Maps  │   │                  │
    └─────────────────┘   └────────────────┘   └──────────────────┘
```

---

## 25. Environment Variables

```env
# ============================================================
# RENTALHUB — Environment Variables
# Copy this file to .env.local and fill in values
# NEVER commit .env.local to git
# ============================================================

# ── Supabase ──
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...           # Server-only, NEVER expose to client

# ── Razorpay ──
RAZORPAY_KEY_ID=rzp_live_xxxx
RAZORPAY_KEY_SECRET=xxxx
RAZORPAY_WEBHOOK_SECRET=xxxx               # For HMAC signature verification
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxx  # Client-side (public key only)

# ── AI: Google Gemini ──
GOOGLE_GEMINI_API_KEY=xxxx                 # For Gemini Flash + embeddings
AI_SERVICE_URL=https://ai.rentalhub.in     # FastAPI microservice URL

# ── AI: OpenAI (critical tasks only) ──
OPENAI_API_KEY=sk-xxxx                     # For GPT-4o Vision, dispute triage

# ── KYC: DigiLocker ──
DIGILOCKER_CLIENT_ID=xxxx
DIGILOCKER_CLIENT_SECRET=xxxx
DIGILOCKER_REDIRECT_URI=https://rentalhub.in/auth/digilocker/callback

# ── SMS: MSG91 ──
MSG91_AUTH_KEY=xxxx
MSG91_OTP_TEMPLATE_ID=xxxx

# ── WhatsApp: Wati ──
WATI_API_URL=https://live-server-xxxx.wati.io
WATI_API_TOKEN=xxxx

# ── Email: Resend ──
RESEND_API_KEY=re_xxxx
RESEND_FROM_EMAIL=notifications@rentalhub.in

# ── Maps ──
NEXT_PUBLIC_GOOGLE_MAPS_KEY=xxxx
GOOGLE_MAPS_SERVER_KEY=xxxx                # Server-side geocoding

# ── Redis: Upstash ──
UPSTASH_REDIS_REST_URL=https://xxxx.upstash.io
UPSTASH_REDIS_REST_TOKEN=xxxx

# ── Delivery: Dunzo ──
DUNZO_CLIENT_ID=xxxx
DUNZO_CLIENT_SECRET=xxxx
DUNZO_WEBHOOK_SECRET=xxxx

# ── Monitoring ──
SENTRY_DSN=https://xxxx@sentry.io/xxxx
NEXT_PUBLIC_POSTHOG_KEY=phc_xxxx
NEXT_PUBLIC_POSTHOG_HOST=https://app.posthog.com

# ── App Config ──
NEXT_PUBLIC_APP_URL=https://rentalhub.in
NEXT_PUBLIC_APP_ENV=production             # development | staging | production
```

---

## 26. Cost Projections

### Monthly Infrastructure Cost by Scale

| Component | 10K Users | 100K Users | 1M Users | 10M Users |
|-----------|-----------|-----------|----------|-----------|
| Vercel (web + API) | $20 | $20 | $100 | $500* |
| Supabase (DB + Auth) | $25 | $25 | $100 | $400 |
| Cloud Run (AI) | $5 | $30 | $150 | $500 |
| Upstash Redis | $0 | $10 | $50 | $200 |
| Cloudflare R2 | $0 | $5 | $50 | $300 |
| AI APIs (Gemini + OpenAI) | $14 | $140 | $750 | $2,000* |
| Wati (WhatsApp) | $30 | $60 | $200 | $500 |
| MSG91 (SMS) | $7 | $25 | $100 | $300 |
| Sentry + PostHog | $0 | $0 | $50 | $200 |
| **TOTAL** | **$101** | **$315** | **$1,550** | **$4,900** |
| **In ₹** | **₹8,400** | **₹26,250** | **₹1,29,000** | **₹4,08,000** |

*\* = Phase 2 migration triggers (AWS ECS, self-hosted LLM)*

### Revenue vs. Infra Cost

| Scale | Monthly GMV | Platform Revenue (12%) | Infra Cost | Infra as % of Revenue |
|-------|-----------|----------------------|-----------|----------------------|
| 10K users | ₹5L | ₹60,000 | ₹8,400 | 14% |
| 100K users | ₹50L | ₹6,00,000 | ₹26,250 | 4.4% |
| 1M users | ₹5Cr | ₹60,00,000 | ₹1,29,000 | 2.2% |
| 10M users | ₹50Cr | ₹6,00,00,000 | ₹4,08,000 | 0.07% |

**Key insight:** Infrastructure cost as a percentage of revenue drops rapidly. At 10M users, infra is <0.1% of revenue — the business is massively profitable on the tech side.

---

## 27. Phase-Wise Roadmap

### Phase 1: MVP → Product-Market Fit (Months 0-18)

```
TECH:  Next.js + Supabase + Razorpay + Gemini Flash + pgvector
TEAM:  3-4 engineers
CITY:  Pune only
USERS: 0 → 30,000
COST:  ~₹8,000/month infra
```

**Build:** Core platform (web PWA), booking engine, payment escrow, trust scoring, search, notifications. Launch landing page → waitlist → invite-only → public.

### Phase 2: Scale → Multi-City (Months 18-36)

```
TECH:  + React Native app + Typesense + Juspay + FastAPI AI service
TEAM:  8-10 engineers
CITY:  Pune + Mumbai + Bangalore
USERS: 30,000 → 500,000
COST:  ~₹50,000/month infra
```

**Build:** Mobile app, advanced search (Typesense), payment orchestration (Juspay), AI chatbot, delivery tracking, admin dashboard, vendor onboarding at scale.

### Phase 3: Dominance → National (Months 36+)

```
TECH:  + Self-hosted LLM + AWS ECS + Citus + Grafana
TEAM:  20+ engineers
CITY:  10+ cities
USERS: 500,000 → 10,000,000
COST:  ~₹4,00,000/month infra (< 0.1% of revenue)
```

**Build:** Self-hosted AI for cost optimization, horizontal database sharding, dedicated DevOps, SRE team, compliance automation, B2B vendor APIs, international expansion research.

---

> [!IMPORTANT]
> **This is a living document.** Update it every time a tool, API, or service is added, changed, or removed. If it's not in this document, it shouldn't be in the codebase.
>
> **Decision rationale:** See [ARCHITECTURE_DECISIONS.md](ARCHITECTURE_DECISIONS.md) for the full Council debate behind each choice.

---

*© 2026 RentalHub. Engineering team reference document.*
