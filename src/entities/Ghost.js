import { ENEMIES } from '../config/constants.js';

export class Ghost extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'ghost', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(ENEMIES.GHOST.SCALE);
    this.body.setSize((ENEMIES.GHOST.WIDTH - 4) * 2, (ENEMIES.GHOST.HEIGHT - 4) * 2);
    this.body.setAllowGravity(false);
    this.setCollideWorldBounds(false);

    this.isDead = false;
    this.isChasing = false;
    this.homeX = x;
    this.homeY = y;
    this.speed = ENEMIES.GHOST.SPEED;
    this.alpha = 0.85;

    // Float animation
    scene.tweens.add({
      targets: this,
      y: y - 10,
      duration: 1500,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    this.play('ghost-float');
  }

  update(player) {
    if (this.isDead || !player || player.isDead) return;

    const dist = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    if (dist > ENEMIES.GHOST.CHASE_DISTANCE) {
      // Too far, idle
      this.setVelocityX(0);
      this.isChasing = false;
      this.play('ghost-float', true);
      this.alpha = 0.85;
      return;
    }

    // Check if player is facing the ghost
    const ghostIsRight = this.x > player.x;
    const playerFacingGhost = (ghostIsRight && player.facingRight) || (!ghostIsRight && !player.facingRight);

    if (playerFacingGhost && !player.isMoonwalking) {
      // Player facing ghost - hide/stop
      this.isChasing = false;
      this.setVelocityX(0);
      this.play('ghost-hide', true);
      this.alpha = 0.4;
    } else {
      // Player facing away - CHASE!
      this.isChasing = true;
      const angle = Phaser.Math.Angle.Between(this.x, this.y, player.x, player.y);
      this.setVelocityX(Math.cos(angle) * this.speed);
      this.play('ghost-float', true);
      this.alpha = 0.85;
      this.setFlipX(player.x < this.x);
    }
  }

  kill() {
    if (this.isDead) return;
    this.isDead = true;
    this.body.enable = false;

    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      scale: 0.05,
      duration: 500,
      onComplete: () => this.destroy()
    });

    return ENEMIES.GHOST.SCORE;
  }
}
