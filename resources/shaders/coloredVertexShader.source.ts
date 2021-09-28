export const coloredVertexShaderSource = `#version 300 es
in vec4 a_position;
in vec4 a_color;

precision highp float;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec4 v_color;

void main() {
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * a_position;
  v_color = a_color;
}
`;
