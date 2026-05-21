# 🏗️ RentalHub — Complete System Architecture

**Date:** 2026-05-21 | **Model:** Hybrid P2P Marketplace (Vendors + Individuals)

> [!NOTE]
> This is the **full system blueprint** — not just software architecture, but how the entire business machine works: every person, every process, every decision point, every data flow. From the moment a user opens the app to the moment money hits a lender's bank account.

---

## Part 1: System Entities — Who & What Exists in This System

Every person, system, and concept that participates in the RentalHub ecosystem:

### 👤 ACTORS (People)

| # | Entity | Definition | Role in System | Trust Requirement |
|---|---|---|---|---|
| 1 | **Renter** | Any individual who wants to temporarily use an item they don't own. They search, book, pay, use, and return items. | Demand side. Pays money. Bears usage responsibility. | Phone OTP (minimum). KYC for items >₹5,000. |
| 2 | **Individual Lender** | Any person who lists their personal belongings for others to rent. They are NOT a registered business. | Supply side (long-tail). Earns money from idle assets. | Phone OTP + Aadhaar/DigiLocker KYC. Bank account verified. |
| 3 | **Vendor (Business Lender)** | A registered business (sole prop, LLP, or Pvt Ltd) that lists professional inventory for rent. May have GST, trade license. | Supply side (anchor). Professional-grade, reliable supply. | GST verification + PAN + Bank + Trade license. Full business KYC. |
| 4 | **Delivery Agent** | Third-party logistics person (via Dunzo/Porter API) who physically transports items between lender and renter. | Logistics layer. Moves atoms, not bits. | Managed by Dunzo/Porter. Platform doesn't directly employ. |
| 5 | **Platform Admin** | Internal team member who manages operations: vendor approvals, dispute escalations, content moderation, fraud review. | God-mode operator. Sees everything, can override anything. | Employee with role-based access (RBAC). |
| 6 | **Support Agent** | Human (or AI) that handles renter/lender issues: booking problems, refund requests, damage disputes. | Trust repair. The human safety net when systems fail. | Trained employee or AI with escalation paths. |

### 🖥️ SYSTEMS (Software & Services)

| # | Entity | Definition | What It Does |
|---|---|---|---|
| 7 | **Platform Core** | The central application (web + PWA) that connects all actors. Built on Next.js + Supabase. | Hosts all business logic: listings, search, bookings, payments, reviews, trust scores. |
| 8 | **Payment Processor** | Razorpay (primary) — handles money movement between renter, platform, and lender. | Collects payments, holds escrow via Razorpay Route, processes refunds, settles vendor payouts. |
| 9 | **Identity Verifier** | DigiLocker API + phone OTP — verifies that actors are who they claim to be. | KYC: pulls Aadhaar name, verifies phone, confirms identity for trust tier assignment. |
| 10 | **Logistics Orchestrator** | Dunzo/Porter API integration — coordinates physical item movement. | Dispatches delivery agents, provides tracking, calculates delivery fees and ETAs. |
| 11 | **AI Engine** | GPT-4o-mini / Claude API — powers intelligent features. | Natural language search, listing optimization, damage photo comparison, support chatbot, fraud detection signals. |
| 12 | **Notification System** | WhatsApp Business API (Wati/AiSensy) + FCM push + email (Resend). | Sends booking confirmations, payment receipts, reminders, delivery updates to all actors. |

### 📦 OBJECTS (Things in the System)

| # | Entity | Definition | Key Attributes |
|---|---|---|---|
| 13 | **Listing** | A single item available for rent, created by a Lender (individual or vendor). | Title, description, photos, daily/weekly price, security deposit, category, location, availability status, condition grade. |
| 14 | **Booking** | A confirmed rental transaction between one Renter and one Listing for a specific date range. | Start date, end date, total price, delivery method, payment status, booking state (see state machine). |
| 15 | **Transaction** | A financial record of money movement: payment, refund, payout, fee, or penalty. | Amount, type, from (renter/platform), to (lender/platform), status, timestamp. |
| 16 | **Review** | A two-way rating + text feedback left after a completed booking. Both renter and lender review each other. | Rating (1-5), text, photos, hidden until both submit, linked to booking. |
| 17 | **Trust Score** | A composite numerical score (0-100) assigned to every actor based on their behavior history. | Calculated from: KYC level + response rate + completion rate + review average + dispute history. |
| 18 | **Dispute** | A formal complaint raised by renter OR lender about a booking issue (damage, non-delivery, quality mismatch, etc.). | Type, evidence (photos/chat), status, resolution, assigned reviewer. |
| 19 | **Protection Plan** | An optional per-booking fee (5-8% of rental value) that provides a damage/loss coverage pool. NOT insurance. | Coverage limit, claim eligibility, exclusions. Legally a service fee, not IRDAI-regulated insurance. |

---

## Part 2: How the Complete System Works — End to End

### The Master Flow (Bird's Eye View)

