import { mat4, vec3 } from "gl-matrix";
import { FLOAT } from "../webgl/abstractions/Constants";
import { IndexBuffer } from "../webgl/buffers/IndexBuffer";
import { VertexBuffer } from "../webgl/buffers/VertexBuffer";
import { VertexBufferLayout } from "../webgl/buffers/VertexBufferLayout";
import { ShaderProgram } from "../webgl/shaders/ShaderProgram";
import { TextureMapper } from "../webgl/textures/TextureMapper";
import { VertexArrayObject } from "../webgl/vertexArrayObject/VertexArrayObject";
import {
  CustomAnimation,
  ScaleAnimation,
  TranslateAnimation,
} from "./animations/Animation";

export class Object2D {
  private gl: WebGL2RenderingContext;
  private shaderProgram: ShaderProgram;
  private vertexPositions: [number, number][];
  private vertexPositionsBuffer: VertexBuffer<[number, number]>;
  private vertexPositionBufferLayout: VertexBufferLayout;
  private index: number[];
  private indexBuffer: IndexBuffer;
  private texture: TextureMapper;
  private texPositionBuffer: VertexBuffer<[number, number]>;
  private texPositionBufferLayout: VertexBufferLayout;
  private vao: VertexArrayObject;
  private texIndex: number;

  private animations: CustomAnimation[];

  private rotationAndtranslationMatrix: mat4;
  private scaleMatrix: mat4;
  private scaleInProgress: boolean;

  constructor(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram) {
    this.gl = gl;
    this.vao = new VertexArrayObject(this.gl, shaderProgram);
    this.vertexPositions = [];
    this.shaderProgram = shaderProgram;
    this.texIndex = 0;
    this.rotationAndtranslationMatrix = mat4.create();
    this.scaleMatrix = mat4.create();
    this.animations = [];
  }

  public setVertexPositions(positions: [number, number][]): void {
    this.vertexPositionsBuffer = new VertexBuffer<[number, number]>(this.gl);
    this.vertexPositionsBuffer.addItems(positions);
    this.vertexPositionsBuffer.bufferData();
    this.vertexPositionBufferLayout = new VertexBufferLayout(this.gl);
    this.vertexPositionBufferLayout.push(FLOAT, 2, 2, 0, "a_position");
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
    texCoordsMapper?: [number, number][]
  ) {
    if (!texCoordsMapper) {
      if (!this.vertexPositions.length) {
        throw new Error(
          "Must specify vertexPositions before pushing texture without specific texCoordsMapper positions!"
        );
      }
      texCoordsMapper = TextureMapper.linear2DTexCoordInterpolation(
        this.vertexPositions
      );
    }

    this.texture = new TextureMapper(this.gl);
    await this.texture.createImageTexture(imagePath);
    this.texture.bind(this.texIndex);

    this.texPositionBuffer = new VertexBuffer(this.gl);
    this.texPositionBuffer.addItems(texCoordsMapper);
    this.texPositionBuffer.bufferData();

    this.texPositionBufferLayout = new VertexBufferLayout(this.gl);
    this.texPositionBufferLayout.push(FLOAT, 2, 2, 0, "u_texpos");
  }

  // TODO: let renderer handle this?
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
    this.shaderProgram.setUniformMatrix4fv(
      "uModelMatrix",
      this.getModelMatrix()
    );
  }

  public getIndexBufferSize() {
    return this.index.length;
  }

  public translateBy(vector: vec3, durationMs?: number, delay?: number) {
    var additionalTranslationMatrx = mat4.create();
    if (durationMs) {
      window.setTimeout(() => {
        this.addAnimation(
          new TranslateAnimation(
            this.rotationAndtranslationMatrix,
            vector,
            durationMs,
            () => {}
          )
        );
      }, delay);
      return;
    }
    mat4.fromTranslation(additionalTranslationMatrx, vector);
    mat4.add(
      this.rotationAndtranslationMatrix,
      this.rotationAndtranslationMatrix,
      additionalTranslationMatrx
    );
  }

  public scaleBy(factor: number, durationMs?: number, delay?: number) {
    if (this.scaleInProgress) {
      console.warn("Scaling animation in progress - scaling cancelled!");
      return;
    }

    if (durationMs) {
      this.scaleInProgress;
      window.setTimeout(() => {
        this.addAnimation(
          new ScaleAnimation(this.scaleMatrix, factor, durationMs, () => {})
        );
      }, delay);
      return;
    }
    mat4.scale(
      this.scaleMatrix,
      this.scaleMatrix,
      vec3.fromValues(factor, factor, factor)
    );
  }

  public translateTo(vector: vec3) {
    mat4.fromTranslation(this.rotationAndtranslationMatrix, vector);
  }

  public getIsRenderable() {
    // TODO
    return true;
  }

  public getModelMatrix() {
    return mat4.mul(
      mat4.create(),
      this.scaleMatrix,
      this.rotationAndtranslationMatrix
    );
  }

  public addAnimation(animation: CustomAnimation) {
    this.animations.push(animation);
  }

  public postRender(_timestamp: number) {
    this.animations = this.animations.filter((anim) => !anim.isCompleted());
  }
}
