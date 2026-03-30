/**
 * SpriteFactory - Procedural pixel art sprite generator for MOO-QUEST
 * Generates all game sprites using Canvas API and registers them as Phaser textures.
 * No external image assets required.
 */
class SpriteFactory {

  // ── Color Palette ──────────────────────────────────────────────────────
  static COLORS = {
    COW_PURPLE:       '#800080',
    COW_PURPLE_LIGHT: '#AA44AA',
    COW_WHITE:        '#FFFFFF',
    COW_PINK:         '#FFB6C1',
    COW_HOOVES:       '#4A2800',
    GRASS_DARK:       '#006600',
    GRASS_LIGHT:      '#00AA00',
    DIRT_DARK:        '#8B4513',
    DIRT_LIGHT:       '#CD853F',
    SKY_BLUE:         '#87CEEB',
    WIN95_GRAY:       '#C0C0C0',
    WIN95_DARK:       '#404040',
    WIN95_LIGHT:      '#DFDFDF',
    WIN95_BLUE:       '#000080',
    ENEMY_BEIGE:      '#D2B48C',
    ENEMY_BROWN:      '#8B6914',
    HEART_RED:        '#FF0000',
    FOOD_GREEN:       '#00CC00',
    FOOD_YELLOW:      '#DAA520',
    COIN_GOLD:        '#FFD700',
    // World 2: Crystal Caves
    CAVE_DARK:        '#2A2A3E',
    CAVE_MID:         '#3E3E56',
    CAVE_LIGHT:       '#55556E',
    CRYSTAL_CYAN:     '#00E5FF',
    CRYSTAL_LIGHT:    '#88FFFF',
    CRYSTAL_DARK:     '#0099AA',
    BAT_BROWN:        '#5A4030',
    BAT_DARK:         '#3A2820',
    // World 3: Lava Meadows
    LAVA_RED:         '#FF3300',
    LAVA_ORANGE:      '#FF6600',
    LAVA_YELLOW:      '#FFCC00',
    HOT_ROCK:         '#3A1A0A',
    HOT_ROCK_LIGHT:   '#5A2A1A',
    FIRE_ORANGE:      '#FF8800',
    // World 4: Cloud Kingdom
    CLOUD_WHITE:      '#F0F4FF',
    CLOUD_BLUE:       '#CCE0FF',
    CLOUD_PINK:       '#FFCCDD',
    CLOUD_BOUNCY:     '#FFDD88',
    RAINBOW_RED:      '#FF0000',
    RAINBOW_ORANGE:   '#FF8800',
    RAINBOW_YELLOW:   '#FFDD00',
    RAINBOW_GREEN:    '#00CC00',
    RAINBOW_BLUE:     '#0066FF',
    RAINBOW_PURPLE:   '#8800CC',
    // World 5: Shadow Barn
    WOOD_DARK:        '#3A2010',
    WOOD_MID:         '#5A3820',
    WOOD_LIGHT:       '#7A5030',
    HAY_GOLD:         '#D4AA30',
    HAY_LIGHT:        '#E8C848',
    BARN_RED:         '#AA2222',
    BARN_RED_LIGHT:   '#CC3333',
    // World 6: Rainbow Falls
    WATER_DARK:       '#1A44AA',
    WATER_MID:        '#2266CC',
    WATER_LIGHT:      '#4488EE',
    WATER_SURFACE:    '#66AAFF',
    CORAL_PINK:       '#FF6688',
    CORAL_RED:        '#CC3344',
  };

  // ── Utility helpers ────────────────────────────────────────────────────

  /** Create an off-screen canvas of the given size. */
  static _canvas(w, h) {
    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    var ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    return { canvas: c, ctx: ctx };
  }

  /** Fill a single "pixel block" (px-sized square at grid position). */
  static _px(ctx, x, y, color, size) {
    size = size || 1;
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
  }

