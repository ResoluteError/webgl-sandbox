import { FrameLogger } from "./FrameLogger";

class Debugger extends FrameLogger {
  private lines: { [key: string]: string } = {};
  private orderedKeys: string[] = [];

  private debugMode: boolean = false;

  private shouldLogFps: boolean = false;

  private htmlElement: HTMLDivElement;

  constructor(debugMode: boolean, shouldLogFps: boolean) {
    super(60);
    this.debugMode = debugMode;
    this.shouldLogFps = shouldLogFps;
    document.onload = () => {};
    var poller = window.setInterval(() => {
      var ele = document.getElementById("debug-body") as HTMLDivElement;
      if (ele) {
        this.htmlElement = ele;
        clearInterval(poller);
      }
    }, 100);
  }

  public log(key: string, message: string) {
    if (!(key in this.lines)) {
      this.orderedKeys.push(key);
    }
    this.lines[key] = message;
  }

  private logFps() {
    this.log("FPS", "fps: " + this.getCurrentFps());
  }

  public render() {
    if (!this.debugMode || !this.htmlElement) return;
    if (this.shouldLogFps) {
      this.logFps();
    }
    this.htmlElement.innerHTML = "";
    this.orderedKeys.forEach((key) => {
      let info = document.createElement("p");
      info.innerHTML = this.lines[key];
      this.htmlElement.appendChild(info);
    });
  }
}

export const Debug = new Debugger(true, true);
