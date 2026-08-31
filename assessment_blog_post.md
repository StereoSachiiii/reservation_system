# Securing Bookfair: Fixing OWASP Top 10 Issues and Adding Google Sign-In

Bookfair Stall Reservation is a web platform where exhibition vendors can reserve stalls at events, and organizers can manage venues and floor layouts. Like most projects, it started with a focus on features and real-time interactive floor maps first, and security second. Before making it production-ready, we conducted a comprehensive security pass. We identified vulnerabilities, mitigated them using the OWASP Top 10 as our guide, and integrated Google OAuth/OIDC authentication. Here is a simple walkthrough of what we did.


## Why Security Mattered Here

The application handles user accounts, financial stall bookings, QR entry passes, and real-time floor allocations. During popular exhibitions, hundreds of vendors compete for the same prime stall locations simultaneously. If access control breaks, a vendor could view or cancel a competitor's booking. If race conditions are unhandled, stalls could be double-booked. We used the OWASP Top 10 as our checklist and audited the entire codebase step by step.


## Broken Access Control

This was the most critical category we addressed:

* **Insecure Direct Object References (IDOR):** The reservation lookup endpoint previously fetched records directly by ID. This meant an authenticated vendor could change the ID parameter in the URL and inspect another vendor's reservation. We resolved this in the service layer by checking the requester's authenticated username against the reservation owner before returning any data.
* **Role-Based Privilege Enforcement:** We separated permissions into two distinct roles: Stall Vendors (`ROLE_VENDOR`) and Exhibition Organizers (`ROLE_ADMIN` / `ROLE_ORGANIZER`). Vendors can only reserve stalls and view their own bookings, while organizers have exclusive access to administrative management routes. This is enforced at both the URL routing level and with `@PreAuthorize` method annotations.
* **Identity Binding:** When submitting a reservation, the username is extracted directly from the verified security context on the backend, rather than trusting a user-supplied field in the request payload. This prevents any vendor from creating reservations under someone else's name.


## Cryptographic Failures

We tightened data protection and credential handling across the stack:

* **HTTPS Enforcement:** Nginx terminates SSL using modern TLS configurations and redirects all plaintext HTTP traffic to HTTPS.
* **Password Hashing:** Local user passwords are encrypted using BCrypt with 10 salt rounds, making offline cracking attacks computationally impractical.
* **Secret Management:** Hardcoded secrets were removed. JWT signing keys, database credentials, Google OAuth client IDs, and Stripe API keys are loaded strictly from external environment variables.
* **Scoped Token Fallback:** The JWT filter previously accepted tokens from URL query parameters globally. Because query parameters can leak into access logs and browser history, we restricted query-parameter token parsing exclusively to the QR code download link where HTTP headers cannot be attached via plain browser navigation.


## Injection and Input Validation

* **SQL Injection:** All database operations use Spring Data JPA and Hibernate with parameterized JPQL queries. No dynamic string concatenation is used in SQL or JPQL statements, neutralizing SQL injection.
* **Cross-Site Scripting (XSS):** React automatically escapes all interpolated values in JSX. In addition, we added a strict Content Security Policy (CSP) header ensuring scripts and frames can only load from trusted sources like Google and Stripe.
* **Boundary Validation:** We added Jakarta Bean Validation constraints (`@NotBlank`, `@NotNull`, `@Min(1)`, `@Max(10)`, `@FutureOrPresent`) to the reservation request DTO. Requests with invalid dates, missing categories, or out-of-range quantities are rejected at the controller boundary before reaching business logic.


## Insecure Design and Concurrency

When multiple vendors attempt to reserve the exact same stall at the same millisecond, concurrent transactions could read the stall as available and create a double-booking. 

We solved this at the database level using **Pessimistic Row Locking (`SELECT FOR UPDATE`)**. When a booking begins, the backend acquires an exclusive lock on the specific stall row. Concurrent transactions wait until the first commit completes, discover that the stall is already reserved, and receive a clean 409 Conflict response.


## Security Misconfiguration

* **Global Error Sanitization:** We implemented a global `@RestControllerAdvice` exception handler. Internal stack traces, database schema details, and unhandled exception traces are logged internally, while the client receives a standardized JSON error message.
* **CORS Allowlisting:** CORS is configured with an explicit whitelist of trusted frontend domains, completely avoiding wildcard `*` origins.
* **Actuator Protection:** Spring Boot Actuator management endpoints were locked down, exposing only the public `/health` probe for uptime checks.


