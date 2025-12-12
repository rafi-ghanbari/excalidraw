# Excalidraw High-Fidelity Pressure Stroke Rendering Engine

This module implements a high-quality, pressure-sensitive pen stroke renderer similar to professional drawing applications. Design goals are **artifact-free visual fidelity** and **deterministic rendering** (to the extent possible). Supportd targets are **realtime browser rendering** (via WebGL2) and **async software rendering** (CPU raster + SVG) using a single, shared stroke algorithm.

The output of the system is a rendered image buffer (or SVG) suitable for composition on the Excalidraw canvas (see freedraw implementation) or other canvas-based applications.

---

## Core Ideas

- **Modularity: One stroke algorithm, multiple renderers**

  - All stroke logic (smoothing, pressure mapping, spacing) is shared.
  - Rendering backends consume the same stroke primitives and types.

- **Distance-domain stroke construction**

  - Raw pointer input is time-sampled and irregular in space.
  - Strokes are resampled in **arc-length space** to guarantee uniform coverage.
  - Prevents holes, overlaps, and angle artifacts.

- **Signed Distance Field (SDF) rendering**
  - Strokes are represented as tapered capsule segments.
  - Each pixel independently evaluates coverage.
  - Eliminates join/miter artifacts at tight angles.

---

## Input

A stream of pointer samples:

- `x`, `y` – 2D position
- `t` – timestamp
- `pressure > 0` – pen pressure

Samples are typically sourced from `pointermove` events and are assumed to be approximately constant in time, not space.

---

## Common Stroke Representation

All rendering backends consume the same space-domain primitives:

- **Tapered capsule segments**
  - start/end points
  - start/end radius (pressure-driven)
  - edge softness (anti-alias fringe)
  - color / opacity

This representation guarantees continuous coverage and is independent of the rendering technology.

---

## Rendering Backends

### Browser (Realtime)

- **WebGL2 SDF renderer**
- Instanced quads + fragment-shader distance evaluation
- Incremental rendering at interactive rates
- Produces an offscreen image buffer

### Server (Offline)

- **CPU software rasterizer**
  - Same SDF math as the GPU renderer
  - Deterministic output
  - Optional pixel-scan refinement for exact bounds
- **SVG exporter**
  - Generates vector output from the same stroke primitives
  - Explicit `viewBox`, `width`, and `height`
  - Analytic bounds are authoritative

---

## Outputs

Each stroke render produces:

- Raster image buffer (`ImageBitmap`, `ImageData`, or raw RGBA)
- Optional SVG representation
- `RenderedBounds`:
  - `xMin`, `yMin`, `xMax`, `yMax`
  - width / height in render pixel space
- Optional exact bounds (CPU scan, offline only)
