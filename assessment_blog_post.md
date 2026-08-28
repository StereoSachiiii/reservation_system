# 🛡️ Secure Web Application Development: Stall Reservation Platform
## Information Security Assessment 2 – Technical Blog & Implementation Guide

---

## 📌 1. Executive Summary & Project Context

As modern commerce transitions into hybrid and digital-first experiences, event venue management requires both high responsiveness and stringent security controls. This project presents a cloud-ready, enterprise-grade **Stall Reservation Platform** engineered with **Spring Boot 3 (Java 21)**, **React 18 (TypeScript)**, **PostgreSQL 16**, and **OAuth2 / OpenID Connect (OIDC)** authentication with Cloud Identity Providers.

This technical report details:
1. **User Authentication & Identity Federation** (OIDC / SAML flow).
2. **Fine-Grained Role-Based Access Control (RBAC)** across Stall Vendors and Exhibition Organizers.
3. **OWASP Top 10 (2021) Vulnerability Mitigations** implemented across the architecture.
4. **End-to-End Stall Reservation Lifecycle** (selection, date constraint validation, parameterized metadata, QR-coded entrance pass).
5. **Challenges, Architectural Trade-offs, and Key Learning Outcomes**.

---

## 🔑 2. Authentication & Access Control Architecture (OIDC Flow)

### 2.1 Identity Provider (IdP) Integration
The platform delegates authentication to an OpenID Connect (OIDC) compliant Identity Provider (Google Cloud IdP / Auth0 / Asgardeo).

```
   [ Stall Vendor / Browser ]
              │
              │  1. Initiate Login (OIDC / PKCE / Google OneTap)
              ▼
   [ Cloud Identity Provider (IdP) ]
              │
              │  2. Authenticate & Return ID Token + Access Token
              ▼
   [ React Frontend Client ]
              │
              │  3. Bearer Token (Authorization: Bearer <token>)
              ▼
   [ Spring Boot Security Gateway (JwtAuthenticationFilter) ]
              │
              │  4. Verify Signature & Audiences
              ▼
   [ Authenticated Security Context (Principal & Roles: VENDOR / ORGANIZER) ]
```

### 2.2 Token Processing & Claims Extraction
1. **Verification**: When an ID token or Bearer JWT reaches `/api/v1/**`, the `JwtAuthenticationFilter` validates token integrity, expiration (`exp`), issuer (`iss`), and audience (`aud`).
2. **Principal Construction**: Extracted user claims (`sub`, `email`, `name`) are hydrated into the Spring Security Context (`UsernamePasswordAuthenticationToken`).
3. **Profile Synchronization**: The user's username, full name, email, and organization details are mapped and accessible via `GET /api/v1/vendor/profile` and `GET /api/v1/auth/me`.

### 2.3 Role-Based Access Control (RBAC) & IDOR Mitigation
The system enforces strict role segregation:
- **`ROLE_VENDOR`**: Can browse available exhibition stalls, configure reservation parameters, submit requests, and inspect **only their own** reservation history and entry passes.
- **`ROLE_ORGANIZER` / `ROLE_ADMIN`**: Granted administrative privileges to manage venue halls, inspect all reservations across all vendors, override allocations, and process refunds.

**IDOR Protection Pattern:**
```java
public Reservation getById(Long id, String username) {
    Reservation reservation = reservationRepository.findByIdWithDetails(id)
            .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

    User requester = userService.getByUsernameForServices(username);
    if (!reservation.getUser().getId().equals(requester.getId()) &&
        requester.getRole() != User.Role.ADMIN &&
        requester.getRole() != User.Role.ORGANIZER) {
        throw new AccessDeniedException("Access denied: You cannot view another vendor's reservation");
    }
    return reservation;
}
```

---

## 🛡️ 3. OWASP Top 10 Vulnerabilities: Analysis & Mitigations

### 1. A01:2021 – Broken Access Control
- **Threat**: Insecure Direct Object References (IDOR) allowing vendors to query or cancel other vendors' bookings.
- **Mitigation**: Verified entity ownership in service layers (`reservation.getUser().getId().equals(requester.getId())`) and Spring method-level security (`@PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")`).

### 2. A02:2021 – Cryptographic Failures
- **Threat**: Weak password hashes or unencrypted sensitive data in transit.
- **Mitigation**: Enforced HTTPS/TLS with modern cipher suites. Passwords for local fallback are hashed with **BCrypt (10 rounds)**. Sensitive API tokens (Stripe, JWT Secret) are strictly injected via runtime environment variables and excluded from source control.

### 3. A03:2021 – Injection (SQLi & XSS)
- **Threat**: Malicious SQL injection via search and booking parameters, or stored XSS in special requirements / vendor names.
- **Mitigation**:
  - **SQL Injection**: 100% parameterized queries via Spring Data JPA and Hibernate ORM. No dynamic SQL concatenations.
  - **XSS**: React JSX automatic output encoding; strict `Content-Security-Policy (CSP)` headers restricting inline scripts and foreign frames.

### 4. A04:2021 – Insecure Design & Concurrency
- **Threat**: Double-booking race conditions during high-demand stall release bursts.
- **Mitigation**: PostgreSQL pessimistic locking (`SELECT FOR UPDATE`) on `EventStall` and `User` records wrapped in transactional blocks, accompanied by maximum stall limit enforcement per publisher.

### 5. A05:2021 – Security Misconfiguration
- **Threat**: Leaked stack traces, verbose server headers, default database credentials.
- **Mitigation**: Custom `@ControllerAdvice` global exception handler returning sanitized `ApiError` payloads. Configurable external `.env` file for all credentials.

### 6. A07:2021 – Identification and Authentication Failures
- **Threat**: Brute-force credential stuffing and session fixation.
- **Mitigation**: **Bucket4j token bucket rate limiting** (`RateLimitingFilter`) applied to authentication endpoints; stateless short-lived JWT sessions.

---

## 📦 4. Application Functionality & User Flows

1. **User Profile Management**:
   - Displays IdP username, full name, email address, contact number, and organization/business name.
2. **Stall Reservation Request Configuration**:
   - **Exhibition / Event Selection**: Predefined list of active book fairs and expos.
   - **Reservation Date**: Calendar selection with client and server-side constraint enforcement ($Date \ge \text{Today}$).
   - **Stall Type & Size**: Standard, Premium, or Corner stall with Small, Medium, or Large footprints.
   - **Business Category**: Food & Beverage, Clothing, Electronics, Handicrafts, Services, Fiction, Academic, etc.
   - **Special Requirements**: Multi-line customized requests (power requirements, setup requests).
3. **Entry Pass Generation**:
   - High-contrast QR pass generated on payment confirmation for frictionless on-site gate check-in.

---

## 💡 5. Challenges Faced & Key Learnings

1. **State Synchronization between IdP Claims & Local DB**: Balancing federated identity with local entity persistence required a robust "just-in-time" account creation and role assignment strategy.
2. **Locking & Concurrency**: Preventing race conditions in high-traffic seat/stall selection without bottlenecking the database required precise pessimistic locking (`PESSIMISTIC_WRITE`) only during the checkout reservation stage.
3. **Comprehensive Defense-in-Depth**: Security is not a single feature but an omnipresent design discipline spanning HTTP response headers, CORS configurations, rate limiters, ORM parametrization, and UI escaping.

---

## 🔗 Repository & Reference Links
- **GitHub Repository**: [Public Git Repo Link](https://github.com/StereoSachiiii/reservation_system)
- **Live Demo**: `https://localhost:8080`
