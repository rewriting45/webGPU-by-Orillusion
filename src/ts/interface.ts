export interface InitGPUReturn {
  adapter: GPUAdapter;
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

export interface VertexObj {
  vertexData: Float32Array<ArrayBuffer>;
  vertexBuffer: GPUBuffer;
  vertexCount: number;
}

export interface ColorObj { 
  color: Float32Array<ArrayBuffer>,
  colorBuffer: GPUBuffer;
  group: GPUBindGroup;
}

export interface InitPipeline {
  pipeline: GPURenderPipeline;
  vertexObj: VertexObj;
  colorObj: ColorObj;
}
