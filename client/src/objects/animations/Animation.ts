import { mat4, vec3 } from "gl-matrix";

export interface CustomAnimation {
  animate(timestamp: number): void;
  isBlocking(): boolean;
  isCompleted(): boolean;
}

export class TranslateAnimation implements CustomAnimation {
  startFrameTimestamp: number;
  prevFrameTimestamp: number;
  endFrameTimestamp: number;
  durationMs: number;
  modelMatrix: mat4;
  vector: vec3;
  hasStarted: boolean;
  hasCompleted: boolean;
  translationTotal: vec3;
  completionCb?: () => void;

  constructor(
    modelMatrix: mat4,
    vector: vec3,
    durationMs: number,
    completionCb?: () => void
  ) {
    this.vector = vector;
    this.durationMs = durationMs;
    this.hasStarted = false;
    this.hasCompleted = false;
    this.modelMatrix = modelMatrix;
    this.completionCb = completionCb;
    this.translationTotal = vec3.fromValues(0, 0, 0);
  }

  animate(timestamp: number) {
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.prevFrameTimestamp = timestamp;
      this.endFrameTimestamp = timestamp + this.durationMs;
      this.startFrameTimestamp = timestamp;
    }

    if (!this.hasCompleted) {
      const progressSinceLastFrame =
        (Math.min(timestamp, this.endFrameTimestamp) -
          this.prevFrameTimestamp) /
        this.durationMs;

      this.prevFrameTimestamp = timestamp;

      if (timestamp > this.endFrameTimestamp) {
        if (vec3.equals(this.translationTotal, this.vector)) {
          mat4.translate(
            this.modelMatrix,
            this.modelMatrix,
            vec3.subtract(vec3.create(), this.vector, this.translationTotal)
          );
        }
        this.hasCompleted = true;
        if (this.completionCb) this.completionCb();
        return;
      }

      let frameTranslation = vec3.fromValues(
        this.vector[0] * progressSinceLastFrame,
        this.vector[1] * progressSinceLastFrame,
        this.vector[2] * progressSinceLastFrame
      );
      vec3.add(this.translationTotal, this.translationTotal, frameTranslation);

      mat4.translate(this.modelMatrix, this.modelMatrix, frameTranslation);
    }
  }

  isBlocking() {
    return false;
  }

  isCompleted() {
    return this.hasCompleted;
  }
}

export class ScaleAnimation implements CustomAnimation {
  startFrameTimestamp: number;
  prevFrameTimestamp: number;
  endFrameTimestamp: number;
  baseScaleMatrix: mat4;
  durationMs: number;
  scaleMatrix: mat4;
  factor: number;
  hasStarted: boolean;
  hasCompleted: boolean;
  completionCb?: () => void;

  constructor(
    scaleMatrix: mat4,
    factor: number,
    durationMs: number,
    completionCb?: () => void
  ) {
    this.factor = factor - 1;
    this.durationMs = durationMs;
    this.hasStarted = false;
    this.hasCompleted = false;
    this.scaleMatrix = scaleMatrix;
    this.baseScaleMatrix = mat4.create();
    this.completionCb = completionCb;
    mat4.copy(this.baseScaleMatrix, this.scaleMatrix);
  }

  animate(timestamp: number) {
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.endFrameTimestamp = timestamp + this.durationMs;
      this.startFrameTimestamp = timestamp;
    }

    if (!this.hasCompleted) {
      const progressSinceStart =
        (Math.min(timestamp, this.endFrameTimestamp) -
          this.startFrameTimestamp) /
        this.durationMs;

      var factor = 1 + this.factor * progressSinceStart;

      mat4.scale(
        this.scaleMatrix,
        this.baseScaleMatrix,
        vec3.fromValues(factor, factor, factor)
      );

      if (timestamp > this.endFrameTimestamp) {
        this.hasCompleted = true;
        if (this.completionCb) this.completionCb();
        return;
      }
    }
  }
  isBlocking() {
    return true;
  }
  isCompleted() {
    return this.hasCompleted;
  }
}

export class RotateAnimation implements CustomAnimation {
  startFrameTimestamp: number;
  prevFrameTimestamp: number;
  endFrameTimestamp: number;
  durationMs: number;
  modelMatrix: mat4;
  axis: vec3;
  rad: number;
  hasStarted: boolean;
  hasCompleted: boolean;
  rotateTotal: number;
  completionCb?: () => void;

  constructor(
    modelMatrix: mat4,
    rad: number,
    axis: vec3,
    durationMs: number,
    completionCb?: () => void
  ) {
    this.axis = axis;
    this.durationMs = durationMs;
    this.rad = rad;
    this.hasStarted = false;
    this.hasCompleted = false;
    this.modelMatrix = modelMatrix;
    this.completionCb = completionCb;
    this.rotateTotal = 0;
  }

  animate(timestamp: number) {
    if (!this.hasStarted) {
      this.hasStarted = true;
      this.prevFrameTimestamp = timestamp;
      this.endFrameTimestamp = timestamp + this.durationMs;
      this.startFrameTimestamp = timestamp;
    }

    if (!this.hasCompleted) {
      const progressSinceLastFrame =
        (Math.min(timestamp, this.endFrameTimestamp) -
          this.prevFrameTimestamp) /
        this.durationMs;

      this.prevFrameTimestamp = timestamp;

      if (
        timestamp > this.endFrameTimestamp ||
        this.rotateTotal > Math.abs(this.rad)
      ) {
        if (this.rotateTotal !== this.rad) {
          mat4.rotate(
            this.modelMatrix,
            this.modelMatrix,
            this.rad - this.rotateTotal,
            this.axis
          );
        }
        this.hasCompleted = true;
        if (this.completionCb) this.completionCb();
        return;
      }

      let frameRotation = this.rad * progressSinceLastFrame;
      this.rotateTotal += frameRotation;

      mat4.rotate(this.modelMatrix, this.modelMatrix, frameRotation, this.axis);
    }
  }

  isBlocking() {
    return false;
  }
  isCompleted() {
    return this.hasCompleted;
  }
}