```mermaid
graph TB
    subgraph SUPPLY["📦 SUPPLY SIDE"]
        IL["👤 Individual Lender<br/>Lists personal items"]
        VL["🏪 Vendor Lender<br/>Lists business inventory"]
    end

    subgraph PLATFORM["🖥️ PLATFORM CORE"]
        REG["Registration<br/>& KYC"]
        CAT["Catalog<br/>& Listings"]
        SRCH["Search<br/>& Discovery"]
        BOOK["Booking<br/>Engine"]
        PAY["Payment<br/>& Escrow"]
        TRUST["Trust<br/>& Safety"]
        REVIEW["Reviews<br/>& Ratings"]
        NOTIFY["Notifications"]
        ADMIN["Admin<br/>Panel"]
        AI["AI Engine"]
    end

    subgraph DEMAND["🛒 DEMAND SIDE"]
        R["👤 Renter<br/>Searches, books, uses, returns"]
    end

    subgraph LOGISTICS["🚚 LOGISTICS"]
        DP["Dunzo / Porter<br/>Delivery Agent"]
        SP["Self Pickup<br/>by Renter"]
    end

    subgraph MONEY["💰 MONEY FLOW"]
        RZP["Razorpay<br/>Payment Gateway"]
        ESC["Escrow<br/>Account"]
        PAYOUT["Vendor/Lender<br/>Payout"]
    end

    IL --> REG --> CAT
    VL --> REG --> CAT
    R --> REG --> SRCH
    SRCH --> |"AI-ranked results"| AI
    SRCH --> BOOK
    BOOK --> PAY --> RZP --> ESC
    BOOK --> |"Delivery needed?"| DP
    BOOK --> |"Self pickup"| SP
    ESC --> |"After successful return"| PAYOUT
    BOOK --> REVIEW --> TRUST
    TRUST --> SRCH
    NOTIFY -.-> R
    NOTIFY -.-> IL
    NOTIFY -.-> VL
    ADMIN --> TRUST
```

---

## Part 3: The 8 Core Flows (Detailed)

### FLOW 1: Registration & Identity Verification

```mermaid
sequenceDiagram
    actor User
    participant App as Platform
    participant OTP as MSG91 (OTP)
    participant DL as DigiLocker API
    participant DB as Supabase DB

    User->>App: Opens app / visits site
    App->>User: "Sign up with phone number"
    User->>App: Enters phone number
    App->>OTP: Send OTP
    OTP->>User: SMS OTP delivered
    User->>App: Enters OTP
    App->>DB: Create user (phone verified) → Trust Tier 3

    Note over User,App: BASIC REGISTRATION COMPLETE<br/>Can browse, but cannot book or list items >₹5,000

    User->>App: "Complete KYC to unlock full access"
    App->>DL: Redirect to DigiLocker consent
    DL->>User: "Allow RentalHub to read your Aadhaar name?"
    User->>DL: Grants consent
    DL->>App: Returns: Full name, DOB, Gender
    App->>DB: Update user → KYC verified → Trust Tier 2

    Note over User,App: KYC COMPLETE<br/>Can book any item, can list items, can earn money

    alt User wants to be Vendor (Business)
        User->>App: "Register as Business"
        User->>App: Uploads GST cert, PAN, Trade License
        App->>DB: Flag for admin review
        App->>App: Admin verifies documents (24-48 hrs)
        App->>DB: Update user → Vendor → Trust Tier 1
        App->>User: "You're now a Verified Vendor 🎉"
    end
```

**Entity states after registration:**

| Tier | Who | Can Browse | Can Rent | Can List | Max Item Value | Badge |
|---|---|---|---|---|---|---|
| Tier 3 (Basic) | Phone-only user | ✅ | ❌ | ❌ | — | None |
| Tier 2 (Verified Individual) | KYC-complete person | ✅ | ✅ | ✅ | ₹50,000 | ✅ Verified |
| Tier 1 (Verified Vendor) | Business-verified entity | ✅ | ✅ | ✅ (incl. vehicles) | Unlimited | 🏪 Verified Business |

---

### FLOW 2: Listing an Item

```mermaid
sequenceDiagram
    actor Lender
    participant App as Platform
    participant AI as AI Engine
    participant DB as Supabase DB
    participant SRCH as Search Index

    Lender->>App: Tap "List an Item"
    App->>App: Check: Is user Tier 2 or Tier 1?
    
    alt Not verified
        App->>Lender: "Complete KYC first"
    end

    Lender->>App: Select category (Camera, Gaming, etc.)
    Lender->>App: Upload 4+ photos
    Lender->>App: Enter: Title, Description, Condition
    Lender->>App: Set: Daily price, Weekly price, Security deposit
    Lender->>App: Set: Location (auto-detect or manual)
    Lender->>App: Set: Delivery preference (self-pickup / delivery / both)
    
    App->>AI: Optimize listing (improve title, suggest pricing)
    AI->>App: Enhanced title + pricing suggestion
    App->>Lender: "AI suggests: '₹800/day based on similar listings'"
    
    Lender->>App: Confirm & Publish
    
    App->>DB: Create listing record
    App->>DB: Store photos in Supabase Storage
    App->>SRCH: Index listing (category, location, price, embeddings)
    App->>DB: Generate vector embedding for semantic search
    
    App->>Lender: "Your item is LIVE! 🎉"
    
    Note over Lender,App: LISTING IS NOW DISCOVERABLE<br/>Status: 🟢 Available
```

**Listing entity — full attribute map:**

```
LISTING {
  id:                 UUID (primary key)
  lender_id:          UUID (FK → users)
  lender_type:        ENUM ['individual', 'vendor']
  
  // Item details
  title:              TEXT (max 100 chars)
  description:        TEXT (max 2000 chars)
  category:           ENUM ['cameras', 'gaming', 'musical_instruments', 
                            'camping', 'electronics', 'fashion', 'tools',
                            'party_supplies', 'furniture', 'sports', 
                            'books', 'vehicles', 'other']
  subcategory:        TEXT
  brand:              TEXT (optional)
  condition:          ENUM ['like_new', 'good', 'fair', 'worn']
  item_value:         INTEGER (estimated replacement value in ₹)
  
  // Pricing
  price_daily:        INTEGER (₹)
  price_weekly:       INTEGER (₹, optional, usually discounted)
  price_monthly:      INTEGER (₹, optional, usually heavily discounted)
  security_deposit:   INTEGER (₹, max 50% of item_value)
  minimum_rental_days: INTEGER (default: 1)
  
  // Location & logistics
  location_lat:       FLOAT
  location_lng:       FLOAT
  location_area:      TEXT ('Kothrud, Pune')
  location_city:      TEXT ('Pune')
  delivery_options:   ENUM[] ['self_pickup', 'platform_delivery']
  
  // Media
  photos:             TEXT[] (URLs, minimum 4)
  
  // Status & availability
  status:             ENUM ['available', 'unavailable', 'rented', 
                            'under_review', 'suspended', 'deleted']
  availability_calendar: JSONB (blocked date ranges)
  
  // Trust & quality
  total_rentals:      INTEGER (counter)
  avg_rating:         FLOAT (1.0-5.0)
  response_rate:      FLOAT (0-100%)
  
  // Search
  embedding:          VECTOR(1536) (for semantic search via pgvector)
  
  // Timestamps
  created_at:         TIMESTAMP
  updated_at:         TIMESTAMP
  last_active_at:     TIMESTAMP (last time lender confirmed availability)
}
```

