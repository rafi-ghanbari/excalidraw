import { rasterizeStrokeCpu } from "./software";
import { isWebGL2Available, renderStrokeRecordWebGL2 } from "./webgl2";
import { getSvgPathDataFromStrokeRecord } from "./svg";

import type { StrokeRecord, StrokeResult } from "../types";

export type StrokeToCanvasCompatibleOptions = Readonly<{
  alphaThreshold?: number; // 0..1
  refineBoundsByScan?: boolean;
}>;

export function strokeToCanvasCompatible(
  record: StrokeRecord,
  options?: StrokeToCanvasCompatibleOptions,
): StrokeResult {
  let result: StrokeResult;
  // Render from the already-built record to avoid recomputing geometry.
  if (isWebGL2Available()) {
    const canvas = renderStrokeRecordWebGL2(record);
    if (canvas) {
      result = {
        image: { kind: "offscreenCanvas", canvas, premultipliedAlpha: true },
        bounds: record.bounds,
        coordSpace: "devicePx",
      };
    } else {
      const { buffer } = rasterizeStrokeCpu(record);
      const imageData =
        typeof ImageData !== "undefined"
          ? new ImageData(
              buffer.data as unknown as ImageDataArray,
              buffer.width,
              buffer.height,
            )
          : null;
      result = {
        image: imageData
          ? { kind: "imageData", imageData, premultipliedAlpha: false }
          : { kind: "rgba8", buffer, premultipliedAlpha: false },
        bounds: record.bounds,
        coordSpace: "devicePx",
      };
    }
  } else {
    const { buffer } = rasterizeStrokeCpu(record, options);
    const imageData =
      typeof ImageData !== "undefined"
        ? new ImageData(
            buffer.data as unknown as ImageDataArray,
            buffer.width,
            buffer.height,
          )
        : null;
    result = {
      image: imageData
        ? { kind: "imageData", imageData, premultipliedAlpha: false }
        : { kind: "rgba8", buffer, premultipliedAlpha: false },
      bounds: record.bounds,
      coordSpace: "devicePx",
    };
  }

  return result;
}

export function strokeToSvgPathData(record: StrokeRecord): string {
  return getSvgPathDataFromStrokeRecord(record);
}
