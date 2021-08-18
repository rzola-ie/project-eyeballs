precision mediump float;

uniform sampler2D samplerVideo;

varying vec2 vUVvideo;

void main() {
  gl_FragColor = texture2D(samplerVideo, vUVvideo);
}