---

### FLOW 3: Discovery & Search

```mermaid
flowchart TB
    R["🔍 Renter searches"]
    
    R --> Q{"Query type?"}
    
    Q --> |"Text: 'camera for wedding'"| NLP["AI Intent Parser<br/>(GPT-4o-mini)"]
    Q --> |"Browse: taps 'Cameras'"| CAT["Category Filter"]
    Q --> |"Map: 'near me'"| GEO["Geolocation Query"]
    
    NLP --> |"category: cameras<br/>occasion: wedding<br/>urgency: soon"| RANK
    CAT --> RANK
    GEO --> RANK
    
    RANK["🏆 Ranking Engine"]
    
    RANK --> S1["Score = <br/>0.25 × Trust Score +<br/>0.25 × Distance +<br/>0.20 × Rating +<br/>0.15 × Price Match +<br/>0.10 × Response Rate +<br/>0.05 × Recency"]
    
    S1 --> FILTER["Apply Filters:<br/>Price range, Dates,<br/>Delivery option,<br/>Condition, Lender type"]
    
    FILTER --> RESULTS["📋 Ranked Results"]
    
    RESULTS --> V["Vendor listings<br/>(🏪 badge, higher trust)"]
    RESULTS --> I["Individual listings<br/>(✅ badge if verified)"]
    
    RESULTS --> BOOST["💎 Boosted Listings<br/>(paid promotion, labeled)"]
```

**Search ranking formula:**

```
SEARCH_SCORE = (
    0.25 × normalized_trust_score    +   // Lender's overall trust (0-1)
    0.25 × distance_score            +   // 1.0 = same neighborhood, 0.0 = 20km+
    0.20 × avg_rating_score          +   // 5.0→1.0, 1.0→0.0
    0.15 × price_relevance           +   // How close to searcher's budget
    0.10 × response_rate             +   // % of inquiries responded in <6hrs
    0.05 × recency_score                 // Last active / last updated
)

// BOOSTED LISTINGS: add flat +0.15 bonus (capped, labeled "Promoted")
// SOCIAL PROXIMITY: if lender is in renter's contact graph → +0.10 bonus
// NEW LISTER BOOST: first 30 days → +0.05 bonus (helps cold-start)
```

---

### FLOW 4: Booking & Reservation

```mermaid
sequenceDiagram
    actor Renter
    participant App as Platform
    participant DB as Supabase DB
    participant Redis as Upstash Redis
    participant RZP as Razorpay
    participant Notify as WhatsApp/Push

    Renter->>App: Views listing → Taps "Rent This"
    App->>DB: Check: renter KYC level sufficient?
    
    alt Item value > ₹5,000 AND renter is Tier 3
        App->>Renter: "Complete KYC to rent this item"
    end
    
    Renter->>App: Selects dates (start → end)
    App->>DB: Check availability calendar
    
    alt Dates not available
        App->>Renter: "These dates are blocked. Try nearby dates."
    end
    
    App->>Redis: SET lock:{listing_id} {renter_id} NX EX 600
    Note over Redis: Item locked for 10 minutes<br/>No one else can book these dates

    App->>App: Calculate total price
    Note over App: rental_amount = daily_price × days<br/>protection_fee = rental_amount × 0.06 (optional)<br/>delivery_fee = Dunzo quote OR ₹0 (self-pickup)<br/>platform_fee = included in commission<br/>security_deposit = listing.security_deposit<br/><br/>TOTAL = rental + protection + delivery + deposit

    App->>Renter: Shows price breakdown
    Renter->>App: Selects delivery method
    Renter->>App: Opts in/out of protection plan
    Renter->>App: Confirms → "Pay ₹X"
    
    App->>RZP: Create payment order (amount = TOTAL)
    RZP->>Renter: UPI / Card / Wallet checkout
    Renter->>RZP: Completes payment
    RZP->>App: Payment success webhook
    
    App->>Redis: DEL lock:{listing_id}
    App->>DB: Create booking (status: CONFIRMED)
    App->>DB: Block dates in listing availability calendar
    App->>DB: Create transaction record (payment received)
    
    App->>RZP: Route funds to escrow (rental + commission held)
    App->>RZP: Route security deposit to escrow (held separately)
    
    App->>Notify: WhatsApp to Lender: "New booking! ₹X, [dates]. Confirm?"
    App->>Notify: WhatsApp to Renter: "Booking confirmed! Details..."
    App->>Notify: Push notification to both

    Note over App: BOOKING IS NOW CONFIRMED<br/>Lender has 2 hours to acknowledge<br/>If no response → auto-cancel + full refund
```

---

### FLOW 5: Payment & Escrow — Money Movement

