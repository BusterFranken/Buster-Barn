// =============================================================================
// HUDScene.js - Retro Win95 HUD overlay for MOO-QUEST
// Runs in parallel with TutorialScene. Shows health, score, items, phase info,
// and control hints. All elements are fixed to the camera viewport.
// =============================================================================

class HUDScene extends Phaser.Scene {
  constructor() {
    super({ key: 'HUDScene', active: false });
  }

  create() {
    // ----- State -----
    this.currentHealth = 3;
    this.maxHealth = 3;
    this.currentScore = 0;
    this.currentItems = 0;
    this.currentPhase = 'movement';

    // === SEMI-TRANSPARENT TOP BAR FOR READABILITY ===
    this.add.rectangle(400, 0, 800, 52, 0x000000, 0.45).setOrigin(0.5, 0);

    // === HEALTH BAR (top-left) — Win95 sunken panel with pixel hearts ===
    this._buildHealthPanel();

    // === SCORE DISPLAY (top-right) — green terminal text ===
    this._buildScoreDisplay();

    // === ITEM COUNTER (below score, shown during eat phase) ===
    this._buildItemCounter();

    // === PHASE INDICATOR (top-center) ===
    this._buildPhaseIndicator();

    // === CONTROLS HINT (bottom of screen, fades out) ===
    this._buildControlsHint();

    // ----- Listen to TutorialScene events -----
    var tutorial = this.scene.get('TutorialScene');
    if (tutorial) {
      tutorial.events.on('healthChanged', this.updateHealth, this);
      tutorial.events.on('scoreChanged', this.updateScore, this);
      tutorial.events.on('itemsChanged', this.updateItems, this);
      tutorial.events.on('phaseChanged', this.updatePhase, this);
      tutorial.events.on('playerDied', this._onPlayerDied, this);
    }

    // Pause key
    this.input.keyboard.on('keydown-ESC', function () {
      this.scene.pause('TutorialScene');
      this.scene.launch('PauseScene');
    }, this);

    // Clean up listeners when this scene shuts down
    this.events.on('shutdown', this._cleanup, this);
    this.events.on('destroy', this._cleanup, this);
  }

  // ===========================================================================
  // BUILD METHODS
  // ===========================================================================

  _buildHealthPanel() {
    var px = 16;
    var py = 10;
    var panelW = 106;
    var panelH = 32;

    // Sunken border (Win95 inset)
    this._drawSunkenRect(px, py, panelW, panelH);

    // Inner background
    this.add.rectangle(px + panelW / 2, py + panelH / 2, panelW - 4, panelH - 4, 0x1a1a2e);

    // Hearts container
    this.hearts = [];
    for (var i = 0; i < this.maxHealth; i++) {
      var hx = px + 12 + i * 32;
      var hy = py + panelH / 2;

      // Try to use the item_heart texture if available
      var heartFilled = this._drawHeart(hx, hy, true);
      var heartEmpty = this._drawHeart(hx, hy, false);
      heartEmpty.setVisible(false);

      this.hearts.push({ filled: heartFilled, empty: heartEmpty });
    }
  }

  _drawHeart(cx, cy, filled) {
    var gfx = this.add.graphics();
    var color = filled ? 0xff0000 : 0x333333;
    var highlight = filled ? 0xff6666 : 0x444444;

    // Pixel heart shape (scaled 1.5x for readability)
    var s = 2; // pixel size

    // Top bumps
    gfx.fillStyle(color, 1);
    gfx.fillRect(cx - 5 * s, cy - 3 * s, 4 * s, 2 * s);
    gfx.fillRect(cx + 1 * s, cy - 3 * s, 4 * s, 2 * s);

    // Middle wide row
    gfx.fillRect(cx - 6 * s, cy - 1 * s, 12 * s, 2 * s);

    // Taper rows
    gfx.fillRect(cx - 5 * s, cy + 1 * s, 10 * s, 2 * s);
    gfx.fillRect(cx - 4 * s, cy + 3 * s, 8 * s, 1 * s);
    gfx.fillRect(cx - 3 * s, cy + 4 * s, 6 * s, 1 * s);
    gfx.fillRect(cx - 2 * s, cy + 5 * s, 4 * s, 1 * s);
    gfx.fillRect(cx - 1 * s, cy + 6 * s, 2 * s, 1 * s);

    // Shine highlight on left bump
    if (filled) {
      gfx.fillStyle(highlight, 1);
      gfx.fillRect(cx - 4 * s, cy - 2 * s, 2 * s, 1 * s);
    }

    return gfx;
  }

  _buildScoreDisplay() {
    // Sunken panel behind score
    var sx = 648;
    var sy = 10;
    var sw = 140;
    var sh = 28;

    this._drawSunkenRect(sx, sy, sw, sh);
    this.add.rectangle(sx + sw / 2, sy + sh / 2, sw - 4, sh - 4, 0x0a0a1a);

    // Score label
    this.add.text(sx + 8, sy + 5, 'SCORE', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '10px',
      color: '#00aa00'
    });

