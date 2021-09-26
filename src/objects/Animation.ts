import { mat4, vec3 } from "gl-matrix";

export interface CustomAnimation {
  animate(timestamp: number, cb: CallableFunction): void;
  isBlocking(): boolean;
}

export class TranslateAnimation implements CustomAnimation {
  startFrameTimestamp: number;
  prevFrameTimestamp: number;
  endFrameTimestamp: number;
  durationMs: number;
  modelMatrix: mat4;
  vector: vec3;
  active: boolean;

  constructor(modelMatrix: mat4, vector: vec3, durationMs: number) {
    this.vector = vector;
    this.durationMs = durationMs;
    this.active = false;
    this.modelMatrix = modelMatrix;
  }

  animate(timestamp: number, cb: CallableFunction) {
    if (!this.active) {
      this.active = true;
      this.prevFrameTimestamp = timestamp;
      this.endFrameTimestamp = timestamp + this.durationMs;
      this.startFrameTimestamp = timestamp;
    }
    const progressSinceLastFrame =
      (Math.min(timestamp, this.endFrameTimestamp) - this.prevFrameTimestamp) /
      this.durationMs;

    mat4.translate(
      this.modelMatrix,
      this.modelMatrix,
      vec3.fromValues(
        this.vector[0] * progressSinceLastFrame,
        this.vector[1] * progressSinceLastFrame,
        this.vector[2] * progressSinceLastFrame
      )
    );

    this.prevFrameTimestamp = timestamp;
    if (timestamp > this.endFrameTimestamp) {
      cb();
      return;
    }
  }

  isBlocking() {
    return false;
  }
}

/**
 * The issue with scaling is that it is not linear if using the trs matrix recursively,
 * resulting in exponential growth depending on the FPS. However, if we don't recursively
 * update the trs matrix, then multiple effects cannot layer over each other...
 */
export class ScaleAnimation implements CustomAnimation {
  startFrameTimestamp: number;
  prevFrameTimestamp: number;
  endFrameTimestamp: number;
  baseTrsMatrix: mat4;
  durationMs: number;
  modelMatrix: mat4;
  factor: number;
  active: boolean;

  constructor(modelMatrix: mat4, factor: number, durationMs: number) {
    this.factor = factor - 1;
    this.durationMs = durationMs;
    this.active = false;
    this.modelMatrix = modelMatrix;
    this.baseTrsMatrix = mat4.create();
    mat4.copy(this.baseTrsMatrix, this.modelMatrix);
  }

  animate(timestamp: number, cb: CallableFunction) {
    if (!this.active) {
      this.active = true;
      this.endFrameTimestamp = timestamp + this.durationMs;
      this.startFrameTimestamp = timestamp;
    }
    const progressSinceStart =
      (Math.min(timestamp, this.endFrameTimestamp) - this.startFrameTimestamp) /
      this.durationMs;

    // ToDo: This is actually wrong, as scaling is exponential here over time
    var factor = 1 + this.factor * progressSinceStart;

    mat4.scale(
      this.modelMatrix,
      this.baseTrsMatrix,
      vec3.fromValues(factor, factor, factor)
    );

    if (timestamp > this.endFrameTimestamp) {
      cb();
      return;
    }
  }
  isBlocking() {
    return true;
  }
}
