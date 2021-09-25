import { Renderer } from "../renderer/Renderer";
import { ShaderProgram } from "../shaders/ShaderProgram";
import { fragmentShaderSource } from "../../resources/shaders/fragmentShader.source";
import { vertexShaderSource } from "../../resources/shaders/vertexShader.source";
import { ModelViewMatrix } from "../matrices/ModelViewMatrix";
import { Object2D } from "../objects/Object2D";

export class GameLoop {
  maxFps: number;
  maxMSpF: number;
  previousFrameTimestamp: number;
  renderer: Renderer;
  canvas: HTMLCanvasElement;
  shaderProgram: ShaderProgram;
  gl: WebGL2RenderingContext;
  modelViewMatrix: ModelViewMatrix;
  nextFrameTimerId: number;
  objects: Object2D[];

  constructor(maxFps: number, canvas: HTMLCanvasElement) {
    this.maxFps = maxFps;
    this.maxMSpF = 1000 / maxFps;
    this.canvas = canvas;
    this.objects = [];

    this.gl = canvas.getContext("webgl2");

    this.shaderProgram = new ShaderProgram(this.gl);
    this.shaderProgram.addShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    this.shaderProgram.addShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.shaderProgram.link();

    this.renderer = new Renderer(this.gl);
    this.renderer.setup(0, 0, 0, 1);

    this.modelViewMatrix = new ModelViewMatrix();
    this.modelViewMatrix.set(0.0, 0.0, -5.0);
    this.shaderProgram.setUniformMatrix4fv(
      this.modelViewMatrix.getUniformName(),
      this.modelViewMatrix.getMatrix(),
      false
    );
  }

  // TODO: Refactor this
  getShaderProgram() {
    return this.shaderProgram;
  }

  // TODO: Refactor this
  getGL() {
    return this.gl;
  }

  setupCamera(x?: number, y?: number, z?: number) {
    this.modelViewMatrix.set(x ?? 0.0, y ?? 0.0, z ?? -5.0);

    this.shaderProgram.setUniformMatrix4fv(
      this.modelViewMatrix.getUniformName(),
      this.modelViewMatrix.getMatrix(),
      false
    );
  }

  addObjectToScene(obj: Object2D): number {
    return this.objects.push(obj) - 1;
  }

  removeObjectFromScene(id: number): void {
    this.objects.splice(id, 1);
  }

  async start() {
    window.requestAnimationFrame(this.nextFrame.bind(this));
  }

  nextFrame(timestamp: number) {
    const frameStartTime = Date.now();
    this.renderer.clear();
    this.renderer.updateWindowSize(
      window.innerWidth,
      window.innerHeight,
      this.canvas,
      this.shaderProgram
    );

    this.objects.forEach((obj) => {
      this.renderer.drawObject(obj);
      obj.doAfterRender(timestamp);
    });
    const nextFrameWaitTime = this.maxMSpF - (Date.now() - frameStartTime);
    this.nextFrameTimerId = window.setTimeout(
      () => {
        window.requestAnimationFrame(this.nextFrame.bind(this));
      },
      nextFrameWaitTime > 0 ? nextFrameWaitTime : 0
    );
  }

  pause() {
    window.clearTimeout(this.nextFrameTimerId);
  }
}
