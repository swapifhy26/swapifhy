# Contributing to Swapifhy

First off, thanks for taking the time to contribute! 🎉
As we build the ultimate peer-to-peer skill exchange, we rely on our talented team and community to keep the platform scalable, secure, and beautiful.

## Development Workflow

1. **Branching Strategy**
   - `main`: Production-ready code.
   - `dev`: Active development integration.
   - Create feature branches from `dev` using the format: `feature/your-feature-name`, `bugfix/issue-description`, or `hotfix/critical-issue`.

2. **Pull Requests**
   - Open a PR against the `dev` branch.
   - Fully describe your changes in the PR body. Link to any relevant linear tickets or GitHub issues.
   - Ensure you have tested both the `frontend-v2` Next.js application and the `backend` Express API locally before requesting a review.
   - At least 1 approving review from a core maintainer is required to merge.

## Architecture Guidelines

### Frontend (Next.js)
- **Component-Driven**: Place all reusable UI pieces in `frontend-v2/src/components/ui`. Place domain-specific pieces in `frontend-v2/src/components/features`.
- **Styling**: We strictly use Tailwind CSS combined with `clsx` and `tailwind-merge`. Avoid writing custom CSS in `globals.css` unless defining core theme variables.
- **Client vs Server**: Default to React Server Components (RSC) unless interactivity (e.g. `useState`, `onClick`, Framer Motion) requires `"use client"`.

### Backend (Node.js/Express)
- **MVC Pattern**: Always separate logic.
  - `routes/`: Define API endpoints and attach controllers.
  - `controllers/`: Handle HTTP req/res formatting.
  - `services/`: Core business logic and Prisma database interactions.
- **Database**: Do **not** modify the database directly. Use Prisma schema migrations: `npx prisma migrate dev --name <description>`.

## Code Style & Formatting
- **Linter**: Ensure no ESLint errors exist before committing (`npm run lint`).
- **Types**: We heavily lean on TypeScript. Avoid `any` types. Provide robust interfaces for payloads and component props.

---
Swapifhy Team 🚀
