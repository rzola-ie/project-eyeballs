precision lowp float;
uniform sampler2D feed;
varying vec2 vUv;
uniform float uDoubleOffset;
uniform float uDoubleMix;
uniform float uTime;

void main(){
  vec2 uv = vUv;
  vec3 color = vec3(0.0);

  if (uv.x>=0.0 && uv.y>=0.0 && uv.x<1.0 && uv.y<1.0) color = texture2D(feed, uv).rgb;

	float amount = 1.0;
	amount = pow(uDoubleOffset + sin(uTime) * 0.04, 3.0);
	// amount *= 0.05;

  vec2 leftUv = vec2(uv.x - amount, uv.y);
  // if(leftUv.x < 0.0) discard;
  
  vec3 colLeft;
  colLeft.rgb = texture2D( feed, leftUv ).rgb;
  // colLeft *= (1.0 - amount);

  vec2 rightUv = vec2(uv.x + amount, uv.y);
  // if(leftUv.x > 1.0) discard;

  vec3 colRight;
  colRight.rgb += texture2D( feed, rightUv ).rgb;
  // colRight *= (1.0 - amount);

  vec3 colMixed;
  colMixed += mix(colLeft, colRight, 0.5);

  vec3 colFinal; 
  colFinal += mix(colMixed, color, uDoubleMix);
  
  // vec3 colFinal = mix(cameraView.rgb, mixed, 0.5);
  gl_FragColor=vec4(colFinal, 1.0);
}