attribute vec2 position;
varying vec2 vUv;

void main(void){
  gl_Position=vec4(position, 0., 1.);
  vUv=0.5+0.5*position;
}