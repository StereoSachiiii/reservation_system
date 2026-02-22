# 🎨 Interactive Stall Designer

The **Stall Designer** is a custom-built, canvas-based editor located in the administrative portal (`StallDesignerPage.tsx`). It allows event organizers to visually layout stalls, zones, and influences.

## 📐 Coordinate & Geometry System

To ensure a seamless experience across different screen sizes and resolutions, the designer uses a **Percentage-Based Layout**.

### 1. The 0-100 Perspective
Stalls and zones are stored in the database with coordinates $(x, y, w, h)$ as values from 0 to 100. This ensures the map is resolution-independent.

### 2. Percentage Mapping Code
The mapping from mouse events to percentage coordinates is handled by the `toPercent` utility:

```typescript
// types.ts
export function toPercent(e: React.MouseEvent, el: HTMLElement) {
    // 1. Get the bounding box of the canvas/overlay element
    const r = el.getBoundingClientRect();
    
    // 2. Calculate the click position relative to the element (e.clientX - r.left)
    // 3. Divide by total width/height and multiply by 100 to get percentage
    return { 
        x: ((e.clientX - r.left) / r.width) * 100, 
        y: ((e.clientY - r.top) / r.height) * 100 
    };
}
```

## 🧩 Key Components & Logic

### Drag & Drop State Machine
The `DesignerCanvas.tsx` implements a sophisticated interaction loop for moving items. It captures the initial offset during `onMouseDown` to prevent items from "snapping" to their top-left corner upon movement:

```typescript
// DesignerCanvas.tsx
const handleItemMouseDown = (e, id, type, itemX, itemY) => {
    e.stopPropagation(); // Avoid triggering the 'draw new stall' logic
    
    const pos = toPercent(e, overlayRef.current);
    
    // Capture the 'Grab Offset': the distance between where you clicked 
    // and where the stall's top-left corner is (pos.x - itemX)
    setDragData({ id, type, offsetX: pos.x - itemX, offsetY: pos.y - itemY });
};

const handleMouseMove = (e) => {
    const pos = toPercent(e, overlayRef.current);
    
    if (dragData) {
        // Calculate the new top-left corner by subtracting the Grab Offset 
        // from the current mouse position. This keeps the item attached 
        // to the mouse exactly where it was grabbed.
        const newX = pos.x - dragData.offsetX;
        const newY = pos.y - dragData.offsetY;
        
        // Broadcast the update to the state (stored in DesignerContext)
        setStalls(prev => prev.map(s => s.id === dragData.id ? 
            { ...s, geometry: { ...s.geometry, x: newX, y: newY } } : s));
    }
};
```

### Automatic Drawing Logic
When the user clicks and drags on an empty space, the engine calculates the bounding box of the drag:

```typescript
// types.ts
export function getDrawRect(start, end) {
    return {
        // Use Math.min to allow drawing from bottom-right to top-left
        x: Math.min(start.x, end.x), 
        y: Math.min(start.y, end.y),
        
        // Width and Height are the absolute differences
        w: Math.abs(end.x - start.x),
        h: Math.abs(end.y - start.y),
    };
}
```

## 🧱 Frontend Architecture

The designer's frontend is split into three main layers: **Data Handling** (`StallDesignerPage`), **State Orchestration** (`DesignerContext`), and **Interaction Logic** (`DesignerCanvas`).

### 1. State Centralization (Context API)
The `DesignerContext.tsx` acts as the single source of truth for the session. It manages not just the data (stalls, zones) but also the transient UI state (what is currently being drawn).

```typescript
// DesignerContext.tsx
export function DesignerProvider({ children, ...initialData }) {
    // 1. Entity State
    const [stalls, setStalls] = useState(initialData.stalls);
    const [zones, setZones] = useState(initialData.zones);
    const [influences, setInfluences] = useState(initialData.influences);

    // 2. Interaction State
    const [drawMode, setDrawMode] = useState('STALL'); // Are we drawing a stall, zone, or influence?
    const [isDrawing, setIsDrawing] = useState(false); // Is the mouse currently down and moving?
    const [startPos, setStartPos] = useState(null);    // Where did the drag begin?
}
```

### 2. Layered Rendering Engine
The `DesignerCanvas` renders components in a specific order to ensure correct visual overlap.

