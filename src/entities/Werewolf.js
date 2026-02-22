import { ENEMIES } from '../config/constants.js';

export class Werewolf extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'werewolf', 0);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(ENEMIES.WEREWOLF.SCALE);
    this.body.setSize(ENEMIES.WEREWOLF.WIDTH - 8, ENEMIES.WEREWOLF.HEIGHT - 4);
    this.setBounce(0);
    this.setCollideWorldBounds(false);

    this.hp = ENEMIES.WEREWOLF.HP;
    this.isDead = false;
    this.isLunging = false;
    this.direction = -1;
    this.phase = 1;
    this.lungeCooldown = 0;
    this.shockwaveCooldown = 0;
    this.isHurt = false;

    this.play('werewolf-walk');
  }

  update(player, time, delta) {
    if (this.isDead || !player || player.isDead) return;

    this.lungeCooldown -= delta;
    this.shockwaveCooldown -= delta;

    // Phase check
    if (this.hp <= ENEMIES.WEREWOLF.PHASE2_HP && this.phase === 1) {
      this.phase = 2;
      this.setTint(0xff4444);
      this.scene.cameras.main.shake(300, 0.01);
    }

    const speed = this.phase === 1 ? ENEMIES.WEREWOLF.SPEED : ENEMIES.WEREWOLF.FAST_SPEED;
    const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);

    // Face player
    this.direction = player.x < this.x ? -1 : 1;
    this.setFlipX(this.direction === -1);

    if (this.isLunging) return;

    const onGround = this.body.blocked.down || this.body.touching.down;

    // Lunge attack
    if (distToPlayer < 200 && this.lungeCooldown <= 0 && onGround) {
      this.lunge(player);
      return;
    }

    // Phase 2: Shockwave jump
    if (this.phase === 2 && distToPlayer < 300 && this.shockwaveCooldown <= 0 && onGround) {
      this.jumpShockwave();
      return;
    }

    // Chase player
    this.setVelocityX(speed * this.direction);
    this.play('werewolf-walk', true);
  }

  lunge(player) {
    this.isLunging = true;
    this.lungeCooldown = ENEMIES.WEREWOLF.LUNGE_COOLDOWN;
    this.play('werewolf-lunge', true);

    const dir = player.x < this.x ? -1 : 1;
    this.setVelocityX(dir * ENEMIES.WEREWOLF.LUNGE_SPEED);
    this.setVelocityY(-200);

    this.scene.time.delayedCall(600, () => {
      this.isLunging = false;
    });
  }

  jumpShockwave() {
    this.shockwaveCooldown = ENEMIES.WEREWOLF.SHOCKWAVE_COOLDOWN;
    this.setVelocityY(-350);

    this.scene.time.delayedCall(800, () => {
      if (this.isDead) return;
      // Create shockwaves on landing
      this.createShockwave(-1);
      this.createShockwave(1);
      this.scene.cameras.main.shake(200, 0.008);
    });
  }

  createShockwave(dir) {
    const shockwave = this.scene.physics.add.sprite(this.x, this.y + 20, 'shockwave');
    shockwave.body.setAllowGravity(false);
    shockwave.setVelocityX(dir * ENEMIES.WEREWOLF.SHOCKWAVE_SPEED);
    shockwave.setDepth(5);

    // Collide with player
    this.scene.physics.add.overlap(shockwave, this.scene.player, (sw, player) => {
      player.takeDamage();
      sw.destroy();
    });

    this.scene.time.delayedCall(2000, () => {
      if (shockwave.active) shockwave.destroy();
    });
  }

  takeDamage() {
    if (this.isDead || this.isHurt) return;

    this.hp--;
    this.isHurt = true;
    this.setTint(0xffffff);

    this.scene.time.delayedCall(300, () => {
      this.isHurt = false;
      if (this.phase === 2) {
        this.setTint(0xff4444);
      } else {
        this.clearTint();
      }
    });

    // Knockback
    this.setVelocityY(-150);

    if (this.hp <= 0) {
      this.kill();
    }

    return this.hp <= 0;
  }

  kill() {
    if (this.isDead) return;
    this.isDead = true;
    this.body.enable = false;
    this.setVelocityX(0);

    // Death animation
    this.scene.tweens.add({
      targets: this,
      alpha: 0,
      angle: 720,
      scaleX: 0.1,
      scaleY: 0.1,
      duration: 1000,
      onComplete: () => {
        this.scene.events.emit('bossDefeated');
        this.destroy();
      }
    });

    return ENEMIES.WEREWOLF.SCORE;
  }
}
