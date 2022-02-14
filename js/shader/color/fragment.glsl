#define PI 3.1415926535897932384626433832795

vec3 adjustSaturation(vec3 color, float value) {
  // https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
  const vec3 luminosityFactor = vec3(0.2126, 0.7152, 0.0722);
  vec3 grayscale = vec3(dot(color, luminosityFactor));

  return mix(grayscale, color, 1.0 + value);
}

varying vec2 vUv;

uniform sampler2D feed;
uniform float uDesaturate;

void main() {
  vec2 uv = vUv;

  vec3 color = vec3(0.0);

  if (uv.x>=0.0 && uv.y>=0.0 && uv.x<1.0 && uv.y<1.0) color = texture2D(feed, uv).rgb;

  // color vision loss
  color = adjustSaturation(color, uDesaturate);

  gl_FragColor = vec4(color, 1.0);
}