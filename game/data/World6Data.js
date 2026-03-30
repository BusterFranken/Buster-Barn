/**
 * WORLD_6_LEVEL - Level data for MOO-QUEST Rainbow Falls.
 * 250 tiles wide x 19 tiles tall (8000x608 pixels at 32px tiles).
 * Canvas viewport is 800x608 (25 tiles wide).
 *
 * Tile key:
 *   0 = empty / air
 *   1 = rainbow_block (solid colourful ground)
 *   2 = tile_grass (solid green ground)
 *   3 = water (swimmable, NO collision -- player passes through)
 *   4 = water_surface (visual top of water, no collision)
 *   5 = waterfall (visual cascade effect, no collision)
 */

// ---------------------------------------------------------------------------
// Helper: build a blank 19x250 grid, then sculpt three sections.
// ---------------------------------------------------------------------------
(function() {
  var W = 250;
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
  //
  //  SECTION 1: RIVERSIDE (cols 0-80)
  //  Grass ground with shallow water pools. Introduction to swimming.
  //
  // ==================================================================

  // --- Base ground: grass at rows 15-18 across the whole section ---
  fill(15, 15, 0, 80, 2);   // grass top
  fill(16, 18, 0, 80, 2);   // grass fill

  // --- Pool 1 (cols 18-20): shallow introduction pool ---
  // Cut a 3-wide, 4-deep hole in the ground
  fill(15, 18, 18, 20, 0);  // remove grass
  fill(15, 15, 18, 20, 4);  // water surface
  fill(16, 18, 18, 20, 3);  // water body

  // --- Pool 2 (cols 32-34): slightly deeper ---
  fill(14, 18, 32, 34, 0);
  fill(14, 14, 32, 34, 4);
  fill(15, 18, 32, 34, 3);

  // --- Pool 3 (cols 48-51): wider pool, 4 tiles ---
  fill(14, 18, 48, 51, 0);
  fill(14, 14, 48, 51, 4);
  fill(15, 18, 48, 51, 3);

  // --- Pool 4 (cols 62-66): large pond, 5 tiles wide ---
  fill(13, 18, 62, 66, 0);
  fill(13, 13, 62, 66, 4);
  fill(14, 18, 62, 66, 3);

  // --- Small hills for visual variety ---
  // Hill before pool 2
  fill(14, 14, 27, 30, 2);

  // Hill between pools 3 and 4
  fill(14, 14, 55, 58, 2);

  // --- Platforms above pools for optional paths ---
  fill(11, 11, 19, 21, 2);  // above pool 1
  fill(10, 10, 49, 51, 2);  // above pool 3
  fill(10, 10, 63, 65, 2);  // above pool 4

  // --- Transition area (cols 74-80): ground slopes into water ---
  fill(15, 18, 74, 80, 0);  // remove ground
  fill(12, 12, 74, 76, 2);  // upper grass ledge
  fill(13, 13, 76, 78, 2);  // step down
  fill(14, 14, 78, 80, 2);  // step down more
  // Water begins to fill in
  fill(15, 15, 74, 80, 4);  // water surface
  fill(16, 18, 74, 80, 3);  // water body


  // ==================================================================
  //
  //  SECTION 2: DEEP WATER (cols 80-170)
  //  Underwater passages, air bubbles, waterfalls.
  //  Water fills large regions; grass creates tunnels and ceilings.
  //
  // ==================================================================

  // --- Transition waterfall at cols 80-82 ---
  fill(6, 14, 80, 82, 5);   // waterfall visual
  fill(15, 15, 80, 82, 4);  // water surface (below falls)
  fill(16, 18, 80, 82, 3);  // water body

  // --- Sub-section 2A (cols 83-110): First underwater area ---

  // Floor and ceiling create a channel
  fill(4, 5, 83, 110, 2);   // grass ceiling
  fill(17, 18, 83, 110, 2); // grass floor

  // Water fills the gap
  fill(6, 6, 83, 110, 4);   // water surface
  fill(7, 16, 83, 110, 3);  // deep water

  // Air pocket 1 (cols 90-93): break in ceiling, air above water
  fill(4, 6, 90, 93, 0);    // remove ceiling + water surface
  fill(6, 6, 90, 93, 4);    // water surface restored lower? No -- air pocket
  // The pocket is air from rows 4-6, water starts at row 7
  // Player can surface here to breathe

  // Underwater pillar (cols 98-99, rows 9-16) -- obstacle
  fill(9, 16, 98, 99, 2);

  // Air pocket 2 (cols 103-106): larger air gap
  fill(4, 6, 103, 106, 0);

  // Underwater tunnel floor rises (cols 107-110, rows 14-16)
  fill(14, 16, 107, 110, 2);

  // --- Sub-section 2B (cols 111-140): Mixed water and platforms ---

  // Open air section (cols 111-120) -- player surfaces
  fill(12, 12, 111, 120, 2);  // grass ground mid-height
  fill(13, 18, 111, 120, 0);  // air below? No, water below
  fill(13, 13, 111, 120, 4);  // water surface
  fill(14, 18, 111, 120, 3);  // water body
  fill(17, 18, 111, 120, 2);  // grass floor under water

  // Small island (cols 114-116, rows 10-12)
  fill(10, 12, 114, 116, 2);

  // Deep dive (cols 121-140): water from rows 4-18
  fill(3, 4, 121, 140, 2);    // grass ceiling
  fill(17, 18, 121, 140, 2);  // grass floor
  fill(5, 5, 121, 140, 4);    // water surface
  fill(6, 16, 121, 140, 3);   // deep water

  // Underwater obstacles -- grass blocks creating a maze
  fill(8, 12, 125, 126, 2);   // pillar
  fill(10, 16, 131, 132, 2);  // floor-to-mid wall
  fill(6, 10, 136, 137, 2);   // ceiling-to-mid wall

  // Air pocket 3 (cols 128-130)
  fill(3, 5, 128, 130, 0);

  // Air pocket 4 (cols 138-140)
  fill(3, 5, 138, 140, 0);

  // --- Sub-section 2C (cols 141-170): Ascent with waterfalls ---

  // Water-filled lower area (cols 141-155)
  fill(10, 10, 141, 155, 4);  // water surface
  fill(11, 16, 141, 155, 3);  // water body
  fill(17, 18, 141, 155, 2);  // grass floor

  // Stepping platforms above the water
  fill(8, 8, 143, 145, 2);
  fill(7, 7, 148, 150, 2);
  fill(6, 6, 153, 155, 2);

  // Waterfall columns for visual drama
  fill(2, 9, 146, 146, 5);   // waterfall 1
  fill(2, 9, 152, 152, 5);   // waterfall 2

  // Ascending platforms (cols 156-170) -- transition out of water
  fill(14, 14, 156, 159, 2);  // low platform
  fill(12, 12, 160, 163, 2);  // mid platform
  fill(10, 10, 164, 167, 2);  // high platform
  fill(8, 8, 168, 170, 2);    // highest platform

  // Waterfall at the transition (cols 158-159)
  fill(3, 13, 158, 158, 5);

  // Ground returning at the end of section 2
  fill(15, 18, 164, 170, 2);


  // ==================================================================
  //
  //  SECTION 3: RAINBOW BRIDGE + BOSS ARENA (cols 170-249)
  //  Rainbow block platforms, the bridge, and the final boss fight.
  //
  // ==================================================================

  // --- Rainbow Bridge approach (cols 170-195) ---

  // Ground base
  fill(15, 18, 170, 195, 1);  // rainbow block ground

  // Rainbow bridge platforms ascending
  fill(13, 13, 175, 178, 1);  // step 1
  fill(11, 11, 180, 183, 1);  // step 2
  fill(9, 9, 185, 188, 1);    // step 3
  fill(11, 11, 190, 193, 1);  // step 4 (descending)
  fill(13, 13, 194, 197, 1);  // step 5 (descending)

  // --- Pre-boss area (cols 196-219) ---
  fill(15, 18, 196, 219, 1);  // rainbow block ground

  // Small platforms for items
  fill(12, 12, 200, 202, 1);
  fill(10, 10, 207, 209, 1);
  fill(12, 12, 213, 215, 1);

  // Decorative rainbow pillars
  fill(10, 14, 205, 205, 1);
  fill(10, 14, 216, 216, 1);

  // --- Boss Arena (cols 220-248) ---

  // Solid floor for boss fight
  fill(14, 18, 220, 248, 1);

  // Arena walls on sides for containment
  fill(5, 13, 220, 220, 1);  // left wall
  fill(5, 13, 248, 248, 1);  // right wall

  // Boss arena platforms at various heights for dodging
  fill(11, 11, 224, 227, 1);  // left platform
  fill(9, 9, 232, 236, 1);    // center platform
  fill(11, 11, 240, 243, 1);  // right platform

  // Keep rightmost column solid
  fill(0, 18, 249, 249, 1);

  // ------------------------------------------------------------------
  // Expose the level data as a global
  // ------------------------------------------------------------------
  window.WORLD_6_LEVEL = {
    id: 'rainbow_falls',
    name: 'Rainbow Falls',
    width: W,
    height: H,
    tileSize: 32,
    backgroundColor: 0x4488CC,
    gravity: 900,
    tiles: tiles,

    config: {
      hasSwimming: true,
      hasBoss: true,
      playerSpeed: 160,
      jumpForce: -420
    },

    // ------------------------------------------------------------------
    // Entities placed in the level
    // ------------------------------------------------------------------
    entities: [
      // Spawn point
      { type: 'spawn', x: 2, y: 14 },

      // =============================================================
      // SECTION 1: Riverside -- fish enemies and introductory items
      // =============================================================

      // Fish enemies in/near pools
      { type: 'enemy', subtype: 'fish_enemy', x: 19, y: 16 },
      { type: 'enemy', subtype: 'fish_enemy', x: 33, y: 16 },
      { type: 'enemy', subtype: 'fish_enemy', x: 50, y: 16 },
      { type: 'enemy', subtype: 'fish_enemy', x: 64, y: 15 },

      // Score items along the riverside
      { type: 'food', subtype: 'gem', x: 10, y: 14 },
      { type: 'food', subtype: 'star', x: 22, y: 14 },
      { type: 'food', subtype: 'gem', x: 38, y: 14 },
      { type: 'food', subtype: 'star', x: 55, y: 14 },
      { type: 'food', subtype: 'gem', x: 70, y: 14 },

      // Hearts in section 1
      { type: 'food', subtype: 'heart', x: 15, y: 14 },
      { type: 'food', subtype: 'heart', x: 45, y: 14 },

      // Platform bonus items
      { type: 'food', subtype: 'star', x: 20, y: 10 },
      { type: 'food', subtype: 'gem', x: 50, y: 9 },

      // =============================================================
      // SECTION 2: Deep Water -- air bubbles, fish, underwater items
      // =============================================================

      // Air bubbles in underwater sections (critical for survival)
      { type: 'food', subtype: 'air_bubble', x: 88, y: 10 },
      { type: 'food', subtype: 'air_bubble', x: 92, y: 12 },
      { type: 'food', subtype: 'air_bubble', x: 97, y: 8 },
      { type: 'food', subtype: 'air_bubble', x: 105, y: 11 },
      { type: 'food', subtype: 'air_bubble', x: 124, y: 9 },
      { type: 'food', subtype: 'air_bubble', x: 130, y: 13 },
      { type: 'food', subtype: 'air_bubble', x: 135, y: 8 },
      { type: 'food', subtype: 'air_bubble', x: 139, y: 12 },
      { type: 'food', subtype: 'air_bubble', x: 145, y: 13 },
      { type: 'food', subtype: 'air_bubble', x: 150, y: 12 },

      // Fish enemy in deep water
      { type: 'enemy', subtype: 'fish_enemy', x: 95, y: 12 },

      // Hearts on platforms above water
      { type: 'food', subtype: 'heart', x: 115, y: 9 },
      { type: 'food', subtype: 'heart', x: 144, y: 7 },

      // Score items in/near water
      { type: 'food', subtype: 'gem', x: 91, y: 4 },
      { type: 'food', subtype: 'star', x: 104, y: 4 },
      { type: 'food', subtype: 'gem', x: 129, y: 4 },
      { type: 'food', subtype: 'star', x: 149, y: 5 },
      { type: 'food', subtype: 'gem', x: 161, y: 11 },

      // =============================================================
      // SECTION 3: Rainbow Bridge + Boss Arena
      // =============================================================

      // Score items on the rainbow bridge
      { type: 'food', subtype: 'star', x: 176, y: 12 },
      { type: 'food', subtype: 'gem', x: 181, y: 10 },
      { type: 'food', subtype: 'star', x: 186, y: 8 },
      { type: 'food', subtype: 'gem', x: 191, y: 10 },

      // Hearts before boss arena
      { type: 'food', subtype: 'heart', x: 201, y: 11 },
      { type: 'food', subtype: 'heart', x: 208, y: 9 },
      { type: 'food', subtype: 'heart', x: 214, y: 11 },

      // Score items in pre-boss area
      { type: 'food', subtype: 'star', x: 203, y: 14 },
      { type: 'food', subtype: 'gem', x: 210, y: 14 },
      { type: 'food', subtype: 'star', x: 217, y: 14 },

      // Boss
      { type: 'boss', x: 235, y: 13, bossType: 'baron_beige' },

      // Victory flag (reachable after boss is defeated)
      { type: 'flag', x: 245, y: 13 }
    ],

    // ------------------------------------------------------------------
    // Level completion requirements
    // ------------------------------------------------------------------
    completionType: 'boss',
    nextWorld: null,

    // ------------------------------------------------------------------
    // Tutorial / hint messages
    // ------------------------------------------------------------------
    tutorialMessages: {
      start: 'Rainbow Falls! Watch your air underwater!',
      swim:  'Swim with arrow keys! Grab air bubbles!',
      boss:  'Baron Beige appears! This ends NOW!'
    }
  };
})();
