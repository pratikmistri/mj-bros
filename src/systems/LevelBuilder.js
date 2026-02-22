import { GAME } from '../config/constants.js';

const LEVEL_DATA = {
  // Ground platforms (street level)
  ground: [
    // Section 1: The Street (0-1600)
    { x: 0, y: 568, width: 1500, type: 'street' },
    // Section 2: The Alley (1600-2800) - gap at 1500-1650
    { x: 1650, y: 568, width: 400, type: 'street' },
    { x: 2150, y: 568, width: 650, type: 'street' },
    // Section 3: Neon District (2800-4800) - multiple gaps
    { x: 2900, y: 568, width: 300, type: 'street' },
    { x: 3300, y: 568, width: 400, type: 'street' },
    { x: 3800, y: 568, width: 500, type: 'street' },
    { x: 4400, y: 568, width: 400, type: 'street' },
    // Section 4: The Showdown (4800-6400)
    { x: 4900, y: 568, width: 1500, type: 'arena' }
  ],

  // Elevated platforms
  platforms: [
    // Section 1: Simple platforms to learn jumping
    { x: 400, y: 440, width: 128, type: 'building' },
    { x: 650, y: 380, width: 128, type: 'building' },
    { x: 1000, y: 420, width: 128, type: 'building' },
    { x: 1250, y: 350, width: 128, type: 'building' },

    // Section 2: Fire escape verticals
    { x: 1700, y: 440, width: 96, type: 'fire-escape' },
    { x: 1800, y: 340, width: 96, type: 'fire-escape' },
    { x: 1700, y: 240, width: 96, type: 'fire-escape' },
    { x: 1900, y: 450, width: 96, type: 'fire-escape' },
    { x: 2050, y: 380, width: 96, type: 'fire-escape' },
    { x: 2200, y: 300, width: 128, type: 'building' },
    { x: 2500, y: 420, width: 96, type: 'fire-escape' },
    { x: 2650, y: 340, width: 96, type: 'fire-escape' },

    // Section 3: Complex multi-height
    { x: 2950, y: 420, width: 128, type: 'building' },
    { x: 3100, y: 340, width: 96, type: 'fire-escape' },
    { x: 3250, y: 260, width: 128, type: 'building' },
    { x: 3400, y: 400, width: 96, type: 'fire-escape' },
    { x: 3550, y: 320, width: 128, type: 'building' },
    { x: 3700, y: 240, width: 96, type: 'fire-escape' },
    { x: 3850, y: 180, width: 128, type: 'building' },   // Hidden high platform for star-glove
    { x: 4000, y: 400, width: 128, type: 'building' },
    { x: 4200, y: 340, width: 96, type: 'fire-escape' },
    { x: 4400, y: 420, width: 128, type: 'building' },
    { x: 4600, y: 350, width: 96, type: 'fire-escape' },

    // Stepping stones for accessibility
    { x: 2900, y: 490, width: 96, type: 'fire-escape' },
    { x: 5050, y: 490, width: 96, type: 'fire-escape' },
    { x: 5650, y: 490, width: 96, type: 'fire-escape' },

    // Section 4: Boss arena elevated platforms
    { x: 5100, y: 420, width: 128, type: 'building' },
    { x: 5400, y: 380, width: 128, type: 'building' },
    { x: 5700, y: 420, width: 128, type: 'building' },
    { x: 6000, y: 380, width: 128, type: 'building' }
  ],

  // Enemies
  zombies: [
    // Section 1
    { x: 500, y: 530, patrol: 80 },
    { x: 800, y: 530, patrol: 100 },
    { x: 1100, y: 530, patrol: 60 },
    { x: 1350, y: 530, patrol: 80 },
    // Section 2
    { x: 1750, y: 530, patrol: 60 },
    { x: 2300, y: 530, patrol: 100 },
    { x: 2600, y: 530, patrol: 80 },
    // Section 3
    { x: 3000, y: 530, patrol: 80 },
    { x: 3450, y: 530, patrol: 100 },
    { x: 3900, y: 530, patrol: 80 },
    { x: 4150, y: 530, patrol: 60 },
    { x: 4500, y: 530, patrol: 100 }
  ],

  ghosts: [
    // Section 2 (introduction)
    { x: 2000, y: 320 },
    { x: 2400, y: 280 },
    // Section 3
    { x: 3200, y: 300 },
    { x: 3600, y: 250 },
    { x: 4100, y: 280 },
    { x: 4500, y: 300 }
  ],

  werewolf: { x: 5800, y: 520 },

  // Collectibles
  notes: [
    // Section 1 - trail of notes
    { x: 200, y: 520 }, { x: 250, y: 520 }, { x: 300, y: 520 },
    { x: 420, y: 400 }, { x: 460, y: 400 },
    { x: 670, y: 340 }, { x: 710, y: 340 },
    { x: 850, y: 500 }, { x: 900, y: 480 }, { x: 950, y: 500 },
    { x: 1020, y: 380 }, { x: 1060, y: 380 },
    { x: 1270, y: 310 }, { x: 1310, y: 310 },
    // Section 2
    { x: 1720, y: 400 }, { x: 1760, y: 400 },
    { x: 1820, y: 300 }, { x: 1860, y: 300 },
    { x: 2070, y: 340 }, { x: 2110, y: 340 },
    { x: 2250, y: 260 }, { x: 2290, y: 260 },
    // Section 3
    { x: 3120, y: 300 }, { x: 3160, y: 300 },
    { x: 3270, y: 220 }, { x: 3310, y: 220 },
    { x: 3570, y: 280 }, { x: 3610, y: 280 },
    { x: 4020, y: 360 }, { x: 4060, y: 360 },
    { x: 4220, y: 300 }, { x: 4260, y: 300 },
    // Section 4
    { x: 5120, y: 380 }, { x: 5160, y: 380 },
    { x: 5420, y: 340 }, { x: 5460, y: 340 }
  ],

  gloves: [
    // Rare - placed on hard-to-reach platforms
    { x: 1720, y: 200 },
    { x: 3270, y: 220 },
    { x: 4620, y: 310 }
  ],

  microphones: [
    { x: 2220, y: 260 },   // Section 2 - first power-up
    { x: 4020, y: 360 }    // Section 3
  ],

  starGloves: [
    { x: 3870, y: 140 }    // Hidden on high platform in Section 3
  ],

  // Destructible bricks (hit from below to release notes)
  bricks: [
    { x: 550, y: 350, notes: 5 },
    { x: 1850, y: 250, notes: 8 },
    { x: 2100, y: 300, notes: 5 },
    { x: 3150, y: 270, notes: 6 },
    { x: 3750, y: 260, notes: 8 },
    { x: 5200, y: 340, notes: 5 },
    { x: 5500, y: 300, notes: 8 }
  ],

  // Neon signs (decorative)
  neonSigns: [
    { x: 300, y: 200, text: 'THRILLER', color: '#663388' },
    { x: 1200, y: 180, text: 'BEAT IT', color: '#227788' },
    { x: 2400, y: 160, text: 'MOONWALK', color: '#336655' },
    { x: 3500, y: 200, text: 'BILLIE JEAN', color: '#886622' },
    { x: 4600, y: 180, text: 'BAD', color: '#884433' },
    { x: 5500, y: 200, text: 'THE SHOWDOWN', color: '#663388' }
  ],

  // Boss arena walls (invisible)
  arenaWalls: [
    { x: 4920, y: 400, width: 16, height: 350 },
    { x: 6380, y: 400, width: 16, height: 350 }
  ],

  // Victory zone
  victoryZone: { x: 6300, y: 500, width: 64, height: 100 }
};

