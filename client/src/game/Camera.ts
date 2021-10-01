import { ViewMatrix } from "../opengl/matrices/ViewMatrix";
import { ProjectionMatrix } from "../opengl/matrices/ProjectionMatrix";

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
  private viewMatrix: ViewMatrix;
  private projectionMatrix: ProjectionMatrix;
  private moveSpeed: number; // change per frame in
  private rotateSpeed: number; // change per frame in
  private actionQueue: CAMERA_ACTION[];

  constructor(
    initMoveSpeed: number,
    initRotateSpeed: number,
    perspective: boolean,
    startX: number,
    startY: number,
    startZ: number
  ) {
    this.viewMatrix = new ViewMatrix();
    this.viewMatrix.set(startX, startY, startZ);
    this.projectionMatrix = new ProjectionMatrix(
      window.innerWidth,
      window.innerHeight,
      perspective,
      {}
    );
    this.setSpeed(initMoveSpeed, initRotateSpeed);
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
    this.projectionMatrix = new ProjectionMatrix(width, height, true, {});
  }

  getMatrices() {
    return {
      projectionMatrix: this.projectionMatrix,
      viewMatrix: this.viewMatrix,
    };
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
    this.viewMatrix.translate(x, y, z);
  }
}