```mermaid
flowchart TB
    subgraph RENTER_PAYS["💳 RENTER PAYS"]
        RP["Renter pays TOTAL:<br/>Rental ₹1,200<br/>+ Protection ₹72<br/>+ Delivery ₹120<br/>+ Deposit ₹2,500<br/>= ₹3,892"]
    end
    
    subgraph RAZORPAY["🏦 RAZORPAY ROUTE"]
        ESC_RENT["Escrow: Rental<br/>₹1,200"]
        ESC_DEP["Escrow: Deposit<br/>₹2,500"]
        PROT_POOL["Protection Pool<br/>₹72"]
        DEL_PAY["Delivery: Dunzo<br/>₹120"]
    end
    
    subgraph SETTLEMENT["✅ AFTER SUCCESSFUL RETURN"]
        L_PAY["Lender Payout<br/>₹1,200 - 12% commission<br/>= ₹1,056"]
        PLAT["Platform Revenue<br/>₹144 (commission)<br/>+ ₹72 (protection fee)"]
        DEP_BACK["Deposit → Back to Renter<br/>₹2,500"]
    end
    
    subgraph DAMAGE["⚠️ IF DAMAGE FOUND"]
        CLAIM["Damage assessed:<br/>₹800 repair cost"]
        DEP_DEDUCT["₹800 deducted<br/>from deposit"]
        DEP_PARTIAL["₹1,700 returned<br/>to renter"]
        LENDER_COMP["₹800 sent to<br/>lender for repair"]
    end
    
    RP --> ESC_RENT
    RP --> ESC_DEP
    RP --> PROT_POOL
    RP --> DEL_PAY
    
    ESC_RENT --> |"T+2 after return"| L_PAY
    ESC_RENT --> |"Commission"| PLAT
    PROT_POOL --> PLAT
    ESC_DEP --> |"No damage"| DEP_BACK
    ESC_DEP --> |"Damage found"| CLAIM
    CLAIM --> DEP_DEDUCT
    CLAIM --> DEP_PARTIAL
    DEP_DEDUCT --> LENDER_COMP
```

**Money flow rules:**

| Event | Rental Amount | Deposit | Protection Fee | Action |
|---|---|---|---|---|
| Booking confirmed | → Escrow | → Escrow | → Platform pool | All held by Razorpay Route |
| Lender doesn't acknowledge (2hrs) | → Refund to renter | → Refund to renter | → Refund to renter | Auto-cancel |
| Renter cancels (>24hrs before) | → 90% refund | → Full refund | → Full refund | 10% cancellation fee |
| Renter cancels (<24hrs before) | → 50% refund | → Full refund | → No refund | 50% kept for lender |
| Successful return, no damage | → Lender (minus commission) T+2 | → Renter (instant) | → Platform keeps | Normal settlement |
| Damage found | → Lender (minus commission) T+2 | → Deducted for repair → lender | → Used if deposit insufficient | Dispute may follow |
| Item not returned (theft) | → Lender | → Lender (full deposit) | → Lender (from pool) | Police report + blacklist renter |

---

### FLOW 6: Delivery / Pickup

```mermaid
flowchart TB
    BOOK["Booking Confirmed"]
    
    BOOK --> METHOD{"Delivery method?"}
    
    METHOD --> |"Self Pickup"| SELF
    METHOD --> |"Platform Delivery"| DEL
    
    subgraph SELF["🚶 SELF PICKUP"]
        S1["Renter gets lender's area<br/>(exact address after booking)"]
        S2["Renter goes to lender's location"]
        S3["Both open app → 'Start Handover'"]
        S4["Lender shows item → both take photos<br/>(4 angles, timestamped, geotagged)"]
        S5["Renter enters OTP shown on lender's screen"]
        S6["Handover confirmed ✅"]
    end
    
    subgraph DEL["🚚 PLATFORM DELIVERY (Dunzo/Porter)"]
        D1["Platform calls Dunzo API<br/>Pickup: Lender address<br/>Drop: Renter address"]
        D2["Agent assigned → ETA shared"]
        D3["Agent arrives at lender"]
        D4["Lender hands item to agent<br/>Agent takes condition photos"]
        D5["Agent in transit → live tracking"]
        D6["Agent arrives at renter"]
        D7["Renter enters OTP → receives item<br/>Renter takes condition photos"]
        D8["Delivery confirmed ✅"]
    end
    
    S1 --> S2 --> S3 --> S4 --> S5 --> S6
    D1 --> D2 --> D3 --> D4 --> D5 --> D6 --> D7 --> D8
    
    S6 --> ACTIVE["📦 RENTAL PERIOD ACTIVE<br/>Countdown timer starts"]
    D8 --> ACTIVE
```

**Photo evidence protocol (non-negotiable for trust):**

```
HANDOVER PHOTOS (required at every handover point):
  
  1. FRONT VIEW      — full item, straight on
  2. BACK VIEW       — full item, opposite side
  3. DETAIL VIEW     — any existing scratches/wear (close-up)
  4. SERIAL/ID VIEW  — serial number or unique identifier visible

  Metadata captured automatically:
  - Timestamp (from device, verified against server)
  - GPS coordinates (proves location)
  - Device ID (prevents photo spoofing)
  - Hash (immutable record)
  
  Stored in: Supabase Storage (write-once, read-many)
  Retention: 90 days after booking completion
```

---

### FLOW 7: Return & Inspection

