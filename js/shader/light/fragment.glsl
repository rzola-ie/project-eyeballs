varying vec2 vUv;

uniform sampler2D feed;
uniform float uTime;
uniform float uSensetivity;

void main() {
  vec2 uv = vUv;

  vec3 color = vec3(0.0);

  if (uv.x>=0.0 && uv.y>=0.0 && uv.x<1.0 && uv.y<1.0) color = texture2D(feed, uv).rgb;

  // light sensitivity
  color += uSensetivity;

  gl_FragColor = vec4(color, 1.0);
}