import { FLOAT } from "../webgl/abstractions/Constants";
import { IndexBuffer } from "../webgl/buffers/IndexBuffer";
import { VertexBuffer } from "../webgl/buffers/VertexBuffer";
import { VertexBufferLayout } from "../webgl/buffers/VertexBufferLayout";
import { imageFromBuffer } from "../utils/Image";
import { Animatable } from "./base/Animatable";

export class Object3D extends Animatable {
  private gl: WebGL2RenderingContext;

  private name: string;
  private isTextured: boolean;

  private vertexPositionsBuffer: VertexBuffer<num3>;
  private vertexNormalsBuffer: VertexBuffer<num3>;
  private vertexColorsBuffer: VertexBuffer<num4>;
  private vertexTexturePositionsBuffer: VertexBuffer<num2>;
  private indexBuffer: IndexBuffer;

  private texture: WebGLTexture;

  private vertexPositionBufferLayout: VertexBufferLayout;
  private vertexTexturePositionsBufferLayout: VertexBufferLayout;
  private vertexNormalsBufferLayout: VertexBufferLayout;
  private vertexColorsBufferLayout: VertexBufferLayout;

  private hasTextureLoaded: boolean;
  private hasMeshLoaded: boolean;

  constructor(gl: WebGL2RenderingContext, name: string, isTextured: boolean) {
    super();
    this.name = name;
    this.gl = gl;
    this.vertexPositionsBuffer = new VertexBuffer<num3>(gl);
    this.vertexTexturePositionsBuffer = new VertexBuffer<num2>(gl);
    this.vertexNormalsBuffer = new VertexBuffer<num3>(gl);
    this.vertexColorsBuffer = new VertexBuffer<num4>(gl);
    this.indexBuffer = new IndexBuffer(gl);
    this.hasTextureLoaded = false;
    this.hasMeshLoaded = false;
    this.isTextured = isTextured;
  }

  public setVertexPositions(positions: num3[]) {
    this.vertexPositionsBuffer.setItems(positions);
    this.vertexPositionsBuffer.bufferData();
  }

  public setIndeces(indeces: number[]) {
    this.indexBuffer.setItems(indeces);
    this.indexBuffer.bufferData();
  }

  public setNormals(normals: num3[]) {
    this.vertexNormalsBuffer.setItems(normals);
    this.vertexNormalsBuffer.bufferData();
  }

  public setVertexColors(colors: num4[]) {
    this.vertexColorsBuffer.setItems(colors);
    this.vertexColorsBuffer.bufferData();
  }

  public setVertexTexturePositions(texturePositions: num2[]) {
    this.vertexTexturePositionsBuffer.setItems(texturePositions);
    this.vertexTexturePositionsBuffer.bufferData();
  }

  private createVertexPositionBufferLayout() {
    this.vertexPositionBufferLayout = new VertexBufferLayout(this.gl);
    this.vertexPositionBufferLayout.push(FLOAT, 3, 3, 0, "a_position");
  }

  private createVertexNormalsBufferLayout() {
    this.vertexNormalsBufferLayout = new VertexBufferLayout(this.gl);
    this.vertexNormalsBufferLayout.push(FLOAT, 3, 3, 0, "a_normal");
  }

  private createVertexColorsBufferLayout() {
    this.vertexColorsBufferLayout = new VertexBufferLayout(this.gl);
    this.vertexColorsBufferLayout.push(FLOAT, 4, 4, 0, "a_color");
  }

  private createVertexTexturePositionsBufferLayout() {
    this.vertexTexturePositionsBufferLayout = new VertexBufferLayout(this.gl);
    this.vertexTexturePositionsBufferLayout.push(FLOAT, 2, 2, 0, "u_texpos");
  }

  public getName() {
    return this.name;
  }

  public create(
    positions: num3[],
    normals: num3[] | null,
    colors?: num4[],
    indeces?: number[]
  ) {
    this.setVertexPositions(positions);
    this.createVertexPositionBufferLayout();
    if (indeces) {
      this.setIndeces(indeces);
    }
    if (normals) {
      this.setNormals(normals);
      this.createVertexNormalsBufferLayout();
    }
    if (!colors) {
      colors = normals.map((norm) =>
        norm[2] > 0 ? [1.0, 0, 0, 1] : [0.0, 0, 1.0, 1.0]
      );
    }
    if (colors) {
      this.setVertexColors(colors);
      this.createVertexColorsBufferLayout();
    }
    this.hasMeshLoaded = true;
  }

  public setTexture(textureImage: Buffer, texPos: num2[]) {
    this.texture = this.gl.createTexture();
    imageFromBuffer(textureImage).then((img) => {
      this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
      this.gl.texImage2D(
        this.gl.TEXTURE_2D,
        0,
        this.gl.RGBA8,
        img.width,
        img.height,
        0,
        this.gl.RGBA,
        this.gl.UNSIGNED_BYTE,
        img
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MAG_FILTER,
        this.gl.LINEAR
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_MIN_FILTER,
        this.gl.LINEAR
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_S,
        this.gl.CLAMP_TO_EDGE
      );
      this.gl.texParameteri(
        this.gl.TEXTURE_2D,
        this.gl.TEXTURE_WRAP_T,
        this.gl.CLAMP_TO_EDGE
      );
      this.setVertexTexturePositions(texPos);
      this.createVertexTexturePositionsBufferLayout();
      this.hasTextureLoaded = true;
    });
  }

  public getIsRenderable() {
    return this.hasMeshLoaded && this.isTextured == this.hasTextureLoaded;
  }

  public getImageTexture() {
    return this.texture;
  }

  public getBuffers() {
    return {
      vertexPositionsBuffer: this.vertexPositionsBuffer,
      vertexNormalsBuffer: this.vertexNormalsBuffer,
      indexBuffer: this.indexBuffer,
      vertexColorsBuffer: this.vertexColorsBuffer,
      vertexTexturePositionsBuffer: this.vertexTexturePositionsBuffer,
    };
  }

  public getBufferLayouts() {
    return {
      vertexPositionBufferLayout: this.vertexPositionBufferLayout,
      vertexNormalsBufferLayout: this.vertexNormalsBufferLayout,
      vertexColorsBufferLayout: this.vertexColorsBufferLayout,
      vertexTexturePositionsBufferLayout:
        this.vertexTexturePositionsBufferLayout,
    };
  }

  public getIndexBufferSize() {
    return this.indexBuffer.getSize();
  }

  public preRender(_timestamp: number) {
    super.preRender();
  }

  public postRender(timestamp: number) {
    super.postRender(timestamp);
  }
}

export type num4 = [number, number, number, number];
export type num3 = [number, number, number];
export type num2 = [number, number];
