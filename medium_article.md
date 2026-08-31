# How I Built a Secure Stall Reservation Platform and What the OWASP Top 10 Actually Taught Me

*Real talk on OIDC, broken access control, race conditions, and the security mistakes I almost shipped.*

I will be honest with you. When I first started this project, "security" to me meant slapping a login page on it and calling it done. Add a password field, hash it somehow, done. Ship it.

Spoiler: that is not security. That is theater.

This is the story of how I took an existing stall reservation system built for a book fair, tore it apart from a security perspective, rebuilt it the right way, and genuinely came out the other side with a much deeper understanding of what it actually means to build something you would trust with real user data. Not "secure enough for a class project." Actually secure, defensible, and honest about its trade-offs.

I am going to walk through the whole thing: the architecture, the OIDC authentication flow, every OWASP Top 10 category and exactly what I did (or did not do) about each one, the challenges that genuinely tripped me up, and what I would do differently next time.


## A Bit of Context: What Is This Thing?

The platform is a web application that lets **Stall Vendors** reserve exhibition spaces at events like book fairs and trade shows. Think of it like booking a table at a restaurant, except the table is a 4x6 meter stall in a convention hall, and there are 200 other vendors eyeing the same premium spots at the same time, with live pricing and a floor map they can interact with.

On the other side, **Exhibition Organizers** manage those stalls. They set up venues, design hall layouts on an interactive canvas, define pricing multipliers based on stall position and proximity to entrances, and can see and manage every reservation that comes in.

The tech stack I worked with:

* **Backend:** Java 21 + Spring Boot 3.3.5 + Spring Security 6. I chose Spring Boot because its security ecosystem is genuinely excellent for building role-based API servers, and Spring Security 6's lambda DSL is much cleaner than older versions.
* **Frontend:** React 18 + TypeScript 5 + TanStack Query + TailwindCSS. TanStack Query handles all API calls and caching, which makes it easy to invalidate the right data when a reservation is created or cancelled.
* **Database:** PostgreSQL 16 for persistent storage with Redis 7 sitting alongside it for caching and rate limit counters.
* **Authentication:** OpenID Connect (OIDC) via Google as the Identity Provider, with application-level JWTs issued after the OIDC handshake.
* **Infrastructure:** Docker Compose orchestrating everything locally, Nginx handling SSL termination and reverse proxying, with a production deployment on AWS EC2 behind a DuckDNS domain.


## Getting Authentication Right: Why I Chose OIDC

There is a certain developer hubris that makes you think "I will just write my own authentication system." I had that hubris at the start. I wanted full control. I figured: how hard can it be? You hash the password, compare it on login, issue a token. Simple.

Then I started actually thinking about what "rolling your own auth" really means. You are responsible for:

1. **Securely storing passwords:** Are you using bcrypt with an appropriate cost factor? Are you salting per-user? Do you know what a timing attack on password comparison looks like and whether your code is vulnerable?
2. **Session token generation:** Are you using a cryptographically secure random source? Are tokens long enough to resist brute force? How do you revoke them?
3. **Password reset flows:** How do you verify that the person requesting a reset is actually the account owner, without leaking information about whether an account exists?
4. **Brute force and credential stuffing protection:** What is your strategy when someone runs a dictionary attack against your login endpoint?

Or you delegate all of that to a battle-tested Identity Provider that has solved these problems at global scale, and you focus on your actual product.

I went with **Google Identity (OIDC)** as the IdP. Here is how the complete flow works:

1. The user clicks "Sign in with Google" on the React frontend. This triggers Google's OAuth2 consent flow. Once the user authenticates with Google, Google issues a signed **ID Token**, which is a JWT containing the user's verified identity information: email, name, and a unique subject identifier called `sub`.
2. The frontend does not decode this token or trust its contents. It sends the raw token to our backend at `POST /api/v1/auth/google-login`.
3. The Spring Boot backend receives the token and hands it to `GoogleTokenVerifier`, which uses the official Google API Client library to verify it against Google's public keys. This is the critical step that most tutorial code gets wrong.

