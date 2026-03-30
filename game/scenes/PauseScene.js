// =============================================================================
// PauseScene.js - Win95-style pause dialog for MOO-QUEST
// Modal overlay that pauses TutorialScene. Provides Resume, Restart, and Quit.
// All UI is rendered with Phaser game objects (no DOM elements).
// =============================================================================

class PauseScene extends Phaser.Scene {
  constructor() {
    super({ key: 'PauseScene', active: false });
  }

  create() {
    // === DARK OVERLAY ===
    this.add.rectangle(400, 304, 800, 608, 0x000000, 0.55);

    // === WIN95 DIALOG BOX ===
    var dialogW = 320;
    var dialogH = 280;
    var dx = 400 - dialogW / 2;
    var dy = 304 - dialogH / 2;

    this._buildDialog(dx, dy, dialogW, dialogH);

    // === TITLE BAR ===
    this._buildTitleBar(dx, dy, dialogW, 'MOO-QUEST \u2014 PAUSED');

    // === DIALOG BODY CONTENT ===
    var bodyTop = dy + 28;
    var bodyCx = 400;

    // Cow icon area (small decorative element)
    var iconGfx = this.add.graphics();
    iconGfx.fillStyle(0xffffff, 1);
    iconGfx.fillCircle(bodyCx, bodyTop + 30, 18);
    iconGfx.fillStyle(0x800080, 1);
    iconGfx.fillCircle(bodyCx, bodyTop + 30, 15);
    iconGfx.fillStyle(0xffffff, 1);
    // Eyes
    iconGfx.fillCircle(bodyCx - 5, bodyTop + 26, 3);
    iconGfx.fillCircle(bodyCx + 5, bodyTop + 26, 3);
    iconGfx.fillStyle(0x000000, 1);
    iconGfx.fillCircle(bodyCx - 5, bodyTop + 27, 1);
    iconGfx.fillCircle(bodyCx + 5, bodyTop + 27, 1);
    // Snout
    iconGfx.fillStyle(0xffb6c1, 1);
    iconGfx.fillRoundedRect(bodyCx - 6, bodyTop + 31, 12, 7, 3);
    // Nostrils
    iconGfx.fillStyle(0xcc8899, 1);
    iconGfx.fillCircle(bodyCx - 3, bodyTop + 34, 1);
    iconGfx.fillCircle(bodyCx + 3, bodyTop + 34, 1);

    // "Game Paused" text
    this.add.text(bodyCx, bodyTop + 58, 'Game Paused', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#000000'
    }).setOrigin(0.5, 0);

    // Separator line (sunken)
    this._drawSunkenLine(dx + 20, bodyTop + 80, dialogW - 40);

    // === BUTTONS ===
    var btnW = 200;
    var btnH = 32;
    var btnX = bodyCx - btnW / 2;
    var btnSpacing = 44;

    // Resume button (green tint)
    var resumeY = bodyTop + 94;
    this._buildButton(btnX, resumeY, btnW, btnH, '\u25B6  RESUME', 0x00aa44, function () {
      this._resumeGame();
    });

    // Restart button (yellow tint)
    var restartY = resumeY + btnSpacing;
    this._buildButton(btnX, restartY, btnW, btnH, '\u21BA  RESTART', 0xbb8800, function () {
      this._restartGame();
    });

    // Quit button (red tint)
    var quitY = restartY + btnSpacing;
    this._buildButton(btnX, quitY, btnW, btnH, '\u2715  QUIT', 0xcc2222, function () {
      this._quitGame();
    });

    // === ESC TO RESUME ===
    this.input.keyboard.on('keydown-ESC', function () {
      this._resumeGame();
    }, this);

