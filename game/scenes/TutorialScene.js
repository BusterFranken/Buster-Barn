// =============================================================================
// TutorialScene.js - Main gameplay scene for MOO-QUEST tutorial level
// Handles world building, player control, enemies, items, puzzle, and triggers.
// Loaded as a regular script (NOT an ES module).
// =============================================================================

class TutorialScene extends Phaser.Scene {
  constructor() {
    super({ key: 'TutorialScene' });
  }

  create() {
    // === WORLD SETUP ===
    this.physics.world.setBounds(0, 0, 6400, 608);
    this.cameras.main.setBounds(0, 0, 6400, 608);

    // Track level completion to avoid repeat triggers
    this.levelComplete = false;

    // === PARALLAX BACKGROUND ===
    this.createBackground();

    // === TILEMAP ===
    this.groundGroup = this.physics.add.staticGroup();
    this.buildTilemap();

    // === DECORATIONS ===
    this.placeDecorations();

    // === PLAYER (Violet) ===
    var spawn = TUTORIAL_LEVEL.entities.find(function(e) { return e.type === 'spawn'; });
    this.player = this.physics.add.sprite(spawn.x * 32 + 16, spawn.y * 32 + 16, 'violet');
    this.player.setCollideWorldBounds(true);
    this.player.setSize(20, 28);   // Slightly smaller hitbox for forgiving collisions
    this.player.setOffset(6, 4);
    this.player.play('violet_idle');
    this.facingRight = true;

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
    this.gates = {};
    this.gateColliders = {};

    this.spawnEntities();

    // === COLLIDERS ===
    this.physics.add.collider(this.player, this.groundGroup);
    this.physics.add.collider(this.enemies, this.groundGroup);
    this.physics.add.collider(this.coins, this.groundGroup);

    // Player overlaps
    this.physics.add.overlap(this.player, this.foods, this.collectFood, null, this);
    this.physics.add.overlap(this.player, this.coins, this.collectCoin, null, this);
    this.physics.add.overlap(this.player, this.enemies, this.enemyContact, null, this);
    this.physics.add.overlap(this.player, this.levers, this.activateLever, null, this);

    // === INPUT ===
    this.cursors = this.input.keyboard.createCursorKeys();
    this.keyA = this.input.keyboard.addKey('A');
    this.keyD = this.input.keyboard.addKey('D');
    this.keyW = this.input.keyboard.addKey('W');
    this.keyZ = this.input.keyboard.addKey('Z');
    this.keyX = this.input.keyboard.addKey('X');
    this.keyEsc = this.input.keyboard.addKey('ESC');

    // === TUTORIAL STATE ===
    this.currentTriggerIndex = 0;
    this.wasGrounded = false;

    // === EVENT LISTENERS ===
    this.events.on('spawnCoin', this.spawnCoin, this);
    this.events.on('playerDied', this.onPlayerDied, this);

    // Show first tutorial message after a short delay
    var self = this;
    this.time.delayedCall(500, function() {
      self.dialog.show(TUTORIAL_LEVEL.tutorialMessages.movement, { title: 'Tutorial' });
    });

    // Start music
    this.soundSys.startMusic();
  }

  // ===========================================================================
  // BACKGROUND - Parallax layers with clouds, hills, trees, bushes
  // ===========================================================================

