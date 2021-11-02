export interface CustomVertexBuffer<T> extends CustomBuffer<T> {}

export interface CustomBuffer<T> {
  bufferData(): void;
  addItem(item: T): void;
  addItems(items: T[]): void;
  bind(): void;
  unbind(): void;
  delete(): void;
  getSize(): number;
  getBuffer(): WebGLBuffer;
}
export type VertexLayoutElement = {
  size: number; // pull out 2 values per iteration
  type: number; // the data in the buffer is 32bit floats (WebGLEnum)
  normalize: boolean; // don't normalize
  stride: number; // how many bytes to get from one set of values to the next
  offset: number;
  name: string; // used for debugging only
};
