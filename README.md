# SWAPIFHY: Delta Protocol (Elite Release)

Swapifhy is a high-fidelity, industrial-grade peer-to-peer skill exchange platform designed for the architects of the next frontier. This repository contains the **Delta Release**, featuring the "Synergy Protocol" (Elite Chat Matrix) and the "Intelligence Center" (Delta Dashboard).

This documentation serves as the single source of truth for the platform architecture, development setup, and deployment strategies following elite industry standards.

---

## 🏗 System Architecture (Enterprise V2)

The MVP has been fully refactored into a standardized Next.js + Node.js full-stack architecture, utilizing an MVC pattern for the backend and a Component-driven paradigm for the frontend.

### 1. Frontend Client (`/frontend-v2`)
- **Core Technology**: Next.js 15 (Pages Router), React 19, TypeScript
- **Styling**: Tailwind CSS v4, Lucide React (Icons)
- **Interactive Experiences**: Framer Motion for high-performance React-native spring animations and Glassmorphic UI interactions.
- **Component Architecture**: 
  - `src/components/ui`: Universal building blocks.
  - `src/lib/`: Unified constants and utility functions.
  - `src/pages`: High-fidelity Page Routing.

### 2. Backend API (`/backend`)
- **Core Runtime**: Node.js (v18+)
- **Architecture**: Strict MVC Pattern (`routes/`, `controllers/`, `services/`, `middlewares/`)
- **Web Framework**: Express.js - handling RESTful API routing securely.
- **Database ORM**: Prisma - for type-safe database interaction.
- **Schema Management**: Relational design built to handle Users, Swaps, Sessions, and Gamification.

---

## 🚀 Quick Start (Local Development)

### V2 Local Boot (Recommended)
You can instantly boot the fully connected V2 ecosystem via the local batch script. This will start the REST API on Port 3001 and the Next.js Frontend on Port 3000.

1. **Setup Environment**
   ```bash
   cd backend && npm install
   cd ../frontend-v2 && npm install
   ```
2. **Start Everything Simply**
   In the root directory, just double-click:
   `start_v2_local.bat`

---

## 🔒 Security & Contribution Workflow
As an industry-grade MVP, Swapifhy strictly implements standard procedures.
- **Want to Contribute?**: Read our `CONTRIBUTING.md` for PR flow, Branching Strategy, and formatting requirements before pushing code.
- **Found a Vulnerability?**: Immediately refer to `SECURITY.md` for our disclosure policy.

---

## 📂 Project Structure

```text
swapifhy/
├── docker-compose.yml      # Orchestrates the Production containers
├── README.md               # Implementation & Architecture documentation
├── CONTRIBUTING.md         # Developer Guidelines
├── SECURITY.md             # Automated Security Standards
├── docs/                   # Extended Technical Ledger (Delta Spec)
│
├── frontend-v2/            # Elite "Deep Glass" Client (Delta Prototype)
│   ├── src/pages/          # Industry-Standard Pages Router
│   ├── src/components/     # Logic & UI Components (Synergy Matrix)
│   ├── src/lib/            # Centralized constants and configs
│   └── public/images/      # Local brand assets (Delta Protocol)
│
└── backend/                # Synchronized API Application (MVC Pattern)
    ├── src/
    │   ├── routes/         # Express unified API routes
    │   ├── controllers/    # Request handling and response parsing
    │   ├── services/       # Core database logic (Prisma)
    │   └── middlewares/    # Custom authorization interceptors 
    ├── main.ts             # TSX entrypoint for the Delta Engine
    └── prisma/             
        └── schema.prisma   # PostgreSQL Database Schema definition
```