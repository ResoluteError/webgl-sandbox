import { mat4 } from "gl-matrix";

export class ViewMatrix {
  private viewMatrix: mat4;

  constructor() {
    this.viewMatrix = mat4.create();
  }

  public set(x: number, y: number, z: number) {
    this.viewMatrix = mat4.create();
    this.translate(x, y, z);
  }

  public translate(x: number, y: number, z: number) {
    mat4.translate(
      this.viewMatrix, // destination matrix
      this.viewMatrix, // matrix to translate
      [x, y, z]
    ); // amount to translate
  }

  public getMatrix() {
    return this.viewMatrix;
  }

  public getUniformName() {
    return "uViewMatrix";
  }
}