  createBackground() {
    // Layer 0: Sky fill - solid color rectangle spanning the full world
    this.add.rectangle(3200, 304, 6400, 608, 0x87CEEB).setScrollFactor(0).setDepth(-100);

    // Layer 1 (farthest): Clouds at 0.1x scroll speed
    this.bgClouds = [];
    var cloudPositions = [
      { x: 100, y: 40 },  { x: 320, y: 60 },  { x: 560, y: 30 },
      { x: 750, y: 70 },  { x: 950, y: 45 },  { x: 1200, y: 55 },
      { x: 1500, y: 35 },  { x: 1800, y: 65 },  { x: 2100, y: 40 },
      { x: 2500, y: 50 },  { x: 2900, y: 30 },  { x: 3300, y: 60 },
      { x: 3700, y: 45 },  { x: 4100, y: 55 },  { x: 4500, y: 35 },
      { x: 5000, y: 50 },  { x: 5400, y: 40 },  { x: 5800, y: 60 },
      { x: 6200, y: 45 }
    ];
    for (var ci = 0; ci < cloudPositions.length; ci++) {
      var cloud = this.add.image(cloudPositions[ci].x, cloudPositions[ci].y, 'cloud');
      cloud.setScrollFactor(0.1, 0);
      cloud.setDepth(-90);
      cloud.setAlpha(0.8);
      this.bgClouds.push(cloud);
    }

    // Layer 2 (mid): Distant hills at 0.3x scroll speed
    this.bgHills = [];
    var hillSpacing = 300;
    var numHills = Math.ceil(6400 / hillSpacing) + 2;
    for (var hi = 0; hi < numHills; hi++) {
      var hillX = hi * hillSpacing + 80;
      var hillY = 440;
      var hill = this.add.image(hillX, hillY, 'hill_far');
      hill.setScrollFactor(0.3, 0);
      hill.setDepth(-80);
      hill.setAlpha(0.7);
      this.bgHills.push(hill);
    }

    // Layer 3 (near): Trees and bushes at 0.5x scroll speed
    this.bgTrees = [];
    var treeSpacing = 200;
    var numTrees = Math.ceil(6400 / treeSpacing) + 2;
    for (var ti = 0; ti < numTrees; ti++) {
      var treeX = ti * treeSpacing + 60;
      var treeY = 410;
      var tree = this.add.image(treeX, treeY, 'tree_bg');
      tree.setScrollFactor(0.5, 0);
      tree.setDepth(-70);
      tree.setAlpha(0.6);
      this.bgTrees.push(tree);
    }
  }

  // ===========================================================================
  // TILEMAP - Read TUTORIAL_LEVEL.tiles and create static physics bodies
  // ===========================================================================

  buildTilemap() {
    var tiles = TUTORIAL_LEVEL.tiles;
    var tileKeys = { 1: 'tile_grass', 2: 'tile_dirt', 3: 'tile_stone', 4: 'tile_platform' };

    for (var row = 0; row < TUTORIAL_LEVEL.height; row++) {
      for (var col = 0; col < TUTORIAL_LEVEL.width; col++) {
        var tileType = tiles[row][col];
        if (tileType > 0) {
          var tileKey = tileKeys[tileType];
          if (tileKey) {
            var tile = this.groundGroup.create(col * 32 + 16, row * 32 + 16, tileKey);
            tile.setSize(32, 32);
            tile.refreshBody();
          }
        }
      }
    }
  }

  // ===========================================================================
  // DECORATIONS - Place flowers, bushes, rocks, fences along the level
  // ===========================================================================

