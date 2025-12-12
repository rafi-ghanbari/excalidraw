import type { LocalPoint } from "@excalidraw/math";

import type { RenderedBounds, StrokeSegment } from "./types";

type BoundsAccum = {
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  hasData: boolean;
};

export const createEmptyBoundsAccum = (): BoundsAccum => ({
  xMin: Number.POSITIVE_INFINITY,
  yMin: Number.POSITIVE_INFINITY,
  xMax: Number.NEGATIVE_INFINITY,
  yMax: Number.NEGATIVE_INFINITY,
  hasData: false,
});

const expand = (
  b: BoundsAccum,
  xMin: number,
  yMin: number,
  xMax: number,
  yMax: number,
) => {
  b.xMin = Math.min(b.xMin, xMin);
  b.yMin = Math.min(b.yMin, yMin);
  b.xMax = Math.max(b.xMax, xMax);
  b.yMax = Math.max(b.yMax, yMax);
  b.hasData = true;
};

export const accumulateSegmentBounds = (b: BoundsAccum, seg: StrokeSegment) => {
  const ax = seg.a[0];
  const ay = seg.a[1];
  const bx = seg.b[0];
  const by = seg.b[1];

  const extent = Math.max(seg.ra, seg.rb) + seg.softnessPx;

  const xMin = Math.min(ax, bx) - extent;
  const yMin = Math.min(ay, by) - extent;
  const xMax = Math.max(ax, bx) + extent;
  const yMax = Math.max(ay, by) + extent;

  expand(b, xMin, yMin, xMax, yMax);
};

export const accumulatePointBounds = (
  b: BoundsAccum,
  p: LocalPoint,
  radiusPx: number,
  softnessPx: number,
) => {
  const extent = radiusPx + softnessPx;
  expand(b, p[0] - extent, p[1] - extent, p[0] + extent, p[1] + extent);
};

/**
 * Common snapping rule (used across renderers):
 * - Start from analytic float bounds expanded by radius+softness.
 * - Snap outward to integer pixel edges with a half-pixel margin.
 *
 * This matches typical pixel-center sampling (x+0.5,y+0.5).
 */
export const finalizeRenderedBounds = (b: BoundsAccum): RenderedBounds => {
  if (!b.hasData) {
    return { xMin: 0, yMin: 0, xMax: 0, yMax: 0, width: 0, height: 0 };
  }

  const xMin = Math.floor(b.xMin - 0.5);
  const yMin = Math.floor(b.yMin - 0.5);
  const xMax = Math.ceil(b.xMax + 0.5);
  const yMax = Math.ceil(b.yMax + 0.5);

  return {
    xMin,
    yMin,
    xMax,
    yMax,
    width: Math.max(0, xMax - xMin),
    height: Math.max(0, yMax - yMin),
  };
};
