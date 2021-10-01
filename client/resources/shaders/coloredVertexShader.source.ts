export const coloredVertexShaderSource = `#version 300 es
layout(location = 0) in vec4 a_position;
layout(location = 1) in vec4 a_color;
layout(location = 2) in vec4 a_normal;

precision highp float;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec4 v_color;
out vec4 v_normal;

void main() {
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * a_position;
  v_color = a_color;
  v_normal = a_normal;
}
`;
