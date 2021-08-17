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
  vec2 centeredUv = vUv - 0.5;
  float distanceToCenter = length(centeredUv);
  vec4 cameraView = texture2D(feed, vUv);

  // color vision loss
  vec3 color = cameraView.rgb;
  color = adjustSaturation(color, uDesaturate);





  gl_FragColor = vec4(color, cameraView.a);
}