import { Material } from "../../../contracts/models/ObjData.type";
import { Map, num3 } from "../utils/TypeUtils";

// TODO: Fix as it requires a new instantiotion for every parsing
// make functional instead
export class MtlParser {
  dataTypeMatcher: { [key: string]: (data: string[]) => void } = {
    "#": (_) => {},
    newmtl: (data) => this.getMaterial(data),
    Ka: (data) => this.getAmbientColor(data),
    Kd: (data) => this.getDiffuseColor(data),
    Ks: (data) => this.getSpecularColor(data),
    Ke: (data) => this.getEmissionColor(data),
    Ns: (data) => this.getSpecularHighlight(data),
    Ni: (data) => this.getOpticalDensity(data),
    Tr: (data) => this.getTransparency(data),
    d: (data) => this.getDissolve(data),
    illum: (data) => this.getIlluminationModel(data),
    map_Kd: (data) => this.getTextureFile(data),
  };

  private currentMaterial: string;
  private materials: string[] = [];
  private ambientColors: Map<num3> = {};
  private diffuseColors: Map<num3> = {};
  private specularColors: Map<num3> = {};
  private emissionColors: Map<num3> = {};
  private specularHighlights: Map<number> = {};
  private opticalDensity: Map<number> = {};
  private transparency: Map<number> = {};
  private dissolves: Map<number> = {};
  private illuminationModels: Map<number> = {};
  private textureFiles: Map<string> = {};

  public parse(mtlData: Buffer): Map<Material> {
    const dataStr = mtlData.toString("utf8");
    const dataLines = dataStr.split("\n");
    while (dataLines && dataLines.length) {
      const line = dataLines.shift();
      const [type, ...data] = line.split(" ");
      try {
        if (type && data) this.dataTypeMatcher[type](data);
      } catch {
        console.warn("This should not happen: ", type, data);
      }
    }

    let result: Map<Material> = {};

    this.materials.forEach(
      (mat) =>
        (result[mat] = {
          ambientColor: this.ambientColors[mat],
          diffuseColor: this.diffuseColors[mat],
          specularColor: this.specularColors[mat],
          emissionColor: this.emissionColors[mat],
          specularHighlights: this.specularHighlights[mat],
          opticalDensity: this.opticalDensity[mat],
          dissolve: this.dissolves[mat],
          illuminationModel: this.illuminationModels[mat],
          imageTextureName: this.textureFiles[mat],
        })
    );
    return result;
  }

  private getMaterial(data: string[]) {
    this.currentMaterial = data[0];
    this.materials.push(this.currentMaterial);
  }

  private getAmbientColor(data: string[]) {
    const [r, g, b] = data;
    this.ambientColors[this.currentMaterial] = [+r, +g, +b];
  }

  private getDiffuseColor(data: string[]) {
    const [r, g, b] = data;
    this.diffuseColors[this.currentMaterial] = [+r, +g, +b];
  }

  private getSpecularColor(data: string[]) {
    const [r, g, b] = data;
    this.specularColors[this.currentMaterial] = [+r, +g, +b];
  }

  private getEmissionColor(data: string[]) {
    const [r, g, b] = data;
    this.emissionColors[this.currentMaterial] = [+r, +g, +b];
  }

  private getSpecularHighlight(data: string[]) {
    this.specularHighlights[this.currentMaterial] = +data[0];
  }

  private getOpticalDensity(data: string[]) {
    this.opticalDensity[this.currentMaterial] = +data[0];
  }

  private getTransparency(data: string[]) {
    this.transparency[this.currentMaterial] = +data[0];
  }

  private getDissolve(data: string[]) {
    this.dissolves[this.currentMaterial] = +data[0];
  }

  private getIlluminationModel(data: string[]) {
    this.illuminationModels[this.currentMaterial] = +data[0];
  }

  private getTextureFile(data: string[]) {
    this.textureFiles[this.currentMaterial] = data[0].split("/").pop();
  }
}
