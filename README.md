# Clone Chaos - Survival Puzzle Game

A unique survival puzzle game where a scientist must navigate a rapidly deteriorating laboratory environment while managing increasingly unpredictable clones that spawn every 10 seconds.

## 🎮 Game Overview

In Clone Chaos, you play as a scientist trapped in an unstable laboratory. Every 10 seconds, a clone spawns that perfectly mimics your previous actions. Use these clones strategically to solve environmental puzzles and escape before the facility implodes!

### Core Mechanics

- **Clone Mimicry System**: Clones spawn every 10 seconds and replay your exact movements from the previous 10-second window
- **Progressive Degradation**: Older clones become less reliable and more chaotic over time
- **Environmental Puzzles**: Pressure plates, timed switches, moving platforms, and laser barriers
- **Time Pressure**: 2-minute countdown until laboratory implosion
- **Strategic Coordination**: Use clones to activate multiple puzzle elements simultaneously

## 🕹️ Controls

- **WASD** or **Arrow Keys** - Move the scientist
- **SPACE** - Interact with puzzle elements
- **P** - Pause/Resume game
- **R** - Restart game (when game over)
- **ESC** - Pause game
- **F1** - Toggle debug mode

## 🧩 Puzzle Elements

### Pressure Plates (Blue Circles)
- Require multiple entities to activate
- Shows current/required entity count
- Essential for unlocking pathways

### Timed Switches (Orange Squares)
- Activate for a limited time when pressed
- Must be maintained by positioning entities
- Critical for time-sensitive mechanisms

### Moving Platforms (Purple Rectangles)
- Activate when enough puzzles are solved
- Provide access to new areas
- Require timing and coordination

### Laser Barriers (Red Lines)
- Block movement when active
- Can be disabled by positioning entities in the beam
- Strategic positioning required

### Exit Portal (Green Circle)
- Activates when 70% of puzzles are solved
- Reach it before time runs out to win!

## 🎯 Strategy Tips

1. **Plan Your Movements**: Remember that clones will repeat everything you do
2. **Use Clone Positioning**: Position yourself where you want clones to be later
3. **Timing is Key**: Coordinate movements to activate multiple switches
4. **Watch Clone Degradation**: Older clones become unreliable - plan accordingly
5. **Prioritize Puzzles**: Focus on pressure plates and switches to unlock the exit

## 🛠️ Technical Features

### Advanced Clone System
- **Precise Action Recording**: Every movement and interaction is captured
- **Temporal Playback**: Clones replay actions with exact timing
- **Degradation Algorithm**: Progressive reliability loss over time
- **Performance Optimization**: Efficient handling of multiple simultaneous clones

### Visual Effects
- **Dynamic Lighting**: Glowing entities with atmospheric effects
- **Screen Shake**: Environmental instability feedback
- **Color-Coded Systems**: Clear visual language for different elements
- **Particle Effects**: Atmospheric laboratory environment

### Audio-Visual Cues
- **Clone Spawn Indicators**: Visual warnings before clone appearance
- **Time Pressure Effects**: Increasing visual intensity as time runs out
- **Puzzle Feedback**: Clear activation states for all elements

## 🚀 Getting Started

1. **Open the Game**: Simply open `index.html` in a modern web browser
2. **Start Playing**: The game begins immediately
3. **Learn by Doing**: Move around and watch your first clone spawn after 10 seconds
4. **Solve Puzzles**: Use yourself and your clones to activate puzzle elements
5. **Escape**: Reach the exit before the 2-minute timer expires!

## 🔧 Development Features

### Debug Mode (F1)
- Real-time game state information
- Clone behavior analysis
- Performance metrics
- Player position tracking

### Console Commands
Access these through the browser console:

```javascript
// Spawn a clone immediately
window.gameDebug.spawnClone();

// Add 30 seconds to the timer
window.gameDebug.addTime(30);

// Get detailed clone information
window.gameDebug.getCloneInfo();

// Get player state
window.gameDebug.getPlayerInfo();

// Restart the game
window.gameDebug.restart();
```

## 🏗️ Architecture

### Core Classes
- **ActionRecorder**: Captures and stores player actions
- **Player**: Handles input, movement, and interaction
- **Clone**: Mimics recorded actions with degradation effects
- **CloneManager**: Spawns and manages multiple clones
- **PuzzleSystem**: Handles all environmental puzzle logic
- **GameTimer**: Countdown system with danger escalation
- **Game**: Main orchestrator and game loop

### Design Patterns
- **Component System**: Modular puzzle elements
- **Observer Pattern**: Event-driven timer warnings
- **State Machine**: Game state management
- **Object Pooling**: Efficient clone management

## 🎨 Visual Design

The game features a sci-fi laboratory aesthetic with:
- **Neon Color Palette**: Bright greens, oranges, and blues
- **Grid-Based Environment**: Clean laboratory floor pattern
- **Glowing Effects**: Dynamic lighting for all interactive elements
- **Progressive Visual Feedback**: Increasing danger indicators

## 🔮 Future Enhancements

Potential additions for expanded gameplay:
- **Multiple Levels**: Different laboratory layouts
- **Power-ups**: Temporary abilities and time extensions
- **Advanced Puzzles**: More complex multi-stage challenges
- **Leaderboards**: Time-based scoring system
- **Sound Design**: Atmospheric audio and effects
- **Mobile Support**: Touch controls for mobile devices

## 🐛 Troubleshooting

### Performance Issues
- Reduce browser zoom if experiencing lag
- Close other browser tabs for better performance
- Enable hardware acceleration in browser settings

### Gameplay Issues
- If clones aren't spawning, ensure you're moving during the first 10 seconds
- If puzzles aren't activating, check entity positioning requirements
- Use F1 debug mode to diagnose issues

## 📝 Credits

**Clone Chaos** - Developed using Windsurf AI development tools
- **Core Innovation**: Precise clone mimicry system
- **Game Design**: Strategic puzzle-survival mechanics
- **Technical Implementation**: Performance-optimized JavaScript

---

**Ready to escape the chaos? Open index.html and start your survival challenge!**
