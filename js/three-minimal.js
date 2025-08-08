// Minimal Three.js implementation for VectorCity
// This provides basic functionality without external dependencies

window.THREE = {
  // Basic math utilities
  MathUtils: {
    lerp: function(x, y, t) {
      return (1 - t) * x + t * y;
    }
  },
  
  // Vector3 class
  Vector3: function(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    
    this.set = function(x, y, z) {
      this.x = x;
      this.y = y;
      this.z = z;
      return this;
    };
    
    this.copy = function(v) {
      this.x = v.x;
      this.y = v.y;
      this.z = v.z;
      return this;
    };
    
    this.clone = function() {
      return new THREE.Vector3(this.x, this.y, this.z);
    };
    
    this.add = function(v) {
      this.x += v.x;
      this.y += v.y;
      this.z += v.z;
      return this;
    };
    
    this.sub = function(v) {
      this.x -= v.x;
      this.y -= v.y;
      this.z -= v.z;
      return this;
    };
    
    this.addScaledVector = function(v, s) {
      this.x += v.x * s;
      this.y += v.y * s;
      this.z += v.z * s;
      return this;
    };
    
    this.normalize = function() {
      const len = this.length();
      if (len > 0) {
        this.x /= len;
        this.y /= len;
        this.z /= len;
      }
      return this;
    };
    
    this.length = function() {
      return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    };
    
    this.lengthSq = function() {
      return this.x * this.x + this.y * this.y + this.z * this.z;
    };
    
    this.distanceTo = function(v) {
      const dx = this.x - v.x;
      const dy = this.y - v.y;
      const dz = this.z - v.z;
      return Math.sqrt(dx * dx + dy * dy + dz * dz);
    };
    
    this.setY = function(y) {
      this.y = y;
      return this;
    };
    
    this.applyAxisAngle = function(axis, angle) {
      // Simplified rotation around axis
      const cos = Math.cos(angle);
      const sin = Math.sin(angle);
      
      if (axis.x === 1 && axis.y === 0 && axis.z === 0) {
        // Rotate around X axis
        const y = this.y * cos - this.z * sin;
        const z = this.y * sin + this.z * cos;
        this.y = y;
        this.z = z;
      } else if (axis.x === 0 && axis.y === 1 && axis.z === 0) {
        // Rotate around Y axis
        const x = this.x * cos + this.z * sin;
        const z = -this.x * sin + this.z * cos;
        this.x = x;
        this.z = z;
      }
      return this;
    };
  },
  
  // Vector2 class
  Vector2: function(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  },
  
  // Color class
  Color: function(color) {
    if (typeof color === 'number') {
      this.r = ((color >> 16) & 255) / 255;
      this.g = ((color >> 8) & 255) / 255;
      this.b = (color & 255) / 255;
    } else {
      this.r = 1;
      this.g = 1;
      this.b = 1;
    }
  },
  
  // Scene class
  Scene: function() {
    this.background = null;
    this.fog = null;
    this.children = [];
    
    this.add = function(obj) {
      this.children.push(obj);
    };
    
    this.remove = function(obj) {
      const index = this.children.indexOf(obj);
      if (index > -1) {
        this.children.splice(index, 1);
      }
    };
  },
  
  // Basic WebGL renderer stub
  WebGLRenderer: function(params = {}) {
    this.domElement = params.canvas || document.createElement('canvas');
    this.shadowMap = { enabled: false, type: null };
    this.toneMappingExposure = 1;
    
    this.setPixelRatio = function(ratio) {};
    this.setSize = function(width, height) {
      this.domElement.width = width;
      this.domElement.height = height;
    };
    this.render = function(scene, camera) {
      // Basic fallback rendering
      const ctx = this.domElement.getContext('2d');
      if (ctx) {
        ctx.fillStyle = '#0d1822';
        ctx.fillRect(0, 0, this.domElement.width, this.domElement.height);
        
        // Draw some basic shapes to show it's working
        ctx.fillStyle = '#4dffd7';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('VectorCity - Basic Mode', this.domElement.width/2, this.domElement.height/2);
        ctx.fillText('External Three.js modules blocked', this.domElement.width/2, this.domElement.height/2 + 30);
        ctx.fillText('Using fallback renderer', this.domElement.width/2, this.domElement.height/2 + 60);
      }
    };
  },
  
  // Camera class
  PerspectiveCamera: function(fov, aspect, near, far) {
    this.position = new THREE.Vector3();
    this.aspect = aspect;
    
    this.lookAt = function(target) {};
    this.updateProjectionMatrix = function() {};
  },
  
  // Clock class
  Clock: function() {
    this.startTime = Date.now();
    this.oldTime = this.startTime;
    
    this.getDelta = function() {
      const newTime = Date.now();
      const delta = (newTime - this.oldTime) / 1000;
      this.oldTime = newTime;
      return Math.min(delta, 0.1); // Cap at 100ms
    };
  },
  
  // Raycaster stub
  Raycaster: function() {
    this.set = function(origin, direction) {};
    this.intersectObjects = function(objects) { return []; };
  },
  
  // Basic geometry stubs
  PlaneGeometry: function() { 
    this.dispose = function() {}; 
    return this; 
  },
  BoxGeometry: function() { 
    this.dispose = function() {}; 
    return this; 
  },
  SphereGeometry: function() { 
    this.dispose = function() {}; 
    return this; 
  },
  CylinderGeometry: function() { 
    this.dispose = function() {}; 
    return this; 
  },
  CapsuleGeometry: function() { 
    this.dispose = function() {}; 
    return this; 
  },
  DodecahedronGeometry: function() { 
    this.dispose = function() {}; 
    return this; 
  },
  BufferGeometry: function() { 
    this.setAttribute = function() {};
    this.dispose = function() {};
    return this;
  },
  BufferAttribute: function() { 
    this.dispose = function() {};
    return this; 
  },
  
  // Basic material stubs
  MeshStandardMaterial: function(params = {}) {
    this.color = params.color || 0xffffff;
    this.emissive = params.emissive || 0x000000;
    this.emissiveIntensity = params.emissiveIntensity || 0;
    this.transparent = params.transparent || false;
    this.opacity = params.opacity || 1;
    this.dispose = function() {};
    return this;
  },
  MeshBasicMaterial: function(params = {}) {
    this.color = params.color || 0xffffff;
    this.transparent = params.transparent || false;
    this.opacity = params.opacity || 1;
    this.dispose = function() {};
    return this;
  },
  ShaderMaterial: function(params = {}) {
    this.side = params.side;
    this.uniforms = params.uniforms || {};
    this.dispose = function() {};
    return this;
  },
  PointsMaterial: function() { 
    this.dispose = function() {};
    return {}; 
  },
  
  // Mesh class
  Mesh: function(geometry, material) {
    this.geometry = geometry;
    this.material = material;
    this.position = new THREE.Vector3();
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = { set: function() {} };
    this.castShadow = false;
    this.receiveShadow = false;
    
    this.add = function(child) {};
    
    this.clone = function() {
      const cloned = new THREE.Mesh(this.geometry, this.material);
      cloned.position.copy(this.position);
      cloned.rotation = { ...this.rotation };
      return cloned;
    };
  },
  
  // Group class
  Group: function() {
    this.add = function(obj) {};
  },
  
  // Points class
  Points: function() { return {}; },
  
  // Light classes
  DirectionalLight: function(color, intensity) {
    this.position = new THREE.Vector3();
    this.castShadow = false;
    this.shadow = { 
      mapSize: { set: function() {} },
      camera: {}
    };
    return this;
  },
  HemisphereLight: function() { return {}; },
  
  // Fog
  FogExp2: function() { return {}; },
  
  // Constants
  BackSide: 1,
  PCFSoftShadowMap: 2,
  AdditiveBlending: 3
};

console.log('Minimal Three.js implementation loaded');