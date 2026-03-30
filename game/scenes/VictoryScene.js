// =============================================================================
// VictoryScene.js - End-of-tutorial stats and celebration for MOO-QUEST
// Shows a Win95 dialog with animated stats, rank reveal, confetti particles,
// and a return button. Played after the player reaches the flag.
// =============================================================================

class VictoryScene extends Phaser.Scene {
  constructor() {
    super({ key: 'VictoryScene', active: false });
  }

  create() {
    // Play victory sound
    if (this.game.soundSystem) {
      this.game.soundSystem.play('victory');
    }

    // Finalize time in GameState
    if (GameState.tutorial.startTime > 0) {
      GameState.tutorial.totalTime = Date.now() - GameState.tutorial.startTime;
    }

    // Pull stats from GameState
    var totalTime = GameState.tutorial.totalTime;
    var finalScore = GameState.player.score;
    var itemsEaten = GameState.tutorial.itemsEaten;
    var enemiesDefeated = GameState.tutorial.enemiesDefeated;

    // Format time
    var totalSeconds = Math.floor(totalTime / 1000);
    var mins = Math.floor(totalSeconds / 60);
    var secs = totalSeconds % 60;
    var timeStr = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

    // Calculate rank
    var rank = 'C';
    if (finalScore >= 1500) rank = 'S';
    else if (finalScore >= 1000) rank = 'A';
    else if (finalScore >= 500) rank = 'B';

    var rankTitles = {
      S: 'MOO-VELOUS!',
      A: 'UDDERLY GREAT!',
      B: 'NOT BAAD!',
      C: 'KEEP TRYING!'
    };

    var rankColors = {
      S: '#ffd700',
      A: '#44ff44',
      B: '#44aaff',
      C: '#aaaaaa'
    };

    // === BACKGROUND: teal desktop ===
    this.add.rectangle(400, 304, 800, 608, 0x008080);

    // === CONFETTI PARTICLES ===
    this._createConfetti();

    // === WIN95 DIALOG ===
    var dialogW = 440;
    var dialogH = 440;
    var dx = 400 - dialogW / 2;
    var dy = 304 - dialogH / 2;

    this._buildDialog(dx, dy, dialogW, dialogH);
    this._buildTitleBar(dx, dy, dialogW, 'QUEST COMPLETE!');

    // === DIALOG BODY ===
    var bodyTop = dy + 28;
    var bodyCx = 400;

    // --- Header text ---
    var headerText = this.add.text(bodyCx, bodyTop + 16, 'TUTORIAL COMPLETE!', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '22px',
      fontStyle: 'bold',
      color: '#000080'
    }).setOrigin(0.5, 0);