  placeDecorations() {
    // Scatter decorations on the ground surface in each zone.
    // Ground surface is at tile row 15 (y pixel = 15*32=480), so place just above.
    var decoY = 15 * 32;  // Top of ground row in pixels

    // Zone 1 (cols 0-31): Some flowers and a fence
    this.addDeco('flower', 5 * 32, decoY - 4);
    this.addDeco('flower', 12 * 32, decoY - 4);
    this.addDeco('flower', 18 * 32, decoY - 4);
    this.addDeco('flower', 25 * 32, decoY - 4);
    this.addDeco('bush', 15 * 32, decoY - 8);
    this.addDeco('fence', 20 * 32 + 16, decoY - 8);
    this.addDeco('fence', 22 * 32 + 16, decoY - 8);

    // Zone 2 (cols 32-69): Some rocks and flowers near platforms
    this.addDeco('rock', 35 * 32, decoY - 6);
    this.addDeco('flower', 46 * 32, decoY - 4);
    this.addDeco('bush', 52 * 32, decoY - 8);
    this.addDeco('rock', 60 * 32, decoY - 6);
    this.addDeco('flower', 67 * 32, decoY - 4);

    // Zone 3 (cols 70-101): Eating area -- more flowers and bushes
    this.addDeco('flower', 72 * 32, decoY - 4);
    this.addDeco('bush', 76 * 32, decoY - 8);
    this.addDeco('flower', 80 * 32, decoY - 4);
    this.addDeco('flower', 84 * 32, decoY - 4);
    this.addDeco('bush', 92 * 32, decoY - 8);
    this.addDeco('flower', 96 * 32, decoY - 4);
    this.addDeco('fence', 99 * 32, decoY - 8);

    // Zone 4 (cols 102-139): Combat area -- rocks and sparse flowers
    this.addDeco('rock', 104 * 32, decoY - 6);
    this.addDeco('rock', 118 * 32, decoY - 6);
    this.addDeco('flower', 112 * 32, decoY - 4);
    this.addDeco('flower', 137 * 32, decoY - 4);
    this.addDeco('bush', 133 * 32, decoY - 8);

    // Zone 5 (cols 140-171): Puzzle area -- stone zone, rocks
    var stoneDecoY = decoY; // Same ground level but stone
    this.addDeco('rock', 142 * 32, stoneDecoY - 6);
    this.addDeco('rock', 148 * 32, stoneDecoY - 6);
    this.addDeco('rock', 162 * 32, stoneDecoY - 6);
    this.addDeco('rock', 168 * 32, stoneDecoY - 6);

    // Zone 6 (cols 172-199): Victory stretch -- festive flowers and fences
    this.addDeco('flower', 175 * 32, decoY - 4);
    this.addDeco('flower', 178 * 32, decoY - 4);
    this.addDeco('flower', 181 * 32, decoY - 4);
    this.addDeco('flower', 184 * 32, decoY - 4);
    this.addDeco('flower', 187 * 32, decoY - 4);
    this.addDeco('bush', 189 * 32, decoY - 8);
    this.addDeco('fence', 195 * 32, decoY - 8);
    this.addDeco('fence', 197 * 32, decoY - 8);
  }

  addDeco(key, x, y) {
    var deco = this.add.image(x, y, key);
    deco.setOrigin(0.5, 1);  // Anchor at bottom center so it sits on the ground
    deco.setDepth(-10);
  }

  // ===========================================================================
  // ENTITIES - Spawn all entities from level data
  // ===========================================================================

