# Swapifhy Architecture & Roadmap (V2 Enterprise)

This document serves as the master blueprint for the Swapifhy skill-exchange platform. It details the precise industry-standard architecture we have established and the roadmap for what we are building next.

---

## 🏗 Current Architecture (The V2 Foundation)

We have pivoted from a simple static site into a highly scalable, decoupled **T3/MERN-hybrid ecosystem**.

### Frontend: Next.js (Pages Router)
- **Framework**: Next.js 16 (React 19)
- **Strictly Typed**: TypeScript
- **Entrypoints**: We strictly use the industry standard `src/pages/_app.tsx` and `src/pages/_document.tsx` to handle global state, server-side HTML injection, and layout wrappers.
- **Styling**: Tailwind CSS V4 combined with Lucide React for pixel-perfect SVGs and Framer Motion for React-native spring animations.
- **Data Management**: Static content (like Team Members and Features) is cleanly extracted from the UI into `src/lib/constants.ts` to keep components lean.

### Backend: Node.js MVC (TypeScript)
- **Framework**: Express.js
- **Strictly Typed**: TypeScript configured via `src/main.ts` running natively on `tsx`.
- **Pattern**: Strict MVC (Model-View-Controller) separation:
  - `src/app.ts`: Holds express configuration, CORS, and hooks up routes.
  - `src/main.ts`: The execution environment that boots the port and prepares DB connections.
  - `src/routes/`: Defines API endpoints (e.g., `/api/auth`, `/api/users`).
  - `src/controllers/`: Houses the actual business logic for endpoints.
- **Database ORM**: Prisma (configured for PostgreSQL).

### Infrastructure
- **Containerization**: Both services have a `Dockerfile` and are orchestrated together via `docker-compose.yml` for perfect development/production parity.
- **Environment**: Configuration is securely isolated in `.env` and `.env.local` files.

---

## 🚀 What We Are Building Next (The Roadmap)

Now that the structural foundation is pristine, we will systematically build out the core features of the MVP:

### Phase 1: Waitlist & Authentication (Current Priority)
1. **Waitlist API**: Connect the beautiful frontend UI waitlist form to the backend `/api/auth/register` to actually ingest emails into the PostgreSQL database using Prisma.
2. **JWT Auth**: Implement actual secure sign-ups, log-ins, and session tokens for beta testers.
3. **Magic Links**: (Optional) Allow users to sign in via email links for a frictionless experience.

### Phase 2: Profiles & The Knowledge Graph
1. **User Dashboards**: Build standard React components within Next.js for users to customize their profile (Avatar, Bio, "Skills I have", "Skills I want").
2. **Prisma Schema Expansion**: Architect the database to properly map Many-to-Many relationships between Users and Skills.
3. **Tagging System**: Create an intuitive UI multi-select component for users to pick skills from a standardized library.

### Phase 3: The Matchmaking Engine
1. **Compatibility Algorithm**: Write backend logic in a heavily-tested `services/` layer that queries the PostgreSQL database for overlapping skill preferences.
2. **The "Explore" Feed**: Swap the static features grid on the frontend for a dynamic, infinite-scrolling feed of potential matches powered by Next.js Server-Side Rendering (SSR).

### Phase 4: Real-time Connection
1. **WebSockets (Socket.io)**: Integrate real-time bi-directional sockets into `src/server.ts` alongside Express.
2. **In-App Messaging**: Build a chat interface so users can negotiate their skill swaps securely without leaving the platform.
3. **Video / Session Hand-off**: Provide users with Google Meet or Zoom integration hooks to actually execute their learning sessions.

---

## 🛡 Operating Principles
- **No Clutter**: Do not pollute the root directory. All Markdown planning goes into `/docs`. All React code stays in `src/`.
- **Type Safety**: Avoid `any` types wherever possible. Share interfaces between the backend and frontend if applicable.
- **Always Commit Working Code**: Ensure `npm run build` locally passes before tearing down infrastructure.
