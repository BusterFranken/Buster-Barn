// =============================================================================
// WorldScene.js - Generic gameplay scene for MOO-QUEST worlds 2-6
// Handles all world-specific mechanics: darkness, lava, swimming, wind,
// moving platforms, fireballs, keys/doors, bosses, and enemy subtypes.
// Loaded as a regular script (NOT an ES module).
// =============================================================================

var TILE_MAPS = {
  crystal_caves:  { 1: 'tile_cave_wall', 2: 'tile_cave_floor', 3: 'tile_crystal', 4: 'tile_platform' },
  lava_meadows:   { 1: 'tile_hot_rock', 2: 'tile_hot_rock', 3: 'tile_lava', 4: 'tile_lava_surface', 5: 'tile_moving_plat' },
  cloud_kingdom:  { 1: 'tile_cloud', 2: 'tile_cloud_bouncy', 3: 'tile_rainbow', 4: 'tile_platform' },
  shadow_barn:    { 1: 'tile_wood', 2: 'tile_hay', 3: 'tile_barn_door', 4: 'tile_platform' },
  rainbow_falls:  { 1: 'tile_rainbow_block', 2: 'tile_grass', 3: 'tile_water', 4: 'tile_water_surface', 5: 'tile_waterfall' }
};

// Which tile keys are hazards (lava)
var HAZARD_TILES = ['tile_lava', 'tile_lava_surface'];
// Which tile keys are water (swimming)
var WATER_TILES = ['tile_water', 'tile_water_surface', 'tile_waterfall'];
// Which tile keys are bouncy
var BOUNCY_TILES = ['tile_cloud_bouncy'];

class WorldScene extends Phaser.Scene {
  constructor() {
    super({ key: 'WorldScene' });
  }

  init(data) {
    this.worldId = data.worldId;
  }

  create() {
    // === LEVEL DATA LOOKUP ===
    var levelLookup = {
      crystal_caves:  typeof WORLD_2_LEVEL !== 'undefined' ? WORLD_2_LEVEL : null,
      lava_meadows:   typeof WORLD_3_LEVEL !== 'undefined' ? WORLD_3_LEVEL : null,
      cloud_kingdom:  typeof WORLD_4_LEVEL !== 'undefined' ? WORLD_4_LEVEL : null,
      shadow_barn:    typeof WORLD_5_LEVEL !== 'undefined' ? WORLD_5_LEVEL : null,
      rainbow_falls:  typeof WORLD_6_LEVEL !== 'undefined' ? WORLD_6_LEVEL : null
    };
    this.levelData = levelLookup[this.worldId];
    if (!this.levelData) {
      console.error('WorldScene: no level data for worldId "' + this.worldId + '"');
      return;
    }

    var levelData = this.levelData;
    var worldWidth = levelData.width * 32;
    var worldHeight = levelData.height * 32;

    // === WORLD SETUP ===
    this.physics.world.setBounds(0, 0, worldWidth, worldHeight);
    this.cameras.main.setBounds(0, 0, worldWidth, worldHeight);

    // Background color
    if (levelData.backgroundColor !== undefined) {
      this.cameras.main.setBackgroundColor(levelData.backgroundColor);
    }

    // Override gravity if specified
    if (levelData.gravity !== undefined) {
      this.physics.world.gravity.y = levelData.gravity;
    }

    // === STATE ===
    this.levelComplete = false;
    this.facingRight = true;
    this.keysCollected = 0;
    this.keysRequired = levelData.keysRequired || 0;
    this.isInWater = false;
    this.airMeter = 100;
    this.bossDefeated = false;
    this.currentTriggerIndex = 0;
    this.wasGrounded = false;
    this.checkpoints = [];
    this.lastCheckpointX = 0;
    this.lastCheckpointY = 0;
    this.waterTilePositions = [];
    this.movingPlatforms = [];
    this.fireballs = [];
    this.windZones = [];

    // === PARALLAX BACKGROUND ===
    this.createBackground(worldWidth, worldHeight);

    // === PHYSICS GROUPS ===
    this.groundGroup = this.physics.add.staticGroup();
    this.hazardGroup = this.physics.add.staticGroup();
    this.waterGroup = this.physics.add.staticGroup();
    this.bouncyGroup = this.physics.add.staticGroup();

    // === TILEMAP ===
    this.buildTilemap();

    // === PLAYER (Violet) ===
    var spawn = levelData.entities.find(function(e) { return e.type === 'spawn'; });
    this.player = this.physics.add.sprite(spawn.x * 32 + 16, spawn.y * 32 + 16, 'violet');
    this.player.setCollideWorldBounds(true);
    this.player.setSize(20, 28);
    this.player.setOffset(6, 4);
    this.player.play('violet_idle');

    // Store spawn for respawn
    this.lastCheckpointX = spawn.x * 32 + 16;
    this.lastCheckpointY = spawn.y * 32 + 16;

    // Camera follow with smooth lerp
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    // === SYSTEMS ===
    this.combat = new CombatSystem(this);
    this.dialog = new DialogSystem(this);
    this.soundSys = this.game.soundSystem;

    // === ENTITY GROUPS ===
    this.foods = this.physics.add.group();
    this.enemies = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.levers = this.physics.add.group();
    this.keys = this.physics.add.group();
    this.gates = {};
    this.gateColliders = {};
    this.lockedDoors = {};
    this.lockedDoorColliders = {};

    this.spawnEntities();

    // === COLLIDERS ===
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.enemies, this.groundGroup);
    this.physics.add.collider(this.coins, this.groundGroup);

    // Hazard overlap (lava damage)
    this.physics.add.overlap(this.player, this.hazardGroup, this.hazardContact, null, this);

    // Bouncy tile collision
    this.physics.add.collider(this.player, this.bouncyGroup, this.bouncyContact, null, this);

    // Player overlaps
    this.physics.add.overlap(this.player, this.foods, this.collectFood, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.enemyContact, null, this);
    this.physics.add.overlap(this.player, this.levers, this.activateLever, null, this);
    this.physics.add.overlap(this.player, this.keys, this.collectKey, null, this);

