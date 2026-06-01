# RentalHub 🔑

> **India's trusted P2P rental marketplace.** Rent anything from verified neighbors. Earn from what you own.

[![Status](https://img.shields.io/badge/Status-Live%20in%20Pune-brightgreen)](https://github.com)
[![License](https://img.shields.io/badge/License-Proprietary-red)](LICENSE)

---

## 📋 What's in This Repo

| Folder / File | Description |
|---|---|
| `landing/` | Marketing landing page (HTML + CSS + JS) |
| `landing/images/` | AI-generated product listing photos |
| `pitch_deck.html` | Interactive investor pitch deck |
| `system_architecture.html` | Interactive system architecture diagram |
| `system_architecture.md` | Full system architecture document (19 entities, 8 flows) |
| `analysis_results.md` | Business hypothesis analysis & deep-dive |
| `p2p_pivot_deepdive.md` | P2P marketplace research & feasibility |
| `realistic_playbook.md` | Go-to-market strategy & realistic numbers |

---

## 🎯 The Idea

**RentalHub** is a generalized peer-to-peer rental platform for India — starting in Pune.

Anyone can list items they own (cameras, gaming consoles, camping gear, musical instruments, tools, drones, fashion) and rent them to verified neighbors. Think Airbnb, but for every idle asset in your home.

### Key Numbers
- 🏠 Average Indian household has **₹2–5L** in idle assets
- 📱 **491M UPI users** — payment infrastructure ready
- 🤝 **₹14,600/mo** average lender earnings potential (3 items)

---

## 🏗️ System Architecture (Overview)

The platform connects **6 actor types** across **19 entities** through **8 core flows**:

**Actors:** Renter · Individual Lender · Vendor (Business) · Delivery Agent · Platform Admin · Support Agent

**Core Flows:**
1. Registration & KYC (Aadhaar via DigiLocker)
2. Listing an Item (AI-optimized, availability calendar)
3. Discovery & Search (AI intent parsing + geo + trust ranking)
4. Booking & Reservation (10-min lock via Redis)
5. Payment & Escrow (Razorpay Route)
6. Delivery / OTP Pickup
7. Return & AI Damage Inspection (GPT-4o Vision)
8. Dispute Resolution (AI triage → human review)

**Tech Stack:** Next.js 14 · Supabase · Razorpay · DigiLocker API · Dunzo/Porter · WhatsApp Business API · GPT-4o Vision

---

## 🛡️ Trust System

Every user gets a **Trust Score (0–100)** based on:
- KYC level (phone → Aadhaar → Business)
- Transaction history
- Review average
- Response reliability
- Dispute history

Higher trust = better search placement, higher booking limits, Featured badge.

---

## 💰 Business Model

| Revenue Stream | Rate |
|---|---|
| Platform commission | 12% of rental value |
| Protection Plan fee | 6% of rental value (optional) |
| Promoted listings | ₹299–999/month |
| Vendor subscription | ₹999–2,999/month |

---

## 🚀 Landing Page

The `landing/` folder contains a complete, production-ready marketing page:

- **Live marketplace feel** — 6 real listing cards with product photos
- **Live activity ticker** — scrolling real-time rental activity
- **How it works** — tabbed Renter / Lender flows
- **Trust section** — all 5 protection layers explained
- **Earn calculator** — real earnings potential by item
- **FAQ** — CSS-only accordion (no JS needed)
- **Signup form** — Renter/Lender tabs, success state
- **Fully mobile responsive** — works at 480px to 1440px+

**To run locally:** Just open `landing/index.html` in any browser. No build step needed.

---

## 📁 Key Documents

| Document | What It Covers |
|---|---|
| [System Architecture](system_architecture.md) | Complete 19-entity system, all 8 flows with sequence diagrams, data models, trust score formula, tech stack |
| [P2P Deep Dive](p2p_pivot_deepdive.md) | Market analysis, legal feasibility, competitive landscape, failure modes |
| [Realistic Playbook](realistic_playbook.md) | Month-by-month go-to-market, unit economics, realistic projections |
| [Analysis Results](analysis_results.md) | Hypothesis testing, risk breakdown, critical assumptions |

---

## ⚖️ Legal Notes

- **Private vehicles (white-plate):** Cannot be listed — Motor Vehicles Act compliance
- **KYC:** Mandatory via Aadhaar/DigiLocker before first transaction
- **Payments:** Escrow via Razorpay Route — not direct P2P transfer
- **Protection Plan:** Legally a service fee, NOT insurance (not IRDAI-regulated)
- **GST:** Platform liable above ₹20L threshold; vendor invoicing handled separately

---

## 👥 Team

Built by the RentalHub founding team. Starting in Pune, Q3 2026.

---

*© 2026 RentalHub. All rights reserved.*
