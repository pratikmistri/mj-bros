import { PLAYER } from '../config/constants.js';
import { AssetGenerator } from '../systems/AssetGenerator.js';
import { createAnimations } from '../config/animations.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Loading bar
    const width = this.cameras.main.width;
    const height = this.cameras.main.height;
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(width / 2 - 160, height / 2 - 15, 320, 30);

    this.load.on('progress', (value) => {
      progressBar.clear();
      progressBar.fillStyle(0xffd700, 1);
      progressBar.fillRect(width / 2 - 155, height / 2 - 10, 310 * value, 20);
    });

    const loadingText = this.add.text(width / 2, height / 2 - 40, 'Loading...', {
      fontSize: '20px',
      fill: '#ffffff'
    }).setOrigin(0.5);

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load MJ sprite sheets
    this.load.spritesheet('mj', 'mj sprite.png', {
      frameWidth: PLAYER.FRAME_WIDTH,
      frameHeight: PLAYER.FRAME_HEIGHT
    });
    this.load.spritesheet('mj-walk-sheet', 'MJ walk sprite.png', {
      frameWidth: PLAYER.FRAME_WIDTH,
      frameHeight: PLAYER.FRAME_HEIGHT
    });
    this.load.spritesheet('mj-throw-sheet', 'mj disc throw.png', {
      frameWidth: PLAYER.FRAME_WIDTH,
      frameHeight: PLAYER.FRAME_HEIGHT
    });
    this.load.spritesheet('mj-idle-dance-sheet', 'mj idle dance.png', {
      frameWidth: PLAYER.FRAME_WIDTH,
      frameHeight: PLAYER.FRAME_HEIGHT
    });
    this.load.spritesheet('mj-moonwalk-sheet', 'moonwalk.png', {
      frameWidth: PLAYER.FRAME_WIDTH,
      frameHeight: PLAYER.FRAME_HEIGHT
    });
  }

  create() {
    // Generate all programmatic assets
    const assetGen = new AssetGenerator(this);
    assetGen.generateAll();

    // Create all animations
    createAnimations(this);

    // Move to menu
    this.scene.start('MenuScene');
  }
}