## Vulnerable and Outdated Components

We aligned dependencies with Spring Boot 3.3.5, which manages patched, compatible transitive dependencies for Tomcat, Jackson, and Hibernate. Standalone libraries like JJWT, Bucket4j, and the Google API Client were audited against the National Vulnerability Database (NVD) to ensure zero active CVEs.


## Identification and Authentication Failures

* **Rate Limiting:** We integrated Bucket4j token bucket rate limiting to prevent brute-force attacks and credential stuffing on authentication endpoints, allowing up to 100 requests per minute per IP address before returning `429 Too Many Requests`.
* **Password Reset Safety:** Password reset tokens are generated using cryptographically secure UUIDs, expire in 15 minutes, and are deleted immediately upon consumption.


## Software and Data Integrity Failures

* **JWT Verification:** Every incoming request token is verified using HMAC-SHA256 signature checks. Tampered payloads fail signature validation immediately and return a 401 Unauthorized response.
* **Safe Deserialization:** The API exclusively uses JSON via Jackson for data exchange, avoiding vulnerable Java native object deserialization entirely.


## Security Logging and Monitoring Failures

We added structured SLF4J logging for failed authentication attempts, expired tokens, rate-limit violations, and unexpected exceptions. Core database entities include JPA lifecycle audit timestamps (`createdAt`, `updatedAt`) to maintain an accurate timeline of data modifications.


## Server-Side Request Forgery (SSRF)

The application does not expose any endpoint that accepts a user-provided URL to fetch server-side. All outbound integrations (Google OIDC token verification, Stripe payments, email notifications) use hardcoded, configuration-driven endpoints through official SDKs.


## Adding Google Sign-In with OAuth and OIDC

Alongside the security fixes, we added "Sign in with Google" built on OpenID Connect (OIDC). Here is how it works:

1. **Initiating Login:** When a vendor clicks "Sign in with Google", the React frontend triggers the Google Identity Services flow and receives a cryptographically signed OIDC ID Token.
2. **Backend Verification:** The frontend sends the ID token to `POST /api/v1/auth/google-login`. The backend uses Google's `GoogleIdTokenVerifier` to verify the signature against Google's public keys, ensure the token has not expired, and confirm that the audience (`aud`) matches our specific Client ID.
3. **Just-In-Time Account Creation:** If the user is logging in for the first time, an account is automatically provisioned with verified profile information (name, email) and assigned the default `ROLE_VENDOR` role.
4. **Issuing Application Tokens:** Once identity is confirmed, the backend issues its own stateless JWT containing the user's role and username. Subsequent requests use this token in the `Authorization: Bearer` header.
5. **Enforcing Access Control:** Every API request validates the JWT, identifies the caller, displays their authenticated profile information, and ensures vendors can only access and manage their own stall reservations.


## Reservation Form Parameters

To meet all business and assessment requirements, the stall booking request captures eight validated fields:

1. **Authenticated Username:** Derived from the verified token on the backend.
2. **Exhibition/Event Name:** Selected from a predefined list of active fairs (`@NotBlank`).
3. **Reservation Date:** Calendar selection enforced on or after today (`@FutureOrPresent`).
4. **Stall Type:** Standard, Premium, or Corner Stall (`@NotNull`).
5. **Preferred Stall Size:** Small, Medium, or Large (`@NotNull`).
6. **Number of Stalls:** Integer between 1 and 10 (`@Min(1)`, `@Max(10)`).
7. **Business Category:** Classification such as Food and Beverage, Clothing, Electronics, Handicrafts, Services, Fiction, or Academic (`@NotNull`).
8. **Special Requirements:** Free-text comments for logistical requirements.


## Conclusion

Securing the platform was about making intentional architectural choices: using OIDC to offload password risks, enforcing row-level database locks to prevent race conditions, and applying defense-in-depth across the OWASP Top 10 categories. The result is a robust, reliable, and secure platform for both exhibition organizers and vendors.

Github link: [https://github.com/StereoSachiiii/reservation_system](https://github.com/StereoSachiiii/reservation_system)
