varying vec2 vSize;
varying vec2 vUv;

uniform float uProgress;
uniform vec2 uQuadSize;
uniform vec2 uResolution;
uniform float uTime;

void main() {
  vec4 defaultState = modelMatrix * vec4(position, 1.0);
  vec4 fullScreenState = vec4(position, 1.0);
  fullScreenState.x *= uResolution.x / uQuadSize.x;
  fullScreenState.y *= uResolution.y / uQuadSize.y;
  
  vec4 finalState = mix(defaultState, fullScreenState, uProgress);


  vec2 size = mix(uQuadSize, uResolution, uProgress);

  gl_Position = projectionMatrix * viewMatrix * finalState;

  vSize = size;
  vUv = uv;
}