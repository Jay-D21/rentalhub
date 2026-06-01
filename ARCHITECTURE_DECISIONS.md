# 🏛️ RentalHub Tech Council — Long-Term Architecture Decisions

> **Methodology: Council Debate.** Each decision is argued by 5 expert personas, counter-argued, stress-tested for failure modes, and resolved with a final verdict. Nothing is taken at face value.

---

## The Council

| Persona | Role | Bias |
|---------|------|------|
| 🏗️ **Arjun** (CTO) | System architecture, long-term scalability | Favors proven enterprise tech, dislikes hype |
| 💰 **Priya** (CFO) | Burn rate, unit economics, cost at scale | Every rupee matters, hates vendor lock-in |
| 🚀 **Rohan** (VP Product) | Speed-to-market, user experience, hiring | Ship fast, iterate, worry about scale later |
| 🛡️ **Meera** (VP Engineering) | Code quality, maintainability, team velocity | Hates tech debt, wants clean abstractions |
| 🔬 **Vikram** (Data/AI Lead) | ML pipelines, unstructured data, analytics | Wants maximum data flexibility |

---

## Decision 1: Primary Database

### The Options

| | PostgreSQL (Supabase) | MongoDB Atlas | PlanetScale (MySQL) | CockroachDB |
|---|---|---|---|---|
| **Model** | Relational (SQL) | Document (NoSQL) | Relational (MySQL + Vitess) | Distributed SQL |
| **Unstructured data** | JSONB columns | Native documents | JSON columns | JSONB columns |
| **Vector search** | pgvector (built-in) | Atlas Vector Search | ❌ No native | ❌ No native |
| **Real-time** | Supabase Realtime | Change Streams | ❌ Requires add-on | CDC (Change Data Capture) |
| **Scale ceiling** | Vertical + read replicas | Horizontal sharding | Horizontal (Vitess) | Horizontal (native) |
| **India region** | ✅ Mumbai (Supabase/AWS) | ✅ Mumbai | ✅ Mumbai | ✅ Mumbai |
| **Free tier** | Generous | Generous | ❌ None ($39/mo) | Limited |

### The Debate

**🏗️ Arjun (CTO):** "PostgreSQL. No contest. Our data is inherently relational — Users → Listings → Bookings → Transactions → Reviews. This is textbook SQL. JSONB handles our unstructured needs (availability calendars, KYC data). pgvector gives us AI search without a separate service. And Supabase gives us Auth + Storage + Realtime bundled in."

**🔬 Vikram (Data/AI):** "I agree on PostgreSQL, but I'll counter one thing — at 10M users with 50M+ listings and photo embeddings, pgvector will hit a wall. HNSW index rebuild times over 50M vectors become painful. We should plan for a dedicated vector DB (Pinecone or Weaviate) as a Phase 2 migration."

**💰 Priya (CFO):** "MongoDB looks cheaper at first, but the per-operation pricing model is a trap. A marketplace with high read volume (10 searches per user per session) will bleed money. Supabase charges by compute, not operations — much more predictable."

**🚀 Rohan (VP Product):** "Speed. Supabase gives us Auth, Storage, Realtime, Edge Functions, AND the database in one dashboard. With MongoDB, I'd need to separately integrate Auth0 ($$$), S3, Pusher... that's 3-4 extra vendor integrations. We ship 2 months faster with Supabase."

**🛡️ Meera (VP Eng):** "The escape hatch matters. Supabase is open-source — worst case, we self-host on AWS. MongoDB's license (SSPL) is quasi-proprietary. CockroachDB is great tech but overkill — we don't need distributed consensus across regions until we're in 10+ cities."

### Counter-Arguments & Stress Test

> **Counter: "PostgreSQL can't handle horizontal scaling"**
> 
> **Rebuttal:** True at extreme scale, but we won't need horizontal sharding until 10M+ users. Supabase Pro handles 100K concurrent connections. Read replicas handle read scaling. Citus (PostgreSQL extension) adds horizontal sharding when needed. Instagram ran on PostgreSQL with 1B+ users.

> **Counter: "MongoDB is better for unstructured data like chat, photos metadata, activity logs"**
> 
> **Rebuttal:** PostgreSQL's JSONB is functionally equivalent for our use case. We're not storing deeply nested, schema-less documents — our "unstructured" data (availability calendars, KYC payloads) have known shapes. JSONB with GIN indexes handles this perfectly. MongoDB's advantage only materializes with truly schema-less, rapidly evolving document structures (which we don't have).

