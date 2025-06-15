# Vampire Survivors Style Tower Defense Game
## Complete Development Specification for AI Implementation

---

## 1. PROJECT OBJECTIVES

### Primary Goal
Develop a mobile action RPG tower defense game inspired by Vampire Survivors using Expo SDK 53.0.0+. The game should feature automatic combat, character progression, and wave-based survival gameplay optimized for mobile devices.

### Success Criteria
- Playable game with core mechanics functioning on iOS and Android
- Smooth 60 FPS performance on mid-range devices
- Intuitive touch controls suitable for mobile gameplay
- Engaging progression system that encourages repeated play
- Clean, readable code architecture for future maintenance

### Target Audience
- Casual mobile gamers aged 16-35
- Fans of action RPG and tower defense genres
- Players seeking short-session gameplay (5-15 minutes per run)

---

## 2. REQUIREMENTS

### 2.1 Functional Requirements

#### Core Gameplay Features
**F1. Character System**
- Player controls a single character that moves via touch input
- Character automatically attacks nearest enemies
- Multiple character classes with different stats and abilities
- Character leveling system with stat improvements

**F2. Combat System**
- Automatic targeting and attacking of enemies
- Multiple weapon types with different attack patterns
- Projectile-based combat with collision detection
- Critical hit system with visual feedback

**F3. Enemy Wave System**
- Continuous spawning of enemy waves
- Progressive difficulty scaling
- Multiple enemy types with different behaviors
- Boss enemies at specific intervals

**F4. Progression System**
- Experience points from defeating enemies
- Level-up system with skill/weapon choices
- Persistent character upgrades between runs
- Currency collection for permanent upgrades

**F5. User Interface**
- Main menu with character selection
- In-game HUD showing health, level, timer
- Level-up screen with upgrade choices
- Game over screen with statistics
- Settings menu for audio/graphics options

#### Secondary Features
**F6. Power-ups and Items**
- Temporary power-ups that spawn on the battlefield
- Equipment system with different weapon tiers
- Passive abilities that modify gameplay
- Consumable items for immediate effects

**F7. Game Modes**
- Survival mode (primary) - survive as long as possible
- Time attack mode - survive for set duration
- Challenge mode - specific objectives

### 2.2 Non-Functional Requirements

#### Performance Requirements
**NF1. Frame Rate**
- Maintain 60 FPS during normal gameplay
- Graceful degradation to 30 FPS during intense scenarios
- Smooth animations and transitions

**NF2. Memory Usage**
- Maximum 150MB RAM usage on mid-range devices
- Efficient sprite management and garbage collection
- Texture optimization for mobile GPUs

**NF3. Battery Life**
- Optimized rendering to minimize battery drain
- Efficient update loops and unnecessary calculations

#### Platform Requirements
**NF4. Device Compatibility**
- iOS 13.0+ and Android 8.0+ support
- Responsive design for various screen sizes
- Portrait and landscape orientation support

**NF5. Performance Targets**
- App launch time < 3 seconds
- Level loading time < 2 seconds
- Responsive touch input (< 50ms latency)

#### User Experience Requirements
**NF6. Accessibility**
- Colorblind-friendly color schemes
- Scalable UI elements
- Audio cues for important game events

**NF7. Localization**
- English as primary language
- Text externalization for future translations
- Number formatting for different regions

---

## 3. TECHNICAL SPECIFICATIONS

### 3.1 Development Framework
- **Primary Framework**: Expo SDK 53.0.0+
- **React Native Version**: Compatible with Expo SDK 53
- **JavaScript Engine**: Hermes (default for React Native)
- **Build System**: Expo Application Services (EAS)

### 3.2 Core Libraries and Dependencies

#### Essential Dependencies
```json
{
  "expo": "~53.0.0",
  "react": "18.2.0",
  "react-native": "0.74.0",
  "expo-gl": "~14.0.0",
  "expo-gl-cpp": "~12.0.0",
  "expo-asset": "~10.0.0",
  "expo-audio": "~14.0.0",
  "expo-haptics": "~13.0.0",
  "expo-screen-orientation": "~7.0.0",
  "expo-status-bar": "~2.0.0",
  "expo-splash-screen": "~0.27.0"
}
```

#### Game Development Libraries
```json
{
  "react-native-game-engine": "^1.2.0",
  "matter-js": "^0.19.0",
  "react-native-svg": "15.2.0",
  "react-native-reanimated": "~3.10.0",
  "react-native-gesture-handler": "~2.16.0"
}
```

#### State Management and Utilities
```json
{
  "zustand": "^4.5.0",
  "react-native-async-storage": "1.23.0",
  "expo-constants": "~16.0.0",
  "expo-device": "~6.0.0"
}
```

### 3.3 Platform-Specific Configurations

#### iOS Configuration (app.json)
```json
{
  "ios": {
    "bundleIdentifier": "com.yourcompany.vampiresurvivors",
    "buildNumber": "1.0.0",
    "supportsTablet": true,
    "requireFullScreen": true,
    "orientations": ["portrait", "landscape-left", "landscape-right"]
  }
}
```

