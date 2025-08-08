// Minimal Three.js stub for VectorCity game
// This provides basic 3D functionality without external dependencies

// Basic math utilities
class Vector3 {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  set(x, y, z) {
    this.x = x;
    this.y = y;
    this.z = z;
    return this;
  }

  copy(v) {
    this.x = v.x;
    this.y = v.y;
    this.z = v.z;
    return this;
  }

  clone() {
    return new Vector3(this.x, this.y, this.z);
  }

  add(v) {
    this.x += v.x;
    this.y += v.y;
    this.z += v.z;
    return this;
  }

  multiplyScalar(scalar) {
    this.x *= scalar;
    this.y *= scalar;
    this.z *= scalar;
    return this;
  }

  distanceTo(v) {
    const dx = this.x - v.x;
    const dy = this.y - v.y;
    const dz = this.z - v.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  normalize() {
    const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    if (length > 0) {
      this.x /= length;
      this.y /= length;
      this.z /= length;
    }
    return this;
  }
}

class Clock {
  constructor() {
    this.oldTime = 0;
    this.elapsedTime = 0;
    this.running = false;
  }

  start() {
    this.oldTime = performance.now() / 1000;
    this.running = true;
  }

  stop() {
    this.running = false;
  }

  getDelta() {
    let diff = 0;
    if (this.running) {
      const newTime = performance.now() / 1000;
      diff = newTime - this.oldTime;
      this.oldTime = newTime;
      this.elapsedTime += diff;
    }
    return diff;
  }
}

class Object3D {
  constructor() {
    this.position = new Vector3();
    this.rotation = new Vector3();
    this.scale = new Vector3(1, 1, 1);
    this.children = [];
    this.parent = null;
    this.visible = true;
  }

  add(object) {
    this.children.push(object);
    object.parent = this;
  }

  remove(object) {
    const index = this.children.indexOf(object);
    if (index !== -1) {
      this.children.splice(index, 1);
      object.parent = null;
    }
  }
}

class Scene extends Object3D {
  constructor() {
    super();
    this.type = 'Scene';
  }
}

class Camera extends Object3D {
  constructor() {
    super();
    this.type = 'Camera';
  }
}

class PerspectiveCamera extends Camera {
  constructor(fov = 50, aspect = 1, near = 0.1, far = 2000) {
    super();
    this.fov = fov;
    this.aspect = aspect;
    this.near = near;
    this.far = far;
  }

  updateProjectionMatrix() {
    // Placeholder for matrix calculations
  }
}

class Geometry {
  constructor() {
    this.vertices = [];
    this.faces = [];
  }
}

class SphereGeometry extends Geometry {
  constructor(radius = 1, widthSegments = 8, heightSegments = 6) {
    super();
    this.radius = radius;
    this.widthSegments = widthSegments;
    this.heightSegments = heightSegments;
  }
}

class CylinderGeometry extends Geometry {
  constructor(radiusTop = 1, radiusBottom = 1, height = 1, radialSegments = 8, heightSegments = 1, openEnded = false) {
    super();
    this.radiusTop = radiusTop;
    this.radiusBottom = radiusBottom;
    this.height = height;
    this.radialSegments = radialSegments;
    this.heightSegments = heightSegments;
    this.openEnded = openEnded;
  }
}

class CapsuleGeometry extends Geometry {
  constructor(radius = 1, length = 1, capSegments = 4, radialSegments = 8) {
    super();
    this.radius = radius;
    this.length = length;
    this.capSegments = capSegments;
    this.radialSegments = radialSegments;
  }
}

class RingGeometry extends Geometry {
  constructor(innerRadius = 0.5, outerRadius = 1, thetaSegments = 8, phiSegments = 1, thetaStart = 0, thetaLength = Math.PI * 2) {
    super();
    this.innerRadius = innerRadius;
    this.outerRadius = outerRadius;
    this.thetaSegments = thetaSegments;
    this.phiSegments = phiSegments;
    this.thetaStart = thetaStart;
    this.thetaLength = thetaLength;
  }
}

class Material {
  constructor() {
    this.color = 0xffffff;
    this.transparent = false;
    this.opacity = 1.0;
    this.side = 0; // FrontSide
    this.emissive = 0x000000;
    this.emissiveIntensity = 1.0;
  }
}

class MeshStandardMaterial extends Material {
  constructor(parameters = {}) {
    super();
    this.metalness = 0.0;
    this.roughness = 1.0;
    Object.assign(this, parameters);
  }
}

class MeshBasicMaterial extends Material {
  constructor(parameters = {}) {
    super();
    Object.assign(this, parameters);
  }
}

class Raycaster {
  constructor() {
    this.ray = {
      origin: new Vector3(),
      direction: new Vector3()
    };
  }

