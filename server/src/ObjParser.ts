import { File } from "./FileManager";

export type ObjData = {
  vertexPositions: [number, number, number][]; // (x,y,z)       | len: x
  vertexNormals: [number, number, number][]; // (~>x, ~>y, ~>z) | len: x
  vertexTexturePositions: [number, number][]; // (u,v)          | len: x
  positionIndex: number[];
};

export type ObjFile = File & {
  data: ObjData;
};

export class ObjParser {
  public static parse(file: File): ObjFile {
    let doneWithPositions = false;
    let doneWithNormals = false;
    let doneWithTextures = false;

    const normIndexHelper: { [index: number]: [number, number, number] } = {};
    let indexedNormals: [number, number, number][] = [];

    const objData: ObjData = {
      vertexPositions: [],
      vertexNormals: [],
      vertexTexturePositions: [],
      positionIndex: [],
    };

    const dataStr = file.data.toString("utf8");
    const dataLines = dataStr.split("\n");
    while (dataLines && dataLines.length) {
      const line = dataLines.shift();
      const [type, ...data] = line.split(" ");
      if (!doneWithPositions && type === "v") {
        const [x, y, z] = data;
        objData.vertexPositions.push([+x, +y, +z]);
      } else if (!doneWithNormals && type === "vn") {
        const [nx, ny, nz] = data;
        indexedNormals.push([+nx, +ny, +nz]);
        doneWithPositions = true;
      } else if (!doneWithTextures && type === "f") {
        data.forEach((vector) => {
          const [posIndex, texIndex, normIndex] = vector.split("/");
          objData.positionIndex.push(+posIndex - 1);
          // if (texIndex) normIndexHelper.push(+normIndex - 1);
          normIndexHelper[+posIndex - 1] = indexedNormals[+normIndex - 1];
          // if (normIndex) texIndexHelper.push(+texIndex - 1); // TODO, also add conditional
        });
      } else {
        // console.log("Not recognized type: ");
      }
    }

    if (normIndexHelper) {
      objData.vertexNormals = objData.vertexPositions.map((_, i) => {
        if (!normIndexHelper[i]) {
          console.error(
            "Length of normIndexHelper and objData.vertexNormals don't match! Index not found: ",
            i
          );
        }
        return normIndexHelper[i];
      });
    }

    return {
      ...file,
      data: objData,
    };
  }
}