> **Counter: "What about when we add chat?"**
> 
> **Rebuttal:** Chat messages are a known structure: `{sender, receiver, message, timestamp, booking_id}`. This is a table, not a document. For real-time delivery, Supabase Realtime handles pub/sub. If chat volume explodes, we add a specialized service (like Stream or a Redis-backed solution) — we don't change our entire database for one feature.

### Cost Projection

| Scale | Supabase (PostgreSQL) | MongoDB Atlas | PlanetScale |
|-------|----------------------|---------------|-------------|
| 10K users | ₹2,100/mo (Pro) | ₹0 (Free M0) | ₹3,250/mo (Scaler) |
| 100K users | ₹4,200/mo (Pro) | ₹8,400/mo (M10) | ₹8,400/mo |
| 1M users | ₹12,500/mo (Team) | ₹42,000/mo (M30) | ₹25,000/mo |
| 10M users | ₹42,000/mo (Enterprise) | ₹2,10,000/mo (M50+) | ₹84,000/mo |

### 🏆 Verdict: PostgreSQL via Supabase

**Why:** Relational data model matches our domain perfectly. JSONB handles semi-structured data. pgvector eliminates need for a separate vector DB until 50M+ vectors. Supabase bundles Auth + Storage + Realtime. Open-source = no vendor lock-in. Most cost-effective at every scale point.

**Migration trigger:** When pgvector exceeds 50M vectors → add Pinecone/Weaviate for search only. When concurrent writes exceed 50K/second → evaluate Citus sharding or CockroachDB migration.

---

## Decision 2: Backend Architecture

### The Options

| | Supabase (BaaS) | Custom Node.js (Express/Fastify) | Go (Gin/Fiber) | Custom Python (FastAPI) |
|---|---|---|---|---|
| **Time to MVP** | 2 months | 4 months | 5 months | 4 months |
| **Built-in Auth** | ✅ | ❌ (build or Auth0) | ❌ | ❌ |
| **Built-in Storage** | ✅ | ❌ (S3 integration) | ❌ | ❌ |
| **Real-time** | ✅ WebSocket | Socket.io | Gorilla WebSocket | WebSocket |
| **Edge Functions** | ✅ (Deno) | Vercel Serverless | Cloud Run | Cloud Run |
| **Performance** | Good | Good | Excellent | Good |
| **Hiring (India)** | Moderate (JS) | Easy (JS) | Hard (Go) | Moderate (Python) |

### The Debate

**🚀 Rohan:** "Supabase as the core backend, with Next.js API Routes for custom business logic. This gives us 70% of the backend for free (Auth, CRUD, Storage, Realtime) and we only write custom code for complex flows (booking state machine, payment webhooks, dispute triage)."

**🏗️ Arjun:** "I'm worried about Supabase Edge Functions for critical paths like payment webhooks. If Supabase has a 2-minute outage, we miss a Razorpay webhook and a payment gets stuck. I want our payment webhook handler on a separate, highly available service."

**🛡️ Meera:** "Valid concern. Hybrid approach: Supabase for 80% of the backend (Auth, CRUD, Realtime), Next.js API Routes on Vercel for business logic (booking engine, payments, trust scoring), and a dedicated webhook receiver with its own retry queue. If Supabase goes down, payments still process."

**🔬 Vikram:** "What about when we need ML inference? Python/FastAPI is the natural choice for AI endpoints. We'll need a separate microservice for damage detection (GPT-4o Vision), search ranking, and recommendation anyway."

**💰 Priya:** "Go is faster per-dollar, but hiring Go engineers in Pune is a nightmare. JavaScript/TypeScript engineers are 3x more available and 40% cheaper. The performance difference doesn't matter until we're processing 10K+ requests/second — we won't hit that for 18+ months."

### Counter-Arguments

> **Counter: "Supabase is a single point of failure"**
> 
> **Rebuttal:** Critical paths (payments, webhooks) run on Vercel serverless, not Supabase. Supabase outage = users can't browse/book temporarily, but no money is lost. Supabase's own SLA is 99.95% uptime. We add health monitoring (BetterStack) to alert on any degradation.

> **Counter: "You'll outgrow Supabase Edge Functions"**
> 
> **Rebuttal:** That's why we're NOT putting everything in Edge Functions. Complex business logic lives in Next.js API Routes (Vercel). Edge Functions handle only lightweight triggers: notification dispatch, webhook acknowledgment, scheduled cleanup.

