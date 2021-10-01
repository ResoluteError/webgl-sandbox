import { VertexArrayObject } from "../vertexArrayObject/VertexArrayObject";
import { Object3D } from "../../objects/Object3D";
import { ShaderProgram } from "../shaders/ShaderProgram";
import { coloredVertexShaderSource } from "../../../resources/shaders/coloredVertexShader.source";
import { coloredFragmentShaderSource } from "../../../resources/shaders/coloredFragmentShader.source";
import { Camera } from "../../game/Camera";

export class Renderer {
  private gl: WebGL2RenderingContext;
  private objects: Object3D[];
  // private vaos: VertexArrayObject[];
  private activeVao: VertexArrayObject;
  // private shaderPrograms: ShaderProgram[];
  private activeShaderProgram: ShaderProgram;
  // private cameras: Camera[];
  private activeCamera: Camera;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.objects = [];
    // this.vaos = [];
    // this.cameras = [];
    // this.shaderPrograms = [];
    this.activeShaderProgram = new ShaderProgram(this.gl);
    this.activeShaderProgram.addShader(
      this.gl.VERTEX_SHADER,
      coloredVertexShaderSource
    );
    this.activeShaderProgram.addShader(
      this.gl.FRAGMENT_SHADER,
      coloredFragmentShaderSource
    );
    this.activeShaderProgram.link();
    this.activeShaderProgram.useProgram();
    this.activeVao = new VertexArrayObject(this.gl, this.activeShaderProgram);

    if (!gl) {
      throw new Error(
        "Unable to initialize WebGL. Your browser or machine may not support it."
      );
    }
  }

  public setup(r: number, g: number, b: number, alpha: number) {
    this.gl.clearColor(r, g, b, alpha);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
    this.gl.blendEquation(this.gl.FUNC_ADD);
    this.gl.depthFunc(this.gl.LEQUAL);
  }

  public clear() {
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
  }

  // public makeCameraActive(index: number) {
  //   this.activeCamera = this.cameras[index];
  // }

  public updateViewport(width: number, height: number) {
    // this.cameras.forEach((camera) => camera.setDimension(width, height));
    this.activeCamera.setDimension(width, height);
  }

  public addCamera(camera: Camera) {
    // this.cameras.push(camera);
    // if (!this.activeCamera) this.activeCamera = camera;
    this.activeCamera = camera;
  }

  public addObject(obj: Object3D): number {
    this.objects.push(obj);
    return this.objects.length - 1;
  }

  public removeObject(id: number): void {
    this.objects[id] = null;
  }

  public preRender(timestamp: number) {
    this.objects.forEach((obj, i) => {
      obj.preRender(timestamp);
    });
  }

  public render() {
    if (!this.activeCamera)
      throw new Error("Camera is required for Renderer.render()");

    const { projectionMatrix, viewMatrix } = this.activeCamera.getMatrices();
    this.activeShaderProgram.setUniformMatrix4fv(
      projectionMatrix.getUniformName(),
      projectionMatrix.getMatrix(),
      false
    );
    this.activeShaderProgram.setUniformMatrix4fv(
      viewMatrix.getUniformName(),
      viewMatrix.getMatrix(),
      false
    );
    this.objects.forEach((obj, i) => {
      if (obj === null || !obj.getIsRenderable()) return;
      if (!this.activeVao.getHasBoundBuffers()) {
        this.activeVao.bindObject(obj);
      }
      this.activeShaderProgram.useProgram();
      this.activeShaderProgram.setUniformMatrix4fv(
        "uModelMatrix",
        obj.getModelMatrix()
      );
      this.gl.drawElements(
        this.gl.TRIANGLES,
        obj.getIndexBufferSize(),
        this.gl.UNSIGNED_INT,
        0
      );
    });
  }

  public postRender(timestamp: number) {
    this.objects.forEach((obj) => obj.postRender(timestamp));
  }
}
