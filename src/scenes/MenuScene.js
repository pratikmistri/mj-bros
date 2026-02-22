import { GAME, COLORS } from '../config/constants.js';
import { SoundManager } from '../systems/SoundManager.js';

export class MenuScene extends Phaser.Scene {
  constructor() {
    super('MenuScene');
  }

  create() {
    // Initialize SoundManager singleton
    if (!this.game.soundManager) {
      this.game.soundManager = new SoundManager();
    }
    this.game.soundManager.init();
    // Background
    this.add.image(GAME.WIDTH / 2, GAME.HEIGHT / 2, 'bg-sky');

    // Title
    this.add.text(GAME.WIDTH / 2, 120, 'MJ BROS', {
      fontSize: '72px',
      fontFamily: 'Arial Black, Impact, sans-serif',
      fill: COLORS.GOLD,
      stroke: '#334',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Subtitle
    this.add.text(GAME.WIDTH / 2, 195, 'MOONWALK BOULEVARD', {
      fontSize: '24px',
      fontFamily: 'Arial, sans-serif',
      fill: '#cc00aa',
      stroke: '#334',
      strokeThickness: 3
    }).setOrigin(0.5);

    // MJ preview sprite
    const mj = this.add.sprite(GAME.WIDTH / 2, 340, 'mj', 0).setScale(0.25);
    this.tweens.add({
      targets: mj,
      y: 330,
      duration: 1000,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Start instruction
    const startText = this.add.text(GAME.WIDTH / 2, 480, 'Press SPACE to Start', {
      fontSize: '28px',
      fontFamily: 'Arial, sans-serif',
      fill: '#222222',
      stroke: '#fff',
      strokeThickness: 3
    }).setOrigin(0.5);

    this.tweens.add({
      targets: startText,
      alpha: 0.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });

    // Controls info
    this.add.text(GAME.WIDTH / 2, 540, 'Arrow Keys: Move  |  Space/Z: Jump  |  X: Moonwalk  |  C: Throw Hat  |  M: Mute', {
      fontSize: '14px',
      fontFamily: 'Arial, sans-serif',
      fill: '#556677'
    }).setOrigin(0.5);

    // Input
    this.input.keyboard.once('keydown-SPACE', () => {
      this.game.soundManager.resume();
      this.scene.start('GameScene');
    });
  }
}