### 🏆 Verdict: Hybrid — Supabase + Next.js API Routes + Python microservice

**Architecture:**
```
Tier 1 (Supabase):     Auth, CRUD, Storage, Realtime, pg_cron
Tier 2 (Next.js/Vercel): Booking engine, payment flow, trust scoring, admin dashboard
Tier 3 (Python/FastAPI): AI inference (damage detection, search ranking, chatbot)
```

**Why:** Maximum speed-to-market (Supabase handles 70% of backend), reliability on critical paths (payments on Vercel), AI flexibility (Python for ML). All three tiers can scale independently.

---

## Decision 3: Frontend Web Framework

### The Options

| | Next.js 14 | Remix | SvelteKit | Nuxt 3 |
|---|---|---|---|---|
| **SSR/SSG/ISR** | All three ✅ | SSR focus | SSR + prerender | SSR + SSG |
| **React Server Components** | ✅ Mature | ❌ | N/A (Svelte) | N/A (Vue) |
| **Edge Runtime** | ✅ Vercel Edge | ✅ Cloudflare/Vercel | ✅ Cloudflare | ✅ Cloudflare/Vercel |
| **SEO (listing pages)** | Excellent (ISR) | Good | Good | Good |
| **Ecosystem** | Massive | Growing | Small | Moderate |
| **Hiring (India)** | Easiest | Hard | Very hard | Moderate |
| **Vercel lock-in** | Moderate | Low | Low | Low |
| **Bundle size** | Larger | Moderate | Smallest | Moderate |

### The Debate

**🚀 Rohan:** "Next.js. The hiring argument alone wins. There are 10x more Next.js developers in India than Remix or SvelteKit. Our job postings will get 50+ applicants in a week vs. 5 for SvelteKit."

**🛡️ Meera:** "I'm worried about Vercel lock-in. Next.js is technically open-source, but the best features (ISR, Edge Middleware, Image Optimization) work perfectly ONLY on Vercel. Deploying Next.js on AWS is possible but painful."

**🏗️ Arjun:** "Counter: At our scale (next 2 years), Vercel Pro at $20/mo is practically free. The lock-in risk is real but distant. If we need to migrate, we can move to Cloudflare Pages or self-host — the codebase is still React, which is portable."

**🔬 Vikram:** "SvelteKit has 40% smaller bundles. On Indian 4G networks (average 15 Mbps), every KB matters. Page load time directly impacts conversion."

**💰 Priya:** "Vikram's right about bundle size, but wrong about the tradeoff. SvelteKit engineers cost 2x more in India because there are so few. The salary savings from hiring Next.js engineers for 2 years ($50K+ saved) more than compensates for slightly larger bundles. Use Next.js image optimization and code splitting to close the gap."

### Counter-Arguments

> **Counter: "Next.js is too bloated for a marketplace"**
> 
> **Rebuttal:** With App Router, React Server Components, and dynamic imports, Next.js 14 page sizes are competitive. Our listing pages will be ISR-rendered (static HTML + dynamic data), loading in <1.5s on 4G. Airbnb, Zillow, and Swiggy all use Next.js at massive scale.

> **Counter: "Vercel will get expensive at scale"**
> 
> **Rebuttal:** Vercel Pro at $20/mo covers 1TB bandwidth + 100K serverless function invocations. At 1M MAU, we'd hit ~$100-200/mo. That's still cheaper than a DevOps engineer managing a custom deployment pipeline on AWS.

### 🏆 Verdict: Next.js 14 (App Router)

**Why:** ISR for SEO-critical listing pages, React Server Components for performance, massive hiring pool in India, Supabase has first-class Next.js integration. Lock-in risk is manageable at our scale and timeline.

**Migration trigger:** If Vercel costs exceed $500/mo, evaluate OpenNext for self-hosting on AWS.

---

## Decision 4: Mobile App Framework

### The Options