    // Pulse the header
    this.tweens.add({
      targets: headerText,
      scaleX: 1.05,
      scaleY: 1.05,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // --- Cow sprite ---
    var cowY = bodyTop + 60;
    if (this.textures.exists('violet')) {
      var cow = this.add.sprite(bodyCx, cowY, 'violet', 0).setScale(2);
      cow.play('violet_idle');
    } else {
      // Fallback: draw a simple cow icon
      var cowGfx = this.add.graphics();
      cowGfx.fillStyle(0x800080, 1);
      cowGfx.fillCircle(bodyCx, cowY, 16);
      cowGfx.fillStyle(0xffffff, 1);
      cowGfx.fillCircle(bodyCx - 5, cowY - 4, 3);
      cowGfx.fillCircle(bodyCx + 5, cowY - 4, 3);
    }

    // --- Stats panel (sunken) ---
    var statsX = dx + 30;
    var statsY = bodyTop + 98;
    var statsW = dialogW - 60;
    var statsH = 130;

    this._drawSunkenRect(statsX, statsY, statsW, statsH);
    this.add.rectangle(statsX + statsW / 2, statsY + statsH / 2, statsW - 4, statsH - 4, 0xffffff);

    // Stats entries - these will animate (count up from 0)
    var statLeft = statsX + 16;
    var statRight = statsX + statsW - 16;
    var lineH = 28;
    var startY = statsY + 18;

    // Labels (static)
    var labelStyle = {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#000000'
    };
    var valueStyle = {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: '#000080'
    };

    // Row: Time
    this.add.text(statLeft, startY, 'TIME:', labelStyle);
    var timeValText = this.add.text(statRight, startY, '00:00', valueStyle).setOrigin(1, 0);

    // Row: Score
    this.add.text(statLeft, startY + lineH, 'SCORE:', labelStyle);
    var scoreValText = this.add.text(statRight, startY + lineH, '0000', valueStyle).setOrigin(1, 0);

    // Row: Food eaten
    this.add.text(statLeft, startY + lineH * 2, 'FOOD EATEN:', labelStyle);
    var foodValText = this.add.text(statRight, startY + lineH * 2, '0', valueStyle).setOrigin(1, 0);

    // Row: Enemies defeated
    this.add.text(statLeft, startY + lineH * 3, 'ENEMIES:', labelStyle);
    var enemyValText = this.add.text(statRight, startY + lineH * 3, '0', valueStyle).setOrigin(1, 0);

    // Separator dots between labels and values
    for (var row = 0; row < 4; row++) {
      var dotsY = startY + lineH * row + 12;
      var dotsGfx = this.add.graphics();
      dotsGfx.fillStyle(0xcccccc, 1);
      for (var dot = 0; dot < 20; dot++) {
        dotsGfx.fillRect(statLeft + 120 + dot * 8, dotsY, 2, 1);
      }
    }

    // --- Rank area (below stats, revealed with delay) ---
    var rankY = statsY + statsH + 16;

    var rankLabel = this.add.text(bodyCx, rankY, 'RANK', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '12px',
      color: '#808080'
    }).setOrigin(0.5, 0).setAlpha(0);

    var rankLetter = this.add.text(bodyCx, rankY + 18, rank, {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '42px',
      fontStyle: 'bold',
      color: rankColors[rank],
      stroke: '#000000',
      strokeThickness: 2
    }).setOrigin(0.5, 0).setAlpha(0).setScale(0.1);

    var rankTitle = this.add.text(bodyCx, rankY + 64, rankTitles[rank], {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '14px',
      fontStyle: 'bold',
      color: rankColors[rank]
    }).setOrigin(0.5, 0).setAlpha(0);

    // --- Return button (below rank) ---
    var btnW = 280;
    var btnH = 34;
    var btnX = bodyCx - btnW / 2;
    var btnY = rankY + 88;

    this._buildReturnButton(btnX, btnY, btnW, btnH);

    // ===========================================================================
    // STAT ANIMATIONS — count up from zero with staggered timing
    // ===========================================================================

    var self = this;

    // Time counter (animate seconds)
    this.time.delayedCall(300, function () {
      if (self.game.soundSystem) self.game.soundSystem.play('coin');
      self._animateCounter(timeValText, 0, totalSeconds, 1200, function (val) {
        var m = Math.floor(val / 60);
        var s = val % 60;
        return String(m).padStart(2, '0') + ':' + String(s).padStart(2, '0');
      });
    });

    // Score counter
    this.time.delayedCall(800, function () {
      if (self.game.soundSystem) self.game.soundSystem.play('coin');
      self._animateCounter(scoreValText, 0, finalScore, 1500, function (val) {
        return String(val).padStart(4, '0');
      });
    });

    // Food counter
    this.time.delayedCall(1300, function () {
      if (self.game.soundSystem) self.game.soundSystem.play('eat');
      self._animateCounter(foodValText, 0, itemsEaten, 600, function (val) {
        return String(val);
      });
    });

    // Enemy counter
    this.time.delayedCall(1700, function () {
      if (self.game.soundSystem) self.game.soundSystem.play('hitEnemy');
      self._animateCounter(enemyValText, 0, enemiesDefeated, 600, function (val) {
        return String(val);
      });
    });

    // Rank reveal (dramatic pause)
    this.time.delayedCall(2500, function () {
      // Flash screen
      self.cameras.main.flash(200, 255, 255, 200, false);

      if (self.game.soundSystem) self.game.soundSystem.play('victory');

      // Fade in rank label
      self.tweens.add({
        targets: rankLabel,
        alpha: 1,
        duration: 300
      });

      // Dramatic rank letter zoom-in
      self.tweens.add({
        targets: rankLetter,
        alpha: 1,
        scaleX: 1,
        scaleY: 1,
        duration: 500,
        ease: 'Back.easeOut',
        onComplete: function () {
          // Bounce the letter
          self.tweens.add({
            targets: rankLetter,
            scaleX: 1.1,
            scaleY: 1.1,
            duration: 400,
            yoyo: true,
            repeat: -1,
            ease: 'Sine.easeInOut'
          });
        }
      });

      // Rank title fade in
      self.tweens.add({
        targets: rankTitle,
        alpha: 1,
        duration: 400,
        delay: 400
      });
    });
  }

