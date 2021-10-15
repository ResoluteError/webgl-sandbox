import { vec3 } from "gl-matrix";

export class Light {
  private gl: WebGL2RenderingContext;
  private position: vec3;
  private intensity: number;
  private color: vec3;

  constructor(
    gl: WebGL2RenderingContext,
    position: vec3,
    intensity: number,
    color: vec3
  ) {
    this.gl = gl;
    this.position = position;
    this.intensity = intensity;
    this.color = color;
  }

  public getPosition(): vec3 {
    return this.position;
  }
}
