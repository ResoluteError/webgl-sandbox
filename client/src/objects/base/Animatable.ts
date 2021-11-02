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
  private animations: CustomAnimation[] = [];
  private scaleInProgress: boolean;

  constructor() {
    super();
  }

  public animTranslateBy(vector: num3, durationMs: number, delay?: number) {
    window.setTimeout(() => {
      this.addAnimation(
        new TranslateAnimation(
          this.rotationAndtranslationMatrix,
          vector,
          durationMs,
          () => {}
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
          this.rotationAndtranslationMatrix,
          rad,
          axis,
          durationMs,
          () => {}
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
        new ScaleAnimation(this.scaleMatrix, factor, durationMs, () => {})
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
    () => {
      this.animations = this.animations.filter((anim) => !anim.isCompleted());
    };
    this.animations.forEach((anim) => anim.animate(timestamp));
  }

  private addAnimation(animation: CustomAnimation) {
    this.animations.push(animation);
  }
}
