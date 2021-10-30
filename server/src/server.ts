import express from "express";
import http from "http";
import { Server } from "socket.io";
import { ObjAssetManager } from "./AssetManager";
import { FileManager } from "./FileManager";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const fileManager = new FileManager("public/files");
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

io.of("/files").on("connection", (socket) => {
  console.log("a user connected");

  socket.on("disconnect", () => {
    console.log("user disconnected");
  });

  socket.on("file_sub", ({ filepath }) => {
    fileManager
      .getFileObservable(filepath, (err) => {
        socket.emit("file_error", err);
      })
      .subscribe((file) => {
        if (!file) return;
        socket.emit("file_data", file);
      });
  });

  socket.on("file_fetch", ({ filepath }) => {
    fileManager.fetchFile(filepath, (err, file) => {
      if (err) {
        return socket.emit("file_error", err.message);
      }
      socket.emit("file_data", file);
    });
  });

  socket.on("file_fetch_and_sub", ({ filepath }) => {
    fileManager.fetchFile(filepath, (err, file) => {
      if (err) {
        return socket.emit("file_error", err);
      }
      socket.emit("file_data", file);
      fileManager.getFileObservable(filepath).subscribe((file) => {
        if (!file) return;
        socket.emit("file_data", file);
      });
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
