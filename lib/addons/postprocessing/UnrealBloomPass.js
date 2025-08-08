// Minimal UnrealBloomPass stub
export class UnrealBloomPass {
  constructor(resolution, strength, radius, threshold) {
    this.resolution = resolution;
    this.strength = strength;
    this.radius = radius;
    this.threshold = threshold;
    this.enabled = true;
  }

  render(renderer, writeBuffer, readBuffer) {
    // Bloom effect disabled in minimal version
  }
}