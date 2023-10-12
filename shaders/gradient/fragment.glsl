uniform vec3 uPrimary;
uniform vec3 uSecondary;
varying vec2 vUv;

void main() {
  float strength = (vUv.x + vUv.y) * 0.5;
  vec3 primary = uPrimary;
  vec3 secondary = uSecondary;
  vec3 mixed = mix(primary, secondary, strength);

  gl_FragColor = vec4(mixed, 1.0);
}