| | Flutter | React Native | Kotlin Multiplatform |
|---|---|---|---|
| **Language** | Dart | JavaScript/TypeScript | Kotlin |
| **UI Rendering** | Own engine (Skia/Impeller) | Native components | Native components |
| **Code sharing with web** | ❌ Separate codebase | ✅ Share logic with Next.js | ❌ Partial sharing |
| **Performance** | 60-120 FPS (Impeller) | 60 FPS (New Architecture) | Native performance |
| **Camera/GPS/Sensors** | Excellent plugin ecosystem | Good (Expo) | Excellent (native) |
| **App size** | ~15-20 MB | ~12-18 MB | ~8-12 MB |
| **OTA updates** | Shorebird (new) | CodePush (mature) | ❌ |
| **Hiring (India)** | Moderate (growing fast) | Easy (JS pool) | Hard (Kotlin niche) |
| **Razorpay SDK** | ✅ Official | ✅ Official | ❌ Requires bridge |
| **Google Maps** | ✅ Official | ✅ Official | ✅ Native |
| **Long-term backing** | Google (strong) | Meta (strong) | JetBrains |

### The Debate

**🚀 Rohan:** "React Native. Our web team writes TypeScript. Sharing business logic (booking state machine, validation, API clients) between web and mobile saves 30% development time. With Expo, we ship the first mobile build in 6 weeks."

**🏗️ Arjun:** "I'll argue Flutter. Here's why: our app is heavily visual. Listing galleries, photo comparison for damage detection, map-heavy delivery tracking, animated trust badges. Flutter's Impeller engine renders these at 120fps with zero platform inconsistency. React Native uses native components that look different on iOS vs Android — our designers will spend months fixing per-platform UI bugs."

**🛡️ Meera:** "Counter to Arjun: React Native's New Architecture (Fabric + JSI) has closed the performance gap. For a marketplace app (scrolling lists, forms, maps, camera), both achieve 60fps without jank. The performance argument only matters if we're building a game."

**🔬 Vikram:** "Camera access matters for us. Both damage detection (before/after photos) and KYC (selfie verification) need fast, reliable camera. Flutter's `camera` plugin is more stable than React Native's — I've seen fewer edge-case bugs in production. This is a safety-critical feature."

**💰 Priya:** "The real question is: do we want to maintain TWO separate codebases (Next.js for web + Flutter/Dart for mobile) or ONE language (TypeScript) across both? At our team size (3-5 engineers for 18 months), maintaining two languages is a 40% productivity tax."

### Counter-Arguments

> **Counter: "React Native code sharing with web is overhyped"**
> 
> **Rebuttal:** Partially true. You can't share UI components between Next.js and React Native. But you CAN share: API client code, Zod validation schemas, business logic (booking rules, pricing calculations), TypeScript types/interfaces. This is 20-30% of the total codebase — meaningful for a small team.

> **Counter: "Flutter hiring is hard in India"**
> 
> **Rebuttal:** Was true in 2023, less true in 2026. Flutter is the most-starred framework on GitHub. Indian engineering colleges now teach Dart/Flutter. BUT — the immediate hiring pool is still 2-3x smaller than React/JS. For a Pune-based startup hiring 2-3 mobile engineers, this matters.

> **Counter: "Flutter web as a unified solution?"**
> 
> **Rebuttal:** Flutter Web is NOT ready for SEO-critical pages. It renders to Canvas, which is invisible to Google's crawler. Our listing pages MUST be server-rendered HTML for SEO. Flutter Web is a non-starter for our web platform. This means Flutter = mobile only, and we maintain two codebases regardless.

### 🏆 Verdict: React Native (with Expo)

**Why:** TypeScript unification with Next.js web codebase (shared logic, types, validation). Larger hiring pool in India. Expo provides OTA updates (CodePush), managed builds, and router-based navigation that mirrors Next.js patterns. Performance is sufficient for a marketplace app.

**When Flutter becomes the right answer:** If the app evolves to include heavy animations (3D product views, AR try-on), complex data visualizations, or if we hire a dedicated mobile team of 5+ engineers who prefer Dart.

**Migration trigger:** If React Native camera/photo handling proves unreliable for damage detection (critical safety feature), evaluate Flutter migration for mobile only.

---

## Decision 5: Payment Infrastructure

### The Options

