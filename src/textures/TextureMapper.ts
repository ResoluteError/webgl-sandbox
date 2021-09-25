export class TextureMapper {
  private gl: WebGL2RenderingContext;
  private texture: WebGLTexture;
  private image: HTMLImageElement;

  constructor(gl: WebGL2RenderingContext) {
    this.gl = gl;
    this.texture = this.gl.createTexture();
    this.image = new Image();
  }

  public async createImageTexture(imagePath: string): Promise<void> {
    return new Promise((res) => {
      this.image.src = imagePath;
      this.image.onload = () => {
        this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
        this.gl.texImage2D(
          this.gl.TEXTURE_2D,
          0,
          this.gl.RGBA8,
          this.image.width,
          this.image.height,
          0,
          this.gl.RGBA,
          this.gl.UNSIGNED_BYTE,
          this.image
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
        res(null);
      };
    });
  }

  public bind(textureSlotOffset: number): void {
    this.gl.activeTexture(this.gl.TEXTURE0 + textureSlotOffset);
    this.gl.bindTexture(this.gl.TEXTURE_2D, this.texture);
  }

  public unbind(): void {
    this.gl.bindTexture(this.gl.TEXTURE_2D, null);
  }

  public static linear2DTexCoordInterpolation(
    vertexCoords: [number, number][]
  ): [number, number][] {
    let minX: number, minY: number, maxX: number, maxY: number;

    vertexCoords.forEach(([x, y]) => {
      if (minX === undefined || x < minX) minX = x;
      if (maxX === undefined || x > maxX) maxX = x;
      if (minY === undefined || y < minY) minY = y;
      if (maxY === undefined || y > maxY) maxY = y;
    });

    const diffX = maxX - minX;
    const diffY = maxY - minY;

    return vertexCoords.map(([x, y]) => [
      (x - minX) / diffX,
      (y - minY) / diffY,
    ]);
  }
}
