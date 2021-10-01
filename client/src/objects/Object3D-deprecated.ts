import { mat4, vec3 } from "gl-matrix";
import { FLOAT } from "../opengl/abstractions/Constants";
import { IndexBuffer } from "../opengl/buffers/IndexBuffer";
import { VertexBuffer } from "../opengl/buffers/VertexBuffer";
import { VertexBufferLayout } from "../opengl/buffers/VertexBufferLayout";
import { ShaderProgram } from "../opengl/shaders/ShaderProgram";
import { TextureMapper } from "../opengl/textures/TextureMapper";
import { VertexArrayObject } from "../opengl/vertexArrayObject/VertexArrayObject";
import {
  CustomAnimation,
  RotateAnimation,
  ScaleAnimation,
  TranslateAnimation,
} from "./animations/Animation";
import { num2, num3 } from "./Object3D";

export class Object3dDeprecated {
  private gl: WebGL2RenderingContext;
  private shaderProgram: ShaderProgram;
  private vertexPositions: [number, number, number][];
  private vertexColorsBuffer: VertexBuffer<[number, number, number, number]>;
  private vertexColorsBufferLayout: VertexBufferLayout;
  private vertexPositionsBuffer: VertexBuffer<[number, number, number]>;
  private vertexPositionBufferLayout: VertexBufferLayout;
  private vertexNormalsBuffer: VertexBuffer<[number, number, number]>;
  private vertexNormalsBufferLayout: VertexBufferLayout;
  private index: number[];
  private normals: vec3[];
  private indexBuffer: IndexBuffer;
  private texture: TextureMapper;
  private texPositionBuffer: VertexBuffer<[number, number, number]>;
  private texPositionBufferLayout: VertexBufferLayout;
  private vao: VertexArrayObject;
  private texIndex: number;

  private animations: { [id: number]: CustomAnimation };
  private animationIds: number[];
  private animCounter: number;

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
    this.animations = {};
    this.animationIds = [];
    this.animCounter = 0;
    this.normals = [];
  }

  public setVertexPositions(positions: [number, number, number][]): void {
    this.vertexPositionsBuffer = new VertexBuffer<[number, number, number]>(
      this.gl
    );
    this.vertexPositionsBuffer.addItems(positions);
    this.vertexPositionsBuffer.bufferData();
    this.vertexPositionBufferLayout = new VertexBufferLayout(this.gl);
    this.vertexPositionBufferLayout.push(FLOAT, 3, 3, 0, "a_position");
    this.vertexPositions = positions;
  }

  // skipped
  public setVertexColors(rgba: [number, number, number, number][]): void {
    this.vertexColorsBuffer = new VertexBuffer<
      [number, number, number, number]
    >(this.gl);
    this.vertexColorsBuffer.addItems(rgba);
    this.vertexColorsBuffer.bufferData();
    this.vertexColorsBufferLayout = new VertexBufferLayout(this.gl);
    this.vertexColorsBufferLayout.push(FLOAT, 4, 4, 0, "a_color");
  }

  public setIndex(index: number[]) {
    this.indexBuffer = new IndexBuffer(this.gl);
    this.indexBuffer.addItems(index);
    this.indexBuffer.bufferData();
    this.index = index;
  }

  public setNormals(normals: [number, number, number][]) {
    this.vertexNormalsBuffer = new VertexBuffer<[number, number, number]>(
      this.gl
    );
    this.vertexNormalsBuffer.addItems(normals);
    this.vertexNormalsBuffer.bufferData();
    this.vertexNormalsBufferLayout = new VertexBufferLayout(this.gl);
    this.vertexNormalsBufferLayout.push(FLOAT, 3, 3, 0, "a_normal");
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
    this.vao.addBuffer(
      this.vertexNormalsBuffer,
      this.vertexNormalsBufferLayout
    );
    if (this.texture) {
      this.texture.bind(this.texIndex);
      this.vao.addBuffer(this.texPositionBuffer, this.texPositionBufferLayout);
      this.shaderProgram.setUniform1i("u_Texture", this.texIndex);
    }
    if (this.vertexColorsBuffer) {
      this.vao.addBuffer(
        this.vertexColorsBuffer,
        this.vertexColorsBufferLayout
      );
    }
    this.indexBuffer.bind();
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
            this.animCounter,
            this.rotationAndtranslationMatrix,
            vector,
            durationMs,
            (id: number) => {
              this.animations[id] = null;
              this.animationIds.splice(
                this.animationIds.findIndex((animId) => animId === id),
                1
              );
            }
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

  public rotateBy(
    rad: number,
    axis: vec3,
    durationMs?: number,
    delay?: number
  ) {
    if (durationMs) {
      window.setTimeout(() => {
        this.addAnimation(
          new RotateAnimation(
            this.animCounter,
            this.rotationAndtranslationMatrix,
            rad,
            axis,
            durationMs,
            (id: number) => {
              this.animations[id] = null;
              this.animationIds.splice(
                this.animationIds.findIndex((animId) => animId === id),
                1
              );
            }
          )
        );
      }, delay);
      return;
    }
    mat4.rotate(
      this.rotationAndtranslationMatrix,
      this.rotationAndtranslationMatrix,
      rad,
      axis
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
          new ScaleAnimation(
            this.animCounter,
            this.scaleMatrix,
            factor,
            durationMs,
            (id: number) => {
              this.scaleInProgress = false;
              this.animations[id] = null;
              this.animationIds.splice(
                this.animationIds.findIndex((animId) => animId === id),
                1
              );
            }
          )
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

  public getModelMatrix() {
    return mat4.mul(
      mat4.create(),
      this.scaleMatrix,
      this.rotationAndtranslationMatrix
    );
  }

  public addAnimation(animation: CustomAnimation) {
    this.animations[this.animCounter] = animation;
    this.animationIds.push(this.animCounter);
    this.animCounter++;
  }

  public doAfterRender(timestamp: number) {
    this.animationIds.forEach((animationId) => {
      if (this.animations[animationId])
        this.animations[animationId].animate(timestamp);
    });
  }
}

export type File = {
  relativePath: string; // usually relativePathToFile + filename + filetype
  fileName: string; // for something like "foo/bar.txt" -> "bar.txt"
  fileType: string; // for something like "bar.txt" -> .txt
  data: ObjData;
};

export type ObjData = {
  vertexPositions: num3[]; // (x,y,z)       | len: x
  vertexNormals: num3[]; // (~>x, ~>y, ~>z) | len: x
  vertexTexturePositions: num2[]; // (u,v)          | len: x
  positionIndex: number[];
};