  // ===========================================================================
  // CONFETTI PARTICLE SYSTEM
  // ===========================================================================

  _createConfetti() {
    // Generate small colored rectangle textures for confetti
    var confettiColors = [0xff4444, 0x44ff44, 0x4444ff, 0xffff44, 0xff44ff, 0x44ffff, 0xffa500, 0xffffff];
    var self = this;

    // Create a small confetti texture if it doesn't exist
    if (!this.textures.exists('confetti_particle')) {
      var gfx = this.make.graphics({ x: 0, y: 0, add: false });
      gfx.fillStyle(0xffffff, 1);
      gfx.fillRect(0, 0, 6, 4);
      gfx.generateTexture('confetti_particle', 6, 4);
      gfx.destroy();
    }

    // Create multiple emitters with different colors for variety
    for (var c = 0; c < confettiColors.length; c++) {
      var emitter = this.add.particles(0, 0, 'confetti_particle', {
        x: { min: 0, max: 800 },
        y: -10,
        lifespan: 4000,
        speedY: { min: 60, max: 160 },
        speedX: { min: -40, max: 40 },
        angle: { min: -15, max: 15 },
        rotate: { min: 0, max: 360 },
        scaleX: { min: 0.5, max: 1.5 },
        scaleY: { min: 0.3, max: 1 },
        tint: confettiColors[c],
        alpha: { start: 1, end: 0.3 },
        frequency: 200,
        quantity: 1,
        gravityY: 30
      });
    }
  }

  // ===========================================================================
  // ANIMATED COUNTER
  // ===========================================================================

  /**
   * Animate a text object counting from startVal to endVal.
   * @param {Phaser.GameObjects.Text} textObj
   * @param {number} startVal
   * @param {number} endVal
   * @param {number} duration - ms
   * @param {function} formatter - (value) => string
   */
  _animateCounter(textObj, startVal, endVal, duration, formatter) {
    var counter = { val: startVal };
    this.tweens.add({
      targets: counter,
      val: endVal,
      duration: duration,
      ease: 'Power2',
      onUpdate: function () {
        textObj.setText(formatter(Math.floor(counter.val)));
      },
      onComplete: function () {
        textObj.setText(formatter(endVal));
      }
    });
  }

  // ===========================================================================
  // WIN95 UI BUILDERS
  // ===========================================================================