#### Android Configuration (app.json)
```json
{
  "android": {
    "package": "com.yourcompany.vampiresurvivors",
    "versionCode": 1,
    "permissions": ["VIBRATE"],
    "screenOrientation": "sensor"
  }
}
```

### 3.4 Performance Optimization Specifications

#### Rendering Optimization
- Use React Native's `FlatList` for dynamic UI elements
- Implement object pooling for enemies and projectiles
- Batch sprite updates to minimize draw calls
- Use `InteractionManager` for non-critical updates

#### Memory Management
- Preload essential game assets during splash screen
- Implement asset cleanup when switching screens
- Use weak references for temporary game objects
- Monitor memory usage with Flipper integration

---

## 4. PROJECT ARCHITECTURE

### 4.1 High-Level Architecture

```
┌─────────────────────────────────────────────────┐
│                 Presentation Layer               │
├─────────────────────────────────────────────────┤
│  Screens/       Components/     Navigation/     │
│  - MenuScreen   - GameHUD      - AppNavigator   │
│  - GameScreen   - CharacterUI  - StackNavigator │
│  - UpgradeScreen- EnemySprite  - TabNavigator   │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│                  Business Logic                 │
├─────────────────────────────────────────────────┤
│  Game/          Systems/        Managers/       │
│  - GameEngine   - CombatSystem - AssetManager   │
│  - GameLoop     - MovementSys  - AudioManager   │
│  - StateManager - CollisionSys - SaveManager    │
└─────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────┐
│                   Data Layer                    │
├─────────────────────────────────────────────────┤
│  Models/        Storage/        Config/         │
│  - Character    - AsyncStorage  - GameConfig    │
│  - Enemy        - GameState     - Constants     │
│  - Weapon       - PlayerData    - AssetPaths    │
└─────────────────────────────────────────────────┘
```

### 4.2 Detailed Component Architecture

#### 4.2.1 Core Game Systems

**GameEngine (src/game/GameEngine.js)**
```javascript
class GameEngine {
  constructor() {
    this.systems = [];
    this.entities = new Map();
    this.isRunning = false;
    this.deltaTime = 0;
  }
  
  // Core methods to implement:
  // - start()
  // - stop()
  // - update(deltaTime)
  // - addSystem(system)
  // - addEntity(entity)
  // - removeEntity(id)
}
```

**Entity Component System Structure**
```javascript
// Entities are simple objects with components
const playerEntity = {
  id: 'player',
  components: {
    transform: { x: 0, y: 0, rotation: 0 },
    health: { current: 100, max: 100 },
    movement: { speed: 150, direction: { x: 0, y: 1 } },
    combat: { damage: 10, attackSpeed: 1.0, range: 100 }
  }
};
```

#### 4.2.2 System Architecture

**Movement System (src/systems/MovementSystem.js)**
- Handle player input processing
- Update entity positions based on velocity
- Implement screen boundary constraints
- Process touch/gesture input for movement

**Combat System (src/systems/CombatSystem.js)**
- Automatic enemy targeting
- Projectile creation and management
- Damage calculation and application
- Weapon behavior implementation

**Collision System (src/systems/CollisionSystem.js)**
- Broad-phase collision detection (spatial partitioning)
- Narrow-phase collision resolution
- Trigger events for pickups and damage
- Optimized for mobile performance

**Spawn System (src/systems/SpawnSystem.js)**
- Enemy wave generation based on difficulty curve
- Spawn point management around screen edges
- Enemy type selection and balancing
- Boss spawn timing and logic

#### 4.2.3 State Management Architecture

**Global State Structure (using Zustand)**
```javascript
const useGameStore = create((set, get) => ({
  // Game State
  gameState: 'menu', // 'menu', 'playing', 'paused', 'gameOver'
  
  // Player State
  player: {
    level: 1,
    experience: 0,
    health: 100,
    position: { x: 0, y: 0 },
    stats: { damage: 10, speed: 150, health: 100 }
  },
  
  // Game Session State
  currentWave: 1,
  enemiesDefeated: 0,
  survivalTime: 0,
  score: 0,
  
  // Persistent State
  playerProgress: {
    totalGamesPlayed: 0,
    bestSurvivalTime: 0,
    highScore: 0,
    unlockedCharacters: ['default'],
    currency: 0
  },
  
  // Actions
  updatePlayer: (updates) => set(state => ({
    player: { ...state.player, ...updates }
  })),
  
  incrementWave: () => set(state => ({
    currentWave: state.currentWave + 1
  })),
  
  // Add more actions as needed
}));
```

### 4.3 File Structure

