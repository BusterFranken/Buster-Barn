/**
 * WORLD_3_LEVEL - Lava Meadows
 * 200 tiles wide x 19 tiles tall (6400x608 pixels at 32px tiles).
 * Hazard platforming over lava lakes with moving platforms and
 * fire enemies. The ground is hot rock with lava pools cut into it.
 *
 * Tile key:
 *   0 = empty / air
 *   1 = hot_rock (dark volcanic rock, solid)
 *   2 = hot_rock_alt (solid, darker texture variant)
 *   3 = lava (liquid HAZARD, damages on contact)
 *   4 = lava_surface (top of lava pool, HAZARD visual)
 */

(function() {
  var W = 200;
  var H = 19;
  var tiles = [];
  var r, c;

  // Initialise every cell to air
  for (r = 0; r < H; r++) {
    tiles[r] = [];
    for (c = 0; c < W; c++) {
      tiles[r][c] = 0;
    }
  }

  // ------------------------------------------------------------------
  // Utility: fill a rectangular region with a tile value
  // ------------------------------------------------------------------
  function fill(rowStart, rowEnd, colStart, colEnd, value) {
    for (var rr = rowStart; rr <= rowEnd; rr++) {
      for (var cc = colStart; cc <= colEnd; cc++) {
        if (rr >= 0 && rr < H && cc >= 0 && cc < W) {
          tiles[rr][cc] = value;
        }
      }
    }
  }

  // Helper: carve a lava pool into the ground
  // Replaces rock with lava_surface on top row, lava below
  function lavaPool(colStart, colEnd) {
    fill(15, 15, colStart, colEnd, 4); // lava surface
    fill(16, 18, colStart, colEnd, 3); // lava body
  }

  // ==================================================================
  // BASE TERRAIN: Hot rock ground (rows 15-18)
  // ==================================================================
  fill(15, 15, 0, W - 1, 1);   // top surface
  fill(16, 18, 0, W - 1, 2);   // fill below

  // Ceiling (row 0) — optional rock ceiling for enclosed feel
  fill(0, 0, 0, W - 1, 2);

  // ==================================================================
  // ZONE 1 (cols 0-30): Gentle introduction — safe ground, easy jumps
  // ==================================================================
  // Solid ground, no lava — player learns the hot aesthetic

  // Small decorative rock formation
  fill(14, 14, 12, 14, 1);

  // First tiny lava pool (4 tiles) — teaches the hazard
  lavaPool(22, 25);

  // ==================================================================
  // ZONE 2 (cols 31-65): Lava pools with rock islands
  // ==================================================================
  // Lava pool 2 (5 tiles)
  lavaPool(34, 38);

  // Lava pool 3 (6 tiles) — needs a running jump or platform
  lavaPool(44, 49);
  // Stepping stone in the middle of pool 3
  fill(14, 14, 46, 47, 1);

  // Safe ground island
  // (cols 50-55 remain solid)

  // Lava pool 4 (7 tiles) — wider, with a moving platform
  lavaPool(57, 63);

  // ==================================================================
  // ZONE 3 (cols 66-100): Moving platform gauntlet
  // ==================================================================

  // Large lava lake (cols 70-85) — must use moving platforms
  lavaPool(70, 85);

  // Rock pillar in the middle for resting
  fill(12, 15, 77, 78, 1);

  // Elevated platforms on either side
  fill(13, 13, 68, 70, 1);
  fill(13, 13, 85, 87, 1);

  // Another lava section with stepping platforms
  lavaPool(92, 99);
  fill(14, 14, 94, 95, 1);  // small stepping stone
  fill(14, 14, 97, 98, 1);  // another stepping stone

  // ==================================================================
  // ZONE 4 (cols 101-140): Fireballs and tight jumps
  // ==================================================================

  // Ground with fireball turrets — rock pillars with lava between
  lavaPool(105, 109);
  lavaPool(114, 119);
  lavaPool(124, 130);

  // Elevated rock platforms to dodge fireballs
  fill(12, 12, 102, 104, 1);
  fill(10, 10, 110, 113, 1);
  fill(12, 12, 120, 123, 1);
  fill(10, 10, 131, 134, 1);

  // Rock pillars rising from lava (fireball launch points)
  fill(10, 15, 107, 107, 1);
  fill(10, 15, 117, 117, 1);
  fill(10, 15, 127, 127, 1);

  // Lava pool 8 — the big one, needs moving platform
  lavaPool(136, 143);

  // ==================================================================
  // ZONE 5 (cols 141-175): Vertical challenge + lava rising feel
  // ==================================================================

  // Scattered rock platforms at various heights
  fill(13, 13, 144, 146, 1);
  fill(11, 11, 148, 150, 1);
  fill(9, 9, 152, 154, 1);
  fill(11, 11, 156, 158, 1);
  fill(13, 13, 160, 162, 1);

  // Lava covering the entire bottom in this zone
  lavaPool(144, 162);

  // Ground resumes
  // cols 163-167 solid

  // Another lava stretch
  lavaPool(168, 174);
  fill(13, 13, 170, 172, 1);  // mid-air platform

  // ==================================================================
  // ZONE 6 (cols 176-199): Final stretch and victory
  // ==================================================================

  // Last lava challenge
  lavaPool(179, 184);
  fill(13, 13, 181, 182, 1);  // stepping stone

  // Safe ground to the finish
  // (cols 185-199 remain solid)

  // Decorative rock formations near the flag
  fill(13, 14, 190, 192, 1);
  fill(12, 14, 194, 194, 1);

  // ==================================================================
  // Expose the level data as a global
  // ==================================================================
  window.WORLD_3_LEVEL = {
    id: 'lava_meadows',
    name: 'Lava Meadows',
    width: W,
    height: H,
    tileSize: 32,
    backgroundColor: 0x330000,
    gravity: 900,
    config: {
      hasDarkness: false,
      lightRadius: 0,
      hasSwimming: false,
      hasMovingPlatforms: true,
      hasWind: false,
      hasBoss: false,
      playerSpeed: 150,
      jumpForce: -420
    },
    tiles: tiles,

    // ------------------------------------------------------------------
    // Entities placed in the level
    // ------------------------------------------------------------------
    entities: [
      // Spawn point
      { type: 'spawn', x: 2, y: 14 },

      // ----- Moving platforms (8 total) -----

      // Zone 2: over lava pool 4
      { type: 'moving_platform', x: 58, y: 13, moveX: 5, moveY: 0, speed: 40 },

      // Zone 3: across the big lava lake (3 platforms)
      { type: 'moving_platform', x: 71, y: 11, moveX: 5, moveY: 0, speed: 35 },
      { type: 'moving_platform', x: 79, y: 11, moveX: 5, moveY: 0, speed: 40 },

      // Zone 3: over lava pool at cols 92-99
      { type: 'moving_platform', x: 92, y: 12, moveX: 3, moveY: 0, speed: 30 },

      // Zone 4: over the big lava pool 8
      { type: 'moving_platform', x: 137, y: 12, moveX: 6, moveY: 0, speed: 45 },

      // Zone 5: vertical moving platforms
      { type: 'moving_platform', x: 145, y: 11, moveX: 0, moveY: 3, speed: 30 },
      { type: 'moving_platform', x: 155, y: 10, moveX: 0, moveY: 3, speed: 35 },

      // Zone 5: over lava at 168-174
      { type: 'moving_platform', x: 168, y: 11, moveX: 5, moveY: 0, speed: 40 },

      // ----- Fireballs (6 total) — erupt from lava/pillars -----

      // Zone 2: from lava pool 2
      { type: 'fireball', x: 36, y: 14, direction: 'up', interval: 3000 },

      // Zone 3: from the big lava lake
      { type: 'fireball', x: 74, y: 14, direction: 'up', interval: 2500 },
      { type: 'fireball', x: 82, y: 14, direction: 'up', interval: 2800 },

      // Zone 4: from pillars
      { type: 'fireball', x: 107, y: 9, direction: 'up', interval: 2200 },
      { type: 'fireball', x: 117, y: 9, direction: 'up', interval: 2500 },
      { type: 'fireball', x: 127, y: 9, direction: 'up', interval: 2000 },

      // ----- Fire slimes (3 total) -----
      { type: 'enemy', subtype: 'fire_slime', x: 32, y: 14 },
      { type: 'enemy', subtype: 'fire_slime', x: 90, y: 14 },
      { type: 'enemy', subtype: 'fire_slime', x: 165, y: 14 },

      // ----- Magma beetles with patrol routes (3 total) -----
      { type: 'enemy', subtype: 'magma_beetle', x: 55, y: 14, patrolLeft: 50, patrolRight: 56 },
      { type: 'enemy', subtype: 'magma_beetle', x: 112, y: 14, patrolLeft: 110, patrolRight: 114 },
      { type: 'enemy', subtype: 'magma_beetle', x: 188, y: 14, patrolLeft: 185, patrolRight: 192 },

      // ----- Fire shield items (protective pickups) -----
      { type: 'food', subtype: 'fire_shield', x: 20, y: 14 },
      { type: 'food', subtype: 'fire_shield', x: 68, y: 12 },
      { type: 'food', subtype: 'fire_shield', x: 131, y: 9 },
      { type: 'food', subtype: 'fire_shield', x: 163, y: 14 },

      // ----- Hearts -----
      { type: 'food', subtype: 'heart', x: 10, y: 14 },
      { type: 'food', subtype: 'heart', x: 53, y: 14 },
      { type: 'food', subtype: 'heart', x: 87, y: 12 },
      { type: 'food', subtype: 'heart', x: 134, y: 14 },
      { type: 'food', subtype: 'heart', x: 175, y: 14 },
      { type: 'food', subtype: 'heart', x: 193, y: 14 },

      // ----- Victory flag -----
      { type: 'flag', x: 195, y: 14 }
    ],

    // ------------------------------------------------------------------
    // Phase triggers (keyed by pixel x-position)
    // ------------------------------------------------------------------
    triggers: [
      { x: 96,   phase: 'start',    message: null },
      { x: 700,  phase: 'lava',     message: null },
      { x: 2200, phase: 'platforms', message: null },
      { x: 3300, phase: 'fireballs', message: null },
      { x: 4600, phase: 'ascent',   message: null },
      { x: 6200, phase: 'victory' }
    ],

    // ------------------------------------------------------------------
    // Messages shown when entering each phase
    // ------------------------------------------------------------------
    tutorialMessages: {
      start:     'Lava Meadows! The ground is scorching hot...',
      lava:      'Don\'t fall in the lava! Jump across the pools!',
      platforms: 'Use the moving platforms to cross the lava lake!',
      fireballs: 'Fireballs! Time your jumps carefully!',
      ascent:    'Almost there! Watch your footing!'
    },

    completionType: 'flag',
    nextWorld: 'cloud_kingdom'
  };
})();