    // === INPUT ===
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey('A');
    this.keyD = this.input.keyboard.addKey('D');
    this.keyW = this.input.keyboard.addKey('W');
    this.keyS = this.input.keyboard.addKey('S');
    this.keyZ = this.input.keyboard.addKey('Z');
    this.keyX = this.input.keyboard.addKey('X');
    this.keyEsc = this.input.keyboard.addKey('ESC');

    // === EVENT LISTENERS ===
    this.events.on('spawnCoin', this.spawnCoin, this);
    this.events.on('playerDied', this.onPlayerDied, this);

    // === DARKNESS ===
    var config = levelData.config || {};
    if (config.hasDarkness) {
      this.setupDarkness(config.lightRadius || 100);
    }

    // Show first tutorial message after a short delay
    var self = this;
    var firstMsg = levelData.tutorialMessages ? levelData.tutorialMessages.start : null;
    if (firstMsg) {
      this.time.delayedCall(500, function() {
        self.dialog.show(firstMsg, { title: levelData.name || 'MOO-QUEST' });
      });
    }

    // Start music
    this.soundSys.startMusic();
  }

  // ===========================================================================
  // BACKGROUND - Themed parallax per world
  // ===========================================================================

  createBackground(worldWidth, worldHeight) {
    var bgColors = {
      crystal_caves:  0x0a0a2e,
      lava_meadows:   0x330000,
      cloud_kingdom:  0x88ccff,
      shadow_barn:    0x1a1a1a,
      rainbow_falls:  0x66ccff
    };
    var bgColor = bgColors[this.worldId] || 0x000000;
    this.add.rectangle(worldWidth / 2, worldHeight / 2, worldWidth, worldHeight, bgColor)
      .setScrollFactor(0).setDepth(-100);

    var i, obj;

    if (this.worldId === 'crystal_caves') {
      // Dim stalactite-like shapes using rock images
      for (i = 0; i < 15; i++) {
        obj = this.add.image(i * 350 + 100, 40, 'rock');
        obj.setScrollFactor(0.15, 0).setDepth(-90).setAlpha(0.3).setTint(0x4444aa);
      }
    } else if (this.worldId === 'lava_meadows') {
      // Red/orange glow rectangles in the distance
      for (i = 0; i < 12; i++) {
        obj = this.add.rectangle(i * 500 + 200, worldHeight - 80, 300, 60, 0xff3300);
        obj.setScrollFactor(0.2, 0).setDepth(-90).setAlpha(0.15);
      }
      for (i = 0; i < 20; i++) {
        obj = this.add.image(i * 320 + 50, 30, 'rock');
        obj.setScrollFactor(0.1, 0).setDepth(-85).setAlpha(0.25).setTint(0x441100);
      }
    } else if (this.worldId === 'cloud_kingdom') {
      // Clouds at varying scroll depths
      for (i = 0; i < 20; i++) {
        obj = this.add.image(i * 300 + 80, 40 + (i % 3) * 30, 'cloud');
        obj.setScrollFactor(0.08, 0).setDepth(-95).setAlpha(0.6);
      }
      for (i = 0; i < 15; i++) {
        obj = this.add.image(i * 400 + 120, 100 + (i % 2) * 50, 'cloud');
        obj.setScrollFactor(0.2, 0).setDepth(-85).setAlpha(0.4).setScale(1.5);
      }
    } else if (this.worldId === 'shadow_barn') {
      // Dark barn interior with subtle wood grain hints
      for (i = 0; i < 10; i++) {
        obj = this.add.rectangle(i * 280 + 100, worldHeight / 2, 40, worldHeight, 0x2a1a0a);
        obj.setScrollFactor(0.1, 0).setDepth(-90).setAlpha(0.3);
      }
    } else if (this.worldId === 'rainbow_falls') {
      // Colorful sky with distant hills
      for (i = 0; i < 18; i++) {
        obj = this.add.image(i * 350 + 60, worldHeight - 150, 'hill_far');
        obj.setScrollFactor(0.3, 0).setDepth(-80).setAlpha(0.5).setTint(0x88ff88);
      }
      for (i = 0; i < 22; i++) {
        obj = this.add.image(i * 250 + 40, 50 + (i % 4) * 20, 'cloud');
        obj.setScrollFactor(0.1, 0).setDepth(-90).setAlpha(0.7);
      }
    }
  }

  // ===========================================================================
  // TILEMAP - Route tiles to correct physics groups
  // ===========================================================================

  buildTilemap() {
    var tiles = this.levelData.tiles;
    var tileMap = TILE_MAPS[this.worldId] || {};

    for (var row = 0; row < this.levelData.height; row++) {
      for (var col = 0; col < this.levelData.width; col++) {
        var tileType = tiles[row][col];
        if (tileType > 0) {
          var tileKey = tileMap[tileType];
          if (!tileKey) continue;
          var x = col * 32 + 16;
          var y = row * 32 + 16;

          if (HAZARD_TILES.indexOf(tileKey) >= 0) {
            var hazTile = this.hazardGroup.create(x, y, tileKey);
            hazTile.setSize(32, 32);
            hazTile.refreshBody();
          } else if (WATER_TILES.indexOf(tileKey) >= 0) {
            this.add.image(x, y, tileKey).setAlpha(0.7).setDepth(-5);
            this.waterTilePositions.push({ x: x, y: y });
          } else if (BOUNCY_TILES.indexOf(tileKey) >= 0) {
            var bTile = this.bouncyGroup.create(x, y, tileKey);
            bTile.setSize(32, 32);
            bTile.refreshBody();
          } else {
            var tile = this.groundGroup.create(x, y, tileKey);
            tile.setSize(32, 32);
            tile.refreshBody();
          }
        }
      }
    }
  }

  // ===========================================================================
  // ENTITIES - Spawn all entities from level data
  // ===========================================================================

  spawnEntities() {
    var self = this;
    this.levelData.entities.forEach(function(ent) {
      var px = ent.x * 32 + 16;
      var py = ent.y * 32 + 16;

      switch (ent.type) {
        case 'food':
          self.spawnFood(ent, px, py);
          break;
        case 'enemy':
          self.spawnEnemy(ent, px, py);
          break;
        case 'lever':
          self.spawnLever(ent, px, py);
          break;
        case 'gate':
          self.spawnGate(ent, px, py);
          break;
        case 'signpost':
          self.addDeco('signpost', px, py + 16);
          break;
        case 'flag':
          self.spawnFlag(px, py);
          break;
        case 'moving_platform':
          self.spawnMovingPlatform(ent, px, py);
          break;
        case 'fireball':
          self.spawnFireball(ent, px, py);
          break;
        case 'wind_zone':
          self.spawnWindZone(ent, px, py);
          break;
        case 'locked_door':
          self.spawnLockedDoor(ent, px, py);
          break;
        case 'key':
          self.spawnKey(ent, px, py);
          break;
        case 'boss':
          self.spawnBoss(ent, px, py);
          break;
        case 'checkpoint':
          self.spawnCheckpoint(ent, px, py);
          break;
        // spawn type is handled separately (player creation)
      }
    });
  }

  spawnFood(ent, px, py) {
    var keyMap = {
      grass: 'item_grass',
      hay: 'item_hay',
      milk: 'item_milk',
      heart: 'item_heart',
      gem: 'item_gem',
      star: 'item_star',
      feather: 'item_feather',
      fire_shield: 'item_fire_shield',
      air_bubble: 'item_air_bubble',
      lantern: 'item_lantern',
      torch: 'item_torch'
    };
    var textureKey = keyMap[ent.subtype] || 'item_grass';
    var food = this.foods.create(px, py, textureKey);
    food.setSize(16, 16);
    food.body.setAllowGravity(false);
    food.body.setImmovable(true);
    food.foodType = ent.subtype;

    // Floating bobble animation
    this.tweens.add({
      targets: food,
      y: py - 6,
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  spawnEnemy(ent, px, py) {
    var key, animKey, hp;
    switch (ent.subtype) {
      case 'slime': key = 'slime'; animKey = 'slime_idle'; hp = 1; break;
      case 'beetle': key = 'beetle'; animKey = 'beetle_walk'; hp = 2; break;
      case 'cave_bat': key = 'cave_bat'; animKey = 'cave_bat_fly'; hp = 1; break;
      case 'crystal_golem': key = 'crystal_golem'; animKey = 'crystal_golem_idle'; hp = 3; break;
      case 'fire_slime': key = 'fire_slime'; animKey = 'fire_slime_idle'; hp = 2; break;
      case 'magma_beetle': key = 'magma_beetle'; animKey = 'magma_beetle_walk'; hp = 2; break;
      case 'wind_sprite': key = 'wind_sprite'; animKey = 'wind_sprite_float'; hp = 1; break;
      case 'cloud_puff': key = 'cloud_puff'; animKey = 'cloud_puff_idle'; hp = 1; break;
      case 'shadow_rat': key = 'shadow_rat'; animKey = 'shadow_rat_run'; hp = 1; break;
      case 'barn_cat': key = 'barn_cat'; animKey = 'barn_cat_idle'; hp = 2; break;
      case 'fish_enemy': key = 'fish_enemy'; animKey = 'fish_enemy_jump'; hp = 1; break;
      default: key = 'slime'; animKey = 'slime_idle'; hp = 1;
    }
    var enemy = this.enemies.create(px, py, key);
    enemy.play(animKey);
    enemy.setSize(24, 24);
    enemy.setOffset(4, 8);
    enemy.hp = hp;
    enemy.enemyType = ent.subtype;
    enemy.setBounce(0);

    // Behavior setup
    if (ent.subtype === 'cave_bat') {
      enemy.body.setAllowGravity(false);
      enemy.startY = py;
      enemy.batTime = Math.random() * Math.PI * 2;
    } else if (ent.subtype === 'fish_enemy') {
      enemy.body.setAllowGravity(false);
      enemy.startY = py;
      enemy.fishTimer = 0;
      enemy.fishJumping = false;
    } else if (ent.subtype === 'wind_sprite') {
      enemy.body.setAllowGravity(false);
    } else if (ent.subtype === 'barn_cat') {
      enemy.body.setVelocityX(0);
      enemy.pounced = false;
    }

    // Patrol behavior
    if (ent.patrolLeft !== undefined && ent.patrolRight !== undefined) {
      enemy.patrolLeft = ent.patrolLeft * 32;
      enemy.patrolRight = ent.patrolRight * 32;
      var speed = ent.subtype === 'shadow_rat' ? 80 : (ent.subtype === 'magma_beetle' ? 60 : 40);
      enemy.body.setVelocityX(speed);
      enemy.patrolDir = 1;
      enemy.patrolSpeed = speed;
    }
  }

  spawnLever(ent, px, py) {
    var lever = this.levers.create(px, py, 'lever_off');
    lever.body.setAllowGravity(false);
    lever.body.setImmovable(true);
    lever.isOn = false;
    lever.targetGate = ent.targetGate;
  }

  spawnGate(ent, px, py) {
    var gateGroup = this.physics.add.staticGroup();
    for (var i = 0; i < 6; i++) {
      var gateTile = gateGroup.create(px, (ent.y + i) * 32 + 16, 'gate_closed');
      gateTile.setSize(32, 32);
      gateTile.refreshBody();
    }
    this.gates[ent.id] = gateGroup;

    var collider = this.physics.add.collider(this.player, gateGroup);
    this.gateColliders[ent.id] = collider;
  }

  spawnFlag(px, py) {
    this.flagSprite = this.physics.add.sprite(px, py, 'flag');
    this.flagSprite.body.setAllowGravity(false);
    this.flagSprite.body.setImmovable(true);
    this.physics.add.overlap(this.player, this.flagSprite, this.reachFlag, null, this);
  }

  spawnMovingPlatform(ent, px, py) {
    var plat = this.physics.add.image(px, py, 'tile_moving_plat');
    plat.setImmovable(true);
    plat.body.setAllowGravity(false);
    plat.setSize(64, 16);

    // Store movement parameters
    plat.startX = px;
    plat.startY = py;
    plat.moveX = (ent.moveX || 0) * 32;
    plat.moveY = (ent.moveY || 0) * 32;
    plat.platSpeed = ent.speed || 40;
    plat.platDir = 1;

    // Calculate velocity
    if (plat.moveX > 0) {
      plat.body.setVelocityX(plat.platSpeed);
    } else if (plat.moveY > 0) {
      plat.body.setVelocityY(plat.platSpeed);
    }

    this.physics.add.collider(this.player, plat);
    this.physics.add.collider(this.enemies, plat);
    this.movingPlatforms.push(plat);
  }

  spawnFireball(ent, px, py) {
    var fb = {
      x: px,
      y: py,
      direction: ent.direction || 'up',
      interval: ent.interval || 3000,
      sprite: null
    };
    this.fireballs.push(fb);

    var self = this;
    // Periodic fireball launcher
    this.time.addEvent({
      delay: fb.interval,
      loop: true,
      callback: function() {
        self.launchFireball(fb);
      }
    });
  }

  launchFireball(fb) {
    var projectile = this.physics.add.sprite(fb.x, fb.y, 'fireball');
    projectile.body.setAllowGravity(false);
    projectile.setSize(16, 16);

    if (fb.direction === 'up') {
      projectile.setVelocityY(-200);
    } else if (fb.direction === 'down') {
      projectile.setVelocityY(200);
    } else if (fb.direction === 'left') {
      projectile.setVelocityX(-200);
    } else {
      projectile.setVelocityX(200);
    }

    // Damage player on overlap
    var self = this;
    this.physics.add.overlap(this.player, projectile, function() {
      if (!self.combat.invincible) {
        var knockDir = self.player.x < projectile.x ? -1 : 1;
        var damaged = self.combat.takeDamage(self.player, knockDir);
        if (damaged) {
          self.player.play('violet_hurt', true);
          self.time.delayedCall(300, function() {
            if (self.player.active && self.player.body.blocked.down) {
              self.player.play('violet_idle', true);
            }
          });
        }
        projectile.destroy();
      }
    });

    // Auto-destroy after 3 seconds
    this.time.delayedCall(3000, function() {
      if (projectile.active) {
        projectile.destroy();
      }
    });
  }

  spawnWindZone(ent, px, py) {
    var wz = {
      x: px,
      y: py,
      width: (ent.width || 3) * 32,
      height: (ent.height || 5) * 32,
      forceX: ent.forceX || 0,
      forceY: ent.forceY || -150
    };
    this.windZones.push(wz);

    // Visual indicator — semi-transparent rectangle
    this.add.rectangle(px, py, wz.width, wz.height, 0xffffff, 0.08).setDepth(-3);
  }

  spawnLockedDoor(ent, px, py) {
    var doorGroup = this.physics.add.staticGroup();
    for (var i = 0; i < 3; i++) {
      var doorTile = doorGroup.create(px, (ent.y + i) * 32 + 16, 'gate_closed');
      doorTile.setSize(32, 32);
      doorTile.setTint(0xaa8844);
      doorTile.refreshBody();
    }
    var doorId = ent.doorId || ('door_' + px + '_' + py);
    this.lockedDoors[doorId] = doorGroup;

    var collider = this.physics.add.collider(this.player, doorGroup);
    this.lockedDoorColliders[doorId] = collider;
  }

  spawnKey(ent, px, py) {
    var keyItem = this.keys.create(px, py, 'item_key');
    keyItem.setSize(16, 16);
    keyItem.body.setAllowGravity(false);
    keyItem.body.setImmovable(true);

    // Floating bobble animation
    this.tweens.add({
      targets: keyItem,
      y: py - 6,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
  }

  spawnBoss(ent, px, py) {
    this.boss = this.physics.add.sprite(px, py, 'boss');
    this.boss.setSize(40, 48);
    this.boss.setOffset(12, 16);
    this.boss.hp = ent.hp || 10;
    this.boss.maxHp = this.boss.hp;
    this.boss.enemyType = 'boss';
    this.boss.bossPhase = 1;
    this.boss.attackTimer = 0;
    this.boss.setBounce(0);

    this.physics.add.collider(this.boss, this.groundGroup);
    this.physics.add.overlap(this.player, this.boss, this.bossContact, null, this);

    // Patrol parameters
    if (ent.patrolLeft !== undefined && ent.patrolRight !== undefined) {
      this.boss.patrolLeft = ent.patrolLeft * 32;
      this.boss.patrolRight = ent.patrolRight * 32;
      this.boss.patrolSpeed = ent.speed || 60;
      this.boss.body.setVelocityX(this.boss.patrolSpeed);
      this.boss.patrolDir = 1;
    }
  }

  spawnCheckpoint(ent, px, py) {
    var cp = this.physics.add.sprite(px, py, 'flag');
    cp.setSize(16, 32);
    cp.body.setAllowGravity(false);
    cp.body.setImmovable(true);
    cp.setAlpha(0.5);
    cp.isCheckpoint = true;
    cp.checkpointActivated = false;

    var self = this;
    this.physics.add.overlap(this.player, cp, function(player, checkpoint) {
      if (!checkpoint.checkpointActivated) {
        checkpoint.checkpointActivated = true;
        checkpoint.setAlpha(1);
        self.lastCheckpointX = checkpoint.x;
        self.lastCheckpointY = checkpoint.y;
        self.soundSys.play('lever');
      }
    });
  }

  addDeco(key, x, y) {
    var deco = this.add.image(x, y, key);
    deco.setOrigin(0.5, 1);
    deco.setDepth(-10);
  }

  // ===========================================================================
  // UPDATE LOOP
  // ===========================================================================

  update(time, delta) {
    if (!this.player || !this.player.active) return;
    if (this.levelComplete) return;

    this.handleInput();
    this.updateEnemyBehavior();
    this.updateMovingPlatforms();
    this.updateWindZones();
    this.updateBoss();
    this.checkTriggers();
    this.checkAttackHits();
    this.dialog.update();

    // Swimming system
    var config = this.levelData.config || {};
    if (config.hasSwimming || this.worldId === 'rainbow_falls') {
      this.updateSwimming();
    }

    // Darkness system
    if (config.hasDarkness && this.darkRT) {
      this.updateDarkness();
    }

    // Landing sound
    if (this.player.body.blocked.down && !this.wasGrounded) {
      this.soundSys.play('land');
    }
    this.wasGrounded = this.player.body.blocked.down;
  }

  // ===========================================================================
  // INPUT HANDLING
  // ===========================================================================

  handleInput() {
    var onGround = this.player.body.blocked.down;
    var moving = false;
    var config = this.levelData.config || {};
    var playerSpeed = config.playerSpeed || 160;
    var jumpForce = config.jumpForce || -420;

    // Adjust speed in water
    if (this.isInWater) {
      playerSpeed = Math.floor(playerSpeed * 0.6);
    }

    // Horizontal movement
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-playerSpeed);
      this.facingRight = false;
      this.player.setFlipX(true);
      moving = true;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(playerSpeed);
      this.facingRight = true;
      this.player.setFlipX(false);
      moving = true;
    } else {
      this.player.setVelocityX(0);
    }

    // Vertical movement in water
    if (this.isInWater) {
      if (this.cursors.up.isDown || this.keyW.isDown) {
        this.player.setVelocityY(-playerSpeed);
      } else if (this.cursors.down.isDown || this.keyS.isDown) {
        this.player.setVelocityY(playerSpeed * 0.8);
      }
    }

    // Animations (only change if not attacking)
    if (!this.combat.isAttacking) {
      if (this.isInWater) {
        this.player.play('violet_walk', true);
      } else if (!onGround) {
        this.player.play('violet_jump', true);
      } else if (moving) {
        this.player.play('violet_walk', true);
      } else {
        this.player.play('violet_idle', true);
      }
    }

    // Jump - only when grounded and not in water
    if (!this.isInWater && (this.cursors.up.isDown || this.cursors.space.isDown || this.keyW.isDown) && onGround) {
      this.player.setVelocityY(jumpForce);
      this.soundSys.play('jump');
    }

    // Attack (Z or X, only on JustDown)
    if (Phaser.Input.Keyboard.JustDown(this.keyZ) || Phaser.Input.Keyboard.JustDown(this.keyX)) {
      this.performAttack();
    }

    // Pause (ESC)
    if (Phaser.Input.Keyboard.JustDown(this.keyEsc)) {
      this.scene.launch('PauseScene');
      this.scene.pause();
    }
  }

  // ===========================================================================
  // ATTACK
  // ===========================================================================

  performAttack() {
    var hitbox = this.combat.attack(this.player, this.facingRight);
    if (!hitbox) return;

    this.player.play('violet_attack', true);

    var self = this;
    this.player.once('animationcomplete-violet_attack', function() {
      if (self.player.active && self.player.body.blocked.down) {
        self.player.play('violet_idle', true);
      }
    });
  }

  checkAttackHits() {
    if (!this.combat.attackHitbox) return;

    var self = this;
    this.enemies.getChildren().forEach(function(enemy) {
      if (!enemy.active) return;
      if (self.physics.overlap(self.combat.attackHitbox, enemy)) {
        self.combat.damageEnemy(enemy, 1);
      }
    });

    // Boss attack check
    if (this.boss && this.boss.active) {
      if (this.physics.overlap(this.combat.attackHitbox, this.boss)) {
        this.damageBoss(1);
      }
    }
  }

  // ===========================================================================
  // ENEMY BEHAVIOR
  // ===========================================================================

  updateEnemyBehavior() {
    var self = this;
    this.enemies.getChildren().forEach(function(enemy) {
      if (!enemy.active) return;

      // Patrol (beetles, rats, golems, etc.)
      if (enemy.patrolLeft !== undefined) {
        if (enemy.x <= enemy.patrolLeft) {
          enemy.body.setVelocityX(enemy.patrolSpeed || 40);
          enemy.setFlipX(false);
          enemy.patrolDir = 1;
        } else if (enemy.x >= enemy.patrolRight) {
          enemy.body.setVelocityX(-(enemy.patrolSpeed || 40));
          enemy.setFlipX(true);
          enemy.patrolDir = -1;
        }
      }

      // Bat: sine wave flight
      if (enemy.enemyType === 'cave_bat') {
        enemy.batTime += 0.03;
        enemy.y = enemy.startY + Math.sin(enemy.batTime) * 30;
        if (enemy.patrolLeft !== undefined) {
          enemy.body.setVelocityX(enemy.patrolDir > 0 ? 50 : -50);
        }
      }

      // Fish: periodic jump from water
      if (enemy.enemyType === 'fish_enemy') {
        enemy.fishTimer++;
        if (!enemy.fishJumping && enemy.fishTimer > 120) {
          enemy.fishJumping = true;
          enemy.fishTimer = 0;
          enemy.body.setAllowGravity(true);
          enemy.setVelocityY(-250);
          self.time.delayedCall(2000, function() {
            if (enemy.active) {
              enemy.body.setAllowGravity(false);
              enemy.setPosition(enemy.x, enemy.startY);
              enemy.setVelocity(0, 0);
              enemy.fishJumping = false;
            }
          });
        }
      }

      // Barn cat: pounce when player is close
      if (enemy.enemyType === 'barn_cat' && !enemy.pounced) {
        var catDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, self.player.x, self.player.y);
        if (catDist < 100) {
          enemy.pounced = true;
          var catDir = self.player.x > enemy.x ? 1 : -1;
          enemy.setVelocityX(catDir * 200);
          enemy.setVelocityY(-200);
          enemy.setFlipX(catDir < 0);
        }
      }

      // Wind sprite: push player when close
      if (enemy.enemyType === 'wind_sprite') {
        var spriteDist = Phaser.Math.Distance.Between(enemy.x, enemy.y, self.player.x, self.player.y);
        if (spriteDist < 80) {
          var pushDir = self.player.x > enemy.x ? 1 : -1;
          self.player.body.velocity.x += pushDir * 3;
        }
      }
    }, this);
  }

  // ===========================================================================
  // MOVING PLATFORMS
  // ===========================================================================

  updateMovingPlatforms() {
    for (var i = 0; i < this.movingPlatforms.length; i++) {
      var plat = this.movingPlatforms[i];
      if (!plat.active) continue;

      if (plat.moveX > 0) {
        if (plat.x >= plat.startX + plat.moveX) {
          plat.body.setVelocityX(-plat.platSpeed);
          plat.platDir = -1;
        } else if (plat.x <= plat.startX) {
          plat.body.setVelocityX(plat.platSpeed);
          plat.platDir = 1;
        }
      }

      if (plat.moveY > 0) {
        if (plat.y >= plat.startY + plat.moveY) {
          plat.body.setVelocityY(-plat.platSpeed);
          plat.platDir = -1;
        } else if (plat.y <= plat.startY) {
          plat.body.setVelocityY(plat.platSpeed);
          plat.platDir = 1;
        }
      }
    }
  }

  // ===========================================================================
  // WIND ZONES
  // ===========================================================================

  updateWindZones() {
    for (var i = 0; i < this.windZones.length; i++) {
      var wz = this.windZones[i];
      var halfW = wz.width / 2;
      var halfH = wz.height / 2;

      // Check if player is inside the wind zone bounds
      if (this.player.x > wz.x - halfW && this.player.x < wz.x + halfW &&
          this.player.y > wz.y - halfH && this.player.y < wz.y + halfH) {
        this.player.body.velocity.x += wz.forceX * 0.05;
        this.player.body.velocity.y += wz.forceY * 0.05;
      }
    }
  }

  // ===========================================================================
  // BOSS
  // ===========================================================================

  updateBoss() {
    if (!this.boss || !this.boss.active) return;

    // Patrol
    if (this.boss.patrolLeft !== undefined) {
      if (this.boss.x <= this.boss.patrolLeft) {
        this.boss.body.setVelocityX(this.boss.patrolSpeed);
        this.boss.setFlipX(false);
        this.boss.patrolDir = 1;
      } else if (this.boss.x >= this.boss.patrolRight) {
        this.boss.body.setVelocityX(-this.boss.patrolSpeed);
        this.boss.setFlipX(true);
        this.boss.patrolDir = -1;
      }
    }

    // Boss phases: get faster as health drops
    var hpRatio = this.boss.hp / this.boss.maxHp;
    if (hpRatio < 0.3 && this.boss.bossPhase < 3) {
      this.boss.bossPhase = 3;
      this.boss.patrolSpeed = (this.boss.patrolSpeed || 60) * 1.5;
      this.boss.setTint(0xff4444);
    } else if (hpRatio < 0.6 && this.boss.bossPhase < 2) {
      this.boss.bossPhase = 2;
      this.boss.patrolSpeed = (this.boss.patrolSpeed || 60) * 1.2;
      this.boss.setTint(0xffaa44);
    }

    // Boss attack: periodic jump toward player
    this.boss.attackTimer++;
    if (this.boss.attackTimer > 120) {
      this.boss.attackTimer = 0;
      var bossDist = Phaser.Math.Distance.Between(this.boss.x, this.boss.y, this.player.x, this.player.y);
      if (bossDist < 250) {
        var jumpDir = this.player.x > this.boss.x ? 1 : -1;
        this.boss.setVelocityX(jumpDir * 180);
        this.boss.setVelocityY(-300);
      }
    }
  }

  damageBoss(damage) {
    this.boss.hp -= damage;

    // Flash white
    this.boss.setTint(0xffffff);
    var self = this;
    this.time.delayedCall(100, function() {
      if (self.boss && self.boss.active) {
        self.boss.clearTint();
      }
    });

    this.soundSys.play('hitEnemy');

    if (this.boss.hp <= 0) {
      this.bossDefeated = true;
      GameState.tutorial.enemiesDefeated++;
      this.events.emit('enemyDefeated', this.boss);
      this.events.emit('spawnCoin', this.boss.x, this.boss.y);

      // Boss death animation
      this.tweens.add({
        targets: this.boss,
        alpha: 0,
        y: this.boss.y - 40,
        scaleX: 1.5,
        scaleY: 1.5,
        duration: 600,
        onComplete: function() {
          if (self.boss) {
            self.boss.destroy();
            self.boss = null;
          }
        }
      });

      // Show victory message
      this.dialog.show('The boss is defeated! Find the exit!', { title: 'Victory!', autoDismiss: true, duration: 3000 });
    }
  }

  bossContact(player, boss) {
    if (this.combat.isAttacking) return;
    if (this.combat.invincible) return;

    var knockDir = player.x < boss.x ? -1 : 1;
    var damaged = this.combat.takeDamage(player, knockDir);
    if (damaged) {
      this.player.play('violet_hurt', true);
      var self = this;
      this.time.delayedCall(300, function() {
        if (self.player.active && self.player.body.blocked.down) {
          self.player.play('violet_idle', true);
        }
      });
    }
  }

  // ===========================================================================
  // HAZARD / BOUNCY CONTACT
  // ===========================================================================

  hazardContact(player, hazard) {
    if (this.combat.invincible) return;

    var knockDir = player.x < hazard.x ? -1 : 1;
    var damaged = this.combat.takeDamage(player, knockDir);
    if (damaged) {
      this.player.play('violet_hurt', true);
      this.player.setVelocityY(-300);
      var self = this;
      this.time.delayedCall(300, function() {
        if (self.player.active && self.player.body.blocked.down) {
          self.player.play('violet_idle', true);
        }
      });
    }
  }

  bouncyContact(player, bouncyTile) {
    player.setVelocityY(-550);
    this.soundSys.play('jump');
  }

  // ===========================================================================
  // SWIMMING SYSTEM (World 6 / rainbow_falls)
  // ===========================================================================

  updateSwimming() {
    var wasInWater = this.isInWater;
    this.isInWater = false;

    // Check if player center is inside any water tile position
    var playerCol = Math.floor(this.player.x / 32);
    var playerRow = Math.floor(this.player.y / 32);
    var tiles = this.levelData.tiles;
    if (playerRow >= 0 && playerRow < this.levelData.height &&
        playerCol >= 0 && playerCol < this.levelData.width) {
      var t = tiles[playerRow][playerCol];
      // For rainbow_falls: types 3,4,5 are water
      if (this.worldId === 'rainbow_falls' && (t === 3 || t === 4 || t === 5)) {
        this.isInWater = true;
      }
    }

    if (this.isInWater) {
      this.player.body.setGravityY(-700);
      this.airMeter = Math.max(0, this.airMeter - 0.1);
      if (this.airMeter <= 0) {
        this.airMeter = 25;
        this.combat.takeDamage(this.player, this.facingRight ? -1 : 1);
        this.soundSys.play('hurt');
      }
    } else {
      this.player.body.setGravityY(0);
      this.airMeter = Math.min(100, this.airMeter + 0.5);
    }
    this.events.emit('airChanged', this.airMeter);
  }

  // ===========================================================================
  // DARKNESS SYSTEM (Worlds 2, 5)
  // ===========================================================================

  setupDarkness(radius) {
    this.baseLightRadius = radius;
    this.lightRadius = radius;
    this.lightSources = [];

    // Collect crystal and torch positions as light sources
    var self = this;
    this.levelData.entities.forEach(function(e) {
      if (e.subtype === 'torch' || e.subtype === 'lantern') {
        self.lightSources.push({ x: e.x * 32 + 16, y: e.y * 32 + 16 });
      }
    });

    // Also crystals in the tilemap (tile type 3 in crystal_caves)
    if (this.worldId === 'crystal_caves') {
      for (var r = 0; r < this.levelData.height; r++) {
        for (var c = 0; c < this.levelData.width; c++) {
          if (this.levelData.tiles[r][c] === 3) {
            this.lightSources.push({ x: c * 32 + 16, y: r * 32 + 16 });
          }
        }
      }
    }

    // Create radial gradient texture for lights
    var lightSize = radius * 2 + 20;
    var lightCanvas = document.createElement('canvas');
    lightCanvas.width = lightSize;
    lightCanvas.height = lightSize;
    var lctx = lightCanvas.getContext('2d');
    var cx = lightSize / 2;
    var grad = lctx.createRadialGradient(cx, cx, 0, cx, cx, radius);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.5, 'rgba(255,255,255,0.6)');
    grad.addColorStop(1, 'rgba(0,0,0,0)');
    lctx.fillStyle = grad;
    lctx.fillRect(0, 0, lightSize, lightSize);
    if (!this.textures.exists('_light_grad')) {
      this.textures.addCanvas('_light_grad', lightCanvas);
    }
    this.lightTexSize = lightSize;

    // Create the darkness RenderTexture
    this.darkRT = this.add.renderTexture(0, 0, 800, 608);
    this.darkRT.setOrigin(0, 0);
    this.darkRT.setScrollFactor(0);
    this.darkRT.setDepth(1000);
    this.darkRT.setBlendMode(Phaser.BlendModes.MULTIPLY);
  }

  updateDarkness() {
    this.darkRT.fill(0x000000);
    var cam = this.cameras.main;
    var halfLight = this.lightTexSize / 2;

    // Player light
    var px = this.player.x - cam.scrollX;
    var py = this.player.y - cam.scrollY;
    this.darkRT.draw('_light_grad', px - halfLight, py - halfLight);

    // Static light sources (crystals, torches) -- only draw visible ones
    for (var i = 0; i < this.lightSources.length; i++) {
      var ls = this.lightSources[i];
      var sx = ls.x - cam.scrollX;
      var sy = ls.y - cam.scrollY;
      if (sx > -this.lightTexSize && sx < 800 + this.lightTexSize &&
          sy > -this.lightTexSize && sy < 608 + this.lightTexSize) {
        this.darkRT.draw('_light_grad', sx - halfLight, sy - halfLight);
      }
    }
  }

  // ===========================================================================
  // INTERACTIONS
  // ===========================================================================

  collectFood(player, food) {
    var type = food.foodType;
    food.destroy();

    if (type === 'heart') {
      if (GameState.player.health < GameState.player.maxHealth) {
        GameState.player.health++;
        this.events.emit('healthChanged', GameState.player.health);
      }
    } else if (type === 'air_bubble') {
      this.airMeter = Math.min(100, this.airMeter + 40);
      this.events.emit('airChanged', this.airMeter);
    } else {
      var points = (type === 'gem' || type === 'star') ? 200 : (type === 'milk' || type === 'feather') ? 150 : 100;
      GameState.player.score += points;
      GameState.tutorial.itemsEaten++;
      this.events.emit('scoreChanged', GameState.player.score);
      this.events.emit('itemsChanged', GameState.tutorial.itemsEaten);
    }

    this.soundSys.play('eat');
  }

  collectCoin(player, coin) {
    coin.destroy();
    GameState.player.score += 50;
    this.events.emit('scoreChanged', GameState.player.score);
    this.soundSys.play('coin');
  }

  collectKey(player, keyItem) {
    keyItem.destroy();
    this.keysCollected++;
    this.soundSys.play('coin');
    this.events.emit('keysChanged', this.keysCollected);

    // Show key message
    var msg = 'Key collected! (' + this.keysCollected + '/' + this.keysRequired + ')';
    this.dialog.show(msg, { title: this.levelData.name || 'MOO-QUEST', autoDismiss: true, duration: 2500 });

    // Try to open a locked door
    this.tryOpenDoor();
  }

  tryOpenDoor() {
    // Open doors in order as keys are collected
    var doorKeys = Object.keys(this.lockedDoors);
    if (doorKeys.length === 0) return;

    // Open the next locked door for each key collected
    var doorIndex = this.keysCollected - 1;
    if (doorIndex >= 0 && doorIndex < doorKeys.length) {
      var doorId = doorKeys[doorIndex];
      var doorGroup = this.lockedDoors[doorId];
      if (!doorGroup) return;

      this.soundSys.play('gateOpen');

      // Animate each door tile sliding up and fading
      var self = this;
      var children = doorGroup.getChildren().slice();
      children.forEach(function(tile, i) {
        self.tweens.add({
          targets: tile,
          y: tile.y - 200,
          alpha: 0,
          duration: 500,
          delay: i * 60,
          onComplete: function() {
            tile.destroy();
          }
        });
      });

      // Remove collider
      var collider = self.lockedDoorColliders[doorId];
      if (collider) {
        self.physics.world.removeCollider(collider);
        delete self.lockedDoorColliders[doorId];
      }
    }
  }

  enemyContact(player, enemy) {
    if (this.combat.isAttacking) return;
    if (this.combat.invincible) return;

    var knockDir = player.x < enemy.x ? -1 : 1;
    var damaged = this.combat.takeDamage(player, knockDir);
    if (damaged) {
      this.player.play('violet_hurt', true);
      var self = this;
      this.time.delayedCall(300, function() {
        if (self.player.active && self.player.body.blocked.down) {
          self.player.play('violet_idle', true);
        }
      });
    }
  }

  activateLever(player, lever) {
    if (lever.isOn) return;
    lever.isOn = true;
    lever.setTexture('lever_on');
    this.soundSys.play('lever');

    // Open the target gate
    var gate = this.gates[lever.targetGate];
    if (!gate) return;

    this.soundSys.play('gateOpen');

    var self = this;
    var children = gate.getChildren().slice();
    children.forEach(function(tile, i) {
      self.tweens.add({
        targets: tile,
        y: tile.y - 200,
        alpha: 0,
        duration: 500,
        delay: i * 60,
        onComplete: function() {
          tile.destroy();
        }
      });
    });

    var collider = this.gateColliders[lever.targetGate];
    if (collider) {
      this.physics.world.removeCollider(collider);
      delete this.gateColliders[lever.targetGate];
    }
  }

  reachFlag(player, flag) {
    if (this.levelComplete) return;

    // For world 6 (rainbow_falls), require boss to be defeated first
    if (this.worldId === 'rainbow_falls' && this.levelData.config && this.levelData.config.hasBoss && !this.bossDefeated) {
      this.dialog.show('Defeat the boss before you can leave!', { title: this.levelData.name, autoDismiss: true, duration: 2000 });
      return;
    }

    this.completeLevel();
  }

  completeLevel() {
    if (this.levelComplete) return;
    this.levelComplete = true;

    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    this.soundSys.play('victory');
    this.soundSys.stopMusic();

    GameState.tutorial.totalTime = Date.now() - GameState.tutorial.startTime;
    GameState.worlds[this.worldId].completed = true;

    if (this.levelData.nextWorld && GameState.worlds[this.levelData.nextWorld]) {
      GameState.worlds[this.levelData.nextWorld].unlocked = true;
    }

    DatabaseBridge.saveProgress(GameState);
    DatabaseBridge.saveHighScore(this.worldId, GameState.player.score);

    var self = this;
    this.time.delayedCall(1500, function() {
      self.scene.stop('HUDScene');
      self.scene.start('VictoryScene');
    });
  }

  // ===========================================================================
  // TUTORIAL TRIGGERS
  // ===========================================================================

  checkTriggers() {
    if (!this.levelData.triggers) return;
    if (this.currentTriggerIndex >= this.levelData.triggers.length) return;

    var trigger = this.levelData.triggers[this.currentTriggerIndex];
    if (this.player.x >= trigger.x) {
      this.currentTriggerIndex++;

      if (trigger.phase === 'victory') return;

      // Show tutorial message for this phase
      var msg = null;
      if (this.levelData.tutorialMessages && this.levelData.tutorialMessages[trigger.phase]) {
        msg = this.levelData.tutorialMessages[trigger.phase];
      }

      if (msg) {
        this.dialog.show(msg, { title: this.levelData.name || 'MOO-QUEST', autoDismiss: true, duration: 5000 });
      }

      this.events.emit('phaseChanged', trigger.phase);
    }
  }

  // ===========================================================================
  // COIN SPAWNING (from killed enemies via CombatSystem event)
  // ===========================================================================

  spawnCoin(x, y) {
    var coin = this.coins.create(x, y - 20, 'item_coin');
    coin.play('coin_spin');
    coin.setBounce(0.3);
    coin.setVelocityY(-150);
    coin.setSize(12, 12);

    this.physics.add.overlap(this.player, coin, this.collectCoin, null, this);
  }

  // ===========================================================================
  // PLAYER DEATH AND RESPAWN
  // ===========================================================================

  onPlayerDied() {
    // Respawn at the last checkpoint
    this.player.setPosition(this.lastCheckpointX, this.lastCheckpointY - 16);
    this.player.setVelocity(0, 0);

    // Reset water state
    this.isInWater = false;
    this.airMeter = 100;
    this.player.body.setGravityY(0);
    this.events.emit('airChanged', this.airMeter);

    // Restore health
    GameState.player.health = GameState.player.maxHealth;
    this.events.emit('healthChanged', GameState.player.health);

    // Brief invincibility with flashing effect
    this.combat.invincible = true;
    var self = this;
    this.tweens.add({
      targets: this.player,
      alpha: { from: 0.3, to: 1 },
      duration: 150,
      repeat: 5,
      yoyo: true,
      onComplete: function() {
        self.player.setAlpha(1);
        self.combat.invincible = false;
      }
    });
  }

  // ===========================================================================
  // CLEANUP
  // ===========================================================================

  shutdown() {
    this.combat.destroy();
    this.dialog.destroy();
    this.events.off('spawnCoin', this.spawnCoin, this);
    this.events.off('playerDied', this.onPlayerDied, this);

    // Destroy darkness render texture
    if (this.darkRT) {
      this.darkRT.destroy();
      this.darkRT = null;
    }

    // Clean up moving platforms
    for (var i = 0; i < this.movingPlatforms.length; i++) {
      if (this.movingPlatforms[i] && this.movingPlatforms[i].active) {
        this.movingPlatforms[i].destroy();
      }
    }
    this.movingPlatforms = [];

    // Clean up fireballs array
    this.fireballs = [];
    this.windZones = [];
    this.waterTilePositions = [];
    this.lightSources = [];

    // Destroy boss if still alive
    if (this.boss && this.boss.active) {
      this.boss.destroy();
      this.boss = null;
    }

    // Clean up locked door colliders
    var doorKeys = Object.keys(this.lockedDoorColliders);
    for (var d = 0; d < doorKeys.length; d++) {
      var col = this.lockedDoorColliders[doorKeys[d]];
      if (col) {
        this.physics.world.removeCollider(col);
      }
    }
    this.lockedDoorColliders = {};

    // Clean up gate colliders
    var gateKeys = Object.keys(this.gateColliders);
    for (var g = 0; g < gateKeys.length; g++) {
      var gc = this.gateColliders[gateKeys[g]];
      if (gc) {
        this.physics.world.removeCollider(gc);
      }
    }
    this.gateColliders = {};

    // Remove light gradient texture if it exists
    if (this.textures.exists('_light_grad')) {
      this.textures.remove('_light_grad');
    }
  }
}