| | Razorpay | Cashfree | Juspay |
|---|---|---|---|
| **Role** | Payment Aggregator | Payment Aggregator | Payment Orchestrator |
| **Escrow/Route** | ✅ Route (split payments) | ✅ Marketplace Settlements | Orchestrates others |
| **Auto-Payouts** | ✅ Razorpay Payouts | ✅ Cashfree Payouts | Via connected PG |
| **UPI** | ✅ | ✅ | ✅ |
| **Transaction fee** | ~2% | ~1.75% (often lower) | Per-transaction + platform fee |
| **Startup support** | Excellent (YC-backed, massive docs) | Good (aggressive pricing) | Enterprise-focused |
| **SDK quality** | Excellent (React Native, Flutter, Web) | Good | Good |
| **Onboarding speed** | 1-2 days | 1-3 days | 1-2 weeks |
| **Market share** | #1 in India startups | #2, growing fast | Enterprise (HDFC, Amazon) |

### The Debate

**💰 Priya:** "Cashfree saves us 0.25% per transaction. At ₹50L monthly GMV (Month 12), that's ₹12,500/month saved. Over 3 years, that's ₹4.5L saved on transaction fees alone."

**🚀 Rohan:** "But Razorpay's documentation and SDK quality are unmatched. Their React Native and Flutter SDKs are official and well-maintained. Cashfree's mobile SDK has known issues with UPI intent flow on Samsung devices. We'll spend 2 weeks debugging what Razorpay solves out of the box."

**🏗️ Arjun:** "Long-term play: Start with Razorpay for speed and reliability. At ₹1Cr+ monthly GMV, add Juspay as an orchestration layer on top. Juspay routes to Razorpay, Cashfree, or PayU based on success rates. We get the best of all worlds — Razorpay's UX, Cashfree's pricing, Juspay's reliability."

**🛡️ Meera:** "The escrow/Route feature is make-or-break for us. Our entire trust model depends on holding money until safe return. Razorpay Route is battle-tested — Swiggy, Urban Company, and Meesho use it. Cashfree's marketplace settlements are good but newer. For a safety-critical feature, I pick the more proven option."

### Counter-Arguments

> **Counter: "Razorpay is more expensive"**
> 
> **Rebuttal:** True on paper (2% vs 1.75%). But Razorpay's higher success rate (96% vs 93% industry average) means more completed transactions. A 3% higher success rate on ₹50L GMV = ₹1.5L more revenue/month. The fee savings from Cashfree are negated by lost conversions.

> **Counter: "What if Razorpay raises prices?"**
> 
> **Rebuttal:** This is why we architect with a payment abstraction layer. Our code never calls Razorpay directly — it calls our `PaymentService` which wraps Razorpay. Switching to Cashfree = changing 1 adapter class, not rewriting the app. At ₹1Cr+ GMV, we have negotiating power anyway.

### 🏆 Verdict: Razorpay (Phase 1) → Juspay orchestration (Phase 2)

**Phase 1 (0-18 months):** Razorpay for everything — payments, Route (escrow), payouts. Best SDK, fastest integration, proven escrow.

**Phase 2 (18+ months, ₹1Cr+ GMV):** Add Juspay orchestration layer. Route to Razorpay (primary) + Cashfree (fallback). Juspay handles retry logic, success rate optimization, and downtime routing.

---

## Decision 6: Object Storage (Photos & Unstructured Data)

### Scale Reality Check

Our platform will generate massive unstructured data:
- **Listing photos:** 6 photos × 15K listings = 90K photos (Year 1) → 2M photos (Year 3)
- **Handover evidence:** 4 photos × 8K bookings = 32K photos (Year 1)
- **KYC documents:** Aadhaar scans, selfies = 30K documents (Year 1)
- **Chat messages:** Text + images = growing indefinitely
- **AI embeddings:** 1536-dim vectors × all listings

**Total storage estimate:** 500 GB (Year 1) → 5 TB (Year 2) → 50 TB (Year 3)

### The Options

| | Supabase Storage | Cloudflare R2 | AWS S3 | MinIO (self-hosted) |
|---|---|---|---|---|
| **Egress fees** | High (S3-backed) | ❌ ZERO | $0.09/GB | None (self-hosted) |
| **Storage cost** | Included in plan | $0.015/GB | $0.023/GB | Hardware cost |
| **CDN** | ❌ No native CDN | ✅ Built-in (global) | CloudFront (extra) | ❌ Need separate |
| **India PoP** | Via AWS Mumbai | ✅ Mumbai, Chennai, Delhi | ✅ Mumbai | N/A |
| **RLS integration** | ✅ Supabase Auth | ❌ Custom | ❌ IAM | ❌ Custom |
| **Write-once (immutability)** | ❌ | ❌ | ✅ Object Lock | ✅ |

### The Debate

