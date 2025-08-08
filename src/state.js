// Game state and ECS (Entity Component System) module
export const GameState = {
  started: false,
  paused: false,
  frozen: false,
  difficulty: null,
  score: 0,
  casualties: 0,
  gameWon: false,
  gameLost: false,
  winTimer: 0,
  winThreshold: 30, // seconds
  
  reset() {
    this.started = false;
    this.paused = false;
    this.frozen = false;
    this.score = 0;
    this.casualties = 0;
    this.gameWon = false;
    this.gameLost = false;
    this.winTimer = 0;
  }
};

export const ECS = {
  entities: [],
  nextId: 1,

  add(entity) {
    if (!entity.id) {
      entity.id = this.nextId++;
    }
    this.entities.push(entity);
    return entity;
  },

  remove(entity) {
    const index = this.entities.indexOf(entity);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  },

  removeById(id) {
    const index = this.entities.findIndex(e => e.id === id);
    if (index > -1) {
      this.entities.splice(index, 1);
    }
  },

  findByType(type) {
    return this.entities.filter(e => e.type === type);
  },

  findById(id) {
    return this.entities.find(e => e.id === id);
  },

  clear() {
    this.entities.length = 0;
    this.nextId = 1;
  },

  count() {
    return this.entities.length;
  },

  // Helper methods for common queries
  getPlayer() {
    return this.entities.find(e => e.type === 'player');
  },

  getCitizens() {
    return this.entities.filter(e => e.type === 'citizen');
  },

  getPickups() {
    return this.entities.filter(e => e.type === 'pickup');
  },

  getBarriers() {
    return this.entities.filter(e => e.type === 'barrier');
  },

  getInfectedCount() {
    return this.getCitizens().filter(c => c.state === 'infected').length;
  },

  getHealthyCount() {
    return this.getCitizens().filter(c => c.state === 'healthy').length;
  },

  getRecoveringCount() {
    return this.getCitizens().filter(c => c.state === 'recovering').length;
  },

  getImmuneCount() {
    return this.getCitizens().filter(c => c.state === 'immune').length;
  },

  getDeceasedCount() {
    return this.getCitizens().filter(c => c.state === 'deceased').length;
  }
};