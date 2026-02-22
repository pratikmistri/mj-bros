import { GAME, COLORS } from '../config/constants.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(100);

    // Background bar
    const bg = scene.add.rectangle(GAME.WIDTH / 2, 20, GAME.WIDTH, 40, 0xffffff, 0.6);
    this.container.add(bg);

    // Lives display
    this.hearts = [];
    for (let i = 0; i < 3; i++) {
      const heart = scene.add.image(30 + i * 22, 20, 'heart').setScale(1);
      this.hearts.push(heart);
      this.container.add(heart);
    }

    // Score display
    this.scoreText = scene.add.text(GAME.WIDTH / 2, 20, 'SCORE: 0', {
      fontSize: '18px',
      fontFamily: 'Arial, sans-serif',
      fill: '#222222',
      stroke: '#fff',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.container.add(this.scoreText);

    // Boss HP bar (hidden initially)
    this.bossBarBg = scene.add.rectangle(GAME.WIDTH / 2, 55, 200, 12, 0x333333, 0.8);
    this.bossBarFill = scene.add.rectangle(GAME.WIDTH / 2, 55, 200, 12, 0xff0000, 1);
    this.bossBarBg.setOrigin(0.5);
    this.bossBarFill.setOrigin(0.5);
    this.bossLabel = scene.add.text(GAME.WIDTH / 2, 55, 'WEREWOLF', {
      fontSize: '10px',
      fontFamily: 'Arial, sans-serif',
      fill: '#222222'
    }).setOrigin(0.5);
    this.container.add(this.bossBarBg);
    this.container.add(this.bossBarFill);
    this.container.add(this.bossLabel);
    this.hideBossBar();

    // Moonwalk cooldown indicator
    this.moonwalkText = scene.add.text(GAME.WIDTH - 120, 20, '[X] MOONWALK', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      fill: COLORS.NEON_PINK,
      stroke: '#fff',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.container.add(this.moonwalkText);

    // Hat throw indicator
    this.hatText = scene.add.text(GAME.WIDTH - 210, 20, '[C] HAT', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      fill: COLORS.NEON_BLUE,
      stroke: '#fff',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.container.add(this.hatText);

    // Mute button
    this.muteText = scene.add.text(GAME.WIDTH - 30, 20, '[M]', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      fill: '#333333',
      stroke: '#fff',
      strokeThickness: 2
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.muteText.on('pointerdown', () => {
      const sfx = scene.game.soundManager;
      if (sfx) {
        const muted = sfx.toggleMute();
        this.updateMuteState(muted);
      }
    });
    this.container.add(this.muteText);

    // Listen for events
    scene.events.on('scoreChanged', this.updateScore, this);
    scene.events.on('livesChanged', this.updateLives, this);
  }

  updateScore(score) {
    this.scoreText.setText(`SCORE: ${score}`);
  }

  updateLives(lives) {
    for (let i = 0; i < this.hearts.length; i++) {
      this.hearts[i].setAlpha(i < lives ? 1 : 0.2);
    }
  }

  updateMoonwalkCooldown(cooldown) {
    if (cooldown > 0) {
      this.moonwalkText.setAlpha(0.3);
    } else {
      this.moonwalkText.setAlpha(1);
    }
  }

  updateThrowCooldown(hatActive) {
    if (hatActive) {
      this.hatText.setAlpha(0.3);
    } else {
      this.hatText.setAlpha(1);
    }
  }

  showBossBar() {
    this.bossBarBg.setVisible(true);
    this.bossBarFill.setVisible(true);
    this.bossLabel.setVisible(true);
  }

  hideBossBar() {
    this.bossBarBg.setVisible(false);
    this.bossBarFill.setVisible(false);
    this.bossLabel.setVisible(false);
  }

  updateBossHP(current, max) {
    const ratio = Math.max(0, current / max);
    this.bossBarFill.setScale(ratio, 1);
  }

  updateMuteState(muted) {
    if (this.muteText) {
      this.muteText.setText(muted ? '[--]' : '[M]');
    }
  }

  destroy() {
    this.scene.events.off('scoreChanged', this.updateScore, this);
    this.scene.events.off('livesChanged', this.updateLives, this);
    this.container.destroy();
  }
}
