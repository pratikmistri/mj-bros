import { ENEMIES } from '../config/constants.js';

export class Zombie extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, patrolDistance = 100) {
    super(scene, x, y, 'zombie', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(ENEMIES.ZOMBIE.SCALE);
    this.body.setSize(ENEMIES.ZOMBIE.WIDTH - 4, ENEMIES.ZOMBIE.HEIGHT - 4);
    this.setBounce(0);
    this.setCollideWorldBounds(false);

    this.startX = x;
    this.patrolDistance = patrolDistance;
    this.speed = ENEMIES.ZOMBIE.SPEED;
    this.direction = 1;
    this.isDead = false;

    this.setVelocityX(this.speed * this.direction);
    this.play('zombie-walk');
  }

  update() {
    if (this.isDead) return;

    // Patrol back and forth
    if (this.x > this.startX + this.patrolDistance) {
      this.direction = -1;
      this.setFlipX(true);
    } else if (this.x < this.startX - this.patrolDistance) {
      this.direction = 1;
      this.setFlipX(false);
    }

    this.setVelocityX(this.speed * this.direction);
  }

  kill() {
    if (this.isDead) return;
    this.isDead = true;
    this.body.enable = false;
    this.setVelocityX(0);
    this.play('zombie-squish');
    this.setScale(ENEMIES.ZOMBIE.SCALE * 1.3, ENEMIES.ZOMBIE.SCALE * 0.3);

    this.scene.time.delayedCall(500, () => {
      this.destroy();
    });

    return ENEMIES.ZOMBIE.SCORE;
  }
}
