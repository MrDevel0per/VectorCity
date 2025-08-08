// App entry: wiring modules, main loop, level start, and freeze-on-intro logic
import * as THREE from 'three';
import { World } from './world.js';
import { UI } from './ui.js';
import { Input } from './input.js';
import { AudioSys } from './audio.js';
import { Events } from './events.js';
import { DIFFICULTIES } from './constants.js';
import { GameState, ECS } from './state.js';
import { Player, EntityFactory } from './entities.js';

// Systems
import { PlayerSystem } from './systems/player.js';
import { ParticleSystem } from './systems/particles.js';
import { PickupSystem } from './systems/pickups.js';
import { BarrierSystem } from './systems/barriers.js';
import { InfectionSystem } from './systems/infection.js';
import { PulseSystem } from './systems/pulse.js';
import { AI } from './systems/ai.js';
import { BackgroundSeeder } from './systems/seeder.js';
import { EventDirector } from './directors/eventDirector.js';
import { GameDirector } from './directors/gameDirector.js';
import { Tutorial } from './tutorial.js';

// Pause/Settings (kept simple here)
export const Settings={
  applyEffects(){
    const bloom=document.getElementById('toggleBloom').checked;
    const dof=document.getElementById('toggleDOF').checked;
    const vig=document.getElementById('toggleVignette').checked;
    if(World.bloomPass) World.bloomPass.enabled=bloom;
    if(World.bokehPass) World.bokehPass.enabled=dof;
    if(World.vignettePass) World.vignettePass.uniforms.enabled.value=vig?1:0;
  }
};
export const Pause={
  show(){GameState.paused=true; document.getElementById('pauseMenu').classList.remove('hidden'); if(document.pointerLockElement) document.exitPointerLock();},
  resume(){GameState.paused=false; document.getElementById('pauseMenu').classList.add('hidden');},
  toggle(){GameState.paused?this.resume():this.show();}
};

// Difficulty selection UI
const DifficultyMenu={
  selectedKey:null, grid:document.getElementById('difficultyGrid'), startBtn:document.getElementById('startButton'),
  init(){
    Object.values(DIFFICULTIES).forEach(diff=>{
      const card=document.createElement('div'); card.className='diffCard'; card.dataset.diff=diff.key;
      card.innerHTML=`<div class="diffTitle">${diff.label} <span class="badge">${diff.tutorial?'GUIDED':'MODE'}</span></div><div class="diffDesc">${diff.desc}</div><div style="margin-top:auto;opacity:.65;font-size:.62rem;">Pop: ${diff.citizens} • Init Inf: ${diff.initialInfected}</div>`;
      card.addEventListener('click',()=>this.select(diff.key,card)); this.grid.appendChild(card);
    });
    this.startBtn.addEventListener('click',()=>this.start());
  },
  select(key,el){ this.selectedKey=key; document.querySelectorAll('.diffCard').forEach(c=>c.classList.remove('selected')); el.classList.add('selected'); this.startBtn.disabled=false; this.startBtn.textContent='START ('+DIFFICULTIES[key].label.toUpperCase()+')'; },
  start(){ if(!this.selectedKey) return; GameState.difficulty=DIFFICULTIES[this.selectedKey]; document.getElementById('startMenu').classList.add('fadeOut'); setTimeout(()=>document.getElementById('startMenu')?.remove(),650); startSimulationWithDifficulty(GameState.difficulty); }
};

// Spawning
function spawnPlayer(){ const cfg=GameState.difficulty||DIFFICULTIES.tutorial; const p=new Player(cfg); p.pos.set(0,0,8); ECS.add(p); PlayerSystem.lastPos.copy(p.pos); }
function spawnCitizens(){ const cfg=GameState.difficulty||DIFFICULTIES.tutorial;
  for(let i=0;i<cfg.citizens;i++){ const c=EntityFactory.createCitizen();
    if(i<cfg.initialInfected){ c.state='infected'; c.timer=0; c.infectedElapsed=0; c.nextStateTime=Math.random()*8+11; EntityFactory.updateCitizenMaterial(c); }
    ECS.add(c);
  }
}

