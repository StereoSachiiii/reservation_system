# Systems Architecture Document (SAD)
**Project**: Colombo Bookfair Stall Reservation System (SA_PROJECT)
**Target Audience**: Systems Architects, Senior Engineers, Technical Stakeholders

This document provides a low-level architectural blueprint of the application, detailing the data models, security filter chains, state management, and external integration topologies.

---

## 1. System Context & Container Topology

The SA_PROJECT utilizes a decoupled, Monorepo-style Client-Server architecture.

### 1.1 Logical Containers
- **Frontend SPA (React 18 / Vite)**: Acts as a composite UI shell containing three distinct micro-apps (`/admin`, `/vendor`, `/employee`), lazy-loaded via `react-router-dom` to minimize initial bundle size. 
- **Backend API (Spring Boot 3.3.5 / Java 17)**: A stateless, service-oriented RESTful monolith that handles complex transactional boundaries (e.g., booking locking) and spatial computations.
- **Persistence Layer (PostgreSQL 15+)**: Relational datastore holding user identities, event hierarchies, and coordinate layouts.
- **Cache & Rate-Limiting (Redis / In-Memory Bucket4j)**: Provides distributed token whitelisting and IP-based request starvation protection.

### 1.2 External Integrations
- **Stripe API**: Server-to-server PaymentIntent creation and webhook verification.
- **SMTP Gateway (JavaMailSender)**: Dispatches critical Check-in QR codes embedded as inline CID attachments to bypass email client image blockers.

---

## 2. Data Architecture (JPA & Relational Model)

The database schema is heavily normalized to support complex spatial mapping and multi-event capabilities.

### 2.1 Core Entities & Mappings
- **`User` (Identity)**:
  - Multi-role support (`ADMIN`, `VENDOR`, `EMPLOYEE`).
  - Implements an atomic `reservedStallsCount` integer. This acts as a database-level soft-lock to prevent vendors from exceeding the 3-stall limit across concurrent HTTP requests.
  - *Indexes*: `idx_users_username`, `idx_users_email` to optimize auth lookups.
- **`Reservation` (The Transactional Core)**:
  - Links `User` -> `EventStall` via `@ManyToOne(fetch = FetchType.LAZY)`. Lazy fetching is critical here to prevent N+1 select problems when queried in bulk for the Admin Dashboard.
  - Tracks state machine transitions: `PENDING_PAYMENT` -> `PAID` -> `CANCELLED` | `PENDING_REFUND`.
  - Generates an immutable, UUID-backed `qrCode` parameter upon persist.
- **Spatial Hierarchy (`Venue` -> `Building` -> `Hall` -> `StallTemplate` -> `EventStall`)**:
  - Separates the *physical* space (`StallTemplate` geometry) from the *temporal* space (`EventStall` pricing). 
  - Allows multiple `Events` (e.g., "2024 Fair", "2025 Fair") to share the same physical `Hall` geometry without conflating booking states.

### 2.2 Transactional Boundaries
Service methods modifying state (e.g., `ReservationService.createReservations`, `PaymentService.confirmPayment`) are strictly annotated with `@Transactional`. If Stripe verification fails or a concurrent booking conflict is detected, the entire persistence graph rolls back automatically to maintain ACID compliance.

---

## 3. Security & Identity Blueprint

The system employs a stateless authentication model using JSON Web Tokens (JWT) signed with `HS256`.

### 3.1 The Spring Security Filter Chain
Defined in `SecurityConfig.java`, the exact execution order is:
1. **`CorsFilter`**: Pre-flights HTTP `OPTIONS` requests from the Vite dev server.
2. **`RateLimitingFilter`**: Intercepts requests. Uses `Bucket4j` (100 tokens/minute per IP) to immediately reject API abuse (DDoS mitigation) before any DB calls.
3. **`JwtAuthenticationFilter`**:
   - Extracts the JWT from the `Authorization: Bearer <token>` header.
   - *Fallback Mechanism*: Resolves the `?token=` query parameter if the header is missing. This architectural decision permits secure, direct GET downloads for media files (like the QR PNG ticket) where standard headers cannot be attached by the browser.
4. **`UsernamePasswordAuthenticationFilter`** (Spring Default, mostly bypassed due to statelessness).

### 3.2 Role-Based Access Control (RBAC)
Authorization is resolved at the controller method level using `@PreAuthorize("hasRole('ADMIN')")`. Because the JWT payload directly encodes the User's `Role`, the `JwtAuthenticationFilter` synthesizes a `UsernamePasswordAuthenticationToken` containing `SimpleGrantedAuthority` objects, bypassing the need for a Database hydration query on every request.

