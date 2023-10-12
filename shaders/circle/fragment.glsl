uniform vec3 uPrimary;
uniform vec3 uSecondary;
varying vec2 vUv;

void main() {
  float strength = mod(distance(vUv, vec2(0.5)) * 10.0, 1.0);

  vec3 primary = uPrimary;
  vec3 secondary = uSecondary;
  vec3 mixed = mix(primary, secondary, strength);

  gl_FragColor = vec4(mixed, 1.0);
}