import { Renderer } from "../opengl/renderer/Renderer";
import { ViewMatrix } from "../opengl/matrices/ViewMatrix";
import { KeyboardManager } from "./keyboard/KeyboardManager";
import { Camera } from "./Camera";
import { KEYBOARD_MAP } from "./keyboard/KeyboardMap";
import { WindowManager } from "./window/WindowManager";
import { Object3D } from "../objects/Object3D";
import { Asset3D } from "../objects/Asset3D";

export class GameLoop {
  maxFps: number;
  maxMSpF: number;
  previousFrameTimestamp: number;
  renderer: Renderer;
  canvas: HTMLCanvasElement;
  gl: WebGL2RenderingContext;
  viewMatrix: ViewMatrix;
  nextFrameTimerId: number;
  keyboardManager: KeyboardManager;
  windowManager: WindowManager;

  constructor(maxFps: number, canvas: HTMLCanvasElement) {
    this.gl = canvas.getContext("webgl2");
    this.maxFps = maxFps;
    this.maxMSpF = 1000 / maxFps;
    this.canvas = canvas;
    this.keyboardManager = new KeyboardManager();
    this.windowManager = new WindowManager(canvas, this.gl, true);
    window.onkeydown = (event) => this.keyboardManager.keyDown(event);
    window.onkeyup = (event) => this.keyboardManager.keyUp(event);
    window.onresize = (_) => this.windowManager.queueResize();

    this.renderer = new Renderer(this.gl);
    this.renderer.setup(0, 0, 0, 1);
  }

  getGL() {
    return this.gl;
  }

  addAssetToScene(asset: Asset3D): number {
    return this.renderer.addAsset(asset);
  }

  removeObjectFromScene(id: number): void {
    return this.renderer.removeObject(id);
  }

  public addCamera(camera: Camera) {
    camera.setDimension(
      this.windowManager.getWidth(),
      this.windowManager.getHeight()
    );
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
    this.renderer.addCamera(camera);
  }

  async start() {
    this.nextFrame(Date.now());
    // using rAF seems to slow down the framerate during rapid mouse movement
    // window.requestAnimationFrame((timestamp) => this.nextFrame(timestamp));
  }

  nextFrame(timestamp: number) {
    const frameStartTime = Date.now();
    this.windowManager.doResize((width, height) =>
      this.renderer.updateViewport(width, height)
    );
    this.keyboardManager.executeActions();
    this.renderer.preRender(timestamp);
    this.renderer.clear();
    this.renderer.render(timestamp);
    this.renderer.postRender(timestamp + Date.now() - frameStartTime);
    const nextFrameWaitTime = this.maxMSpF - (Date.now() - frameStartTime);
    this.nextFrameTimerId = window.setTimeout(
      () => {
        this.nextFrame(Date.now());
        // using rAF seems to slow down the framerate during rapid mouse movement
        // window.requestAnimationFrame((timestamp) => this.nextFrame(timestamp));
      },
      nextFrameWaitTime > 0 ? nextFrameWaitTime : 0
    );
  }

  pause() {
    window.clearTimeout(this.nextFrameTimerId);
  }
}
