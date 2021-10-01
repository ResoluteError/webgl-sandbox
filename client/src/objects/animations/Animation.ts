import { mat4, vec3 } from "gl-matrix";

export interface CustomAnimation {
  animate(timestamp: number): void;
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
  translationTotal: vec3;
  id: number;
  completionCb?: (id: number) => void;

  constructor(
    id: number,
    modelMatrix: mat4,
    vector: vec3,
    durationMs: number,
    completionCb?: (id: number) => void
  ) {
    this.id = id;
    this.vector = vector;
    this.durationMs = durationMs;
    this.active = false;
    this.modelMatrix = modelMatrix;
    this.completionCb = completionCb;
    this.translationTotal = vec3.fromValues(0, 0, 0);
  }

  animate(timestamp: number) {
    if (!this.active) {
      this.active = true;
      this.prevFrameTimestamp = timestamp;
      this.endFrameTimestamp = timestamp + this.durationMs;
      this.startFrameTimestamp = timestamp;
    }

    const progressSinceLastFrame =
      (Math.min(timestamp, this.endFrameTimestamp) - this.prevFrameTimestamp) /
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

      if (this.completionCb) this.completionCb(this.id);
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

  isBlocking() {
    return false;
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
  active: boolean;
  completionCb?: (id: number) => void;
  id: number;

  constructor(
    id: number,
    scaleMatrix: mat4,
    factor: number,
    durationMs: number,
    completionCb?: (id: number) => void
  ) {
    this.factor = factor - 1;
    this.durationMs = durationMs;
    this.active = false;
    this.scaleMatrix = scaleMatrix;
    this.baseScaleMatrix = mat4.create();
    this.completionCb = completionCb;
    this.id = id;
    mat4.copy(this.baseScaleMatrix, this.scaleMatrix);
  }

  animate(timestamp: number) {
    if (!this.active) {
      this.active = true;
      this.endFrameTimestamp = timestamp + this.durationMs;
      this.startFrameTimestamp = timestamp;
    }
    const progressSinceStart =
      (Math.min(timestamp, this.endFrameTimestamp) - this.startFrameTimestamp) /
      this.durationMs;

    var factor = 1 + this.factor * progressSinceStart;

    mat4.scale(
      this.scaleMatrix,
      this.baseScaleMatrix,
      vec3.fromValues(factor, factor, factor)
    );

    if (timestamp > this.endFrameTimestamp) {
      if (this.completionCb) this.completionCb(this.id);
      return;
    }
  }
  isBlocking() {
    return true;
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
  active: boolean;
  id: number;
  rotateTotal: number;
  completionCb?: (id: number) => void;

  constructor(
    id: number,
    modelMatrix: mat4,
    rad: number,
    axis: vec3,
    durationMs: number,
    completionCb?: (id: number) => void
  ) {
    this.id = id;
    this.axis = axis;
    this.durationMs = durationMs;
    this.rad = rad;
    this.active = false;
    this.modelMatrix = modelMatrix;
    this.completionCb = completionCb;
    this.rotateTotal = 0;
  }

  animate(timestamp: number) {
    if (!this.active) {
      this.active = true;
      this.prevFrameTimestamp = timestamp;
      this.endFrameTimestamp = timestamp + this.durationMs;
      this.startFrameTimestamp = timestamp;
    }

    const progressSinceLastFrame =
      (Math.min(timestamp, this.endFrameTimestamp) - this.prevFrameTimestamp) /
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
      if (this.completionCb) this.completionCb(this.id);
      return;
    }

    let frameRotation = this.rad * progressSinceLastFrame;
    this.rotateTotal += frameRotation;

    mat4.rotate(this.modelMatrix, this.modelMatrix, frameRotation, this.axis);
  }

  isBlocking() {
    return false;
  }
}
