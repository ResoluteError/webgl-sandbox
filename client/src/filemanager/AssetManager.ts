import { Observable } from "rxjs";
import { Manager, Socket } from "socket.io-client";
import { AssetData } from "../../../contracts/models/ObjData.type";
import { Asset3D } from "../objects/Asset3D";

export class AssetManager {
  private socket: Socket;
  private gl: WebGL2RenderingContext;
  private assets: { [assetName: string]: Asset3D } = {};

  constructor(gl: WebGL2RenderingContext, baseUrl: string) {
    const manager = new Manager(baseUrl, {
      reconnectionDelayMax: 10000,
      transports: ["websocket"],
    });
    this.gl = gl;
    this.socket = manager.socket("/assets");
  }

  load(
    assetName: string,
    watch?: boolean
  ): Observable<{ asset: Asset3D; type: "CREATE" | "UPDATE" }> {
    return new Observable((sub) => {
      this.socket.emit(watch ? "asset_fetch_and_sub" : "asset_fetch", {
        assetName,
      });

      this.socket.on("asset_data", (asset: AssetData) => {
        if (assetName !== asset.name) return;
        this.assets[asset.name] = new Asset3D(this.gl, asset);
        console.log(`Created asset '${asset.name}': `, asset);
        sub.next({ asset: this.assets[asset.name], type: "CREATE" });
      });
      this.socket.on("asset_update", (asset: AssetData) => {
        if (assetName !== asset.name) return;
        this.assets[asset.name].put(asset);
        console.log(`Updated asset '${asset.name}': `, this.assets[asset.name]);
        sub.next({ asset: this.assets[asset.name], type: "UPDATE" });
      });
      this.socket.on("asset_error", (err) => {
        // TODO: Log error only once
        sub.error(err);
      });
    });
  }
}
