// Minimal EffectComposer stub
export class EffectComposer {
  constructor(renderer) {
    this.renderer = renderer;
    this.passes = [];
  }

  addPass(pass) {
    this.passes.push(pass);
  }

  render() {
    // Simple render without effects
    if (this.renderer && this.scene && this.camera) {
      this.renderer.render(this.scene, this.camera);
    }
  }

  setSize(width, height) {
    // Placeholder
  }
}