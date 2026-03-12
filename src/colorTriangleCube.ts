import { InitGPUReturn, InitPipeline, Size, VertexObj } from "./ts/interface";
import vertexCode from "./shaders/positionCube.vert.wgsl?raw";
import fargmentCode from "./shaders/red.frag.wgsl?raw";
import { WebGpuCubeAdapter } from "./util/triangleCube";
import { mat4, vec3 } from "gl-matrix";

async function initWebGPU(): Promise<InitGPUReturn> {
  if (!navigator.gpu) {
    throw new Error("");
  }

  const adapter = await navigator.gpu.requestAdapter({
    powerPreference: "high-performance",
  });

  if (!adapter) {
    throw new Error("");
  }

  const device = await adapter.requestDevice();
  if (!device) {
    throw new Error("");
  }

  const canvas = document.querySelector("canvas");
  const context = canvas?.getContext("webgpu");

  if (!context) {
    throw new Error("");
  }

  const format = navigator.gpu.getPreferredCanvasFormat();

  context?.configure({
    device,
    format,
    alphaMode: "opaque",
  });

  return {
    adapter,
    device,
    context,
    format,
    size: {
      width: canvas?.width * window.devicePixelRatio,
      height: canvas?.height * window.devicePixelRatio,
    },
  };
}

async function initPipeline(
  device: GPUDevice,
  format: GPUTextureFormat,
  size: Size,
): Promise<InitPipeline> {
  const cubePositions = WebGpuCubeAdapter.generateCube();
  const cubeLength = WebGpuCubeAdapter.length;

  // const vertexData = new Float32Array([0, 1, 0, -0.5, -0.5, 0, 0.5, -0.5, 0]);

  const cubeBuffer = device.createBuffer({
    size: cubePositions.byteLength,
    usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
  });

  device.queue.writeBuffer(cubeBuffer, 0, cubePositions);

  // fragment buffer start
  const color = new Float32Array([1, 0, 0, 1]);
  const colorBuffer = device.createBuffer({
    size: color.byteLength,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });
  device.queue.writeBuffer(colorBuffer, 0, color);
  // fragment buffer end

  const pipeline = await device.createRenderPipelineAsync({
    vertex: {
      module: device.createShaderModule({
        code: vertexCode,
      }),
      entryPoint: "main",
      buffers: [
        {
          // 第一个buffer的意思是按照每三个数据组合成一个供 shader 使用的数据
          arrayStride: 3 * 4, // 数据的长度
          attributes: [
            // 这个就是具体告诉shader怎么处理
            {
              shaderLocation: 0,
              offset: 0,
              format: "float32x3",
            },
          ],
        },
      ],
    },
    layout: "auto",
    fragment: {
      module: device.createShaderModule({
        code: fargmentCode,
      }),
      entryPoint: "main",
      targets: [
        {
          format,
        },
      ],
    },
    primitive: {
      topology: "triangle-list", // 输出的顶点信息该怎么组合
    },
    depthStencil: {
      // 深度测试
      depthWriteEnabled: true, // 开启
      depthCompare: "less",
      format: "depth24plus",
    },
  });
  // triangle-strip 所有点组成一个面
  // triangle-list 三个点形成一个面
  // point-list 每个点单独输出
  // line-list 每俩个形成一条线
  // line-strip 首尾连接组合

  const depthTexture = device.createTexture({
    size: {
      width: 1486,
      height: 791,
    },
    format: "depth24plus",
    usage: GPUTextureUsage.RENDER_ATTACHMENT,
  });

  const mvpMatrix = device.createBuffer({
    size: 4 * 4 * 4,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
  });

  const uniformGroup = device.createBindGroup({
    layout: pipeline.getBindGroupLayout(0),
    entries: [
      {
        binding: 0,
        resource: colorBuffer,
      },
      {
        binding: 1,
        resource: mvpMatrix,
      },
    ],
  });

  return {
    pipeline,
    vertexObj: {
      vertexData: cubePositions,
      vertexBuffer: cubeBuffer,
      vertexCount: cubeLength,
    },
    colorObj: {
      color,
      colorBuffer,
    },
    uniformGroup,
    mvpMatrix,
    depthTexture,
  };
}

function draw(
  device: GPUDevice,
  pipeline: GPURenderPipeline,
  context: GPUCanvasContext,
  vertexObj: VertexObj,
  uniformGroup: GPUBindGroup,
  depthTexture,
) {
  const encoder = device.createCommandEncoder();

  const pass = encoder.beginRenderPass({
    colorAttachments: [
      {
        view: context.getCurrentTexture().createView(),
        loadOp: "clear",
        clearValue: {
          r: 0,
          g: 0,
          b: 0,
          a: 1,
        },
        storeOp: "store",
      },
    ],
    depthStencilAttachment: {
      view: depthTexture.createView(),
      depthClearValue: 1.0,
      depthLoadOp: "clear",
      depthStoreOp: "store",
    },
  });

  pass.setPipeline(pipeline);
  pass.setVertexBuffer(0, vertexObj.vertexBuffer);
  console.log(uniformGroup, "uniformGroup");

  pass.setBindGroup(0, uniformGroup);
  // 录制开始
  pass.draw(vertexObj.vertexData.length / 3);
  // 录制结束
  pass.end();

  const buffer = encoder.finish();
  // 发送指令
  device.queue.submit([buffer]);
}