```java
GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(
        new NetHttpTransport(), new GsonFactory())
    .setAudience(Collections.singletonList(clientId))
    .build();

GoogleIdToken idToken = verifier.verify(idTokenString);
```

That `.setAudience()` call is doing real work. Without it, you are verifying that the token is a valid Google-issued JWT, but not that it was issued for your application. An attacker could take a valid Google token issued for a completely different application and use it against yours. The audience check ensures the token's `aud` claim matches your Google Client ID specifically.

The verifier also checks the token's signature against Google's public JWKS endpoint, and validates the `exp` claim to ensure the token has not expired. If any of these checks fail, `verify()` returns null and we throw a 400 Bad Request.

If the token is valid, we extract the claims: `email`, `name`, and `sub`. We look up the user by email. If they do not exist, we create an account for them automatically. This is called Just-In-Time (JIT) provisioning. New Google users get the `ROLE_VENDOR` role by default.

Finally, we issue our own application-level JWT signed with HMAC-SHA256, which the frontend stores and sends on every subsequent request. This keeps our internal session management completely decoupled from Google's token lifecycle.

```java
String jwt = jwtUtils.generateJwtTokenFromUsername(user.getUsername());
return new AuthResponse(jwt, userService.mapToUserResponse(user));
```

The separation matters. Google's ID token is only ever used once, to prove identity at login. Everything after that is our own signed JWT, with our own expiry, our own claims, and our own role information.


## Two Roles, Two Surfaces, Zero Overlap

The application has exactly two roles that matter from a security perspective.

* **`ROLE_VENDOR`** can reserve stalls, view their own bookings, download their QR entry passes, and manage their profile. They cannot see anyone else's bookings. They cannot access admin endpoints. If they try, they get a 403. Not a 404, not a redirect, a clear 403 Forbidden.
* **`ROLE_ORGANIZER`** (and `ROLE_ADMIN`) can see every booking across every vendor, manage venues and hall layouts, confirm or cancel reservations, approve refunds, and export data. Organizers cannot be created through the public registration flow. They are provisioned directly in the database.

I enforce this at two independent layers because a single enforcement point is a single point of failure.

The first layer is URL-pattern based, configured in `SecurityConfig`:

```java
.requestMatchers("/api/v1/admin/**").hasAnyRole("ADMIN", "ORGANIZER")
.requestMatchers("/api/v1/vendor/**").authenticated()
```

The second layer is method-level, using Spring Security's `@PreAuthorize`:

```java
@PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
public List<Reservation> getAllReservations() { ... }
```

Why both? Because URL pattern matching can have subtle edge cases, like trailing slashes, encoded characters, and path traversal sequences, that a method-level annotation is immune to. If someone finds a way to bypass the URL filter, they still hit the method guard. Defense in depth applies to authorization just as much as to injection prevention.

The access token (JWT) is what drives both layers. When the `JwtAuthenticationFilter` processes an incoming request, it extracts the username from the token, loads the user's details including their role from the database, and populates the Spring Security context. Every authorization decision downstream reads from that context. The token is the source of truth.


## Logout: More Nuanced Than You Would Expect

JWT-based stateless authentication changes how logout works in ways that are not immediately obvious.

In a traditional session-based system, logout is simple: delete the server-side session record, the session ID is now invalid. Done.

With stateless JWTs, there is no server-side session to delete. The token is self-contained. So when a user logs out, we do three things on the client: we remove the JWT from localStorage, we clear the entire TanStack Query cache so no cached API responses linger in memory, and we redirect to the login page.

```typescript
const logout = () => {
    localStorage.removeItem('token');
    queryClient.clear();
    navigate('/login');
};
```

The honest limitation: if someone had already stolen that JWT, say via XSS or a compromised device, they can keep using it until it expires, which in our case is 24 hours. The client-side removal does not invalidate the token on any other device.

For this application, a stall reservation system, 24-hour exposure is an acceptable risk. The data is not critical enough to warrant the engineering overhead of a blacklist. But I have documented this explicitly in the codebase because the next developer to touch this code needs to understand the trade-off, not just inherit it silently.

