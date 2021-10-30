export class FrameLogger {
  private framesToKeep: number = 60;
  private frames: number[] = [];

  constructor(framesToKeep: number) {
    this.framesToKeep = framesToKeep;
  }

  logFrame(timestamp: number): void {
    this.frames.push(timestamp);
    while (this.frames.length > this.framesToKeep) {
      this.frames.shift();
    }
  }

  getCurrentFps(): number {
    if (this.frames.length) {
      return Math.round(
        1000 /
          ((this.frames[this.frames.length - 1] - this.frames[0]) /
            this.frames.length)
      );
    } else {
      return -1;
    }
  }
}