**💰 Priya:** "At 50TB with heavy egress (users browse photos constantly), egress fees will KILL us. 50TB × $0.09/GB egress = $4,500/month on S3 or Supabase Storage. R2 with zero egress = $750/month storage only. That's $3,750/month saved — $45,000/year."

**🏗️ Arjun:** "But our handover evidence photos need legal immutability. If a dispute goes to court, we must prove photos weren't tampered with. S3 Object Lock provides this guarantee. R2 does NOT. This is a legal requirement, not a nice-to-have."

**🛡️ Meera:** "Hybrid: Cloudflare R2 for listing photos and profile images (high read, high egress, no legal requirement). Supabase Storage for handover evidence and KYC documents (needs RLS + audit trail). We hash every evidence photo and store the hash in PostgreSQL for tamper detection, regardless of storage backend."

**🔬 Vikram:** "Don't forget — we need to process these photos for AI. Damage detection requires fast access to before/after photo pairs. If photos are on R2 and AI runs on AWS, we pay inter-cloud transfer fees. Keep AI-processed photos on S3 near our inference service."

### 🏆 Verdict: Hybrid — R2 (public media) + Supabase Storage (private/evidence)

```
Cloudflare R2:        Listing photos, profile photos, public assets
                      → Zero egress, global CDN, fast delivery
                      → 80% of our photos

Supabase Storage:     Handover evidence, KYC documents, dispute attachments
                      → RLS integration, audit logging, hash verification
                      → 20% of our photos (security-critical)
```

**Cost at Year 3 (50TB):** ~$900/month (vs $4,500 on S3 alone)

---

## Decision 7: AI/ML Infrastructure

### The Options

| | OpenAI API | Google Gemini API | Self-hosted (Ollama + Llama 3) | AWS Bedrock |
|---|---|---|---|---|
| **Vision (damage detect)** | GPT-4o (best) | Gemini 1.5 Pro | Llava (weaker) | Claude 3.5 |
| **Embeddings** | text-embedding-3-small | text-embedding-004 | nomic-embed | Titan Embeddings |
| **Cost per 1M tokens** | $2.50 (4o-mini) | $0.075 (Flash) | $0 (compute only) | Varies |
| **Latency (India)** | ~800ms | ~400ms (Mumbai PoP) | ~200ms (local) | ~600ms |
| **Rate limits** | Generous (Tier 3+) | Generous | No limits | No limits |
| **Quality** | Best overall | Very close to GPT-4o | Weaker for vision | Good |

### The Debate

**🔬 Vikram:** "Gemini Flash for 90% of our AI tasks. It's 33x cheaper than GPT-4o-mini, faster (Google Mumbai PoP), and quality is sufficient for search intent parsing, listing optimization, and chatbot. Use GPT-4o ONLY for damage detection where accuracy directly impacts money."

**💰 Priya:** "The numbers are clear. At 50K searches/month:
- OpenAI (GPT-4o-mini): ~$30/month
- Gemini Flash: ~$0.90/month
That's 33x savings. Over a year, $350 saved on search alone."

**🏗️ Arjun:** "But vendor diversification matters. If OpenAI has an outage during peak hours, all our search and damage detection goes down. Use Gemini as primary for non-critical (search, chatbot), OpenAI as primary for critical (damage detection, dispute triage), and have fallback routing between them."

**🛡️ Meera:** "Self-hosting sounds free but isn't. Running Llama 3 on GPU instances costs $500-1000/month for a reliable setup. Plus we need a DevOps engineer to maintain it. Self-host only makes sense at 10M+ users when API costs exceed $2000/month."

### 🏆 Verdict: Multi-provider — Gemini Flash (primary) + GPT-4o (critical) 

```
Gemini Flash:     Search intent parsing, listing optimization, chatbot, embeddings
                  → 90% of AI calls, 10x cheaper
                  
GPT-4o:           Damage detection (vision), dispute triage, complex reasoning
                  → 10% of AI calls, highest accuracy for money-critical decisions

Fallback:         If Gemini down → route to GPT-4o-mini
                  If OpenAI down → route to Gemini Pro

Self-host trigger: When monthly API spend exceeds $2,000/mo → evaluate 
                   Llama/Mistral on dedicated GPU for embeddings and chatbot
```

---

## Decision 8: Search Architecture

### The Options

