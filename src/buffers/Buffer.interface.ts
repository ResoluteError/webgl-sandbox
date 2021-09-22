export interface CustomBuffer<T> {
  bufferData(): void;
  addItem(item: T): void;
  addItems(items: T[]): void;
  bind(): void;
  getSize(): number;
  getBuffer(): WebGLBuffer;
  getLayout(): VertexLayout;
  getAttribName(): string | void;
}

export type VertexLayout = {
  numComponents: number; // pull out 2 values per iteration
  type: number; // the data in the buffer is 32bit floats (WebGLEnum)
  normalize: boolean; // don't normalize
  stride: number; // how many bytes to get from one set of values to the next
  // 0 = use type and numComponents above
  offset: number; // how many bytes inside the buffer to start from
};