    // Score value (green terminal glow)
    this.scoreText = this.add.text(sx + sw - 8, sy + 4, '0000', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#00ff00',
      stroke: '#003300',
      strokeThickness: 1
    }).setOrigin(1, 0);

    // Subtle glow effect using a second text behind
    this.scoreGlow = this.add.text(sx + sw - 8, sy + 4, '0000', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '18px',
      fontStyle: 'bold',
      color: '#00ff00'
    }).setOrigin(1, 0).setAlpha(0.2).setScale(1.05);
  }

  _buildItemCounter() {
    // Positioned below score
    var ix = 648;
    var iy = 42;
    var iw = 140;
    var ih = 22;

    // Container for toggling visibility
    this.itemPanel = this.add.container(0, 0);

    // Sunken rect pieces
    var panelGfx = this.add.graphics();
    // Dark top-left edges
    panelGfx.fillStyle(0x808080, 1);
    panelGfx.fillRect(ix, iy, iw, 1);
    panelGfx.fillRect(ix, iy, 1, ih);
    panelGfx.fillStyle(0x404040, 1);
    panelGfx.fillRect(ix + 1, iy + 1, iw - 2, 1);
    panelGfx.fillRect(ix + 1, iy + 1, 1, ih - 2);
    // Light bottom-right edges
    panelGfx.fillStyle(0xdfdfdf, 1);
    panelGfx.fillRect(ix, iy + ih - 1, iw, 1);
    panelGfx.fillRect(ix + iw - 1, iy, 1, ih);
    panelGfx.fillStyle(0xffffff, 1);
    panelGfx.fillRect(ix + 1, iy + ih - 2, iw - 2, 1);
    panelGfx.fillRect(ix + iw - 2, iy + 1, 1, ih - 2);
    // Background
    panelGfx.fillStyle(0x0a0a1a, 1);
    panelGfx.fillRect(ix + 2, iy + 2, iw - 4, ih - 4);
    this.itemPanel.add(panelGfx);

    // Food icon (small green square as food symbol)
    var foodIcon = this.add.graphics();
    foodIcon.fillStyle(0x00cc00, 1);
    foodIcon.fillRect(ix + 8, iy + 5, 10, 10);
    foodIcon.fillStyle(0x009900, 1);
    foodIcon.fillRect(ix + 12, iy + 3, 3, 3);
    this.itemPanel.add(foodIcon);

    this.itemText = this.add.text(ix + 24, iy + 3, 'FOOD: 0/5', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffcc00'
    });
    this.itemPanel.add(this.itemText);

    // Checkmark (hidden until items >= 5)
    this.itemCheck = this.add.text(ix + iw - 20, iy + 2, '\u2713', {
      fontFamily: 'Arial, sans-serif',
      fontSize: '16px',
      fontStyle: 'bold',
      color: '#00ff00'
    });
    this.itemCheck.setVisible(false);
    this.itemPanel.add(this.itemCheck);

    // Initially hidden
    this.itemPanel.setVisible(false);
  }

  _buildPhaseIndicator() {
    // Phase name (top center)
    var phaseNames = {
      movement: 'PHASE: MOVEMENT',
      jump: 'PHASE: JUMPING',
      eat: 'PHASE: EATING',
      combat: 'PHASE: COMBAT',
      puzzle: 'PHASE: PUZZLE',
      complete: 'QUEST COMPLETE'
    };
    this._phaseNames = phaseNames;

    // Sunken panel behind phase text
    var pw = 180;
    var ph = 18;
    var pcx = 400;
    var pcy = 14;

    var phasePanel = this.add.graphics();
    phasePanel.fillStyle(0x000000, 0.5);
    phasePanel.fillRoundedRect(pcx - pw / 2, pcy - ph / 2 + 2, pw, ph, 2);

    this.phaseText = this.add.text(pcx, pcy + 2, phaseNames.movement, {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '11px',
      fontStyle: 'bold',
      color: '#ffffff'
    }).setOrigin(0.5, 0.5);

    // ESC hint below
    this.escHint = this.add.text(pcx, pcy + 18, 'ESC = PAUSE', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '9px',
      color: '#aaaaaa'
    }).setOrigin(0.5, 0);

    // Blinking dot next to phase text
    this.phaseDot = this.add.circle(pcx - pw / 2 + 8, pcy + 2, 3, 0x00ff00);
    this.tweens.add({
      targets: this.phaseDot,
      alpha: 0.2,
      duration: 600,
      yoyo: true,
      repeat: -1
    });
  }

  _buildControlsHint() {
    var hintY = 580;

    // Dark bar behind hint
    var hintBg = this.add.rectangle(400, hintY, 520, 24, 0x000000, 0.6);

    this.controlsHint = this.add.text(400, hintY, 'ARROWS: Move  |  SPACE: Jump  |  Z/X: Attack', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '12px',
      color: '#cccccc'
    }).setOrigin(0.5, 0.5);

    // Fade out after 5 seconds
    var self = this;
    this.time.delayedCall(5000, function () {
      self.tweens.add({
        targets: [self.controlsHint, hintBg],
        alpha: 0,
        duration: 800,
        ease: 'Power2'
      });
    });
  }

  // ===========================================================================
  // Win95 DRAWING HELPERS
  // ===========================================================================

  /** Draw a Win95-style sunken (inset) rectangle border. */
  _drawSunkenRect(x, y, w, h) {
    // Dark top-left edges
    this.add.rectangle(x + w / 2, y, w, 1, 0x808080).setOrigin(0.5, 0);
    this.add.rectangle(x, y + h / 2, 1, h, 0x808080).setOrigin(0, 0.5);
    // Inner dark
    this.add.rectangle(x + 1 + (w - 2) / 2, y + 1, w - 2, 1, 0x404040).setOrigin(0.5, 0);
    this.add.rectangle(x + 1, y + 1 + (h - 2) / 2, 1, h - 2, 0x404040).setOrigin(0, 0.5);
    // Light bottom-right edges
    this.add.rectangle(x + w / 2, y + h, w, 1, 0xdfdfdf).setOrigin(0.5, 1);
    this.add.rectangle(x + w, y + h / 2, 1, h, 0xdfdfdf).setOrigin(1, 0.5);
    // Inner light
    this.add.rectangle(x + 1 + (w - 2) / 2, y + h - 1, w - 2, 1, 0xffffff).setOrigin(0.5, 1);
    this.add.rectangle(x + w - 1, y + 1 + (h - 2) / 2, 1, h - 2, 0xffffff).setOrigin(1, 0.5);
  }

  // ===========================================================================
  // UPDATE HANDLERS
  // ===========================================================================

  updateHealth(health) {
    this.currentHealth = health;
    for (var i = 0; i < this.hearts.length; i++) {
      var isFilled = i < health;
      this.hearts[i].filled.setVisible(isFilled);
      this.hearts[i].empty.setVisible(!isFilled);
    }

    // Flash effect when health drops
    if (health < this.maxHealth) {
      var cam = this.cameras.main;
      cam.flash(150, 255, 0, 0, false);
    }
  }

  updateScore(score) {
    this.currentScore = score;
    var display = String(score).padStart(4, '0');
    this.scoreText.setText(display);
    this.scoreGlow.setText(display);

    // Brief scale-pop animation on score change
    this.tweens.add({
      targets: this.scoreText,
      scaleX: 1.3,
      scaleY: 1.3,
      duration: 80,
      yoyo: true,
      ease: 'Quad.easeOut'
    });
  }

  updateItems(count) {
    this.currentItems = count;
    this.itemText.setText('FOOD: ' + count + '/5');

    if (count >= 5) {
      this.itemCheck.setVisible(true);
      this.itemText.setColor('#00ff00');
    } else {
      this.itemCheck.setVisible(false);
      this.itemText.setColor('#ffcc00');
    }
  }

  updatePhase(phase) {
    this.currentPhase = phase;
    var name = this._phaseNames[phase] || ('PHASE: ' + phase.toUpperCase());
    this.phaseText.setText(name);

    // Show item counter only during eat phase (or later)
    var showItems = (phase === 'eat' || phase === 'combat' || phase === 'puzzle' || phase === 'complete');
    this.itemPanel.setVisible(showItems);

    // Update dot color per phase
    var dotColors = {
      movement: 0x00ff00,
      jump: 0x44aaff,
      eat: 0xffcc00,
      combat: 0xff4444,
      puzzle: 0xaa44ff,
      complete: 0xffd700
    };
    this.phaseDot.setFillStyle(dotColors[phase] || 0x00ff00);

    // Brief flash on phase change
    this.tweens.add({
      targets: this.phaseText,
      alpha: 0,
      duration: 100,
      yoyo: true,
      repeat: 1,
      ease: 'Stepped'
    });
  }

  _onPlayerDied() {
    // Flash the screen red and shake
    var cam = this.cameras.main;
    cam.flash(400, 255, 0, 0, false);
  }

  // ===========================================================================
  // CLEANUP
  // ===========================================================================

  _cleanup() {
    var tutorial = this.scene.get('TutorialScene');
    if (tutorial) {
      tutorial.events.off('healthChanged', this.updateHealth, this);
      tutorial.events.off('scoreChanged', this.updateScore, this);
      tutorial.events.off('itemsChanged', this.updateItems, this);
      tutorial.events.off('phaseChanged', this.updatePhase, this);
      tutorial.events.off('playerDied', this._onPlayerDied, this);
    }
  }
}