```mermaid
sequenceDiagram
    actor Renter
    participant App as Platform
    participant AI as AI Engine (GPT-4o Vision)
    participant Lender
    participant Admin

    Note over App: 24 hours before return date
    App->>Renter: WhatsApp: "Your rental ends tomorrow. Schedule return."
    App->>Renter: Push: "Return reminder for Canon EOS R5"
    
    Renter->>App: Initiates return (self-dropoff or schedule pickup)
    
    alt Self Dropoff
        Renter->>Lender: Meets at agreed location
    else Platform Pickup
        App->>App: Calls Dunzo API for reverse pickup
    end
    
    Note over Renter,Lender: PHYSICAL HANDOVER BACK
    
    Renter->>App: Takes 4 return condition photos
    Lender->>App: Takes 4 return condition photos
    Lender->>App: Taps "Item Received"
    
    App->>AI: Compare pre-rental photos vs post-rental photos
    AI->>App: Analysis result: {damage_detected: bool, confidence: 0-1, details: "..."}
    
    alt AI says: No damage (confidence > 0.85)
        App->>App: Auto-approve return
        App->>App: Release deposit to renter (instant)
        App->>App: Schedule lender payout (T+2)
        App->>Renter: "Return complete! Deposit refunded. ✅"
        App->>Lender: "Return complete! Payout in 2 days. ✅"
    
    else AI says: Possible damage OR low confidence
        App->>Lender: "Do you see any damage? Yes / No"
        
        alt Lender says No
            App->>App: Return approved, settle normally
        
        else Lender says Yes
            Lender->>App: Describes damage + uploads close-up photos
            App->>App: Create Dispute (auto-assigned)
            App->>Admin: Escalate for human review
            App->>Renter: "Lender reported damage. We're reviewing."
            Note over Admin: SEE FLOW 8: DISPUTE RESOLUTION
        end
    end
    
    App->>Renter: "Please rate your experience with [Lender]"
    App->>Lender: "Please rate your experience with [Renter]"
    
    Note over App: Reviews hidden until BOTH submit<br/>or 5 days pass (whichever first)
```

---

### FLOW 8: Dispute Resolution

```mermaid
flowchart TB
    RAISE["⚠️ Dispute Raised<br/>(by Renter OR Lender)"]
    
    RAISE --> TYPE{"Dispute Type"}
    
    TYPE --> DMG["Damage<br/>to item"]
    TYPE --> QUAL["Quality<br/>mismatch"]
    TYPE --> NOSHOW["No-show /<br/>Non-delivery"]
    TYPE --> LATE["Late<br/>return"]
    TYPE --> THEFT["Item not<br/>returned"]
    
    DMG --> EVIDENCE["Evidence Collection<br/>• Pre-rental photos<br/>• Post-rental photos<br/>• AI damage analysis<br/>• Chat history<br/>• GPS/timestamp logs"]
    QUAL --> EVIDENCE
    NOSHOW --> EVIDENCE
    LATE --> EVIDENCE
    THEFT --> EVIDENCE
    
    EVIDENCE --> TRIAGE{"AI Triage<br/>(auto-resolve?)"}
    
    TRIAGE --> |"Clear case:<br/>evidence conclusive"| AUTO["Auto-Resolution<br/>• Late return → charge extra days<br/>• No-show by lender → full refund<br/>• Quality mismatch + photos → partial refund"]
    
    TRIAGE --> |"Unclear / contested /<br/>high value"| HUMAN["Human Review<br/>(Admin / Trust team)"]
    
    HUMAN --> DECIDE{"Decision"}
    
    DECIDE --> RENTER_WINS["Renter wins:<br/>Full/partial refund<br/>from deposit or pool"]
    DECIDE --> LENDER_WINS["Lender wins:<br/>Damage deducted from<br/>renter's deposit"]
    DECIDE --> SPLIT["Split decision:<br/>Partial compensation<br/>to both parties"]
    
    RENTER_WINS --> NOTIFY_BOTH["Both parties notified<br/>with explanation"]
    LENDER_WINS --> NOTIFY_BOTH
    SPLIT --> NOTIFY_BOTH
    AUTO --> NOTIFY_BOTH
    
    NOTIFY_BOTH --> TRUST_UPDATE["Trust scores updated:<br/>• Losing party: -5 to -15 points<br/>• Repeat offender: suspension"]
    
    THEFT --> POLICE["🚨 Escalation:<br/>• Renter blacklisted<br/>• Full deposit to lender<br/>• Protection pool activated<br/>• Police report assisted"]
```

**Dispute SLA:**

| Priority | Resolution Target | Who Handles |
|---|---|---|
| Theft / Safety | 4 hours | Founder (Month 1-6), then Trust & Safety lead |
| Damage claim >₹5,000 | 24 hours | Human reviewer |
| Damage claim <₹5,000 | 12 hours | AI auto-resolve if evidence clear, else human |
| Late return | Instant | Auto-charge extra days from deposit |
| Quality mismatch | 24 hours | Human reviewer with photo comparison |
| No-show by lender | Instant | Auto-refund + lender penalty |

---

## Part 4: Booking State Machine

Every booking moves through exactly these states:

```mermaid
stateDiagram-v2
    [*] --> CREATED: Renter initiates
    
    CREATED --> PAYMENT_PENDING: Price calculated
    PAYMENT_PENDING --> PAYMENT_FAILED: Payment fails / timeout
    PAYMENT_FAILED --> [*]: Booking abandoned
    
    PAYMENT_PENDING --> CONFIRMED: Payment successful
    
    CONFIRMED --> LENDER_ACKNOWLEDGED: Lender confirms within 2hrs
    CONFIRMED --> AUTO_CANCELLED: Lender doesn't respond (2hrs)
    AUTO_CANCELLED --> REFUNDED: Full refund to renter
    REFUNDED --> [*]
    
    LENDER_ACKNOWLEDGED --> READY_FOR_HANDOVER: Item prepared
    
    READY_FOR_HANDOVER --> IN_TRANSIT: Delivery agent picked up
    READY_FOR_HANDOVER --> HANDED_OVER: Self-pickup completed
    
    IN_TRANSIT --> HANDED_OVER: Delivered + OTP confirmed
    
    HANDED_OVER --> ACTIVE: Rental period active
    
    ACTIVE --> RETURN_INITIATED: Renter starts return
    ACTIVE --> OVERDUE: Past return date (24hr grace)
    OVERDUE --> RETURN_INITIATED: Late return started
    OVERDUE --> THEFT_SUSPECTED: 48hrs+ no response
    
    RETURN_INITIATED --> RETURNED: Item received by lender
    
    RETURNED --> INSPECTION_PASSED: No damage
    RETURNED --> DISPUTE_OPEN: Damage reported
    
    INSPECTION_PASSED --> SETTLED: Deposit refunded, lender paid
    SETTLED --> REVIEW_PENDING: Both asked to review
    REVIEW_PENDING --> COMPLETED: Reviews submitted or 5 days
    COMPLETED --> [*]
    
    DISPUTE_OPEN --> DISPUTE_RESOLVED: Resolution reached
    DISPUTE_RESOLVED --> SETTLED
    
    THEFT_SUSPECTED --> ESCALATED: Admin + police
    
    note right of CONFIRMED: Escrow holds all funds
    note right of ACTIVE: Item with renter
    note right of SETTLED: Money distributed
```