async function run() {
  const { device, format, context, size } = await initWebGPU();
  const {
    pipeline,
    vertexObj,
    colorObj,
    uniformGroup,
    mvpMatrix: mainMatrix,
    depthTexture,
  } = await initPipeline(device, format, size);

  const position = { x: 0, y: 0, z: -4 };
  const rotation = { x: -0.5, y: 0, z: 0 };
  const scale = { x: 1, y: 1, z: 1 };

  canvasResize(context.canvas, device, () => {
    draw(device, pipeline, context, vertexObj, uniformGroup, depthTexture);
  });

  function animation() {
    rotation.x += 0.01;
    rotation.y += 0.01;
    rotation.z += 0.01;
    const modelViewMatrix = mat4.create();

    mat4.translate(
      modelViewMatrix,
      modelViewMatrix,
      vec3.fromValues(position.x, position.y, position.z),
    );
    mat4.rotateX(modelViewMatrix, modelViewMatrix, rotation.x);
    mat4.rotateY(modelViewMatrix, modelViewMatrix, rotation.y);
    mat4.rotateZ(modelViewMatrix, modelViewMatrix, rotation.z);
    mat4.scale(
      modelViewMatrix,
      modelViewMatrix,
      vec3.fromValues(scale.x, scale.y, scale.z),
    );

    const projectionMatrix = mat4.create();
    mat4.perspective(
      projectionMatrix,
      Math.PI / 2,
      context.canvas.width / context.canvas.height,
      1,
      100,
    );

    const mvpMatrix = mat4.create();
    mat4.multiply(mvpMatrix, projectionMatrix, modelViewMatrix);

    device.queue.writeBuffer(mainMatrix, 0, mvpMatrix as Float32Array);
    draw(device, pipeline, context, vertexObj, uniformGroup, depthTexture);
    requestAnimationFrame(animation);
  }

  animation();

  document
    .querySelector("#colorSelect")
    ?.addEventListener("input", ({ target }: Event) => {
      const { value } = target as HTMLInputElement;
      const color = hexToRgb(value);
      device.queue.writeBuffer(colorObj.colorBuffer, 0, color);
      console.log(color);

      draw(device, pipeline, context, vertexObj, uniformGroup, depthTexture);
    });

  document
    .querySelector("#rangeSelect")
    ?.addEventListener("input", ({ target }: Event) => {
      const { value } = target as HTMLInputElement;
      device.queue.writeBuffer(
        vertexObj.vertexBuffer,
        0,
        vertexObj.vertexData.map((item, index: number) => {
          if (index % 3 === 0) {
            return (item += Number(value));
          } else {
            return item;
          }
        }),
      );
      draw(device, pipeline, context, vertexObj, uniformGroup, depthTexture);
    });
}

function canvasResize(
  canvas: HTMLCanvasElement | OffscreenCanvas,
  device: GPUDevice,
  renderCallback: () => void,
) {
  const observer = new ResizeObserver((entries) => {
    for (const entry of entries) {
      const canvas = entry.target as HTMLCanvasElement;
      const width = entry.contentBoxSize[0].inlineSize;
      const height = entry.contentBoxSize[0].blockSize;
      canvas.width = Math.max(
        1,
        Math.min(width, device.limits.maxTextureDimension2D),
      );
      canvas.height = Math.max(
        1,
        Math.min(height, device.limits.maxTextureDimension2D),
      );
      renderCallback();
    }
  });
  observer.observe(canvas as HTMLCanvasElement);
}

const hexToRgb = (hex: string): Float32Array<ArrayBuffer> => {
  // 1. 去掉 # 并验证格式 (支持 6 位或 3 位)
  const cleanHex = hex.replace("#", "");
  const reg = /^(?:[0-9a-fA-F]{3}){1,2}$/;

  if (!reg.test(cleanHex)) {
    throw new Error(`Invalid hex color: ${hex}`);
  }

  // 2. 处理简写情况 (比如 #F00 -> #FF0000)
  let fullHex = cleanHex;
  if (cleanHex.length === 3) {
    fullHex = cleanHex
      .split("")
      .map((char) => char + char)
      .join("");
  }

  // 3. 解析并归一化 (除以 255)
  const r = parseInt(fullHex.substring(0, 2), 16) / 255;
  const g = parseInt(fullHex.substring(2, 4), 16) / 255;
  const b = parseInt(fullHex.substring(4, 6), 16) / 255;

  // 4. 返回 WebGPU 渲染管线最喜欢的 Float32Array
  // 我们通常返回 4 个分量 (RGBA)，因为 Shader 里多用 vec4
  return new Float32Array([r, g, b, 1.0]);
};

run();