function startSimulationWithDifficulty(diff){
  if(GameState.started) return;
  GameState.started=true;

  spawnPlayer();
  spawnCitizens();

  // Freeze simulation until intro prompt dismissed
  GameState.frozen = true;

  Tutorial.init();
  GameDirector.init(); // Starts in playing mode, but frozen gate prevents updates

  Events.emit('log',{text:`Difficulty: ${diff.label} initialized.`,cls:'good'});
  UI.story(
    `<b>${diff.tutorial?'Tutorial Mode':'Simulation Online'}</b><br><br>${
      diff.tutorial
      ? 'Follow the tutorial tasks. Win by holding infections ≤3 for 30s. Casualty cap applies.'
      : 'Win: infections ≤3 for 30s. Lose: casualties exceed cap.'
    }<br><br>Casualty cap: <b>${diff.casualtyCap}</b>`,
    // onClose: unfreeze simulation and allow gameplay to begin
    ()=>{ GameState.frozen = false; }
  );
  document.getElementById('missionText').textContent = diff.tutorial? 'Complete tutorial tasks' : 'Win: hold infections ≤3 for 30s • Lose: casualties exceed cap';
}

function gotoMainMenu(){ location.reload(); }

// Main loop
let running=true;
function animate(){
  if(!running) return;
  requestAnimationFrame(animate);
  const dtRaw=World.clock.getDelta(), dt=Math.min(dtRaw,0.1);

  // Simulation only when not paused and not frozen
  if(GameState.started && !GameState.paused && !GameState.frozen){
    AI.sim(dt); AI.spread(dt); AI.mortality(dt);
    PlayerSystem.update(dt);
    PickupSystem.update(dt);
    BarrierSystem.update(dt);
    InfectionSystem.update(dt);
    ParticleSystem.update(dt);
    PulseSystem.update(dt);
    BackgroundSeeder.update(dt);
    EventDirector.update(dt);
    GameDirector.update(dt);
    Tutorial.evaluate();
  } else {
    // Still allow camera look while paused/frozen? We'll keep it disabled by early return in PlayerSystem.update
    PlayerSystem.update(0); // harmless call for pointer yaw updates when not locked
  }

  World.render(); Events.emit('tick',{dt});
}

// Boot
(async function boot(){
  const canvas=document.getElementById('game');
  await World.init(canvas);
  UI.init(); Input.init(canvas); AudioSys.init?.();
  DifficultyMenu.init();
  // Settings toggles
  Settings.applyEffects();
  ['toggleBloom','toggleDOF','toggleVignette'].forEach(id=>document.getElementById(id).addEventListener('change',()=>Settings.applyEffects()));
  document.getElementById('resumeBtn').addEventListener('click',()=>Pause.resume());
  document.getElementById('restartBtn').addEventListener('click',()=>location.reload());
  document.getElementById('quitBtn').addEventListener('click',()=>location.reload());

  animate();
  setTimeout(()=>Events.emit('log',{text:'Core systems ready. Select a difficulty.',cls:'warn'}),550);
  setTimeout(()=>document.getElementById('loadHint').textContent='Generating daylight city & outbreak model...',420);
  setTimeout(()=>document.getElementById('loadHint').textContent='Ready. Choose a difficulty to start.',1150);
  Events.emit('story',{html:`<b>Pandemic Response Console</b><br><br>
Daylight clarity, slower early spread on higher levels, solid trapping barriers, and dynamic city events.<br>
Pulse (Q) tags infected with halos that follow them briefly. Sporadic new cases may emerge until the level ends.<br><br>
Select a difficulty to begin.`});
})();

// Expose modules for cross-references without deep coupling
window.__MODULES__={
  World, UI, Input, AudioSys, Events,
  DIFFICULTIES, constants:{DIFFICULTIES}, ECS, GameState,
  PlayerSystem, ParticleSystem, PickupSystem, BarrierSystem, InfectionSystem, PulseSystem, AI, BackgroundSeeder,
  EventDirector, GameDirector, Tutorial,
  Settings, Pause, gotoMainMenu, state:{ECS,GameState}
};