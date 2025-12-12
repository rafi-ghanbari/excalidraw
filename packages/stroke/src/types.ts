import { type RGBA } from "@excalidraw/common";

import type { LocalPoint } from "@excalidraw/math";

export const ALPHA_THRESHOLD_8BIT = 1 / 255;

export type CoordSpace = "devicePx" | "cssPx";

export type RawSample = Readonly<{
  x: number;
  y: number;
  t: number;
  p: number; // >0
}>;

export type StrokeSegment = Readonly<{
  a: LocalPoint;
  b: LocalPoint;
  ra: number; // device px radius at a
  rb: number; // device px radius at b
  color: RGBA;
  softnessPx: number; // feather beyond radius, in device px
}>;

/**
 * Rendered bounds in the coordinate space of the output buffer.
 *
 * Invariant: width = xMax - xMin, height = yMax - yMin.
 *
 * xMin/yMin/xMax/yMax are integer pixel-edge coordinates (xMax/yMax are exclusive).
 */
export type RenderedBounds = Readonly<{
  xMin: number;
  yMin: number;
  xMax: number;
  yMax: number;
  width: number;
  height: number;
}>;

export type StrokeRecord = Readonly<{
  segments: readonly StrokeSegment[];
  bounds: RenderedBounds;
  metadata: Readonly<{
    dpr: number;
    coordSpace: CoordSpace;
  }>;
}>;

export type Rgba8Buffer = Readonly<{
  width: number;
  height: number;
  data: Uint8ClampedArray;
}>;

export type ImageBuffer =
  | Readonly<{
      kind: "imageData";
      imageData: ImageData;
      premultipliedAlpha: false;
    }>
  | Readonly<{
      kind: "rgba8";
      buffer: Rgba8Buffer;
      premultipliedAlpha: false;
    }>
  | Readonly<{
      kind: "offscreenCanvas";
      canvas: OffscreenCanvas;
      premultipliedAlpha: true;
    }>;

export type StrokeResult = Readonly<{
  image?: ImageBuffer;
  svg?: string;
  bounds: RenderedBounds;
  boundsExact?: RenderedBounds;
  coordSpace: CoordSpace;
}>;
