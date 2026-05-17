# Swapifhy Frontend

Frontend application for **Swapifhy**, a production-ready peer-to-peer skill exchange platform.
This client is designed with a scalable, modular architecture to support real-time interactions, role-based dashboards, and high-performance user experiences.

---

## 🚀 Tech Stack

* Framework: Next.js (App Router)
* Language: TypeScript
* Styling: Tailwind CSS
* State Management: Zustand
* API Layer: Axios (Interceptors + Retry Logic)
* Routing: Next.js App Router
* Deployment: GCP

---

## 📦 Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/swapifhy-frontend.git
cd swapifhy-frontend
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Run Development Server

```bash
npm run dev
```

Application runs at:

```
http://localhost:3000
```

---

## ⚙️ Environment Configuration

Create a `.env.local` file:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

---

## 🧠 Project Structure

```
frontend/
├── app/                # App Router (pages, layouts)
├── components/         # Reusable UI components
├── store/              # Zustand global state
├── lib/                # API layer, configs, utilities
├── hooks/              # Custom hooks
├── styles/             # Global styles
├── public/             # Static assets
```

---

## 🏗️ High-Level Architecture

```
        ┌──────────────────────┐
        │      Next.js UI      │
        │ (Pages + Components) │
        └─────────┬────────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │   Zustand Store      │
        │ (Global State Mgmt)  │
        └─────────┬────────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │     API Layer        │
        │  Axios + Interceptor │
        └─────────┬────────────┘
                  │
                  ▼
        ┌──────────────────────┐
        │   Backend Services   │
        │ (Node.js / Express)  │
        └──────────────────────┘
```

---

## 🔄 Request Lifecycle

```
User Action (UI)
      ↓
Component triggers API call
      ↓
Request sent via Axios (lib/api.ts)
      ↓
Interceptor attaches JWT token
      ↓
Backend processes request
      ↓
Response received
      ↓
Zustand store updates state
      ↓
UI re-renders
```

### Token Refresh Flow

```
401 Error
   ↓
Interceptor triggers refresh token API
   ↓
New access token stored
   ↓
Original request retried
   ↓
If failed → user logged out
```

---

## 🔐 Authentication & Authorization

* JWT-based authentication
* Access + Refresh token handling
* Axios interceptors for token injection and refresh
* Role-based routing (Admin / Teacher / Student)
* Protected routes via guards

---

## 📈 Key Features

* Server-side optimized rendering (Next.js)
* Modular and scalable component architecture
* Centralized API communication layer
* Global state management using Zustand
* Clean separation of concerns
* Production-ready authentication flow

---

## ⚡ Performance Strategy

### Rendering Optimization

* App Router with partial rendering
* Lazy loading via dynamic imports
* Suspense boundaries for async UI

### State Optimization

* Zustand minimizes unnecessary re-renders
* Scoped state slices

### Network Optimization

* API request deduplication
* Retry + fallback handling
* Minimal payload design

### UI Optimization

* Skeleton loaders
* Debounced inputs
* Conditional rendering

---

## 🧩 Design Principles

* Separation of Concerns
* Reusable Components
* Single Source of Truth (State)
* API Abstraction Layer
* Scalable Folder Structure

---

## 🛠 Development Guidelines

* Avoid prop drilling → use Zustand
* Keep components small and composable
* Centralize API logic in `/lib/api.ts`
* Follow consistent naming conventions
* Write predictable and testable logic

---

## 🚀 Build for Production

```bash
npm run build
npm start
```

---

## 🌐 Deployment (Vercel)

### Steps:

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

---

## 📊 Future Enhancements

* WebSocket integration (real-time features)
* Server-side caching (React Query / SWR)
* Micro-frontend architecture
* A/B testing layer
* Advanced analytics tracking

---

## 📚 References

* Next.js Docs: [https://nextjs.org/docs](https://nextjs.org/docs)


---

## 🧩 Contribution

* Follow clean architecture principles
* Use meaningful commit messages
* PR-based workflow only

---

## 📌 Notes

* Requires backend API to be running
* Ensure environment variables are correctly configured
* Designed for scalability and production deployment
