import { mat4 } from "gl-matrix";

export class ModelViewMatrix {
  private modelViewMatrix: mat4;

  constructor() {
    this.modelViewMatrix = mat4.create();
  }

  public set(x: number, y: number, z: number) {
    this.modelViewMatrix = mat4.create();
    this.translate(x, y, z);
  }

  public translate(x: number, y: number, z: number) {
    mat4.translate(
      this.modelViewMatrix, // destination matrix
      this.modelViewMatrix, // matrix to translate
      [x, y, z]
    ); // amount to translate
  }

  public getMatrix() {
    return this.modelViewMatrix;
  }

  public getUniformName() {
    return "uModelViewMatrix";
  }
}
