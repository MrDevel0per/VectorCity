// Minimal RenderPass stub
export class RenderPass {
  constructor(scene, camera) {
    this.scene = scene;
    this.camera = camera;
    this.enabled = true;
  }

  render(renderer, writeBuffer, readBuffer) {
    // Basic render
    if (this.enabled && renderer && this.scene && this.camera) {
      renderer.render(this.scene, this.camera);
    }
  }
}