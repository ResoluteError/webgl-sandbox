import { mat3, mat4, vec3 } from "gl-matrix";
import { num3 } from "../Object3D";

export interface TransformableI {
  rotationAndtranslationMatrix: mat4;
  scaleMatrix: mat4;
  translateBy(vec: num3): void;
  scaleBy(factor: number): void;
  rotateBy(rad: number, axis: num3): void;
}

export class Transformable implements TransformableI {
  rotationAndtranslationMatrix: mat4;
  scaleMatrix: mat4;

  constructor() {
    this.rotationAndtranslationMatrix = mat4.create();
    this.scaleMatrix = mat4.create();
  }

  public translateBy(vector: num3): void {
    mat4.fromTranslation(mat4.create(), vector);
    mat4.add(
      this.rotationAndtranslationMatrix,
      this.rotationAndtranslationMatrix,
      mat4.fromTranslation(mat4.create(), vector)
    );
  }

  public translateTo(vector: num3) {
    mat4.fromTranslation(
      this.rotationAndtranslationMatrix,
      vec3.fromValues(...vector)
    );
  }

  public rotateBy(rad: number, axis: num3): void {
    mat4.rotate(
      this.rotationAndtranslationMatrix,
      this.rotationAndtranslationMatrix,
      rad,
      vec3.fromValues(...axis)
    );
  }

  public scaleBy(factor: number): void {
    mat4.scale(
      this.scaleMatrix,
      this.scaleMatrix,
      vec3.fromValues(factor, factor, factor)
    );
  }

  public getModelMatrix(): mat4 {
    return mat4.mul(
      mat4.create(),
      this.scaleMatrix,
      this.rotationAndtranslationMatrix
    );
  }

  public getNormalMatrix(): mat3 {
    let modelMatrix = this.getModelMatrix();
    return mat3.normalFromMat4(mat3.create(), modelMatrix);
  }
}
