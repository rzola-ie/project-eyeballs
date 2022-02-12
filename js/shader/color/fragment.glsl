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
uniform vec2 uResolution;

void main() {
  vec2 uv = vUv;
  // float u = vUv.x;
  // float v = (vUv.y - 1.0 / 6.0) * 3.0 / 2.0;
  // newUV = vec2(u, v);

  // float ratio = 16. / 9.; //480./204.;
  float ratio = uResolution.y / uResolution.x; //480./204.;

  // uv.y *= ratio;
  // uv.x *= ratio;
  
  // uv.y -= (0.5 - (1. / ratio) * 0.5) * ratio;
  // uv.x -= (0.5 - (1. / ratio) * 0.5) * ratio;

  // if(newUV.y < 0.0 || newUV.y > 1.0) discard;
  vec3 color = vec3(0.0);


  // vec4 cameraView = texture2D(feed, uv);

  if (uv.x>=0.0 && uv.y>=0.0 && uv.x<1.0 && uv.y<1.0) color = texture2D(feed, uv).rgb;

  // color vision loss
  color = adjustSaturation(color, uDesaturate);

  gl_FragColor = vec4(color, 1.0);
}