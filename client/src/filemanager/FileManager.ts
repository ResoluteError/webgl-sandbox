import { Manager, Socket } from "socket.io-client";
import { File } from "../objects/Object3D-deprecated";
import { Observable } from "rxjs";

export class FileManager {
  private socket: Socket;

  constructor(baseUrl: string) {
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
}
