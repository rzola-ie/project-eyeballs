uniform mat2 videoTransformMat2;
varying vec2 vUVvideo;

// deformation 0 parameters:
const vec2 TEARPOINT0 = vec2(0.,-0.5);
const vec2 DISPLACEMENT0 = vec2(0.,0.15);
const float RADIUS0 = 0.4;

// deformation 1 parameters:
const vec2 TEARPOINT1 = vec2(0.25,-0.4);
const vec2 DISPLACEMENT1 = vec2(0.12,-0.07);
const float RADIUS1 = 0.3;

// deformation 2 parameters:
const vec2 TEARPOINT2 = vec2(-0.25,-0.4);
const vec2 DISPLACEMENT2 = vec2(-0.12,-0.07);
const float RADIUS2 = 0.3;

void main() {
  vec3 positionDeformed = position;

  // apply deformation 0
  float deformFactor0 = 1.-smoothstep(0.0, RADIUS0, distance(TEARPOINT0, position.xy));
  positionDeformed.xy += deformFactor0*DISPLACEMENT0;

  // apply deformation 1
  float deformFactor1 = 1.-smoothstep(0.0, RADIUS1, distance(TEARPOINT1, position.xy));
  positionDeformed.xy += deformFactor1*DISPLACEMENT1;

  // apply deformation 2
  float deformFactor2 = 1. - smoothstep(0.0, RADIUS2, distance(TEARPOINT2, position.xy));
  positionDeformed.xy += deformFactor2*DISPLACEMENT2;

  // project deformed point:
  vec4 mvPosition = modelViewMatrix * vec4( positionDeformed, 1.0 );
  vec4 projectedPosition=projectionMatrix * mvPosition;
  gl_Position=projectedPosition;

  // compute UV coordinates on the video texture:
  vec4 mvPosition0 = modelViewMatrix * vec4( position, 1.0 );
  vec4 projectedPosition0 = projectionMatrix * mvPosition0;
  
  vUVvideo = vec2(0.5,0.5) + videoTransformMat2 * projectedPosition0.xy / projectedPosition0.w;
}