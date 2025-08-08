// Input handling module
export const Input = {
  keys: {},
  mouseX: 0,
  mouseY: 0,
  canvas: null,
  pointerLocked: false,

  init(canvas) {
    this.canvas = canvas;
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Keyboard events
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      
      // Handle special keys
      switch(e.key.toLowerCase()) {
        case 'escape':
          // Toggle pause
          window.__MODULES__?.Pause?.toggle();
          e.preventDefault();
          break;
        case 'h':
          // Help toggle is handled by UI module
          break;
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    // Mouse events
    if (this.canvas) {
      this.canvas.addEventListener('click', () => {
        if (!this.pointerLocked) {
          this.canvas.requestPointerLock();
        }
      });

      document.addEventListener('pointerlockchange', () => {
        this.pointerLocked = document.pointerLockElement === this.canvas;
      });

      document.addEventListener('mousemove', (e) => {
        if (this.pointerLocked) {
          this.mouseX = e.movementX || 0;
          this.mouseY = e.movementY || 0;
        }
      });
    }

    // Prevent context menu
    document.addEventListener('contextmenu', (e) => e.preventDefault());
  },

  // Input state queries
  isPressed(keyCode) {
    return !!this.keys[keyCode];
  },

  getMouseMovement() {
    const movement = { x: this.mouseX, y: this.mouseY };
    this.mouseX = 0;
    this.mouseY = 0;
    return movement;
  },

  // Common key mappings
  isMovingForward() {
    return this.isPressed('KeyW');
  },

  isMovingBackward() {
    return this.isPressed('KeyS');
  },

  isMovingLeft() {
    return this.isPressed('KeyA');
  },

  isMovingRight() {
    return this.isPressed('KeyD');
  },

  isSprinting() {
    return this.isPressed('ShiftLeft') || this.isPressed('ShiftRight');
  },

  isHealing() {
    return this.isPressed('KeyF');
  },

  isBarrier() {
    return this.isPressed('KeyE');
  },

  isPulse() {
    return this.isPressed('KeyQ');
  }
};