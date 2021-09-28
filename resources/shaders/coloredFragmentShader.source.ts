export const coloredFragmentShaderSource = `#version 300 es
precision highp float;
in vec4 v_color;

out vec4 outColor;

uniform sampler2D u_Texture;

void main() {
  outColor = v_color;
}
`;