  _buildDialog(x, y, w, h) {
    // Outer raised border
    this.add.rectangle(x + w / 2, y, w, 2, 0xdfdfdf).setOrigin(0.5, 0);
    this.add.rectangle(x, y + h / 2, 2, h, 0xdfdfdf).setOrigin(0, 0.5);
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

  _buildTitleBar(dx, dy, dialogW, titleText) {
    var tbH = 22;
    var tbx = dx + 3;
    var tby = dy + 3;
    var tbw = dialogW - 6;

    // Navy blue bar
    this.add.rectangle(tbx + tbw / 2, tby + tbH / 2, tbw, tbH, 0x000080);

    // Gold star icon in title bar
    var starGfx = this.add.graphics();
    starGfx.fillStyle(0xffd700, 1);
    var starCx = tbx + 12;
    var starCy = tby + tbH / 2;
    // Simple 4-point star
    starGfx.fillTriangle(starCx, starCy - 6, starCx - 3, starCy + 2, starCx + 3, starCy + 2);
    starGfx.fillTriangle(starCx, starCy + 6, starCx - 3, starCy - 2, starCx + 3, starCy - 2);
    starGfx.fillCircle(starCx, starCy, 2);

    // Title text
    this.add.text(tbx + 24, tby + 3, titleText, {
      fontFamily: 'Segoe UI, Tahoma, sans-serif',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#ffffff'
    });
  }

  _drawSunkenRect(x, y, w, h) {
    // Dark top-left
    this.add.rectangle(x + w / 2, y, w, 1, 0x808080).setOrigin(0.5, 0);
    this.add.rectangle(x, y + h / 2, 1, h, 0x808080).setOrigin(0, 0.5);
    this.add.rectangle(x + 1 + (w - 2) / 2, y + 1, w - 2, 1, 0x404040).setOrigin(0.5, 0);
    this.add.rectangle(x + 1, y + 1 + (h - 2) / 2, 1, h - 2, 0x404040).setOrigin(0, 0.5);
    // Light bottom-right
    this.add.rectangle(x + w / 2, y + h, w, 1, 0xdfdfdf).setOrigin(0.5, 1);
    this.add.rectangle(x + w, y + h / 2, 1, h, 0xdfdfdf).setOrigin(1, 0.5);
    this.add.rectangle(x + 1 + (w - 2) / 2, y + h - 1, w - 2, 1, 0xffffff).setOrigin(0.5, 1);
    this.add.rectangle(x + w - 1, y + 1 + (h - 2) / 2, 1, h - 2, 0xffffff).setOrigin(1, 0.5);
  }

  _buildReturnButton(x, y, w, h) {
    var self = this;

    // Button face
    var face = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xc0c0c0);

    // Raised border
    this.add.rectangle(x + w / 2, y, w, 1, 0xdfdfdf).setOrigin(0.5, 0);
    this.add.rectangle(x, y + h / 2, 1, h, 0xdfdfdf).setOrigin(0, 0.5);
    this.add.rectangle(x + 1 + (w - 2) / 2, y + 1, w - 2, 1, 0xffffff).setOrigin(0.5, 0);
    this.add.rectangle(x + 1, y + 1 + (h - 2) / 2, 1, h - 2, 0xffffff).setOrigin(0, 0.5);
    this.add.rectangle(x + w / 2, y + h, w, 1, 0x404040).setOrigin(0.5, 1);
    this.add.rectangle(x + w, y + h / 2, 1, h, 0x404040).setOrigin(1, 0.5);
    this.add.rectangle(x + 1 + (w - 2) / 2, y + h - 1, w - 2, 1, 0x808080).setOrigin(0.5, 1);
    this.add.rectangle(x + w - 1, y + 1 + (h - 2) / 2, 1, h - 2, 0x808080).setOrigin(1, 0.5);

    // Focus dotted border (Win95 default button style)
    var focusGfx = this.add.graphics();
    focusGfx.lineStyle(1, 0x000000, 0.5);
    for (var fx = x + 4; fx < x + w - 4; fx += 3) {
      focusGfx.fillStyle(0x000000, 0.5);
      focusGfx.fillRect(fx, y + 3, 1, 1);
      focusGfx.fillRect(fx, y + h - 4, 1, 1);
    }
    for (var fy = y + 4; fy < y + h - 4; fy += 3) {
      focusGfx.fillStyle(0x000000, 0.5);
      focusGfx.fillRect(x + 3, fy, 1, 1);
      focusGfx.fillRect(x + w - 4, fy, 1, 1);
    }

    // Button label
    this.add.text(x + w / 2, y + h / 2, 'RETURN TO WORLD SELECT', {
      fontFamily: '"Courier New", Courier, monospace',
      fontSize: '13px',
      fontStyle: 'bold',
      color: '#006600'
    }).setOrigin(0.5, 0.5);

    // Interactive hit area
    var hitArea = this.add.rectangle(x + w / 2, y + h / 2, w, h, 0xffffff, 0)
      .setInteractive({ useHandCursor: true });

    hitArea.on('pointerover', function () {
      face.setFillStyle(0xd4d4d4);
    });
    hitArea.on('pointerout', function () {
      face.setFillStyle(0xc0c0c0);
    });
    hitArea.on('pointerdown', function () {
      face.setFillStyle(0xa8a8a8);
    });
    hitArea.on('pointerup', function () {
      face.setFillStyle(0xc0c0c0);
      if (self.game.soundSystem) {
        self.game.soundSystem.stopMusic();
        self.game.soundSystem.play('dialog');
      }

      // Capture final score and rank before destroying the game
      var finalScore = GameState.player.score;
      var worldKey = 'tutorial';
      var finalRank = 'C';
      if (finalScore >= 1500) finalRank = 'S';
      else if (finalScore >= 1000) finalRank = 'A';
      else if (finalScore >= 500) finalRank = 'B';

      if (typeof window.returnToMenu === 'function') {
        window.returnToMenu();
      }

      // After returning to menu, prompt for leaderboard entry
      setTimeout(function() {
        if (typeof Leaderboard !== 'undefined' && finalScore > 0) {
          Leaderboard.promptAndSubmit(finalScore, worldKey, finalRank);
        }
      }, 300);
    });
  }
}
