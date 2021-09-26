import { ModelViewMatrix } from "../matrices/ModelViewMatrix";
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
  moveSpeed: number; // change per frame in
  rotateSpeed: number; // change per frame in
  actionQueue: CAMERA_ACTION[];
  gl: WebGL2RenderingContext;
  shaderProgram: ShaderProgram;

  constructor(
    initMoveSpeed: number,
    initRotateSpeed: number,
    startX: number,
    startY: number,
    startZ: number
  ) {
    this.modelViewMatrix = new ModelViewMatrix();
    this.modelViewMatrix.set(startX, startY, startZ);
    this.setSpeed(initMoveSpeed, initRotateSpeed);
  }

  init(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram) {
    this.gl = gl;
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
