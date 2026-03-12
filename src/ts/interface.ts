export interface InitGPUReturn {
  adapter: GPUAdapter;
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
  size: Size;
}

export interface Size {
  width: number | undefined;
  height: number| undefined;
}

export interface VertexObj {
  vertexData: Float32Array<ArrayBuffer>;
  vertexBuffer: GPUBuffer;
  vertexCount: number;
}

export interface ColorObj {
  color: Float32Array<ArrayBuffer>;
  colorBuffer: GPUBuffer;
}

export interface InitPipeline {
  pipeline: GPURenderPipeline;
  vertexObj: VertexObj;
  colorObj: ColorObj;
  uniformGroup: GPUBindGroup;
  mvpMatrix: GPUBuffer;
}
