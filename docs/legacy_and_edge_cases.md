# 🤨 Legacy, Edge Cases & "Out of Pocket" Logic

This document cataloges the more unusual, creative, or legacy-driven implementations within the SA_PROJECT codebase.

## 🌌 The 10 Billion ID Threshold
Found in: `StallDesignerPage.tsx`

To distinguish between stalls already saved in the database and "newly created" stalls on the client side, the frontend uses a numeric threshold.
- **The Logic**: If a stall has an ID $> 10,000,000,000$, it is treated as a temporary client-side ID.
- **The Action**: During save, any ID above this threshold is set to `undefined`, signaling the backend to create a new record.

### Deep Code Analysis: The 10 Billion ID Logic
```typescript
// StallDesignerPage.tsx L123: Filtering for new stalls
// Date.now() is used for temporary IDs, which are > 1.7e12
id: s.id > 10_000_000_000 ? undefined : s.id
```
By passing `undefined`, the frontend forces the backend to treat the stall as a brand new entity, ensuring it gets a proper sequential database ID upon persistence.

## 🔍 JSON-String Grep for Coordinates
Found in: `StallService.java`

Instead of parsing the complex geometry JSON to perform a simple check, the backend uses a high-speed string search.
```java
// StallService.java L178-179: Direct string inspection for edge cases
if (geomStr.contains("\"x\": 0") || geomStr.contains("\"x\": 0.0") ||
    geomStr.contains("\"y\": 0") || geomStr.contains("\"y\": 0.0")) {
    calculatedScore -= EDGE_DISTANCE_PENALTY;
}
```
- **Rationale**: It avoids the overhead of Jackson parsing for a binary check ("is it at the wall?").
- **Caveat**: This relies on the frontend serializing JSON consistently.

## 🧩 Percentage-to-Dummy Pixel Mapping
Found in: `DesignerCanvas.tsx` and `StallService.java`

The system bridges two different coordinate spaces:
1. **Database**: Store everything as 0-100 (percentage).
2. **Execution**: Calculate everything using a hardcoded 1000x600 (frontend) or 1000x800 (backend) grid.
- **Note**: There is a slight mismatch between frontend (600h) and backend (800h) constants that may lead to minor score variations if height-based influences are used.

## 💰 Cent-Based Pricing
Found in: `application.properties` and the database schema.

To avoid the infamous floating-point math issues common in currency handling, the system strictly uses **Integer Cents**.
- **Example**: A price of $5,000.00 is stored as `500000`.
- **Formatting**: The UI is responsible for dividing by 100 for display purposes.

---
*Created by Antigravity Technical Analysis*
