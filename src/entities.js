// Entity classes and factory
import * as THREE from 'three';
import { uuid, textSprite, rand, randInt, clamp } from './utils.js';
import { GameState, ECS } from './state.js';

export const ENTITY_TYPES={PLAYER:'player',CITIZEN:'citizen',PICKUP:'pickup',BARRIER:'barrier',PARTICLE:'particle',PULSE:'pulse'};

export class Entity{constructor(type){this.id=uuid();this.type=type;this.dead=false;this.mesh=null;this.pos=new THREE.Vector3();this.vel=new THREE.Vector3();}}
export class Player extends Entity{constructor(cfg){super(ENTITY_TYPES.PLAYER);this.speed=10;this.inventory={vaccines:cfg.startVaccines,barriers:cfg.startBarriers};this.cooldowns={vaccine:0,barrier:0,scan:0};this.score=0;}}
export class Citizen extends Entity{constructor(scale){super(ENTITY_TYPES.CITIZEN);this.state='healthy';this.timer=0;this.nextStateTime=0;this.infectiousness=clamp(rand(.42,.95)*scale,0,.999);this.speed=rand(2.3,3.1);this.target=new THREE.Vector3();this.infectedElapsed=0;}}
export class Pickup extends Entity{constructor(kind='vaccine'){super(ENTITY_TYPES.PICKUP);this.kind=kind;this.spin=rand(-1.2,1.2);}}
export class Barrier extends Entity{constructor(radius=4.2){super(ENTITY_TYPES.BARRIER);this.life=25;this.radius=radius;this.insideSet=new Set();}}
export class Particle extends Entity{constructor(color){super(ENTITY_TYPES.PARTICLE);this.life=1;this.color=color;}}
export class Pulse extends Entity{constructor(origin){super(ENTITY_TYPES.PULSE);this.origin=origin.clone();this.time=0;this.duration=1.6;this.speed=45;this.radius=0;this.mesh=null;}}

