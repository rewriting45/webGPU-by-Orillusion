export interface InitGPUReturn {
  adapter: GPUAdapter;
  device: GPUDevice;
  context: GPUCanvasContext;
  format: GPUTextureFormat;
}

export interface InitPipeline {
  pipeline: GPURenderPipeline;
}
