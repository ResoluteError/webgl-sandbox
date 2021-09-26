import { mat4, vec4 } from "gl-matrix";

export type ProjectionMatrixProps = Partial<{
  fieldOfView: number; // in radians
  aspect: number;
  zNear: number;
  zFar: number;
}>;

export class ProjectionMatrix {
  private fieldOfView: number;
  private aspect: number;
  private zNear: number;
  private zFar: number;
  private projectionMatrix: mat4;

  constructor(
    clientHeight: number,
    clientWidth: number,
    pesrpective: boolean,
    { fieldOfView, aspect, zNear, zFar }: ProjectionMatrixProps
  ) {
    this.projectionMatrix = mat4.create();
    this.zNear = zNear ?? 0.1;
    this.zFar = zFar ?? 100.0;

    if (pesrpective) {
      this.fieldOfView = fieldOfView ?? (90 * Math.PI) / 180;
      this.aspect = aspect ?? clientWidth / clientHeight;

      mat4.perspective(
        this.projectionMatrix,
        this.fieldOfView,
        this.aspect,
        this.zNear,
        this.zFar
      );
    } else {
      mat4.ortho(
        this.projectionMatrix,
        -(clientWidth / 200),
        clientWidth / 200,
        -(clientHeight / 200),
        clientHeight / 200,
        this.zNear,
        this.zFar
      );
    }
  }

  public getMatrix(): mat4 {
    return this.projectionMatrix;
  }

  public getUniformName() {
    return "uProjectionMatrix";
  }
}
