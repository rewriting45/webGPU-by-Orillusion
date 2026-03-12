export class WebGpuCubeAdapter {
  static length = 432;
  /**
   * 生成立方体的顶点数据 (Position + UV)
   * 8个顶点，每个包含 x,y,z (位置) 和 u,v (纹理)
   */
  static getVertices() {
    return new Float32Array([
      // x,    y,    z,    u,    v
      -1,
      -1,
      1,
      0,
      0, // 0: 左下前
      1,
      -1,
      1,
      1,
      0, // 1: 右下前
      1,
      1,
      1,
      1,
      1, // 2: 右上前
      -1,
      1,
      1,
      0,
      1, // 3: 左上前
      -1,
      -1,
      -1,
      0,
      0, // 4: 左下后
      1,
      -1,
      -1,
      1,
      0, // 5: 右下后
      1,
      1,
      -1,
      1,
      1, // 6: 右上后
      -1,
      1,
      -1,
      0,
      1, // 7: 左上后
    ]);
  }

  static getVerticesNotUV() {
    return [
      // x,    y,    z,    u,    v
      [-1, -1, 1], // 0: 左下前
      [1, -1, 1], // 1: 右下前
      [1, 1, 1], // 2: 右上前
      [-1, 1, 1], // 3: 左上前
      [-1, -1, -1], // 4: 左下后
      [1, -1, -1], // 5: 右下后
      [1, 1, -1], // 6: 右上后
      [-1, 1, -1], // 7: 左上后
    ];
  }

  /**
   * 生成索引数据 (36个索引，共12个三角形)
   */
  static getIndices() {
    return new Uint16Array([
      0,
      1,
      2,
      0,
      2,
      3, // 前面
      1,
      5,
      6,
      1,
      6,
      2, // 右面
      5,
      4,
      7,
      5,
      7,
      6, // 后面
      4,
      0,
      3,
      4,
      3,
      7, // 左面
      3,
      2,
      6,
      3,
      6,
      7, // 上面
      4,
      5,
      1,
      4,
      1,
      0, // 下面
    ]);
  }

  static generateCube() {
    const position = this.getVerticesNotUV();
    const positionIndex = this.getIndices();
    const cube = [];
    for (let index = 0; index < positionIndex.length; index++) {
      cube.push(...position[positionIndex[index]]);
    }
    return new Float32Array(cube);
  }
}
