// Player movement, interactions (heal, barrier, scan)
import * as THREE from 'three';
import { Input } from '../input.js';
import { ECS, GameState } from '../state.js';
import { Events } from '../events.js';
import { clamp } from '../utils.js';
import { EntityFactory, Pulse } from '../entities.js';
import { AudioSys } from '../audio.js';

export const PlayerSystem={
  yaw:0,pitch:0,cameraHeight:1.85,ray:new THREE.Raycaster(),moveAccum:0,lastPos:new THREE.Vector3(),

  update(dt){
    if(GameState.paused || GameState.frozen) return;
    const p=ECS.player; if(!p) return;
    const {dx,dy}=Input.consumeMouseDelta();
    this.yaw -= dx*0.0024; this.pitch = clamp(this.pitch - dy*0.002,-Math.PI/2+0.2,Math.PI/2-0.2);
    const cam=window.__WORLD__.camera;
    const lookDir=new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(1,0,0),this.pitch).applyAxisAngle(new THREE.Vector3(0,1,0),this.yaw);
    const forwardXZ=lookDir.clone().setY(0); if(forwardXZ.lengthSq()<1e-6) forwardXZ.set(0,0,-1); forwardXZ.normalize();
    const rightXZ=new THREE.Vector3(forwardXZ.z,0,-forwardXZ.x);
    const move=new THREE.Vector3(); if(Input.isDown('KeyW')) move.add(forwardXZ); if(Input.isDown('KeyS')) move.sub(forwardXZ); if(Input.isDown('KeyA')) move.sub(rightXZ); if(Input.isDown('KeyD')) move.add(rightXZ);
    if(move.lengthSq()) move.normalize(); p.pos.addScaledVector(move,(Input.sprint?1.85:1)*p.speed*dt);
    p.pos.x=clamp(p.pos.x,-120,120); p.pos.z=clamp(p.pos.z,-120,120);
    cam.position.copy(p.pos).y=this.cameraHeight; cam.lookAt(cam.position.clone().add(lookDir));
    this.moveAccum+=p.pos.distanceTo(this.lastPos); this.lastPos.copy(p.pos);

    Object.keys(p.cooldowns).forEach(k=>p.cooldowns[k]=Math.max(0,p.cooldowns[k]-dt));
    if(Input.isDown('KeyF') && !p.cooldowns.vaccine && p.inventory.vaccines>0){ this.tryHeal(); p.cooldowns.vaccine=.75; }
    if(Input.isDown('KeyE') && !p.cooldowns.barrier && p.inventory.barriers>0){ this.deployBarrier(); p.cooldowns.barrier=2.2; }
    if(Input.isDown('KeyQ') && !p.cooldowns.scan){ this.scanPulse(); p.cooldowns.scan=4.5 * window.__MODULES__.EventDirector.scanCooldownFactor(); }
  },

  tryHeal(){
    const cam=window.__WORLD__.camera;
    const dir=new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(1,0,0),this.pitch).applyAxisAngle(new THREE.Vector3(0,1,0),this.yaw).normalize();
    this.ray.set(cam.position,dir);
    const hits=this.ray.intersectObjects(ECS.citizens.map(c=>c.mesh));
    if(hits.length){
      const c=ECS.citizens.find(cc=>cc.mesh===hits[0].object);
      if(c && c.state==='infected'){
        c.state='recovering'; c.timer=0; c.nextStateTime=Math.random()*6+7; c.infectedElapsed=0; EntityFactory.updateCitizenMaterial(c);
        ECS.player.inventory.vaccines--; ECS.player.score+=160;
        Events.emit('log',{text:'Healed infection (accelerated immunity)',cls:'good'}); AudioSys.blip('heal'); window.__MODULES__.Tutorial.flag('healedCitizen');
      }
    }
  },

  deployBarrier(){
    const forward=new THREE.Vector3(0,0,-1).applyAxisAngle(new THREE.Vector3(1,0,0),this.pitch).applyAxisAngle(new THREE.Vector3(0,1,0),this.yaw).setY(0).normalize();
    const pos=ECS.player.pos.clone().addScaledVector(forward,2.6);
    const b=EntityFactory.createBarrier(pos, 4.2); ECS.add(b);
    ECS.player.inventory.barriers--; ECS.player.score+=55;
    Events.emit('log',{text:'Barrier deployed (solid + trapping)',cls:'good'}); AudioSys.blip('barrier'); window.__MODULES__.Tutorial.flag('deployedBarrier');
  },

  scanPulse(){
    const pulse=new Pulse(ECS.player.pos); pulse.mesh=EntityFactory.createPulseRing(ECS.player.pos); ECS.add(pulse);
    ECS.player.score+=18; Events.emit('log',{text:'Pulse scan emitted',cls:'good'}); AudioSys.blip('scan'); window.__MODULES__.Tutorial.flag('usedScan');
  }
};