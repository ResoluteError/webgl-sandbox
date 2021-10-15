import fs from "fs";
import { File } from "../FileManager";

export function getFilesRecursive(dir: string, cb: (filename: string) => void) {
  fs.readdir(dir, (err, files) => {
    if (err) {
      console.error(`Error reading dir: ${dir}`);
      throw err;
    }
    files.forEach((filename) => {
      const path = `${dir}/${filename}`;
      fs.lstat(path, (err, stats) => {
        if (err) {
          console.error(`Error getting lstaf of ${path}: `, err);
          throw err;
        }
        if (stats.isDirectory()) {
          return getFilesRecursive(path, cb);
        }
        cb(path);
      });
    });
  });
}

export function getFileChanges(
  path: string,
  cb: (err: Error, data: Buffer) => void
) {
  fs.watch(path, () => readFile(path, cb));
}

export function readFile(path: string, cb: (err: Error, data: Buffer) => void) {
  fs.readFile(path, (err, data) => {
    if (err) {
      cb(new Error(`${path} file not found!`), null);
    } else {
      cb(null, data);
    }
  });
}

export function getFileMeta(
  baseDir: string,
  fullPath: string
): Omit<File, "data" | "trigger"> {
  const relativePath = fullPath.replace(baseDir + "/", "");
  const relativePathSplit = relativePath.split("/");
  const fileName = relativePathSplit[relativePathSplit.length - 1];
  const filenameSplit = relativePath.split(".");
  const fileType = filenameSplit[filenameSplit.length - 1];
  return {
    relativePath,
    fileName,
    fileType,
  };
}
