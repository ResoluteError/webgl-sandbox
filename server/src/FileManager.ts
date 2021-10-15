import { Observable, of, throttleTime } from "rxjs";
import { ObjData } from "./ObjParser";
import {
  getFileChanges,
  getFileMeta,
  getFilesRecursive,
  readFile,
} from "./utils/FileUtils";

export type FileTrigger = "FETCH" | "SUB";

export type File = {
  relativePath: string; // usually relativePathToFile + filename + filetype
  fileName: string; // for something like "foo/bar.txt" -> "bar.txt"
  fileType: string; // for something like "bar.txt" -> .txt
  trigger: FileTrigger;
  data: Buffer | ObjData;
};

export class FileManager {
  private baseDir: string;
  private watchedFiles: string[] = [];
  private fileWatchers: { [relativePath: string]: Observable<File> } = {};

  constructor(relativePath: string) {
    this.baseDir = `${__dirname}/${relativePath}`.replace("//", "/");
    this.initFileWatchers();
  }

  private initFileWatchers() {
    getFilesRecursive(this.baseDir, (filepath: string) => {
      const { relativePath, fileName, fileType } = getFileMeta(
        this.baseDir,
        filepath
      );
      this.watchedFiles.push(relativePath);
      console.log("Adding file watcher for: ", relativePath);
      this.fileWatchers[relativePath] = new Observable((sub) => {
        getFileChanges(filepath, (_, data) => {
          sub.next({
            relativePath,
            fileName,
            fileType,
            data,
            trigger: "SUB",
          });
        });
      });
    });
  }

  public getFileObservable(
    filename: string,
    onErr?: (message: string) => void
  ): Observable<File> {
    if (!this.fileWatchers[filename]) {
      console.warn("Requested file watch does not exist: ", filename);
      if (onErr) onErr("Requested file watch does not exist: " + filename);
      return of(null);
    }
    return this.fileWatchers[filename].pipe(throttleTime(2000));
  }

  public fetchFile(filename: string, cb: (err: Error, file: File) => void) {
    const filePath = `${this.baseDir}/${filename}`;
    const { relativePath, fileName, fileType } = getFileMeta(
      this.baseDir,
      filePath
    );
    readFile(filePath, (err, data) => {
      cb(err, {
        relativePath,
        fileName,
        fileType,
        data,
        trigger: "FETCH",
      });
    });
  }
}
