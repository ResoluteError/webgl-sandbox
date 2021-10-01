import {
  CustomAnimation,
  RotateAnimation,
  ScaleAnimation,
  TranslateAnimation,
} from "../animations/Animation";
import { num3 } from "../Object3D";
import { Transformable } from "./Transformable";

interface AnimatableI {
  animTranslateBy(vector: num3, durationMs: number, delay?: number): void;
  animRotateBy(
    rad: number,
    axis: num3,
    durationMs: number,
    delay?: number
  ): void;
  animScaleBy(factor: number, durationMs: number, delay?: number): void;
  scaleBy(factor: number): void; // Override for current scaling protection
}

export class Animatable extends Transformable implements AnimatableI {
  private animations: { [id: number]: CustomAnimation };
  private animationIds: number[];
  private animCounter: number;
  private scaleInProgress: boolean;

  constructor() {
    super();
    this.animations = {};
    this.animationIds = [];
    this.animCounter = 0;
  }

  public animTranslateBy(vector: num3, durationMs: number, delay?: number) {
    window.setTimeout(() => {
      this.addAnimation(
        new TranslateAnimation(
          this.animCounter,
          this.rotationAndtranslationMatrix,
          vector,
          durationMs,
          (id: number) => {
            this.animations[id] = null;
            this.animationIds.splice(
              this.animationIds.findIndex((animId) => animId === id),
              1
            );
          }
        )
      );
    }, delay);
  }

  public animRotateBy(
    rad: number,
    axis: num3,
    durationMs: number,
    delay?: number
  ) {
    window.setTimeout(() => {
      this.addAnimation(
        new RotateAnimation(
          this.animCounter,
          this.rotationAndtranslationMatrix,
          rad,
          axis,
          durationMs,
          (id: number) => {
            this.animations[id] = null;
            this.animationIds.splice(
              this.animationIds.findIndex((animId) => animId === id),
              1
            );
          }
        )
      );
    }, delay);
  }

  public animScaleBy(factor: number, durationMs: number, delay?: number) {
    if (this.scaleInProgress) {
      console.warn("Scaling animation in progress - scaling cancelled!");
      return;
    }
    this.scaleInProgress = true;
    window.setTimeout(() => {
      this.addAnimation(
        new ScaleAnimation(
          this.animCounter,
          this.scaleMatrix,
          factor,
          durationMs,
          (id: number) => {
            this.scaleInProgress = false;
            this.animations[id] = null;
            this.animationIds.splice(
              this.animationIds.findIndex((animId) => animId === id),
              1
            );
          }
        )
      );
    }, delay);
  }

  public scaleBy(factor: number) {
    if (this.scaleInProgress) {
      console.warn("Scaling animation in progress - scaling cancelled!");
      return;
    }
    super.scaleBy(factor);
  }

  protected preRender(..._args: any) {
    // do nothing atm
  }

  // Calculates animation increments
  public postRender(timestamp: number) {
    this.animationIds.forEach((animationId) => {
      if (this.animations[animationId])
        this.animations[animationId].animate(timestamp);
    });
  }

  private addAnimation(animation: CustomAnimation) {
    this.animations[this.animCounter] = animation;
    this.animationIds.push(this.animCounter);
    this.animCounter++;
  }
}
