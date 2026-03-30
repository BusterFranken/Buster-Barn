// =============================================================================
// CombatSystem.js - Attack hitboxes, damage, invincibility frames
// =============================================================================

class CombatSystem {
  constructor(scene) {
    this.scene = scene;
    this.isAttacking = false;
    this.attackHitbox = null;
    this.invincible = false;
    this.invincibleTimer = null;
  }

  /**
   * Perform a melee attack by creating a temporary hitbox in front of the player.
   * @param {Phaser.GameObjects.Sprite} player - The player sprite.
   * @param {boolean} facingRight - True if the player faces right.
   * @returns {Phaser.GameObjects.Rectangle|null} The hitbox, or null if already attacking.
   */
  attack(player, facingRight) {
    if (this.isAttacking) return null;
    this.isAttacking = true;

    // Create a temporary physics body in front of the player
    var hitboxX = facingRight ? player.x + 24 : player.x - 24;
    this.attackHitbox = this.scene.add.rectangle(hitboxX, player.y, 24, 20);
    this.scene.physics.add.existing(this.attackHitbox);
    this.attackHitbox.body.setAllowGravity(false);

    // Play attack sound
    if (this.scene.game && this.scene.game.soundSystem) {
      this.scene.game.soundSystem.play('attack');
    } else if (typeof soundSystem !== 'undefined') {
      soundSystem.play('attack');
    }

    // Destroy hitbox after 200ms
    var self = this;
    this.scene.time.delayedCall(200, function () {
      if (self.attackHitbox) {
        self.attackHitbox.destroy();
        self.attackHitbox = null;
      }
      self.isAttacking = false;
    });

    return this.attackHitbox;
  }

  /**
   * Apply damage to the player.
   * @param {Phaser.GameObjects.Sprite} player - The player sprite.
   * @param {number} knockbackDirection - -1 for left, 1 for right.
   * @returns {boolean} True if damage was applied, false if invincible.
   */
  takeDamage(player, knockbackDirection) {
    if (this.invincible) return false;

    GameState.player.health--;
    this.invincible = true;

    // Knockback
    player.setVelocityX(knockbackDirection * 200);
    player.setVelocityY(-200);

    // Play hurt sound
    if (this.scene.game && this.scene.game.soundSystem) {
      this.scene.game.soundSystem.play('hurt');
    } else if (typeof soundSystem !== 'undefined') {
      soundSystem.play('hurt');
    }

    // Flash effect (alpha oscillation for ~1.5s)
    this.scene.tweens.add({
      targets: player,
      alpha: { from: 0.2, to: 1 },
      duration: 100,
      repeat: 7,
      yoyo: true,
      onComplete: function () {
        player.setAlpha(1);
        this.invincible = false;
      },
      callbackScope: this
    });

    // Emit event for HUD
    this.scene.events.emit('healthChanged', GameState.player.health);

    // Check death
    if (GameState.player.health <= 0) {
      this.scene.events.emit('playerDied');
    }

    return true;
  }

  /**
   * Apply damage to an enemy.
   * @param {Phaser.GameObjects.Sprite} enemy - The enemy sprite (must have an `hp` property).
   * @param {number} damage - Amount of damage.
   * @returns {boolean} True if the enemy was killed.
   */
  damageEnemy(enemy, damage) {
    enemy.hp -= damage;

    // Flash white
    enemy.setTint(0xffffff);
    var scene = this.scene;
    scene.time.delayedCall(100, function () {
      if (enemy.active) enemy.clearTint();
    });

    if (enemy.hp <= 0) {
      this.killEnemy(enemy);
      return true;
    }
    return false;
  }

  /**
   * Handle enemy death: play effects, spawn rewards, clean up.
   * @param {Phaser.GameObjects.Sprite} enemy
   */
  killEnemy(enemy) {
    if (typeof GameState !== 'undefined') {
      GameState.tutorial.enemiesDefeated++;
    }
    this.scene.events.emit('enemyDefeated', enemy);

    // Play hit sound
    if (this.scene.game && this.scene.game.soundSystem) {
      this.scene.game.soundSystem.play('hitEnemy');
    } else if (typeof soundSystem !== 'undefined') {
      soundSystem.play('hitEnemy');
    }

    // Spawn coin at enemy position
    this.scene.events.emit('spawnCoin', enemy.x, enemy.y);

    // Death animation - flash and float up
    this.scene.tweens.add({
      targets: enemy,
      alpha: 0,
      y: enemy.y - 20,
      duration: 300,
      onComplete: function () {
        enemy.destroy();
      }
    });
  }

  /**
   * Clean up any active hitboxes and timers.
   */
  destroy() {
    if (this.attackHitbox) {
      this.attackHitbox.destroy();
      this.attackHitbox = null;
    }
    this.isAttacking = false;
    this.invincible = false;
  }
}
