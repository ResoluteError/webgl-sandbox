import { IndexBuffer } from "../buffers/IndexBuffer";
import { VertexBuffer } from "../buffers/VertexBuffer";
import { VertexBufferLayout } from "../buffers/VertexBufferLayout";
import {
  scale3DAroundCenterProvider,
  translate3DProvider,
} from "../matrices/utils/3DUtils";
import { ShaderProgram } from "../shaders/ShaderProgram";
import { TextureMapper } from "../textures/TextureMapper";
import { VertexArrayObject } from "../vertexArrayObject/VertexArrayObject";
import { CustomAnimation } from "./Animation";

export class Object2D {
  private gl: WebGL2RenderingContext;
  private shaderProgram: ShaderProgram;
  private vertexPositions: [number, number, number][];
  private vertexPositionsBuffer: VertexBuffer<[number, number, number]>;
  private vertexPositionBufferLayout: VertexBufferLayout;
  private index: number[];
  private indexBuffer: IndexBuffer;
  private texture: TextureMapper;
  private texPositionBuffer: VertexBuffer<[number, number, number]>;
  private texPositionBufferLayout: VertexBufferLayout;
  private vao: VertexArrayObject;
  private texIndex: number;
  private animations: CustomAnimation[];

  constructor(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram) {
    this.gl = gl;
    this.vao = new VertexArrayObject(this.gl);
    this.vertexPositions = [];
    this.shaderProgram = shaderProgram;
    this.texIndex = 0;
    this.animations = [];
  }

  public setVertexPositions(positions: [number, number, number][]): void {
    this.vertexPositionsBuffer = new VertexBuffer<[number, number, number]>(
      this.gl
    );
    this.vertexPositionsBuffer.addItems(positions);
    this.vertexPositionsBuffer.bufferData();
    this.vertexPositionBufferLayout = new VertexBufferLayout(
      this.gl,
      this.shaderProgram
    );
    this.vertexPositionBufferLayout.push(this.gl.FLOAT, 3, 3, 0, "a_position");
    this.vertexPositions = positions;
  }

  public setIndex(index: number[]) {
    this.indexBuffer = new IndexBuffer(this.gl);
    this.indexBuffer.addItems(index);
    this.indexBuffer.bufferData();
    this.index = index;
  }

  public async setImageTexture(
    imagePath: string,
    texCoordsMapper?: [number, number, number][]
  ) {
    this.texture = new TextureMapper(this.gl);
    await this.texture.createImageTexture(imagePath);
    this.texture.bind(this.texIndex);

    this.texPositionBuffer = new VertexBuffer(this.gl);
    this.texPositionBuffer.addItems(texCoordsMapper);
    this.texPositionBuffer.bufferData();

    this.texPositionBufferLayout = new VertexBufferLayout(
      this.gl,
      this.shaderProgram
    );
    this.texPositionBufferLayout.push(this.gl.FLOAT, 2, 2, 0, "u_texpos");
  }

  public bind() {
    this.vao.bind();
    this.vao.addBuffer(
      this.vertexPositionsBuffer,
      this.vertexPositionBufferLayout
    );
    this.texture.bind(this.texIndex);
    this.vao.addBuffer(this.texPositionBuffer, this.texPositionBufferLayout);
    this.indexBuffer.bind();
    this.shaderProgram.setUniform1i("u_Texture", this.texIndex);
  }

  public getIndexBufferSize() {
    return this.index.length;
  }

  public scale(factor: number) {
    this.vertexPositions = scale3DAroundCenterProvider(factor)(
      this.vertexPositions
    );
    this.vertexPositionsBuffer.replaceItems(this.vertexPositions);
    this.vertexPositionsBuffer.bufferData();
  }

  public translate(x: number, y: number, z: number) {
    this.vertexPositions = translate3DProvider(x, y, z)(this.vertexPositions);
    this.vertexPositionsBuffer.replaceItems(this.vertexPositions);
    this.vertexPositionsBuffer.bufferData();
  }

  public addAnimation(animation: CustomAnimation) {
    animation.init(this.vertexPositionsBuffer);
    this.animations.push(animation);
  }

  public doAfterRender(timestamp: number) {
    this.animations.forEach((animation, index) => {
      if (animation)
        animation.animate(timestamp, () => {
          this.animations[index] = null;
        });
    });
  }
}