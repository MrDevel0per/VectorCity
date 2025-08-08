// Event director - manages dynamic events during gameplay
import { ECS, GameState } from '../state.js';
import { Events } from '../events.js';

export const EventDirector = {
  timer: 0,
  events: [],
  activeEvent: null,
  nextEventTime: 0,
  
  init() {
    this.setupEvents();
    this.scheduleNextEvent();
  },

  setupEvents() {
    this.events = [
      {
        id: 'mutation_spike',
        name: 'Mutation Spike',
        description: 'Virus mutation increases transmission rate temporarily',
        duration: 15, // seconds
        cooldown: 60,
        probability: 0.3,
        execute: () => this.mutationSpike(),
        cleanup: () => this.mutationSpikeEnd()
      },
      {
        id: 'curfew',
        name: 'Emergency Curfew',
        description: 'Citizens move slower, easier to contain',
        duration: 20,
        cooldown: 90,
        probability: 0.25,
        execute: () => this.emergencyCurfew(),
        cleanup: () => this.emergencyCurfewEnd()
      },
      {
        id: 'supply_drop',
        name: 'Medical Supply Drop',
        description: 'Emergency supplies delivered to the area',
        duration: 0, // Instant effect
        cooldown: 80,
        probability: 0.4,
        execute: () => this.supplyDrop(),
        cleanup: () => {}
      },
      {
        id: 'hotspot',
        name: 'Infection Hotspot',
        description: 'New cluster of infections appears',
        duration: 0, // Instant effect
        cooldown: 70,
        probability: 0.35,
        execute: () => this.infectionHotspot(),
        cleanup: () => {}
      }
    ];
  },

  update(dt) {
    if (!GameState.started || GameState.paused || GameState.frozen) return;
    if (GameState.gameWon || GameState.gameLost) return;
    
    this.timer += dt;
    
    // Update active event
    if (this.activeEvent) {
      this.activeEvent.timeLeft -= dt;
      
      if (this.activeEvent.timeLeft <= 0) {
        this.endActiveEvent();
      }
    }
    
    // Check for new events
    if (!this.activeEvent && this.timer >= this.nextEventTime) {
      this.triggerRandomEvent();
      this.scheduleNextEvent();
    }
  },

  scheduleNextEvent() {
    // Random time between 30-60 seconds
    this.nextEventTime = this.timer + (Math.random() * 30 + 30);
  },

  triggerRandomEvent() {
    // Filter available events (not on cooldown)
    const availableEvents = this.events.filter(event => 
      !event.lastTriggered || (this.timer - event.lastTriggered) >= event.cooldown
    );
    
    if (availableEvents.length === 0) return;
    
    // Select event based on probability
    const selectedEvent = this.selectEventByProbability(availableEvents);
    if (selectedEvent) {
      this.triggerEvent(selectedEvent);
    }
  },

  selectEventByProbability(events) {
    const totalProbability = events.reduce((sum, event) => sum + event.probability, 0);
    const random = Math.random() * totalProbability;
    
    let current = 0;
    for (const event of events) {
      current += event.probability;
      if (random <= current) {
        return event;
      }
    }
    
    return events[0]; // Fallback
  },

  triggerEvent(eventData) {
    this.activeEvent = {
      ...eventData,
      timeLeft: eventData.duration,
      startTime: this.timer
    };
    
    eventData.lastTriggered = this.timer;
    
    // Execute event
    eventData.execute();
    
    // Show event banner
    this.showEventBanner(eventData);
    
    Events.emit('log', { text: `Event: ${eventData.name}`, cls: 'warn' });
  },

  endActiveEvent() {
    if (this.activeEvent) {
      this.activeEvent.cleanup();
      
      Events.emit('log', { text: `Event ended: ${this.activeEvent.name}`, cls: 'good' });
      
      this.activeEvent = null;
    }
  },

  showEventBanner(eventData) {
    const eventBanner = document.getElementById('eventBanner');
    if (!eventBanner) return;
    
    eventBanner.textContent = `${eventData.name.toUpperCase()}: ${eventData.description}`;
    eventBanner.className = 'eventBanner warn';
    eventBanner.classList.remove('hidden');
    
    // Hide after duration or 5 seconds for instant events
    const hideTime = eventData.duration > 0 ? eventData.duration * 1000 : 5000;
    setTimeout(() => {
      eventBanner.classList.add('hidden');
    }, hideTime);
  },

  // Event implementations
  mutationSpike() {
    // Increase infection spread rate
    const citizens = ECS.getCitizens();
    citizens.forEach(citizen => {
      if (citizen.spreadMultiplier === undefined) {
        citizen.spreadMultiplier = 1.0;
      }
      citizen.spreadMultiplier *= 1.5;
    });
    
    Events.emit('log', { text: 'Virus mutation detected! Increased transmission rate.', cls: 'infect' });
  },

  mutationSpikeEnd() {
    // Restore normal infection spread rate
    const citizens = ECS.getCitizens();
    citizens.forEach(citizen => {
      if (citizen.spreadMultiplier !== undefined) {
        citizen.spreadMultiplier = Math.max(1.0, citizen.spreadMultiplier / 1.5);
      }
    });
    
    Events.emit('log', { text: 'Mutation spike subsided. Transmission rate normalized.', cls: 'good' });
  },

  emergencyCurfew() {
    // Slow down citizen movement
    const citizens = ECS.getCitizens();
    citizens.forEach(citizen => {
      if (citizen.speedMultiplier === undefined) {
        citizen.speedMultiplier = 1.0;
      }
      citizen.speedMultiplier *= 0.3;
    });
    
    Events.emit('log', { text: 'Emergency curfew enacted. Citizens moving slower.', cls: 'good' });
  },

  emergencyCurfewEnd() {
    // Restore normal movement speed
    const citizens = ECS.getCitizens();
    citizens.forEach(citizen => {
      if (citizen.speedMultiplier !== undefined) {
        citizen.speedMultiplier = Math.min(1.0, citizen.speedMultiplier / 0.3);
      }
    });
    
    Events.emit('log', { text: 'Emergency curfew lifted. Citizens resume normal activity.', cls: 'warn' });
  },

  supplyDrop() {
    const player = ECS.getPlayer();
    if (!player) return;
    
    // Add vaccines and barriers
    const vaccineBonus = Math.floor(Math.random() * 3) + 2; // 2-4 vaccines
    const barrierBonus = Math.floor(Math.random() * 2) + 1; // 1-2 barriers
    
    player.vaccines += vaccineBonus;
    player.barriers += barrierBonus;
    
    Events.emit('log', { text: `Supply drop received! +${vaccineBonus} vaccines, +${barrierBonus} barriers`, cls: 'good' });
    
    // Update score
    GameState.score += 50;
  },

  infectionHotspot() {
    const citizens = ECS.getCitizens();
    const healthyCitizens = citizens.filter(c => c.state === 'healthy' && !c.trapped);
    
    if (healthyCitizens.length === 0) return;
    
    // Infect 2-4 random healthy citizens
    const infectCount = Math.min(healthyCitizens.length, Math.floor(Math.random() * 3) + 2);
    
    for (let i = 0; i < infectCount; i++) {
      const randomIndex = Math.floor(Math.random() * healthyCitizens.length);
      const citizen = healthyCitizens.splice(randomIndex, 1)[0];
      
      if (window.__MODULES__?.InfectionSystem) {
        window.__MODULES__.InfectionSystem.infectCitizen(citizen);
      }
    }
    
    Events.emit('log', { text: `Infection hotspot emerged! ${infectCount} new cases detected.`, cls: 'infect' });
  },

  // Manual event triggering (for testing)
  forceEvent(eventId) {
    const event = this.events.find(e => e.id === eventId);
    if (event && !this.activeEvent) {
      this.triggerEvent(event);
    }
  },

  reset() {
    this.timer = 0;
    this.nextEventTime = 0;
    this.endActiveEvent();
    
    // Reset event cooldowns
    this.events.forEach(event => {
      event.lastTriggered = 0;
    });
  }
};