If I were building this for a healthcare application or anything handling financial data, the solution would be a Redis-backed token blacklist. Each token carries a unique `jti` (JWT ID) claim. On logout, we add that `jti` to a Redis set with a TTL matching the token's expiry. The JWT filter checks the blacklist on every request. It adds one Redis round-trip per request, fast, scalable, and it makes revocation immediate.

For the Google OIDC side: Google's ID token is only used once at login. We do not maintain a session with Google. Signing out of Google's identity provider would only matter for the next login attempt. If the user is still logged into Google and tries to sign in again, they will not be prompted for credentials. For a booking platform, that is completely fine.


## Walking Through Every OWASP Top 10 Category

When I first thought about security for this project, I focused on the obvious ones: SQL injection, XSS, weak passwords. The OWASP Top 10 forced me to think more systematically, and I found real gaps I would have missed otherwise.


### A01: Broken Access Control

This is the number one web application vulnerability according to OWASP, and it is number one for a good reason. It is deceptively easy to get wrong.

The specific attack I was most worried about is called IDOR, which stands for Insecure Direct Object Reference. Consider this endpoint:

`GET /api/v1/vendor/reservations/42`

A logged-in vendor is perfectly authenticated. Their JWT is valid. But what if they change `42` to `43`? Or `1`? Without explicit owner checking, they would see another vendor's reservation. This happens constantly in real applications.

The fix is straightforward but easy to forget: every service method that fetches a record checks whether the authenticated user is the owner of that record.

```java
public Reservation getById(Long id, String username) {
    Reservation reservation = reservationRepository.findByIdWithDetails(id)
        .orElseThrow(() -> new ResourceNotFoundException("Reservation not found"));

    User requester = userService.getByUsernameForServices(username);

    if (!reservation.getUser().getId().equals(requester.getId())
            && requester.getRole() != User.Role.ADMIN
            && requester.getRole() != User.Role.ORGANIZER) {
        throw new AccessDeniedException(
            "Access denied: You cannot access reservations owned by other vendors."
        );
    }
    return reservation;
}
```

The username comes from `Principal.getName()`, which is populated by the JWT filter from the verified token. It cannot be spoofed by the client. A vendor cannot escalate to organizer by modifying their token either, because the token is signed with a secret only the server knows.


### A02: Cryptographic Failures

The OWASP framing for this category shifted from "Sensitive Data Exposure" to "Cryptographic Failures" in 2021, which I think is more honest about what is actually going wrong. The failure is usually in how data is protected, not just whether it is exposed.

For this application: all traffic goes over HTTPS. Nginx handles SSL termination, with self-signed certificates in development and Let's Encrypt in production. There is a `generate-ssl.sh` script in the repo so you do not have to figure out OpenSSL flags.

Passwords in the database are hashed with BCrypt at 10 rounds. BCrypt is adaptive, so you can increase the cost factor as hardware gets faster. Each hash is unique per-user because BCrypt generates and embeds its own salt. Even if the database is compromised, an attacker cannot reverse the hashes to plaintext without running billions of guesses through BCrypt's slow function.

JWTs are signed with HMAC-SHA256 using a 256-bit key loaded from an environment variable. The key is never hardcoded, never in the repository, and never in Docker image layers. The `.gitignore` explicitly excludes `.env`. The repo has `.env.example` with placeholder values and documentation about what each variable does.

One subtle thing I fixed partway through: the JWT filter originally accepted tokens from query parameters on any endpoint, not just the download endpoint where it was needed. A token appearing in a URL query parameter shows up in server access logs, browser history, the HTTP Referer header sent to third-party scripts, and proxies that log URLs. I scoped the fallback to exclusively the `/qr/download` path and wrote a comment in the code explaining exactly why it is there and why it is acceptable specifically for that endpoint.


### A03: Injection

SQL injection is essentially a non-problem when you use JPA and Hibernate the way they are designed to be used. Every database query goes through JPQL with named parameter binding. There is no string concatenation anywhere near SQL. Even if a user sends `'; DROP TABLE reservations;--` as their business name, it is treated as a string value, bound as a parameter, not executed as SQL.

```java
@Query("SELECT r FROM Reservation r WHERE r.user.username = :username")
List<Reservation> findByUserUsername(@Param("username") String username);
```