---

## 4. Frontend Architecture & State Machines

### 4.1 Global vs. Local State
- **Server State (`@tanstack/react-query`)**: Used exclusively for caching standard REST lookups (e.g., `api.getVenues()`). Handles optimistic UI updates and auto-refetching on window focus.
- **Complex UI State (`DesignerContext.tsx`)**: 
  - The Interactive Stall Designer utilizes a deeply nested React Context. 
  - It maintains a localized, mutable snapshot of arrays: `stalls[]`, `zones[]`, and `influences[]`.
  - Mathematical transformations (Dragging, Resizing) map absolute mouse X/Y coordinates to a `0.0 - 100.0%` bounding box.
  - *ADR (Architectural Decision Record)*: By persisting geometry as percentages relative to the container rather than absolute pixels, the backend spatial engine (`StallService.java`) can consume the layout map without knowing the client's screen resolution.

### 4.2 Network Resiliency
The `client.ts` Axios instance implements a global response interceptor.
- **401 Unauthorized**: Immediately purges `localStorage`, invalidates all React Query caches, and dispatches an event to flush the user to the login route, preventing ghost sessions.
- **Semantic Error Mapping**: intercepts custom backend `ApiError` objects (e.g., "RESOURCE_CONFLICT") and bridges them to the UI Toast notification system.

---

## 5. Algorithmic Implementations

### 5.1 The Spatial Scoring Algorithm (Pricing Engine)
Located in `StallService.java`, the system dynamically values a stall based on Euclidean proximity to administrative "Nodes":
1. Maps stall coordinate percentages onto a normalized `1000x800` Cartesian plane.
2. Calculates the Euclidean distance from the stall's center-point to various `Influences` (e.g., `ENTRANCE`, `STAGE`, `NOISE`).
3. Applies a modifier math function (Linear or Exponential falloff) based on the distance radius to calculate a precise `$ Cents` premium or penalty, providing a granular "Value Drivers" breakdown for the Vendor.

### 5.2 QR Ticket Idempotency
1. Backend generates a fast, deterministic QR matrix using `com.google.zxing`.
2. The payload is not the state of the ticket, but purely a UUID pointer (`RES-1234-ABCD`).
3. The Employee Scanner App fires this UUID against the backend, which holds the absolute truth for validation, preventing offline forgery attacks.

---

## 6. Project Development & Repository Forensics

An analysis of the Git commit history (`git log --stat`) reveals the development lifecycle and the distribution of architectural responsibilities. 

### 6.1 Contributor Breakdown & Extreme Bias
The repository exhibits an **extreme bias** in contribution, effectively functioning as a solo-architected monolith with minor peripheral assistance.
- **Sachin Lakshitha (234 Commits, ~97%)**: Acted as the sole Systems Architect and Lead Full-Stack Developer. Authored the entirety of the core infrastructure, including the Spring Boot backend, the React spatial engine, security filter chains, and database migrations.
- **ramesh-2003-kris (5 Commits, ~2%)**: Contributed strictly to QA and testing infrastructure. Authored unit and service tests for controllers (`AuthController`, `ReservationController`).
- **Nihadhiyan (2 Commits, ~1%)**: Supplied a single, focused Pull Request dedicated to refactoring backend exception handling (`GlobalExceptionHandler`).

### 6.2 Commit Anomalies & Structural Observations
1. **The "Giga-Commit" Pattern (38k+ Insertions / 31k- Deletions)**:
   - The massive line counts are primarily attributed to a few hyper-dense "Project Bootstrap" and "Refactor" commits. 
   - **Commit `8174098` ("feat: implement auth system")**: Responsible for **14,080 insertions** (~37% of total), representing the core transition to the modern React/Spring architecture.
   - **Commit `f179eb3` ("chore: Remove build frontend files...")**: A critical "Heavy Audit" event that purged thousands of lines of obsolete build artifacts (PostCSS, Tailwind configs, legacy `.js`/`.html` templates) from the repository, accounting for the bulk of the **31,000+ deletions**.
