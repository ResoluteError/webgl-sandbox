export const coloredVertexShaderSource = `#version 300 es
layout(location = 0) in vec4 a_position;
layout(location = 1) in vec4 a_color;
layout(location = 2) in vec3 a_normal;
layout(location = 3) in vec2 u_texpos;

precision highp float;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec4 v_color;
out vec3 v_normal;
out vec3 v_fragPos;
out vec2 v_texCoord;

void main() {
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * a_position;
  v_fragPos = vec3(uModelMatrix * a_position);
  v_color = a_color;
  v_normal = a_normal;
  v_texCoord = u_texpos;
}
`;
