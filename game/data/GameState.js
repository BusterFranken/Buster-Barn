/**
 * GameState - Global state object for MOO-QUEST
 * Tracks player stats, tutorial progress, world unlocks, and settings.
 * Must remain serializable (no functions stored as properties).
 */
const GameState = {
  player: {
    health: 3,
    maxHealth: 3,
    score: 0,
  },
  tutorial: {
    currentPhase: 'movement',  // movement, jump, eat, combat, puzzle, complete
    phasesCompleted: [],
    itemsEaten: 0,
    itemsRequired: 5,
    enemiesDefeated: 0,
    totalTime: 0,
    startTime: 0,
    checkpointX: 64,
  },
  inventory: {
    equipment: [
      {
        id: 'cape_purple',
        name: 'Purple Cape',
        slot: 'back',
        equipped: true,
        rarity: 'starter',
        icon: '\u{1F9B8}',
        description: "Violet's signature purple cape. It flutters heroically in the wind."
      }
    ],
    powerups: [],
    cosmetics: []
  },
  profile: {
    name: 'Violet',
    mooCoins: 0,
    totalPlayTime: 0,
    gamesPlayed: 0
  },
  worlds: {
    emerald_pastures: { unlocked: true, completed: false, bestScore: 0 },
    crystal_caves: { unlocked: false, completed: false, bestScore: 0 },
    lava_meadows: { unlocked: false, completed: false, bestScore: 0 },
    cloud_kingdom: { unlocked: false, completed: false, bestScore: 0 },
    shadow_barn: { unlocked: false, completed: false, bestScore: 0 },
    rainbow_falls: { unlocked: false, completed: false, bestScore: 0 },
  },
  settings: {
    musicVolume: 0.5,
    sfxVolume: 0.7,
    musicMuted: false,
    sfxMuted: false,
    scanlinesEnabled: true,
    animationsEnabled: true,
  }
};

// Reset player and tutorial state back to defaults
GameState.reset = function() {
  this.player.health = 3;
  this.player.maxHealth = 3;
  this.player.score = 0;

  this.tutorial.currentPhase = 'movement';
  this.tutorial.phasesCompleted = [];
  this.tutorial.itemsEaten = 0;
  this.tutorial.itemsRequired = 5;
  this.tutorial.enemiesDefeated = 0;
  this.tutorial.totalTime = 0;
  this.tutorial.startTime = 0;
  this.tutorial.checkpointX = 64;
};

// Reset inventory to starter items only (keeps cape, clears everything else)
GameState.resetInventory = function() {
  this.inventory.equipment = [
    {
      id: 'cape_purple',
      name: 'Purple Cape',
      slot: 'back',
      equipped: true,
      rarity: 'starter',
      icon: '\u{1F9B8}',
      description: "Violet's signature purple cape. It flutters heroically in the wind."
    }
  ];
  this.inventory.powerups = [];
  this.inventory.cosmetics = [];
};

// Reset profile (keeps name, zeroes stats)
GameState.resetProfile = function() {
  this.profile.mooCoins = 0;
  this.profile.totalPlayTime = 0;
  this.profile.gamesPlayed = 0;
};

// Full reset (everything)
GameState.resetAll = function() {
  this.reset();
  this.resetInventory();
  this.resetProfile();
  this.profile.name = 'Violet';

  // Reset worlds
  var worldKeys = Object.keys(this.worlds);
  for (var i = 0; i < worldKeys.length; i++) {
    this.worlds[worldKeys[i]].completed = false;
    this.worlds[worldKeys[i]].bestScore = 0;
    this.worlds[worldKeys[i]].unlocked = (worldKeys[i] === 'emerald_pastures');
  }
};
