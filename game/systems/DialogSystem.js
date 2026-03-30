// =============================================================================
// DialogSystem.js - Win95-style dialog boxes rendered with Phaser graphics
// =============================================================================

class DialogSystem {
  constructor(scene) {
    this.scene = scene;
    this.container = null;
    this.isShowing = false;
    this.queue = [];
    this.onDismiss = null;
    this.autoDismissTimer = null;

    // Style constants
    this.DIALOG_WIDTH = 500;
    this.PADDING = 12;
    this.TITLE_BAR_HEIGHT = 24;
    this.BUTTON_WIDTH = 80;
    this.BUTTON_HEIGHT = 26;
    this.BORDER = 2;

    // Win95 palette
    this.COL_TITLE_BG = 0x000080;       // Navy blue title bar
    this.COL_TITLE_TEXT = 0xffffff;      // White title text
    this.COL_BODY_BG = 0xc0c0c0;        // Silver body (classic Win95)
    this.COL_TEXT_AREA_BG = 0xffffff;    // White text area
    this.COL_TEXT = 0x000000;            // Black text
    this.COL_BORDER_LIGHT = 0xffffff;    // Highlight border
    this.COL_BORDER_DARK = 0x808080;     // Shadow border
    this.COL_BORDER_DARKER = 0x404040;   // Deeper shadow
    this.COL_BUTTON_BG = 0xc0c0c0;      // Button face
    this.COL_CLOSE_X = 0x000000;         // Close button text
  }

  // ---------------------------------------------------------------------------
  // Public API
  // ---------------------------------------------------------------------------

  /**
   * Show a dialog message.
   * @param {string} message
   * @param {object} options - { title, autoDismiss, duration, onDismiss }
   */
  show(message, options) {
    options = options || {};
    var title = options.title || 'MOO-QUEST';
    var autoDismiss = options.autoDismiss || false;
    var duration = options.duration || 3000;

    if (this.isShowing) {
      this.queue.push({ message: message, options: options });
      return;
    }

    this.isShowing = true;
    this.onDismiss = options.onDismiss || null;

    this._build(message, title);

    // Auto-dismiss after duration if requested
    if (autoDismiss) {
      this.autoDismissTimer = this.scene.time.delayedCall(duration, function () {
        this.dismiss();
      }, [], this);
    }
  }

  dismiss() {
    if (!this.isShowing) return;

    if (this.autoDismissTimer) {
      this.autoDismissTimer.remove(false);
      this.autoDismissTimer = null;
    }

    var self = this;
    if (this.container) {
      this.scene.tweens.add({
        targets: this.container,
        alpha: 0,
        y: this.container.y + 20,
        duration: 150,
        ease: 'Power2',
        onComplete: function () {
          self._destroyContainer();
          self.isShowing = false;

          if (self.onDismiss) {
            var cb = self.onDismiss;
            self.onDismiss = null;
            cb();
          }

          // Show next queued message
          if (self.queue.length > 0) {
            var next = self.queue.shift();
            self.show(next.message, next.options);
          }
        }
      });
    } else {
      this.isShowing = false;
    }
  }

  update() {
    if (!this.container || !this.isShowing) return;

    // Keep dialog fixed to camera viewport (bottom-center)
    var cam = this.scene.cameras.main;
    var x = cam.scrollX + cam.width / 2;
    var y = cam.scrollY + cam.height - this.containerHeight - 20;
    this.container.setPosition(x, y);
  }

  destroy() {
    if (this.autoDismissTimer) {
      this.autoDismissTimer.remove(false);
      this.autoDismissTimer = null;
    }
    this._destroyContainer();
    this.queue = [];
    this.isShowing = false;
    this.onDismiss = null;
  }

  // ---------------------------------------------------------------------------
  // Internal: build the dialog
  // ---------------------------------------------------------------------------

  _build(message, title) {
    var scene = this.scene;
    var W = this.DIALOG_WIDTH;
    var PAD = this.PADDING;
    var TITLE_H = this.TITLE_BAR_HEIGHT;
    var BTN_W = this.BUTTON_WIDTH;
    var BTN_H = this.BUTTON_HEIGHT;
    var B = this.BORDER;

    // Measure text height so we can auto-size the dialog.
    // We create a temporary text, measure, then destroy it.
    var textAreaWidth = W - PAD * 2 - B * 4;
    var tempText = scene.add.text(0, 0, message, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '14px',
      color: '#000000',
      wordWrap: { width: textAreaWidth - PAD * 2 }
    });
    var textHeight = tempText.height;
    tempText.destroy();

    // Calculate overall dialog height
    var textAreaHeight = Math.max(40, textHeight + PAD * 2);
    var bodyHeight = PAD + textAreaHeight + PAD + BTN_H + PAD;
    var totalHeight = TITLE_H + bodyHeight + B * 2;
    this.containerHeight = totalHeight;

    // Container origin is top-left of the dialog
    this.container = scene.add.container(0, 0);
    this.container.setDepth(10000); // Always on top

