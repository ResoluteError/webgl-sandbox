import { mat4, vec3 } from "gl-matrix";
import { IndexBuffer } from "../opengl/buffers/IndexBuffer";
import { VertexBuffer } from "../opengl/buffers/VertexBuffer";
import { VertexBufferLayout } from "../opengl/buffers/VertexBufferLayout";
import { ShaderProgram } from "../opengl/shaders/ShaderProgram";
import { TextureMapper } from "../opengl/textures/TextureMapper";
import { VertexArrayObject } from "../opengl/vertexArrayObject/VertexArrayObject";
import {
  CustomAnimation,
  ScaleAnimation,
  TranslateAnimation,
} from "./Animation";

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

  private trsMatrix: mat4;

  constructor(gl: WebGL2RenderingContext, shaderProgram: ShaderProgram) {
    this.gl = gl;
    this.vao = new VertexArrayObject(this.gl);
    this.vertexPositions = [];
    this.shaderProgram = shaderProgram;
    this.texIndex = 0;
    this.trsMatrix = mat4.create();
    this.animations = [];
  }

  public setVertexPositions(positions: [number, number][]): void {
    this.vertexPositionsBuffer = new VertexBuffer<[number, number]>(this.gl);
    this.vertexPositionsBuffer.addItems(positions);
    this.vertexPositionsBuffer.bufferData();
    this.vertexPositionBufferLayout = new VertexBufferLayout(
      this.gl,
      this.shaderProgram
    );
    this.vertexPositionBufferLayout.push(this.gl.FLOAT, 2, 2, 0, "a_position");
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

    this.texPositionBufferLayout = new VertexBufferLayout(
      this.gl,
      this.shaderProgram
    );
    this.texPositionBufferLayout.push(this.gl.FLOAT, 2, 2, 0, "u_texpos");
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
    this.shaderProgram.setUniformMatrix4fv("uModelMatrix", this.trsMatrix);
  }

  public getIndexBufferSize() {
    return this.index.length;
  }

  public translateBy(vector: vec3, durationMs?: number, delay?: number) {
    if (this.animations.find((anim) => anim.isBlocking())) {
      console.warn("Blocking animation in progress - translation cancelled!");
      return;
    }

    var additionalTranslationMatrx = mat4.create();
    if (durationMs) {
      window.setTimeout(() => {
        this.addAnimation(
          new TranslateAnimation(this.trsMatrix, vector, durationMs)
        );
      }, delay);
      return;
    }
    mat4.fromTranslation(additionalTranslationMatrx, vector);
    mat4.add(this.trsMatrix, this.trsMatrix, additionalTranslationMatrx);
  }

  public scaleBy(factor: number, durationMs?: number, delay?: number) {
    if (this.animations.find((anim) => anim.isBlocking())) {
      console.warn("Blocking animation in progress - scaling cancelled!");
      return;
    }

    if (durationMs) {
      if (this.animations.length != 0) {
        console.warn(
          "scaleBy is a blocking animation, other animations are currently in progress, scaling instantly"
        );
      } else {
        window.setTimeout(() => {
          this.addAnimation(
            new ScaleAnimation(this.trsMatrix, factor, durationMs)
          );
        }, delay);
        return;
      }
    }
    mat4.scale(
      this.trsMatrix,
      this.trsMatrix,
      vec3.fromValues(factor, factor, factor)
    );
  }

  public translateTo(vector: vec3) {
    mat4.fromTranslation(this.trsMatrix, vector);
  }

  public addAnimation(animation: CustomAnimation) {
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
