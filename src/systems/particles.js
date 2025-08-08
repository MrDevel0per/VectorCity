// Particle system module
import * as THREE from 'three';

export const ParticleSystem = {
  particles: [],
  
  update(dt) {
    // Update all particles
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      
      particle.life -= dt;
      if (particle.life <= 0) {
        // Remove dead particle
        if (particle.mesh && particle.mesh.parent) {
          particle.mesh.parent.remove(particle.mesh);
        }
        this.particles.splice(i, 1);
        continue;
      }
      
      // Update position
      particle.position.add(particle.velocity.clone().multiplyScalar(dt));
      if (particle.mesh) {
        particle.mesh.position.copy(particle.position);
        
        // Update opacity based on life
        const alpha = particle.life / particle.maxLife;
        if (particle.mesh.material) {
          particle.mesh.material.opacity = alpha;
        }
      }
    }
  },

  createHealEffect(position) {
    const particle = {
      position: position.clone(),
      velocity: new THREE.Vector3(0, 2, 0),
      life: 1.0,
      maxLife: 1.0,
      type: 'heal'
    };
    
    // Create visual representation
    const geometry = new THREE.SphereGeometry(0.1, 8, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0x40ffa5,
      transparent: true,
      opacity: 1.0
    });
    
    particle.mesh = new THREE.Mesh(geometry, material);
    particle.mesh.position.copy(position);
    
    // Add to scene
    if (window.__MODULES__?.World?.scene) {
      window.__MODULES__.World.scene.add(particle.mesh);
    }
    
    this.particles.push(particle);
  },

  createInfectionEffect(position) {
    const particle = {
      position: position.clone(),
      velocity: new THREE.Vector3(
        (Math.random() - 0.5) * 2,
        Math.random() * 1 + 0.5,
        (Math.random() - 0.5) * 2
      ),
      life: 0.8,
      maxLife: 0.8,
      type: 'infection'
    };
    
    const geometry = new THREE.SphereGeometry(0.05, 6, 6);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff3d55,
      transparent: true,
      opacity: 1.0
    });
    
    particle.mesh = new THREE.Mesh(geometry, material);
    particle.mesh.position.copy(position);
    
    if (window.__MODULES__?.World?.scene) {
      window.__MODULES__.World.scene.add(particle.mesh);
    }
    
    this.particles.push(particle);
  },

  createBarrierEffect(position) {
    const particle = {
      position: position.clone(),
      velocity: new THREE.Vector3(0, 0.5, 0),
      life: 0.5,
      maxLife: 0.5,
      type: 'barrier'
    };
    
    const geometry = new THREE.RingGeometry(0.5, 1.0, 8);
    const material = new THREE.MeshBasicMaterial({
      color: 0x35ffd4,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide
    });
    
    particle.mesh = new THREE.Mesh(geometry, material);
    particle.mesh.position.copy(position);
    particle.mesh.rotation.x = Math.PI / 2;
    
    if (window.__MODULES__?.World?.scene) {
      window.__MODULES__.World.scene.add(particle.mesh);
    }
    
    this.particles.push(particle);
  },

  clear() {
    // Remove all particles
    this.particles.forEach(particle => {
      if (particle.mesh && particle.mesh.parent) {
        particle.mesh.parent.remove(particle.mesh);
      }
    });
    this.particles.length = 0;
  }
};