  spawnEntities() {
    var self = this;
    TUTORIAL_LEVEL.entities.forEach(function(ent) {
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
        // spawn type is handled separately (player creation)
      }
    });
  }

  spawnFood(ent, px, py) {
    var keyMap = {
      grass: 'item_grass',
      hay: 'item_hay',
      milk: 'item_milk',
      heart: 'item_heart'
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
    var key = ent.subtype === 'slime' ? 'slime' : 'beetle';
    var animKey = ent.subtype === 'slime' ? 'slime_idle' : 'beetle_walk';
    var enemy = this.enemies.create(px, py, key);
    enemy.play(animKey);
    enemy.setSize(24, 24);
    enemy.setOffset(4, 8);
    enemy.hp = ent.subtype === 'slime' ? 1 : 2;
    enemy.setBounce(0);

    // Patrol behavior
    if (ent.patrolLeft !== undefined && ent.patrolRight !== undefined) {
      enemy.patrolLeft = ent.patrolLeft * 32;
      enemy.patrolRight = ent.patrolRight * 32;
      enemy.body.setVelocityX(40);
      enemy.patrolDir = 1;
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
    // Gate is a column of tiles blocking the player (6 tiles tall based on level data:
    // gate entity is at row 10, and the wall goes from row 10 to row 15)
    var gateGroup = this.physics.add.staticGroup();
    for (var i = 0; i < 6; i++) {
      var gateTile = gateGroup.create(px, (ent.y + i) * 32 + 16, 'gate_closed');
      gateTile.setSize(32, 32);
      gateTile.refreshBody();
    }
    this.gates[ent.id] = gateGroup;

    // Store the collider reference so we can remove it when the gate opens
    var collider = this.physics.add.collider(this.player, gateGroup);
    this.gateColliders[ent.id] = collider;
  }

  spawnFlag(px, py) {
    this.flagSprite = this.physics.add.sprite(px, py, 'flag');
    this.flagSprite.body.setAllowGravity(false);
    this.flagSprite.body.setImmovable(true);
    this.physics.add.overlap(this.player, this.flagSprite, this.reachFlag, null, this);
  }

  // ===========================================================================
  // UPDATE LOOP
  // ===========================================================================

  update(time, delta) {
    if (!this.player || !this.player.active) return;
    if (this.levelComplete) return;

    this.handleInput();
    this.updateEnemyPatrol();
    this.checkTriggers();
    this.checkAttackHits();
    this.dialog.update();
    this.updateCheckpoint();

    // Landing sound: play once when transitioning from airborne to grounded
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

    // Horizontal movement
    if (this.cursors.left.isDown || this.keyA.isDown) {
      this.player.setVelocityX(-160);
      this.facingRight = false;
      this.player.setFlipX(true);
      moving = true;
    } else if (this.cursors.right.isDown || this.keyD.isDown) {
      this.player.setVelocityX(160);
      this.facingRight = true;
      this.player.setFlipX(false);
      moving = true;
    } else {
      this.player.setVelocityX(0);
    }

    // Animations (only change if not attacking)
    if (!this.combat.isAttacking) {
      if (!onGround) {
        this.player.play('violet_jump', true);
      } else if (moving) {
        this.player.play('violet_walk', true);
      } else {
        this.player.play('violet_idle', true);
      }
    }

    // Jump - only when grounded
    if ((this.cursors.up.isDown || this.cursors.space.isDown || this.keyW.isDown) && onGround) {
      this.player.setVelocityY(-420);
      this.soundSys.play('jump');
    }

    // Attack (Z or X, only on JustDown to avoid repeated triggers)
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
    // Note: CombatSystem.attack() already plays the attack sound
  }

  checkAttackHits() {
    if (!this.combat.attackHitbox) return;

    var self = this;
    this.enemies.getChildren().forEach(function(enemy) {
      if (!enemy.active) return;
      if (self.physics.overlap(self.combat.attackHitbox, enemy)) {
        self.combat.damageEnemy(enemy, 1);
        // CombatSystem handles kill sound, coin spawn, and score tracking
      }
    });
  }

  // ===========================================================================
  // ENEMY PATROL
  // ===========================================================================

  updateEnemyPatrol() {
    this.enemies.getChildren().forEach(function(enemy) {
      if (!enemy.active || enemy.patrolLeft === undefined) return;

      if (enemy.x <= enemy.patrolLeft) {
        enemy.body.setVelocityX(40);
        enemy.setFlipX(false);
        enemy.patrolDir = 1;
      } else if (enemy.x >= enemy.patrolRight) {
        enemy.body.setVelocityX(-40);
        enemy.setFlipX(true);
        enemy.patrolDir = -1;
      }
    });
  }

  // ===========================================================================
  // INTERACTIONS
  // ===========================================================================

  collectFood(player, food) {
    var type = food.foodType;
    food.destroy();

    if (type === 'heart') {
      // Restore one health point if not at max
      if (GameState.player.health < GameState.player.maxHealth) {
        GameState.player.health++;
        this.events.emit('healthChanged', GameState.player.health);
      }
    } else {
      // Score: milk is worth more, regular food is standard
      GameState.player.score += (type === 'milk' ? 200 : 100);
      GameState.tutorial.itemsEaten++;
      this.events.emit('scoreChanged', GameState.player.score);
      this.events.emit('itemsChanged', GameState.tutorial.itemsEaten);
    }

    this.soundSys.play('eat');

    // Eat animation - brief head-dip
    var self = this;
    this.player.play('violet_eat', true);
    this.player.once('animationcomplete-violet_eat', function() {
      if (self.player.active) {
        self.player.play('violet_idle', true);
      }
    });
  }

  collectCoin(player, coin) {
    coin.destroy();
    GameState.player.score += 50;
    this.events.emit('scoreChanged', GameState.player.score);
    this.soundSys.play('coin');
  }

  enemyContact(player, enemy) {
    // If the player is actively attacking, ignore contact damage
    if (this.combat.isAttacking) return;
    // If already invincible (just took damage), ignore
    if (this.combat.invincible) return;

    var knockDir = player.x < enemy.x ? -1 : 1;
    var damaged = this.combat.takeDamage(player, knockDir);
    if (damaged) {
      // CombatSystem already plays hurt sound and flashes alpha
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

    // Animate each gate tile sliding up and fading out
    var self = this;
    var children = gate.getChildren().slice(); // copy the array since we modify it
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

    // Remove the collider so the player can pass through immediately
    // (the tween is visual only; disable physics blocking right away)
    var collider = this.gateColliders[lever.targetGate];
    if (collider) {
      this.physics.world.removeCollider(collider);
      delete this.gateColliders[lever.targetGate];
    }
  }

  reachFlag(player, flag) {
    if (this.levelComplete) return;
    this.levelComplete = true;

    // Freeze the player
    this.player.setVelocity(0, 0);
    this.player.body.setAllowGravity(false);

    this.soundSys.play('victory');
    this.soundSys.stopMusic();

    // Record completion stats
    GameState.tutorial.totalTime = Date.now() - GameState.tutorial.startTime;
    GameState.tutorial.currentPhase = 'complete';

    // Save progress
    GameState.worlds.emerald_pastures.completed = true;
    GameState.worlds.crystal_caves.unlocked = true;
    DatabaseBridge.saveProgress(GameState);
    DatabaseBridge.saveHighScore('emerald_pastures', GameState.player.score);

    // Transition to victory screen
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
    if (this.currentTriggerIndex >= TUTORIAL_LEVEL.triggers.length) return;

    var trigger = TUTORIAL_LEVEL.triggers[this.currentTriggerIndex];
    if (this.player.x >= trigger.x) {
      this.currentTriggerIndex++;

      // The victory trigger is handled by the flag overlap
      if (trigger.phase === 'victory') return;

      // Map trigger phases to GameState phases and tutorial messages
      var phaseMap = {
        'movement_complete': null,
        'jump_start':        'jump',
        'jump_complete':     null,
        'eat_start':         'eat',
        'eat_complete':      null,
        'combat_start':      'combat',
        'combat_complete':   null,
        'puzzle_start':      'puzzle',
        'puzzle_complete':   null
      };

      var gamePhase = phaseMap[trigger.phase];
      if (gamePhase !== undefined && gamePhase !== null) {
        GameState.tutorial.currentPhase = gamePhase;
        var msg = TUTORIAL_LEVEL.tutorialMessages[gamePhase];
        if (msg) {
          this.dialog.show(msg, { title: 'Tutorial', autoDismiss: true, duration: 5000 });
        }
      }

      // Emit for the HUD scene
      this.events.emit('phaseChanged', trigger.phase);
    }
  }

  // ===========================================================================
  // CHECKPOINT SYSTEM - Update checkpoint as player enters new zones
  // ===========================================================================

  updateCheckpoint() {
    // Zone boundaries in pixel x-coords (tile col * 32):
    // Zone 1: 0-1024, Zone 2: 1024-2240, Zone 3: 2240-3264,
    // Zone 4: 3264-4480, Zone 5: 4480-5504, Zone 6: 5504+
    var px = this.player.x;
    var zones = [
      { minX: 0,    cpX: 64 },     // Zone 1 start
      { minX: 1024, cpX: 1040 },   // Zone 2 start (col 32)
      { minX: 2240, cpX: 2256 },   // Zone 3 start (col 70)
      { minX: 3264, cpX: 3280 },   // Zone 4 start (col 102)
      { minX: 4480, cpX: 4496 },   // Zone 5 start (col 140)
      { minX: 5504, cpX: 5520 }    // Zone 6 start (col 172)
    ];

    // Walk backwards through zones to find the latest one the player has reached
    for (var i = zones.length - 1; i >= 0; i--) {
      if (px >= zones[i].minX) {
        if (GameState.tutorial.checkpointX < zones[i].cpX) {
          GameState.tutorial.checkpointX = zones[i].cpX;
        }
        break;
      }
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

    // Add overlap with player so this specific coin is collectible
    this.physics.add.overlap(this.player, coin, this.collectCoin, null, this);
  }

  // ===========================================================================
  // PLAYER DEATH AND RESPAWN
  // ===========================================================================

  onPlayerDied() {
    // Respawn at the last checkpoint
    var cpX = GameState.tutorial.checkpointX;
    // Place player on the ground: tile row 14 top = 14*32=448, center = 464
    this.player.setPosition(cpX, 14 * 32);
    this.player.setVelocity(0, 0);

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
  }
}
