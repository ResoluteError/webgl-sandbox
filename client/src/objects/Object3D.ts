import { FLOAT } from "../opengl/abstractions/Constants";
import { IndexBuffer } from "../opengl/buffers/IndexBuffer";
import { VertexBuffer } from "../opengl/buffers/VertexBuffer";
import { VertexBufferLayout } from "../opengl/buffers/VertexBufferLayout";
import { Animatable } from "./base/Animatable";

export class Object3D extends Animatable {
  private gl: WebGL2RenderingContext;

  private vertexPositionsBuffer: VertexBuffer<num3>;
  private vertexNormalsBuffer: VertexBuffer<num3>;
  private vertexColorsBuffer: VertexBuffer<num4>;
  private indexBuffer: IndexBuffer;

  private vertexPositionBufferLayout: VertexBufferLayout;
  private vertexNormalsBufferLayout: VertexBufferLayout;
  private vertexColorsBufferLayout: VertexBufferLayout;

  private isRenderable: boolean;

  constructor(gl: WebGL2RenderingContext) {
    super();
    this.gl = gl;
    this.vertexPositionsBuffer = new VertexBuffer<num3>(gl);
    this.vertexNormalsBuffer = new VertexBuffer<num3>(gl);
    this.vertexColorsBuffer = new VertexBuffer<num4>(gl);
    this.indexBuffer = new IndexBuffer(gl);
    this.isRenderable = false;
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
    console.log("Setting normals...");
    this.vertexNormalsBuffer.setItems(normals);
    this.vertexNormalsBuffer.bufferData();
  }

  public setVertexColors(colors: num4[]) {
    console.log("Setting colors...");
    this.vertexColorsBuffer.setItems(colors);
    this.vertexColorsBuffer.bufferData();
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

  public create(
    positions: num3[],
    normals: num3[],
    colors: num4[] | null,
    indeces: number[]
  ) {
    this.setVertexPositions(positions);
    this.setIndeces(indeces);
    this.setNormals(normals);
    this.createVertexNormalsBufferLayout();
    this.createVertexPositionBufferLayout();
    if (!colors) {
      colors = normals.map((norm) =>
        norm[2] > 0 ? [1.0, 0, 0, 1.0] : [0.0, 0, 1.0, 1.0]
      );
    }
    this.setVertexColors(colors);
    this.createVertexColorsBufferLayout();
    this.isRenderable = true;
  }

  public getIsRenderable() {
    return this.isRenderable;
  }

  public getBuffers() {
    return {
      vertexPositionsBuffer: this.vertexPositionsBuffer,
      vertexNormalsBuffer: this.vertexNormalsBuffer,
      indexBuffer: this.indexBuffer,
      vertexColorsBuffer: this.vertexColorsBuffer,
    };
  }

  public getBufferLayouts() {
    return {
      vertexPositionBufferLayout: this.vertexPositionBufferLayout,
      vertexNormalsBufferLayout: this.vertexNormalsBufferLayout,
      vertexColorsBufferLayout: this.vertexColorsBufferLayout,
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