varying vec2 vUv;

uniform sampler2D feed;

void main() {
  vec4 cameraView = texture2D(feed, vUv);

  gl_FragColor = cameraView;
}