| | pgvector (in PostgreSQL) | pgvector + Typesense | Elasticsearch | Pinecone + Algolia |
|---|---|---|---|---|
| **Setup complexity** | Zero (already in DB) | Low | Medium | Medium |
| **Semantic search** | ✅ Vector similarity | ✅ + Full-text | Plugins needed | ✅ Best-in-class |
| **Full-text search** | PostgreSQL FTS | ✅ Excellent | ✅ Best | ✅ Algolia |
| **Geo search** | PostGIS | ✅ + Geo | ✅ Geo | Algolia Geo |
| **Faceted filters** | SQL WHERE | ✅ Instant | ✅ | ✅ |
| **Typo tolerance** | pg_trgm | ✅ Built-in | ✅ | ✅ |
| **Hindi/Hinglish** | Basic | Good | Good | Limited |
| **Cost at scale** | $0 (in DB) | $50-200/mo | $100-500/mo | $500-2000/mo |
| **Scale limit** | 50M vectors | Billions | Billions | Billions |

### The Debate

**🔬 Vikram:** "Our search is the product. A user types 'camera for wedding near Koregaon Park' and we need to parse intent (semantic), filter by location (geo), rank by trust score (relevance), and handle typos. pgvector alone can't do faceted filtering + typo tolerance + geo-sort in <100ms."

**💰 Priya:** "But pgvector is FREE — it's already in our database. Adding Typesense or Elasticsearch is another $100-500/month AND another service to maintain."

**🏗️ Arjun:** "Start with pgvector + PostGIS + pg_trgm. This gives us: semantic search (pgvector), geo-search (PostGIS), fuzzy matching (pg_trgm), and relational filtering (SQL WHERE). It's not as fast as Typesense for faceted search, but it handles our Day 1 needs. When search latency exceeds 200ms at scale, THEN add Typesense as a read-optimized search index."

**🚀 Rohan:** "User perception matters. Algolia returns results in <50ms. PostgreSQL full-text search returns in 100-300ms. That 200ms difference feels instant vs. sluggish. But Algolia costs $1,000+/month at our scale. Typesense is open-source and achieves <50ms for free."

### 🏆 Verdict: pgvector + PostGIS (Phase 1) → Add Typesense (Phase 2)

**Phase 1 (0-12 months):** pgvector for semantic search, PostGIS for geo, pg_trgm for fuzzy. All inside PostgreSQL. Zero additional cost. Acceptable for <15K listings.

**Phase 2 (12+ months, 15K+ listings):** Add Typesense as a search index. Sync listings from PostgreSQL → Typesense via change data capture. Typesense handles user-facing search (<50ms), PostgreSQL remains source of truth.

---

## Decision 9: Message Queue & Background Jobs

### The Options

| | BullMQ (Redis-backed) | Supabase pg_cron + Edge Functions | AWS SQS | Inngest |
|---|---|---|---|---|
| **Setup** | Need Redis (Upstash) | Already included | AWS account | SaaS |
| **Retry logic** | ✅ Exponential backoff | Manual | ✅ Built-in | ✅ Built-in |
| **Delayed jobs** | ✅ | ✅ (cron only) | ✅ | ✅ |
| **Dead letter queue** | ✅ | ❌ | ✅ | ✅ |
| **Dashboard** | Bull Board | Supabase Logs | CloudWatch | ✅ Built-in |
| **Cost** | $0 (Upstash free tier) | $0 (included) | Pay per request | Free tier |

### The Debate

**🛡️ Meera:** "For critical jobs (payment webhook processing, payout triggers, dispute SLA timers), we need guaranteed delivery with retries and dead letter queues. pg_cron doesn't have this — if a cron job fails, it's gone. BullMQ on Upstash Redis gives us all of this for free (10K requests/day on free tier)."

**🏗️ Arjun:** "Use BOTH. pg_cron for periodic maintenance (trust score recalculation, stale listing cleanup, daily analytics). BullMQ for event-driven jobs (process payment webhook, send notification, trigger AI damage detection). Different tools for different job types."

### 🏆 Verdict: BullMQ (event jobs) + pg_cron (scheduled jobs)

```
BullMQ (Upstash Redis):    Payment webhooks, notification dispatch, 
                           AI inference triggers, payout processing
                           → Needs: retry, DLQ, delayed execution

pg_cron (Supabase):        Trust score recalculation (daily), 
                           stale listing cleanup (weekly),
                           analytics aggregation (nightly)
                           → Needs: scheduled execution, simple
```

