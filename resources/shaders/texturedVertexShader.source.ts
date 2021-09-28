export const texturedVertexShaderSource = `#version 300 es
in vec4 a_position;
in vec2 u_texpos;

precision highp float;

uniform mat4 uModelMatrix;
uniform mat4 uViewMatrix;
uniform mat4 uProjectionMatrix;

out vec2 v_TexCoord;

void main() {
  gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * a_position;
  v_TexCoord = u_texpos;
}
`;
