import express from "express";
import http from "http";
import { Server } from "socket.io";
import { ObjAssetManager } from "./AssetManager";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const assetManager = new ObjAssetManager("public/assets");

io.of("/assets").on("connection", (socket) => {
  socket.on("disconnect", () => {});

  // Get the asset, no changes
  socket.on("asset_fetch", ({ assetName }) => {
    assetManager
      .fetchAsset(assetName)
      .then((asset) => {
        socket.emit("asset_data", asset);
      })
      .catch((err) => {
        console.error(`Error on asset '${assetName}' fetch: `, err);
        socket.emit("asset_error", err);
      });
  });

  // Get any changes
  socket.on("asset_sub", ({ assetName }) => {
    assetManager.getAssetObservable(assetName).subscribe({
      next: (asset) => {
        socket.emit("asset_update", asset);
      },
      error: (err) => {
        console.error(`Error on asset '${assetName}' update: `, err);
        socket.emit("asset_error", err);
      },
    });
  });

  // Get the Asset and any changes
  socket.on("asset_fetch_and_sub", ({ assetName }) => {
    assetManager.getAssetObservable(assetName).subscribe({
      next: (asset) => {
        socket.emit("asset_update", asset);
      },
      error: (err) => {
        console.error(`Error on asset '${assetName}' update: `, err);
        socket.emit("asset_error", err);
      },
    });
    assetManager
      .fetchAsset(assetName)
      .then((asset) => {
        socket.emit("asset_data", asset);
      })
      .catch((err) => {
        console.error(`Error on asset '${assetName}' fetch_and_sub: `, err);
        socket.emit("asset_error", err);
      });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