    // Play a subtle click sound
    if (this.game.soundSystem) {
      this.game.soundSystem.play('dialog');
    }
  }

  // ===========================================================================
  // ACTIONS
  // ===========================================================================

  _resumeGame() {
    if (this.game.soundSystem) {
      this.game.soundSystem.play('dialog');
    }
    this.scene.stop();
    this.scene.resume('TutorialScene');
  }

  _restartGame() {
    if (this.game.soundSystem) {
      this.game.soundSystem.play('lever');
    }
    // Stop all related scenes, then restart
    this.scene.stop('HUDScene');
    this.scene.stop('PauseScene');
    this.scene.stop('TutorialScene');

    // Reset game state
    GameState.reset();
    GameState.tutorial.startTime = Date.now();

    // Relaunch
    this.scene.start('TutorialScene');
    this.scene.launch('HUDScene');
  }

  _quitGame() {
    if (this.game.soundSystem) {
      this.game.soundSystem.stopMusic();
    }
    // Return to landing page
    if (typeof window.returnToMenu === 'function') {
      window.returnToMenu();
    }
  }

  // ===========================================================================
  // WIN95 UI BUILDERS
  // ===========================================================================

  /** Draw a full Win95 dialog frame with raised border + gray body. */
  _buildDialog(x, y, w, h) {
    // Outer raised border
    // White/light top-left edges
    this.add.rectangle(x + w / 2, y, w, 2, 0xdfdfdf).setOrigin(0.5, 0);
    this.add.rectangle(x, y + h / 2, 2, h, 0xdfdfdf).setOrigin(0, 0.5);
    // Dark bottom-right edges
    this.add.rectangle(x + w / 2, y + h, w, 2, 0x404040).setOrigin(0.5, 1);
    this.add.rectangle(x + w, y + h / 2, 2, h, 0x404040).setOrigin(1, 0.5);

    // Inner bevel
    this.add.rectangle(x + 1 + (w - 2) / 2, y + 1, w - 2, 1, 0xffffff).setOrigin(0.5, 0);
    this.add.rectangle(x + 1, y + 1 + (h - 2) / 2, 1, h - 2, 0xffffff).setOrigin(0, 0.5);
    this.add.rectangle(x + 1 + (w - 2) / 2, y + h - 1, w - 2, 1, 0x808080).setOrigin(0.5, 1);
    this.add.rectangle(x + w - 1, y + 1 + (h - 2) / 2, 1, h - 2, 0x808080).setOrigin(1, 0.5);

    // Gray body fill
    this.add.rectangle(x + w / 2, y + h / 2, w - 4, h - 4, 0xc0c0c0);
  }

  /** Draw the navy blue title bar with text and a close button. */
  _buildTitleBar(dx, dy, dialogW, titleText) {
    var tbH = 22;
    var tbx = dx + 3;
    var tby = dy + 3;
    var tbw = dialogW - 6;

    // Navy blue bar
    this.add.rectangle(tbx + tbw / 2, tby + tbH / 2, tbw, tbH, 0x000080);

    // Title text
    this.add.text(tbx + 6, tby + 3, titleText, {
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    });

    // Close button [X]
    var closeBtnSize = 16;
    var closeBtnX = tbx + tbw - closeBtnSize - 3;
    var closeBtnY = tby + 3;

    // Button face
    this.add.rectangle(closeBtnX + closeBtnSize / 2, closeBtnY + closeBtnSize / 2,
      closeBtnSize, closeBtnSize, 0xc0c0c0);
    // Raised edges
    this.add.rectangle(closeBtnX + closeBtnSize / 2, closeBtnY, closeBtnSize, 1, 0xdfdfdf)
      .setOrigin(0.5, 0);
    this.add.rectangle(closeBtnX, closeBtnY + closeBtnSize / 2, 1, closeBtnSize, 0xdfdfdf)
      .setOrigin(0, 0.5);
    this.add.rectangle(closeBtnX + closeBtnSize / 2, closeBtnY + closeBtnSize, closeBtnSize, 1, 0x404040)
      .setOrigin(0.5, 1);
    this.add.rectangle(closeBtnX + closeBtnSize, closeBtnY + closeBtnSize / 2, 1, closeBtnSize, 0x404040)
      .setOrigin(1, 0.5);
    // X label
    var closeText = this.add.text(closeBtnX + 4, closeBtnY, 'x', {
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#000000'
    });

    // Make close button interactive (resumes game)
    var closeHit = this.add.rectangle(closeBtnX + closeBtnSize / 2, closeBtnY + closeBtnSize / 2,
      closeBtnSize, closeBtnSize, 0xffffff, 0).setInteractive({ useHandCursor: true });
    var self = this;
    closeHit.on('pointerdown', function () {
      self._resumeGame();
    });
  }

  /** Draw a Win95 raised button with label text. */
  _buildButton(x, y, w, h, label, labelColor, callback) {
    var self = this;

    // Button face
    var face = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xc0c0c0);

    // Raised border — light top-left
    this.add.rectangle(x + w / 2, y, w, 1, 0xdfdfdf).setOrigin(0.5, 0);
    this.add.rectangle(x, y + h / 2, 1, h, 0xdfdfdf).setOrigin(0, 0.5);
    // Inner highlight
    this.add.rectangle(x + 1 + (w - 2) / 2, y + 1, w - 2, 1, 0xffffff).setOrigin(0.5, 0);
    this.add.rectangle(x + 1, y + 1 + (h - 2) / 2, 1, h - 2, 0xffffff).setOrigin(0, 0.5);
    // Dark bottom-right
    this.add.rectangle(x + w / 2, y + h, w, 1, 0x404040).setOrigin(0.5, 1);
    this.add.rectangle(x + w, y + h / 2, 1, h, 0x404040).setOrigin(1, 0.5);
    // Inner shadow
    this.add.rectangle(x + 1 + (w - 2) / 2, y + h - 1, w - 2, 1, 0x808080).setOrigin(0.5, 1);
    this.add.rectangle(x + w - 1, y + 1 + (h - 2) / 2, 1, h - 2, 0x808080).setOrigin(1, 0.5);

    // Label text
    this.add.text(x + w / 2, y + h / 2, label, {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: Phaser.Display.Color.IntegerToColor(labelColor).rgba
    }).setOrigin(0.5, 0.5);

    // Interactive hit area over the whole button
    var hitArea = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });

    // Hover: darken button face
    hitArea.on('pointerover', function () {
      face.setFillStyle(0xd4d4d4);
    });
    hitArea.on('pointerout', function () {
      face.setFillStyle(0xc0c0c0);
    });

    // Press: invert border to look pressed
    hitArea.on('pointerdown', function () {
      face.setFillStyle(0xa8a8a8);
    });

    hitArea.on('pointerup', function () {
      face.setFillStyle(0xc0c0c0);
      callback.call(self);
    });
  }

  /** Draw a sunken horizontal separator line. */
  _drawSunkenLine(x, y, w) {
    this.add.rectangle(x + w / 2, y, w, 1, 0x808080).setOrigin(0.5, 0);
    this.add.rectangle(x + w / 2, y + 1, w, 1, 0xffffff).setOrigin(0.5, 0);
  }
}
