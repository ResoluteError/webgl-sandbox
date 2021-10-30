import { VertexArrayObject } from "../vertexArrayObject/VertexArrayObject";
import { Object3D } from "../../objects/Object3D";
import { ShaderProgram } from "../shaders/ShaderProgram";
import { coloredVertexShaderSource } from "../../../resources/shaders/coloredVertexShader.source";
import { coloredFragmentShaderSource } from "../../../resources/shaders/coloredFragmentShader.source";
import { Camera } from "../../game/Camera";
import { Light } from "../../objects/Light";
import { mat3, mat4, vec3 } from "gl-matrix";
import { Asset3D } from "../../objects/Asset3D";
import { Debug } from "../../debug/Debugger";

export class Renderer {
  private gl: WebGL2RenderingContext;
  private assets: Asset3D[];
  private objects: Object3D[];
  // private vaos: VertexArrayObject[];
  private activeVao: VertexArrayObject;
  // private shaderPrograms: ShaderProgram[];
  private activeShaderProgram: ShaderProgram;
  // private cameras: Camera[];
  private activeCamera: Camera;
  private light: Light;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.objects = [];
    this.assets = [];
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
    this.light = new Light(
      gl,
      vec3.fromValues(3, 3, 5),
      1,
      vec3.fromValues(1, 1, 1)
    );
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

  public addAsset(asset: Asset3D): number {
    return this.assets.push(asset) - 1;
  }

  public removeAsset(id: number): void {
    this.assets[id] = null;
  }

  public addObject(obj: Object3D): number {
    return this.objects.push(obj) - 1;
  }

  public removeObject(id: number): void {
    this.objects[id] = null;
  }

  public preRender(timestamp: number) {
    this.objects.forEach((obj) => {
      obj.preRender(timestamp);
    });
    this.activeCamera.beforeNextFrame();
  }

  public render(timestamp: number) {
    if (!this.activeCamera)
      throw new Error("Camera is required for Renderer.render()");

    Debug.logFrame(timestamp);

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
    this.activeShaderProgram.setUniform3f(
      "u_LightPos",
      this.light.getPosition()
    );
    this.objects.forEach((obj) => this.renderObject(obj));
    this.assets.forEach((asset) => this.renderAsset(asset));
    Debug.render();
  }

  private renderObject(obj: Object3D, modelMatrix?: mat4, normMatrix?: mat3) {
    // console.log("Rendering: ", obj.getName());
    if (obj === null || !obj.getIsRenderable()) return;
    this.activeVao.bindObject(obj);
    this.activeShaderProgram.useProgram();
    this.activeShaderProgram.setUniformMatrix4fv(
      "uModelMatrix",
      modelMatrix || obj.getModelMatrix()
    );
    this.activeShaderProgram.setUniformMatrix3fv(
      "u_NormalMatrix",
      normMatrix || obj.getNormalMatrix()
    );
    if (obj.getImageTexture()) {
      // TODO: Support for multiple textures
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, obj.getImageTexture());
    }
    if (obj.getIndexBufferSize()) {
      this.gl.drawElements(
        this.gl.TRIANGLES,
        obj.getIndexBufferSize(),
        this.gl.UNSIGNED_INT,
        0
      );
    } else {
      this.gl.drawArrays(
        this.gl.TRIANGLES,
        0,
        obj.getBuffers().vertexPositionsBuffer.getSize()
      );
    }
  }

  private renderAsset(asset: Asset3D) {
    var normMatrix = asset.getNormalMatrix();
    var modelMatrix = asset.getModelMatrix();

    asset.getObjects().forEach((obj) => {
      this.renderObject(obj, modelMatrix, normMatrix);
    });
  }

  public postRender(timestamp: number) {
    this.objects.forEach((obj) => obj.postRender(timestamp));
    this.assets.forEach((asset) => asset.postRender(timestamp));
  }
}
