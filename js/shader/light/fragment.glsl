varying vec2 vUv;

uniform sampler2D feed;
uniform float uTime;
uniform float uSensetivity;

void main() {
  vec4 cameraView = texture2D(feed, vUv);

  // light sensitivity
  cameraView += uSensetivity;

  gl_FragColor = cameraView;
}