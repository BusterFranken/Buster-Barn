// =============================================================================
// BootScene.js - Loading screen and asset generation for MOO-QUEST
// Generates all sprites via SpriteFactory, creates Phaser animations,
// and displays a Win95-style loading dialog during generation.
// =============================================================================

class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: 'BootScene' });
  }

  create() {
    // Show loading screen (Win95 style)
    this.showLoadingScreen();

    // Use a small delay to let the loading screen render before heavy work
    this.time.delayedCall(100, function() {
      this.generateAssets();
    }, [], this);
  }

  showLoadingScreen() {
    var cx = 400;
    var cy = 304;

    // ── Teal desktop background ──
    this.add.rectangle(cx, cy, 800, 608, 0x008080);

    // ── Dialog dimensions ──
    var dialogW = 420;
    var dialogH = 190;
    var dx = cx - dialogW / 2;   // left edge
    var dy = cy - dialogH / 2;   // top edge

    // ── Outer raised border (Win95 window frame) ──
    // White/light top-left edges
    this.add.rectangle(dx + dialogW / 2, dy, dialogW, 2, 0xdfdfdf).setOrigin(0.5, 0);       // top
    this.add.rectangle(dx, dy + dialogH / 2, 2, dialogH, 0xdfdfdf).setOrigin(0, 0.5);       // left
    // Dark bottom-right edges
    this.add.rectangle(dx + dialogW / 2, dy + dialogH, dialogW, 2, 0x404040).setOrigin(0.5, 1); // bottom
    this.add.rectangle(dx + dialogW, dy + dialogH / 2, 2, dialogH, 0x404040).setOrigin(1, 0.5); // right

    // Inner shadow edge (second bevel)
    this.add.rectangle(dx + 1 + (dialogW - 2) / 2, dy + 1, dialogW - 2, 1, 0xffffff).setOrigin(0.5, 0);
    this.add.rectangle(dx + 1, dy + 1 + (dialogH - 2) / 2, 1, dialogH - 2, 0xffffff).setOrigin(0, 0.5);
    this.add.rectangle(dx + 1 + (dialogW - 2) / 2, dy + dialogH - 1, dialogW - 2, 1, 0x808080).setOrigin(0.5, 1);
    this.add.rectangle(dx + dialogW - 1, dy + 1 + (dialogH - 2) / 2, 1, dialogH - 2, 0x808080).setOrigin(1, 0.5);

    // ── Gray dialog body ──
    this.add.rectangle(dx + dialogW / 2, dy + dialogH / 2, dialogW - 4, dialogH - 4, 0xc0c0c0);

    // ── Title bar (navy blue gradient) ──
    var titleBarH = 22;
    var tbx = dx + 3;
    var tby = dy + 3;
    var tbw = dialogW - 6;

    this.add.rectangle(tbx + tbw / 2, tby + titleBarH / 2, tbw, titleBarH, 0x000080);

    // Title bar text
    this.add.text(tbx + 4, tby + 2, 'Loading MOO-QUEST...', {
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    });

    // Title bar close button (decorative)
    var closeBtnSize = 16;
    var closeBtnX = tbx + tbw - closeBtnSize - 3;
    var closeBtnY = tby + 3;

    // Close button raised border
    this.add.rectangle(closeBtnX + closeBtnSize / 2, closeBtnY + closeBtnSize / 2, closeBtnSize, closeBtnSize, 0xc0c0c0);
    // Highlight edges
    this.add.rectangle(closeBtnX + closeBtnSize / 2, closeBtnY, closeBtnSize, 1, 0xdfdfdf).setOrigin(0.5, 0);
    this.add.rectangle(closeBtnX, closeBtnY + closeBtnSize / 2, 1, closeBtnSize, 0xdfdfdf).setOrigin(0, 0.5);
    // Shadow edges
    this.add.rectangle(closeBtnX + closeBtnSize / 2, closeBtnY + closeBtnSize, closeBtnSize, 1, 0x404040).setOrigin(0.5, 1);
    this.add.rectangle(closeBtnX + closeBtnSize, closeBtnY + closeBtnSize / 2, 1, closeBtnSize, 0x404040).setOrigin(1, 0.5);
    // X label
    this.add.text(closeBtnX + 3, closeBtnY, 'x', {
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#000000'
    });

    // ── Body area ──
    var bodyTop = tby + titleBarH + 12;
    var bodyLeft = dx + 20;

    // ── Animated icon area: small Win95 file-copy animation ──
    // Draw two "document" icons side by side with an arrow
    var iconY = bodyTop + 4;
    var iconX = bodyLeft;

    // Source document icon
    this.add.rectangle(iconX + 10, iconY + 12, 20, 24, 0xffffff);
    this.add.rectangle(iconX + 10, iconY + 12, 20, 24).setStrokeStyle(1, 0x000000);
    // Folded corner
    var cornerPts = [
      { x: iconX + 14, y: iconY },
      { x: iconX + 20, y: iconY },
      { x: iconX + 20, y: iconY + 6 },
      { x: iconX + 14, y: iconY }
    ];
    var cornerGfx = this.add.graphics();
    cornerGfx.fillStyle(0xc0c0c0);
    cornerGfx.fillTriangle(
      cornerPts[0].x, cornerPts[0].y,
      cornerPts[1].x, cornerPts[1].y,
      cornerPts[2].x, cornerPts[2].y
    );
    cornerGfx.lineStyle(1, 0x000000);
    cornerGfx.lineBetween(iconX + 14, iconY, iconX + 20, iconY + 6);
    // Lines on document
    this.add.rectangle(iconX + 10, iconY + 10, 12, 1, 0x808080);
    this.add.rectangle(iconX + 10, iconY + 14, 12, 1, 0x808080);
    this.add.rectangle(iconX + 10, iconY + 18, 8, 1, 0x808080);

    // Arrow
    var arrowGfx = this.add.graphics();
    arrowGfx.fillStyle(0x000080);
    arrowGfx.fillRect(iconX + 26, iconY + 11, 16, 3);
    arrowGfx.fillTriangle(
      iconX + 42, iconY + 6,
      iconX + 42, iconY + 18,
      iconX + 50, iconY + 12
    );

    // Destination folder icon
    this.add.rectangle(iconX + 62, iconY + 14, 24, 20, 0xffff00);
    this.add.rectangle(iconX + 62, iconY + 14, 24, 20).setStrokeStyle(1, 0x000000);
    // Folder tab
    this.add.rectangle(iconX + 55, iconY + 4, 12, 6, 0xffff00);
    this.add.rectangle(iconX + 55, iconY + 4, 12, 6).setStrokeStyle(1, 0x000000);

    // ── Status text: "Generating sprites..." ──
    this.loadingText = this.add.text(bodyLeft + 90, bodyTop + 4, 'Generating sprites...', {
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      fontSize: '12px',
      color: '#000000'
    });

    // ── "From: SpriteFactory  To: Phaser Cache" detail text ──
    this.add.text(bodyLeft + 90, bodyTop + 22, 'From:  SpriteFactory', {
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      fontSize: '11px',
      color: '#000000'
    });
    this.add.text(bodyLeft + 90, bodyTop + 36, 'To:      Phaser Texture Cache', {
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      fontSize: '11px',
      color: '#000000'
    });

    // ── Progress bar ──
    var barLeft = dx + 20;
    var barTop = bodyTop + 60;
    var barWidth = dialogW - 40;
    var barHeight = 20;

    // Sunken border around progress bar
    // Dark top-left
    this.add.rectangle(barLeft + barWidth / 2, barTop, barWidth, 1, 0x808080).setOrigin(0.5, 0);
    this.add.rectangle(barLeft, barTop + barHeight / 2, 1, barHeight, 0x808080).setOrigin(0, 0.5);
    // Light bottom-right
    this.add.rectangle(barLeft + barWidth / 2, barTop + barHeight, barWidth, 1, 0xdfdfdf).setOrigin(0.5, 1);
    this.add.rectangle(barLeft + barWidth, barTop + barHeight / 2, 1, barHeight, 0xdfdfdf).setOrigin(1, 0.5);
    // Inner dark edge
    this.add.rectangle(barLeft + 1 + (barWidth - 2) / 2, barTop + 1, barWidth - 2, 1, 0x404040).setOrigin(0.5, 0);
    this.add.rectangle(barLeft + 1, barTop + 1 + (barHeight - 2) / 2, 1, barHeight - 2, 0x404040).setOrigin(0, 0.5);
    // Inner light edge
    this.add.rectangle(barLeft + 1 + (barWidth - 2) / 2, barTop + barHeight - 1, barWidth - 2, 1, 0xffffff).setOrigin(0.5, 1);
    this.add.rectangle(barLeft + barWidth - 1, barTop + 1 + (barHeight - 2) / 2, 1, barHeight - 2, 0xffffff).setOrigin(1, 0.5);

    // White background of progress bar
    this.add.rectangle(barLeft + 2 + (barWidth - 4) / 2, barTop + 2 + (barHeight - 4) / 2, barWidth - 4, barHeight - 4, 0xffffff);

    // ── Progress fill (Win95 segmented blue blocks) ──
    this._barLeft = barLeft + 3;
    this._barTop = barTop + 3;
    this._barMaxWidth = barWidth - 6;
    this._barHeight = barHeight - 6;
    this._barBlockWidth = 11;
    this._barBlockGap = 2;

    // Container for progress blocks
    this._progressBlocks = [];
    this._updateProgressBar(0);

    // ── "Please wait..." text below bar ──
    this.pleaseWaitText = this.add.text(cx, barTop + barHeight + 10, 'Please wait...', {
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      fontSize: '11px',
      color: '#000000'
    }).setOrigin(0.5, 0);

    // ── Cancel button (decorative, Win95 style) ──
    var cancelBtnW = 80;
    var cancelBtnH = 24;
    var cancelBtnX = cx - cancelBtnW / 2;
    var cancelBtnY = barTop + barHeight + 30;

    // Button face
    this.add.rectangle(cancelBtnX + cancelBtnW / 2, cancelBtnY + cancelBtnH / 2, cancelBtnW, cancelBtnH, 0xc0c0c0);
    // Raised edges
    this.add.rectangle(cancelBtnX + cancelBtnW / 2, cancelBtnY, cancelBtnW, 1, 0xdfdfdf).setOrigin(0.5, 0);
    this.add.rectangle(cancelBtnX, cancelBtnY + cancelBtnH / 2, 1, cancelBtnH, 0xdfdfdf).setOrigin(0, 0.5);
    this.add.rectangle(cancelBtnX + cancelBtnW / 2, cancelBtnY + cancelBtnH, cancelBtnW, 1, 0x404040).setOrigin(0.5, 1);
    this.add.rectangle(cancelBtnX + cancelBtnW, cancelBtnY + cancelBtnH / 2, 1, cancelBtnH, 0x404040).setOrigin(1, 0.5);
    // Inner bevel
    this.add.rectangle(cancelBtnX + 1 + (cancelBtnW - 2) / 2, cancelBtnY + 1, cancelBtnW - 2, 1, 0xffffff).setOrigin(0.5, 0);
    this.add.rectangle(cancelBtnX + 1, cancelBtnY + 1 + (cancelBtnH - 2) / 2, 1, cancelBtnH - 2, 0xffffff).setOrigin(0, 0.5);
    this.add.rectangle(cancelBtnX + 1 + (cancelBtnW - 2) / 2, cancelBtnY + cancelBtnH - 1, cancelBtnW - 2, 1, 0x808080).setOrigin(0.5, 1);
    this.add.rectangle(cancelBtnX + cancelBtnW - 1, cancelBtnY + 1 + (cancelBtnH - 2) / 2, 1, cancelBtnH - 2, 0x808080).setOrigin(1, 0.5);
    // Button label
    this.add.text(cx, cancelBtnY + cancelBtnH / 2, 'Cancel', {
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      fontSize: '12px',
      color: '#000000'
    }).setOrigin(0.5, 0.5);
  }

  /**
   * Draws Win95-style segmented blue blocks in the progress bar.
   * @param {number} progress - 0 to 1
   */
  _updateProgressBar(progress) {
    // Remove old blocks
    for (var i = 0; i < this._progressBlocks.length; i++) {
      this._progressBlocks[i].destroy();
    }
    this._progressBlocks = [];

    var fillWidth = Math.floor(this._barMaxWidth * Math.min(progress, 1));
    var blockStep = this._barBlockWidth + this._barBlockGap;
    var numBlocks = Math.floor(fillWidth / blockStep);

    for (var b = 0; b < numBlocks; b++) {
      var bx = this._barLeft + b * blockStep + this._barBlockWidth / 2;
      var by = this._barTop + this._barHeight / 2;
      var block = this.add.rectangle(bx, by, this._barBlockWidth, this._barHeight, 0x000080);
      this._progressBlocks.push(block);
    }
  }

  updateLoading(progress, text) {
    this._updateProgressBar(progress);
    if (this.loadingText) {
      this.loadingText.setText(text);
    }
    if (progress >= 1 && this.pleaseWaitText) {
      this.pleaseWaitText.setText('Complete!');
    }
  }

  generateAssets() {
    // Generate all procedural sprites
    SpriteFactory.generateAll(this);
    this.updateLoading(0.5, 'Creating animations...');

    // Create all Phaser animations
    this.createAnimations();
    this.updateLoading(0.8, 'Preparing sound...');

    // Initialize sound system
    this.game.soundSystem.init();
    this.updateLoading(1.0, 'Ready!');

    // Transition to TutorialScene after short delay
    this.time.delayedCall(500, function() {
      this.scene.start('TutorialScene');
      this.scene.launch('HUDScene');
    }, [], this);
  }

  createAnimations() {
    // ── Violet animations ──

    this.anims.create({
      key: 'violet_idle',
      frames: this.anims.generateFrameNumbers('violet', { start: 0, end: 1 }),
      frameRate: 3,
      repeat: -1
    });

    this.anims.create({
      key: 'violet_walk',
      frames: this.anims.generateFrameNumbers('violet', { start: 2, end: 5 }),
      frameRate: 8,
      repeat: -1
    });

    this.anims.create({
      key: 'violet_jump',
      frames: [{ key: 'violet', frame: 6 }],
      frameRate: 1
    });

    this.anims.create({
      key: 'violet_eat',
      frames: this.anims.generateFrameNumbers('violet', { start: 7, end: 9 }),
      frameRate: 6,
      repeat: 0
    });

    this.anims.create({
      key: 'violet_attack',
      frames: this.anims.generateFrameNumbers('violet', { start: 10, end: 12 }),
      frameRate: 12,
      repeat: 0
    });

    this.anims.create({
      key: 'violet_hurt',
      frames: [{ key: 'violet', frame: 13 }],
      frameRate: 1
    });

    // ── Enemy animations ──

    this.anims.create({
      key: 'slime_idle',
      frames: this.anims.generateFrameNumbers('slime', { start: 0, end: 1 }),
      frameRate: 2,
      repeat: -1
    });

    this.anims.create({
      key: 'beetle_walk',
      frames: this.anims.generateFrameNumbers('beetle', { start: 0, end: 1 }),
      frameRate: 4,
      repeat: -1
    });

    // ── Coin spin ──

    this.anims.create({
      key: 'coin_spin',
      frames: this.anims.generateFrameNumbers('item_coin', { start: 0, end: 3 }),
      frameRate: 8,
      repeat: -1
    });
  }
}
