import fs from "fs";
import { mergeMap, Observable, throttleTime } from "rxjs";
import { AssetData } from "../../contracts/models/ObjData.type";
import { MtlParser } from "./parser/MtlParser";
import { ObjParser } from "./parser/ObjParser";
import {
  getDirChangesToObservable,
  getFilesInDirToPromise,
  readFileToPromise,
} from "./utils/FileUtils";
import { Map } from "./utils/TypeUtils";

export type AssetFilePaths = {
  objFilepath: string;
  mtlFilePath: string | null;
  imageTexturePath: string | null;
  diffuseMapPath: string | null;
  normalMapFilePath: string | null;
  specularMapPath: string | null;
  reflectionMapPath: string | null;
};

export class ObjAssetManager {
  private baseDir: string;
  private watchedAssets: string[] = [];
  private assetPaths: Map<string> = {};
  private assetWatchers: { [assetName: string]: Observable<AssetData> } = {};

  constructor(relativePath: string) {
    this.baseDir = `${__dirname}/${relativePath}`.replace("//", "/");
    this.initAssetWatchers();
  }

  private initAssetWatchers() {
    this.getAssetsRecursive(
      this.baseDir,
      (assetName: string, assetPath: string) => {
        this.watchedAssets.push(assetName);
        this.assetPaths[assetName] = assetPath;
        this.assetWatchers[assetName] = this.watchAsset(assetName);
      }
    );
  }

  public getAssetObservable(assetName: string): Observable<AssetData> {
    return this.assetWatchers[assetName];
  }

  public fetchAsset(assetName: string): Promise<AssetData> {
    console.log("Fetching asset: ", assetName);
    const mtlParser: MtlParser = new MtlParser();
    const objParser: ObjParser = new ObjParser();
    return getFilesInDirToPromise(this.assetPaths[assetName])
      .then((files) => this.readAssetFiles(this.assetPaths[assetName], files))
      .then(({ objData, mtlData, imageTextureData }) => {
        let parsedObjs = objParser.parse(objData);
        let parsedMaterials = mtlParser.parse(mtlData);
        return {
          name: assetName,
          objects: parsedObjs,
          materials: parsedMaterials,
          imageTextures: imageTextureData,
        };
      });
  }

  private watchAsset(assetName: string): Observable<AssetData> {
    return getDirChangesToObservable(this.assetPaths[assetName]).pipe(
      throttleTime(2000),
      mergeMap((_path) => this.fetchAsset(assetName))
    );
  }

  private readAssetFiles(
    assetPath: string,
    assetFiles: string[]
  ): Promise<{
    objData: Buffer;
    mtlData: Buffer;
    imageTextureData: Map<Buffer>;
  }> {
    let objFilepath = `${assetPath}/${assetFiles.filter(this.isObjFile)[0]}`;
    let mtlFilePath = `${assetPath}/${assetFiles.filter(this.isMtlFile)[0]}`;
    let imageTexturePaths = assetFiles
      .filter(this.isImageFile)
      .map((imageName) => `${assetPath}/${imageName}`);
    return Promise.all([
      readFileToPromise(objFilepath),
      readFileToPromise(mtlFilePath),
      ...imageTexturePaths.map(readFileToPromise),
    ]).then(([objData, mtlData, ...imagesData]) => {
      let imageTextureData: Map<Buffer> = {};
      for (let i in imagesData) {
        imageTextureData[imageTexturePaths[i].split("/").pop()] = imagesData[i];
      }
      return {
        objData,
        mtlData,
        imageTextureData,
      };
    });
  }

  private getAssetsRecursive(
    dir: string,
    cb: (assetName: string, assetPath: string) => void
  ) {
    fs.readdir(dir, (err, files) => {
      if (err) {
        console.error(`Error reading dir: ${dir}`);
        throw err;
      }
      var objIndex = files.findIndex(this.isObjFile);
      if (objIndex >= 0) {
        let assetName = dir.split("/").pop();
        return cb(assetName, dir);
      }
      files.forEach((filename) => {
        const path = `${dir}/${filename}`;
        fs.lstat(path, (err, stats) => {
          if (err) {
            console.error(`Error getting lstaf of ${path}: `, err);
            throw err;
          }
          if (stats.isDirectory()) {
            return this.getAssetsRecursive(path, cb);
          }
        });
      });
    });
  }

  private isObjFile(filename: string) {
    return filename.match(/\.obj$/i) !== null;
  }
  private isMtlFile(filename: string) {
    return filename.match(/\.mtl$/i) !== null;
  }
  private isImageFile(filename: string) {
    return filename.match(/\.jpeg$/i) !== null;
  }
}
