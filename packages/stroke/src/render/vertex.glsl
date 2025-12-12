#version 300 es
precision highp float;

layout(location=0) in vec2 aA;
layout(location=1) in vec2 aB;
layout(location=2) in float aRa;
layout(location=3) in float aRb;
layout(location=4) in float aSoft;
layout(location=5) in vec4 aColor;

uniform vec2 uResolution;
uniform vec2 uBoundsOrigin;

out vec2 vP;
out vec2 vA;
out vec2 vB;
out float vRa;
out float vRb;
out float vSoft;
out vec4 vColor;

void main() {
  float extent = max(aRa, aRb) + aSoft;
  vec2 minP = min(aA, aB) - vec2(extent);
  vec2 maxP = max(aA, aB) + vec2(extent);

  int vid = gl_VertexID;
  vec2 corner = vec2((vid == 1 || vid == 3) ? 1.0 : 0.0, (vid >= 2) ? 1.0 : 0.0);
  vec2 p = mix(minP, maxP, corner);

  // Convert to framebuffer-local pixel coordinates
  vec2 local = p - uBoundsOrigin;

  vec2 clip = (local / uResolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

  vP = p;
  vA = aA;
  vB = aB;
  vRa = aRa;
  vRb = aRb;
  vSoft = aSoft;
  vColor = aColor;
}