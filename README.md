# VectorCity - Pandemic Simulation Game

A 3D pandemic containment simulation game built with JavaScript and Three.js. Take on the role of a pandemic response commander and contain the outbreak in a virtual city.

![VectorCity Screenshot](https://github.com/user-attachments/assets/4dab1b5f-71af-47cd-a218-4a622eea2089)

## 🎮 Game Overview

VectorCity is an immersive 3D simulation where you must contain a pandemic outbreak in a virtual city. Use strategic tools like vaccines, barriers, and pulse scanning to track and stop the spread of infection while minimizing casualties.

### Key Features

- **Real-time 3D simulation** with daylight city environment
- **Multiple difficulty levels** from Tutorial to Overrun
- **Dynamic events** that change gameplay conditions
- **Strategic tools**: Vaccines, containment barriers, pulse scanning
- **Tutorial system** to guide new players
- **Win/lose conditions** with scoring system

### Game Mechanics

- **Pulse Scan (Q)**: Detect infected citizens with tracking halos
- **Healing (F)**: Use vaccines to heal infected citizens
- **Barriers (E)**: Deploy containment barriers to trap infected
- **Movement (WASD)**: Navigate the city to respond to outbreaks
- **Sprint (Shift)**: Move faster when needed

## 🚀 Quick Start

### Prerequisites

- A modern web browser with JavaScript enabled
- Python 3 (for local server) or any HTTP server

### Running the Game

1. **Clone the repository:**
   ```bash
   git clone https://github.com/MrDevel0per/VectorCity.git
   cd VectorCity
   ```

2. **Start a local HTTP server:**
   
   **Option A - Python 3:**
   ```bash
   python3 -m http.server 8000
   ```
   
   **Option B - Python 2:**
   ```bash
   python -m SimpleHTTPServer 8000
   ```
   
   **Option C - Node.js (if you have it):**
   ```bash
   npx http-server -p 8000
   ```

3. **Open your browser and navigate to:**
   ```
   http://localhost:8000
   ```

4. **Start playing:**
   - Wait for the game to load (you'll see "Ready. Choose a difficulty to start.")
   - The difficulty selection menu should appear
   - Select your preferred difficulty and start the simulation!

## 🎯 How to Play

### Objectives

- **Win Condition**: Maintain infections ≤ 3 for 30 seconds
- **Lose Condition**: Casualties exceed the difficulty's cap
- **Score**: Earn points by healing citizens, scanning, and maintaining containment

### Controls

| Key | Action |
|-----|--------|
| `WASD` | Move around the city |
| `Mouse` | Look around (click to lock pointer) |
| `Shift` | Sprint for faster movement |
| `F` | Heal nearby infected citizen (consumes vaccine) |
| `E` | Deploy containment barrier |
| `Q` | Pulse scan to detect infected |
| `H` | Toggle help panel |
| `ESC` | Pause game / settings |

### Strategy Tips

1. **Use pulse scanning** regularly to track infected citizens
2. **Deploy barriers strategically** to contain outbreaks
3. **Collect vaccines** from green pickups around the city
4. **Monitor the R(t) value** - higher values indicate spreading infection
5. **Watch for dynamic events** that can change game conditions

## ⚙️ Difficulty Levels

- **Tutorial/Easy**: Guided introduction with lower pressure
- **Easy**: Relaxed challenge for beginners
- **Normal**: Balanced progression
- **Hard**: Elevated transmission with more infected
- **Overrun**: Severe outbreak scenario for experts

## 🔧 Technical Details

### Architecture

- **Frontend**: Pure JavaScript ES6 modules
- **3D Graphics**: Custom minimal Three.js implementation
- **Audio**: Web Audio API (placeholder implementation)
- **Storage**: LocalStorage for settings persistence

### Browser Requirements

- Modern browser with ES6 module support
- WebGL support (falls back to 2D canvas if unavailable)
- Pointer Lock API support for mouse controls

### File Structure

```
VectorCity/
├── index.html              # Main game page
├── style.css              # Game styles and UI
├── src/                   # Game source code
│   ├── main.js           # Entry point and game loop
│   ├── world.js          # 3D world and rendering
│   ├── entities.js       # Game entities (citizens, player)
│   ├── constants.js      # Game configuration
│   ├── state.js          # Game state management
│   ├── ui.js             # User interface
│   ├── input.js          # Input handling
│   ├── audio.js          # Audio system
│   ├── tutorial.js       # Tutorial system
│   ├── utils.js          # Utility functions
│   ├── events.js         # Event system
│   ├── systems/          # Game systems
│   │   ├── player.js     # Player movement and actions
│   │   ├── ai.js         # Citizen AI and infection spread
│   │   ├── pickups.js    # Vaccine pickup system
│   │   ├── barriers.js   # Barrier deployment
│   │   ├── infection.js  # Infection mechanics
│   │   ├── pulse.js      # Pulse scanning system
│   │   ├── particles.js  # Visual effects
│   │   └── seeder.js     # Background infection seeding
│   └── directors/        # Game directors
│       ├── gameDirector.js  # Win/lose conditions
│       └── eventDirector.js # Dynamic events
└── lib/                  # Local dependencies
    ├── three.module.js   # Minimal Three.js implementation
    └── addons/           # Three.js addons (stubs)
```

## 🛠️ Development

### Local Development Setup

The game is designed to work without external dependencies by including a minimal Three.js implementation. All required modules are included in the repository.

### Making Changes

1. Edit source files in the `src/` directory
2. Refresh your browser to see changes
3. Use browser developer tools for debugging

### Adding New Features

The game uses a modular architecture:
- Add new systems in `src/systems/`
- Add new game directors in `src/directors/`
- Update `src/main.js` to include new modules

## 📝 Known Issues

- Some visual effects are simplified due to minimal Three.js implementation
- Audio system is currently a placeholder
- Advanced 3D features may not work in all browsers

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source. See the repository for license details.

## 🎮 Credits

- Original concept and implementation by MrDevel0per
- Pandemic simulation mechanics
- 3D graphics and visual design
- UI/UX design and implementation

---

**Have fun containing the outbreak!** 🦠🔬

For issues or questions, please open an issue on the GitHub repository.