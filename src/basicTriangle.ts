// import { InitGPUReturn, InitPipeline } from "./ts/interface";
// import vertexCode from "./shaders/triangle.vert.wgsl?raw";
// import fargmentCode from "./shaders/red.frag.wgsl?raw";

// async function initWebGPU(): Promise<InitGPUReturn> {
//   if (!navigator.gpu) {
//     throw new Error("");
//   }

//   const adapter = await navigator.gpu.requestAdapter({
//     powerPreference: "high-performance",
//   });

//   if (!adapter) {
//     throw new Error("");
//   }

//   const device = await adapter.requestDevice({
//     requiredFeatures: ["texture-formats-tier1"],
//   });

//   if (!device) {
//     throw new Error("");
//   }

//   const canvas = document.querySelector("canvas");
//   const context = canvas?.getContext("webgpu");

//   if (!context) {
//     throw new Error("");
//   }

//   const format = navigator.gpu.getPreferredCanvasFormat();

//   context?.configure({
//     device,
//     format,
//     alphaMode: "opaque",
//   });

//   return {
//     adapter,
//     device,
//     context,
//     format,
//   };
// }

// async function initPipeline(
//   device: GPUDevice,
//   format: GPUTextureFormat,
// ): Promise<InitPipeline> {
//   const vertex = device.createShaderModule({
//     code: vertexCode,
//   });

//   const fragment = device.createShaderModule({
//     code: fargmentCode,
//   });

//   const pipeline = await device.createRenderPipelineAsync({
//     vertex: {
//       module: vertex,
//       entryPoint: "main",
//     },
//     layout: "auto",
//     fragment: {
//       module: fragment,
//       entryPoint: "main",
//       targets: [
//         {
//           format,
//         },
//       ],
//     },
//     primitive: {
//       topology: "triangle-strip", // 输出的顶点信息该怎么组合
//     },
//   });
//   // triangle-strip 所有点组成一个面
//   // triangle-list 三个点形成一个面
//   // point-list 每个点单独输出
//   // line-list 每俩个形成一条线
//   // line-strip 首尾连接组合

//   return { pipeline };
// }

// function draw(
//   device: GPUDevice,
//   pipeline: GPURenderPipeline,
//   context: GPUCanvasContext,
// ) {
//   const encoder = device.createCommandEncoder();

//   const pass = encoder.beginRenderPass({
//     colorAttachments: [
//       {
//         view: context.getCurrentTexture().createView(),
//         loadOp: "clear",
//         clearValue: {
//           r: 0,
//           g: 0,
//           b: 0,
//           a: 1,
//         },
//         storeOp: "store",
//       },
//     ],
//   });

//   pass.setPipeline(pipeline);
//   // 录制开始
//   pass.draw(3);
//   // 录制结束
//   pass.end();

//   const buffer = encoder.finish();
//   // 发送指令
//   device.queue.submit([buffer]);
// }

// async function run() {
//   const { device, format, context } = await initWebGPU();
//   const { pipeline } = await initPipeline(device, format);
//   draw(device, pipeline, context);
// }

// run();