    // ----- Outer raised border (Win95 style) -----
    // Light edges (top, left)
    var outerLight = scene.add.graphics();
    outerLight.fillStyle(this.COL_BORDER_LIGHT, 1);
    outerLight.fillRect(-W / 2, 0, W, B);                        // top
    outerLight.fillRect(-W / 2, 0, B, totalHeight);               // left
    this.container.add(outerLight);

    // Dark edges (bottom, right)
    var outerDark = scene.add.graphics();
    outerDark.fillStyle(this.COL_BORDER_DARKER, 1);
    outerDark.fillRect(-W / 2, totalHeight - B, W, B);           // bottom
    outerDark.fillRect(W / 2 - B, 0, B, totalHeight);            // right
    this.container.add(outerDark);

    // Medium shadow inner
    var outerMed = scene.add.graphics();
    outerMed.fillStyle(this.COL_BORDER_DARK, 1);
    outerMed.fillRect(W / 2 - B * 2, B, B, totalHeight - B * 2);     // right inner
    outerMed.fillRect(-W / 2 + B, totalHeight - B * 2, W - B * 2, B); // bottom inner
    this.container.add(outerMed);

    // ----- Title bar -----
    var titleBarY = B;
    var titleBar = scene.add.graphics();
    titleBar.fillStyle(this.COL_TITLE_BG, 1);
    titleBar.fillRect(-W / 2 + B * 2, titleBarY, W - B * 4, TITLE_H);
    this.container.add(titleBar);

    // Title text
    var titleText = scene.add.text(-W / 2 + B * 2 + 6, titleBarY + 3, title, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
    this.container.add(titleText);

    // [X] close button (right side of title bar)
    var closeBtnSize = TITLE_H - 4;
    var closeBtnX = W / 2 - B * 2 - closeBtnSize - 2;
    var closeBtnY = titleBarY + 2;

    var closeBtn = scene.add.graphics();
    // Raised button border for close
    closeBtn.fillStyle(this.COL_BUTTON_BG, 1);
    closeBtn.fillRect(closeBtnX, closeBtnY, closeBtnSize, closeBtnSize);
    // Light top-left
    closeBtn.fillStyle(this.COL_BORDER_LIGHT, 1);
    closeBtn.fillRect(closeBtnX, closeBtnY, closeBtnSize, 1);
    closeBtn.fillRect(closeBtnX, closeBtnY, 1, closeBtnSize);
    // Dark bottom-right
    closeBtn.fillStyle(this.COL_BORDER_DARKER, 1);
    closeBtn.fillRect(closeBtnX, closeBtnY + closeBtnSize - 1, closeBtnSize, 1);
    closeBtn.fillRect(closeBtnX + closeBtnSize - 1, closeBtnY, 1, closeBtnSize);
    this.container.add(closeBtn);

    // X character
    var closeX = scene.add.text(closeBtnX + closeBtnSize / 2, closeBtnY + closeBtnSize / 2, 'X', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '12px',
      fontStyle: 'bold',
      color: '#000000'
    }).setOrigin(0.5);
    this.container.add(closeX);

    // Invisible hit area over close button
    var closeHit = scene.add.rectangle(
      closeBtnX + closeBtnSize / 2,
      closeBtnY + closeBtnSize / 2,
      closeBtnSize,
      closeBtnSize,
      0x000000, 0
    ).setInteractive({ useHandCursor: true });
    closeHit.on('pointerdown', function () {
      this.dismiss();
    }, this);
    this.container.add(closeHit);

    // ----- Body area -----
    var bodyY = titleBarY + TITLE_H;
    var bodyArea = scene.add.graphics();
    bodyArea.fillStyle(this.COL_BODY_BG, 1);
    bodyArea.fillRect(-W / 2 + B * 2, bodyY, W - B * 4, bodyHeight);
    this.container.add(bodyArea);

    // ----- Sunken text area -----
    var textBoxX = -W / 2 + B * 2 + PAD;
    var textBoxY = bodyY + PAD;
    var textBoxW = W - B * 4 - PAD * 2;
    var textBoxH = textAreaHeight;

    var sunkenArea = scene.add.graphics();
    // Sunken border: dark top-left, light bottom-right
    sunkenArea.fillStyle(this.COL_BORDER_DARK, 1);
    sunkenArea.fillRect(textBoxX, textBoxY, textBoxW, 1);                         // top
    sunkenArea.fillRect(textBoxX, textBoxY, 1, textBoxH);                         // left
    sunkenArea.fillStyle(this.COL_BORDER_DARKER, 1);
    sunkenArea.fillRect(textBoxX + 1, textBoxY + 1, textBoxW - 2, 1);            // top inner
    sunkenArea.fillRect(textBoxX + 1, textBoxY + 1, 1, textBoxH - 2);            // left inner
    sunkenArea.fillStyle(this.COL_BORDER_LIGHT, 1);
    sunkenArea.fillRect(textBoxX, textBoxY + textBoxH - 1, textBoxW, 1);         // bottom
    sunkenArea.fillRect(textBoxX + textBoxW - 1, textBoxY, 1, textBoxH);         // right
    // White fill
    sunkenArea.fillStyle(this.COL_TEXT_AREA_BG, 1);
    sunkenArea.fillRect(textBoxX + 2, textBoxY + 2, textBoxW - 4, textBoxH - 4);
    this.container.add(sunkenArea);

