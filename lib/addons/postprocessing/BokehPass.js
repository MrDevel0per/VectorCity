// Minimal BokehPass stub
export class BokehPass {
  constructor(scene, camera, params) {
    this.scene = scene;
    this.camera = camera;
    this.params = params || {};
    this.enabled = false; // Disabled by default
    this.uniforms = {
      focus: { value: 85 },
      aperture: { value: 0.0012 }
    };
  }

  render(renderer, writeBuffer, readBuffer) {
    // DOF effect disabled in minimal version
  }
}