XSS (Cross-Site Scripting) is similarly tamed by React's JSX rendering model, which HTML-escapes all interpolated values by default. A stored string containing `<script>alert(1)</script>` gets rendered as literal text, not executed.

I added a Content Security Policy header on top of that for belt-and-suspenders protection:

```text
default-src 'self';
script-src 'self' https://accounts.google.com https://js.stripe.com;
style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src 'self' https://fonts.gstatic.com;
frame-src https://accounts.google.com https://js.stripe.com;
connect-src 'self' ws: wss:;
```

This means even if XSS somehow got past React's escaping, the browser would refuse to load scripts from attacker-controlled domains, block inline script execution except where explicitly allowed, and refuse to make network requests to arbitrary hosts.

I also added Bean Validation annotations to the reservation request DTO, including `@NotBlank`, `@NotNull`, `@Min(1)`, `@Max(10)`, and `@FutureOrPresent`. These annotations activate automatically on `@Valid`-annotated controller parameters and reject malformed input at the API boundary before any business logic runs. A request with a null stallType or a reservation date in the past gets a 400 Bad Request with a structured error message, not a server crash.


### A04: Insecure Design

This category is about design flaws that create inherent vulnerabilities, the kind of problems that cannot be patched away because they are baked into how the system works.

The design problem I had to solve: what happens when two vendors try to book the same stall at exactly the same millisecond?

Without protection, both transactions run concurrently. Both read the stall as "available." Both write their reservation. One stall, two confirmed bookings. Database integrity violated, one vendor gets a confirmation email for a stall they will not actually get, and you have a customer service nightmare on your hands.

The solution is pessimistic locking at the database level. When the reservation service starts processing a booking, it acquires an exclusive lock on the stall row before reading its status:

```java
@Lock(LockModeType.PESSIMISTIC_WRITE)
@Query("SELECT s FROM EventStall s WHERE s.id = :id")
Optional<EventStall> findByIdWithLock(@Param("id") Long id);
```

`PESSIMISTIC_WRITE` translates to `SELECT ... FOR UPDATE` in PostgreSQL. While Transaction A holds this lock, Transaction B trying to lock the same row will block and wait. When Transaction A commits and marks the stall as reserved, Transaction B acquires the lock, reads the updated state, sees "reserved," and throws a 409 Conflict back to the second vendor.

The UX consequence: the second vendor sees "This stall was just reserved by another vendor." They need to pick a different one. Is that annoying? Slightly. Is it better than double-booking? Absolutely.


### A05: Security Misconfiguration

This one is about all the things you did not explicitly configure that ended up being a problem: default credentials, error pages that leak stack traces, debug endpoints left open in production, CORS configured with a wildcard.

* **Global exception handling:** I have a `@RestControllerAdvice` that catches every exception the application throws. Internal exceptions, including database errors, NullPointerExceptions, and validation failures, get mapped to clean JSON responses with a user-facing message and an HTTP status code. The actual stack trace, the SQL query that failed, the class name and line number: none of that reaches the client. An attacker probing your error handling for information about your internals learns nothing useful.
* **Externalized configuration:** Every parameter that could vary between environments, including database URL, credentials, JWT secret, Google Client ID, Stripe keys, and frontend URL for CORS, is loaded from environment variables via `application.properties`. Nothing is hardcoded. This is not just convenient for deployment; it is a security requirement, because hardcoded secrets end up in version control history even after you "fix" them.
* **CORS allowlisting:** CORS is configured with an explicit allowlist. The allowed origins are specific to known frontend URLs. The wildcard `*` that lets any origin make cross-origin requests with credentials is never used.
* **Spring Boot Actuator security:** Actuator, which exposes operational information about the application, is configured to expose only the `/health` endpoint publicly. The other endpoints like `/actuator/env`, `/actuator/beans`, and `/actuator/heapdump` are restricted to authenticated internal traffic.


### A06: Vulnerable and Outdated Components

This one surprised me most when I actually sat down and thought about it carefully. I was running modern code, I thought I was fine.

