// UI management module
export const UI = {
  init() {
    // Initialize UI event listeners
    this.setupEventListeners();
  },

  setupEventListeners() {
    // Help toggle functionality
    const helpToggleBtn = document.getElementById('helpToggleBtn');
    const helpPanel = document.getElementById('helpPanel');
    const helpCloseBtn = document.getElementById('helpCloseBtn');
    
    helpToggleBtn?.addEventListener('click', () => {
      helpPanel?.classList.toggle('hidden');
    });
    
    helpCloseBtn?.addEventListener('click', () => {
      helpPanel?.classList.add('hidden');
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'h' || e.key === 'H') {
        helpPanel?.classList.toggle('hidden');
      }
    });
  },

  // Story dialog system
  story(htmlContent, onClose = null) {
    const storyBox = document.getElementById('storyBox');
    if (!storyBox) return;
    
    storyBox.innerHTML = `
      <div class="storyContent">
        ${htmlContent}
        <button class="storyCloseBtn" onclick="this.parentElement.parentElement.classList.add('hidden'); ${onClose ? 'window.storyCallback()' : ''}">CONTINUE</button>
      </div>
    `;
    
    if (onClose) {
      window.storyCallback = onClose;
    }
    
    storyBox.classList.remove('hidden');
  },

  // Update UI elements
  updateStats(stats) {
    document.getElementById('infectedCount').textContent = stats.infected || 0;
    document.getElementById('citizenCount').textContent = stats.citizens || 0;
    document.getElementById('rtValue').textContent = (stats.rt || 0).toFixed(2);
    document.getElementById('vaccineCount').textContent = stats.vaccines || 0;
    document.getElementById('barrierCount').textContent = stats.barriers || 0;
    document.getElementById('casualties').textContent = stats.casualties || 0;
    document.getElementById('score').textContent = stats.score || 0;
  },

  // Toast notifications
  toast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.opacity = '1';
    
    setTimeout(() => {
      toast.style.opacity = '0';
    }, duration);
  },

  // Event log
  log(text, className = '') {
    const eventLog = document.getElementById('eventLog');
    if (!eventLog) return;
    
    const logLine = document.createElement('div');
    logLine.className = `logLine ${className}`;
    logLine.textContent = text;
    
    eventLog.appendChild(logLine);
    eventLog.scrollTop = eventLog.scrollHeight;
    
    // Keep only last 50 entries
    while (eventLog.children.length > 50) {
      eventLog.removeChild(eventLog.firstChild);
    }
  }
};