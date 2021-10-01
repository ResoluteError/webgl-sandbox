export class EventManager {
  public subscribeTo() {}

  public publishEvent() {}
}

export type Event = {
  id: string;
  type: EventType;
  data: any;
  timestamp: number;
};

export enum EventType {
  KEYPRESS,
  MOUSE,
  GAME_EVENT,
}
