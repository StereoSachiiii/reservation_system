# 🎯 Deep Dive: Visibility & Proximity Scoring Engine

The **Spatial Scoring Engine** (referred to in the codebase as the "Spatial Scoring Algorithm V6") is the sophisticated heart of the SA_PROJECT backend. It dynamically calculates the value and visibility of stalls based on their physical location within a venue.

## 🏗 Core Architecture

The engine is primarily implemented in `StallService.java`, leveraging configuration from `ScoringConstants.java`.

### 1. The Coordinate System
- **Input**: Stalls are defined using a percentage-based geometry (X, Y, Width, Height, all 0-100).
- **Transformation**: The system internally maps these percentages to a fixed "Dummy Pixel Space" of **1000x800** (or 1000x600 as seen in the frontend).
- **Benefit**: This decoupling allows the floor plan to remain responsive across devices while maintaining a consistent mathematical grid for scoring.

### 2. Proximity Scoring (Influence Zones)
The most advanced feature is the use of **Influences**. Each hall has a `staticLayout` JSON containing an array of influences (e.g., Entrances, Stages, Main Walkways).

- **Calculation**: For each stall, the engine calculates the distance $D$ from the stall's center to the influence's center $(X_i, Y_i)$.
- **Radius Check**: If $D$ is less than the influence's radius $R$, the stall is "within the zone".
- **Falloff Curves**:
    - **LINEAR**: Scoring follows a linear decline: $Intensity \times (1 - D/R)$.
    - **EXPONENTIAL**: Scoring follows a quadratic decline: $Intensity \times (1 - D/R)^2$.
- **Intensity**: Each influence has a predefined intensity (e.g., 50 for a Stage, 30 for an Entrance) which determines the maximum possible boost.

### 3. Edge Penalty ("Wall Huggers")
The engine penalizes stalls that are physically against the edges of the map (X=0 or Y=0).
- **Penalty**: A flat `EDGE_DISTANCE_PENALTY` (default: 5 points) is subtracted.
- **Rationale**: Stalls against walls often have less visibility or "dead-end" traffic.

### 4. Narrative Value Drivers
Unlike black-box pricing, the engine generates a **Breakdown Map**.
- **Visibility Score**: A final 0-100 normalized score.
- **Value Drivers**: A list of human-readable reasons for the score (e.g., `{"label": "Stage Proximity", "value": "+15"}`).
- **Purpose**: This data is sent to the frontend to help vendors understand the premium nature of specific locations.

## 🔢 Mathematical Normalization

The raw integer score is clamped between `MIN_SCORE` (5) and `MAX_SCORE` (100).
It is then scaled by `SCORE_SCALE_DIVISOR` (20) to generate a **1-5 Star Rating** for the UI.

## 🔍 Deep Code Analysis: StallService.java

Here is a line-by-line breakdown of the core scoring loop in `StallService.java`.

```java
// L133: The engine parses the stall's current geometry (x, y, w, h)
com.fasterxml.jackson.databind.JsonNode stallGeom = objectMapper.readTree(geometryStr);

// L135-136: It calculates the center point of the stall in percentage space
double stallX = stallGeom.get("x").asDouble() + (stallGeom.has("w") ? stallGeom.get("w").asDouble() / 2 : 0);
double stallY = stallGeom.get("y").asDouble() + (stallGeom.has("h") ? stallGeom.get("h").asDouble() / 2 : 0);

// L147-148: Coordinates are normalized to the "Dummy Pixel Space" (Width x Height)
double normStallX = (stallX / 100.0) * hallWidth;
double normStallY = (stallY / 100.0) * hallHeight;

// L150: Simple Euclidean distance formula used to find proximity to an influence
double dist = Math.sqrt(Math.pow(normStallX - infX, 2) + Math.pow(normStallY - infY, 2));

// L152-154: If within radius, apply falloff curve logic
if (dist < radius) {
    double factor = 1.0 - (dist / radius);
    // Exponential falloff uses a quadratic curve (factor^2) for steeper drop-off
    if ("EXPONENTIAL".equals(falloffStr)) factor = Math.pow(factor, 2); 
    
    // L156: Calculate final contribution based on intensity and falloff factor
    int contribution = (int) (intensity * factor);
    
    // L158-161: Add to total score and record as a "Value Driver" for the vendor
    calculatedScore += contribution;
}
```

## 🛠 Key Files
- [StallService.java](file:///c:/Users/User/SA_PROJECT/backend/src/main/java/com/bookfair/service/StallService.java#L110-L194) - Implementation of the scoring logic.
- [ScoringConstants.java](file:///c:/Users/User/SA_PROJECT/backend/src/main/java/com/bookfair/constant/ScoringConstants.java) - Scoring thresholds and multipliers.
- [docs/architecture_overview.md](file:///c:/Users/User/SA_PROJECT/docs/architecture_overview.md) - High-level context of the feature.

---
*Created by Antigravity Technical Analysis*
