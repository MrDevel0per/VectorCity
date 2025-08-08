// Barrier system module
import * as THREE from 'three';
import { ECS } from '../state.js';
import { Events } from '../events.js';

export const BarrierSystem = {
  barriers: [],
  
  update(dt) {
    // Update barrier animations or effects if needed
    this.barriers.forEach(barrier => {
      if (barrier.mesh && barrier.animate) {
        // Simple pulsing animation
        barrier.mesh.scale.y = 1 + Math.sin(Date.now() * 0.005) * 0.1;
      }
    });
  },

  deployBarrier(position) {
    const player = ECS.getPlayer();
    if (!player || player.barriers <= 0) {
      Events.emit('log', { text: 'No barriers available!', cls: 'warn' });
      return false;
    }

    // Check if position is valid (not too close to other barriers)
    const tooClose = this.barriers.some(barrier => {
      const distance = position.distanceTo(barrier.position);
      return distance < 3; // Minimum distance between barriers
    });

    if (tooClose) {
      Events.emit('log', { text: 'Too close to existing barrier!', cls: 'warn' });
      return false;
    }

    // Create barrier entity
    const barrier = {
      id: ECS.nextId++,
      type: 'barrier',
      position: position.clone(),
      radius: 2.0,
      height: 4.0,
      solid: true,
      animate: true
    };

    // Create visual representation
    this.createBarrierMesh(barrier);
    
    // Trap citizens inside the barrier
    this.trapCitizensInside(barrier);
    
    // Add to systems
    this.barriers.push(barrier);
    ECS.add(barrier);
    
    // Consume barrier from player
    player.barriers--;
    
    // Create particle effect
    if (window.__MODULES__?.ParticleSystem) {
      window.__MODULES__.ParticleSystem.createBarrierEffect(position);
    }
    
    Events.emit('log', { text: 'Barrier deployed!', cls: 'good' });
    
    // Mark tutorial task as completed
    if (window.__MODULES__?.Tutorial) {
      window.__MODULES__.Tutorial.markBarrierCompleted?.();
    }
    
    return true;
  },

  createBarrierMesh(barrier) {
    // Create cylindrical barrier with top ring
    const group = new THREE.Group();
    
    // Main cylinder
    const cylinderGeometry = new THREE.CylinderGeometry(barrier.radius, barrier.radius, barrier.height, 16, 1, true);
    const cylinderMaterial = new THREE.MeshBasicMaterial({
      color: 0x35ffd4,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide
    });
    const cylinder = new THREE.Mesh(cylinderGeometry, cylinderMaterial);
    cylinder.position.y = barrier.height / 2;
    group.add(cylinder);
    
    // Top ring
    const ringGeometry = new THREE.RingGeometry(barrier.radius - 0.1, barrier.radius + 0.1, 16);
    const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x35ffd4,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeometry, ringMaterial);
    ring.position.y = barrier.height;
    ring.rotation.x = Math.PI / 2;
    group.add(ring);
    
    // Base ring
    const baseRing = ring.clone();
    baseRing.position.y = 0;
    group.add(baseRing);
    
    group.position.copy(barrier.position);
    barrier.mesh = group;
    
    // Add to scene
    if (window.__MODULES__?.World?.scene) {
      window.__MODULES__.World.scene.add(group);
    }
  },

  trapCitizensInside(barrier) {
    const citizens = ECS.getCitizens();
    let trappedCount = 0;
    
    citizens.forEach(citizen => {
      const distance = citizen.pos.distanceTo(barrier.position);
      if (distance <= barrier.radius) {
        // Mark citizen as trapped
        citizen.trapped = true;
        citizen.trapBarrier = barrier.id;
        trappedCount++;
      }
    });
    
    if (trappedCount > 0) {
      Events.emit('log', { text: `${trappedCount} citizens trapped in barrier`, cls: 'warn' });
    }
  },

  isPositionBlocked(position, excludeBarrierId = null) {
    return this.barriers.some(barrier => {
      if (excludeBarrierId && barrier.id === excludeBarrierId) return false;
      const distance = position.distanceTo(barrier.position);
      return distance <= barrier.radius;
    });
  },

  getBarrierAt(position, radius = 0.5) {
    return this.barriers.find(barrier => {
      const distance = position.distanceTo(barrier.position);
      return distance <= (barrier.radius + radius);
    });
  },

  removeBarrier(barrierId) {
    const index = this.barriers.findIndex(b => b.id === barrierId);
    if (index > -1) {
      const barrier = this.barriers[index];
      
      // Remove visual representation
      if (barrier.mesh && barrier.mesh.parent) {
        barrier.mesh.parent.remove(barrier.mesh);
      }
      
      // Free trapped citizens
      const citizens = ECS.getCitizens();
      citizens.forEach(citizen => {
        if (citizen.trapBarrier === barrierId) {
          citizen.trapped = false;
          citizen.trapBarrier = null;
        }
      });
      
      // Remove from arrays
      this.barriers.splice(index, 1);
      ECS.removeById(barrierId);
      
      Events.emit('log', { text: 'Barrier removed', cls: 'warn' });
    }
  },

  clear() {
    // Remove all barriers
    this.barriers.forEach(barrier => {
      if (barrier.mesh && barrier.mesh.parent) {
        barrier.mesh.parent.remove(barrier.mesh);
      }
    });
    this.barriers.length = 0;
  }
};