  setFromCamera(coords, camera) {
    // Placeholder raycasting
  }

  intersectObjects(objects, recursive = false) {
    // Placeholder - returns empty array
    return [];
  }
}

class Color {
  constructor(color = 0xffffff) {
    this.r = 1;
    this.g = 1;
    this.b = 1;
    this.setHex(color);
  }

  setHex(hex) {
    this.r = ((hex >> 16) & 255) / 255;
    this.g = ((hex >> 8) & 255) / 255;
    this.b = (hex & 255) / 255;
    return this;
  }
}

class Fog {
  constructor(color, near = 1, far = 1000) {
    this.color = new Color(color);
    this.near = near;
    this.far = far;
  }
}

class FogExp2 {
  constructor(color, density = 0.00025) {
    this.color = new Color(color);
    this.density = density;
  }
}

class Light extends Object3D {
  constructor(color, intensity = 1) {
    super();
    this.color = new Color(color);
    this.intensity = intensity;
  }
}

class DirectionalLight extends Light {
  constructor(color, intensity) {
    super(color, intensity);
    this.type = 'DirectionalLight';
  }
}

class HemisphereLight extends Light {
  constructor(skyColor, groundColor, intensity) {
    super(skyColor, intensity);
    this.groundColor = new Color(groundColor);
    this.type = 'HemisphereLight';
  }
}

class Mesh extends Object3D {
  constructor(geometry, material) {
    super();
    this.geometry = geometry;
    this.material = material;
    this.type = 'Mesh';
  }
}

class Group extends Object3D {
  constructor() {
    super();
    this.type = 'Group';
  }
}

class WebGLRenderer {
  constructor(parameters = {}) {
    this.domElement = parameters.canvas || document.createElement('canvas');
    this.setSize(window.innerWidth, window.innerHeight);
    this.shadowMap = {
      enabled: false,
      type: null
    };
    this.toneMapping = 0;
    this.toneMappingExposure = 1.0;
    
    // Basic WebGL context
    this.context = this.domElement.getContext('webgl') || this.domElement.getContext('experimental-webgl');
    if (!this.context) {
      console.warn('WebGL not supported, using 2D canvas fallback');
      this.context = this.domElement.getContext('2d');
    }
  }

  setSize(width, height) {
    this.domElement.width = width;
    this.domElement.height = height;
    this.domElement.style.width = width + 'px';
    this.domElement.style.height = height + 'px';
  }

  setPixelRatio(ratio) {
    // Placeholder
  }

  render(scene, camera) {
    // Basic rendering - clear canvas with dark blue
    if (this.context && this.context.fillRect) {
      this.context.fillStyle = '#0c1621';
      this.context.fillRect(0, 0, this.domElement.width, this.domElement.height);
      
      // Simple text overlay to show the game is working
      this.context.fillStyle = '#35ffd4';
      this.context.font = '20px Arial';
      this.context.textAlign = 'center';
      this.context.fillText('VectorCity - 3D View Active', this.domElement.width / 2, this.domElement.height / 2);
      this.context.fillText('(Minimal 3D renderer)', this.domElement.width / 2, this.domElement.height / 2 + 30);
    }
  }
}

// Constants
const DoubleSide = 2;
const FrontSide = 0;
const ACESFilmicToneMapping = 1;
const PCFSoftShadowMap = 1;

// Export everything
export {
  Vector3,
  Clock,
  Object3D,
  Scene,
  Camera,
  PerspectiveCamera,
  Geometry,
  SphereGeometry,
  CylinderGeometry,
  CapsuleGeometry,
  RingGeometry,
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Mesh,
  Group,
  WebGLRenderer,
  Raycaster,
  Color,
  Fog,
  FogExp2,
  Light,
  DirectionalLight,
  HemisphereLight,
  DoubleSide,
  FrontSide,
  ACESFilmicToneMapping,
  PCFSoftShadowMap
};

export default {
  Vector3,
  Clock,
  Object3D,
  Scene,
  Camera,
  PerspectiveCamera,
  Geometry,
  SphereGeometry,
  CylinderGeometry,
  CapsuleGeometry,
  RingGeometry,
  Material,
  MeshBasicMaterial,
  MeshStandardMaterial,
  Mesh,
  Group,
  WebGLRenderer,
  Raycaster,
  Color,
  Fog,
  FogExp2,
  Light,
  DirectionalLight,
  HemisphereLight,
  DoubleSide,
  FrontSide,
  ACESFilmicToneMapping,
  PCFSoftShadowMap
};