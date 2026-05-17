# Security Policy

## Supported Versions

Currently, Swapifhy is in active MVP development. Only the latest `main` branch deployments are supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| v1 (Static) | ❌ Untracked |
| v2 MVP (Next.js)  | ✅ Active Development |

## Reporting a Vulnerability

Security is a top priority for Swapifhy. If you discover a vulnerability, **do not open a public issue.**
Instead, please email the founding team directly:
- **Email**: swapifhy@gmail.com
- **Subject**: [SECURITY VULNERABILITY] Swapifhy MVP

Please include:
- The type of vulnerability (e.g., XSS, SQLi, IDOR, CORS misconfiguration).
- Step-by-step instructions to reproduce the vulnerability.
- Proof-of-concept (PoC) scripts or screenshots if available.

We will acknowledge receipt of your vulnerability report within 48 hours and strive to send you regular updates about our progress.

## Secure Development Guidelines for the Team
- **Never commit `.env` files**: Ensure all environment variables, JWT Secrets, and Database URLs are properly ignored in `.gitignore`.
- **Sanitize Inputs**: Always use Prisma parameterized queries (default) and validate API payloads with Zod (or equivalent) in the Express controllers.
- **Rate Limiting**: Ensure high-traffic endpoints (like `/api/auth/register` or `/api/waitlist`) are rate-limited via `express-rate-limit`.
- **CORS**: Ensure Express strictly defines allowed origins corresponding only to the authentic Next.js frontend URLs.
