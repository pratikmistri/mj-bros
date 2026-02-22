import { GAME, COLORS } from '../config/constants.js';

export class HUD {
  constructor(scene) {
    this.scene = scene;
    this.container = scene.add.container(0, 0).setScrollFactor(0).setDepth(100);

    const vw = GAME.WIDTH / (GAME.CAMERA_ZOOM || 1);  // ~533
    const vh = GAME.HEIGHT / (GAME.CAMERA_ZOOM || 1);  // ~400

    // Background bar
    const bg = scene.add.rectangle(vw / 2, 14, vw, 28, 0x000000, 0.7);
    this.container.add(bg);

    // Lives display
    this.hearts = [];
    for (let i = 0; i < 3; i++) {
      const heart = scene.add.image(20 + i * 15, 14, 'heart').setScale(0.5);
      this.hearts.push(heart);
      this.container.add(heart);
    }

    // Score display
    this.scoreText = scene.add.text(vw / 2, 14, 'SCORE: 0', {
      fontSize: '12px',
      fontFamily: 'Arial, sans-serif',
      fill: '#ffffff',
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.container.add(this.scoreText);

    // Boss HP bar (hidden initially)
    this.bossBarBg = scene.add.rectangle(vw / 2, 38, 133, 8, 0x333333, 0.8);
    this.bossBarFill = scene.add.rectangle(vw / 2, 38, 133, 8, 0xff0000, 1);
    this.bossBarBg.setOrigin(0.5);
    this.bossBarFill.setOrigin(0.5);
    this.bossLabel = scene.add.text(vw / 2, 38, 'WEREWOLF', {
      fontSize: '7px',
      fontFamily: 'Arial, sans-serif',
      fill: '#ffffff'
    }).setOrigin(0.5);
    this.container.add(this.bossBarBg);
    this.container.add(this.bossBarFill);
    this.container.add(this.bossLabel);
    this.hideBossBar();

    // Moonwalk cooldown indicator
    this.moonwalkText = scene.add.text(vw - 80, 14, '[X] MOONWALK', {
      fontSize: '8px',
      fontFamily: 'Arial, sans-serif',
      fill: COLORS.NEON_PINK,
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.container.add(this.moonwalkText);

    // Hat throw indicator
    this.hatText = scene.add.text(vw - 140, 14, '[C] HAT', {
      fontSize: '8px',
      fontFamily: 'Arial, sans-serif',
      fill: COLORS.NEON_BLUE,
      stroke: '#000',
      strokeThickness: 2
    }).setOrigin(0.5);
    this.container.add(this.hatText);

    // Mute button
    this.muteText = scene.add.text(vw - 20, 14, '[M]', {
      fontSize: '8px',
      fontFamily: 'Arial, sans-serif',
      fill: '#cccccc',
      stroke: '#000',
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
