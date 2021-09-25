import { VertexBuffer } from "../buffers/VertexBuffer";
import {
  get2DCenter,
  scale2DAroundKnownCenterProvider,
  translate2DProvider,
} from "../matrices/utils/2DUtils";

export interface CustomAnimation {
  animate(timestamp: number, cb: CallableFunction): void;
  init(...args: any[]): void;
}

export class ZoomAnimation implements CustomAnimation {
  durationMs: number;
  factor: number;
  totalFactorDiff: number;
  currenFactor: number;
  startTime: number;
  active: boolean;
  vertexPositionBuffer: VertexBuffer<[number, number]>;
  initialValues: [number, number][];
  objectCenter: [number, number];
  startCondition: number;

  constructor(durationMs: number, factor: number, startCondition: number) {
    this.durationMs = durationMs;
    this.factor = factor;
    this.currenFactor = 1;
    this.totalFactorDiff = factor - 1;
    this.startCondition = startCondition;
  }

  init(vertexPositionBuffer: VertexBuffer<[number, number]>) {
    this.vertexPositionBuffer = vertexPositionBuffer;
  }

  animate(timestamp: number, cb: CallableFunction) {
    if (!this.active) {
      if (timestamp > this.startCondition) {
        this.active = true;
        this.startTime = timestamp;
        this.startCondition = null;
        this.initialValues = this.vertexPositionBuffer.getItems();
        this.objectCenter = get2DCenter(this.initialValues);
      } else {
        return;
      }
    }
    const progressInAnimation = (timestamp - this.startTime) / this.durationMs;
    if (progressInAnimation >= 1) {
      this.active = false;
      this.vertexPositionBuffer.replaceItems(
        scale2DAroundKnownCenterProvider(
          this.factor,
          this.objectCenter
        )(this.initialValues)
      );
      cb();
      return;
    }
    const totalZoomForFrame = this.totalFactorDiff * progressInAnimation + 1;
    this.vertexPositionBuffer.replaceItems(
      scale2DAroundKnownCenterProvider(
        totalZoomForFrame,
        this.objectCenter
      )(this.initialValues)
    );
    this.vertexPositionBuffer.bufferData();
  }
}

export class TranslateAnimation implements CustomAnimation {
  durationMs: number;
  moveXTotal: number;
  moveYTotal: number;
  totalFactorDiff: number;
  currenFactor: number;
  startTime: number;
  active: boolean;
  vertexPositionBuffer: VertexBuffer<[number, number]>;
  initialValues: [number, number][];
  startCondition: number;

  constructor(
    durationMs: number,
    moveXTotal: number,
    moveYTotal: number,
    startCondition: number
  ) {
    this.durationMs = durationMs;
    this.moveXTotal = moveXTotal;
    this.moveYTotal = moveYTotal;
    this.startCondition = startCondition;
  }

  init(vertexPositionBuffer: VertexBuffer<[number, number]>) {
    this.vertexPositionBuffer = vertexPositionBuffer;
  }

  animate(timestamp: number, cb: CallableFunction) {
    if (!this.active) {
      if (timestamp > this.startCondition) {
        this.initialValues = this.vertexPositionBuffer.getItems();
        this.active = true;
        this.startTime = timestamp;
        this.startCondition = null;
      } else {
        return;
      }
    }
    const progressInAnimation = (timestamp - this.startTime) / this.durationMs;
    if (progressInAnimation >= 1) {
      this.active = false;
      this.vertexPositionBuffer.replaceItems(
        translate2DProvider(
          this.moveXTotal,
          this.moveYTotal
        )(this.initialValues)
      );
      cb();
      return;
    }
    this.vertexPositionBuffer.replaceItems(
      translate2DProvider(
        this.moveXTotal * progressInAnimation,
        this.moveYTotal * progressInAnimation
      )(this.initialValues)
    );
    this.vertexPositionBuffer.bufferData();
  }
}
