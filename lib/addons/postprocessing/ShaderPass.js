// Minimal ShaderPass stub
export class ShaderPass {
  constructor(shader) {
    this.shader = shader;
    this.enabled = true;
    this.uniforms = shader?.uniforms || {};
  }

  render(renderer, writeBuffer, readBuffer) {
    // Shader effects disabled in minimal version
  }
}