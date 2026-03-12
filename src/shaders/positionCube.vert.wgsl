@group(0) @binding(1) var<uniform> mvp: mat4x4<f32>;

struct VertexOutput {
    @builtin(position) Position: vec4f,
    @location(0) fragPostion: vec4f
}

@vertex
fn main(@location(0) position: vec4f) -> VertexOutput {
    var out: VertexOutput;
    out.Position = mvp * position;
    out.fragPostion = 0.5 * (position + vec4(1.0, 1.0, 1.0, 1.0));
    return out;
}