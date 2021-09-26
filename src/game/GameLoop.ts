import { Renderer } from "../opengl/renderer/Renderer";
import { ShaderProgram } from "../opengl/shaders/ShaderProgram";
import { fragmentShaderSource } from "../../resources/shaders/fragmentShader.source";
import { vertexShaderSource } from "../../resources/shaders/vertexShader.source";
import { ModelViewMatrix } from "../opengl/matrices/ModelViewMatrix";
import { Object2D } from "../objects/Object2D";
import { KeyboardManager } from "./keyboard/KeyboardManager";
import { Camera } from "./Camera";
import { KEYBOARD_MAP } from "./keyboard/KeyboardMap";
import { WindowManager } from "./window/WindowManager";

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
  keyboardManager: KeyboardManager;
  windowManager: WindowManager;
  camera: Camera;

  constructor(maxFps: number, canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext("webgl2");
    this.maxFps = maxFps;
    this.maxMSpF = 1000 / maxFps;
    this.canvas = canvas;
    this.objects = [];
    this.keyboardManager = new KeyboardManager();
    this.windowManager = new WindowManager(canvas, this.gl, true);
    window.onkeydown = (event) => this.keyboardManager.keyDown(event);
    window.onkeyup = (event) => this.keyboardManager.keyUp(event);
    window.onresize = (_) => this.windowManager.queueResize();

    this.shaderProgram = new ShaderProgram(this.gl);
    this.shaderProgram.addShader(this.gl.VERTEX_SHADER, vertexShaderSource);
    this.shaderProgram.addShader(this.gl.FRAGMENT_SHADER, fragmentShaderSource);
    this.shaderProgram.link();

    this.renderer = new Renderer(this.gl);
    this.renderer.setup(0, 0, 0, 1);
  }

  // TODO: Refactor this
  getShaderProgram() {
    return this.shaderProgram;
  }

  // TODO: Refactor this
  getGL() {
    return this.gl;
  }

  addObjectToScene(obj: Object2D): number {
    return this.objects.push(obj) - 1;
  }

  removeObjectFromScene(id: number): void {
    this.objects.splice(id, 1);
  }

  public addCamera(camera: Camera) {
    camera.init(this.shaderProgram);
    camera.setDimension(
      this.windowManager.getWidth(),
      this.windowManager.getHeight()
    );
    this.camera = camera;
    this.keyboardManager.pushAction(KEYBOARD_MAP["w"], () =>
      camera.moveVertical(true)
    );
    this.keyboardManager.pushAction(KEYBOARD_MAP["s"], () =>
      camera.moveVertical(false)
    );
    this.keyboardManager.pushAction(KEYBOARD_MAP["d"], () =>
      camera.moveHorizontal(true)
    );
    this.keyboardManager.pushAction(KEYBOARD_MAP["a"], () =>
      camera.moveHorizontal(false)
    );
    this.keyboardManager.pushAction(KEYBOARD_MAP["+"], () =>
      camera.moveDeep(true)
    );
    this.keyboardManager.pushAction(KEYBOARD_MAP["-"], () =>
      camera.moveDeep(false)
    );
  }

  async start() {
    if (!this.camera) {
      throw new Error(
        "Camera is required for GameLoop - call GameLoop#addCamera(camera : Camera)"
      );
    }
    window.requestAnimationFrame(this.nextFrame.bind(this));
  }

  nextFrame(timestamp: number) {
    const frameStartTime = Date.now();
    this.windowManager.doResize((width, height) =>
      this.camera.setDimension(width, height)
    );
    this.keyboardManager.executeActions();
    this.renderer.clear();
    this.camera.onNextFrame();
    this.objects.forEach((obj) => {
      this.renderer.drawObject(obj);
      obj.doAfterRender(timestamp);
    });
    this.camera.beforeNextFrame();
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
