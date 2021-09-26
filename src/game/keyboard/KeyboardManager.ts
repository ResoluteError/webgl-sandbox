import { KEYBOARD_MAP } from "./KeyboardMap";

export class KeyboardManager {
  private activeKeys: number[];
  private activeActionQueue: {
    [key: number]: {
      id: number;
      action: () => void;
    }[];
  };
  private activeKeyMap: { [key: number]: boolean };

  constructor() {
    this.activeKeys = [];
    this.activeActionQueue = {};
    Object.values(KEYBOARD_MAP).forEach(
      (code) => (this.activeActionQueue[code] = [])
    );
    this.activeKeyMap = {};
  }

  public keyDown(event: KeyboardEvent) {
    const downKey = KEYBOARD_MAP[event.key];
    if (downKey !== undefined && !this.activeKeyMap[downKey]) {
      this.activeKeys.push(downKey);
      this.activeKeyMap[downKey] = true;
    }
  }

  public keyUp(event: KeyboardEvent) {
    const upKey = KEYBOARD_MAP[event.key];
    if (upKey !== undefined && this.activeKeyMap[upKey]) {
      this.activeKeys = this.activeKeys.filter((item) => item !== upKey);
      this.activeKeyMap[upKey] = false;
    }
  }

  public pushAction(key: number, action: () => void): number {
    var id = Date.now() * 100 + Math.floor(Math.random() * 100);
    this.activeActionQueue[key].push({
      id,
      action,
    });
    return id;
  }

  public removeAction(key: number, actionId: number): void {
    this.activeActionQueue[key].filter(({ id }) => id === actionId);
  }

  // Do calculating actions while waiting for the next frame
  public executeActions() {
    this.activeKeys.forEach((key) => {
      if (this.activeActionQueue[key] === undefined) {
        console.warn("Dealing with unrecognized key: " + key);
      } else {
        this.activeActionQueue[key].forEach(({ action }) => {
          action();
        });
      }
    });
  }
}