export const EntityFactory={
  citizenMaterials:{
    healthy:new THREE.MeshStandardMaterial({color:0xa3e6ff,roughness:.52,metalness:.12}),
    infected:new THREE.MeshStandardMaterial({color:0xff3d55,emissive:0x840d26,emissiveIntensity:.95,roughness:.42}),
    recovering:new THREE.MeshStandardMaterial({color:0xffb347,emissive:0x5b300f,emissiveIntensity:.6}),
    immune:new THREE.MeshStandardMaterial({color:0x35ffd4,emissive:0x0e6b54,emissiveIntensity:.7}),
    deceased:new THREE.MeshStandardMaterial({color:0x7f8c99,roughness:.95,metalness:0})
  },
  citizenGeometry:new THREE.CapsuleGeometry(.38,1.2,8,14),

  createCitizen(){
    const c=new Citizen(GameState.difficulty?.infectiousnessScale||1);
    c.mesh=new THREE.Mesh(this.citizenGeometry,this.citizenMaterials.healthy);
    c.mesh.castShadow=true;c.mesh.receiveShadow=true;
    c.pos.set(rand(-22,22),0,rand(-22,22)); c.mesh.position.copy(c.pos);
    return c;
  },
  updateCitizenMaterial(c){c.mesh.material=this.citizenMaterials[c.state];},

  createPickup(kind){
    const p=new Pickup(kind);
    const group=new THREE.Group();
    const base=new THREE.Mesh(new THREE.CylinderGeometry(.5,.5,.06,24), new THREE.MeshStandardMaterial({color:0x1d3f52,metalness:.5,roughness:.2,emissive:0x0b2a38,emissiveIntensity:.3}));
    base.position.y=0.03; base.receiveShadow=true; group.add(base);
    const glass=new THREE.Mesh(new THREE.CylinderGeometry(.18,.18,.6,20), new THREE.MeshPhysicalMaterial({color: kind==='vaccine'?0x35ffd4:0x59d4ff,transparent:true,opacity:.75,roughness:.05,metalness:.2,transmission:.85,emissive: kind==='vaccine'?0x0b5a48:0x0c4165,emissiveIntensity:.55}));
    glass.position.y=.4; glass.castShadow=true; group.add(glass);
    const cap=new THREE.Mesh(new THREE.CylinderGeometry(.2,.2,.08,20), new THREE.MeshStandardMaterial({color:0x1a2e3a,metalness:.8,roughness:.15}));
    cap.position.y=.79; cap.castShadow=true; group.add(cap);
    const label=new THREE.Sprite(new THREE.SpriteMaterial({map:textSprite(kind==='vaccine'?'V':'B', kind==='vaccine'?0x35ffd4:0x59d4ff),transparent:true,depthWrite:false}));
    label.scale.set(.28,.14,1); label.position.set(0,.55,.19); group.add(label);
    group.position.set(rand(-18,18),0,rand(-18,18));
    p.mesh=group; p.pos.copy(group.position); return p;
  },

  createBarrier(pos,radius=4.2){
    const b=new Barrier(radius);
    const group=new THREE.Group();
    const wall=new THREE.Mesh(
      new THREE.CylinderGeometry(radius, radius, 2.6, 64, 1, true),
      new THREE.MeshStandardMaterial({color:0x59d4ff,transparent:true,opacity:.35,emissive:0x1c5a7a,emissiveIntensity:.9,side:THREE.DoubleSide})
    );
    wall.position.y=1.3; group.add(wall);
    const disc=new THREE.Mesh(new THREE.CircleGeometry(radius, 64), new THREE.MeshBasicMaterial({color:0x59d4ff,transparent:true,opacity:.14,side:THREE.DoubleSide}));
    disc.rotation.x=-Math.PI/2; disc.position.y=0.02; group.add(disc);
    const ring=new THREE.Mesh(new THREE.TorusGeometry(radius-0.1, 0.1, 12, 64), new THREE.MeshBasicMaterial({color:0x59d4ff,transparent:true,opacity:.9}));
    ring.rotation.x=Math.PI/2; ring.position.y=2.6; group.add(ring);
    group.position.copy(pos); b.mesh=group; b.pos.copy(pos);

    // Capture who starts inside to trap them there
    ECS.citizens.forEach(c=>{ if(c.state!=='deceased' && c.pos.distanceTo(b.pos) < b.radius) b.insideSet.add(c.id); });
    return b;
  },

  createParticle(color){
    const pr=new Particle(color);
    pr.mesh=new THREE.Mesh(new THREE.SphereGeometry(.09,8,8),new THREE.MeshBasicMaterial({color,transparent:true}));
    return pr;
  },

  createPulseRing(origin){
    const geom=new THREE.RingGeometry(0.1,0.12,64);
    const mat=new THREE.MeshBasicMaterial({color:0x35ffd4,transparent:true,opacity:.8,side:THREE.DoubleSide});
    const ring=new THREE.Mesh(geom,mat);
    ring.rotation.x=-Math.PI/2; ring.position.copy(origin).y=0.05;
    return ring;
  },

  createHaloForInfected(c){
    const g=new THREE.Group();
    const ring=new THREE.Mesh(new THREE.RingGeometry(.8,.95,48), new THREE.MeshBasicMaterial({color:0xfff19a,transparent:true,opacity:.95,side:THREE.DoubleSide}));
    ring.rotation.x=-Math.PI/2; ring.position.set(c.pos.x,0.02,c.pos.z);
    const halo=new THREE.Mesh(new THREE.TorusGeometry(.45,.06,12,48), new THREE.MeshBasicMaterial({color:0xfff19a,transparent:true,opacity:.95}));
    halo.position.set(c.pos.x,1.6,c.pos.z); halo.rotation.x=Math.PI/2;
    const beam=new THREE.Mesh(new THREE.CylinderGeometry(.06,.06,1.6,16), new THREE.MeshBasicMaterial({color:0xfff19a,transparent:true,opacity:.45}));
    beam.position.set(c.pos.x,.8,c.pos.z);
    g.add(ring,halo,beam); g.userData={ring,halo,beam}; return g;
  }
};