uniform sampler2D feed;

varying vec2 vUv;

void main() {
  gl_FragColor = texture2D(feed, vUv);
  // gl_FragColor = vec4(vUv, 1.0, 1.0);
}