export class LevelBuilder {
  constructor(scene) {
    this.scene = scene;
  }

  build() {
    this.createBackgrounds();
    this.createPlatforms();
    this.createBricks();
    this.createNeonSigns();
    return LEVEL_DATA;
  }

  createBackgrounds() {
    // Static sky (doesn't scroll)
    this.scene.add.image(400, 300, 'bg-sky').setScrollFactor(0).setDepth(-10);

    // Parallax building silhouettes
    for (let i = 0; i < 4; i++) {
      this.scene.add.image(800 + i * 1600, 300, 'bg-buildings')
        .setScrollFactor(0.3)
        .setDepth(-5);
    }
  }

  createPlatforms() {
    this.scene.platforms = this.scene.physics.add.staticGroup();

    // Ground platforms
    for (const g of LEVEL_DATA.ground) {
      const textureKey = g.type === 'arena' ? 'platform-arena' : 'platform-street';
      this.createTiledPlatform(g.x, g.y, g.width, 32, textureKey);
    }

    // Elevated platforms
    for (const p of LEVEL_DATA.platforms) {
      const textureKey = `platform-${p.type}`;
      const height = p.type === 'fire-escape' ? 16 : 32;
      this.createTiledPlatform(p.x, p.y, p.width, height, textureKey);
    }

    // Boss arena invisible walls
    for (const wall of LEVEL_DATA.arenaWalls) {
      const w = this.scene.platforms.create(wall.x, wall.y, null);
      w.setVisible(false);
      w.body.setSize(wall.width, wall.height);
      w.refreshBody();
    }
  }

