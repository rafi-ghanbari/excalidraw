import type { LocalPoint } from "@excalidraw/math";

import type { StrokeRecord } from "../types";

const appendCirclePath = (d: string[], c: LocalPoint, r: number) => {
  const cx = Math.round(c[0] * 100) / 100;
  const cy = Math.round(c[1] * 100) / 100;
  const rr = Math.round(r * 100) / 100;
  d.push(
    `M ${cx + rr} ${cy}`,
    `A ${rr} ${rr} 0 1 0 ${cx - rr} ${cy}`,
    `A ${rr} ${rr} 0 1 0 ${cx + rr} ${cy}`,
    "Z",
  );
};

const appendCapsulePath = (
  d: string[],
  a: LocalPoint,
  b: LocalPoint,
  r: number,
) => {
  const ax = a[0];
  const ay = a[1];
  const bx = b[0];
  const by = b[1];
  const dx = bx - ax;
  const dy = by - ay;
  const len = Math.hypot(dx, dy);

  if (len < 1e-6) {
    appendCirclePath(d, a, r);
    return;
  }

  const inv = 1 / len;
  const ux = dx * inv;
  const uy = dy * inv;
  const nx = -uy;
  const ny = ux;

  const p0x = ax + nx * r;
  const p0y = ay + ny * r;
  const p1x = bx + nx * r;
  const p1y = by + ny * r;
  const p2x = bx - nx * r;
  const p2y = by - ny * r;
  const p3x = ax - nx * r;
  const p3y = ay - ny * r;

  const rr = Math.round(r * 100) / 100;
  d.push(
    `M ${Math.round(p0x * 100) / 100} ${Math.round(p0y * 100) / 100}`,
    `L ${Math.round(p1x * 100) / 100} ${Math.round(p1y * 100) / 100}`,
    `A ${rr} ${rr} 0 0 1 ${Math.round(p2x * 100) / 100} ${
      Math.round(p2y * 100) / 100
    }`,
    `L ${Math.round(p3x * 100) / 100} ${Math.round(p3y * 100) / 100}`,
    `A ${rr} ${rr} 0 0 1 ${Math.round(p0x * 100) / 100} ${
      Math.round(p0y * 100) / 100
    }`,
    "Z",
  );
};

export const getSvgPathDataFromStrokeRecord = (
  record: StrokeRecord,
): string => {
  const d: string[] = [];

  for (const seg of record.segments) {
    const maxDelta = 0.35; // device px
    const dr = Math.abs(seg.rb - seg.ra);
    const steps = Math.max(1, Math.ceil(dr / maxDelta));

    for (let i = 0; i < steps; i++) {
      const t0 = i / steps;
      const t1 = (i + 1) / steps;

      const ax = seg.a[0] + (seg.b[0] - seg.a[0]) * t0;
      const ay = seg.a[1] + (seg.b[1] - seg.a[1]) * t0;
      const bx = seg.a[0] + (seg.b[0] - seg.a[0]) * t1;
      const by = seg.a[1] + (seg.b[1] - seg.a[1]) * t1;

      const r0 = seg.ra + (seg.rb - seg.ra) * t0;
      const r1 = seg.ra + (seg.rb - seg.ra) * t1;
      const r = (r0 + r1) * 0.5;

      appendCapsulePath(d, [ax, ay] as LocalPoint, [bx, by] as LocalPoint, r);
    }
  }

  return d.join(" ");
};
