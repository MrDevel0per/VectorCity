// Tutorial system module
import { Events } from './events.js';

export const Tutorial = {
  active: false,
  tasks: [],
  currentTaskIndex: 0,
  completedTasks: new Set(),

  init() {
    this.active = true;
    this.setupTasks();
    this.updateUI();
  },

  setupTasks() {
    this.tasks = [
      {
        id: 'move',
        title: 'Move around',
        description: 'Use WASD keys to move around the city',
        completed: false,
        check: () => this.checkMovement()
      },
      {
        id: 'pickup',
        title: 'Collect vaccine',
        description: 'Walk into a green vaccine pickup',
        completed: false,
        check: () => this.checkPickup()
      },
      {
        id: 'scan',
        title: 'Pulse scan',
        description: 'Press Q to scan for infected citizens',
        completed: false,
        check: () => this.checkScan()
      },
      {
        id: 'heal',
        title: 'Heal infected',
        description: 'Get close to infected citizen and press F to heal',
        completed: false,
        check: () => this.checkHeal()
      },
      {
        id: 'barrier',
        title: 'Deploy barrier',
        description: 'Press E to deploy a containment barrier',
        completed: false,
        check: () => this.checkBarrier()
      },
      {
        id: 'complete',
        title: 'Tutorial complete!',
        description: 'You are ready to contain the outbreak',
        completed: false,
        check: () => true
      }
    ];
  },

  evaluate() {
    if (!this.active) return;

    // Check current task
    const currentTask = this.tasks[this.currentTaskIndex];
    if (currentTask && !currentTask.completed && currentTask.check()) {
      this.completeTask(currentTask.id);
    }
  },

  completeTask(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task && !task.completed) {
      task.completed = true;
      this.completedTasks.add(taskId);
      
      // Show completion toast
      if (window.__MODULES__?.UI) {
        window.__MODULES__.UI.toast(`✓ ${task.title} completed!`);
      }
      
      // Move to next task
      this.currentTaskIndex++;
      
      // Update UI
      this.updateUI();
      
      // Log completion
      Events.emit('log', { text: `Tutorial: ${task.title} completed`, cls: 'good' });
      
      // Check if all tasks are done
      if (this.currentTaskIndex >= this.tasks.length) {
        this.complete();
      }
    }
  },

  complete() {
    this.active = false;
    Events.emit('log', { text: 'Tutorial completed! Good luck containing the outbreak.', cls: 'good' });
    
    // Hide tutorial panel
    const panel = document.getElementById('tasksPanel');
    if (panel) {
      panel.classList.add('hidden');
    }
  },

  updateUI() {
    const panel = document.getElementById('tasksPanel');
    const progressSpan = document.getElementById('taskProgress');
    const itemsDiv = document.getElementById('taskItems');
    
    if (!panel || !progressSpan || !itemsDiv) return;

    // Show panel
    panel.classList.remove('hidden');
    
    // Update progress
    const progress = (this.completedTasks.size / this.tasks.length) * 100;
    progressSpan.style.width = `${progress}%`;
    
    // Update task list
    itemsDiv.innerHTML = '';
    this.tasks.forEach((task, index) => {
      const item = document.createElement('div');
      item.className = `taskItem ${task.completed ? 'completed' : ''} ${index === this.currentTaskIndex ? 'current' : ''}`;
      item.innerHTML = `
        <div class="taskTitle">${task.completed ? '✓' : '○'} ${task.title}</div>
        <div class="taskDesc">${task.description}</div>
      `;
      itemsDiv.appendChild(item);
    });
  },

  // Task checking methods
  checkMovement() {
    // Simple movement check - if player has moved from initial position
    const player = window.__MODULES__?.state?.ECS?.getPlayer();
    if (player) {
      const initialPos = { x: 0, y: 0, z: 8 };
      const distance = Math.sqrt(
        Math.pow(player.pos.x - initialPos.x, 2) +
        Math.pow(player.pos.z - initialPos.z, 2)
      );
      return distance > 5;
    }
    return false;
  },

  checkPickup() {
    // Check if player has collected a vaccine
    const player = window.__MODULES__?.state?.ECS?.getPlayer();
    return player && player.vaccines > 0;
  },

  checkScan() {
    // This would be triggered by the pulse system
    return this.completedTasks.has('scan');
  },

  checkHeal() {
    // This would be triggered by healing an infected citizen
    return this.completedTasks.has('heal');
  },

  checkBarrier() {
    // Check if any barriers have been deployed
    const barriers = window.__MODULES__?.state?.ECS?.getBarriers();
    return barriers && barriers.length > 0;
  },

  // Methods to be called by other systems
  markScanCompleted() {
    if (!this.completedTasks.has('scan')) {
      this.completeTask('scan');
    }
  },

  markHealCompleted() {
    if (!this.completedTasks.has('heal')) {
      this.completeTask('heal');
    }
  }
};