    // Message text
    var msgText = scene.add.text(textBoxX + PAD, textBoxY + PAD, message, {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '14px',
      color: '#000000',
      wordWrap: { width: textBoxW - PAD * 2 },
      lineSpacing: 4
    });
    this.container.add(msgText);

    // ----- OK button -----
    var btnX = -BTN_W / 2;
    var btnY = textBoxY + textBoxH + PAD;

    // Button face
    var okBtn = scene.add.graphics();
    okBtn.fillStyle(this.COL_BUTTON_BG, 1);
    okBtn.fillRect(btnX, btnY, BTN_W, BTN_H);
    // Raised border: light top-left
    okBtn.fillStyle(this.COL_BORDER_LIGHT, 1);
    okBtn.fillRect(btnX, btnY, BTN_W, 1);
    okBtn.fillRect(btnX, btnY, 1, BTN_H);
    // Dark bottom-right
    okBtn.fillStyle(this.COL_BORDER_DARKER, 1);
    okBtn.fillRect(btnX, btnY + BTN_H - 1, BTN_W, 1);
    okBtn.fillRect(btnX + BTN_W - 1, btnY, 1, BTN_H);
    // Medium shadow just inside
    okBtn.fillStyle(this.COL_BORDER_DARK, 1);
    okBtn.fillRect(btnX + 1, btnY + BTN_H - 2, BTN_W - 2, 1);
    okBtn.fillRect(btnX + BTN_W - 2, btnY + 1, 1, BTN_H - 2);
    this.container.add(okBtn);

    // Button label
    var okLabel = scene.add.text(btnX + BTN_W / 2, btnY + BTN_H / 2, 'OK', {
      fontFamily: 'Arial, Helvetica, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#000000'
    }).setOrigin(0.5);
    this.container.add(okLabel);

    // Button hit area
    var self = this;
    var okHit = scene.add.rectangle(btnX + BTN_W / 2, btnY + BTN_H / 2, BTN_W, BTN_H, 0x000000, 0)
      .setInteractive({ useHandCursor: true });

    // Sunken effect on pointerdown
    okHit.on('pointerdown', function () {
      okBtn.clear();
      // Sunken button: dark top-left, light bottom-right (inverted)
      okBtn.fillStyle(self.COL_BUTTON_BG, 1);
      okBtn.fillRect(btnX, btnY, BTN_W, BTN_H);
      okBtn.fillStyle(self.COL_BORDER_DARKER, 1);
      okBtn.fillRect(btnX, btnY, BTN_W, 1);
      okBtn.fillRect(btnX, btnY, 1, BTN_H);
      okBtn.fillStyle(self.COL_BORDER_LIGHT, 1);
      okBtn.fillRect(btnX, btnY + BTN_H - 1, BTN_W, 1);
      okBtn.fillRect(btnX + BTN_W - 1, btnY, 1, BTN_H);
      okLabel.setPosition(btnX + BTN_W / 2 + 1, btnY + BTN_H / 2 + 1);
    });

    okHit.on('pointerup', function () {
      self.dismiss();
    });

    okHit.on('pointerout', function () {
      // Restore raised look if pointer leaves while held
      okBtn.clear();
      okBtn.fillStyle(self.COL_BUTTON_BG, 1);
      okBtn.fillRect(btnX, btnY, BTN_W, BTN_H);
      okBtn.fillStyle(self.COL_BORDER_LIGHT, 1);
      okBtn.fillRect(btnX, btnY, BTN_W, 1);
      okBtn.fillRect(btnX, btnY, 1, BTN_H);
      okBtn.fillStyle(self.COL_BORDER_DARKER, 1);
      okBtn.fillRect(btnX, btnY + BTN_H - 1, BTN_W, 1);
      okBtn.fillRect(btnX + BTN_W - 1, btnY, 1, BTN_H);
      okBtn.fillStyle(self.COL_BORDER_DARK, 1);
      okBtn.fillRect(btnX + 1, btnY + BTN_H - 2, BTN_W - 2, 1);
      okBtn.fillRect(btnX + BTN_W - 2, btnY + 1, 1, BTN_H - 2);
      okLabel.setPosition(btnX + BTN_W / 2, btnY + BTN_H / 2);
    });

    this.container.add(okHit);

    // ----- Entrance tween -----
    var cam = scene.cameras.main;
    var startX = cam.scrollX + cam.width / 2;
    var startY = cam.scrollY + cam.height - totalHeight - 20;
    this.container.setPosition(startX, startY + 30);
    this.container.setAlpha(0);

    scene.tweens.add({
      targets: this.container,
      alpha: 1,
      y: startY,
      duration: 200,
      ease: 'Power2'
    });

    // Play dialog click sound
    if (scene.game && scene.game.soundSystem) {
      scene.game.soundSystem.play('dialog');
    } else if (typeof soundSystem !== 'undefined') {
      soundSystem.play('dialog');
    }
  }

  _destroyContainer() {
    if (this.container) {
      this.container.destroy(true);
      this.container = null;
    }
  }
}
