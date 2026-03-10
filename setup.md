# 🚀 Comprehensive Setup & Infrastructure

This guide provides a roadmap from local development to production-grade AWS deployment.

---

## 1. Local Development Stack

### Core Requirements
- **Java 21** / **Maven 3.9+**
- **Node.js 18+** / **NPM**
- **PostgreSQL 16** / **Redis 7**

### Quick Start (Docker)
```bash
# Deploys Backend, Frontend, Postgres, and Redis
docker-compose up --build
```

---

## 2. Infrastructure & Cloud (AWS)

The platform is architected for **AWS EC2 t3.micro** deployment.

### CI/CD Workflow (GitHub Actions)
The repository contains a fully automated pipeline in `.github/workflows/deploy.yml`:
- **Build**: Compiles Java code and builds React assets.
- **Containerize**: Bundles services into Docker images.
- **Register**: Pushes images to **AWS ECR (Elastic Container Registry)**.
- **Deploy**: Automates an SSH command to pull and re-deploy via Docker Compose on the target EC2 instance.

### Domain Setup
The system is configured for DuckDNS/Route53. Nginx acts as the reverse proxy, forwarding `/api` to the Spring Boot server and serving static files for the SPA.

---

## 3. Configuration Breakdown

### Environment Variables (`.env`)
| Key | Usage | Importance |
| :--- | :--- | :--- |
| `DB_URL` | Connection string for Postgres | Critical |
| `JWT_SECRET` | 256-bit key for token signatures | Critical |
| `MAIL_PASSWORD` | App password for Gmail SMTP | High (for Tickets) |
| `STRIPE_WEBHOOK_SECRET` | Signing secret from Stripe CLI | High (for Checkout) |

---

## 4. Developer Guide

### Frontend Patterns
- **Linting**: `npm run lint` (uses ESLint + TypeScript configs).
- **Styling**: `tailwind.config.ts` defines the central brand palette and glassmorphism utilities.
- **API Wrapper**: Central axios client in `src/shared/api/client.ts` handles interceptors for JWT injection.

### Backend Patterns
- **Seeding**: `data.sql` is deferred via `spring.jpa.defer-datasource-initialization=true` to ensure schema is ready before data insertion.
- **Rate Limiting**: Configured in `application.properties` via `app.ratelimit.capacity`.
- **Profiles**: Supports `dev` and `prod` profiles for environment-specific configs.

---

## 5. Troubleshooting guide

| Issue | Potential Solution |
| :--- | :--- |
| **WebSocket Connection Failed** | Ensure `/ws` is not blocked by a proxy or firewall and SockJS fallback is enabled. |
| **CORS Errors** | Check `SecurityConfig.java` for the allowed list of origins (port 5173 for Dev). |
| **Payment Not Updating** | Verify the Stripe Webhook secret is correctly set in `.env`. |
| **Database Locks** | If you see timeouts, check for uncommitted `@Transactional` methods holding row locks. |
