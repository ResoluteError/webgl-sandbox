export const coloredFragmentShaderSource = `#version 300 es
precision highp float;
in vec4 v_color;
in vec3 v_normal;
in vec3 v_fragPos;

out vec4 outColor;

uniform sampler2D u_Texture;
uniform vec3 u_LightPos;
uniform mat3 u_NormalMatrix;

void main() {
  float ambient = 0.2;
  vec3 norm = normalize(u_NormalMatrix * v_normal);
  vec3 lightDir = normalize(u_LightPos - v_fragPos);
  float diff = ambient + max(dot(norm, lightDir), 0.0);
  vec4 result = vec4(diff * vec3(v_color), 1.0);
  vec4 result2 = vec4(diff * vec3(1.0, 1.0, 1.0), 1.0);
  outColor = result;
}
`;
