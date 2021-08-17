varying vec2 vUv;

uniform sampler2D feed;

void main() {
  vec4 cameraView = texture(feed, vUv);

  gl_FragColor = cameraView;
}