---

## Decision 10: Hosting & Deployment

### The Options

| | Vercel | AWS (ECS/Lambda) | GCP (Cloud Run) | Railway |
|---|---|---|---|---|
| **Next.js support** | Native (best) | Good (OpenNext) | Good | Good |
| **Auto-scaling** | ✅ Instant | ✅ (config needed) | ✅ | ✅ |
| **India edge** | ✅ Mumbai | ✅ Mumbai | ✅ Mumbai | ❌ US/EU only |
| **Preview deployments** | ✅ Per PR | Manual | Manual | ✅ |
| **Cost (1M MAU)** | ~$100-200/mo | ~$200-400/mo | ~$150-300/mo | ~$50-100/mo |
| **DevOps needed** | Zero | High | Medium | Low |
| **Vendor lock-in** | Moderate | Low | Low | Low |

### The Debate

**💰 Priya:** "Vercel at $20/mo vs. hiring a DevOps engineer at ₹80K/mo to manage AWS. That's not even a decision. We save ₹9.5L/year by using Vercel."

**🏗️ Arjun:** "Agreed for Phase 1. But at 10M users, Vercel's serverless model becomes expensive (per-invocation pricing). AWS ECS with auto-scaling is cheaper at extreme scale. Plan the migration for when monthly Vercel bill exceeds $500."

### 🏆 Verdict: Vercel (Phase 1) → AWS ECS/OpenNext (Phase 2)

---

## Final Revised Tech Stack

| Layer | Phase 1 (0-18 months) | Phase 2 (18-36 months) | Why Change |
|-------|----------------------|------------------------|------------|
| **Database** | Supabase (PostgreSQL) | + Citus sharding (if needed) | Horizontal scale at 10M+ |
| **Backend** | Supabase + Next.js API Routes | + Python/FastAPI for AI | ML complexity grows |
| **Web Frontend** | Next.js 14 (App Router) | Same | Stable, no need to change |
| **Mobile** | React Native (Expo) | Same (evaluate Flutter for v2) | TypeScript unification |
| **Payments** | Razorpay (Route + Payouts) | + Juspay orchestration | Multi-PG routing for reliability |
| **AI** | Gemini Flash + GPT-4o | + Self-hosted Llama for embeddings | Cost optimization at scale |
| **Search** | pgvector + PostGIS | + Typesense | <50ms search latency |
| **Object Storage** | R2 (public) + Supabase (private) | Same | Already optimized |
| **Message Queue** | BullMQ + pg_cron | + RabbitMQ (if microservices) | Service decomposition |
| **Hosting** | Vercel + Supabase Cloud | AWS ECS + OpenNext | Cost at extreme scale |
| **Monitoring** | Sentry + PostHog | + Grafana + Prometheus | Full observability |
| **Cache** | Upstash Redis | AWS ElastiCache | Higher throughput needed |

---

## Cost Trajectory

| Users | Monthly Infra Cost | Major Cost Drivers |
|-------|--------------------|-------------------|
| **10K** | ₹5,000 (~$60) | All free/starter tiers |
| **100K** | ₹20,000 (~$240) | Supabase Pro, Vercel Pro, Upstash paid |
| **1M** | ₹85,000 (~$1,000) | Database scaling, AI API costs, storage |
| **10M** | ₹4,20,000 (~$5,000) | Dedicated infra, multiple services, CDN |

---

## Key Principle: Build for Today, Architect for Tomorrow

> [!IMPORTANT]
> **Every decision above includes a "migration trigger" — a measurable signal that tells us WHEN to upgrade.** We don't pre-optimize for 10M users when we have 100. But we also don't paint ourselves into a corner.

### The Rules

1. **Use managed services until the bill hurts.** DevOps time costs more than SaaS fees at our scale.
2. **Keep abstractions clean.** Never call Razorpay/Supabase/OpenAI directly — always through service wrappers. This makes any swap a 1-file change.
3. **One language stack (TypeScript).** Web, mobile, API routes, and Edge Functions all in TypeScript. One language = one hiring pipeline = one mental model.
4. **PostgreSQL is the foundation.** Everything else is a feature layer that can be swapped. The database stays.
5. **Monitor before migrating.** Don't add Typesense "just in case." Add it when PostgreSQL search latency crosses 200ms in production.

---

*Council session concluded. All 5 members voted. All counter-arguments recorded. All migration triggers defined.*
