export type Obj = {
  vertexPositions: [number, number, number][];
  vertexNormals: [number, number, number][] | null;
  vertexTextureCoords: [number, number][] | null;
  materials: string[];
};

export type Material = {
  ambientColor: [number, number, number]; // Ka
  diffuseColor: [number, number, number]; // Kd
  specularColor: [number, number, number]; // Ks
  emissionColor: [number, number, number]; // Ke
  specularHighlights: number; // Ns
  opticalDensity: number; // Ni
  dissolve: number; // d
  illuminationModel: number; // illum
  imageTextureName: string; // map_Kd
};

export type AssetData = {
  name: string;
  objects: { [objName: string]: Obj };
  materials: { [materialName: string]: Material };
  imageTextures: { [imageName: string]: Buffer };
};
