// Pickup bobbing and collection logic
import { ECS } from '../state.js';

export const PickupSystem={
  update(dt){
    ECS.pickups.forEach(p=>{
      if(p.dead) return;
      p.mesh.rotation.y+=dt*p.spin*0.6;
      p.mesh.position.y = Math.abs(Math.sin(performance.now()/900 + p.id.hashCode()*0.0001))*0.12;
      if(p.pos.distanceTo(ECS.player.pos)<1.4){
        (p.kind==='vaccine'?ECS.player.inventory.vaccines++:ECS.player.inventory.barriers++);
        ECS.player.score+=48; p.dead=true; window.__WORLD__.scene.remove(p.mesh);
        window.__MODULES__.UI.addLog(`Collected ${p.kind}`,'good'); 
      }
    });
    ECS.pickups=ECS.pickups.filter(p=>!p.dead);
  }
};