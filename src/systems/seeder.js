// Background seeding system - periodically spawns new infections
import { ECS, GameState } from '../state.js';
import { Events } from '../events.js';

export const BackgroundSeeder = {
  timer: 0,
  nextSeedTime: 0,
  
  update(dt) {
    if (!GameState.started || GameState.paused || GameState.frozen) return;
    if (GameState.gameWon || GameState.gameLost) return;
    
    const difficulty = GameState.difficulty;
    if (!difficulty || !difficulty.seedGap) return;
    
    this.timer += dt;
    
    // Initialize next seed time if not set
    if (this.nextSeedTime === 0) {
      this.nextSeedTime = this.getRandomSeedTime(difficulty);
    }
    
    // Check if it's time to seed
    if (this.timer >= this.nextSeedTime) {
      this.attemptSeed(difficulty);
      this.timer = 0;
      this.nextSeedTime = this.getRandomSeedTime(difficulty);
    }
  },

  getRandomSeedTime(difficulty) {
    const [min, max] = difficulty.seedGap;
    return Math.random() * (max - min) + min;
  },

  attemptSeed(difficulty) {
    const citizens = ECS.getCitizens();
    const healthyCitizens = citizens.filter(c => c.state === 'healthy');
    const infectedCount = citizens.filter(c => c.state === 'infected').length;
    
    // Don't seed if there are too many infected already
    const maxInfected = Math.floor(citizens.length * 0.3); // Max 30% infected
    if (infectedCount >= maxInfected) {
      Events.emit('log', { text: 'Background seeding skipped - too many infected', cls: 'warn' });
      return;
    }
    
    // Don't seed if there are no healthy citizens
    if (healthyCitizens.length === 0) {
      return;
    }
    
    // Select random healthy citizen to infect
    const targetCitizen = healthyCitizens[Math.floor(Math.random() * healthyCitizens.length)];
    
    // Check if citizen is trapped in a barrier
    if (targetCitizen.trapped) {
      Events.emit('log', { text: 'Background seeding blocked by barrier', cls: 'good' });
      return;
    }
    
    // Infect the citizen
    if (window.__MODULES__?.InfectionSystem) {
      const success = window.__MODULES__.InfectionSystem.infectCitizen(targetCitizen);
      if (success) {
        Events.emit('log', { text: 'New infection emerged in the city!', cls: 'infect' });
        
        // Add to event banner
        this.showSeedEvent();
      }
    }
  },

  showSeedEvent() {
    const eventBanner = document.getElementById('eventBanner');
    if (!eventBanner) return;
    
    eventBanner.textContent = 'SPORADIC CASE: New infection detected in the population';
    eventBanner.className = 'eventBanner infect';
    eventBanner.classList.remove('hidden');
    
    // Hide after 3 seconds
    setTimeout(() => {
      eventBanner.classList.add('hidden');
    }, 3000);
  },

  reset() {
    this.timer = 0;
    this.nextSeedTime = 0;
  },

  // Manually trigger a seed (for testing or events)
  forceSeed() {
    const difficulty = GameState.difficulty;
    if (difficulty) {
      this.attemptSeed(difficulty);
    }
  }
};