```
vampire-survivors-game/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/
│   │   │   ├── Button.js
│   │   │   ├── ProgressBar.js
│   │   │   └── Modal.js
│   │   ├── game/
│   │   │   ├── GameHUD.js
│   │   │   ├── CharacterSprite.js
│   │   │   ├── EnemySprite.js
│   │   │   └── Projectile.js
│   │   └── ui/
│   │       ├── MainMenu.js
│   │       ├── CharacterSelect.js
│   │       └── UpgradeModal.js
│   │
│   ├── screens/              # Screen components
│   │   ├── MenuScreen.js
│   │   ├── GameScreen.js
│   │   ├── CharacterScreen.js
│   │   ├── UpgradeScreen.js
│   │   └── SettingsScreen.js
│   │
│   ├── game/                 # Core game logic
│   │   ├── GameEngine.js
│   │   ├── GameLoop.js
│   │   ├── EntityManager.js
│   │   └── InputManager.js
│   │
│   ├── systems/              # ECS Systems
│   │   ├── MovementSystem.js
│   │   ├── CombatSystem.js
│   │   ├── CollisionSystem.js
│   │   ├── SpawnSystem.js
│   │   ├── RenderSystem.js
│   │   └── AudioSystem.js
│   │
│   ├── models/               # Data models
│   │   ├── Character.js
│   │   ├── Enemy.js
│   │   ├── Weapon.js
│   │   ├── Projectile.js
│   │   └── PowerUp.js
│   │
│   ├── managers/             # Utility managers
│   │   ├── AssetManager.js
│   │   ├── AudioManager.js
│   │   ├── SaveManager.js
│   │   └── SceneManager.js
│   │
│   ├── utils/                # Utility functions
│   │   ├── math.js
│   │   ├── collision.js
│   │   ├── constants.js
│   │   └── helpers.js
│   │
│   ├── config/               # Configuration files
│   │   ├── gameConfig.js
│   │   ├── enemyConfig.js
│   │   ├── weaponConfig.js
│   │   └── characterConfig.js
│   │
│   ├── store/                # State management
│   │   ├── gameStore.js
│   │   ├── playerStore.js
│   │   └── settingsStore.js
│   │
│   └── navigation/           # Navigation setup
│       ├── AppNavigator.js
│       └── navigationConfig.js
│
├── assets/                   # Game assets
│   ├── images/
│   │   ├── characters/
│   │   ├── enemies/
│   │   ├── weapons/
│   │   ├── ui/
│   │   └── backgrounds/
│   ├── audio/
│   │   ├── sfx/
│   │   └── music/
│   └── fonts/
│
├── app.json                  # Expo configuration
├── package.json              # Dependencies
├── babel.config.js           # Babel configuration
└── README.md                 # Project documentation
```

### 4.4 Development Phases

#### Phase 1: Foundation (Week 1-2)
1. Set up Expo project with required dependencies
2. Implement basic navigation structure
3. Create core game engine and entity system
4. Implement basic player movement and input handling
5. Set up state management with Zustand

#### Phase 2: Core Gameplay (Week 3-4)
1. Implement enemy spawning system
2. Add collision detection and combat mechanics
3. Create weapon system with projectiles
4. Implement basic UI (health bar, score display)
5. Add audio system for sound effects

#### Phase 3: Progression Systems (Week 5-6)
1. Implement experience and leveling system
2. Create upgrade/skill selection screen
3. Add wave progression and difficulty scaling
4. Implement persistent save system
5. Add multiple character types

#### Phase 4: Polish and Optimization (Week 7-8)
1. Performance optimization and memory management
2. UI/UX improvements and animations
3. Audio implementation (music and sound effects)
4. Bug fixes and testing
5. Prepare for app store deployment

---

## 5. IMPLEMENTATION GUIDELINES FOR AI ASSISTANT

### 5.1 Development Approach
- Use TypeScript for better code reliability (convert .js to .ts files)
- Implement comprehensive error handling and logging
- Write modular, testable code with clear separation of concerns
- Follow React Native and Expo best practices
- Prioritize performance on mobile devices

### 5.2 Code Quality Standards
- Use ESLint and Prettier for code formatting
- Implement proper prop validation with PropTypes
- Write clear, self-documenting code with meaningful variable names
- Add inline comments for complex game logic
- Use consistent naming conventions throughout the project

### 5.3 Testing Strategy
- Unit tests for game logic and utility functions
- Integration tests for core game systems
- Manual testing on both iOS and Android devices
- Performance testing with React Native Performance Monitor

### 5.4 Deployment Preparation
- Configure EAS Build for both platforms
- Set up app icons and splash screens
- Implement proper error boundary components
- Add crash reporting with Expo's built-in tools
- Prepare app store metadata and screenshots

---

## 6. SUCCESS METRICS

### 6.1 Technical Metrics
- App startup time < 3 seconds
- Consistent 60 FPS during gameplay
- Memory usage < 150MB on mid-range devices
- Zero crash rate during normal gameplay
- Successful build and deployment on both platforms

### 6.2 Gameplay Metrics
- Average session length: 8-12 minutes
- Player retention: Ability to restart and play multiple rounds
- Progression feels rewarding and meaningful
- Controls are intuitive and responsive
- Game difficulty scales appropriately

---