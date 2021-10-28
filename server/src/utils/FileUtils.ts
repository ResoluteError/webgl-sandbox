import fs from "fs";
import { Observable } from "rxjs";
import { File } from "../FileManager";

export function getFileChanges(
  path: string,
  cb: (err: Error, data: Buffer) => void
) {
  fs.watch(path, () => readFile(path, cb));
}

/**
 *
 * @param path
 * @returns path that was updated
 */
export function getDirChangesToObservable(path: string): Observable<string> {
  return new Observable((sub) => {
    fs.watch(path, (err, file) => {
      if (err) {
        return sub.error(err);
      }
      sub.next(path);
    });
  });
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

export function getFileStatToPromise(filePath: string): Promise<fs.Stats> {
  return new Promise((res, rej) => {
    fs.lstat(filePath, (err, stat) => {
      if (err) {
        return rej(err);
      }
      res(stat);
    });
  });
}

/**
 * Only returns non-nested files directly in dir, skips all non-files,
 * returns a Promise of the list of all file names in that dir
 * @param path
 */
export function getFilesInDirToPromise(path: string): Promise<string[]> {
  return new Promise((res, rej) => {
    fs.readdir(path, (err, files) => {
      if (err) {
        return rej(err);
      }
      res(
        Promise.all([
          ...files.map((file) =>
            getFileStatToPromise(`${path}/${file}`).then(
              (stat) => stat.isFile() && file
            )
          ),
        ]).then((files) => files.filter((file) => file))
      );
    });
  });
}

export function readFileToPromise(path: string): Promise<Buffer> {
  return new Promise((res, rej) => {
    fs.readFile(path, (err, data) => {
      if (err) {
        rej(err);
      } else {
        res(data);
      }
    });
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
