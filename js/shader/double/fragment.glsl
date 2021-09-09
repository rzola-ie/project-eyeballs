varying vec2 vUv;

uniform sampler2D feed;

void main() {
  gl_FragColor = texture2D(feed, vUv);
}