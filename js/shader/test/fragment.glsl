varying vec2 vSize;
varying vec2 vUv;

uniform float uProgress;

void main() {
  gl_FragColor = vec4(vUv, 1.0, 1.0);
}