  /** Fill a rectangle of pixel blocks. */
  static _rect(ctx, x, y, w, h, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, w, h);
  }

  /** Draw a filled circle (approximate, for pixel art). */
  static _circle(ctx, cx, cy, r, color) {
    ctx.fillStyle = color;
    for (var dy = -r; dy <= r; dy++) {
      for (var dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy <= r * r) {
          ctx.fillRect(cx + dx, cy + dy, 1, 1);
        }
      }
    }
  }

  /** Draw a filled ellipse. */
  static _ellipse(ctx, cx, cy, rx, ry, color) {
    ctx.fillStyle = color;
    for (var dy = -ry; dy <= ry; dy++) {
      for (var dx = -rx; dx <= rx; dx++) {
        if ((dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1) {
          ctx.fillRect(cx + dx, cy + dy, 1, 1);
        }
      }
    }
  }

  /** Draw a rounded rectangle. */
  static _roundRect(ctx, x, y, w, h, r, color) {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.lineTo(x + w - r, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + r);
    ctx.lineTo(x + w, y + h - r);
    ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    ctx.lineTo(x + r, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - r);
    ctx.lineTo(x, y + r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.closePath();
    ctx.fill();
  }

  // ── Cow drawing helpers ────────────────────────────────────────────────

  /**
   * Draw Violet the cow at a given frame offset.
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} ox  - x offset for this frame on the spritesheet
   * @param {object} opts - { legPhase, headDipY, headThrustX, jump, hurt, tailFlip }
   */
  static _drawCow(ctx, ox, opts) {
    var C = SpriteFactory.COLORS;
    opts = opts || {};
    var legPhase  = opts.legPhase  || 0;   // 0-3 walk cycle
    var headDipY  = opts.headDipY  || 0;   // pixels to dip the head down
    var headThrustX = opts.headThrustX || 0; // pixels to thrust head forward
    var jump      = opts.jump      || false;
    var hurt      = opts.hurt      || false;
    var tailFlip  = opts.tailFlip  || 0;   // 0 or 1

    // Cow faces right. Body centred in 32x32 frame.
    // Body: rounded rectangle 18x10 at roughly (5, 12)
    var bodyX = ox + 5;
    var bodyY = 12;
    var bodyW = 18;
    var bodyH = 10;

    // --- Body ---
    SpriteFactory._roundRect(ctx, bodyX, bodyY, bodyW, bodyH, 3, C.COW_PURPLE);

    // Lighter purple highlight on top of body
    SpriteFactory._rect(ctx, bodyX + 2, bodyY + 1, bodyW - 4, 3, C.COW_PURPLE_LIGHT);

    // White belly patch
    SpriteFactory._ellipse(ctx, bodyX + 9, bodyY + 7, 5, 2, C.COW_WHITE);

    // --- Head ---
    var headX = ox + 21 + headThrustX;
    var headY = 7 + headDipY;
    // Head is a rounded square
    SpriteFactory._roundRect(ctx, headX, headY, 9, 9, 2, C.COW_PURPLE);
    // Light purple cheek
    SpriteFactory._rect(ctx, headX + 2, headY + 1, 5, 3, C.COW_PURPLE_LIGHT);

    // Snout / nose area
    SpriteFactory._roundRect(ctx, headX + 5, headY + 4, 4, 4, 1, C.COW_PINK);
    // Nostrils
    SpriteFactory._px(ctx, headX + 6, headY + 6, C.COW_PURPLE);
    SpriteFactory._px(ctx, headX + 8, headY + 6, C.COW_PURPLE);

    // Eyes
    SpriteFactory._px(ctx, headX + 3, headY + 3, '#000000');
    SpriteFactory._px(ctx, headX + 5, headY + 3, '#000000');
    // Eye shine
    SpriteFactory._px(ctx, headX + 3, headY + 2, '#FFFFFF');

    // --- Horns ---
    SpriteFactory._rect(ctx, headX + 1, headY - 3, 2, 3, C.FOOD_YELLOW);
    SpriteFactory._rect(ctx, headX + 5, headY - 3, 2, 3, C.FOOD_YELLOW);
    // Horn tips
    SpriteFactory._px(ctx, headX + 1, headY - 3, '#FFFFCC');
    SpriteFactory._px(ctx, headX + 5, headY - 3, '#FFFFCC');

    // --- Ears ---
    SpriteFactory._rect(ctx, headX, headY - 1, 2, 2, C.COW_PURPLE);
    SpriteFactory._rect(ctx, headX + 6, headY - 1, 2, 2, C.COW_PURPLE);

    // --- Tail ---
    var tailBaseX = ox + 3;
    var tailBaseY = 13 + tailFlip;
    SpriteFactory._rect(ctx, tailBaseX, tailBaseY, 2, 1, C.COW_PURPLE);
    SpriteFactory._rect(ctx, tailBaseX - 1, tailBaseY - 1 - tailFlip, 2, 2, C.COW_PURPLE);
    // Tail tuft
    SpriteFactory._rect(ctx, tailBaseX - 2, tailBaseY - 2 - tailFlip, 2, 2, C.COW_PURPLE_LIGHT);

    // --- Legs ---
    var legY = bodyY + bodyH;  // 22
    var legH = jump ? 3 : 6;
    var legYOff = jump ? 3 : 0;

    // Leg positions (4 legs) - front-left, front-right, back-left, back-right
    var legs = [
      { x: bodyX + 2,  phase: 0 },
      { x: bodyX + 5,  phase: 2 },
      { x: bodyX + 12, phase: 1 },
      { x: bodyX + 15, phase: 3 },
    ];

    for (var i = 0; i < legs.length; i++) {
      var leg = legs[i];
      var lx = leg.x;
      var ly = legY + legYOff;
      var lh = legH;

      // Walking animation: shift legs up/down based on phase
      if (legPhase > 0 && !jump) {
        var offset = ((leg.phase + legPhase) % 4);
        if (offset === 0) { ly -= 2; lh += 2; }
        else if (offset === 1) { ly -= 1; lh += 1; }
        else if (offset === 2) { ly += 0; }
        else { ly -= 1; lh += 1; }
      }

      if (jump) {
        // Legs tucked under body
        SpriteFactory._rect(ctx, lx, legY, 2, 3, C.COW_PURPLE);
        SpriteFactory._rect(ctx, lx, legY + 2, 2, 1, C.COW_HOOVES);
      } else {
        // Normal legs
        SpriteFactory._rect(ctx, lx, ly, 2, lh, C.COW_PURPLE);
        // Hooves
        SpriteFactory._rect(ctx, lx, ly + lh - 2, 2, 2, C.COW_HOOVES);
      }
    }

    // --- Hurt overlay ---
    if (hurt) {
      ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
      ctx.fillRect(ox, 0, 32, 32);
    }
  }

  // ── Main generation entry point ────────────────────────────────────────

  static generateAll(scene) {
    SpriteFactory._generateViolet(scene);
    SpriteFactory._generateSlime(scene);
    SpriteFactory._generateBeetle(scene);
    SpriteFactory._generateGroundTiles(scene);
    SpriteFactory._generateCollectibles(scene);
    SpriteFactory._generateCoinSpritesheet(scene);
    SpriteFactory._generatePuzzleElements(scene);
    SpriteFactory._generateDecorations(scene);
    SpriteFactory._generateBackgrounds(scene);
    // World 2: Crystal Caves
    SpriteFactory._generateCrystalCavesTiles(scene);
    SpriteFactory._generateCrystalCavesEnemies(scene);
    SpriteFactory._generateCrystalCavesItems(scene);
    SpriteFactory._generateCrystalCavesDecorations(scene);
    // World 3: Lava Meadows
    SpriteFactory._generateLavaMeadowsTiles(scene);
    SpriteFactory._generateLavaMeadowsEnemies(scene);
    SpriteFactory._generateLavaMeadowsItems(scene);
    SpriteFactory._generateLavaMeadowsDecorations(scene);
    SpriteFactory._generateFireball(scene);
    // World 4: Cloud Kingdom
    SpriteFactory._generateCloudKingdomTiles(scene);
    SpriteFactory._generateCloudKingdomEnemies(scene);
    SpriteFactory._generateCloudKingdomItems(scene);
    SpriteFactory._generateCloudKingdomDecorations(scene);
    // World 5: Shadow Barn
    SpriteFactory._generateShadowBarnTiles(scene);
    SpriteFactory._generateShadowBarnEnemies(scene);
    SpriteFactory._generateShadowBarnItems(scene);
    SpriteFactory._generateShadowBarnDecorations(scene);
    // World 6: Rainbow Falls
    SpriteFactory._generateRainbowFallsTiles(scene);
    SpriteFactory._generateRainbowFallsEnemies(scene);
    SpriteFactory._generateRainbowFallsItems(scene);
    SpriteFactory._generateRainbowFallsDecorations(scene);
  }

  // ── 1. Violet the Cow (14 frames, 448x32) ─────────────────────────────

  static _generateViolet(scene) {
    var sheet = SpriteFactory._canvas(448, 32);
    var ctx = sheet.ctx;

    // Frame 0-1: Idle (2 frames)
    SpriteFactory._drawCow(ctx, 0, { tailFlip: 0 });
    SpriteFactory._drawCow(ctx, 32, { tailFlip: 1 });

    // Frame 2-5: Walk (4 frames)
    SpriteFactory._drawCow(ctx, 64,  { legPhase: 1 });
    SpriteFactory._drawCow(ctx, 96,  { legPhase: 2 });
    SpriteFactory._drawCow(ctx, 128, { legPhase: 3 });
    SpriteFactory._drawCow(ctx, 160, { legPhase: 4 });

    // Frame 6: Jump (1 frame)
    SpriteFactory._drawCow(ctx, 192, { jump: true });

    // Frame 7-9: Eat (3 frames) - head dips progressively
    SpriteFactory._drawCow(ctx, 224, { headDipY: 2 });
    SpriteFactory._drawCow(ctx, 256, { headDipY: 5 });
    SpriteFactory._drawCow(ctx, 288, { headDipY: 8 });

    // Frame 10-12: Attack (3 frames) - head thrusts forward
    SpriteFactory._drawCow(ctx, 320, { headThrustX: 0 });
    SpriteFactory._drawCow(ctx, 352, { headThrustX: 3 });
    SpriteFactory._drawCow(ctx, 384, { headThrustX: 5 });

    // Frame 13: Hurt (1 frame)
    SpriteFactory._drawCow(ctx, 416, { hurt: true, tailFlip: 1 });

    scene.textures.addSpriteSheet('violet', sheet.canvas, {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  // ── 2a. Slime enemy (2 frames, 64x32) ─────────────────────────────────

  static _generateSlime(scene) {
    var sheet = SpriteFactory._canvas(64, 32);
    var ctx = sheet.ctx;
    var C = SpriteFactory.COLORS;

    // Frame 0: Normal blob
    // Main body - blob shape
    SpriteFactory._ellipse(ctx, 16, 22, 11, 8, C.ENEMY_BEIGE);
    // Darker bottom edge
    SpriteFactory._ellipse(ctx, 16, 26, 12, 4, '#C4A882');
    // Highlight on top
    SpriteFactory._ellipse(ctx, 14, 17, 5, 3, '#E8D4B8');
    // Shiny spot
    SpriteFactory._circle(ctx, 11, 15, 2, '#F0E8DC');
    // Eyes - red dots
    SpriteFactory._circle(ctx, 12, 19, 2, '#FFFFFF');
    SpriteFactory._circle(ctx, 20, 19, 2, '#FFFFFF');
    SpriteFactory._px(ctx, 12, 19, '#FF0000');
    SpriteFactory._px(ctx, 13, 19, '#FF0000');
    SpriteFactory._px(ctx, 20, 19, '#FF0000');
    SpriteFactory._px(ctx, 21, 19, '#FF0000');
    // Mouth
    SpriteFactory._rect(ctx, 14, 23, 4, 1, '#8B6914');

    // Frame 1: Squished / stretched
    var ox = 32;
    SpriteFactory._ellipse(ctx, ox + 16, 24, 13, 6, C.ENEMY_BEIGE);
    SpriteFactory._ellipse(ctx, ox + 16, 27, 14, 3, '#C4A882');
    SpriteFactory._ellipse(ctx, ox + 14, 20, 6, 2, '#E8D4B8');
    SpriteFactory._circle(ctx, ox + 11, 18, 2, '#F0E8DC');
    // Eyes
    SpriteFactory._circle(ctx, ox + 12, 21, 2, '#FFFFFF');
    SpriteFactory._circle(ctx, ox + 20, 21, 2, '#FFFFFF');
    SpriteFactory._px(ctx, ox + 12, 21, '#FF0000');
    SpriteFactory._px(ctx, ox + 13, 21, '#FF0000');
    SpriteFactory._px(ctx, ox + 20, 21, '#FF0000');
    SpriteFactory._px(ctx, ox + 21, 21, '#FF0000');
    SpriteFactory._rect(ctx, ox + 14, 25, 4, 1, '#8B6914');

    scene.textures.addSpriteSheet('slime', sheet.canvas, {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  // ── 2b. Beetle enemy (2 frames, 64x32) ────────────────────────────────

  static _generateBeetle(scene) {
    var sheet = SpriteFactory._canvas(64, 32);
    var ctx = sheet.ctx;
    var C = SpriteFactory.COLORS;

    for (var frame = 0; frame < 2; frame++) {
      var ox = frame * 32;
      var legOffset = frame * 2;

      // Body - brown oval
      SpriteFactory._ellipse(ctx, ox + 16, 18, 10, 7, C.ENEMY_BROWN);
      // Shell line down the middle
      SpriteFactory._rect(ctx, ox + 15, 11, 2, 14, '#6B4900');
      // Shell highlight
      SpriteFactory._ellipse(ctx, ox + 12, 15, 4, 3, '#A07818');

      // Head
      SpriteFactory._circle(ctx, ox + 16, 10, 4, '#5A3A00');
      // Eyes
      SpriteFactory._px(ctx, ox + 14, 9, '#FFFFFF');
      SpriteFactory._px(ctx, ox + 18, 9, '#FFFFFF');
      SpriteFactory._px(ctx, ox + 14, 10, '#000000');
      SpriteFactory._px(ctx, ox + 18, 10, '#000000');

      // Pincers / mandibles
      SpriteFactory._rect(ctx, ox + 12, 6, 2, 3, '#3A2000');
      SpriteFactory._rect(ctx, ox + 18, 6, 2, 3, '#3A2000');
      SpriteFactory._px(ctx, ox + 11, 6, '#3A2000');
      SpriteFactory._px(ctx, ox + 20, 6, '#3A2000');

      // Antennae
      SpriteFactory._rect(ctx, ox + 13, 4, 1, 3, '#3A2000');
      SpriteFactory._rect(ctx, ox + 18, 4, 1, 3, '#3A2000');
      SpriteFactory._px(ctx, ox + 12, 4, '#3A2000');
      SpriteFactory._px(ctx, ox + 19, 4, '#3A2000');

      // 6 legs (3 on each side) with animation offset
      var legPositions = [13, 16, 19];
      for (var li = 0; li < 3; li++) {
        var lx = ox + legPositions[li];
        var lyBase = 24;
        var legDown = ((li + legOffset) % 2 === 0) ? 0 : 2;

        // Left side leg
        SpriteFactory._rect(ctx, lx - 5, lyBase + legDown, 4, 1, '#3A2000');
        SpriteFactory._rect(ctx, lx - 5, lyBase + legDown + 1, 1, 2, '#3A2000');

        // Right side leg
        SpriteFactory._rect(ctx, lx + 5, lyBase - legDown, 4, 1, '#3A2000');
        SpriteFactory._rect(ctx, lx + 5, lyBase - legDown + 1, 1, 2, '#3A2000');
      }
    }

    scene.textures.addSpriteSheet('beetle', sheet.canvas, {
      frameWidth: 32,
      frameHeight: 32
    });
  }

  // ── 3. Ground Tiles (32x32 each) ──────────────────────────────────────

  static _generateGroundTiles(scene) {
    SpriteFactory._generateGrassTile(scene);
    SpriteFactory._generateDirtTile(scene);
    SpriteFactory._generateStoneTile(scene);
    SpriteFactory._generatePlatformTile(scene);
  }

  static _generateGrassTile(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Bottom half: dirt
    SpriteFactory._rect(ctx, 0, 16, 32, 16, C.DIRT_DARK);
    // Dirt texture - scattered lighter pixels
    for (var i = 0; i < 20; i++) {
      var dx = Math.floor(Math.random() * 32);
      var dy = 16 + Math.floor(Math.random() * 16);
      SpriteFactory._px(ctx, dx, dy, C.DIRT_LIGHT);
    }

    // Top portion: grass base
    SpriteFactory._rect(ctx, 0, 12, 32, 6, C.GRASS_DARK);
    // Lighter grass layer
    SpriteFactory._rect(ctx, 0, 12, 32, 3, C.GRASS_LIGHT);

    // Grass blades sticking up
    var bladePositions = [1, 3, 5, 8, 10, 13, 15, 17, 20, 22, 24, 27, 29, 31];
    for (var b = 0; b < bladePositions.length; b++) {
      var bx = bladePositions[b];
      var bh = 3 + Math.floor(Math.random() * 5);
      var col = (b % 2 === 0) ? C.GRASS_DARK : C.GRASS_LIGHT;
      SpriteFactory._rect(ctx, bx, 12 - bh, 1, bh, col);
    }
    // Extra grass tufts
    for (var g = 0; g < 8; g++) {
      var gx = Math.floor(Math.random() * 30);
      SpriteFactory._rect(ctx, gx, 10 - Math.floor(Math.random() * 3), 2, 2, C.GRASS_LIGHT);
    }

    scene.textures.addCanvas('tile_grass', t.canvas);
  }

  static _generateDirtTile(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.DIRT_DARK);
    // Subtle texture
    for (var i = 0; i < 40; i++) {
      var dx = Math.floor(Math.random() * 32);
      var dy = Math.floor(Math.random() * 32);
      var size = 1 + Math.floor(Math.random() * 2);
      SpriteFactory._rect(ctx, dx, dy, size, size, C.DIRT_LIGHT);
    }
    // A few darker spots
    for (var j = 0; j < 10; j++) {
      var sx = Math.floor(Math.random() * 31);
      var sy = Math.floor(Math.random() * 31);
      SpriteFactory._px(ctx, sx, sy, '#6B3410');
    }

    scene.textures.addCanvas('tile_dirt', t.canvas);
  }

  static _generateStoneTile(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Base stone color
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.WIN95_GRAY);

    // Stone block pattern with mortar lines
    // Horizontal mortar lines
    SpriteFactory._rect(ctx, 0, 0, 32, 1, C.WIN95_DARK);
    SpriteFactory._rect(ctx, 0, 10, 32, 1, C.WIN95_DARK);
    SpriteFactory._rect(ctx, 0, 21, 32, 1, C.WIN95_DARK);
    SpriteFactory._rect(ctx, 0, 31, 32, 1, C.WIN95_DARK);

    // Vertical mortar lines (offset per row for brick pattern)
    SpriteFactory._rect(ctx, 0, 1, 1, 9, C.WIN95_DARK);
    SpriteFactory._rect(ctx, 16, 1, 1, 9, C.WIN95_DARK);
    SpriteFactory._rect(ctx, 8, 11, 1, 10, C.WIN95_DARK);
    SpriteFactory._rect(ctx, 24, 11, 1, 10, C.WIN95_DARK);
    SpriteFactory._rect(ctx, 0, 22, 1, 9, C.WIN95_DARK);
    SpriteFactory._rect(ctx, 16, 22, 1, 9, C.WIN95_DARK);

    // Stone texture - subtle variation
    for (var i = 0; i < 30; i++) {
      var sx = Math.floor(Math.random() * 32);
      var sy = Math.floor(Math.random() * 32);
      SpriteFactory._px(ctx, sx, sy, (i % 2 === 0) ? '#B0B0B0' : '#D0D0D0');
    }

    scene.textures.addCanvas('tile_stone', t.canvas);
  }

  static _generatePlatformTile(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Win95-style raised button/platform
    // Fill with gray
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.WIN95_GRAY);

    // Light edge (top and left) - raised effect
    SpriteFactory._rect(ctx, 0, 0, 32, 2, C.WIN95_LIGHT);
    SpriteFactory._rect(ctx, 0, 0, 2, 32, C.WIN95_LIGHT);
    // Extra bright corner
    SpriteFactory._rect(ctx, 0, 0, 1, 1, '#FFFFFF');

    // Dark edge (bottom and right) - shadow effect
    SpriteFactory._rect(ctx, 0, 30, 32, 2, C.WIN95_DARK);
    SpriteFactory._rect(ctx, 30, 0, 2, 32, C.WIN95_DARK);
    // Extra dark corner
    SpriteFactory._rect(ctx, 31, 31, 1, 1, '#202020');

    // Inner subtle border
    SpriteFactory._rect(ctx, 2, 2, 28, 1, '#E8E8E8');
    SpriteFactory._rect(ctx, 2, 2, 1, 28, '#E8E8E8');
    SpriteFactory._rect(ctx, 2, 29, 28, 1, '#808080');
    SpriteFactory._rect(ctx, 29, 2, 1, 28, '#808080');

    scene.textures.addCanvas('tile_platform', t.canvas);
  }

  // ── 4. Collectibles (16x16 each) ──────────────────────────────────────

  static _generateCollectibles(scene) {
    SpriteFactory._generateItemGrass(scene);
    SpriteFactory._generateItemHay(scene);
    SpriteFactory._generateItemMilk(scene);
    SpriteFactory._generateItemHeart(scene);
  }

  static _generateItemGrass(scene) {
    var t = SpriteFactory._canvas(16, 16);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Small grass tuft
    // Base
    SpriteFactory._rect(ctx, 4, 12, 8, 4, C.GRASS_DARK);
    // Blades
    SpriteFactory._rect(ctx, 5, 6, 1, 7, C.GRASS_LIGHT);
    SpriteFactory._rect(ctx, 7, 4, 1, 9, C.GRASS_DARK);
    SpriteFactory._rect(ctx, 9, 5, 1, 8, C.GRASS_LIGHT);
    SpriteFactory._rect(ctx, 11, 7, 1, 6, C.GRASS_DARK);
    SpriteFactory._rect(ctx, 3, 8, 1, 5, C.GRASS_LIGHT);
    // Tips bent over
    SpriteFactory._px(ctx, 4, 6, C.GRASS_LIGHT);
    SpriteFactory._px(ctx, 6, 3, C.GRASS_DARK);
    SpriteFactory._px(ctx, 10, 4, C.GRASS_LIGHT);

    scene.textures.addCanvas('item_grass', t.canvas);
  }

  static _generateItemHay(scene) {
    var t = SpriteFactory._canvas(16, 16);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Small hay bale shape - rectangular with rounded top
    SpriteFactory._roundRect(ctx, 2, 5, 12, 10, 2, C.FOOD_YELLOW);
    // Hay texture lines
    SpriteFactory._rect(ctx, 3, 7, 10, 1, '#C49018');
    SpriteFactory._rect(ctx, 3, 10, 10, 1, '#C49018');
    SpriteFactory._rect(ctx, 3, 13, 10, 1, '#C49018');
    // Highlight
    SpriteFactory._rect(ctx, 4, 5, 4, 2, '#F0C040');
    // Straw strands sticking out
    SpriteFactory._rect(ctx, 1, 4, 1, 3, C.FOOD_YELLOW);
    SpriteFactory._rect(ctx, 14, 6, 1, 2, C.FOOD_YELLOW);
    SpriteFactory._px(ctx, 6, 3, '#F0C040');
    SpriteFactory._px(ctx, 10, 4, '#F0C040');

    scene.textures.addCanvas('item_hay', t.canvas);
  }

  static _generateItemMilk(scene) {
    var t = SpriteFactory._canvas(16, 16);
    var ctx = t.ctx;

    // Milk bottle shape
    // Bottle body
    SpriteFactory._roundRect(ctx, 4, 5, 8, 10, 2, '#FFFFFF');
    // Bottle neck
    SpriteFactory._rect(ctx, 6, 2, 4, 4, '#FFFFFF');
    // Blue cap
    SpriteFactory._rect(ctx, 5, 1, 6, 2, '#4488FF');
    // Cap highlight
    SpriteFactory._rect(ctx, 6, 1, 3, 1, '#88BBFF');
    // Label
    SpriteFactory._rect(ctx, 5, 8, 6, 4, '#E8E8FF');
    // Label text (tiny "M")
    SpriteFactory._px(ctx, 6, 9, '#4488FF');
    SpriteFactory._px(ctx, 7, 10, '#4488FF');
    SpriteFactory._px(ctx, 8, 9, '#4488FF');
    SpriteFactory._px(ctx, 9, 10, '#4488FF');
    SpriteFactory._px(ctx, 10, 9, '#4488FF');
    // Glass shine
    SpriteFactory._rect(ctx, 5, 5, 1, 6, '#F0F0FF');
    // Bottom
    SpriteFactory._rect(ctx, 5, 14, 6, 1, '#E0E0E0');

    scene.textures.addCanvas('item_milk', t.canvas);
  }

  static _generateItemHeart(scene) {
    var t = SpriteFactory._canvas(16, 16);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Classic pixel heart shape
    var heart = [
      '..XXXX..XXXX..',
      '.XXXXXXX.XXXXX.',  // wider heart
      'XXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXX',
      'XXXXXXXXXXXXXXXX',
      '.XXXXXXXXXXXXXX.',
      '..XXXXXXXXXXXX..',
      '...XXXXXXXXXX...',
      '....XXXXXXXX....',
      '.....XXXXXX.....',
      '......XXXX......',
      '.......XX.......',
    ];

    for (var row = 0; row < heart.length; row++) {
      for (var col = 0; col < heart[row].length; col++) {
        if (heart[row][col] === 'X') {
          SpriteFactory._px(ctx, col, row + 2, C.HEART_RED);
        }
      }
    }

    // Shine highlight
    SpriteFactory._px(ctx, 4, 4, '#FF6666');
    SpriteFactory._px(ctx, 5, 4, '#FF6666');
    SpriteFactory._px(ctx, 4, 5, '#FF4444');

    scene.textures.addCanvas('item_heart', t.canvas);
  }

  // ── 4b. Coin spritesheet (4 frames, 64x16) ────────────────────────────

  static _generateCoinSpritesheet(scene) {
    var sheet = SpriteFactory._canvas(64, 16);
    var ctx = sheet.ctx;
    var C = SpriteFactory.COLORS;

    // Frame 0: Full circle (front-facing coin)
    SpriteFactory._circle(ctx, 8, 8, 6, C.COIN_GOLD);
    SpriteFactory._circle(ctx, 8, 8, 5, '#FFE040');
    SpriteFactory._circle(ctx, 8, 8, 4, C.COIN_GOLD);
    // Dollar sign / star
    SpriteFactory._rect(ctx, 7, 5, 2, 6, '#FFE040');
    SpriteFactory._rect(ctx, 5, 7, 6, 2, '#FFE040');
    // Shine
    SpriteFactory._px(ctx, 5, 4, '#FFFFF0');
    SpriteFactory._px(ctx, 6, 4, '#FFFFF0');

    // Frame 1: Ellipse (turning)
    var ox1 = 16;
    SpriteFactory._ellipse(ctx, ox1 + 8, 8, 4, 6, C.COIN_GOLD);
    SpriteFactory._ellipse(ctx, ox1 + 8, 8, 3, 5, '#FFE040');
    SpriteFactory._rect(ctx, ox1 + 7, 5, 2, 6, C.COIN_GOLD);
    SpriteFactory._px(ctx, ox1 + 6, 4, '#FFFFF0');

    // Frame 2: Thin line (edge-on)
    var ox2 = 32;
    SpriteFactory._rect(ctx, ox2 + 7, 2, 2, 12, C.COIN_GOLD);
    SpriteFactory._rect(ctx, ox2 + 7, 3, 2, 2, '#FFE040');
    SpriteFactory._px(ctx, ox2 + 7, 2, '#FFFFF0');

    // Frame 3: Ellipse (turning back)
    var ox3 = 48;
    SpriteFactory._ellipse(ctx, ox3 + 8, 8, 4, 6, C.COIN_GOLD);
    SpriteFactory._ellipse(ctx, ox3 + 8, 8, 3, 5, '#FFE040');
    SpriteFactory._rect(ctx, ox3 + 7, 5, 2, 6, C.COIN_GOLD);
    SpriteFactory._px(ctx, ox3 + 9, 4, '#FFFFF0');

    scene.textures.addSpriteSheet('item_coin', sheet.canvas, {
      frameWidth: 16,
      frameHeight: 16
    });
  }

  // ── 5. Puzzle Elements (32x32 each) ────────────────────────────────────

  static _generatePuzzleElements(scene) {
    SpriteFactory._generateLeverOff(scene);
    SpriteFactory._generateLeverOn(scene);
    SpriteFactory._generateGateClosed(scene);
    SpriteFactory._generateGateOpen(scene);
    SpriteFactory._generateSignpost(scene);
  }

  static _generateLeverOff(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Base
    SpriteFactory._roundRect(ctx, 8, 24, 16, 6, 2, C.WIN95_GRAY);
    SpriteFactory._rect(ctx, 9, 24, 14, 1, C.WIN95_LIGHT);
    SpriteFactory._rect(ctx, 9, 29, 14, 1, C.WIN95_DARK);

    // Pivot point
    SpriteFactory._circle(ctx, 16, 23, 3, '#808080');
    SpriteFactory._circle(ctx, 16, 23, 2, C.WIN95_GRAY);

    // Lever handle pointing LEFT (off position)
    SpriteFactory._rect(ctx, 6, 14, 3, 10, '#808080');
    SpriteFactory._rect(ctx, 7, 14, 1, 10, '#A0A0A0');
    // Handle knob
    SpriteFactory._circle(ctx, 7, 13, 3, '#FF4444');
    SpriteFactory._circle(ctx, 7, 13, 2, '#FF6666');

    // Status indicator (gray = off)
    SpriteFactory._circle(ctx, 24, 20, 2, '#808080');

    scene.textures.addCanvas('lever_off', t.canvas);
  }

  static _generateLeverOn(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Base (same as off)
    SpriteFactory._roundRect(ctx, 8, 24, 16, 6, 2, C.WIN95_GRAY);
    SpriteFactory._rect(ctx, 9, 24, 14, 1, C.WIN95_LIGHT);
    SpriteFactory._rect(ctx, 9, 29, 14, 1, C.WIN95_DARK);

    // Pivot point
    SpriteFactory._circle(ctx, 16, 23, 3, '#808080');
    SpriteFactory._circle(ctx, 16, 23, 2, C.WIN95_GRAY);

    // Lever handle pointing RIGHT (on position)
    SpriteFactory._rect(ctx, 23, 14, 3, 10, '#808080');
    SpriteFactory._rect(ctx, 24, 14, 1, 10, '#A0A0A0');
    // Handle knob
    SpriteFactory._circle(ctx, 25, 13, 3, '#44FF44');
    SpriteFactory._circle(ctx, 25, 13, 2, '#66FF66');

    // Status indicator (green = on)
    SpriteFactory._circle(ctx, 24, 20, 2, '#00FF00');
    SpriteFactory._px(ctx, 23, 19, '#88FF88');

    scene.textures.addCanvas('lever_on', t.canvas);
  }

  static _generateGateClosed(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Vertical bars
    for (var i = 0; i < 6; i++) {
      var bx = 3 + i * 5;
      SpriteFactory._rect(ctx, bx, 2, 3, 28, C.DIRT_DARK);
      SpriteFactory._rect(ctx, bx, 2, 1, 28, C.DIRT_LIGHT);
    }
    // Horizontal crossbars
    SpriteFactory._rect(ctx, 2, 8, 28, 3, C.DIRT_DARK);
    SpriteFactory._rect(ctx, 2, 8, 28, 1, C.DIRT_LIGHT);
    SpriteFactory._rect(ctx, 2, 22, 28, 3, C.DIRT_DARK);
    SpriteFactory._rect(ctx, 2, 22, 28, 1, C.DIRT_LIGHT);

    // Top spikes
    for (var s = 0; s < 6; s++) {
      var sx = 3 + s * 5;
      SpriteFactory._rect(ctx, sx + 1, 0, 1, 3, '#6B3410');
    }

    scene.textures.addCanvas('gate_closed', t.canvas);
  }

  static _generateGateOpen(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Gate raised up - only show bottom portion of bars (top half visible)
    for (var i = 0; i < 6; i++) {
      var bx = 3 + i * 5;
      SpriteFactory._rect(ctx, bx, 2, 3, 12, C.DIRT_DARK);
      SpriteFactory._rect(ctx, bx, 2, 1, 12, C.DIRT_LIGHT);
    }
    // One crossbar visible
    SpriteFactory._rect(ctx, 2, 8, 28, 3, C.DIRT_DARK);
    SpriteFactory._rect(ctx, 2, 8, 28, 1, C.DIRT_LIGHT);
    // Top spikes
    for (var s = 0; s < 6; s++) {
      var sx = 3 + s * 5;
      SpriteFactory._rect(ctx, sx + 1, 0, 1, 3, '#6B3410');
    }

    scene.textures.addCanvas('gate_open', t.canvas);
  }

  static _generateSignpost(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Wooden post
    SpriteFactory._rect(ctx, 14, 10, 4, 21, C.DIRT_DARK);
    SpriteFactory._rect(ctx, 15, 10, 1, 21, C.DIRT_LIGHT);

    // Sign board (arrow shape pointing right)
    SpriteFactory._rect(ctx, 8, 3, 18, 8, C.DIRT_DARK);
    SpriteFactory._rect(ctx, 9, 4, 16, 6, C.DIRT_LIGHT);
    // Arrow point on right side
    ctx.fillStyle = C.DIRT_DARK;
    ctx.beginPath();
    ctx.moveTo(26, 2);
    ctx.lineTo(31, 7);
    ctx.lineTo(26, 12);
    ctx.closePath();
    ctx.fill();
    // Inner arrow
    ctx.fillStyle = C.DIRT_LIGHT;
    ctx.beginPath();
    ctx.moveTo(26, 4);
    ctx.lineTo(29, 7);
    ctx.lineTo(26, 10);
    ctx.closePath();
    ctx.fill();

    // Arrow text on sign (simple right-pointing arrow)
    SpriteFactory._rect(ctx, 12, 6, 8, 2, '#3A2000');
    SpriteFactory._px(ctx, 19, 5, '#3A2000');
    SpriteFactory._px(ctx, 19, 9, '#3A2000');
    SpriteFactory._px(ctx, 20, 6, '#3A2000');
    SpriteFactory._px(ctx, 20, 8, '#3A2000');

    // Ground dirt at base
    SpriteFactory._ellipse(ctx, 16, 30, 6, 2, C.DIRT_DARK);

    scene.textures.addCanvas('signpost', t.canvas);
  }

  // ── 6. Decorations (32x32 each) ────────────────────────────────────────

  static _generateDecorations(scene) {
    SpriteFactory._generateFlower(scene);
    SpriteFactory._generateBush(scene);
    SpriteFactory._generateRock(scene);
    SpriteFactory._generateFence(scene);
    SpriteFactory._generateFlag(scene);
  }

  static _generateFlower(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Stem
    SpriteFactory._rect(ctx, 15, 14, 2, 14, C.GRASS_DARK);
    // Leaf
    SpriteFactory._ellipse(ctx, 19, 22, 3, 2, C.GRASS_LIGHT);
    SpriteFactory._ellipse(ctx, 11, 20, 3, 2, C.GRASS_LIGHT);

    // Flower petals (5 petals around center)
    var petalColor = '#FF6699';
    SpriteFactory._circle(ctx, 16, 8, 3, petalColor);   // top
    SpriteFactory._circle(ctx, 12, 11, 3, petalColor);   // left
    SpriteFactory._circle(ctx, 20, 11, 3, petalColor);   // right
    SpriteFactory._circle(ctx, 13, 15, 3, petalColor);   // bottom-left
    SpriteFactory._circle(ctx, 19, 15, 3, petalColor);   // bottom-right

    // Petal highlights
    SpriteFactory._px(ctx, 15, 7, '#FFAACC');
    SpriteFactory._px(ctx, 11, 10, '#FFAACC');
    SpriteFactory._px(ctx, 19, 10, '#FFAACC');

    // Center
    SpriteFactory._circle(ctx, 16, 12, 3, '#FFDD00');
    SpriteFactory._circle(ctx, 16, 12, 2, '#FFE840');
    SpriteFactory._px(ctx, 15, 11, '#FFF080');

    scene.textures.addCanvas('flower', t.canvas);
  }

  static _generateBush(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Main bush body
    SpriteFactory._ellipse(ctx, 16, 20, 14, 10, C.GRASS_DARK);
    // Highlight blobs
    SpriteFactory._ellipse(ctx, 10, 16, 6, 5, C.GRASS_LIGHT);
    SpriteFactory._ellipse(ctx, 20, 14, 7, 6, '#00BB00');
    SpriteFactory._ellipse(ctx, 16, 18, 5, 4, C.GRASS_LIGHT);

    // Top bumps
    SpriteFactory._circle(ctx, 10, 12, 4, C.GRASS_DARK);
    SpriteFactory._circle(ctx, 18, 10, 5, C.GRASS_DARK);
    SpriteFactory._circle(ctx, 24, 13, 4, '#005500');

    // Leaf highlights
    SpriteFactory._circle(ctx, 10, 11, 2, C.GRASS_LIGHT);
    SpriteFactory._circle(ctx, 18, 9, 2, '#00CC00');
    SpriteFactory._circle(ctx, 23, 12, 2, C.GRASS_LIGHT);

    // Dark base
    SpriteFactory._ellipse(ctx, 16, 28, 12, 3, '#004400');

    scene.textures.addCanvas('bush', t.canvas);
  }

  static _generateRock(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Main rock body
    SpriteFactory._ellipse(ctx, 16, 22, 12, 8, '#909090');
    // Top surface (lighter)
    SpriteFactory._ellipse(ctx, 15, 19, 10, 6, C.WIN95_GRAY);
    // Highlight
    SpriteFactory._ellipse(ctx, 12, 17, 5, 3, '#D8D8D8');
    SpriteFactory._px(ctx, 10, 16, '#E8E8E8');

    // Cracks / detail
    SpriteFactory._rect(ctx, 14, 18, 6, 1, '#707070');
    SpriteFactory._rect(ctx, 18, 20, 1, 4, '#707070');
    SpriteFactory._rect(ctx, 10, 22, 4, 1, '#707070');

    // Shadow at bottom
    SpriteFactory._ellipse(ctx, 16, 28, 13, 3, '#606060');

    scene.textures.addCanvas('rock', t.canvas);
  }

  static _generateFence(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;
    var C = SpriteFactory.COLORS;

    // Fence posts (two vertical posts)
    SpriteFactory._rect(ctx, 2, 6, 4, 24, C.DIRT_DARK);
    SpriteFactory._rect(ctx, 3, 6, 1, 24, C.DIRT_LIGHT);
    SpriteFactory._rect(ctx, 26, 6, 4, 24, C.DIRT_DARK);
    SpriteFactory._rect(ctx, 27, 6, 1, 24, C.DIRT_LIGHT);

    // Post tops (pointed)
    ctx.fillStyle = C.DIRT_DARK;
    ctx.beginPath();
    ctx.moveTo(2, 6);
    ctx.lineTo(4, 2);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(26, 6);
    ctx.lineTo(28, 2);
    ctx.lineTo(30, 6);
    ctx.closePath();
    ctx.fill();

    // Horizontal rails
    SpriteFactory._rect(ctx, 2, 12, 28, 3, C.DIRT_DARK);
    SpriteFactory._rect(ctx, 2, 12, 28, 1, C.DIRT_LIGHT);
    SpriteFactory._rect(ctx, 2, 22, 28, 3, C.DIRT_DARK);
    SpriteFactory._rect(ctx, 2, 22, 28, 1, C.DIRT_LIGHT);

    scene.textures.addCanvas('fence', t.canvas);
  }

  static _generateFlag(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;

    // Pole
    SpriteFactory._rect(ctx, 4, 2, 2, 28, '#808080');
    SpriteFactory._rect(ctx, 5, 2, 1, 28, '#A0A0A0');
    // Pole top ball
    SpriteFactory._circle(ctx, 5, 3, 2, '#C0C0C0');
    SpriteFactory._px(ctx, 4, 2, '#E0E0E0');

    // Flag (triangular, pointing right)
    ctx.fillStyle = '#FF0000';
    ctx.beginPath();
    ctx.moveTo(6, 4);
    ctx.lineTo(28, 10);
    ctx.lineTo(6, 16);
    ctx.closePath();
    ctx.fill();

    // Flag highlight
    ctx.fillStyle = '#FF4444';
    ctx.beginPath();
    ctx.moveTo(7, 5);
    ctx.lineTo(20, 9);
    ctx.lineTo(7, 11);
    ctx.closePath();
    ctx.fill();

    // Flag wave effect - subtle darker stripe
    ctx.fillStyle = '#CC0000';
    ctx.beginPath();
    ctx.moveTo(6, 12);
    ctx.lineTo(22, 12);
    ctx.lineTo(6, 16);
    ctx.closePath();
    ctx.fill();

    // Pole base
    SpriteFactory._rect(ctx, 2, 28, 6, 3, '#606060');
    SpriteFactory._rect(ctx, 2, 28, 6, 1, '#808080');

    scene.textures.addCanvas('flag', t.canvas);
  }

  // ── 7. Background Elements ─────────────────────────────────────────────

  static _generateBackgrounds(scene) {
    SpriteFactory._generateCloud(scene);
    SpriteFactory._generateHillFar(scene);
    SpriteFactory._generateTreeBg(scene);
  }

  static _generateCloud(scene) {
    var t = SpriteFactory._canvas(64, 32);
    var ctx = t.ctx;

    // Fluffy cloud made of overlapping circles
    var baseColor = '#FFFFFF';
    var shadowColor = '#E8E8F0';

    // Shadow layer (slightly lower)
    SpriteFactory._ellipse(ctx, 32, 20, 26, 8, shadowColor);

    // Main cloud body - overlapping ellipses
    SpriteFactory._ellipse(ctx, 20, 16, 12, 8, baseColor);
    SpriteFactory._ellipse(ctx, 36, 14, 14, 10, baseColor);
    SpriteFactory._ellipse(ctx, 50, 16, 10, 7, baseColor);
    SpriteFactory._ellipse(ctx, 14, 18, 10, 6, baseColor);

    // Top bumps
    SpriteFactory._circle(ctx, 24, 10, 6, baseColor);
    SpriteFactory._circle(ctx, 38, 8, 7, baseColor);
    SpriteFactory._circle(ctx, 48, 11, 5, baseColor);

    // Highlights
    SpriteFactory._circle(ctx, 22, 9, 3, '#FFFFF8');
    SpriteFactory._circle(ctx, 36, 7, 3, '#FFFFF8');

    scene.textures.addCanvas('cloud', t.canvas);
  }

  static _generateHillFar(scene) {
    var t = SpriteFactory._canvas(64, 32);
    var ctx = t.ctx;

    // Distant green hill silhouette - smooth hill shape
    var hillColor = '#228B22';
    var hillLight = '#2EA02E';

    // Main hill shape using a big arc
    ctx.fillStyle = hillColor;
    ctx.beginPath();
    ctx.moveTo(0, 32);
    ctx.quadraticCurveTo(16, 4, 32, 12);
    ctx.quadraticCurveTo(48, 2, 64, 32);
    ctx.closePath();
    ctx.fill();

    // Lighter top highlight
    ctx.fillStyle = hillLight;
    ctx.beginPath();
    ctx.moveTo(4, 32);
    ctx.quadraticCurveTo(18, 8, 32, 14);
    ctx.quadraticCurveTo(48, 6, 60, 32);
    ctx.closePath();
    ctx.fill();

    // Haze overlay for distance effect
    ctx.fillStyle = 'rgba(135, 206, 235, 0.25)';
    ctx.fillRect(0, 0, 64, 32);

    scene.textures.addCanvas('hill_far', t.canvas);
  }

  static _generateTreeBg(scene) {
    var t = SpriteFactory._canvas(32, 32);
    var ctx = t.ctx;

    var trunkColor = '#5A3A20';
    var leafColor  = '#1A6B1A';
    var leafLight  = '#228B22';

    // Trunk
    SpriteFactory._rect(ctx, 13, 18, 6, 13, trunkColor);
    SpriteFactory._rect(ctx, 14, 18, 2, 13, '#6B4A30');

    // Tree crown - layered circles for a full tree look
    SpriteFactory._circle(ctx, 16, 12, 10, leafColor);
    SpriteFactory._circle(ctx, 10, 10, 7, leafColor);
    SpriteFactory._circle(ctx, 22, 10, 7, leafColor);
    SpriteFactory._circle(ctx, 16, 6, 8, leafColor);

    // Lighter leaf highlights
    SpriteFactory._circle(ctx, 13, 8, 4, leafLight);
    SpriteFactory._circle(ctx, 19, 6, 4, leafLight);
    SpriteFactory._circle(ctx, 10, 12, 3, leafLight);

    // Subtle top highlight
    SpriteFactory._circle(ctx, 15, 4, 3, '#2EA02E');

    // Haze for distance
    ctx.fillStyle = 'rgba(135, 206, 235, 0.2)';
    ctx.fillRect(0, 0, 32, 32);

    scene.textures.addCanvas('tree_bg', t.canvas);
  }
  // ══════════════════════════════════════════════════════════════════════
  // WORLD 2: CRYSTAL CAVES
  // ══════════════════════════════════════════════════════════════════════

  // ── W2 Tiles ──────────────────────────────────────────────────────────

  static _generateCrystalCavesTiles(scene) {
    var C = SpriteFactory.COLORS;

    // --- tile_cave_wall ---
    var tw = SpriteFactory._canvas(32, 32);
    var ctx = tw.ctx;
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.CAVE_DARK);
    // Subtle stone texture
    for (var i = 0; i < 35; i++) {
      var sx = Math.floor(Math.random() * 32);
      var sy = Math.floor(Math.random() * 32);
      SpriteFactory._px(ctx, sx, sy, C.CAVE_MID);
    }
    // Crack lines
    SpriteFactory._rect(ctx, 5, 8, 8, 1, '#1E1E30');
    SpriteFactory._rect(ctx, 12, 8, 1, 6, '#1E1E30');
    SpriteFactory._rect(ctx, 20, 18, 7, 1, '#1E1E30');
    SpriteFactory._rect(ctx, 20, 18, 1, 5, '#1E1E30');
    SpriteFactory._rect(ctx, 3, 24, 5, 1, '#1E1E30');
    // A few lighter specs
    for (var j = 0; j < 8; j++) {
      var lx = Math.floor(Math.random() * 32);
      var ly = Math.floor(Math.random() * 32);
      SpriteFactory._px(ctx, lx, ly, C.CAVE_LIGHT);
    }
    scene.textures.addCanvas('tile_cave_wall', tw.canvas);

    // --- tile_cave_floor ---
    var tf = SpriteFactory._canvas(32, 32);
    ctx = tf.ctx;
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.CAVE_MID);
    for (var i2 = 0; i2 < 30; i2++) {
      var fx = Math.floor(Math.random() * 32);
      var fy = Math.floor(Math.random() * 32);
      var fc = (i2 % 3 === 0) ? C.CAVE_DARK : C.CAVE_LIGHT;
      SpriteFactory._px(ctx, fx, fy, fc);
    }
    // Subtle horizontal surface line at top
    SpriteFactory._rect(ctx, 0, 0, 32, 1, C.CAVE_LIGHT);
    scene.textures.addCanvas('tile_cave_floor', tf.canvas);

    // --- tile_crystal ---
    var tc = SpriteFactory._canvas(32, 32);
    ctx = tc.ctx;
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.CRYSTAL_DARK);
    // Bright crystal surface
    SpriteFactory._rect(ctx, 2, 2, 28, 28, C.CRYSTAL_CYAN);
    // Faceted highlight lines
    SpriteFactory._rect(ctx, 4, 4, 12, 12, C.CRYSTAL_LIGHT);
    SpriteFactory._rect(ctx, 8, 8, 4, 4, '#FFFFFF');
    // Diagonal facet feel
    for (var d = 0; d < 10; d++) {
      SpriteFactory._px(ctx, 4 + d * 2, 4 + d * 2, C.CRYSTAL_LIGHT);
      SpriteFactory._px(ctx, 5 + d * 2, 4 + d * 2, '#FFFFFF');
    }
    // Sparkle dots
    SpriteFactory._px(ctx, 6, 6, '#FFFFFF');
    SpriteFactory._px(ctx, 22, 10, '#FFFFFF');
    SpriteFactory._px(ctx, 14, 24, '#FFFFFF');
    SpriteFactory._px(ctx, 26, 20, '#FFFFFF');
    // Edge glow
    SpriteFactory._rect(ctx, 0, 0, 32, 2, C.CRYSTAL_LIGHT);
    SpriteFactory._rect(ctx, 0, 0, 2, 32, C.CRYSTAL_LIGHT);
    scene.textures.addCanvas('tile_crystal', tc.canvas);
  }

  // ── W2 Enemies ────────────────────────────────────────────────────────

  static _generateCrystalCavesEnemies(scene) {
    var C = SpriteFactory.COLORS;

    // --- cave_bat (2 frames, 64x32) ---
    var bat = SpriteFactory._canvas(64, 32);
    var ctx = bat.ctx;

    // Frame 0: Wings up
    // Body
    SpriteFactory._ellipse(ctx, 16, 18, 5, 4, C.BAT_BROWN);
    // Head
    SpriteFactory._circle(ctx, 16, 13, 4, C.BAT_DARK);
    // Ears
    SpriteFactory._rect(ctx, 12, 8, 2, 4, C.BAT_DARK);
    SpriteFactory._rect(ctx, 18, 8, 2, 4, C.BAT_DARK);
    // Eyes (red)
    SpriteFactory._px(ctx, 14, 12, '#FF0000');
    SpriteFactory._px(ctx, 18, 12, '#FF0000');
    // Wings up
    SpriteFactory._rect(ctx, 4, 10, 8, 2, C.BAT_BROWN);
    SpriteFactory._rect(ctx, 2, 8, 4, 2, C.BAT_DARK);
    SpriteFactory._rect(ctx, 20, 10, 8, 2, C.BAT_BROWN);
    SpriteFactory._rect(ctx, 26, 8, 4, 2, C.BAT_DARK);
    // Wing membrane detail
    SpriteFactory._rect(ctx, 5, 12, 6, 1, C.BAT_DARK);
    SpriteFactory._rect(ctx, 21, 12, 6, 1, C.BAT_DARK);
    // Feet
    SpriteFactory._px(ctx, 14, 22, C.BAT_DARK);
    SpriteFactory._px(ctx, 18, 22, C.BAT_DARK);

    // Frame 1: Wings down
    var ox = 32;
    SpriteFactory._ellipse(ctx, ox + 16, 18, 5, 4, C.BAT_BROWN);
    SpriteFactory._circle(ctx, ox + 16, 13, 4, C.BAT_DARK);
    SpriteFactory._rect(ctx, ox + 12, 8, 2, 4, C.BAT_DARK);
    SpriteFactory._rect(ctx, ox + 18, 8, 2, 4, C.BAT_DARK);
    SpriteFactory._px(ctx, ox + 14, 12, '#FF0000');
    SpriteFactory._px(ctx, ox + 18, 12, '#FF0000');
    // Wings down
    SpriteFactory._rect(ctx, ox + 4, 18, 8, 2, C.BAT_BROWN);
    SpriteFactory._rect(ctx, ox + 2, 20, 4, 2, C.BAT_DARK);
    SpriteFactory._rect(ctx, ox + 20, 18, 8, 2, C.BAT_BROWN);
    SpriteFactory._rect(ctx, ox + 26, 20, 4, 2, C.BAT_DARK);
    SpriteFactory._rect(ctx, ox + 5, 16, 6, 1, C.BAT_DARK);
    SpriteFactory._rect(ctx, ox + 21, 16, 6, 1, C.BAT_DARK);
    SpriteFactory._px(ctx, ox + 14, 22, C.BAT_DARK);
    SpriteFactory._px(ctx, ox + 18, 22, C.BAT_DARK);

    scene.textures.addSpriteSheet('cave_bat', bat.canvas, {
      frameWidth: 32, frameHeight: 32
    });

    // --- crystal_golem (2 frames, 64x32) ---
    var golem = SpriteFactory._canvas(64, 32);
    ctx = golem.ctx;

    for (var frame = 0; frame < 2; frame++) {
      var gox = frame * 32;
      var shiftY = frame * 1; // slight vertical shift for frame 2

      // Body - bulky rock shape
      SpriteFactory._roundRect(ctx, gox + 6, 10 + shiftY, 20, 18 - shiftY, 3, C.CAVE_MID);
      // Darker outline edges
      SpriteFactory._rect(ctx, gox + 6, 10 + shiftY, 20, 2, C.CAVE_LIGHT);
      SpriteFactory._rect(ctx, gox + 6, 10 + shiftY, 2, 18 - shiftY, C.CAVE_LIGHT);

      // Head
      SpriteFactory._roundRect(ctx, gox + 10, 4 + shiftY, 12, 8, 2, C.CAVE_LIGHT);
      // Eyes (glowing cyan)
      SpriteFactory._rect(ctx, gox + 12, 7 + shiftY, 2, 2, C.CRYSTAL_CYAN);
      SpriteFactory._rect(ctx, gox + 18, 7 + shiftY, 2, 2, C.CRYSTAL_CYAN);

      // Crystal shards on top
      SpriteFactory._rect(ctx, gox + 11, 1 + shiftY, 2, 5, C.CRYSTAL_CYAN);
      SpriteFactory._rect(ctx, gox + 15, 0 + shiftY, 2, 6, C.CRYSTAL_LIGHT);
      SpriteFactory._rect(ctx, gox + 19, 2 + shiftY, 2, 4, C.CRYSTAL_CYAN);
      // Crystal tips
      SpriteFactory._px(ctx, gox + 11, 1 + shiftY, '#FFFFFF');
      SpriteFactory._px(ctx, gox + 15, 0 + shiftY, '#FFFFFF');
      SpriteFactory._px(ctx, gox + 19, 2 + shiftY, '#FFFFFF');

      // Arms
      SpriteFactory._rect(ctx, gox + 2, 14 + shiftY, 5, 4, C.CAVE_MID);
      SpriteFactory._rect(ctx, gox + 25, 14 + shiftY, 5, 4, C.CAVE_MID);

      // Legs
      SpriteFactory._rect(ctx, gox + 9, 26, 4, 5, C.CAVE_MID);
      SpriteFactory._rect(ctx, gox + 19, 26, 4, 5, C.CAVE_MID);
      // Feet
      SpriteFactory._rect(ctx, gox + 8, 30, 6, 2, C.CAVE_DARK);
      SpriteFactory._rect(ctx, gox + 18, 30, 6, 2, C.CAVE_DARK);
    }

    scene.textures.addSpriteSheet('crystal_golem', golem.canvas, {
      frameWidth: 32, frameHeight: 32
    });
  }

  // ── W2 Items ──────────────────────────────────────────────────────────

  static _generateCrystalCavesItems(scene) {
    var C = SpriteFactory.COLORS;

    // --- item_gem (16x16) ---
    var gem = SpriteFactory._canvas(16, 16);
    var ctx = gem.ctx;
    // Hexagonal blue gem
    ctx.fillStyle = C.WATER_DARK;
    ctx.beginPath();
    ctx.moveTo(8, 1);
    ctx.lineTo(13, 4);
    ctx.lineTo(13, 11);
    ctx.lineTo(8, 14);
    ctx.lineTo(3, 11);
    ctx.lineTo(3, 4);
    ctx.closePath();
    ctx.fill();
    // Inner lighter facet
    ctx.fillStyle = '#4488FF';
    ctx.beginPath();
    ctx.moveTo(8, 3);
    ctx.lineTo(11, 5);
    ctx.lineTo(11, 10);
    ctx.lineTo(8, 12);
    ctx.lineTo(5, 10);
    ctx.lineTo(5, 5);
    ctx.closePath();
    ctx.fill();
    // Highlight
    SpriteFactory._rect(ctx, 6, 4, 3, 2, '#88BBFF');
    SpriteFactory._px(ctx, 6, 4, '#FFFFFF');
    scene.textures.addCanvas('item_gem', gem.canvas);

    // --- item_torch (16x16) ---
    var torch = SpriteFactory._canvas(16, 16);
    ctx = torch.ctx;
    // Handle
    SpriteFactory._rect(ctx, 7, 7, 3, 8, C.DIRT_DARK);
    SpriteFactory._rect(ctx, 8, 7, 1, 8, C.DIRT_LIGHT);
    // Bracket
    SpriteFactory._rect(ctx, 5, 9, 7, 2, '#808080');
    // Flame base (orange)
    SpriteFactory._ellipse(ctx, 8, 6, 3, 3, C.FIRE_ORANGE);
    // Flame core (yellow)
    SpriteFactory._ellipse(ctx, 8, 5, 2, 2, C.LAVA_YELLOW);
    // Flame tip
    SpriteFactory._px(ctx, 8, 2, C.LAVA_YELLOW);
    SpriteFactory._px(ctx, 8, 3, '#FFFFFF');
    // Glow pixels
    SpriteFactory._px(ctx, 5, 4, '#FF660044');
    SpriteFactory._px(ctx, 11, 4, '#FF660044');
    scene.textures.addCanvas('item_torch', torch.canvas);
  }

  // ── W2 Decorations ────────────────────────────────────────────────────

  static _generateCrystalCavesDecorations(scene) {
    var C = SpriteFactory.COLORS;

    // --- stalactite (32x32) ---
    var stal = SpriteFactory._canvas(32, 32);
    var ctx = stal.ctx;
    // Wide base at top
    SpriteFactory._rect(ctx, 6, 0, 20, 6, C.CAVE_MID);
    SpriteFactory._rect(ctx, 8, 6, 16, 4, C.CAVE_MID);
    SpriteFactory._rect(ctx, 10, 10, 12, 4, C.CAVE_LIGHT);
    SpriteFactory._rect(ctx, 12, 14, 8, 4, C.CAVE_MID);
    SpriteFactory._rect(ctx, 14, 18, 4, 6, C.CAVE_LIGHT);
    SpriteFactory._rect(ctx, 15, 24, 2, 4, C.CAVE_MID);
    // Pointed tip
    SpriteFactory._px(ctx, 15, 28, C.CAVE_LIGHT);
    SpriteFactory._px(ctx, 16, 28, C.CAVE_LIGHT);
    SpriteFactory._px(ctx, 15, 29, C.CAVE_LIGHT);
    // Highlight on left side
    SpriteFactory._rect(ctx, 7, 1, 2, 5, C.CAVE_LIGHT);
    SpriteFactory._rect(ctx, 11, 11, 2, 3, '#6E6E88');
    scene.textures.addCanvas('stalactite', stal.canvas);

    // --- stalagmite (32x32) ---
    var stag = SpriteFactory._canvas(32, 32);
    ctx = stag.ctx;
    // Wide base at bottom
    SpriteFactory._rect(ctx, 6, 26, 20, 6, C.CAVE_MID);
    SpriteFactory._rect(ctx, 8, 22, 16, 4, C.CAVE_MID);
    SpriteFactory._rect(ctx, 10, 18, 12, 4, C.CAVE_LIGHT);
    SpriteFactory._rect(ctx, 12, 14, 8, 4, C.CAVE_MID);
    SpriteFactory._rect(ctx, 14, 8, 4, 6, C.CAVE_LIGHT);
    SpriteFactory._rect(ctx, 15, 4, 2, 4, C.CAVE_MID);
    // Pointed tip
    SpriteFactory._px(ctx, 15, 3, C.CAVE_LIGHT);
    SpriteFactory._px(ctx, 16, 3, C.CAVE_LIGHT);
    SpriteFactory._px(ctx, 15, 2, C.CAVE_LIGHT);
    // Highlight
    SpriteFactory._rect(ctx, 7, 27, 2, 4, C.CAVE_LIGHT);
    SpriteFactory._rect(ctx, 11, 19, 2, 3, '#6E6E88');
    scene.textures.addCanvas('stalagmite', stag.canvas);

    // --- crystal_cluster (32x32) ---
    var cc = SpriteFactory._canvas(32, 32);
    ctx = cc.ctx;
    // Base rock
    SpriteFactory._ellipse(ctx, 16, 28, 10, 4, C.CAVE_MID);
    // Crystal points growing up
    // Left crystal (tilted)
    SpriteFactory._rect(ctx, 6, 14, 3, 14, C.CRYSTAL_CYAN);
    SpriteFactory._rect(ctx, 7, 14, 1, 14, C.CRYSTAL_LIGHT);
    SpriteFactory._px(ctx, 7, 13, '#FFFFFF');
    // Center crystal (tall)
    SpriteFactory._rect(ctx, 13, 6, 4, 20, C.CRYSTAL_CYAN);
    SpriteFactory._rect(ctx, 14, 6, 2, 20, C.CRYSTAL_LIGHT);
    SpriteFactory._px(ctx, 14, 5, '#FFFFFF');
    SpriteFactory._px(ctx, 15, 5, '#FFFFFF');
    // Right crystal
    SpriteFactory._rect(ctx, 21, 10, 3, 16, C.CRYSTAL_CYAN);
    SpriteFactory._rect(ctx, 22, 10, 1, 16, C.CRYSTAL_LIGHT);
    SpriteFactory._px(ctx, 22, 9, '#FFFFFF');
    // Small crystal
    SpriteFactory._rect(ctx, 18, 18, 2, 8, C.CRYSTAL_DARK);
    SpriteFactory._rect(ctx, 18, 17, 2, 1, C.CRYSTAL_CYAN);
    // Sparkle
    SpriteFactory._px(ctx, 10, 16, '#FFFFFF');
    SpriteFactory._px(ctx, 24, 12, '#FFFFFF');
    scene.textures.addCanvas('crystal_cluster', cc.canvas);
  }

  // ══════════════════════════════════════════════════════════════════════
  // WORLD 3: LAVA MEADOWS
  // ══════════════════════════════════════════════════════════════════════

  // ── W3 Tiles ──────────────────────────────────────────────────────────

  static _generateLavaMeadowsTiles(scene) {
    var C = SpriteFactory.COLORS;

    // --- tile_lava ---
    var tl = SpriteFactory._canvas(32, 32);
    var ctx = tl.ctx;
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.LAVA_RED);
    // Orange molten streaks
    for (var i = 0; i < 20; i++) {
      var lx = Math.floor(Math.random() * 30);
      var ly = Math.floor(Math.random() * 32);
      var lw = 2 + Math.floor(Math.random() * 4);
      SpriteFactory._rect(ctx, lx, ly, lw, 1, C.LAVA_ORANGE);
    }
    // Yellow-hot highlights
    for (var j = 0; j < 10; j++) {
      var hx = Math.floor(Math.random() * 32);
      var hy = Math.floor(Math.random() * 32);
      SpriteFactory._px(ctx, hx, hy, C.LAVA_YELLOW);
    }
    // Dark crust spots
    for (var k = 0; k < 6; k++) {
      var cx = Math.floor(Math.random() * 30);
      var cy = Math.floor(Math.random() * 30);
      SpriteFactory._rect(ctx, cx, cy, 2, 2, C.HOT_ROCK);
    }
    scene.textures.addCanvas('tile_lava', tl.canvas);

    // --- tile_lava_surface ---
    var ts = SpriteFactory._canvas(32, 32);
    ctx = ts.ctx;
    // Lower portion: lava
    SpriteFactory._rect(ctx, 0, 8, 32, 24, C.LAVA_RED);
    for (var i2 = 0; i2 < 12; i2++) {
      var sx = Math.floor(Math.random() * 30);
      var sy = 8 + Math.floor(Math.random() * 22);
      SpriteFactory._rect(ctx, sx, sy, 3, 1, C.LAVA_ORANGE);
    }
    // Surface line - bubbling top
    SpriteFactory._rect(ctx, 0, 6, 32, 4, C.LAVA_ORANGE);
    SpriteFactory._rect(ctx, 0, 6, 32, 2, C.LAVA_YELLOW);
    // Bubbles
    SpriteFactory._circle(ctx, 8, 6, 2, C.LAVA_YELLOW);
    SpriteFactory._circle(ctx, 20, 5, 3, C.LAVA_YELLOW);
    SpriteFactory._px(ctx, 8, 5, '#FFFFFF');
    SpriteFactory._px(ctx, 20, 4, '#FFFFFF');
    SpriteFactory._circle(ctx, 28, 7, 2, C.LAVA_ORANGE);
    scene.textures.addCanvas('tile_lava_surface', ts.canvas);

    // --- tile_hot_rock ---
    var tr = SpriteFactory._canvas(32, 32);
    ctx = tr.ctx;
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.HOT_ROCK);
    // Texture variation
    for (var i3 = 0; i3 < 30; i3++) {
      var rx = Math.floor(Math.random() * 32);
      var ry = Math.floor(Math.random() * 32);
      SpriteFactory._px(ctx, rx, ry, C.HOT_ROCK_LIGHT);
    }
    // Glowing cracks (orange lines)
    SpriteFactory._rect(ctx, 4, 10, 10, 1, C.LAVA_ORANGE);
    SpriteFactory._rect(ctx, 13, 10, 1, 8, C.LAVA_ORANGE);
    SpriteFactory._rect(ctx, 20, 22, 8, 1, C.LAVA_ORANGE);
    SpriteFactory._rect(ctx, 20, 16, 1, 6, C.LAVA_RED);
    // A few yellow-hot spots in cracks
    SpriteFactory._px(ctx, 8, 10, C.LAVA_YELLOW);
    SpriteFactory._px(ctx, 24, 22, C.LAVA_YELLOW);
    scene.textures.addCanvas('tile_hot_rock', tr.canvas);

    // --- tile_moving_plat ---
    var tp = SpriteFactory._canvas(32, 32);
    ctx = tp.ctx;
    // Gray metal body
    SpriteFactory._rect(ctx, 0, 0, 32, 32, '#808080');
    // Top highlight
    SpriteFactory._rect(ctx, 0, 0, 32, 2, '#A0A0A0');
    SpriteFactory._rect(ctx, 0, 0, 2, 32, '#A0A0A0');
    // Bottom shadow
    SpriteFactory._rect(ctx, 0, 30, 32, 2, '#505050');
    SpriteFactory._rect(ctx, 30, 0, 2, 32, '#505050');
    // Orange/heated edges
    SpriteFactory._rect(ctx, 0, 0, 32, 1, C.LAVA_ORANGE);
    SpriteFactory._rect(ctx, 0, 31, 32, 1, C.LAVA_ORANGE);
    SpriteFactory._rect(ctx, 0, 0, 1, 32, C.LAVA_ORANGE);
    SpriteFactory._rect(ctx, 31, 0, 1, 32, C.LAVA_ORANGE);
    // Rivets (4 corners)
    SpriteFactory._circle(ctx, 5, 5, 2, '#606060');
    SpriteFactory._px(ctx, 4, 4, '#B0B0B0');
    SpriteFactory._circle(ctx, 27, 5, 2, '#606060');
    SpriteFactory._px(ctx, 26, 4, '#B0B0B0');
    SpriteFactory._circle(ctx, 5, 27, 2, '#606060');
    SpriteFactory._px(ctx, 4, 26, '#B0B0B0');
    SpriteFactory._circle(ctx, 27, 27, 2, '#606060');
    SpriteFactory._px(ctx, 26, 26, '#B0B0B0');
    // Center cross pattern
    SpriteFactory._rect(ctx, 14, 10, 4, 12, '#707070');
    SpriteFactory._rect(ctx, 10, 14, 12, 4, '#707070');
    scene.textures.addCanvas('tile_moving_plat', tp.canvas);
  }

  // ── W3 Enemies ────────────────────────────────────────────────────────

  static _generateLavaMeadowsEnemies(scene) {
    var C = SpriteFactory.COLORS;

    // --- fire_slime (2 frames, 64x32) ---
    var fs = SpriteFactory._canvas(64, 32);
    var ctx = fs.ctx;

    for (var frame = 0; frame < 2; frame++) {
      var ox = frame * 32;
      var squish = frame * 2; // wobble effect

      // Body - orange slime blob
      SpriteFactory._ellipse(ctx, ox + 16, 22 + squish, 11 - squish, 8 - squish, C.LAVA_ORANGE);
      // Darker bottom
      SpriteFactory._ellipse(ctx, ox + 16, 26 + squish, 12 - squish, 4, C.LAVA_RED);
      // Highlight
      SpriteFactory._ellipse(ctx, ox + 13, 18, 5, 3, C.LAVA_YELLOW);
      SpriteFactory._circle(ctx, ox + 10, 16, 2, '#FFEE88');

      // Eyes
      SpriteFactory._circle(ctx, ox + 12, 20, 2, '#FFFFFF');
      SpriteFactory._circle(ctx, ox + 20, 20, 2, '#FFFFFF');
      SpriteFactory._px(ctx, ox + 12, 20, '#000000');
      SpriteFactory._px(ctx, ox + 13, 20, '#000000');
      SpriteFactory._px(ctx, ox + 20, 20, '#000000');
      SpriteFactory._px(ctx, ox + 21, 20, '#000000');

      // Mouth
      SpriteFactory._rect(ctx, ox + 14, 24, 4, 1, C.HOT_ROCK);

      // Flame particles on top
      SpriteFactory._rect(ctx, ox + 10, 12 - frame, 2, 4, C.LAVA_YELLOW);
      SpriteFactory._px(ctx, ox + 10, 11 - frame, '#FFFFFF');
      SpriteFactory._rect(ctx, ox + 15, 10 - frame, 2, 5, C.FIRE_ORANGE);
      SpriteFactory._px(ctx, ox + 15, 9 - frame, C.LAVA_YELLOW);
      SpriteFactory._rect(ctx, ox + 20, 13 - frame, 2, 3, C.LAVA_YELLOW);
      SpriteFactory._px(ctx, ox + 20, 12 - frame, '#FFFFFF');
    }

    scene.textures.addSpriteSheet('fire_slime', fs.canvas, {
      frameWidth: 32, frameHeight: 32
    });

    // --- magma_beetle (2 frames, 64x32) ---
    var mb = SpriteFactory._canvas(64, 32);
    ctx = mb.ctx;

    for (var f = 0; f < 2; f++) {
      var bx = f * 32;
      var legOff = f * 2;

      // Body - dark red oval
      SpriteFactory._ellipse(ctx, bx + 16, 18, 10, 7, C.HOT_ROCK);
      // Shell line
      SpriteFactory._rect(ctx, bx + 15, 11, 2, 14, '#2A0A00');
      // Shell highlight
      SpriteFactory._ellipse(ctx, bx + 12, 15, 4, 3, C.HOT_ROCK_LIGHT);
      // Glowing orange cracks on shell
      SpriteFactory._rect(ctx, bx + 9, 16, 4, 1, C.LAVA_ORANGE);
      SpriteFactory._rect(ctx, bx + 19, 14, 1, 4, C.LAVA_ORANGE);
      SpriteFactory._rect(ctx, bx + 11, 20, 3, 1, C.LAVA_ORANGE);
      SpriteFactory._rect(ctx, bx + 20, 19, 3, 1, C.FIRE_ORANGE);
      // Yellow hot spots
      SpriteFactory._px(ctx, bx + 10, 16, C.LAVA_YELLOW);
      SpriteFactory._px(ctx, bx + 19, 15, C.LAVA_YELLOW);

      // Head
      SpriteFactory._circle(ctx, bx + 16, 10, 4, C.HOT_ROCK_LIGHT);
      // Eyes (glowing orange)
      SpriteFactory._px(ctx, bx + 14, 9, C.LAVA_ORANGE);
      SpriteFactory._px(ctx, bx + 18, 9, C.LAVA_ORANGE);
      SpriteFactory._px(ctx, bx + 14, 10, C.LAVA_YELLOW);
      SpriteFactory._px(ctx, bx + 18, 10, C.LAVA_YELLOW);

      // Mandibles
      SpriteFactory._rect(ctx, bx + 12, 6, 2, 3, C.HOT_ROCK);
      SpriteFactory._rect(ctx, bx + 18, 6, 2, 3, C.HOT_ROCK);

      // Antennae
      SpriteFactory._rect(ctx, bx + 13, 4, 1, 3, C.HOT_ROCK);
      SpriteFactory._rect(ctx, bx + 18, 4, 1, 3, C.HOT_ROCK);

      // 6 legs alternating
      var legPos = [13, 16, 19];
      for (var li = 0; li < 3; li++) {
        var lx = bx + legPos[li];
        var lyBase = 24;
        var legDown = ((li + legOff) % 2 === 0) ? 0 : 2;
        SpriteFactory._rect(ctx, lx - 5, lyBase + legDown, 4, 1, C.HOT_ROCK);
        SpriteFactory._rect(ctx, lx - 5, lyBase + legDown + 1, 1, 2, C.HOT_ROCK);
        SpriteFactory._rect(ctx, lx + 5, lyBase - legDown, 4, 1, C.HOT_ROCK);
        SpriteFactory._rect(ctx, lx + 5, lyBase - legDown + 1, 1, 2, C.HOT_ROCK);
      }
    }

    scene.textures.addSpriteSheet('magma_beetle', mb.canvas, {
      frameWidth: 32, frameHeight: 32
    });
  }

  // ── W3 Items ──────────────────────────────────────────────────────────

  static _generateLavaMeadowsItems(scene) {
    var C = SpriteFactory.COLORS;

    // --- item_fire_shield (16x16) ---
    var sh = SpriteFactory._canvas(16, 16);
    var ctx = sh.ctx;
    // Shield shape (pointed bottom)
    ctx.fillStyle = C.LAVA_RED;
    ctx.beginPath();
    ctx.moveTo(3, 2);
    ctx.lineTo(13, 2);
    ctx.lineTo(13, 9);
    ctx.lineTo(8, 14);
    ctx.lineTo(3, 9);
    ctx.closePath();
    ctx.fill();
    // Inner border
    ctx.fillStyle = '#CC2200';
    ctx.beginPath();
    ctx.moveTo(5, 4);
    ctx.lineTo(11, 4);
    ctx.lineTo(11, 8);
    ctx.lineTo(8, 12);
    ctx.lineTo(5, 8);
    ctx.closePath();
    ctx.fill();
    // Flame emblem in center
    SpriteFactory._rect(ctx, 7, 5, 2, 5, C.LAVA_ORANGE);
    SpriteFactory._px(ctx, 7, 4, C.LAVA_YELLOW);
    SpriteFactory._px(ctx, 8, 4, C.LAVA_YELLOW);
    SpriteFactory._px(ctx, 6, 7, C.FIRE_ORANGE);
    SpriteFactory._px(ctx, 9, 7, C.FIRE_ORANGE);
    // Highlight
    SpriteFactory._rect(ctx, 4, 3, 2, 1, '#FF6666');
    scene.textures.addCanvas('item_fire_shield', sh.canvas);
  }

  // ── W3 Decorations ────────────────────────────────────────────────────

  static _generateLavaMeadowsDecorations(scene) {
    var C = SpriteFactory.COLORS;

    // --- lava_bubble (32x32) ---
    var lb = SpriteFactory._canvas(32, 32);
    var ctx = lb.ctx;
    SpriteFactory._circle(ctx, 16, 16, 8, C.LAVA_ORANGE);
    SpriteFactory._circle(ctx, 16, 16, 6, C.LAVA_YELLOW);
    // Inner glow
    SpriteFactory._circle(ctx, 14, 14, 3, '#FFEE88');
    // Shine
    SpriteFactory._px(ctx, 12, 12, '#FFFFFF');
    SpriteFactory._px(ctx, 13, 11, '#FFFFFF');
    // Outer ring
    SpriteFactory._circle(ctx, 16, 16, 9, C.LAVA_RED);
    // Erase inner to keep ring only at edge (redraw inner)
    SpriteFactory._circle(ctx, 16, 16, 7, C.LAVA_ORANGE);
    SpriteFactory._circle(ctx, 16, 16, 5, C.LAVA_YELLOW);
    SpriteFactory._circle(ctx, 14, 14, 3, '#FFEE88');
    SpriteFactory._px(ctx, 12, 12, '#FFFFFF');
    scene.textures.addCanvas('lava_bubble', lb.canvas);

    // --- volcano_bg (64x32) ---
    var vb = SpriteFactory._canvas(64, 32);
    ctx = vb.ctx;
    // Mountain silhouette
    ctx.fillStyle = C.HOT_ROCK;
    ctx.beginPath();
    ctx.moveTo(0, 32);
    ctx.lineTo(16, 8);
    ctx.lineTo(26, 2);
    ctx.lineTo(36, 6);
    ctx.lineTo(48, 10);
    ctx.lineTo(64, 32);
    ctx.closePath();
    ctx.fill();
    // Lighter slope highlight
    ctx.fillStyle = C.HOT_ROCK_LIGHT;
    ctx.beginPath();
    ctx.moveTo(4, 32);
    ctx.lineTo(20, 10);
    ctx.lineTo(26, 4);
    ctx.lineTo(30, 8);
    ctx.lineTo(36, 32);
    ctx.closePath();
    ctx.fill();
    // Crater top glow
    SpriteFactory._rect(ctx, 22, 0, 8, 3, C.LAVA_ORANGE);
    SpriteFactory._rect(ctx, 24, 0, 4, 2, C.LAVA_YELLOW);
    // Lava streaks down the side
    SpriteFactory._rect(ctx, 25, 3, 2, 8, C.LAVA_RED);
    SpriteFactory._rect(ctx, 28, 5, 1, 6, C.LAVA_ORANGE);
    // Haze
    ctx.fillStyle = 'rgba(255, 100, 0, 0.1)';
    ctx.fillRect(0, 0, 64, 32);
    scene.textures.addCanvas('volcano_bg', vb.canvas);
  }

  // ── W3 Projectile ─────────────────────────────────────────────────────

  static _generateFireball(scene) {
    var C = SpriteFactory.COLORS;
    // 4-frame spritesheet, 16x16 each = 64x16
    var fb = SpriteFactory._canvas(64, 16);
    var ctx = fb.ctx;

    for (var frame = 0; frame < 4; frame++) {
      var ox = frame * 16;
      var rot = frame; // rotation offset

      // Core fireball
      SpriteFactory._circle(ctx, ox + 8, 8, 5, C.LAVA_ORANGE);
      SpriteFactory._circle(ctx, ox + 8, 8, 3, C.LAVA_YELLOW);
      SpriteFactory._circle(ctx, ox + 8, 8, 1, '#FFFFFF');

      // Spinning flame tendrils (rotate position per frame)
      var angles = [
        { x: 0, y: -5 }, { x: 5, y: 0 }, { x: 0, y: 5 }, { x: -5, y: 0 }
      ];
      var a1 = angles[(0 + rot) % 4];
      var a2 = angles[(1 + rot) % 4];
      var a3 = angles[(2 + rot) % 4];
      SpriteFactory._px(ctx, ox + 8 + a1.x, 8 + a1.y, C.FIRE_ORANGE);
      SpriteFactory._px(ctx, ox + 8 + a2.x, 8 + a2.y, C.LAVA_RED);
      SpriteFactory._px(ctx, ox + 8 + a3.x, 8 + a3.y, C.FIRE_ORANGE);
      // Additional flame detail
      SpriteFactory._px(ctx, ox + 8 + a1.x + (a1.x > 0 ? 1 : (a1.x < 0 ? -1 : 0)),
                         8 + a1.y + (a1.y > 0 ? 1 : (a1.y < 0 ? -1 : 0)), C.LAVA_YELLOW);
    }

    scene.textures.addSpriteSheet('fireball', fb.canvas, {
      frameWidth: 16, frameHeight: 16
    });
  }

  // ══════════════════════════════════════════════════════════════════════
  // WORLD 4: CLOUD KINGDOM
  // ══════════════════════════════════════════════════════════════════════

  // ── W4 Tiles ──────────────────────────────────────────────────────────

  static _generateCloudKingdomTiles(scene) {
    var C = SpriteFactory.COLORS;

    // --- tile_cloud ---
    var tc = SpriteFactory._canvas(32, 32);
    var ctx = tc.ctx;
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.CLOUD_WHITE);
    // Subtle cloud puff texture
    SpriteFactory._ellipse(ctx, 8, 6, 6, 4, '#FFFFFF');
    SpriteFactory._ellipse(ctx, 20, 4, 8, 5, '#FFFFFF');
    SpriteFactory._ellipse(ctx, 28, 8, 5, 4, '#FFFFFF');
    // Light blue shadow at bottom
    SpriteFactory._rect(ctx, 0, 26, 32, 6, C.CLOUD_BLUE);
    // Soft highlight
    for (var i = 0; i < 12; i++) {
      var px = Math.floor(Math.random() * 32);
      var py = Math.floor(Math.random() * 24);
      SpriteFactory._px(ctx, px, py, '#FFFFFF');
    }
    scene.textures.addCanvas('tile_cloud', tc.canvas);

    // --- tile_cloud_bouncy ---
    var tb = SpriteFactory._canvas(32, 32);
    ctx = tb.ctx;
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.CLOUD_PINK);
    // Yellow tint areas
    SpriteFactory._ellipse(ctx, 16, 16, 12, 10, C.CLOUD_BOUNCY);
    SpriteFactory._ellipse(ctx, 10, 10, 6, 5, C.CLOUD_PINK);
    SpriteFactory._ellipse(ctx, 22, 8, 7, 5, '#FFCCCC');
    // Spring lines at top (bouncy indicator)
    SpriteFactory._rect(ctx, 6, 2, 2, 3, '#FFAA44');
    SpriteFactory._rect(ctx, 8, 4, 2, 1, '#FFAA44');
    SpriteFactory._rect(ctx, 10, 2, 2, 3, '#FFAA44');
    SpriteFactory._rect(ctx, 20, 2, 2, 3, '#FFAA44');
    SpriteFactory._rect(ctx, 22, 4, 2, 1, '#FFAA44');
    SpriteFactory._rect(ctx, 24, 2, 2, 3, '#FFAA44');
    // Bottom shadow
    SpriteFactory._rect(ctx, 0, 28, 32, 4, '#DDAA77');
    scene.textures.addCanvas('tile_cloud_bouncy', tb.canvas);

    // --- tile_rainbow ---
    var trb = SpriteFactory._canvas(32, 32);
    ctx = trb.ctx;
    var bandH = 5; // ~5px per band, 6 bands = 30px + 2px border
    SpriteFactory._rect(ctx, 0, 0, 32, 1, '#AAAAAA');
    SpriteFactory._rect(ctx, 0, 1, 32, bandH, C.RAINBOW_RED);
    SpriteFactory._rect(ctx, 0, 1 + bandH, 32, bandH, C.RAINBOW_ORANGE);
    SpriteFactory._rect(ctx, 0, 1 + bandH * 2, 32, bandH, C.RAINBOW_YELLOW);
    SpriteFactory._rect(ctx, 0, 1 + bandH * 3, 32, bandH, C.RAINBOW_GREEN);
    SpriteFactory._rect(ctx, 0, 1 + bandH * 4, 32, bandH, C.RAINBOW_BLUE);
    SpriteFactory._rect(ctx, 0, 1 + bandH * 5, 32, bandH + 1, C.RAINBOW_PURPLE);
    SpriteFactory._rect(ctx, 0, 31, 32, 1, '#AAAAAA');
    // Subtle sparkles
    SpriteFactory._px(ctx, 5, 4, '#FFFFFF');
    SpriteFactory._px(ctx, 18, 12, '#FFFFFF');
    SpriteFactory._px(ctx, 26, 22, '#FFFFFF');
    SpriteFactory._px(ctx, 10, 28, '#FFFFFF');
    scene.textures.addCanvas('tile_rainbow', trb.canvas);
  }

  // ── W4 Enemies ────────────────────────────────────────────────────────

  static _generateCloudKingdomEnemies(scene) {
    var C = SpriteFactory.COLORS;

    // --- wind_sprite (2 frames, 64x32) ---
    var ws = SpriteFactory._canvas(64, 32);
    var ctx = ws.ctx;

    for (var frame = 0; frame < 2; frame++) {
      var ox = frame * 32;
      var rotOff = frame * 3; // rotation offset

      // Swirly translucent body
      SpriteFactory._circle(ctx, ox + 16, 16, 10, 'rgba(180, 220, 255, 0.7)');
      SpriteFactory._circle(ctx, ox + 16, 16, 7, 'rgba(200, 235, 255, 0.8)');
      SpriteFactory._circle(ctx, ox + 16, 16, 4, 'rgba(230, 245, 255, 0.9)');

      // Swirl lines (rotated between frames)
      SpriteFactory._rect(ctx, ox + 8 + rotOff, 10, 6, 1, 'rgba(255, 255, 255, 0.8)');
      SpriteFactory._rect(ctx, ox + 18 - rotOff, 14, 5, 1, 'rgba(255, 255, 255, 0.8)');
      SpriteFactory._rect(ctx, ox + 10 + rotOff, 20, 7, 1, 'rgba(200, 230, 255, 0.8)');
      SpriteFactory._rect(ctx, ox + 14, 8 + rotOff, 1, 5, 'rgba(255, 255, 255, 0.6)');

      // Eyes (darker blue)
      SpriteFactory._circle(ctx, ox + 13, 14, 2, '#4488CC');
      SpriteFactory._circle(ctx, ox + 19, 14, 2, '#4488CC');
      SpriteFactory._px(ctx, ox + 13, 14, '#FFFFFF');
      SpriteFactory._px(ctx, ox + 19, 14, '#FFFFFF');

      // Wind trail wisps
      SpriteFactory._rect(ctx, ox + 2, 12 + rotOff, 4, 1, 'rgba(200, 230, 255, 0.5)');
      SpriteFactory._rect(ctx, ox + 26, 18 - rotOff, 4, 1, 'rgba(200, 230, 255, 0.5)');
    }

    scene.textures.addSpriteSheet('wind_sprite', ws.canvas, {
      frameWidth: 32, frameHeight: 32
    });

    // --- cloud_puff (2 frames, 64x32) ---
    var cp = SpriteFactory._canvas(64, 32);
    ctx = cp.ctx;

    // Frame 0: Normal puff
    SpriteFactory._ellipse(ctx, 16, 18, 12, 9, '#FFFFFF');
    SpriteFactory._circle(ctx, 10, 14, 6, '#FFFFFF');
    SpriteFactory._circle(ctx, 22, 14, 6, '#FFFFFF');
    SpriteFactory._circle(ctx, 16, 10, 7, '#F8F8FF');
    // Shadow bottom
    SpriteFactory._ellipse(ctx, 16, 24, 11, 4, '#D0D8E8');
    // Angry face
    // Eyebrows (angled)
    SpriteFactory._rect(ctx, 9, 12, 4, 1, '#404040');
    SpriteFactory._rect(ctx, 19, 12, 4, 1, '#404040');
    SpriteFactory._px(ctx, 9, 13, '#404040');
    SpriteFactory._px(ctx, 22, 13, '#404040');
    // Eyes
    SpriteFactory._circle(ctx, 11, 15, 2, '#404040');
    SpriteFactory._circle(ctx, 21, 15, 2, '#404040');
    SpriteFactory._px(ctx, 11, 15, '#000000');
    SpriteFactory._px(ctx, 21, 15, '#000000');
    // Angry mouth
    SpriteFactory._rect(ctx, 13, 20, 6, 2, '#404040');

    // Frame 1: Puffed up (bigger)
    var ox2 = 32;
    SpriteFactory._ellipse(ctx, ox2 + 16, 17, 14, 11, '#FFFFFF');
    SpriteFactory._circle(ctx, ox2 + 8, 12, 7, '#FFFFFF');
    SpriteFactory._circle(ctx, ox2 + 24, 12, 7, '#FFFFFF');
    SpriteFactory._circle(ctx, ox2 + 16, 8, 8, '#F8F8FF');
    SpriteFactory._ellipse(ctx, ox2 + 16, 25, 13, 4, '#D0D8E8');
    // Angry face (bigger, redder)
    SpriteFactory._rect(ctx, ox2 + 8, 10, 5, 1, '#602020');
    SpriteFactory._rect(ctx, ox2 + 19, 10, 5, 1, '#602020');
    SpriteFactory._px(ctx, ox2 + 8, 11, '#602020');
    SpriteFactory._px(ctx, ox2 + 23, 11, '#602020');
    SpriteFactory._circle(ctx, ox2 + 11, 14, 2, '#602020');
    SpriteFactory._circle(ctx, ox2 + 21, 14, 2, '#602020');
    SpriteFactory._px(ctx, ox2 + 11, 14, '#000000');
    SpriteFactory._px(ctx, ox2 + 21, 14, '#000000');
    SpriteFactory._rect(ctx, ox2 + 12, 19, 8, 3, '#602020');
    // Red cheeks
    SpriteFactory._circle(ctx, ox2 + 8, 17, 2, '#FFAAAA');
    SpriteFactory._circle(ctx, ox2 + 24, 17, 2, '#FFAAAA');

    scene.textures.addSpriteSheet('cloud_puff', cp.canvas, {
      frameWidth: 32, frameHeight: 32
    });
  }

  // ── W4 Items ──────────────────────────────────────────────────────────

  static _generateCloudKingdomItems(scene) {
    var C = SpriteFactory.COLORS;

    // --- item_feather (16x16) ---
    var ft = SpriteFactory._canvas(16, 16);
    var ctx = ft.ctx;
    // Quill shaft
    SpriteFactory._rect(ctx, 7, 2, 1, 13, '#D0D8E8');
    // Feather barbs (left)
    SpriteFactory._rect(ctx, 3, 3, 4, 1, C.CLOUD_WHITE);
    SpriteFactory._rect(ctx, 2, 5, 5, 1, C.CLOUD_BLUE);
    SpriteFactory._rect(ctx, 3, 7, 4, 1, C.CLOUD_WHITE);
    SpriteFactory._rect(ctx, 4, 9, 3, 1, C.CLOUD_BLUE);
    SpriteFactory._rect(ctx, 5, 11, 2, 1, C.CLOUD_WHITE);
    // Feather barbs (right)
    SpriteFactory._rect(ctx, 8, 4, 4, 1, C.CLOUD_WHITE);
    SpriteFactory._rect(ctx, 8, 6, 5, 1, C.CLOUD_BLUE);
    SpriteFactory._rect(ctx, 8, 8, 4, 1, C.CLOUD_WHITE);
    SpriteFactory._rect(ctx, 8, 10, 3, 1, C.CLOUD_BLUE);
    SpriteFactory._rect(ctx, 8, 12, 2, 1, C.CLOUD_WHITE);
    // Tip
    SpriteFactory._px(ctx, 7, 1, '#E8EEF8');
    scene.textures.addCanvas('item_feather', ft.canvas);

    // --- item_star (16x16) ---
    var st = SpriteFactory._canvas(16, 16);
    ctx = st.ctx;
    // 5-pointed star
    ctx.fillStyle = C.COIN_GOLD;
    ctx.beginPath();
    ctx.moveTo(8, 1);
    ctx.lineTo(10, 6);
    ctx.lineTo(15, 6);
    ctx.lineTo(11, 9);
    ctx.lineTo(13, 15);
    ctx.lineTo(8, 11);
    ctx.lineTo(3, 15);
    ctx.lineTo(5, 9);
    ctx.lineTo(1, 6);
    ctx.lineTo(6, 6);
    ctx.closePath();
    ctx.fill();
    // Inner highlight
    ctx.fillStyle = '#FFE840';
    ctx.beginPath();
    ctx.moveTo(8, 4);
    ctx.lineTo(9, 6);
    ctx.lineTo(12, 7);
    ctx.lineTo(10, 9);
    ctx.lineTo(10, 12);
    ctx.lineTo(8, 10);
    ctx.lineTo(6, 12);
    ctx.lineTo(6, 9);
    ctx.lineTo(4, 7);
    ctx.lineTo(7, 6);
    ctx.closePath();
    ctx.fill();
    // Sparkle
    SpriteFactory._px(ctx, 7, 3, '#FFFFFF');
    SpriteFactory._px(ctx, 8, 3, '#FFFFFF');
    scene.textures.addCanvas('item_star', st.canvas);
  }

  // ── W4 Decorations ────────────────────────────────────────────────────

  static _generateCloudKingdomDecorations(scene) {
    var C = SpriteFactory.COLORS;

    // --- rainbow_arc (64x32) ---
    var ra = SpriteFactory._canvas(64, 32);
    var ctx = ra.ctx;
    var colors = [C.RAINBOW_RED, C.RAINBOW_ORANGE, C.RAINBOW_YELLOW,
                  C.RAINBOW_GREEN, C.RAINBOW_BLUE, C.RAINBOW_PURPLE];
    // Draw concentric arcs from outer to inner
    for (var b = 0; b < 6; b++) {
      var radius = 28 - b * 3;
      ctx.strokeStyle = colors[b];
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(32, 32, radius, Math.PI, 0);
      ctx.stroke();
    }
    scene.textures.addCanvas('rainbow_arc', ra.canvas);

    // --- sun_bg (64x64) ---
    var sun = SpriteFactory._canvas(64, 64);
    ctx = sun.ctx;
    // Outer glow
    SpriteFactory._circle(ctx, 32, 32, 28, 'rgba(255, 221, 0, 0.3)');
    // Rays
    var rayColor = '#FFE840';
    // 8 rays (N, NE, E, SE, S, SW, W, NW)
    SpriteFactory._rect(ctx, 30, 2, 4, 12, rayColor);  // N
    SpriteFactory._rect(ctx, 30, 50, 4, 12, rayColor);  // S
    SpriteFactory._rect(ctx, 2, 30, 12, 4, rayColor);   // W
    SpriteFactory._rect(ctx, 50, 30, 12, 4, rayColor);  // E
    // Diagonal rays
    ctx.save();
    ctx.translate(32, 32);
    ctx.rotate(Math.PI / 4);
    ctx.fillStyle = rayColor;
    ctx.fillRect(-2, -30, 4, 12);
    ctx.fillRect(-2, 18, 4, 12);
    ctx.fillRect(-30, -2, 12, 4);
    ctx.fillRect(18, -2, 12, 4);
    ctx.restore();
    // Main sun body
    SpriteFactory._circle(ctx, 32, 32, 16, C.LAVA_YELLOW);
    SpriteFactory._circle(ctx, 32, 32, 14, '#FFE840');
    SpriteFactory._circle(ctx, 32, 32, 12, C.COIN_GOLD);
    // Highlight
    SpriteFactory._circle(ctx, 28, 28, 6, '#FFEE88');
    SpriteFactory._circle(ctx, 26, 26, 3, '#FFFFF0');
    scene.textures.addCanvas('sun_bg', sun.canvas);
  }

  // ══════════════════════════════════════════════════════════════════════
  // WORLD 5: SHADOW BARN
  // ══════════════════════════════════════════════════════════════════════

  // ── W5 Tiles ──────────────────────────────────────────────────────────

  static _generateShadowBarnTiles(scene) {
    var C = SpriteFactory.COLORS;

    // --- tile_wood ---
    var tw = SpriteFactory._canvas(32, 32);
    var ctx = tw.ctx;
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.WOOD_MID);
    // Plank divisions
    SpriteFactory._rect(ctx, 0, 0, 32, 1, C.WOOD_DARK);
    SpriteFactory._rect(ctx, 0, 7, 32, 1, C.WOOD_DARK);
    SpriteFactory._rect(ctx, 0, 15, 32, 1, C.WOOD_DARK);
    SpriteFactory._rect(ctx, 0, 23, 32, 1, C.WOOD_DARK);
    SpriteFactory._rect(ctx, 0, 31, 32, 1, C.WOOD_DARK);
    // Grain lines (horizontal)
    for (var i = 0; i < 15; i++) {
      var gx = Math.floor(Math.random() * 28);
      var gy = Math.floor(Math.random() * 32);
      var gw = 3 + Math.floor(Math.random() * 6);
      SpriteFactory._rect(ctx, gx, gy, gw, 1, C.WOOD_LIGHT);
    }
    // Knot holes
    SpriteFactory._circle(ctx, 10, 12, 2, C.WOOD_DARK);
    SpriteFactory._circle(ctx, 24, 26, 2, C.WOOD_DARK);
    SpriteFactory._px(ctx, 10, 12, '#2A1808');
    SpriteFactory._px(ctx, 24, 26, '#2A1808');
    scene.textures.addCanvas('tile_wood', tw.canvas);

    // --- tile_hay ---
    var th = SpriteFactory._canvas(32, 32);
    ctx = th.ctx;
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.HAY_GOLD);
    // Hay strand texture
    for (var j = 0; j < 40; j++) {
      var hx = Math.floor(Math.random() * 32);
      var hy = Math.floor(Math.random() * 32);
      var hw = 1 + Math.floor(Math.random() * 4);
      var hc = (j % 3 === 0) ? C.HAY_LIGHT : (j % 3 === 1) ? '#C49828' : C.HAY_GOLD;
      SpriteFactory._rect(ctx, hx, hy, hw, 1, hc);
    }
    // Darker clumps
    for (var k = 0; k < 8; k++) {
      var cx = Math.floor(Math.random() * 30);
      var cy = Math.floor(Math.random() * 30);
      SpriteFactory._rect(ctx, cx, cy, 2, 2, '#B89828');
    }
    scene.textures.addCanvas('tile_hay', th.canvas);

    // --- tile_barn_door ---
    var td = SpriteFactory._canvas(32, 32);
    ctx = td.ctx;
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.BARN_RED);
    // Plank lines
    SpriteFactory._rect(ctx, 0, 0, 1, 32, C.BARN_RED_LIGHT);
    SpriteFactory._rect(ctx, 10, 0, 1, 32, '#881818');
    SpriteFactory._rect(ctx, 21, 0, 1, 32, '#881818');
    SpriteFactory._rect(ctx, 31, 0, 1, 32, '#881818');
    // Diagonal cross brace
    for (var d = 0; d < 30; d++) {
      SpriteFactory._px(ctx, 1 + d, 1 + d, '#881818');
      SpriteFactory._px(ctx, 30 - d, 1 + d, '#881818');
    }
    // Highlight
    SpriteFactory._rect(ctx, 1, 0, 8, 1, C.BARN_RED_LIGHT);
    SpriteFactory._rect(ctx, 0, 1, 1, 6, C.BARN_RED_LIGHT);
    // Metal cross brace brackets
    SpriteFactory._rect(ctx, 0, 10, 32, 2, '#606060');
    SpriteFactory._rect(ctx, 0, 20, 32, 2, '#606060');
    scene.textures.addCanvas('tile_barn_door', td.canvas);
  }

  // ── W5 Enemies ────────────────────────────────────────────────────────

  static _generateShadowBarnEnemies(scene) {
    var C = SpriteFactory.COLORS;

    // --- shadow_rat (2 frames, 64x32) ---
    var rat = SpriteFactory._canvas(64, 32);
    var ctx = rat.ctx;

    for (var frame = 0; frame < 2; frame++) {
      var ox = frame * 32;
      var legOff = frame * 2;

      // Body - small oval
      SpriteFactory._ellipse(ctx, ox + 14, 20, 8, 5, '#505050');
      // Darker back
      SpriteFactory._ellipse(ctx, ox + 12, 18, 5, 3, '#3A3A3A');

      // Head - pointed snout
      SpriteFactory._ellipse(ctx, ox + 22, 18, 5, 4, '#606060');
      SpriteFactory._ellipse(ctx, ox + 26, 18, 3, 2, '#707070');
      // Nose
      SpriteFactory._px(ctx, ox + 28, 18, '#FF8888');
      SpriteFactory._px(ctx, ox + 29, 18, '#FF8888');

      // Ears
      SpriteFactory._circle(ctx, ox + 20, 13, 3, '#606060');
      SpriteFactory._circle(ctx, ox + 20, 13, 2, '#FFAAAA');
      SpriteFactory._circle(ctx, ox + 24, 13, 3, '#606060');
      SpriteFactory._circle(ctx, ox + 24, 13, 2, '#FFAAAA');

      // Eyes (red, glowing)
      SpriteFactory._px(ctx, ox + 23, 16, '#FF0000');
      SpriteFactory._px(ctx, ox + 24, 16, '#FF0000');
      SpriteFactory._px(ctx, ox + 26, 16, '#FF0000');
      SpriteFactory._px(ctx, ox + 27, 16, '#FF0000');
      // Eye shine
      SpriteFactory._px(ctx, ox + 23, 15, '#FF6666');
      SpriteFactory._px(ctx, ox + 26, 15, '#FF6666');

      // Tail (long, curving)
      SpriteFactory._rect(ctx, ox + 2, 18, 6, 1, '#505050');
      SpriteFactory._rect(ctx, ox + 1, 16, 2, 2, '#505050');
      SpriteFactory._px(ctx, ox + 0, 15, '#505050');

      // Legs (scurrying)
      var legPositions = [10, 15, 20];
      for (var li = 0; li < 3; li++) {
        var lx = ox + legPositions[li];
        var down = ((li + legOff) % 2 === 0) ? 0 : 2;
        SpriteFactory._rect(ctx, lx, 24 + down, 2, 4 - down, '#3A3A3A');
        SpriteFactory._px(ctx, lx, 27, '#FFAAAA'); // tiny paw
      }
    }

    scene.textures.addSpriteSheet('shadow_rat', rat.canvas, {
      frameWidth: 32, frameHeight: 32
    });

    // --- barn_cat (2 frames, 64x32) ---
    var cat = SpriteFactory._canvas(64, 32);
    ctx = cat.ctx;

    // Frame 0: Sitting
    // Body
    SpriteFactory._ellipse(ctx, 14, 22, 8, 7, '#DD8833');
    // Stripes
    SpriteFactory._rect(ctx, 9, 18, 2, 6, '#AA5500');
    SpriteFactory._rect(ctx, 13, 17, 2, 7, '#AA5500');
    SpriteFactory._rect(ctx, 17, 18, 2, 6, '#AA5500');
    // Head
    SpriteFactory._circle(ctx, 22, 14, 6, '#DD8833');
    // Ears
    ctx.fillStyle = '#DD8833';
    ctx.beginPath();
    ctx.moveTo(17, 10); ctx.lineTo(19, 6); ctx.lineTo(21, 10); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(23, 10); ctx.lineTo(25, 6); ctx.lineTo(27, 10); ctx.closePath();
    ctx.fill();
    // Inner ears
    SpriteFactory._px(ctx, 19, 8, '#FFAAAA');
    SpriteFactory._px(ctx, 25, 8, '#FFAAAA');
    // Eyes
    SpriteFactory._px(ctx, 20, 13, '#44CC44');
    SpriteFactory._px(ctx, 24, 13, '#44CC44');
    SpriteFactory._px(ctx, 20, 14, '#000000');
    SpriteFactory._px(ctx, 24, 14, '#000000');
    // Nose
    SpriteFactory._px(ctx, 22, 16, '#FF8888');
    // Whiskers
    SpriteFactory._rect(ctx, 15, 15, 4, 1, '#CCAA88');
    SpriteFactory._rect(ctx, 15, 17, 4, 1, '#CCAA88');
    SpriteFactory._rect(ctx, 25, 15, 4, 1, '#CCAA88');
    SpriteFactory._rect(ctx, 25, 17, 4, 1, '#CCAA88');
    // Tail curving up
    SpriteFactory._rect(ctx, 4, 20, 4, 2, '#DD8833');
    SpriteFactory._rect(ctx, 3, 18, 2, 2, '#DD8833');
    SpriteFactory._rect(ctx, 2, 16, 2, 2, '#AA5500');
    // Front paws
    SpriteFactory._rect(ctx, 18, 26, 3, 4, '#DD8833');
    SpriteFactory._rect(ctx, 22, 26, 3, 4, '#DD8833');

    // Frame 1: Pouncing pose
    var ox2 = 32;
    // Body stretched forward
    SpriteFactory._ellipse(ctx, ox2 + 16, 20, 10, 6, '#DD8833');
    // Stripes
    SpriteFactory._rect(ctx, ox2 + 10, 17, 2, 5, '#AA5500');
    SpriteFactory._rect(ctx, ox2 + 15, 16, 2, 6, '#AA5500');
    SpriteFactory._rect(ctx, ox2 + 20, 17, 2, 5, '#AA5500');
    // Head (forward, lower)
    SpriteFactory._circle(ctx, ox2 + 26, 16, 5, '#DD8833');
    // Ears (flattened)
    ctx.fillStyle = '#DD8833';
    ctx.beginPath();
    ctx.moveTo(ox2 + 22, 12); ctx.lineTo(ox2 + 24, 9); ctx.lineTo(ox2 + 26, 12); ctx.closePath();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(ox2 + 26, 12); ctx.lineTo(ox2 + 28, 9); ctx.lineTo(ox2 + 30, 12); ctx.closePath();
    ctx.fill();
    SpriteFactory._px(ctx, ox2 + 24, 10, '#FFAAAA');
    SpriteFactory._px(ctx, ox2 + 28, 10, '#FFAAAA');
    // Eyes (intense)
    SpriteFactory._px(ctx, ox2 + 24, 15, '#44CC44');
    SpriteFactory._px(ctx, ox2 + 28, 15, '#44CC44');
    SpriteFactory._px(ctx, ox2 + 24, 16, '#000000');
    SpriteFactory._px(ctx, ox2 + 28, 16, '#000000');
    SpriteFactory._px(ctx, ox2 + 26, 18, '#FF8888');
    // Front legs extended
    SpriteFactory._rect(ctx, ox2 + 24, 22, 2, 6, '#DD8833');
    SpriteFactory._rect(ctx, ox2 + 28, 24, 2, 5, '#DD8833');
    // Back legs pushing
    SpriteFactory._rect(ctx, ox2 + 6, 24, 2, 5, '#DD8833');
    SpriteFactory._rect(ctx, ox2 + 10, 22, 2, 7, '#DD8833');
    // Tail out behind
    SpriteFactory._rect(ctx, ox2 + 2, 18, 6, 2, '#DD8833');
    SpriteFactory._px(ctx, ox2 + 1, 17, '#AA5500');

    scene.textures.addSpriteSheet('barn_cat', cat.canvas, {
      frameWidth: 32, frameHeight: 32
    });
  }

  // ── W5 Items ──────────────────────────────────────────────────────────

  static _generateShadowBarnItems(scene) {
    var C = SpriteFactory.COLORS;

    // --- item_key (16x16) ---
    var key = SpriteFactory._canvas(16, 16);
    var ctx = key.ctx;
    // Key head (circle with hole)
    SpriteFactory._circle(ctx, 5, 5, 4, C.COIN_GOLD);
    SpriteFactory._circle(ctx, 5, 5, 3, '#FFE840');
    SpriteFactory._circle(ctx, 5, 5, 1, C.COIN_GOLD);
    // Key shaft
    SpriteFactory._rect(ctx, 8, 4, 7, 2, C.COIN_GOLD);
    SpriteFactory._rect(ctx, 9, 4, 5, 1, '#FFE840');
    // Key teeth
    SpriteFactory._rect(ctx, 12, 6, 1, 3, C.COIN_GOLD);
    SpriteFactory._rect(ctx, 14, 6, 1, 2, C.COIN_GOLD);
    // Shine
    SpriteFactory._px(ctx, 3, 3, '#FFFFF0');
    SpriteFactory._px(ctx, 4, 3, '#FFFFF0');
    scene.textures.addCanvas('item_key', key.canvas);

    // --- item_lantern (16x16) ---
    var lan = SpriteFactory._canvas(16, 16);
    ctx = lan.ctx;
    // Handle
    SpriteFactory._rect(ctx, 6, 1, 4, 1, '#808080');
    SpriteFactory._rect(ctx, 5, 2, 1, 2, '#808080');
    SpriteFactory._rect(ctx, 10, 2, 1, 2, '#808080');
    // Top cap
    SpriteFactory._rect(ctx, 4, 4, 8, 2, '#707070');
    SpriteFactory._rect(ctx, 5, 4, 6, 1, '#909090');
    // Glass body
    SpriteFactory._roundRect(ctx, 5, 6, 6, 7, 1, '#FFCC44');
    // Inner glow
    SpriteFactory._rect(ctx, 6, 7, 4, 5, '#FFE880');
    SpriteFactory._rect(ctx, 7, 8, 2, 3, '#FFFFF0');
    // Flame inside
    SpriteFactory._rect(ctx, 7, 8, 2, 2, C.LAVA_ORANGE);
    SpriteFactory._px(ctx, 8, 7, C.LAVA_YELLOW);
    // Bottom cap
    SpriteFactory._rect(ctx, 4, 13, 8, 2, '#707070');
    SpriteFactory._rect(ctx, 5, 13, 6, 1, '#909090');
    scene.textures.addCanvas('item_lantern', lan.canvas);
  }

  // ── W5 Decorations ────────────────────────────────────────────────────

  static _generateShadowBarnDecorations(scene) {
    var C = SpriteFactory.COLORS;

    // --- barrel (32x32) ---
    var bar = SpriteFactory._canvas(32, 32);
    var ctx = bar.ctx;
    // Main barrel body
    SpriteFactory._ellipse(ctx, 16, 16, 12, 14, C.WOOD_MID);
    // Barrel bulge (wider in middle)
    SpriteFactory._ellipse(ctx, 16, 16, 13, 10, C.WOOD_LIGHT);
    // Vertical plank lines
    SpriteFactory._rect(ctx, 8, 3, 1, 26, C.WOOD_DARK);
    SpriteFactory._rect(ctx, 16, 2, 1, 28, C.WOOD_DARK);
    SpriteFactory._rect(ctx, 24, 3, 1, 26, C.WOOD_DARK);
    // Metal bands (horizontal hoops)
    SpriteFactory._rect(ctx, 5, 6, 22, 2, '#606060');
    SpriteFactory._rect(ctx, 5, 6, 22, 1, '#808080');
    SpriteFactory._rect(ctx, 5, 24, 22, 2, '#606060');
    SpriteFactory._rect(ctx, 5, 24, 22, 1, '#808080');
    // Top rim
    SpriteFactory._ellipse(ctx, 16, 3, 10, 2, C.WOOD_DARK);
    SpriteFactory._ellipse(ctx, 16, 3, 8, 1, C.WOOD_LIGHT);
    // Highlight
    SpriteFactory._rect(ctx, 6, 8, 2, 14, C.WOOD_LIGHT);
    scene.textures.addCanvas('barrel', bar.canvas);

    // --- crate (32x32) ---
    var crt = SpriteFactory._canvas(32, 32);
    ctx = crt.ctx;
    // Main box
    SpriteFactory._rect(ctx, 2, 2, 28, 28, C.WOOD_MID);
    // Border
    SpriteFactory._rect(ctx, 2, 2, 28, 2, C.WOOD_LIGHT);
    SpriteFactory._rect(ctx, 2, 2, 2, 28, C.WOOD_LIGHT);
    SpriteFactory._rect(ctx, 2, 28, 28, 2, C.WOOD_DARK);
    SpriteFactory._rect(ctx, 28, 2, 2, 28, C.WOOD_DARK);
    // Cross pattern
    SpriteFactory._rect(ctx, 2, 15, 28, 2, C.WOOD_DARK);
    SpriteFactory._rect(ctx, 15, 2, 2, 28, C.WOOD_DARK);
    // Diagonal cross braces
    for (var d = 0; d < 26; d++) {
      SpriteFactory._px(ctx, 3 + d, 3 + d, C.WOOD_DARK);
      SpriteFactory._px(ctx, 28 - d, 3 + d, C.WOOD_DARK);
    }
    // Nails in corners
    SpriteFactory._px(ctx, 4, 4, '#808080');
    SpriteFactory._px(ctx, 27, 4, '#808080');
    SpriteFactory._px(ctx, 4, 27, '#808080');
    SpriteFactory._px(ctx, 27, 27, '#808080');
    // Wood grain
    for (var g = 0; g < 10; g++) {
      var gx = 4 + Math.floor(Math.random() * 24);
      var gy = 4 + Math.floor(Math.random() * 24);
      SpriteFactory._rect(ctx, gx, gy, 3, 1, C.WOOD_LIGHT);
    }
    scene.textures.addCanvas('crate', crt.canvas);

    // --- cobweb (32x32) ---
    var cw = SpriteFactory._canvas(32, 32);
    ctx = cw.ctx;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 1;
    // Radial threads from top-left corner
    var cx = 0;
    var cy = 0;
    var endpoints = [
      { x: 30, y: 0 }, { x: 20, y: 8 }, { x: 12, y: 16 },
      { x: 6, y: 24 }, { x: 0, y: 30 }, { x: 16, y: 12 }
    ];
    for (var e = 0; e < endpoints.length; e++) {
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(endpoints[e].x, endpoints[e].y);
      ctx.stroke();
    }
    // Concentric connecting arcs
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
    for (var r = 8; r <= 24; r += 8) {
      ctx.beginPath();
      ctx.arc(0, 0, r, 0, Math.PI / 2, false);
      ctx.stroke();
    }
    // A few dew drop pixels
    SpriteFactory._px(ctx, 10, 4, 'rgba(255, 255, 255, 0.8)');
    SpriteFactory._px(ctx, 4, 10, 'rgba(255, 255, 255, 0.8)');
    SpriteFactory._px(ctx, 15, 8, 'rgba(255, 255, 255, 0.7)');
    scene.textures.addCanvas('cobweb', cw.canvas);
  }

  // ══════════════════════════════════════════════════════════════════════
  // WORLD 6: RAINBOW FALLS
  // ══════════════════════════════════════════════════════════════════════

  // ── W6 Tiles ──────────────────────────────────────────────────────────

  static _generateRainbowFallsTiles(scene) {
    var C = SpriteFactory.COLORS;

    // --- tile_water ---
    var tw = SpriteFactory._canvas(32, 32);
    var ctx = tw.ctx;
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.WATER_DARK);
    // Lighter undulation streaks
    for (var i = 0; i < 15; i++) {
      var wx = Math.floor(Math.random() * 28);
      var wy = Math.floor(Math.random() * 32);
      var ww = 3 + Math.floor(Math.random() * 5);
      SpriteFactory._rect(ctx, wx, wy, ww, 1, C.WATER_MID);
    }
    // A few lighter highlights
    for (var j = 0; j < 6; j++) {
      var hx = Math.floor(Math.random() * 32);
      var hy = Math.floor(Math.random() * 32);
      SpriteFactory._px(ctx, hx, hy, C.WATER_LIGHT);
    }
    scene.textures.addCanvas('tile_water', tw.canvas);

    // --- tile_water_surface ---
    var ts = SpriteFactory._canvas(32, 32);
    ctx = ts.ctx;
    // Water body below
    SpriteFactory._rect(ctx, 0, 6, 32, 26, C.WATER_DARK);
    for (var i2 = 0; i2 < 10; i2++) {
      var sx = Math.floor(Math.random() * 28);
      var sy = 6 + Math.floor(Math.random() * 24);
      SpriteFactory._rect(ctx, sx, sy, 4, 1, C.WATER_MID);
    }
    // Surface wave line
    SpriteFactory._rect(ctx, 0, 4, 32, 4, C.WATER_SURFACE);
    SpriteFactory._rect(ctx, 0, 4, 32, 2, C.WATER_LIGHT);
    // Wave crests
    SpriteFactory._px(ctx, 4, 3, '#FFFFFF');
    SpriteFactory._rect(ctx, 3, 3, 3, 1, C.WATER_SURFACE);
    SpriteFactory._px(ctx, 16, 3, '#FFFFFF');
    SpriteFactory._rect(ctx, 15, 3, 3, 1, C.WATER_SURFACE);
    SpriteFactory._px(ctx, 28, 3, '#FFFFFF');
    SpriteFactory._rect(ctx, 27, 3, 3, 1, C.WATER_SURFACE);
    // Foam highlights
    SpriteFactory._px(ctx, 8, 5, '#FFFFFF');
    SpriteFactory._px(ctx, 22, 5, '#FFFFFF');
    scene.textures.addCanvas('tile_water_surface', ts.canvas);

    // --- tile_rainbow_block ---
    var trb = SpriteFactory._canvas(32, 32);
    ctx = trb.ctx;
    // Colorful brick pattern
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.RAINBOW_GREEN);
    // Brick mortar lines
    SpriteFactory._rect(ctx, 0, 0, 32, 1, '#AAAAAA');
    SpriteFactory._rect(ctx, 0, 10, 32, 1, '#AAAAAA');
    SpriteFactory._rect(ctx, 0, 21, 32, 1, '#AAAAAA');
    SpriteFactory._rect(ctx, 0, 31, 32, 1, '#AAAAAA');
    // Color bricks (varying hues)
    SpriteFactory._rect(ctx, 1, 1, 15, 9, C.RAINBOW_RED);
    SpriteFactory._rect(ctx, 17, 1, 14, 9, C.RAINBOW_BLUE);
    SpriteFactory._rect(ctx, 1, 11, 10, 10, C.RAINBOW_YELLOW);
    SpriteFactory._rect(ctx, 12, 11, 10, 10, C.RAINBOW_PURPLE);
    SpriteFactory._rect(ctx, 23, 11, 8, 10, C.RAINBOW_ORANGE);
    SpriteFactory._rect(ctx, 1, 22, 12, 9, C.RAINBOW_GREEN);
    SpriteFactory._rect(ctx, 14, 22, 17, 9, C.RAINBOW_RED);
    // Vertical mortar
    SpriteFactory._rect(ctx, 16, 1, 1, 9, '#AAAAAA');
    SpriteFactory._rect(ctx, 11, 11, 1, 10, '#AAAAAA');
    SpriteFactory._rect(ctx, 22, 11, 1, 10, '#AAAAAA');
    SpriteFactory._rect(ctx, 13, 22, 1, 9, '#AAAAAA');
    // Sparkle
    SpriteFactory._px(ctx, 8, 5, '#FFFFFF');
    SpriteFactory._px(ctx, 24, 15, '#FFFFFF');
    SpriteFactory._px(ctx, 6, 26, '#FFFFFF');
    scene.textures.addCanvas('tile_rainbow_block', trb.canvas);

    // --- tile_waterfall ---
    var twf = SpriteFactory._canvas(32, 32);
    ctx = twf.ctx;
    // Vertical blue water
    SpriteFactory._rect(ctx, 0, 0, 32, 32, C.WATER_MID);
    // White streaks (vertical)
    for (var s = 0; s < 8; s++) {
      var stx = 2 + Math.floor(Math.random() * 28);
      var sth = 8 + Math.floor(Math.random() * 16);
      var sty = Math.floor(Math.random() * (32 - sth));
      SpriteFactory._rect(ctx, stx, sty, 1, sth, 'rgba(255, 255, 255, 0.5)');
    }
    // Brighter blue streaks
    for (var s2 = 0; s2 < 5; s2++) {
      var s2x = Math.floor(Math.random() * 30);
      var s2y = Math.floor(Math.random() * 28);
      SpriteFactory._rect(ctx, s2x, s2y, 2, 6, C.WATER_LIGHT);
    }
    // Foam/spray pixels
    SpriteFactory._px(ctx, 6, 4, '#FFFFFF');
    SpriteFactory._px(ctx, 18, 12, '#FFFFFF');
    SpriteFactory._px(ctx, 10, 22, '#FFFFFF');
    SpriteFactory._px(ctx, 26, 28, '#FFFFFF');
    scene.textures.addCanvas('tile_waterfall', twf.canvas);
  }

  // ── W6 Enemies ────────────────────────────────────────────────────────

  static _generateRainbowFallsEnemies(scene) {
    var C = SpriteFactory.COLORS;

    // --- fish_enemy (2 frames, 64x32) ---
    var fish = SpriteFactory._canvas(64, 32);
    var ctx = fish.ctx;

    // Frame 0: Jumping up
    // Body
    SpriteFactory._ellipse(ctx, 16, 14, 8, 6, '#FF6633');
    // Lighter belly
    SpriteFactory._ellipse(ctx, 16, 17, 6, 3, '#FFAA66');
    // Tail fin
    ctx.fillStyle = '#DD4422';
    ctx.beginPath();
    ctx.moveTo(6, 10);
    ctx.lineTo(2, 6);
    ctx.lineTo(2, 18);
    ctx.closePath();
    ctx.fill();
    // Dorsal fin
    ctx.fillStyle = '#DD4422';
    ctx.beginPath();
    ctx.moveTo(14, 8);
    ctx.lineTo(18, 4);
    ctx.lineTo(20, 8);
    ctx.closePath();
    ctx.fill();
    // Eye
    SpriteFactory._circle(ctx, 21, 12, 2, '#FFFFFF');
    SpriteFactory._px(ctx, 22, 12, '#000000');
    // Mouth
    SpriteFactory._px(ctx, 24, 15, '#CC3322');
    SpriteFactory._px(ctx, 25, 15, '#CC3322');
    // Scales
    SpriteFactory._px(ctx, 14, 12, '#FF8844');
    SpriteFactory._px(ctx, 16, 11, '#FF8844');
    SpriteFactory._px(ctx, 12, 14, '#FF8844');

    // Frame 1: Arcing down
    var ox = 32;
    SpriteFactory._ellipse(ctx, ox + 16, 18, 8, 6, '#FF6633');
    SpriteFactory._ellipse(ctx, ox + 16, 21, 6, 3, '#FFAA66');
    // Tail fin (up)
    ctx.fillStyle = '#DD4422';
    ctx.beginPath();
    ctx.moveTo(ox + 6, 14);
    ctx.lineTo(ox + 2, 10);
    ctx.lineTo(ox + 2, 22);
    ctx.closePath();
    ctx.fill();
    // Dorsal fin
    ctx.fillStyle = '#DD4422';
    ctx.beginPath();
    ctx.moveTo(ox + 14, 12);
    ctx.lineTo(ox + 18, 8);
    ctx.lineTo(ox + 20, 12);
    ctx.closePath();
    ctx.fill();
    // Eye
    SpriteFactory._circle(ctx, ox + 21, 16, 2, '#FFFFFF');
    SpriteFactory._px(ctx, ox + 22, 16, '#000000');
    SpriteFactory._px(ctx, ox + 24, 19, '#CC3322');
    SpriteFactory._px(ctx, ox + 25, 19, '#CC3322');
    SpriteFactory._px(ctx, ox + 14, 16, '#FF8844');
    SpriteFactory._px(ctx, ox + 16, 15, '#FF8844');

    scene.textures.addSpriteSheet('fish_enemy', fish.canvas, {
      frameWidth: 32, frameHeight: 32
    });

    // --- baron_beige BOSS (2 frames, 96x48, 48x48 each) ---
    var boss = SpriteFactory._canvas(96, 48);
    ctx = boss.ctx;

    for (var frame = 0; frame < 2; frame++) {
      var bx = frame * 48;
      var chargeX = frame * 3; // charging forward offset in frame 2

      // Body - large, bulky bull-like creature
      SpriteFactory._roundRect(ctx, bx + 8 + chargeX, 18, 30, 22, 4, C.ENEMY_BEIGE);
      // Lighter front
      SpriteFactory._roundRect(ctx, bx + 22 + chargeX, 20, 14, 18, 3, '#E8D4B8');

      // Head
      SpriteFactory._roundRect(ctx, bx + 28 + chargeX, 8, 16, 16, 3, C.ENEMY_BEIGE);
      // Snout
      SpriteFactory._roundRect(ctx, bx + 36 + chargeX, 14, 8, 8, 2, '#D2B090');
      // Nostrils
      SpriteFactory._px(ctx, bx + 38 + chargeX, 18, '#8B6914');
      SpriteFactory._px(ctx, bx + 40 + chargeX, 18, '#8B6914');
      SpriteFactory._px(ctx, bx + 42 + chargeX, 18, '#8B6914');

      // Angry eyes
      SpriteFactory._rect(ctx, bx + 30 + chargeX, 11, 3, 3, '#FFFFFF');
      SpriteFactory._rect(ctx, bx + 36 + chargeX, 11, 3, 3, '#FFFFFF');
      SpriteFactory._px(ctx, bx + 31 + chargeX, 12, '#FF0000');
      SpriteFactory._px(ctx, bx + 37 + chargeX, 12, '#FF0000');
      // Angry eyebrows
      SpriteFactory._rect(ctx, bx + 29 + chargeX, 9, 4, 2, C.ENEMY_BROWN);
      SpriteFactory._rect(ctx, bx + 35 + chargeX, 9, 4, 2, C.ENEMY_BROWN);
      SpriteFactory._px(ctx, bx + 29 + chargeX, 10, C.ENEMY_BROWN);
      SpriteFactory._px(ctx, bx + 38 + chargeX, 10, C.ENEMY_BROWN);

      // Horns (large, curved)
      SpriteFactory._rect(ctx, bx + 28 + chargeX, 4, 3, 6, '#FFFFCC');
      SpriteFactory._rect(ctx, bx + 26 + chargeX, 2, 3, 3, '#FFFFF0');
      SpriteFactory._rect(ctx, bx + 39 + chargeX, 4, 3, 6, '#FFFFCC');
      SpriteFactory._rect(ctx, bx + 41 + chargeX, 2, 3, 3, '#FFFFF0');
      // Horn tips
      SpriteFactory._px(ctx, bx + 26 + chargeX, 1, '#FFFFFF');
      SpriteFactory._px(ctx, bx + 42 + chargeX, 1, '#FFFFFF');

      // Crown
      SpriteFactory._rect(ctx, bx + 30 + chargeX, 3, 10, 4, C.COIN_GOLD);
      SpriteFactory._rect(ctx, bx + 31 + chargeX, 3, 8, 1, '#FFE840');
      // Crown points
      SpriteFactory._rect(ctx, bx + 30 + chargeX, 1, 2, 3, C.COIN_GOLD);
      SpriteFactory._rect(ctx, bx + 34 + chargeX, 0, 2, 4, C.COIN_GOLD);
      SpriteFactory._rect(ctx, bx + 38 + chargeX, 1, 2, 3, C.COIN_GOLD);
      // Crown jewels
      SpriteFactory._px(ctx, bx + 31 + chargeX, 1, '#FF0000');
      SpriteFactory._px(ctx, bx + 35 + chargeX, 0, '#0066FF');
      SpriteFactory._px(ctx, bx + 39 + chargeX, 1, '#FF0000');

      // Red cape
      ctx.fillStyle = '#CC0000';
      ctx.beginPath();
      ctx.moveTo(bx + 10, 20);
      ctx.lineTo(bx + 8, 42);
      ctx.lineTo(bx + 22 + chargeX, 40);
      ctx.lineTo(bx + 20 + chargeX, 22);
      ctx.closePath();
      ctx.fill();
      // Cape highlight
      ctx.fillStyle = '#FF2222';
      ctx.beginPath();
      ctx.moveTo(bx + 12, 22);
      ctx.lineTo(bx + 10, 36);
      ctx.lineTo(bx + 18 + chargeX, 34);
      ctx.lineTo(bx + 18 + chargeX, 24);
      ctx.closePath();
      ctx.fill();
      // Cape edge
      SpriteFactory._rect(ctx, bx + 8, 40, 14 + chargeX, 2, '#990000');

      // Legs (4 sturdy legs)
      SpriteFactory._rect(ctx, bx + 12, 38, 4, 8, C.ENEMY_BEIGE);
      SpriteFactory._rect(ctx, bx + 18, 38, 4, 8, C.ENEMY_BEIGE);
      SpriteFactory._rect(ctx, bx + 28 + chargeX, 36, 4, 10, C.ENEMY_BEIGE);
      SpriteFactory._rect(ctx, bx + 34 + chargeX, 36, 4, 10, C.ENEMY_BEIGE);
      // Hooves
      SpriteFactory._rect(ctx, bx + 12, 44, 4, 2, '#4A2800');
      SpriteFactory._rect(ctx, bx + 18, 44, 4, 2, '#4A2800');
      SpriteFactory._rect(ctx, bx + 28 + chargeX, 44, 4, 2, '#4A2800');
      SpriteFactory._rect(ctx, bx + 34 + chargeX, 44, 4, 2, '#4A2800');

      // Tail
      SpriteFactory._rect(ctx, bx + 4, 22, 4, 2, C.ENEMY_BEIGE);
      SpriteFactory._rect(ctx, bx + 2, 20, 3, 2, C.ENEMY_BROWN);
      SpriteFactory._px(ctx, bx + 1, 19, C.ENEMY_BROWN);

      // Mouth line (angrier in charge frame)
      if (frame === 1) {
        SpriteFactory._rect(ctx, bx + 38 + chargeX, 20, 4, 2, '#AA3300');
        // Steam from nostrils
        SpriteFactory._px(ctx, bx + 44 + chargeX, 16, '#CCCCCC');
        SpriteFactory._px(ctx, bx + 45 + chargeX, 15, '#CCCCCC');
        SpriteFactory._px(ctx, bx + 44 + chargeX, 19, '#CCCCCC');
        SpriteFactory._px(ctx, bx + 45 + chargeX, 20, '#CCCCCC');
      }
    }

    scene.textures.addSpriteSheet('baron_beige', boss.canvas, {
      frameWidth: 48, frameHeight: 48
    });
  }

  // ── W6 Items ──────────────────────────────────────────────────────────

  static _generateRainbowFallsItems(scene) {
    var C = SpriteFactory.COLORS;

    // --- item_air_bubble (16x16) ---
    var ab = SpriteFactory._canvas(16, 16);
    var ctx = ab.ctx;
    // Outer bubble
    SpriteFactory._circle(ctx, 8, 8, 6, 'rgba(100, 180, 255, 0.4)');
    // Ring edge
    ctx.strokeStyle = 'rgba(150, 210, 255, 0.7)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(8, 8, 6, 0, Math.PI * 2);
    ctx.stroke();
    // Inner highlight / shine
    SpriteFactory._circle(ctx, 6, 5, 2, 'rgba(255, 255, 255, 0.7)');
    SpriteFactory._px(ctx, 5, 4, '#FFFFFF');
    // Secondary shine
    SpriteFactory._px(ctx, 10, 10, 'rgba(255, 255, 255, 0.4)');
    scene.textures.addCanvas('item_air_bubble', ab.canvas);
  }

  // ── W6 Decorations ────────────────────────────────────────────────────

  static _generateRainbowFallsDecorations(scene) {
    var C = SpriteFactory.COLORS;

    // --- coral (32x32) ---
    var cor = SpriteFactory._canvas(32, 32);
    var ctx = cor.ctx;
    // Base
    SpriteFactory._ellipse(ctx, 16, 29, 8, 3, C.CORAL_RED);
    // Main branch (center)
    SpriteFactory._rect(ctx, 14, 10, 4, 19, C.CORAL_PINK);
    SpriteFactory._rect(ctx, 15, 10, 2, 19, C.CORAL_RED);
    // Left branch
    SpriteFactory._rect(ctx, 8, 14, 3, 12, C.CORAL_PINK);
    SpriteFactory._rect(ctx, 9, 14, 1, 12, C.CORAL_RED);
    SpriteFactory._rect(ctx, 10, 18, 4, 2, C.CORAL_PINK);
    // Right branch
    SpriteFactory._rect(ctx, 20, 12, 3, 14, C.CORAL_PINK);
    SpriteFactory._rect(ctx, 21, 12, 1, 14, C.CORAL_RED);
    SpriteFactory._rect(ctx, 18, 16, 3, 2, C.CORAL_PINK);
    // Branch tips (rounded)
    SpriteFactory._circle(ctx, 9, 13, 2, C.CORAL_PINK);
    SpriteFactory._circle(ctx, 16, 9, 3, C.CORAL_PINK);
    SpriteFactory._circle(ctx, 21, 11, 2, C.CORAL_PINK);
    // Tip highlights
    SpriteFactory._px(ctx, 9, 12, '#FFAACC');
    SpriteFactory._px(ctx, 15, 8, '#FFAACC');
    SpriteFactory._px(ctx, 21, 10, '#FFAACC');
    // Small branches
    SpriteFactory._rect(ctx, 6, 18, 2, 6, C.CORAL_RED);
    SpriteFactory._circle(ctx, 7, 17, 1, C.CORAL_PINK);
    SpriteFactory._rect(ctx, 24, 16, 2, 8, C.CORAL_RED);
    SpriteFactory._circle(ctx, 25, 15, 1, C.CORAL_PINK);
    scene.textures.addCanvas('coral', cor.canvas);

    // --- lily_pad (32x32) ---
    var lp = SpriteFactory._canvas(32, 32);
    ctx = lp.ctx;
    // Main circular pad
    SpriteFactory._circle(ctx, 16, 16, 10, '#22AA22');
    // Lighter top surface
    SpriteFactory._circle(ctx, 16, 16, 8, '#33CC33');
    // Vein lines (radial)
    SpriteFactory._rect(ctx, 16, 8, 1, 16, '#228822');
    SpriteFactory._rect(ctx, 8, 16, 16, 1, '#228822');
    // Diagonal veins
    for (var v = 0; v < 6; v++) {
      SpriteFactory._px(ctx, 10 + v, 10 + v, '#228822');
      SpriteFactory._px(ctx, 22 - v, 10 + v, '#228822');
    }
    // Notch/cut (wedge shape from edge toward center)
    SpriteFactory._rect(ctx, 16, 6, 2, 4, 'rgba(0,0,0,0)');
    ctx.clearRect(16, 6, 3, 5);
    // Small leaf/flower bud on top
    SpriteFactory._circle(ctx, 20, 12, 2, '#FF88AA');
    SpriteFactory._px(ctx, 20, 11, '#FFAACC');
    // Edge shadow
    SpriteFactory._circle(ctx, 16, 16, 10, 'rgba(0, 80, 0, 0.15)');
    // Re-draw lighter center to keep it
    SpriteFactory._circle(ctx, 16, 16, 7, '#33CC33');
    // Re-draw veins
    SpriteFactory._rect(ctx, 16, 9, 1, 14, '#228822');
    SpriteFactory._rect(ctx, 9, 16, 14, 1, '#228822');
    scene.textures.addCanvas('lily_pad', lp.canvas);
  }
}

// Make available globally
window.SpriteFactory = SpriteFactory;