```tsx
// DesignerCanvas.tsx
return (
    <div className="relative bg-white shadow-lg">
        {/* Layer 1: Base Zones (e.g., Entrance, Stage) */}
        {zones.map(renderZone)}

        {/* Layer 2: Influence Heatmap (Noise, Traffic) */}
        {influences.map(renderInfluence)}

        {/* Layer 3: Interactive Stalls (Topmost layer) */}
        {stalls.map(renderStall)}

        {/* Layer 4: Active Draw Indicator (Visual feedback during drag) */}
        {isDrawing && renderDrawIndicator()}
    </div>
);
```

### 3. Real-time Influence Visualization
Influences are visualized using CSS `radial-gradient` and `mix-blend-multiply` to simulate a "heatmap" effect without using heavy canvas bitmaps.

```typescript
// DesignerCanvas.tsx
const renderInfluence = (inf) => {
    return (
        <div style={{
            left: `${inf.x - inf.radius}%`,
            top: `${inf.y - inf.radius}%`,
            width: `${inf.radius * 2}%`,
            height: `${inf.radius * 2}%`,
            // Use radial-gradient to fade the color out from the center
            background: `radial-gradient(circle, ${color} ${inf.intensity}%, transparent 70%)`,
            // mix-blend-multiply makes the "heat" darken the layers below it
            mixBlendMode: 'multiply',
            opacity: 0.25
        }} />
    );
};
```

## 💾 Saving & Synchronization

The saving process handles complex isolation. Since an event might have multiple halls, the system carefully merges the current hall's changes with the existing data for other halls:

```typescript
// StallDesignerPage.tsx
const handleSave = async (currentStalls, currentZones, currentInfluences) => {
    // 1. ISOLATION: Keep stalls from other halls intact by filtering them out
    const otherStalls = rawMapData.stalls.filter(s => s.hallName !== hall.name);

    // 2. RECONSTRUCTION: Create a final payload array containing 
    // both unchanged stalls and the newly edited stalls.
    const payload = [
        ...otherStalls,
        ...currentStalls.map(s => ({
            // If ID is > 10 Billion, it's a temp ID; send as undefined
            // so the backend generates a real primary key.
            id: s.id > 10_000_000_000 ? undefined : s.id, 
            name: s.name,
            hallName: hall.name,
            geometry: JSON.stringify(s.geometry), // Stringify for JPA column
            finalPriceCents: s.priceCents,
        }))
    ];

    await adminApi.saveLayout(event.id, payload);
};
```

## 🆔 The "10 Billion ID" Trick

When the user draws a new stall, the frontend must assign it a unique ID immediately so it can be managed in state (e.g., moved or colored). However, the backend is the source of truth for IDs.

To solve this, the designer uses a **10 Billion Threshold**:

```typescript
// DesignerCanvas.tsx
// All new stalls get a temporary ID based on the current timestamp
const newStall = { id: Date.now(), ... } // Date.now() is > 10,000,000,000

// StallDesignerPage.tsx
const payload = currentStalls.map(s => ({
    // If the ID is above the threshold, we know it's a "fake" client ID.
    // We send 'undefined' to the backend, which triggers an AUTO_INCREMENT save.
    id: s.id > 10_000_000_000 ? undefined : s.id,
    ...
}));
```

## 📏 Coordinate Normalization (Pixel vs Percentage)

While the designer *visually* works in percentages (0-100), the backend's `layoutConfig` sometimes expects legacy pixel values (e.g., 1000px width). The designer normalizes these during the save process:

```typescript
// StallDesignerPage.tsx
const layoutConfigObj = {
    width: 1000, height: 600, // Fixed dummy "canvas" size
    influences: currentInfluences.map(inf => ({
        // Convert internal percentage (0-100) to the dummy 1000px space
        x: (inf.x / 100) * 1000,
        y: (inf.y / 100) * 600,
        radius: (inf.radius / 100) * 1000
    }))
};
```

## 🛠 Key Files
- [StallDesignerPage.tsx](file:///c:/Users/User/SA_PROJECT/frontend/src/apps/admin/pages/StallDesigner/StallDesignerPage.tsx) - Main entry point and save logic.
- [DesignerCanvas.tsx](file:///c:/Users/User/SA_PROJECT/frontend/src/apps/admin/pages/StallDesigner/DesignerCanvas.tsx) - Interaction logic.
- [DesignerContext.tsx](file:///c:/Users/User/SA_PROJECT/frontend/src/apps/admin/pages/StallDesigner/DesignerContext.tsx) - Central state.
- [types.ts](file:///c:/Users/User/SA_PROJECT/frontend/src/apps/admin/pages/StallDesigner/types.ts) - Type definitions and utilities.

---
*Created by Antigravity Technical Analysis*
