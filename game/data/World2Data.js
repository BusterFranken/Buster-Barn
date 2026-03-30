/**
 * WORLD_2_LEVEL - Crystal Caves
 * 150 tiles wide x 19 tiles tall (4800x608 pixels at 32px tiles).
 * Dark maze exploration — the player navigates branching corridors
 * with limited visibility, collecting gems and avoiding cave enemies.
 *
 * Tile key:
 *   0 = empty / air (cave void)
 *   1 = cave_wall (solid dark rock)
 *   2 = cave_floor (textured floor for rooms)
 *   3 = crystal (glowing crystal block, solid, emits light)
 */

(function() {
  var W = 150;
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

  // ==================================================================
  // STEP 1: Fill the entire grid with cave wall
  // ==================================================================
  fill(0, H - 1, 0, W - 1, 1);

  // ==================================================================
  // STEP 2: Carve corridors and rooms (set to air = 0)
  // ==================================================================

  // ------------------------------------------------------------------
  // Main horizontal corridor: rows 8-10, cols 1-148
  // 3 tiles tall — player (20x28) fits comfortably
  // ------------------------------------------------------------------
  fill(8, 10, 1, W - 2, 0);

  // ------------------------------------------------------------------
  // Vertical branches going UP from main corridor
  // ------------------------------------------------------------------

  // Branch U1: col 14-16, rows 3-7 (connects to main at row 8)
  fill(3, 7, 14, 16, 0);
  // Dead-end room at top of U1
  fill(2, 4, 11, 19, 0);
  // Cave floor in the room
  fill(4, 4, 11, 19, 2);

  // Branch U3: col 48-52, rows 2-7
  fill(2, 7, 48, 52, 0);
  // Side room branching left
  fill(3, 5, 40, 48, 0);
  // Cave floor
  fill(5, 5, 40, 52, 2);

  // Branch U5: col 88-92, rows 2-7
  fill(2, 7, 88, 92, 0);
  // Wide room at top
  fill(3, 5, 84, 96, 0);
  // Cave floor
  fill(5, 5, 84, 96, 2);

  // Branch U7: col 128-132, rows 2-7 (leads to exit area)
  fill(2, 7, 128, 132, 0);
  // Exit corridor going right at rows 4-6
  fill(4, 6, 132, 146, 0);
  // Cave floor
  fill(6, 6, 132, 146, 2);

  // ------------------------------------------------------------------
  // Vertical branches going DOWN from main corridor
  // ------------------------------------------------------------------

  // Branch D2: col 29-31, rows 11-15
  fill(11, 15, 29, 31, 0);
  // Room at bottom
  fill(13, 16, 25, 35, 0);
  // Cave floor
  fill(16, 16, 25, 35, 2);

  // Branch D4: col 68-72, rows 11-16
  fill(11, 16, 68, 72, 0);
  // Large lower room
  fill(14, 17, 63, 77, 0);
  // Cave floor
  fill(17, 17, 63, 77, 2);

  // Branch D6: col 108-112, rows 11-15
  fill(11, 15, 108, 112, 0);
  // Corridor going right at rows 12-14
  fill(12, 14, 112, 126, 0);
  // Cave floor
  fill(14, 14, 108, 126, 2);

  // ------------------------------------------------------------------
  // Secondary horizontal corridors (create loops so maze is navigable)
  // ------------------------------------------------------------------

  // Upper corridor connecting U1 to U3: rows 4-6, cols 19-40
  fill(4, 6, 19, 40, 0);

  // Upper corridor connecting U3 to U5: rows 4-6, cols 52-84
  fill(4, 6, 52, 84, 0);

  // Upper corridor connecting U5 to U7: rows 4-6, cols 96-128
  fill(4, 6, 96, 128, 0);

  // Lower corridor connecting D2 to D4: rows 14-16, cols 35-63
  fill(14, 16, 35, 63, 0);
  // Cave floor along bottom
  fill(16, 16, 35, 63, 2);

  // Lower corridor connecting D4 to D6: rows 14-16, cols 77-108
  fill(14, 16, 77, 108, 0);
  // Cave floor
  fill(16, 16, 77, 108, 2);

  // ------------------------------------------------------------------
  // Spawn alcove: rows 7-11, cols 1-5 (widen the start)
  // ------------------------------------------------------------------
  fill(6, 11, 1, 6, 0);

  // ==================================================================
  // STEP 3: Place crystal blocks (type 3) at intersections for light
  // ==================================================================

  // Crystals along main corridor intersections
  tiles[9][15] = 3;
  tiles[9][30] = 3;
  tiles[9][50] = 3;
  tiles[9][70] = 3;
  tiles[9][90] = 3;
  tiles[9][110] = 3;
  tiles[9][130] = 3;

  // Crystals in upper corridors
  tiles[5][25] = 3;
  tiles[5][35] = 3;
  tiles[5][60] = 3;
  tiles[5][75] = 3;
  tiles[5][100] = 3;
  tiles[5][115] = 3;

  // Crystals in lower corridors
  tiles[15][40] = 3;
  tiles[15][55] = 3;
  tiles[15][85] = 3;
  tiles[15][100] = 3;

  // Crystals in rooms
  tiles[3][15] = 3;
  tiles[3][90] = 3;
  tiles[15][70] = 3;

  // ==================================================================
  // Expose the level data as a global
  // ==================================================================
  window.WORLD_2_LEVEL = {
    id: 'crystal_caves',
    name: 'Crystal Caves',
    width: W,
    height: H,
    tileSize: 32,
    backgroundColor: 0x0a0a2e,
    gravity: 900,
    config: {
      hasDarkness: true,
      lightRadius: 100,
      hasSwimming: false,
      hasMovingPlatforms: false,
      hasWind: false,
      hasBoss: false,
      playerSpeed: 140,
      jumpForce: -420
    },
    tiles: tiles,

    // ------------------------------------------------------------------
    // Entities placed in the level
    // ------------------------------------------------------------------
    entities: [
      // Spawn point (in the start alcove)
      { type: 'spawn', x: 3, y: 9 },

      // ----- Gems scattered in dead-end rooms and corridors -----

      // Room at top of U1
      { type: 'food', subtype: 'gem', x: 14, y: 3 },
      { type: 'food', subtype: 'gem', x: 17, y: 3 },

      // Room at bottom of D2
      { type: 'food', subtype: 'gem', x: 28, y: 15 },
      { type: 'food', subtype: 'gem', x: 33, y: 15 },

      // Side room off U3
      { type: 'food', subtype: 'gem', x: 43, y: 4 },
      { type: 'food', subtype: 'gem', x: 51, y: 3 },

      // Lower corridor between D2-D4
      { type: 'food', subtype: 'gem', x: 50, y: 15 },

      // Large lower room (D4)
      { type: 'food', subtype: 'gem', x: 66, y: 16 },
      { type: 'food', subtype: 'gem', x: 74, y: 16 },

      // Wide room at top of U5
      { type: 'food', subtype: 'gem', x: 87, y: 4 },
      { type: 'food', subtype: 'gem', x: 93, y: 4 },

      // Lower corridor D6
      { type: 'food', subtype: 'gem', x: 118, y: 13 },
      { type: 'food', subtype: 'gem', x: 124, y: 13 },

      // Exit corridor (U7 branch)
      { type: 'food', subtype: 'gem', x: 136, y: 5 },
      { type: 'food', subtype: 'gem', x: 142, y: 5 },

      // Upper corridor gems
      { type: 'food', subtype: 'gem', x: 65, y: 5 },
      { type: 'food', subtype: 'gem', x: 108, y: 5 },

      // ----- Torches (light sources along main corridor) -----
      { type: 'food', subtype: 'torch', x: 8, y: 8 },
      { type: 'food', subtype: 'torch', x: 22, y: 8 },
      { type: 'food', subtype: 'torch', x: 40, y: 8 },
      { type: 'food', subtype: 'torch', x: 58, y: 8 },
      { type: 'food', subtype: 'torch', x: 78, y: 8 },
      { type: 'food', subtype: 'torch', x: 98, y: 8 },
      { type: 'food', subtype: 'torch', x: 120, y: 8 },
      { type: 'food', subtype: 'torch', x: 140, y: 8 },

      // ----- Cave bats (flying enemies in upper areas) -----
      { type: 'enemy', subtype: 'cave_bat', x: 25, y: 5 },
      { type: 'enemy', subtype: 'cave_bat', x: 55, y: 5 },
      { type: 'enemy', subtype: 'cave_bat', x: 75, y: 5 },
      { type: 'enemy', subtype: 'cave_bat', x: 102, y: 5 },
      { type: 'enemy', subtype: 'cave_bat', x: 115, y: 5 },

      // ----- Crystal golems (tough enemies on main corridor) -----
      { type: 'enemy', subtype: 'crystal_golem', x: 45, y: 9, patrolLeft: 40, patrolRight: 50 },
      { type: 'enemy', subtype: 'crystal_golem', x: 82, y: 9, patrolLeft: 77, patrolRight: 87 },
      { type: 'enemy', subtype: 'crystal_golem', x: 122, y: 9, patrolLeft: 117, patrolRight: 127 },

      // ----- Hearts -----
      { type: 'food', subtype: 'heart', x: 30, y: 9 },
      { type: 'food', subtype: 'heart', x: 70, y: 9 },
      { type: 'food', subtype: 'heart', x: 95, y: 9 },
      { type: 'food', subtype: 'heart', x: 135, y: 5 },

      // ----- Victory flag at the end of the exit corridor -----
      { type: 'flag', x: 145, y: 5 }
    ],

    // ------------------------------------------------------------------
    // Phase triggers (keyed by pixel x-position)
    // ------------------------------------------------------------------
    triggers: [
      { x: 64,   phase: 'start',   message: null },
      { x: 480,  phase: 'bats',    message: null },
      { x: 2000, phase: 'golem',   message: null },
      { x: 4700, phase: 'victory' }
    ],

    // ------------------------------------------------------------------
    // Messages shown when entering each phase
    // ------------------------------------------------------------------
    tutorialMessages: {
      start: 'The Crystal Caves! Stay near the glowing crystals to see...',
      bats:  'Watch out for bats in the dark!',
      golem: 'A crystal golem blocks the way! Attack it!'
    },

    completionType: 'flag',
    nextWorld: 'lava_meadows'
  };
})();
