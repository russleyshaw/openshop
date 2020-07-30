precision mediump float;

#define WIDTH 16.0
#define VAL1 0.33
#define VAL2 0.66

void main() {
  vec4 col1 = vec4(VAL1, VAL1, VAL1, 1.0);
  vec4 col2 = vec4(VAL2, VAL2, VAL2, 1.0);

  bool isXEven = mod(gl_FragCoord.x, WIDTH) > (WIDTH / 2.0);
  bool isYEven = mod(gl_FragCoord.y, WIDTH) > (WIDTH / 2.0);

  gl_FragColor = (isXEven && !isYEven) || (!isXEven && isYEven)  ? col1 : col2;
}