---

## Part 5: Trust Score System

```
TRUST_SCORE (0-100) = weighted composite

COMPONENTS:
┌──────────────────────────────────────────────────────────────┐
│                                                              │
│  KYC_LEVEL (0-25 points)                                     │
│  ├─ Phone only:           5 pts                              │
│  ├─ + Aadhaar verified:  15 pts                              │
│  ├─ + Bank verified:     20 pts                              │
│  └─ + GST/Business:      25 pts                              │
│                                                              │
│  TRANSACTION_HISTORY (0-30 points)                            │
│  ├─ 0 completed:          0 pts                              │
│  ├─ 1-5 completed:       10 pts                              │
│  ├─ 6-20 completed:      20 pts                              │
│  └─ 21+ completed:       30 pts                              │
│                                                              │
│  REVIEW_SCORE (0-20 points)                                   │
│  ├─ avg_rating × 4 (so 5.0 → 20, 4.0 → 16, etc.)           │
│  └─ Minimum 3 reviews to activate                            │
│                                                              │
│  RESPONSE_RELIABILITY (0-15 points)                           │
│  ├─ Response rate × 10 (so 100% → 10)                       │
│  ├─ + Completion rate × 5 (bookings honored / total)         │
│  └─ Penalized: -3 per cancellation by lender                │
│                                                              │
│  DISPUTE_HISTORY (0 to -10 penalty)                           │
│  ├─ 0 disputes lost:      0 pts                              │
│  ├─ 1 dispute lost:      -3 pts                              │
│  ├─ 2 disputes lost:     -7 pts                              │
│  └─ 3+ disputes lost:   -10 pts + REVIEW BY ADMIN            │
│                                                              │
│  SOCIAL_PROOF (0-10 bonus, optional)                          │
│  ├─ Google/FB connected:  +3 pts                             │
│  ├─ Profile photo:        +2 pts                             │
│  ├─ Bio completed:        +2 pts                             │
│  └─ Referred by trusted user: +3 pts                         │
│                                                              │
│  FINAL SCORE = KYC + HISTORY + REVIEWS + RELIABILITY         │
│                + DISPUTES + SOCIAL                            │
│  Capped at 0 (floor) and 100 (ceiling)                       │
│                                                              │
│  THRESHOLDS:                                                  │
│  ├─ <20:  "New" (limited visibility, lower booking limits)   │
│  ├─ 20-49: "Building Trust" (normal access)                  │
│  ├─ 50-79: "Trusted" (priority in search, higher limits)    │
│  └─ 80+:  "Top Rated" (badge, featured placement)           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## Part 6: Technical Architecture

```
┌────────────────────────────────────────────────────────────────────┐
│                        CLIENTS                                      │
│                                                                      │
│  📱 PWA (Next.js 14)        📱 Native App (Phase 2, Flutter)        │
│  └─ Renter views            └─ Same features, native push           │
│  └─ Lender views                                                     │
│  └─ Admin dashboard                                                  │
│                                                                      │
│  All communicate via REST API + Supabase Realtime (WebSocket)        │
├────────────────────────────────────────────────────────────────────┤
│                        EDGE / CDN                                    │
│                                                                      │
│  Vercel Edge Network         Cloudflare R2 + CDN                     │
│  └─ SSR / SSG pages          └─ Photos, documents                    │
│  └─ API routes               └─ Global edge delivery                 │
│  └─ ISR for SEO pages                                                │
├────────────────────────────────────────────────────────────────────┤
│                        APPLICATION LAYER                             │
│                                                                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌──────────────┐  │
│  │ Auth &      │ │ Listings &  │ │ Booking     │ │ Search &     │  │
│  │ Users       │ │ Catalog     │ │ Engine      │ │ Discovery    │  │
│  │             │ │             │ │             │ │              │  │
│  │ • Register  │ │ • CRUD      │ │ • Reserve   │ │ • Text search│  │
│  │ • KYC       │ │ • Photos    │ │ • Lock      │ │ • AI intent  │  │
│  │ • Trust     │ │ • Pricing   │ │ • Confirm   │ │ • Geo filter │  │
│  │   Score     │ │ • Avail.    │ │ • States    │ │ • Vector     │  │
│  │ • Profiles  │ │ • Toggle    │ │ • Cancel    │ │   similarity │  │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬───────┘  │
│         │               │               │               │           │
│  ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴──────┐ ┌──────┴───────┐  │
│  │ Payment &   │ │ Reviews &   │ │ Disputes &  │ │ Notification │  │
│  │ Escrow      │ │ Ratings     │ │ Safety      │ │ Engine       │  │
│  │             │ │             │ │             │ │              │  │
│  │ • Razorpay  │ │ • Two-way   │ │ • Create    │ │ • WhatsApp   │  │
│  │ • Route     │ │ • Hidden    │ │ • AI triage │ │ • Push (FCM) │  │
│  │ • Escrow    │ │   reveal    │ │ • Human     │ │ • Email      │  │
│  │ • Payouts   │ │ • Trust     │ │   review    │ │ • In-app     │  │
│  │ • Refunds   │ │   impact    │ │ • Resolve   │ │ • SMS (OTP)  │  │
│  └──────┬──────┘ └──────┬──────┘ └──────┬──────┘ └──────┬───────┘  │
│         └───────────────┴───────────────┴───────────────┘           │
├────────────────────────────────────────────────────────────────────┤
│                        DATA LAYER                                    │
│                                                                      │
│  ┌──────────────────┐  ┌────────────┐  ┌─────────────────────────┐  │
│  │ Supabase         │  │ Upstash    │  │ External APIs           │  │
│  │ (PostgreSQL)     │  │ Redis      │  │                         │  │
│  │                  │  │            │  │ • Razorpay (payments)   │  │
│  │ • All tables     │  │ • Booking  │  │ • DigiLocker (KYC)     │  │
│  │ • Row Level      │  │   locks    │  │ • Dunzo/Porter (deliv) │  │
│  │   Security       │  │ • Session  │  │ • OpenAI (AI search)   │  │
│  │ • pgvector       │  │   cache    │  │ • Wati (WhatsApp)      │  │
│  │   (embeddings)   │  │ • Rate     │  │ • MSG91 (SMS/OTP)      │  │
│  │ • Realtime       │  │   limiting │  │ • Resend (email)       │  │
│  │   (WebSocket)    │  │            │  │ • Google Maps (geo)    │  │
│  │ • Auth           │  │            │  │ • Sentry (errors)      │  │
│  │ • Storage        │  │            │  │                         │  │
│  │   (photos/docs)  │  │            │  │                         │  │
│  └──────────────────┘  └────────────┘  └─────────────────────────┘  │
│                                                                      │
└────────────────────────────────────────────────────────────────────┘
```

---

## Part 7: Complete Data Model

```mermaid
erDiagram
    USERS ||--o{ LISTINGS : "creates"
    USERS ||--o{ BOOKINGS : "rents as renter"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ TRANSACTIONS : "involved in"
    USERS {
        uuid id PK
        text phone
        text name
        text email
        enum type "renter | individual_lender | vendor"
        enum kyc_status "none | phone | aadhaar | business"
        enum trust_tier "tier3 | tier2 | tier1"
        int trust_score "0-100"
        jsonb kyc_data "encrypted"
        text profile_photo
        text bio
        text city
        float location_lat
        float location_lng
        text bank_account_id "Razorpay linked"
        timestamp created_at
    }

    LISTINGS ||--o{ BOOKINGS : "booked via"
    LISTINGS ||--o{ LISTING_PHOTOS : "has"
    LISTINGS {
        uuid id PK
        uuid lender_id FK
        text title
        text description
        enum category
        text subcategory
        enum condition "like_new | good | fair"
        int item_value
        int price_daily
        int price_weekly
        int price_monthly
        int security_deposit
        enum status "available | unavailable | rented | suspended"
        jsonb availability_calendar
        text location_area
        text location_city
        float lat
        float lng
        enum delivery_options
        float avg_rating
        int total_rentals
        float response_rate
        vector embedding "pgvector 1536"
        timestamp created_at
        timestamp last_active_at
    }

    BOOKINGS ||--o{ TRANSACTIONS : "generates"
    BOOKINGS ||--o{ DISPUTES : "may have"
    BOOKINGS ||--o{ BOOKING_PHOTOS : "evidence"
    BOOKINGS ||--|{ REVIEWS : "gets reviewed"
    BOOKINGS {
        uuid id PK
        uuid listing_id FK
        uuid renter_id FK
        uuid lender_id FK
        date start_date
        date end_date
        int rental_amount
        int security_deposit
        int protection_fee
        int delivery_fee
        int total_amount
        enum delivery_method "self_pickup | platform_delivery"
        enum status "created | payment_pending | confirmed | acknowledged | ready | in_transit | handed_over | active | return_initiated | returned | inspection_passed | dispute_open | settled | completed | cancelled | refunded"
        text handover_otp
        text return_otp
        timestamp created_at
        timestamp confirmed_at
        timestamp handed_over_at
        timestamp returned_at
        timestamp settled_at
    }

    TRANSACTIONS {
        uuid id PK
        uuid booking_id FK
        uuid from_user_id FK
        uuid to_user_id FK
        int amount
        enum type "payment | commission | deposit_hold | deposit_refund | deposit_deduction | payout | refund | protection_fee | delivery_fee | late_fee | cancellation_fee"
        enum status "pending | completed | failed | reversed"
        text razorpay_payment_id
        text razorpay_transfer_id
        timestamp created_at
    }

    REVIEWS {
        uuid id PK
        uuid booking_id FK
        uuid reviewer_id FK
        uuid reviewee_id FK
        int rating "1-5"
        text comment
        text photos
        bool is_visible "false until both submit"
        timestamp created_at
    }

    DISPUTES {
        uuid id PK
        uuid booking_id FK
        uuid raised_by FK
        enum type "damage | quality | no_show | late_return | theft | other"
        text description
        text evidence_photos
        enum status "open | under_review | auto_resolved | human_resolved | escalated | closed"
        text resolution_notes
        int resolution_amount
        uuid resolved_by FK
        timestamp created_at
        timestamp resolved_at
    }

    NOTIFICATIONS {
        uuid id PK
        uuid user_id FK
        enum channel "whatsapp | push | email | sms"
        text template_id
        jsonb template_data
        enum status "queued | sent | delivered | failed"
        timestamp sent_at
    }
```

---

## Part 8: Notification Matrix — Who Gets What, When

| Event | Renter | Lender | Channel | Timing |
|---|---|---|---|---|
| Booking created | "Booking confirmed! ₹X paid." | "New booking! [Item] for [dates]. Reply YES." | WhatsApp + Push | Instant |
| Lender acknowledges | "Lender confirmed! Preparing item." | "Great! Prepare item for [date]." | Push | Instant |
| Lender doesn't respond (2hrs) | "Auto-cancelled. Full refund." | "You missed a booking. Response rate affected." | WhatsApp + Push | After 2hrs |
| Delivery dispatched | "Item on the way! Track here." | "Item picked up by delivery agent." | Push + WhatsApp | Instant |
| Handover complete | "Enjoy your rental! Return by [date]." | "Item delivered to renter." | Push | Instant |
| 24hrs before return | "Return reminder: [item] due tomorrow." | "Expect return tomorrow." | WhatsApp + Push | T-24hrs |
| Return completed | "Deposit refunded! Please rate." | "Item back! Payout in 2 days. Rate renter." | WhatsApp + Push | Instant |
| Damage dispute | "Lender reports damage. We're reviewing." | "We received your damage report. Reviewing." | WhatsApp | Instant |
| Dispute resolved | "Resolved: [outcome]. ₹X refunded/charged." | "Resolved: [outcome]. ₹X awarded." | WhatsApp + Email | On resolution |
| Payout processed | — | "₹X deposited to your bank account." | WhatsApp | T+2 days |
| New review received | "You got a review! ⭐ [X/5]" | "You got a review! ⭐ [X/5]" | Push | On reveal |
| Listing going stale | — | "Update your listing. Still available?" | WhatsApp | After 14 days idle |

---

## Part 9: Operational Playbook — The Human Side

### Daily Operations (City Ops Team)

```
MORNING (9:00 AM):
  □ Review overnight bookings — any lender non-responses?
  □ Check active disputes — any past SLA?
  □ Review new vendor applications (if any)
  □ Check listing quality — any spam/fake listings reported?

MIDDAY (1:00 PM):
  □ Follow up on pending deliveries
  □ Check return schedule for today
  □ Review AI-flagged listings (low quality, pricing anomalies)

EVENING (6:00 PM):
  □ Process vendor payouts (T+2 batch)
  □ Review day's dispute resolutions
  □ Update vendor/lender CRM notes
  □ Check trust score anomalies

WEEKLY:
  □ Vendor relationship calls (top 10 vendors)
  □ Review category performance (which categories getting traction)
  □ Analyze drop-off funnel (search → listing view → book → complete)
  □ Community engagement (respond to Reddit/social mentions)

MONTHLY:
  □ Vendor retention review (anyone churning?)
  □ Trust score calibration (are scores predictive of behavior?)
  □ Category expansion review (what are users searching for that we don't have?)
  □ Financial review (unit economics, CAC, LTV tracking)
```

---

## Part 10: Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    SECURITY LAYERS                       │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  LAYER 1: IDENTITY                                       │
│  ├─ Supabase Auth (JWT tokens, refresh rotation)         │
│  ├─ Phone OTP (MSG91) — proof of phone ownership         │
│  ├─ DigiLocker — proof of identity (Aadhaar-linked)      │
│  └─ Session management: 30-day refresh, 1-hour access    │
│                                                          │
│  LAYER 2: AUTHORIZATION                                  │
│  ├─ Row Level Security (RLS) in Supabase                 │
│  │   • Users can only read/update their own data         │
│  │   • Lenders can only modify their own listings        │
│  │   • Booking data visible only to involved parties     │
│  ├─ Role-Based Access Control (RBAC)                     │
│  │   • renter, lender, vendor, admin, super_admin        │
│  └─ API rate limiting (Upstash Redis)                    │
│     • 100 requests/minute per user                       │
│     • 10 booking attempts/hour per user                  │
│                                                          │
│  LAYER 3: DATA PROTECTION                                │
│  ├─ KYC data encrypted at rest (AES-256)                 │
│  ├─ PII (phone, Aadhaar) never exposed in API responses  │
│  ├─ Photos stored with write-once policy                 │
│  ├─ DPDPA compliance:                                    │
│  │   • Explicit consent at registration                  │
│  │   • Data deletion on account closure (within 30 days) │
│  │   • Minimum data collection principle                 │
│  └─ CERT-In: 6-hour breach notification SOP              │
│                                                          │
│  LAYER 4: PAYMENT SECURITY                               │
│  ├─ Razorpay handles PCI-DSS compliance                  │
│  ├─ No card data touches our servers                     │
│  ├─ Webhook signature verification on all callbacks      │
│  └─ Idempotency keys on all payment operations           │
│                                                          │
│  LAYER 5: FRAUD PREVENTION                               │
│  ├─ Velocity checks: max 3 bookings/day per user         │
│  ├─ New user limits: first 3 bookings capped at ₹5,000  │
│  ├─ Device fingerprinting (basic)                        │
│  ├─ GPS verification on photo uploads                    │
│  ├─ AI anomaly detection (unusual booking patterns)      │
│  └─ Manual review queue for high-value transactions      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## Quick Reference: How Everything Connects

```mermaid
graph LR
    subgraph PEOPLE
        R[Renter]
        IL[Individual Lender]
        VL[Vendor Lender]
        DA[Delivery Agent]
        AD[Admin]
    end
    
    subgraph ACTIONS
        LIST[List Item]
        SEARCH[Search/Browse]
        BOOK[Book & Pay]
        DELIVER[Pickup/Deliver]
        USE[Use Item]
        RETURN[Return & Inspect]
        REVIEW[Rate & Review]
        DISPUTE[Raise Dispute]
        PAYOUT[Receive Payout]
    end
    
    IL --> LIST
    VL --> LIST
    R --> SEARCH
    SEARCH --> BOOK
    BOOK --> DELIVER
    DA --> DELIVER
    DELIVER --> USE
    USE --> RETURN
    RETURN --> REVIEW
    RETURN --> DISPUTE
    REVIEW --> R
    REVIEW --> IL
    REVIEW --> VL
    PAYOUT --> IL
    PAYOUT --> VL
    AD --> DISPUTE
```

> [!TIP]
> **Print this document.** Every engineer, designer, ops person, and co-founder should have this as their reference. When someone asks "how does X work?" — the answer is in here.
