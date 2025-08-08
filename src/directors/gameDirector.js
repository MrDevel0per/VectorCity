// Win/Lose loop, containment clock, and return to menu
import { Events } from '../events.js';
import { ECS, GameState } from '../state.js';
import { format } from '../utils.js';

export const GameDirector={
  mode:'idle', containClock:0, targetSeconds:30, elapsed:0,
  init(){ this.mode='playing'; this.containClock=0; this.elapsed=0; window.__MODULES__.BackgroundSeeder.reset(); },
  update(dt){
    if(this.mode!=='playing' || GameState.frozen) return;
    this.elapsed+=dt;
    const inf=ECS.countInfected();
    if(inf<=3){ this.containClock+=dt; if(Math.floor(this.containClock)!==Math.floor(this.containClock-dt)) ECS.player.score+=2; }
    else this.containClock=Math.max(0,this.containClock-dt*0.5);
    if(this.containClock>=this.targetSeconds) return this.victory();
    if(ECS.casualties >= (GameState.difficulty?.casualtyCap||12)) return this.defeat();
  },
  onCasualty(){ if(this.mode==='playing' && ECS.casualties >= (GameState.difficulty?.casualtyCap||12)) this.defeat(); },
  victory(){
    this.mode='victory';
    Events.emit('story',{html:`<b>Containment Achieved</b><br><br>
      You held infections ≤ 3 for ${this.targetSeconds}s.<br>
      Casualties: ${ECS.casualties}<br>
      Score: <b>${format(ECS.player.score)}</b><br><br>
      Continue to return to main menu.`, onClose:()=>window.__MODULES__.gotoMainMenu()});
    Events.emit('audio',{kind:'victory'});
  },
  defeat(){
    this.mode='defeat';
    Events.emit('story',{html:`<b>Mission Failed</b><br><br>
      Casualties exceeded threshold (${ECS.casualties}/${GameState.difficulty?.casualtyCap}).<br>
      Score: <b>${format(ECS.player.score)}</b><br><br>
      Continue to return to main menu.`, onClose:()=>window.__MODULES__.gotoMainMenu()});
    Events.emit('audio',{kind:'defeat'});
  }
};