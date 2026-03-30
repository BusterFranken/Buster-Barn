/**
 * WORLD_5_LEVEL - Level data for MOO-QUEST Shadow Barn.
 * 80 tiles wide x 19 tiles tall (2560x608 pixels at 32px tiles).
 * Canvas viewport is 800x608 (25 tiles wide).
 *
 * Tile key:
 *   0 = empty / air
 *   1 = wood (solid barn walls)
 *   2 = hay (decorative floor, solid)
 *   3 = barn_door (placed via entities, not in tile array)
 *   4 = platform (floating walkway)
 */

// ---------------------------------------------------------------------------
// Helper: build a blank 19x80 grid, then carve a maze into it.
// ---------------------------------------------------------------------------
(function() {
  var W = 80;
  var H = 19;
  var tiles = [];
  var r, c;

  // Initialise every cell to solid wood (we carve rooms out of it)
  for (r = 0; r < H; r++) {
    tiles[r] = [];
    for (c = 0; c < W; c++) {
      tiles[r][c] = 1;
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
  // Outer shell: keep rows 0 and 18, cols 0 and 79 as solid wood walls.
  // Everything inside will be carved selectively.
  // ------------------------------------------------------------------

  // ==================================================================
  // CENTRAL HUB (cols 1-15, rows 5-17) -- spawn area
  // ==================================================================
  fill(5, 17, 1, 15, 0);    // carve air
  fill(16, 17, 1, 15, 2);   // hay floor

  // Decorative hay patches on the floor
  fill(15, 15, 3, 6, 2);
  fill(15, 15, 10, 13, 2);

  // Small platform in hub for visual interest
  fill(10, 10, 7, 9, 4);

  // ==================================================================
  // BRANCH 1: UPPER LEFT (cols 4-35, rows 1-7) -- leads to Key 1
  // ==================================================================

  // Vertical corridor up from hub (cols 4-6, rows 1-5)
  fill(1, 5, 4, 6, 0);

  // Upper horizontal corridor going right (cols 6-35, rows 1-4)
  fill(1, 4, 6, 35, 0);
  fill(4, 4, 6, 35, 2);  // hay floor

  // Small rooms along the upper corridor
  // Room A (cols 12-18, rows 1-4) -- already open
  // Room B (cols 22-28, rows 1-6) -- extends down a bit
  fill(1, 6, 22, 28, 0);
  fill(6, 6, 22, 28, 2);  // hay floor

  // Dead-end alcove for Key 1 (cols 31-34, rows 1-3)
  fill(1, 3, 31, 34, 0);
  fill(3, 3, 31, 34, 2);  // hay floor

  // Platforms in upper corridor for traversal
  fill(2, 2, 15, 17, 4);
  fill(3, 3, 9, 10, 4);

  // ==================================================================
  // BRANCH 2: LOWER PATH (cols 16-50, rows 12-17) -- leads to Key 2
  // ==================================================================

  // Horizontal corridor from hub going right (cols 15-50, rows 12-17)
  fill(12, 17, 16, 50, 0);
  fill(16, 17, 16, 50, 2);  // hay floor

  // Pillars to break up the corridor
  fill(14, 17, 25, 26, 1);  // pillar 1
  fill(14, 17, 35, 36, 1);  // pillar 2

  // Opening above pillar 1 -- walkable
  fill(12, 13, 25, 26, 0);

  // Opening above pillar 2 -- walkable
  fill(12, 13, 35, 36, 0);

  // Dead-end pocket for Key 2 (cols 46-49, rows 14-17)
  // Already part of the corridor, but add a small nook below
  fill(12, 17, 46, 50, 0);
  fill(16, 17, 46, 50, 2);

  // Platform above the key nook
  fill(13, 13, 47, 49, 4);

  // ==================================================================
  // BRANCH 3: MIDDLE-RIGHT (cols 30-60, rows 5-11) -- leads to Key 3
  // ==================================================================

  // Connection from hub going right (cols 15-30, rows 7-10)
  fill(7, 10, 15, 30, 0);
  fill(10, 10, 15, 30, 2);  // hay floor

  // Continuation corridor (cols 30-55, rows 6-10)
  fill(6, 10, 30, 55, 0);
  fill(10, 10, 30, 55, 2);  // hay floor

  // Pillar in middle corridor
  fill(8, 10, 40, 41, 1);

  // Small room for Key 3 (cols 52-55, rows 6-9)
  fill(6, 9, 52, 55, 0);
  fill(9, 9, 52, 55, 2);  // hay floor

  // Platforms in middle corridor
  fill(8, 8, 33, 35, 4);
  fill(7, 7, 45, 47, 4);

  // ==================================================================
  // LOCKED DOOR CORRIDORS -- connecting to the exit section
  // ==================================================================

  // Door 1 corridor: upper path to right section (cols 35-45, rows 2-4)
  // Already carved. Door 1 blocks at col 36, rows 2-4
  // Beyond door 1: corridor continues (cols 37-45, rows 1-4)
  fill(1, 4, 36, 45, 0);
  fill(4, 4, 36, 45, 2);

  // Door 2 corridor: middle path connecting to exit (cols 55-65, rows 7-10)
  fill(7, 10, 55, 65, 0);
  fill(10, 10, 55, 65, 2);

  // Door 3 corridor: lower path to exit (cols 50-65, rows 13-17)
  fill(13, 17, 50, 65, 0);
  fill(16, 17, 50, 65, 2);

  // ==================================================================
  // EXIT SECTION (cols 65-78, rows 1-17) -- converge to flag
  // ==================================================================

  // Large exit room
  fill(1, 17, 66, 78, 0);
  fill(16, 17, 66, 78, 2);  // hay floor

  // Platforms leading to flag
  fill(12, 12, 68, 70, 4);
  fill(9, 9, 72, 74, 4);
  fill(12, 12, 75, 77, 4);

  // Keep right wall solid
  fill(0, 18, 79, 79, 1);

  // ==================================================================
  // LOOP CONNECTIONS (so player can backtrack)
  // ==================================================================

  // Loop 1: connect upper corridor back down to middle (col 28, rows 4-7)
  fill(4, 7, 28, 29, 0);

  // Loop 2: connect middle corridor down to lower (col 42-43, rows 10-12)
  fill(10, 12, 42, 43, 0);

  // Loop 3: connect upper-right area down to exit room (col 45, rows 4-7)
  fill(4, 7, 44, 45, 0);

  // Loop 4: connect lower corridor to exit room via vertical shaft (col 65, rows 10-13)
  fill(10, 13, 64, 65, 0);

  // ==================================================================
  // Restore walls where doors will be placed (3 tiles tall each)
  // The door entities will handle rendering; we keep walls behind them
  // ==================================================================
  fill(2, 4, 36, 36, 1);   // Door 1 wall at col 36
  fill(7, 9, 56, 56, 1);   // Door 2 wall at col 56
  fill(13, 15, 51, 51, 1); // Door 3 wall at col 51

  // ------------------------------------------------------------------
  // Expose the level data as a global
  // ------------------------------------------------------------------
  window.WORLD_5_LEVEL = {
    id: 'shadow_barn',
    name: 'Shadow Barn',
    width: W,
    height: H,
    tileSize: 32,
    backgroundColor: 0x1a1a1a,
    gravity: 900,
    tiles: tiles,

    config: {
      hasDarkness: true,
      lightRadius: 90,
      playerSpeed: 130,
      jumpForce: -420
    },

    // ------------------------------------------------------------------
    // Entities placed in the level
    // ------------------------------------------------------------------
    entities: [
      // Spawn point -- central hub
      { type: 'spawn', x: 2, y: 9 },

      // ----- Keys (3 total) -----
      // Key 1: upper-left dead-end alcove
      { type: 'key', x: 33, y: 2 },
      // Key 2: lower path pocket
      { type: 'key', x: 48, y: 15 },
      // Key 3: middle-right small room
      { type: 'key', x: 54, y: 8 },

      // ----- Locked doors (3 total, each 3 tiles tall) -----
      // Door 1: blocks upper path to exit section
      { type: 'locked_door', x: 36, y: 2, doorId: 'door_1' },
      // Door 2: blocks middle path to exit section
      { type: 'locked_door', x: 56, y: 7, doorId: 'door_2' },
      // Door 3: blocks lower path to exit section
      { type: 'locked_door', x: 51, y: 13, doorId: 'door_3' },

      // ----- Shadow Rats (fast patrol enemies) -----
      { type: 'enemy', subtype: 'shadow_rat', x: 18, y: 3, patrolLeft: 14, patrolRight: 21, speed: 80 },
      { type: 'enemy', subtype: 'shadow_rat', x: 30, y: 15, patrolLeft: 27, patrolRight: 34, speed: 80 },
      { type: 'enemy', subtype: 'shadow_rat', x: 44, y: 9, patrolLeft: 42, patrolRight: 48, speed: 80 },
      { type: 'enemy', subtype: 'shadow_rat', x: 60, y: 15, patrolLeft: 55, patrolRight: 64, speed: 80 },

      // ----- Barn Cats (stationary, pounce when close) -----
      { type: 'enemy', subtype: 'barn_cat', x: 24, y: 5 },
      { type: 'enemy', subtype: 'barn_cat', x: 38, y: 9 },

      // ----- Lanterns (food items -- score + light) -----
      { type: 'food', subtype: 'lantern', x: 5, y: 8 },
      { type: 'food', subtype: 'lantern', x: 14, y: 3 },
      { type: 'food', subtype: 'lantern', x: 25, y: 5 },
      { type: 'food', subtype: 'lantern', x: 32, y: 9 },
      { type: 'food', subtype: 'lantern', x: 40, y: 15 },
      { type: 'food', subtype: 'lantern', x: 48, y: 9 },
      { type: 'food', subtype: 'lantern', x: 58, y: 15 },
      { type: 'food', subtype: 'lantern', x: 62, y: 9 },
      { type: 'food', subtype: 'lantern', x: 70, y: 11 },
      { type: 'food', subtype: 'lantern', x: 75, y: 15 },

      // ----- Hearts -----
      { type: 'food', subtype: 'heart', x: 10, y: 9 },
      { type: 'food', subtype: 'heart', x: 26, y: 3 },
      { type: 'food', subtype: 'heart', x: 38, y: 15 },
      { type: 'food', subtype: 'heart', x: 53, y: 7 },
      { type: 'food', subtype: 'heart', x: 68, y: 15 },

      // Victory flag -- far right of exit room
      { type: 'flag', x: 77, y: 9 }
    ],

    // ------------------------------------------------------------------
    // Level completion requirements
    // ------------------------------------------------------------------
    keysRequired: 3,
    completionType: 'collect',
    nextWorld: 'rainbow_falls',

    // ------------------------------------------------------------------
    // Tutorial / hint messages
    // ------------------------------------------------------------------
    tutorialMessages: {
      start: 'The Shadow Barn! Find 3 keys to escape!',
      key:   'A key! Keep searching!',
      door:  'A locked door blocks the way...'
    }
  };
})();
