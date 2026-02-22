import { GAME, COLORS } from '../config/constants.js';

export class GameOverScene extends Phaser.Scene {
  constructor() {
    super('GameOverScene');
  }

  create(data) {
    const victory = data.victory || false;
    const score = data.score || 0;

    // Audio
    const sfx = this.game.soundManager;
    if (sfx) {
      sfx.stopMusic();
      sfx.stopInvincibility();
      if (victory) {
        sfx.playVictory();
      } else {
        sfx.playGameOver();
      }
    }

    // Background
    this.add.image(GAME.WIDTH / 2, GAME.HEIGHT / 2, 'bg-sky');

    // Result text
    const title = victory ? 'VICTORY!' : 'GAME OVER';
    const titleColor = victory ? COLORS.GOLD : '#ff4444';

    this.add.text(GAME.WIDTH / 2, 140, title, {
      fontSize: '64px',
      fontFamily: 'Arial Black, Impact, sans-serif',
      fill: titleColor,
      stroke: '#334',
      strokeThickness: 6
    }).setOrigin(0.5);

    if (victory) {
      this.add.text(GAME.WIDTH / 2, 220, 'The King of Pop saves the day!', {
        fontSize: '20px',
        fontFamily: 'Arial, sans-serif',
        fill: '#333333',
        stroke: '#fff',
        strokeThickness: 2
      }).setOrigin(0.5);
    }

    // Score
    this.add.text(GAME.WIDTH / 2, 300, `Final Score: ${score}`, {
      fontSize: '36px',
      fontFamily: 'Arial, sans-serif',
      fill: COLORS.GOLD,
      stroke: '#334',
      strokeThickness: 4
    }).setOrigin(0.5);

    // MJ sprite
    const frame = victory ? 2 : 0;
    const mj = this.add.sprite(GAME.WIDTH / 2, 420, 'mj', frame).setScale(0.2);
    if (victory) {
      this.tweens.add({
        targets: mj,
        angle: 360,
        duration: 2000,
        repeat: -1
      });
    }

    // Restart instruction
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const restartText = this.add.text(GAME.WIDTH / 2, 520, isTouch ? 'Tap to Play Again' : 'Press SPACE to Play Again', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      fill: '#222222',
      stroke: '#fff',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: restartText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    const restart = () => this.scene.start('MenuScene');
    this.input.keyboard.once('keydown-SPACE', restart);
    this.input.once('pointerdown', restart);
  }
}
