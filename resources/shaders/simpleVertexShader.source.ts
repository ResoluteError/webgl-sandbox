export const simpleVertexShaderSource = `
attribute vec4 aVertexPosition;

void main() {
  gl_Position = aVertexPosition;
}
`;