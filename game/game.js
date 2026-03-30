// =============================================================================
// game.js - Phaser bootstrap for MOO-QUEST
// Loaded as the last <script> in index.html, after Phaser CDN and all game scripts.
// Defines window.startMooQuest(worldId) called by the HTML launcher.
// =============================================================================

// Global sound system instance
var soundSystem = new SoundSystem();

window.startMooQuest = function(worldId) {
  // Reset game state
  GameState.reset();
  GameState.tutorial.startTime = Date.now();

  var config = {
    type: Phaser.AUTO,
    width: 800,
    height: 608,  // 19 tiles * 32px
    parent: 'game-container',
    pixelArt: true,
    roundPixels: true,
    physics: {
      default: 'arcade',
      arcade: {
        gravity: { y: 900 },
        debug: false
      }
    },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_HORIZONTALLY
    },
    scene: [BootScene, TutorialScene, WorldScene, HUDScene, PauseScene, VictoryScene],
    backgroundColor: '#87CEEB'
  };

  window.mooQuestGame = new Phaser.Game(config);
  window.mooQuestGame.soundSystem = soundSystem;
  window.mooQuestGame.selectedWorldId = worldId;
};
