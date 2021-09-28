export const texturedFragmentShaderSource = `#version 300 es
precision highp float;
in vec2 v_TexCoord;

out vec4 outColor;

uniform sampler2D u_Texture;

void main() {
  outColor = texture(u_Texture, v_TexCoord);
}
`;
