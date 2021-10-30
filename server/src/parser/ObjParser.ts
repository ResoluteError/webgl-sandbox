import { Obj } from "../../../contracts/models/ObjData.type";
import { File } from "../FileManager";
import { Map, num2, num3 } from "../utils/TypeUtils";

export type ObjFile = File & {
  data: Obj;
};

// TODO: Fix as it requires a new instantiotion for every parsing
// make functional instead
export class ObjParser {
  dataTypeMatcher: { [key: string]: (data: string[]) => void } = {
    "#": (_) => {},
    mtllib: (data) => this.getMaterialLibrary(data),
    v: (data) => this.getVertexPositions(data),
    vt: (data) => this.getVertexTexturePositions(data),
    vn: (data) => this.getVertexNormals(data),
    usemtl: (data) => this.getUsedMaterial(data),
    s: (data) => this.getSmoothShading(data),
    f: (data) => this.getTriangleIndeces(data),
    o: (data) => this.getObject(data),
  };

  private currentObject: string;
  private objects: string[] = [];
  private materialLibrary: string[] = [];
  private vertexPositions: Map<num3[]> = {};
  private vertexNormals: Map<num3[]> = {};
  private vertexTexturePositions: Map<num2[]> = {};
  private positionsIndex: Map<number[]> = {};
  private normalsIndex: Map<number[]> = {};
  private texturesIndex: Map<number[]> = {};
  private materials: Map<string[]> = {};
  private smoothShading: Map<boolean> = {};
  /**
   * obj files keep a running index across all vertex positions, texture positions and
   * normals respectively across all objects. The obj parser treats each obj individually,
   * therefore the index values are decreased by the offset of the previous objects
   */
  private indexOffsets: {
    positions: number;
    normals: number;
    textures: number;
  } = {
    positions: 0,
    normals: 0,
    textures: 0,
  };

  public parse(data: Buffer): Map<Obj> {
    const dataStr = data.toString("utf8");
    const dataLines = dataStr.split("\n");
    while (dataLines && dataLines.length) {
      const line = dataLines.shift();
      const [type, ...data] = line.split(" ");
      try {
        if (type && data) this.dataTypeMatcher[type](data);
      } catch (err) {
        console.warn("OBJ Parsing Error: ", err);
      }
    }
    this.objects.forEach((object) => this.expandVertexInfo(object));
    var result: Map<Obj> = {};
    this.objects.forEach(
      (obj) =>
        (result[obj] = {
          vertexNormals: this.vertexNormals[obj],
          vertexPositions: this.vertexPositions[obj],
          vertexTextureCoords: this.vertexTexturePositions[obj],
          materials: this.materials[obj],
        })
    );
    return result;
  }

  private getObject(data: string[]) {
    const previousObj = this.currentObject;
    this.currentObject = data[0];
    this.objects.push(this.currentObject);
    this.vertexPositions[this.currentObject] = [];
    this.vertexNormals[this.currentObject] = [];
    this.vertexTexturePositions[this.currentObject] = [];
    this.positionsIndex[this.currentObject] = [];
    this.normalsIndex[this.currentObject] = [];
    this.texturesIndex[this.currentObject] = [];
    this.materials[this.currentObject] = [];
    this.smoothShading[this.currentObject] = false;
    if (previousObj) {
      this.indexOffsets.normals += this.vertexNormals[previousObj].length;
      this.indexOffsets.positions += this.vertexPositions[previousObj].length;
      this.indexOffsets.textures +=
        this.vertexTexturePositions[previousObj].length;
    }
  }

  private getVertexPositions(data: string[]) {
    const [x, y, z] = data;
    this.vertexPositions[this.currentObject].push([+x, +y, +z]);
  }

  private getVertexNormals(data: string[]) {
    const [nx, ny, nz] = data;
    this.vertexNormals[this.currentObject].push([+nx, +ny, +nz]);
  }

  private getVertexTexturePositions(data: string[]) {
    const [tx, ty] = data;
    this.vertexTexturePositions[this.currentObject].push([+tx, +ty]);
  }

  private getTriangleIndeces(vertices: string[]) {
    if (vertices.length > 3) {
      console.error(
        `${this.currentObject} has non-triangulated surfaces! Aborting Parsing!`
      );
      throw new Error(`{this.currentObject} has non-triangulated surfaces!`);
    }
    vertices.forEach((vertex) => {
      const [posIndex, textIndex, normIndex] = vertex.split("/");
      this.positionsIndex[this.currentObject].push(
        +posIndex - 1 - this.indexOffsets.positions
      );
      this.texturesIndex[this.currentObject].push(
        +textIndex - 1 - this.indexOffsets.textures
      );
      this.normalsIndex[this.currentObject].push(
        +normIndex - 1 - this.indexOffsets.normals
      );
    });
  }

  private getSmoothShading(data: string[]) {
    this.smoothShading[this.currentObject] = data[0] !== "off";
  }

  private getUsedMaterial(data: string[]) {
    this.materials[this.currentObject].push(data[0]);
  }

  private getMaterialLibrary(data: string[]) {
    this.materialLibrary.push(data[0]);
  }

  /**
   * Blender optimizes the OBJ export by providing separate index values
   * for positions, normals and texture coordiates for each vertex.
   * WebGl can only handle a single index, so the normal and texture
   * data needs to be on the same index as the matching vertex position.
   * Since the Obj approach also allows for scenarios where different
   * texture coords and normals are applied to the same vertex position,
   * all indexes are dropped and positions, normals and textures are expanded.
   */
  private expandVertexInfo(object: string) {
    var posIndeces = this.positionsIndex[object];
    var normIndeces = this.normalsIndex[object];
    var texIndeces = this.texturesIndex[object];

    var positions = this.vertexPositions[object];
    var normals = this.vertexNormals[object];
    var textures = this.vertexTexturePositions[object];

    // just ensure that all arrays are the same length and allows direct
    // modification of values
    var tempPositions: (number | [number, number, number])[] = [
      ...this.positionsIndex[object],
    ];
    var tempNormals: (number | [number, number, number])[] = [
      ...this.positionsIndex[object],
    ];
    var tempTextures: (number | [number, number])[] = [
      ...this.positionsIndex[object],
    ];

    posIndeces.forEach((posIndex, i) => {
      var pos = positions[posIndex];
      var norm = normals[normIndeces[i]];
      var texture = textures[texIndeces[i]];

      tempPositions[i] = pos;
      tempNormals[i] = norm;
      tempTextures[i] = texture;
    });

    this.normalsIndex[object] = null;
    this.texturesIndex[object] = null;
    this.positionsIndex[object] = null;

    this.vertexTexturePositions[object] = tempTextures as [number, number][];
    this.vertexNormals[object] = tempNormals as [number, number, number][];
    this.vertexPositions[object] = tempPositions as [number, number, number][];
  }
}