  createTiledPlatform(x, y, totalWidth, height, textureKey) {
    // Get the texture width to tile properly
    const tex = this.scene.textures.get(textureKey);
    const tileWidth = tex.getSourceImage().width;

    let placed = 0;
    while (placed < totalWidth) {
      const plat = this.scene.platforms.create(x + placed + tileWidth / 2, y, textureKey);
      plat.refreshBody();
      placed += tileWidth;
    }
  }

  createBricks() {
    this.scene.bricks = this.scene.physics.add.staticGroup();
    for (const b of LEVEL_DATA.bricks) {
      const brick = this.scene.bricks.create(b.x, b.y, 'platform-brick');
      brick.setData('notes', b.notes);
      brick.refreshBody();
    }
  }

  createNeonSigns() {
    for (const sign of LEVEL_DATA.neonSigns) {
      const text = this.scene.add.text(sign.x, sign.y, sign.text, {
        fontSize: '24px',
        fontFamily: 'Arial Black, Impact, sans-serif',
        fill: sign.color,
        stroke: sign.color,
        strokeThickness: 1
      }).setDepth(-1);

      // Neon flicker effect
      this.scene.tweens.add({
        targets: text,
        alpha: 0.7,
        duration: 500 + Math.random() * 500,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }
  }

  createCollectibles() {
    const scene = this.scene;

    // Musical notes
    scene.notes = scene.physics.add.group({ allowGravity: false });
    for (const n of LEVEL_DATA.notes) {
      const note = scene.notes.create(n.x, n.y, 'note', 0);
      note.play('note-spin');
      note.body.setSize(20, 20);
    }

    // White gloves
    scene.gloveCollectibles = scene.physics.add.group({ allowGravity: false });
    for (const g of LEVEL_DATA.gloves) {
      const glove = scene.gloveCollectibles.create(g.x, g.y, 'glove');
      glove.body.setSize(20, 20);
      scene.tweens.add({
        targets: glove,
        y: g.y - 5,
        duration: 800,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Microphones
    scene.microphoneCollectibles = scene.physics.add.group({ allowGravity: false });
    for (const m of LEVEL_DATA.microphones) {
      const mic = scene.microphoneCollectibles.create(m.x, m.y, 'microphone');
      mic.body.setSize(16, 28);
      scene.tweens.add({
        targets: mic,
        y: m.y - 8,
        duration: 1000,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
    }

    // Star gloves (invincibility)
    scene.starGloveCollectibles = scene.physics.add.group({ allowGravity: false });
    for (const s of LEVEL_DATA.starGloves) {
      const sg = scene.starGloveCollectibles.create(s.x, s.y, 'star-glove');
      sg.body.setSize(24, 24);
      scene.tweens.add({
        targets: sg,
        y: s.y - 10,
        angle: 360,
        duration: 2000,
        yoyo: false,
        repeat: -1,
        ease: 'Linear'
      });
    }
  }

  createEnemies() {
    const scene = this.scene;

    // Zombies
    scene.zombies = [];
    for (const z of LEVEL_DATA.zombies) {
      const { Zombie } = scene.zombieClass;
      const zombie = new Zombie(scene, z.x, z.y, z.patrol);
      scene.zombies.push(zombie);
    }

    // Ghosts
    scene.ghosts = [];
    for (const g of LEVEL_DATA.ghosts) {
      const { Ghost } = scene.ghostClass;
      const ghost = new Ghost(scene, g.x, g.y);
      scene.ghosts.push(ghost);
    }
  }

  getWerewolfSpawn() {
    return LEVEL_DATA.werewolf;
  }

  getVictoryZone() {
    return LEVEL_DATA.victoryZone;
  }
}
