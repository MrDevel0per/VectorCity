// Citizen movement + spread + mortality (delegates multipliers to EventDirector/GameDirector)
import { ECS, GameState } from '../state.js';
import { EntityFactory } from '../entities.js';
import { Events } from '../events.js';

export const AI={
  sim(dt){
    if(GameState.frozen) return;
    const speedMul=window.__MODULES__.EventDirector.speedMultiplier();
    ECS.citizens.forEach(c=>{
      if(c.state==='deceased') return;
      c.timer+=dt;
      if(c.state==='infected') c.infectedElapsed += dt; else c.infectedElapsed = 0;
      if(c.state==='infected' && c.timer>=c.nextStateTime){ c.state='recovering'; c.timer=0; c.nextStateTime=Math.random()*6+6; EntityFactory.updateCitizenMaterial(c); }
      else if(c.state==='recovering' && c.timer>=c.nextStateTime){ c.state='immune'; c.timer=0; EntityFactory.updateCitizenMaterial(c); }
      if(!c.target || c.pos.distanceTo(c.target)<0.6){ c.target.set(c.pos.x+(Math.random()*24-12),0,c.pos.z+(Math.random()*24-12)); }
      const d=c.target.clone().sub(c.pos); const len=d.length(); if(len>0.001){ d.normalize(); c.pos.addScaledVector(d,c.speed*speedMul*dt); c.mesh.position.copy(c.pos); c.mesh.rotation.y=Math.atan2(d.x,d.z); }
    });
  },

  spread(dt){
    if(GameState.frozen) return;
    const dcfg=GameState.difficulty||window.__MODULES__.constants.DIFFICULTIES.normal;
    const ramp = (1 - dcfg.spreadRampStart) * Math.min(1, window.__MODULES__.GameDirector.elapsed/60) + dcfg.spreadRampStart;
    const eventBoost=window.__MODULES__.EventDirector.spreadMultiplier();
    const mult=(dcfg.spreadMultiplier||1)*ramp*eventBoost;
    const arr=ECS.citizens;
    for(let i=0;i<arr.length;i++){
      const a=arr[i]; if(a.state!=='infected') continue;
      for(let j=i+1;j<arr.length;j++){
        const b=arr[j]; if(b.state!=='healthy') continue;
        const dist=a.pos.distanceTo(b.pos);
        if(dist<1.85){
          const chance=Math.max(0,(1.85-dist)/1.85)*a.infectiousness*dt*0.75*mult;
          if(Math.random()<chance){
            b.state='infected'; b.timer=0; b.infectedElapsed=0; b.nextStateTime=Math.random()*8+11;
            EntityFactory.updateCitizenMaterial(b);
            const p=EntityFactory.createParticle(0xff3d55); p.pos.copy(b.pos); p.mesh.position.copy(p.pos); p.vel.set(Math.random()*.5-.25,Math.random()*0.8+0.6,Math.random()*.5-.25); ECS.add(p);
            Events.emit('log',{text:'Infection event detected',cls:'infect'});
          }
        }
      }
    }
  },

  mortality(dt){
    if(GameState.frozen) return;
    const dcfg=GameState.difficulty||window.__MODULES__.constants.DIFFICULTIES.normal;
    const rate = dcfg.deathRate || 0.004;
    ECS.citizens.forEach(c=>{
      if(c.state!=='infected') return;
      if(c.infectedElapsed < (dcfg.deathMinSec||10)) return;
      if(Math.random() < rate * dt * 60){
        c.state='deceased'; c.timer=0; c.infectedElapsed=0; EntityFactory.updateCitizenMaterial(c);
        c.mesh.rotation.z = Math.PI/2; c.mesh.position.y = 0.1;
        ECS.casualties++; Events.emit('log',{text:'Citizen deceased',cls:'warn'}); window.__MODULES__.GameDirector.onCasualty();
      }
    });
  }
};