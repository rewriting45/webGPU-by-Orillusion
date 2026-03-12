@group(0) @binding(0) var<uniform> color: vec4f;

@fragment
fn main(@location(0) fragPostion: vec4f) -> @location(0) vec4f {
    var a = color;
    return vec4f(fragPostion);
}