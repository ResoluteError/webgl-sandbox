import express from "express";
import http from "http";
import { Server } from "socket.io";
import { FileManager } from "./FileManager";
import { ObjParser } from "./ObjParser";

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const fileManager = new FileManager("public/files");

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
        if (file.fileType.toLowerCase() === "obj") {
          file = ObjParser.parse(file);
        }
        socket.emit("file_data", file);
      });
  });

  socket.on("file_fetch", ({ filepath }) => {
    fileManager.readFile(filepath, (err, file) => {
      if (err) {
        return socket.emit("file_error", err.message);
      }
      if (file.fileType.toLowerCase() === "obj") {
        file = ObjParser.parse(file);
      }
      socket.emit("file_data", file);
    });
  });

  socket.on("file_fetch_and_sub", ({ filepath }) => {
    fileManager.readFile(filepath, (err, file) => {
      if (err) {
        return socket.emit("file_error", err);
      }
      if (file.fileType.toLowerCase() === "obj") {
        file = ObjParser.parse(file);
      }
      socket.emit("file_data", file);
      fileManager.getFileObservable(filepath).subscribe((file) => {
        if (!file) return;
        if (file.fileType.toLowerCase() === "obj") {
          file = ObjParser.parse(file);
        }
        socket.emit("file_data", file);
      });
    });
  });
});

server.listen(3000, () => {
  console.log("listening on *:3000");
});
