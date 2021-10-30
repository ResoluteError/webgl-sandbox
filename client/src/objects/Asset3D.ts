import { AssetData } from "../../../contracts/models/ObjData.type";
import { Object3D } from "./Object3D";
import { Animatable } from "./base/Animatable";

export class Asset3D extends Animatable {
  private objects: { [objName: string]: Object3D } = {};
  private gl: WebGL2RenderingContext;

  constructor(gl: WebGL2RenderingContext, assetData: AssetData) {
    super();
    this.gl = gl;
    this.put(assetData);
  }

  public put(assetData: AssetData) {
    let objects = Object.keys(assetData.objects);
    for (var currentObject of objects) {
      let obj: Object3D;
      if (currentObject in this.objects) {
        console.log(`Object ${currentObject} exists, updating...`);
        obj = this.objects[currentObject];
      } else {
        console.log(`Object ${currentObject} not found, creating new...`);
        obj = new Object3D(this.gl);
      }
      // TODO: This is only able to handle a single materials with a single image texture
      let primaryMaterial = assetData.objects[currentObject].materials[0];
      let primaryImage = assetData.materials[primaryMaterial].imageTextureName;
      obj.create(
        assetData.objects[currentObject].vertexPositions,
        assetData.objects[currentObject].vertexNormals
      );
      obj.setTexture(
        assetData.imageTextures[primaryImage],
        assetData.objects[currentObject].vertexTextureCoords
      );
      this.objects[currentObject] = obj;
    }
  }

  public getObjects() {
    return Object.values(this.objects);
  }
}