export class WindowManager {
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  fullViewport: boolean;
  width?: number;
  height?: number;
  shouldResize: boolean;

  constructor(
    canvas: HTMLCanvasElement,
    gl: WebGL2RenderingContext,
    fullViewport: boolean,
    width?: number,
    height?: number
  ) {
    if (!fullViewport && (!width || !height)) {
      throw new Error(
        "Window - if fullViewport is false, then width and height must be specified!"
      );
    }

    this.canvas = canvas;
    this.gl = gl;
    this.fullViewport = fullViewport;
    this.width = width;
    this.height = height;

    this.updateWindow();
  }

  updateWindow() {
    this.canvas.setAttribute("height", `${this.getHeight()}`);
    this.canvas.setAttribute("width", `${this.getWidth()}`);
    this.gl.viewport(0, 0, this.getWidth(), this.getHeight());
    this.shouldResize = false;
  }

  doResize(cameraCallback: (width: number, height: number) => void) {
    if (this.shouldResize) {
      this.updateWindow();
      cameraCallback(this.getWidth(), this.getHeight());
    }
  }

  public getWidth(): number {
    return this.fullViewport ? window.innerWidth : this.width;
  }

  public getHeight() {
    return this.fullViewport ? window.innerHeight : this.height;
  }

  queueResize() {
    this.shouldResize = true;
  }
}
