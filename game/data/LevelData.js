/**
 * TUTORIAL_LEVEL - Level data for the MOO-QUEST tutorial.
 * 200 tiles wide x 19 tiles tall (6400x608 pixels at 32px tiles).
 * Canvas viewport is 800x608 (25 tiles wide).
 *
 * Tile key:
 *   0 = empty / air
 *   1 = grass_top (green grass surface, dirt below)
 *   2 = dirt (solid brown fill)
 *   3 = stone (used in Zone 5)
 *   4 = platform (Win95-style floating platform)
 */

// ---------------------------------------------------------------------------
// Helper: build a blank 19x200 grid, then carve the level into it.
// ---------------------------------------------------------------------------
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

  // ------------------------------------------------------------------
  // ZONE 1 (cols 0-31): Movement Tutorial -- completely flat ground
  // ------------------------------------------------------------------
  fill(15, 15, 0, 31, 1);  // grass top
  fill(16, 18, 0, 31, 2);  // dirt

  // ------------------------------------------------------------------
  // ZONE 2 (cols 32-69): Jump Tutorial
  // ------------------------------------------------------------------
  // Main ground with a 3-tile gap at cols 40-42
  fill(15, 15, 32, 39, 1);
  fill(16, 18, 32, 39, 2);

  // Safety platform below the gap (catches failed jumps)
  fill(17, 17, 40, 42, 4);

  // Ground resumes after gap
  fill(15, 15, 43, 47, 1);
  fill(16, 18, 43, 47, 2);

  // Raised platform at row 13, cols 48-51
  fill(13, 13, 48, 51, 4);

  // Ground below the raised platform
  fill(15, 15, 48, 54, 1);
  fill(16, 18, 48, 54, 2);

  // Stepping stones going up
  fill(13, 13, 55, 56, 4);  // step 1
  fill(11, 11, 58, 59, 4);  // step 2
  fill(9, 9, 62, 63, 4);    // step 3

  // Small ground patches between stepping stones
  fill(15, 15, 55, 64, 1);
  fill(16, 18, 55, 64, 2);

  // Ground resumes flat at col 65
  fill(15, 15, 65, 69, 1);
  fill(16, 18, 65, 69, 2);

  // ------------------------------------------------------------------
  // ZONE 3 (cols 70-101): Eating Tutorial -- flat ground throughout
  // ------------------------------------------------------------------
  fill(15, 15, 70, 101, 1);
  fill(16, 18, 70, 101, 2);

  // Small elevated platform at (col 88, row 13) for the milk bottle
  fill(13, 13, 87, 89, 4);

  // ------------------------------------------------------------------
  // ZONE 4 (cols 102-139): Combat Tutorial
  // ------------------------------------------------------------------
  // Base ground
  fill(15, 15, 102, 124, 1);
  fill(16, 18, 102, 124, 2);

  // Raised section at cols 125-130 (row 13 = grass, rows 14-18 = dirt)
  fill(13, 13, 125, 130, 1);
  fill(14, 18, 125, 130, 2);

  // Ground after raised section
  fill(15, 15, 131, 139, 1);
  fill(16, 18, 131, 139, 2);

  // Combat platforms at various heights
  fill(12, 12, 108, 110, 4);  // low platform
  fill(11, 11, 115, 117, 4);  // mid platform
  fill(11, 11, 134, 136, 4);  // platform for elevated slime

  // ------------------------------------------------------------------
  // ZONE 5 (cols 140-171): Puzzle Tutorial -- stone ground
  // ------------------------------------------------------------------
  // Stone ground before the gate
  fill(15, 15, 140, 157, 3);
  fill(16, 18, 140, 157, 2);

  // Gate barrier at col 158, rows 10-15 (solid stone wall)
  fill(10, 15, 158, 158, 3);
  fill(16, 18, 158, 158, 2);

  // Ground after the gate (also stone, then transitions)
  fill(15, 15, 159, 171, 3);
  fill(16, 18, 159, 171, 2);

  // Elevated platforms leading up to the lever
  fill(13, 13, 147, 149, 4);  // step 1
  fill(11, 11, 150, 152, 4);  // step 2
  fill(9, 9, 153, 155, 4);    // step 3 (lever sits on top)

  // ------------------------------------------------------------------
  // ZONE 6 (cols 172-199): Victory -- flat grass ground
  // ------------------------------------------------------------------
  fill(15, 15, 172, 199, 1);
  fill(16, 18, 172, 199, 2);

  // ------------------------------------------------------------------
  // Expose the level data as a global
  // ------------------------------------------------------------------
  window.TUTORIAL_LEVEL = {
    width: W,
    height: H,
    tileSize: 32,
    tiles: tiles,

    // ------------------------------------------------------------------
    // Entities placed in the level
    // ------------------------------------------------------------------
    entities: [
      // Spawn point
      { type: 'spawn', x: 2, y: 15 },

      // Zone 1 -- signpost
      { type: 'signpost', x: 8, y: 14 },

      // Zone 3 -- food items (7 regular + 1 milk bonus = 8 total, need 5)
      { type: 'food', subtype: 'grass', x: 74, y: 14 },
      { type: 'food', subtype: 'grass', x: 78, y: 14 },
      { type: 'food', subtype: 'hay',   x: 82, y: 14 },
      { type: 'food', subtype: 'grass', x: 85, y: 14 },
      { type: 'food', subtype: 'hay',   x: 90, y: 14 },
      { type: 'food', subtype: 'grass', x: 94, y: 14 },
      { type: 'food', subtype: 'hay',   x: 97, y: 14 },
      { type: 'food', subtype: 'milk',  x: 88, y: 12 },

      // Zone 4 -- enemies
      { type: 'enemy', subtype: 'slime',  x: 110, y: 14 },
      { type: 'enemy', subtype: 'beetle', x: 125, y: 12, patrolLeft: 123, patrolRight: 130 },
      { type: 'enemy', subtype: 'slime',  x: 132, y: 14 },
      { type: 'enemy', subtype: 'slime',  x: 135, y: 11 },

      // Zone 5 -- puzzle elements
      { type: 'enemy', subtype: 'beetle', x: 152, y: 8, patrolLeft: 150, patrolRight: 155 },
      { type: 'lever', x: 154, y: 7, targetGate: 'gate_1' },
      { type: 'gate',  id: 'gate_1', x: 158, y: 10 },

      // Hearts scattered through the level
      { type: 'food', subtype: 'heart', x: 50,  y: 14 },
      { type: 'food', subtype: 'heart', x: 120, y: 14 },
      { type: 'food', subtype: 'heart', x: 160, y: 14 },

      // Victory flag
      { type: 'flag', x: 192, y: 14 },
    ],

    // ------------------------------------------------------------------
    // Phase triggers (keyed by pixel x-position)
    // ------------------------------------------------------------------
    triggers: [
      { x: 800,  phase: 'movement_complete', message: 'Great! You can walk!' },
      { x: 1024, phase: 'jump_start',        message: 'Press SPACE or W to jump! Leap over gaps and onto platforms!' },
      { x: 2080, phase: 'jump_complete',      message: 'Excellent jumping!' },
      { x: 2240, phase: 'eat_start',          message: 'Violet is hungry! Walk into food to eat it. Collect 5 items!' },
      { x: 3200, phase: 'eat_complete' },
      { x: 3264, phase: 'combat_start',       message: 'Watch out! Press Z or X to headbutt enemies!' },
      { x: 4416, phase: 'combat_complete',    message: 'Great fighting!' },
      { x: 4480, phase: 'puzzle_start',        message: 'A gate blocks the path! Find the lever to open it!' },
      { x: 5440, phase: 'puzzle_complete' },
      { x: 6144, phase: 'victory' },
    ],

    // ------------------------------------------------------------------
    // Tutorial HUD messages per phase
    // ------------------------------------------------------------------
    tutorialMessages: {
      movement: 'Welcome, Violet! Use ARROW KEYS or A/D to walk. Head right!',
      jump:     'Press SPACE or W to jump! Leap over gaps and onto platforms!',
      eat:      'Violet is hungry! Walk into food to eat it. Collect at least 5 items!',
      combat:   'Watch out! Baron Beige\'s minions ahead! Press Z or X to headbutt!',
      puzzle:   'A gate blocks the path! Look for a lever above to open it!',
      victory:  'Congratulations! Tutorial complete!',
    }
  };
})();
