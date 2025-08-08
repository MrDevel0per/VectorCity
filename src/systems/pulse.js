// Pulse scan system
import * as THREE from 'three';
import { ECS } from '../state.js';
import { Events } from '../events.js';

export const PulseSystem = {
  pulses: [],
  halos: [],
  cooldown: 0,
  maxCooldown: 2.0, // 2 seconds between pulses
  
  update(dt) {
    this.cooldown = Math.max(0, this.cooldown - dt);
    
    // Update active pulses
    for (let i = this.pulses.length - 1; i >= 0; i--) {
      const pulse = this.pulses[i];
      
      pulse.life -= dt;
      pulse.radius += pulse.speed * dt;
      
      if (pulse.life <= 0) {
        // Remove expired pulse
        if (pulse.mesh && pulse.mesh.parent) {
          pulse.mesh.parent.remove(pulse.mesh);
        }
        this.pulses.splice(i, 1);
        continue;
      }
      
      // Update visual
      if (pulse.mesh) {
        pulse.mesh.scale.set(pulse.radius, 1, pulse.radius);
        pulse.mesh.material.opacity = pulse.life / pulse.maxLife;
      }
      
      // Check for infected citizens within pulse
      if (!pulse.detected) {
        this.detectInfected(pulse);
        pulse.detected = true;
      }
    }
    
    // Update tracking halos
    for (let i = this.halos.length - 1; i >= 0; i--) {
      const halo = this.halos[i];
      
      halo.life -= dt;
      
      if (halo.life <= 0 || !halo.target || halo.target.state !== 'infected') {
        // Remove expired or invalid halo
        if (halo.mesh && halo.mesh.parent) {
          halo.mesh.parent.remove(halo.mesh);
        }
        this.halos.splice(i, 1);
        continue;
      }
      
      // Follow target
      if (halo.target && halo.mesh) {
        halo.mesh.position.copy(halo.target.pos);
        halo.mesh.position.y += 2.5;
        
        // Pulsing effect
        const scale = 1 + Math.sin(Date.now() * 0.01) * 0.2;
        halo.mesh.scale.set(scale, scale, scale);
        
        // Fade out
        halo.mesh.material.opacity = halo.life / halo.maxLife;
      }
    }
  },

  triggerPulse() {
    const player = ECS.getPlayer();
    if (!player) return false;
    
    if (this.cooldown > 0) {
      Events.emit('log', { text: `Pulse cooling down: ${this.cooldown.toFixed(1)}s`, cls: 'warn' });
      return false;
    }
    
    // Create pulse effect
    const pulse = {
      position: player.pos.clone(),
      radius: 1,
      speed: 15, // radius expansion per second
      life: 2.0,
      maxLife: 2.0,
      detected: false
    };
    
    // Create visual representation
    this.createPulseMesh(pulse);
    
    this.pulses.push(pulse);
    this.cooldown = this.maxCooldown;
    
    Events.emit('log', { text: 'Pulse scan activated', cls: 'good' });
    
    // Mark tutorial task as completed
    if (window.__MODULES__?.Tutorial) {
      window.__MODULES__.Tutorial.markScanCompleted?.();
    }
    
    return true;
  },

  createPulseMesh(pulse) {
    const geometry = new THREE.RingGeometry(0.8, 1.2, 32);
    const material = new THREE.MeshBasicMaterial({
      color: 0x35ffd4,
      transparent: true,
      opacity: 1.0,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(pulse.position);
    mesh.position.y = 0.1; // Slightly above ground
    mesh.rotation.x = Math.PI / 2;
    
    pulse.mesh = mesh;
    
    // Add to scene
    if (window.__MODULES__?.World?.scene) {
      window.__MODULES__.World.scene.add(mesh);
    }
  },

  detectInfected(pulse) {
    const citizens = ECS.getCitizens();
    let detectedCount = 0;
    
    citizens.forEach(citizen => {
      if (citizen.state === 'infected') {
        const distance = citizen.pos.distanceTo(pulse.position);
        
        if (distance <= pulse.radius) {
          // Create tracking halo for this infected citizen
          this.createHalo(citizen);
          detectedCount++;
        }
      }
    });
    
    if (detectedCount > 0) {
      Events.emit('log', { text: `${detectedCount} infected detected!`, cls: 'infect' });
      
      // Update score
      if (window.__MODULES__?.GameState) {
        window.__MODULES__.GameState.score += detectedCount * 10;
      }
    } else {
      Events.emit('log', { text: 'No infected detected in scan area', cls: 'good' });
    }
  },

  createHalo(target) {
    // Remove any existing halo for this target
    this.removeHaloForTarget(target);
    
    const halo = {
      target: target,
      life: 2.0, // Follow for 2 seconds
      maxLife: 2.0
    };
    
    // Create visual representation
    const geometry = new THREE.RingGeometry(0.8, 1.2, 16);
    const material = new THREE.MeshBasicMaterial({
      color: 0xff3d55,
      transparent: true,
      opacity: 0.8,
      side: THREE.DoubleSide
    });
    
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.copy(target.pos);
    mesh.position.y += 2.5;
    mesh.rotation.x = Math.PI / 2;
    
    halo.mesh = mesh;
    
    // Add to scene
    if (window.__MODULES__?.World?.scene) {
      window.__MODULES__.World.scene.add(mesh);
    }
    
    this.halos.push(halo);
  },

  removeHaloForTarget(target) {
    for (let i = this.halos.length - 1; i >= 0; i--) {
      const halo = this.halos[i];
      if (halo.target === target) {
        if (halo.mesh && halo.mesh.parent) {
          halo.mesh.parent.remove(halo.mesh);
        }
        this.halos.splice(i, 1);
      }
    }
  },

  canPulse() {
    return this.cooldown <= 0;
  },

  getCooldownProgress() {
    return 1 - (this.cooldown / this.maxCooldown);
  },

  clear() {
    // Remove all pulses
    this.pulses.forEach(pulse => {
      if (pulse.mesh && pulse.mesh.parent) {
        pulse.mesh.parent.remove(pulse.mesh);
      }
    });
    this.pulses.length = 0;
    
    // Remove all halos
    this.halos.forEach(halo => {
      if (halo.mesh && halo.mesh.parent) {
        halo.mesh.parent.remove(halo.mesh);
      }
    });
    this.halos.length = 0;
    
    this.cooldown = 0;
  }
};