The thing that saves Java/Spring projects here is the parent BOM (Bill of Materials). When you declare `spring-boot-starter-parent` as your Maven parent:

```xml
<parent>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-parent</artifactId>
    <version>3.3.5</version>
</parent>
```

Spring's team has already curated all the transitive dependency versions, including Jackson, Hibernate, Tomcat, Netty, SLF4J, and hundreds of others, into a version set that has been tested together and patched for known CVEs. You get security updates for the whole ecosystem by bumping one version number.

For dependencies outside the BOM, including JJWT 0.11.5, Bucket4j 8.10.1, and Google API Client 2.2.0, I checked the changelogs and the NVD (National Vulnerability Database) for known CVEs. None found at development time.

The process I put in place going forward is running `mvn dependency:check` before any release. The OWASP Maven plugin queries the NVD and flags any dependency with a known CVE above a configurable severity threshold. I treat those findings as bugs, not suggestions.


### A07: Identification and Authentication Failures

Credential stuffing is a real attack. Attackers take username/password lists leaked from other breaches, and there are billions of records available, and try them against any login endpoint they can find. Most users reuse passwords across sites.

The mitigation is rate limiting. I used Bucket4j's in-memory token bucket implementation. Each IP address gets a bucket that holds 100 tokens and refills at 100 tokens per minute. Every request consumes one token. When the bucket is empty, the request gets a 429 Too Many Requests response.

```java
Bucket bucket = buckets.computeIfAbsent(clientIp, k ->
    Bucket.builder()
        .addLimit(Bandwidth.classic(100, Refill.greedy(100, Duration.ofMinutes(1))))
        .build()
);

if (!bucket.tryConsume(1)) {
    response.setStatus(429);
    response.setHeader("Retry-After", "60");
    response.getWriter().write("{\"error\": \"Rate limit exceeded. Try again in 60 seconds.\"}");
    return;
}
```

100 requests per minute is generous for legitimate use. An automated credential stuffing tool trying thousands of guesses per minute is stopped cold.

For Google OIDC users, the entire password attack surface does not exist. There is no password to stuff. The only attack vector is compromising the user's Google account, which is Google's problem to defend with their own two-factor authentication and anomaly detection.

Password reset tokens are generated with `UUID.randomUUID()` (cryptographically secure), expire after 15 minutes, and are deleted after first use. If you request two resets, the first token is invalidated when the second is created.


### A08: Software and Data Integrity Failures

This category covers a broader surface than you would think. The OWASP description includes insecure CI/CD pipelines, unsigned updates, and unsafe deserialization. For this application, the two relevant areas are JWT integrity and deserialization safety.

Every incoming JWT is verified by `JwtUtils.validateJwtToken()` using the HMAC-SHA256 signing key:

```java
public boolean validateJwtToken(String authToken) {
    try {
        Jwts.parserBuilder()
            .setSigningKey(key())
            .build()
            .parseClaimsJws(authToken);
        return true;
    } catch (MalformedJwtException e) {
        log.error("Invalid JWT token: {}", e.getMessage());
    } catch (ExpiredJwtException e) {
        log.error("JWT token is expired: {}", e.getMessage());
    } catch (SignatureException e) {
        log.error("JWT signature is invalid: {}", e.getMessage());
    }
    return false;
}
```

A tampered JWT, say an attacker changes their role from `VENDOR` to `ORGANIZER` in the payload, produces a signature mismatch. `SignatureException` is caught, validation fails, and the request is rejected with a 401 before it reaches any business logic. The attacker would need to know the HMAC-SHA256 signing key to forge a valid signature, and that key lives only in the environment variable.

On deserialization: Java's native object deserialization (`ObjectInputStream`) with untrusted data is one of the most exploitable vulnerability classes in Java. The application never uses it. All API payloads are JSON, deserialized by Jackson into typed Java objects. Jackson's deserialization with concrete target types is safe. It cannot be used to load arbitrary classes via gadget chains the way native Java deserialization can.


### A09: Security Logging and Monitoring Failures

This is the one that security tutorials always gloss over because it is less exciting than injection attacks. But you cannot detect a breach you are not logging for, and you cannot investigate an incident without a trail of events.

