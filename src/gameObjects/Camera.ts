import { ModelViewMatrix } from "../matrices/ModelViewMatrix";
import { ProjectionMatrix } from "../matrices/ProjectionMatrix";
import { ShaderProgram } from "../shaders/ShaderProgram";

export enum CAMERA_ACTION {
  ROTATE_RIGHT,
  ROTATE_LEFT,
  MOVE_UP,
  MOVE_DOWN,
  MOVE_LEFT,
  MOVE_RIGHT,
  MOVE_FORWARD,
  MOVE_BACKWARD,
}

export class Camera {
  modelViewMatrix: ModelViewMatrix;
  projectionMatrix: ProjectionMatrix;
  moveSpeed: number; // change per frame in
  rotateSpeed: number; // change per frame in
  actionQueue: CAMERA_ACTION[];
  shaderProgram: ShaderProgram;

  constructor(
    initMoveSpeed: number,
    initRotateSpeed: number,
    perspective: boolean,
    startX: number,
    startY: number,
    startZ: number
  ) {
    this.modelViewMatrix = new ModelViewMatrix();
    this.modelViewMatrix.set(startX, startY, startZ);
    this.projectionMatrix = new ProjectionMatrix(
      window.innerWidth,
      window.innerHeight,
      perspective,
      {}
    );
    this.setSpeed(initMoveSpeed, initRotateSpeed);
  }

  init(shaderProgram: ShaderProgram) {
    this.shaderProgram = shaderProgram;
    this.actionQueue = [];
  }

  rotateHorizontal(right: boolean) {
    this.actionQueue.push(
      right ? CAMERA_ACTION.ROTATE_RIGHT : CAMERA_ACTION.ROTATE_LEFT
    );
  }

  moveVertical(up: boolean) {
    this.actionQueue.push(up ? CAMERA_ACTION.MOVE_UP : CAMERA_ACTION.MOVE_DOWN);
  }

  moveHorizontal(right: boolean) {
    this.actionQueue.push(
      right ? CAMERA_ACTION.MOVE_RIGHT : CAMERA_ACTION.MOVE_LEFT
    );
  }

  moveDeep(forward: boolean) {
    this.actionQueue.push(
      forward ? CAMERA_ACTION.MOVE_FORWARD : CAMERA_ACTION.MOVE_BACKWARD
    );
  }

  setSpeed(moveSpeed: number, rotateSpeed: number) {
    this.moveSpeed = moveSpeed;
    this.rotateSpeed = rotateSpeed;
  }

  setDimension(width: number, height: number) {
    const projectionMatrix = new ProjectionMatrix(width, height, true, {});
    this.shaderProgram.setUniformMatrix4fv(
      projectionMatrix.getUniformName(),
      projectionMatrix.getMatrix(),
      false
    );
  }

  beforeNextFrame() {
    let x = 0,
      y = 0,
      z = 0,
      deg = 0;
    while (this.actionQueue.length) {
      switch (this.actionQueue.pop()) {
        case CAMERA_ACTION.ROTATE_RIGHT:
          deg += this.rotateSpeed;
          break;
        case CAMERA_ACTION.ROTATE_LEFT:
          deg -= this.rotateSpeed;
          break;
        case CAMERA_ACTION.MOVE_UP:
          y -= this.moveSpeed;
          break;
        case CAMERA_ACTION.MOVE_DOWN:
          y += this.moveSpeed;
          break;
        case CAMERA_ACTION.MOVE_LEFT:
          x += this.moveSpeed;
          break;
        case CAMERA_ACTION.MOVE_RIGHT:
          x -= this.moveSpeed;
          break;
        case CAMERA_ACTION.MOVE_FORWARD:
          z += this.moveSpeed;
          break;
        case CAMERA_ACTION.MOVE_BACKWARD:
          z -= this.moveSpeed;
          break;
      }
    }
    this.modelViewMatrix.translate(x, y, z);
  }

  public onNextFrame() {
    this.shaderProgram.setUniformMatrix4fv(
      this.modelViewMatrix.getUniformName(),
      this.modelViewMatrix.getMatrix(),
      false
    );
  }
}
