/**
 * WORLD_4_LEVEL - Cloud Kingdom
 * 120 tiles wide x 19 tiles tall (3840x608 pixels at 32px tiles).
 * Bouncy vertical platforming in the sky — no ground at the bottom!
 * Cloud platforms, bouncy clouds, rainbow bridges, and wind zones.
 *
 * Tile key:
 *   0 = empty / air (open sky — falling means death!)
 *   1 = cloud (solid white/grey cloud platform)
 *   2 = cloud_bouncy (launches player upward on contact)
 *   3 = rainbow (solid, colourful decorative bridge)
 *   4 = platform (thin cloud platform, one-way from below)
 */

(function() {
  var W = 120;
  var H = 19;
  var tiles = [];
  var r, c;

  // Initialise every cell to air (open sky)
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
  // ZONE 1 (cols 0-20): Starting area — safe cloud platforms
  // The player spawns on a large cloud and learns the mechanics.
  // ==================================================================

  // Large starting cloud (player spawns here)
  fill(15, 16, 0, 8, 1);

  // Stepping clouds going right and slightly up
  fill(14, 14, 11, 13, 1);
  fill(13, 13, 16, 18, 1);
  fill(14, 14, 20, 22, 1);

  // First bouncy cloud — teaches the bounce mechanic
  fill(16, 16, 12, 13, 2);

  // Platform above the bouncy cloud (reachable by bouncing)
  fill(10, 10, 11, 14, 4);

  // ==================================================================
  // ZONE 2 (cols 21-40): Cloud hopping with bouncy clouds
  // Alternating normal and bouncy clouds at varying heights.
  // ==================================================================

  // Cloud at mid height
  fill(12, 12, 24, 26, 1);

  // Bouncy cloud below — launches player up
  fill(16, 16, 28, 29, 2);

  // High cloud reachable from bounce
  fill(8, 8, 27, 30, 1);

  // Stepping clouds going right
  fill(10, 10, 32, 34, 1);
  fill(12, 12, 36, 38, 1);

  // Bouncy cloud
  fill(15, 15, 35, 36, 2);

  // High platform reachable from bounce
  fill(7, 7, 34, 37, 4);

  // Large resting cloud
  fill(13, 14, 39, 43, 1);

  // ==================================================================
  // ZONE 3 (cols 41-60): Rainbow bridges and wind zones
  // Long rainbow bridges connect cloud islands. Wind pushes the player.
  // ==================================================================

  // Rainbow bridge going right
  fill(12, 12, 44, 52, 3);

  // Cloud island after bridge
  fill(11, 12, 53, 56, 1);

  // Bouncy cloud below the island
  fill(15, 15, 54, 55, 2);

  // High clouds reachable from bounce
  fill(6, 6, 53, 56, 4);
  fill(5, 5, 50, 52, 1);

  // Rainbow bridge going to next section (slightly higher)
  fill(10, 10, 57, 63, 3);

  // Cloud platform
  fill(9, 10, 64, 67, 1);

  // Scattered platforms at different heights for wind section
  fill(12, 12, 60, 61, 4);
  fill(14, 14, 63, 64, 4);
  fill(7, 7, 62, 64, 4);

  // ==================================================================
  // ZONE 4 (cols 61-85): Vertical ascent with bouncy chains
  // Player must bounce upward through a series of bouncy clouds.
  // ==================================================================

  // Starting platform for the ascent
  fill(14, 14, 68, 71, 1);

  // Bouncy chain — each bounce sends player to the next level
  fill(16, 16, 70, 71, 2);   // bottom bounce
  fill(13, 13, 73, 74, 2);   // mid bounce
  fill(10, 10, 71, 72, 2);   // upper bounce

  // Resting platforms alongside the bouncy chain
  fill(15, 15, 74, 76, 1);
  fill(11, 11, 75, 77, 1);
  fill(8, 8, 73, 75, 1);

  // High cloud after ascent
  fill(6, 7, 76, 80, 1);

  // Clouds going right from the high point
  fill(7, 7, 82, 84, 4);
  fill(8, 8, 86, 88, 1);

  // Bouncy cloud to get back up if you fall
  fill(14, 14, 80, 81, 2);
  fill(16, 16, 84, 85, 2);

  // Rainbow bridge at high altitude
  fill(5, 5, 79, 87, 3);

  // ==================================================================
  // ZONE 5 (cols 86-105): Wind gauntlet
  // Strong wind zones push the player around. Requires careful timing.
  // ==================================================================

  // Cloud platforms through the wind section
  fill(9, 10, 89, 92, 1);
  fill(11, 11, 94, 96, 1);
  fill(9, 9, 97, 99, 1);
  fill(12, 12, 100, 102, 1);
  fill(10, 10, 103, 105, 1);

  // Bouncy clouds to recover from falls
  fill(16, 16, 90, 91, 2);
  fill(16, 16, 98, 99, 2);

  // Small platforms at various heights
  fill(7, 7, 93, 94, 4);
  fill(6, 6, 98, 100, 4);
  fill(14, 14, 95, 96, 4);
  fill(14, 14, 101, 102, 4);

  // ==================================================================
  // ZONE 6 (cols 106-119): Final approach and flag
  // A dramatic final ascent to the flag high in the sky.
  // ==================================================================

  // Cloud staircase going up
  fill(12, 12, 106, 108, 1);
  fill(10, 10, 109, 111, 1);
  fill(8, 8, 112, 114, 1);

  // Bouncy cloud for the final launch
  fill(11, 11, 113, 114, 2);

  // Final rainbow bridge to the flag
  fill(5, 5, 112, 118, 3);

  // Flag platform (large, safe landing)
  fill(4, 5, 113, 118, 1);

  // Safety bouncy cloud below the flag area
  fill(15, 15, 110, 115, 2);

  // A few scattered recovery platforms
  fill(14, 14, 107, 108, 4);
  fill(16, 16, 106, 107, 2);

  // ==================================================================
  // Expose the level data as a global
  // ==================================================================
  window.WORLD_4_LEVEL = {
    id: 'cloud_kingdom',
    name: 'Cloud Kingdom',
    width: W,
    height: H,
    tileSize: 32,
    backgroundColor: 0xB0E0FF,
    gravity: 600,
    config: {
      hasDarkness: false,
      lightRadius: 0,
      hasSwimming: false,
      hasMovingPlatforms: false,
      hasWind: true,
      hasBoss: false,
      playerSpeed: 140,
      jumpForce: -380
    },
    tiles: tiles,

    // ------------------------------------------------------------------
    // Entities placed in the level
    // ------------------------------------------------------------------
    entities: [
      // Spawn point (on the large starting cloud)
      { type: 'spawn', x: 3, y: 14 },

      // ----- Wind zones (push player horizontally) -----
      { type: 'wind_zone', x: 44, y: 6, width: 3, height: 6, forceX: 80 },
      { type: 'wind_zone', x: 57, y: 4, width: 3, height: 6, forceX: -60 },
      { type: 'wind_zone', x: 90, y: 5, width: 3, height: 6, forceX: 100 },
      { type: 'wind_zone', x: 95, y: 6, width: 3, height: 6, forceX: -80 },
      { type: 'wind_zone', x: 100, y: 5, width: 3, height: 6, forceX: 90 },
      { type: 'wind_zone', x: 109, y: 3, width: 3, height: 6, forceX: -70 },

      // ----- Wind sprites (flying enemies) -----
      { type: 'enemy', subtype: 'wind_sprite', x: 30, y: 10 },
      { type: 'enemy', subtype: 'wind_sprite', x: 48, y: 9 },
      { type: 'enemy', subtype: 'wind_sprite', x: 62, y: 8 },
      { type: 'enemy', subtype: 'wind_sprite', x: 83, y: 6 },
      { type: 'enemy', subtype: 'wind_sprite', x: 96, y: 8 },
      { type: 'enemy', subtype: 'wind_sprite', x: 111, y: 7 },

      // ----- Cloud puffs (small bouncy enemies) -----
      { type: 'enemy', subtype: 'cloud_puff', x: 21, y: 13 },
      { type: 'enemy', subtype: 'cloud_puff', x: 42, y: 12 },
      { type: 'enemy', subtype: 'cloud_puff', x: 66, y: 8 },
      { type: 'enemy', subtype: 'cloud_puff', x: 93, y: 10 },
      { type: 'enemy', subtype: 'cloud_puff', x: 107, y: 11 },

      // ----- Feathers (collectibles, float in the air) -----
      { type: 'food', subtype: 'feather', x: 13, y: 9 },
      { type: 'food', subtype: 'feather', x: 28, y: 7 },
      { type: 'food', subtype: 'feather', x: 37, y: 6 },
      { type: 'food', subtype: 'feather', x: 51, y: 4 },
      { type: 'food', subtype: 'feather', x: 63, y: 6 },
      { type: 'food', subtype: 'feather', x: 74, y: 5 },
      { type: 'food', subtype: 'feather', x: 85, y: 4 },
      { type: 'food', subtype: 'feather', x: 99, y: 5 },
      { type: 'food', subtype: 'feather', x: 115, y: 3 },

      // ----- Stars (bonus collectibles at tricky locations) -----
      { type: 'food', subtype: 'star', x: 14, y: 7 },
      { type: 'food', subtype: 'star', x: 35, y: 5 },
      { type: 'food', subtype: 'star', x: 55, y: 4 },
      { type: 'food', subtype: 'star', x: 78, y: 5 },
      { type: 'food', subtype: 'star', x: 93, y: 5 },
      { type: 'food', subtype: 'star', x: 116, y: 3 },

      // ----- Hearts -----
      { type: 'food', subtype: 'heart', x: 8, y: 14 },
      { type: 'food', subtype: 'heart', x: 40, y: 12 },
      { type: 'food', subtype: 'heart', x: 65, y: 8 },
      { type: 'food', subtype: 'heart', x: 89, y: 8 },
      { type: 'food', subtype: 'heart', x: 113, y: 7 },

      // ----- Victory flag (high up on the final cloud) -----
      { type: 'flag', x: 116, y: 3 }
    ],

    // ------------------------------------------------------------------
    // Phase triggers (keyed by pixel x-position)
    // ------------------------------------------------------------------
    triggers: [
      { x: 64,   phase: 'start',    message: null },
      { x: 672,  phase: 'bounce',   message: null },
      { x: 1408, phase: 'rainbow',  message: null },
      { x: 2176, phase: 'ascent',   message: null },
      { x: 2880, phase: 'wind',     message: null },
      { x: 3700, phase: 'victory' }
    ],

    // ------------------------------------------------------------------
    // Messages shown when entering each phase
    // ------------------------------------------------------------------
    tutorialMessages: {
      start:   'Welcome to the Cloud Kingdom! Don\'t look down...',
      bounce:  'Bouncy clouds launch you upward! Use them to reach higher platforms!',
      rainbow: 'Rainbow bridges! Walk across, but watch for wind gusts!',
      ascent:  'Time to climb! Chain bounces to reach the top!',
      wind:    'Strong winds ahead! Time your jumps carefully!'
    },

    completionType: 'flag',
    nextWorld: 'shadow_barn'
  };
})();