* Every JWT validation failure is logged at ERROR level by JwtUtils, whether the token was expired, malformed, or had an invalid signature. These logs include the failure reason. If someone is brute-forcing tokens or replaying expired ones, you will see it in the logs.
* Every rate limit violation logs the offending client IP. If one IP is hitting the 429 threshold repeatedly, that is a signal worth investigating.
* The global exception handler logs every unexpected server error before returning the sanitized response to the client. No exception disappears silently.
* All core entities carry `createdAt` and `updatedAt` timestamps managed by JPA lifecycle hooks. You can always answer "when was this reservation made, and when was it last modified?" The `createdAt` on a reservation cannot be forged because it is set server-side by the `@PrePersist` callback, not accepted from the client.

In production, Spring Boot Actuator exposes `/actuator/health` for uptime monitoring. The complete logging pipeline, including SLF4J structured logs, Actuator health data, and database audit timestamps, gives you the foundation to detect anomalies, even if it is not a full SIEM.


### A10: Server-Side Request Forgery (SSRF)

SSRF is where an attacker tricks your server into making HTTP requests to internal resources by supplying a URL you then fetch. The classic example is `http://169.254.169.254/latest/meta-data/`, the AWS EC2 metadata endpoint. If your server fetches that URL, the attacker gets your IAM credentials and your cloud environment is compromised.

The protection here is architectural: the application has no endpoint that accepts a URL from the user and fetches it server-side. Every outbound HTTP call goes to a hardcoded, configuration-driven destination, including Google's OIDC endpoints, Stripe's API, and the SMTP server, using their official SDKs. SDKs use their own internally validated endpoint URLs that cannot be redirected by user input.

In production, the Docker container's network configuration blocks direct access to `169.254.169.254`. Even if SSRF were somehow introduced in the future, say a developer adds an "import data from URL" feature without thinking about the security implications, the network layer provides a backstop.


## The Reservation Form: All Eight Fields, Done Properly

The assessment required the booking form to capture eight specific pieces of information. Here is how each one is handled, not just in the UI, but all the way through to backend validation:

* **Authenticated username (field i):** Never submitted by the client. It is extracted from the JWT on the server side using `Principal.getName()`. A vendor cannot book under a different vendor's identity by manipulating the request payload. The backend owns this field entirely.
* **Exhibition or event name (field ii):** Populated from a predefined list of active events fetched from `GET /api/v1/public/events`. On the backend, `@NotBlank` ensures an empty string is not accepted.
* **Reservation date (field iii):** Uses an HTML date input with `min={today}` to prevent past-date selection in the UI, backed by `@FutureOrPresent` on the backend DTO field. Both layers are needed. UI validation is for UX; backend validation is for security, because you can bypass UI validation with a direct API call.
* **Stall type (field iv) and preferred size (field v):** Both marked `@NotNull` on the backend. They are enums: `STANDARD`, `PREMIUM`, `CORNER` and `SMALL`, `MEDIUM`, `LARGE` respectively. If the client sends an unrecognized string, Jackson fails to deserialize it and returns a 400.
* **Number of stalls (field vi):** `@NotNull @Min(1) @Max(10)`. One at minimum (you are booking something), ten at maximum (preventing one vendor from reserving the entire venue programmatically).
* **Business category (field vii):** A `@NotNull` enum field covering Food and Beverage, Clothing, Electronics, Handicrafts, Services, Fiction, Academic, and Others. Stored as a PostgreSQL enum type for type safety at the database level too.
* **Special requirements (field viii):** Genuinely optional and stored as TEXT. It gets passed through as-is and rendered in the organizer's reservation view. Since we are using React for rendering, any HTML or script tags in this field display as literal text, not executed markup.


## Challenges That Actually Tripped Me Up

**The query parameter token security debt.** The QR code download feature generates a standard `<a href="/api/qr/download?token=...">` link that opens in a new browser tab. There is no way to attach an Authorization header to a browser navigation like that. So the JWT filter had to accept tokens from query parameters for that endpoint.

