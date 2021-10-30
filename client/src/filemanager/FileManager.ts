import { Manager, Socket } from "socket.io-client";
import { Observable } from "rxjs";
import { num2, num3, Object3D } from "../objects/Object3D";

export class FileManager {
  private gl: WebGL2RenderingContext;
  private socket: Socket;

  constructor(gl: WebGL2RenderingContext, baseUrl: string) {
    this.gl = gl;
    const manager = new Manager(baseUrl, {
      reconnectionDelayMax: 10000,
      transports: ["websocket"],
    });

    this.socket = manager.socket("/files");
  }

  load(filepath: string, watch?: boolean): Observable<File> {
    return new Observable((sub) => {
      this.socket.emit(watch ? "file_fetch_and_sub" : "file_fetch", {
        filepath,
      });

      this.socket.on("file_data", (file) => {
        sub.next(file);
      });
    });
  }

  loadObject3D(
    objFilePath: string,
    texFilePath?: string,
    watch?: boolean
  ): Promise<Object3D> {
    var loadedTexture = false;
    var loadedObject = true;
    return new Promise((res, rej) => {
      console.log("Loading object");
      const obj = new Object3D(this.gl, "dummy");
      this.load(objFilePath, watch).subscribe((objFile) => {
        console.log("Found object");
        if (objFile.fileType.toLowerCase() != "obj") {
          rej(`File from server is not of type obj: ${objFile}`);
        }
        const { vertexPositions, vertexNormals, positionIndex } = objFile.data;
        if (objFile.trigger === "FETCH") {
          console.log(`Building new object ${objFile.fileName}`);
          obj.create(vertexPositions, vertexNormals, null, positionIndex);
          loadedObject = true;
          if (Boolean(texFilePath) == loadedTexture) {
            res(obj);
          }
          res(obj);
        } else if (objFile.trigger === "SUB") {
          console.log(`Updating object ${objFile.fileName}`);
          obj.setVertexPositions(vertexPositions);
          obj.setNormals(vertexNormals);
          obj.setIndeces(positionIndex);
        } else {
          rej(`Unknown file load trigger: ${objFile}`);
        }
      });
      if (texFilePath) {
        rej("Texture loading not implemented yet!");
      }
    });
  }
}

export type FileTrigger = "FETCH" | "SUB";

export type File = {
  relativePath: string; // usually relativePathToFile + filename + filetype
  fileName: string; // for something like "foo/bar.txt" -> "bar.txt"
  fileType: string; // for something like "bar.txt" -> .txt
  trigger: FileTrigger;
  data: ObjData;
};

export type ObjData = {
  vertexPositions: num3[]; // (x,y,z)       | len: x
  vertexNormals: num3[]; // (~>x, ~>y, ~>z) | len: x
  vertexTexturePositions: num2[]; // (u,v)          | len: x
  positionIndex: number[];
};