2. **"Ungodly Amount of Commits" by a Single Author**: The vast majority of the 234 commits by Sachin Lakshitha represent massive, cross-cutting architectural implementations. This indicates a highly centralized knowledge base; the bus factor for this project is currently **1**.
3. **Legacy Cleanup & Technology Shift**: The forensic logs confirm the user's observation of a "plain JS/HTML/CSS" phase that was subsequently audited. The deletion spikes correspond directly to "Chore" commits where these vanilla assets were replaced by the typed TypeScript/TSX architecture or removed as redundant build boilerplate.
4. **Absence of Phased Branching**: The commit history shows direct, heavy pushes to the main lineage. There is little evidence of a standard Gitflow for the core architect, typical of solo-driven "skunkworks" environments.
5. **Peripheral Refactoring**: Commits from secondary authors (ramesh, Nihadhiyan) appear distinctly at the end, suggesting they were brought in for stabilization after the core business logic was cemented.

### 6.3 Architectural Synthesis: "What Happened?"
Based on the convergence of the **Giga-Commit** pattern and the **Extreme Contributor Bias**, two likely technical scenarios emerge:

*   **Scenario A: The "Senior Takeover" / Skill Gap**: The project likely originated as a vanilla JS/HTML prototype (evidenced by the 31k legacy deletions). Once the complexity surpassed the initial team's capacity, a senior architect (Sachin) likely "bootstrapped" the entire enterprise-grade logic in a local environment and performed a massive code-drop (the 14k insertion commit). The subsequent exclusion of other authors from business logic suggests a significant **skill asymmetry**.
*   **Scenario B: Solo-Flow in a Team Wrapper**: The distribution of work indicates a "Technical Lead" who preferred (or was forced) to work in a silo to maintain architectural integrity. By keeping the core spatial and security logic highly centralized, the architect bypassed the friction of code reviews and knowledge transfer, resulting in a technically sophisticated result but an extremely fragile team process (Bus Factor 1).

### 6.4 Senior Architect Diagnosis: "The Lone Wolf Architect"
A forensic diagnosis of **Sachin Lakshitha's** profile based on repository activity:
- **Architectural Dictatorship**: The lead developer shows an "everything-or-nothing" approach. The 14,080-line "auth feat" commit suggests they likely developed the entire ecosystem in isolation (perhaps a private fork or local environment) and performed a "System Drop" rather than iterative building.
- **Code as a Fortress**: By authoring 97%+ of the business logic, the architect has made themselves **un-fireable**. There is zero evidence of knowledge transfer. The secondary contributors were relegated to "Janitorial" tasks (Tests and Exception handling), suggesting the architect has low trust in the team’s ability to handle core spatial/security math.
- **Velocity over Sustainability**: The direct pushes to `main` and massive "Chore" audits (removing 31k lines of legacy clutter) indicate a developer focused on **raw output and technical perfection** over standard team governance. They effectively "cleaned house" by deleting the team's earlier prototypes to enforce their own architectural vision.
- **Conclusion**: This is a highly skilled engineer who operates best in a **Black Box**. The project is technically elite but organizationally high-risk.

### 6.5 The Crucial Mistake: "Architectural Narcissism"
While the code quality is senior-grade, the architect made a **fatal strategic error** in project management: 
**They built a Product, but killed the Team.**

By executing the "Giga-Commit" (14k insertions) and the "Heavy Audit" (31k deletions) in isolation, the architect signaled that the existing team's work was a liability rather than an asset. This **Knowledge Monopoly** creates a brittle ecosystem where the codebase is a "Locked Box" to anyone else. Their crucial mistake was choosing **Technical Perfection over Team Scalability**—a move that makes the project a "Success" in the short term, but a "Legacy Nightmare" for anyone who has to maintain it without them.

### 6.6 Hidden Collaboration: "Co-Authored" Metadata
A deeper forensic scan (`git log --grep="Co-authored-by"`) reveals that the "Lone Wolf" profile is technically incomplete. The lead architect utilized **Git Trailer metadata** to credit team members whose work was merged under the lead's account.

- **Explicit Pairings**: Commits like `970c867` and `edfae69` contain `Co-authored-by` tags for **WijAnushka02**, **ramesh-2003-kris**, and **Nihadhiyan**.
- **The "Account Bottleneck"**: The presence of these tags suggests that while Sachin Lakshitha is the *committer* for ~97% of the history, the project was a **collaborative team effort** where the lead architect acted as the primary "Gatekeeper" or "Merge Point."
- **Revised Diagnosis**: The Sr Architect was not working in a total vacuum. Instead, they likely performed "Mob Programming" or "Extreme Pairing" sessions, or simply handled all final integrations from other developers' local clones, manually adding attribution in the commit footers to maintain a clean single-branch history.

---
*Generated for Technical Systems Audit. DO NOT distribute to non-engineering stakeholders.*
