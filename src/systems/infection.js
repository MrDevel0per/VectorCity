// Infection simulation system
import { ECS, GameState } from '../state.js';
import { Events } from '../events.js';

export const InfectionSystem = {
  lastUpdate: 0,
  
  update(dt) {
    this.lastUpdate += dt;
    
    // Update infection progression
    this.updateInfectionProgression(dt);
    
    // Update UI stats every 0.1 seconds
    if (this.lastUpdate >= 0.1) {
      this.updateUIStats();
      this.lastUpdate = 0;
    }
  },

  updateInfectionProgression(dt) {
    const citizens = ECS.getCitizens();
    const difficulty = GameState.difficulty;
    
    if (!difficulty) return;
    
    citizens.forEach(citizen => {
      if (citizen.state === 'infected') {
        citizen.infectedElapsed = (citizen.infectedElapsed || 0) + dt;
        
        // Update timer for state transitions
        citizen.timer += dt;
        
        // Check for recovery
        if (citizen.timer >= citizen.nextStateTime) {
          this.recoverCitizen(citizen);
        }
      } else if (citizen.state === 'recovering') {
        citizen.timer += dt;
        
        // Check for immunity
        if (citizen.timer >= citizen.nextStateTime) {
          this.immunizeCitizen(citizen);
        }
      }
    });
  },

  recoverCitizen(citizen) {
    citizen.state = 'recovering';
    citizen.timer = 0;
    citizen.nextStateTime = Math.random() * 5 + 3; // 3-8 seconds to become immune
    
    // Update visual
    if (window.__MODULES__?.EntityFactory) {
      window.__MODULES__.EntityFactory.updateCitizenMaterial(citizen);
    }
    
    Events.emit('log', { text: 'Citizen recovered from infection', cls: 'good' });
  },

  immunizeCitizen(citizen) {
    citizen.state = 'immune';
    citizen.timer = 0;
    citizen.nextStateTime = Infinity;
    
    // Update visual
    if (window.__MODULES__?.EntityFactory) {
      window.__MODULES__.EntityFactory.updateCitizenMaterial(citizen);
    }
    
    Events.emit('log', { text: 'Citizen gained immunity', cls: 'good' });
  },

  infectCitizen(citizen) {
    if (citizen.state !== 'healthy') return false;
    
    citizen.state = 'infected';
    citizen.timer = 0;
    citizen.infectedElapsed = 0;
    citizen.nextStateTime = Math.random() * 8 + 11; // 11-19 seconds until recovery
    
    // Update visual
    if (window.__MODULES__?.EntityFactory) {
      window.__MODULES__.EntityFactory.updateCitizenMaterial(citizen);
    }
    
    // Create infection particle effect
    if (window.__MODULES__?.ParticleSystem) {
      window.__MODULES__.ParticleSystem.createInfectionEffect(citizen.pos);
    }
    
    Events.emit('log', { text: 'Citizen infected!', cls: 'infect' });
    
    return true;
  },

  healCitizen(citizen) {
    if (citizen.state !== 'infected') return false;
    
    citizen.state = 'immune';
    citizen.timer = 0;
    citizen.nextStateTime = Infinity;
    citizen.infectedElapsed = 0;
    
    // Update visual
    if (window.__MODULES__?.EntityFactory) {
      window.__MODULES__.EntityFactory.updateCitizenMaterial(citizen);
    }
    
    // Create heal particle effect
    if (window.__MODULES__?.ParticleSystem) {
      window.__MODULES__.ParticleSystem.createHealEffect(citizen.pos);
    }
    
    Events.emit('log', { text: 'Citizen healed!', cls: 'good' });
    
    // Update score
    GameState.score += 100;
    
    // Mark tutorial task as completed
    if (window.__MODULES__?.Tutorial) {
      window.__MODULES__.Tutorial.markHealCompleted?.();
    }
    
    return true;
  },

  killCitizen(citizen) {
    if (citizen.state === 'deceased') return false;
    
    citizen.state = 'deceased';
    citizen.timer = 0;
    citizen.nextStateTime = Infinity;
    
    // Update visual
    if (window.__MODULES__?.EntityFactory) {
      window.__MODULES__.EntityFactory.updateCitizenMaterial(citizen);
    }
    
    // Update casualties
    GameState.casualties++;
    
    Events.emit('log', { text: 'Citizen died from infection', cls: 'infect' });
    
    // Check lose condition
    const difficulty = GameState.difficulty;
    if (difficulty && GameState.casualties >= difficulty.casualtyCap) {
      this.triggerGameOver();
    }
    
    return true;
  },

  triggerGameOver() {
    GameState.gameLost = true;
    Events.emit('log', { text: 'GAME OVER: Casualty cap exceeded!', cls: 'infect' });
    
    // Show game over UI
    setTimeout(() => {
      if (window.__MODULES__?.UI) {
        window.__MODULES__.UI.story(
          `<b>CONTAINMENT FAILED</b><br><br>
          The outbreak has exceeded the casualty threshold.<br>
          Casualties: ${GameState.casualties}/${GameState.difficulty?.casualtyCap}<br><br>
          Better luck next time, Commander.`,
          () => {
            if (window.__MODULES__?.gotoMainMenu) {
              window.__MODULES__.gotoMainMenu();
            }
          }
        );
      }
    }, 1000);
  },

  updateUIStats() {
    const stats = this.getInfectionStats();
    
    if (window.__MODULES__?.UI) {
      window.__MODULES__.UI.updateStats(stats);
    }
    
    // Check win condition
    this.checkWinCondition(stats);
  },

  getInfectionStats() {
    const citizens = ECS.getCitizens();
    const infected = citizens.filter(c => c.state === 'infected').length;
    const healthy = citizens.filter(c => c.state === 'healthy').length;
    const recovering = citizens.filter(c => c.state === 'recovering').length;
    const immune = citizens.filter(c => c.state === 'immune').length;
    const deceased = citizens.filter(c => c.state === 'deceased').length;
    
    const total = citizens.length;
    const rt = total > 0 ? (infected / Math.max(1, healthy + recovering + immune)) * 2.5 : 0;
    
    const player = ECS.getPlayer();
    
    return {
      infected,
      citizens: total,
      healthy,
      recovering,
      immune,
      deceased,
      rt,
      vaccines: player?.vaccines || 0,
      barriers: player?.barriers || 0,
      casualties: GameState.casualties,
      score: GameState.score
    };
  },

  checkWinCondition(stats) {
    if (GameState.gameWon || GameState.gameLost) return;
    
    const winThreshold = 3;
    
    if (stats.infected <= winThreshold) {
      GameState.winTimer += 0.1; // Updated every 0.1 seconds
      
      if (GameState.winTimer >= GameState.winThreshold) {
        this.triggerVictory();
      }
    } else {
      GameState.winTimer = 0;
    }
  },

  triggerVictory() {
    GameState.gameWon = true;
    GameState.score += 1000; // Victory bonus
    
    Events.emit('log', { text: 'VICTORY: Outbreak contained!', cls: 'good' });
    
    setTimeout(() => {
      if (window.__MODULES__?.UI) {
        window.__MODULES__.UI.story(
          `<b>CONTAINMENT SUCCESSFUL</b><br><br>
          You have successfully contained the outbreak!<br>
          Final Score: ${GameState.score}<br>
          Casualties: ${GameState.casualties}/${GameState.difficulty?.casualtyCap}<br><br>
          Excellent work, Commander!`,
          () => {
            if (window.__MODULES__?.gotoMainMenu) {
              window.__MODULES__.gotoMainMenu();
            }
          }
        );
      }
    }, 1000);
  }
};