My original implementation made this a global fallback, meaning any endpoint could accept `?token=` as an alternative to the Authorization header. I shipped that. Then I thought about it more carefully and realized: query parameters appear in Nginx access logs, browser history, and the HTTP Referer header that gets sent to Google Analytics or any other third-party script on the page. A JWT in a URL is a JWT waiting to be leaked.

The fix: scope the query parameter fallback exclusively to the `/qr/download` path. Everything else must use the Authorization header. And add a comment in the code explaining exactly why the exception exists, so the next developer does not "clean it up" by making it global again or remove it and break downloads.

**Understanding JWT logout semantics.** Someone in my review process asked: "What happens if I steal someone's JWT?" The correct answer is: for up to 24 hours, you can use it. Client-side logout does not invalidate the token cryptographically. I had to think carefully about whether that was acceptable for this application and document the decision explicitly, rather than either pretending the limitation does not exist or over-engineering a blacklist for a booking platform.

**The OWASP coverage gap I almost missed.** When I first audited my implementation against the OWASP Top 10, I had solid coverage of A01, A02, A03, A04, and A07. But A06, A08, A09, and A10 were either not explicitly addressed or addressed implicitly without documentation.

Doing a systematic walkthrough, one category at a time, asking "what does OWASP actually mean by this, and where in my codebase does that apply?", found real gaps. The logging was actually reasonably good, but it was not documented anywhere. The component management process (CVE auditing) did not exist. Addressing these didn't require major code changes, but it did require intentional thought.


## What I Would Do Differently

* **Token revocation on logout:** A Redis-backed JWT blacklist keyed by `jti` claim would make logout cryptographically effective. Every token carries a `jti` (JWT ID), a UUID generated at token creation. On logout, the server adds that `jti` to a Redis set with a TTL equal to the token's remaining lifetime. The JWT filter checks the blacklist on every request. One Redis lookup per request, fast, scalable, and it makes stolen-token scenarios much less dangerous.
* **Proper audit logging table:** Right now, security-relevant events go to the application log. That works, but it is not ideal. Logs rotate, they are harder to query, and they cannot easily generate audit reports. A dedicated `audit_log` database table with columns for `timestamp`, `actor`, `action`, `resource_type`, `resource_id`, and `outcome` would make compliance reporting and incident investigation dramatically easier.
* **Automated CVE scanning in CI:** The OWASP Dependency-Check Maven plugin can be added to the build pipeline and configured to fail the build if any dependency has a CVSS score above a threshold. Right now CVE auditing is a manual process I do periodically. Making it automatic and blocking means security debt cannot accumulate between active development periods.
* **Input length limits:** I have `@Min`/`@Max` on numeric fields, but the `specialRequirements` text field has no length limit. Someone could send 50MB of text in that field and force the server to store it. A `@Size(max = 2000)` annotation would prevent this trivially.


## Final Thoughts

I came into this thinking security was a feature you add at the end. I came out understanding it is a set of design decisions you make throughout, and the absence of a deliberate decision is itself a decision, usually a bad one.

The OWASP Top 10 is genuinely useful as a systematic checklist, not just a list of scary buzzwords. Going through it category by category forced me to think about parts of the system I would have glossed over, including component management, logging, and SSRF, because they are less dramatic than SQL injection but equally important in practice.

The thing I will carry forward most: **write comments that explain the why of security decisions, not just the what.** The next developer reading `JwtAuthenticationFilter` needs to understand why the query parameter fallback is scoped to `/qr/download`, not just that it is. Security knowledge that lives only in one developer's head is security knowledge that evaporates when they leave the project.

Build the system like someone is actively trying to break it. Because eventually, someone will be.

***

*Source code: [github.com/StereoSachiiii/reservation_system](https://github.com/StereoSachiiii/reservation_system)*

*References:*
* *[OWASP Top 10 (2021)](https://owasp.org/Top10/)*
* *[OpenID Connect Specifications](https://openid.net/developers/specs/)*
* *[Spring Security Reference](https://docs.spring.io/spring-security/reference/)*
* *[Bucket4j Rate Limiting](https://bucket4j.com/)*
* *[Google OIDC Validation Guide](https://developers.google.com/identity/openid-connect/openid-connect#validatinganidtoken)*
