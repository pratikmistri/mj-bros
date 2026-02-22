export function createAnimations(scene) {
  // MJ animations
  scene.anims.create({
    key: 'mj-idle',
    frames: [{ key: 'mj', frame: 0 }],
    frameRate: 1,
    repeat: -1
  });

  scene.anims.create({
    key: 'mj-walk',
    frames: [
      { key: 'mj-walk-sheet', frame: 4 },
      { key: 'mj-walk-sheet', frame: 5 },
      { key: 'mj-walk-sheet', frame: 6 },
      { key: 'mj-walk-sheet', frame: 7 }
    ],
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: 'mj-jump',
    frames: [{ key: 'mj', frame: 6 }],
    frameRate: 1,
    repeat: 0
  });

  scene.anims.create({
    key: 'mj-attack',
    frames: [{ key: 'mj', frame: 2 }],
    frameRate: 1,
    repeat: 0
  });

  scene.anims.create({
    key: 'mj-moonwalk',
    frames: scene.anims.generateFrameNumbers('mj-moonwalk-sheet', { start: 0, end: 6 }),
    frameRate: 10,
    repeat: -1
  });

  scene.anims.create({
    key: 'mj-idle-dance',
    frames: scene.anims.generateFrameNumbers('mj-idle-dance-sheet', { start: 0, end: 7 }),
    frameRate: 8,
    repeat: -1
  });

  // Zombie animations
  scene.anims.create({
    key: 'zombie-walk',
    frames: [
      { key: 'zombie', frame: 0 },
      { key: 'zombie', frame: 1 },
      { key: 'zombie', frame: 2 },
      { key: 'zombie', frame: 3 }
    ],
    frameRate: 6,
    repeat: -1
  });

  scene.anims.create({
    key: 'zombie-squish',
    frames: [{ key: 'zombie', frame: 3 }],
    frameRate: 1,
    repeat: 0
  });

  // Ghost animations
  scene.anims.create({
    key: 'ghost-float',
    frames: [
      { key: 'ghost', frame: 0 },
      { key: 'ghost', frame: 1 }
    ],
    frameRate: 3,
    repeat: -1
  });

  scene.anims.create({
    key: 'ghost-hide',
    frames: [{ key: 'ghost', frame: 1 }],
    frameRate: 1,
    repeat: 0
  });

  // Werewolf animations
  scene.anims.create({
    key: 'werewolf-walk',
    frames: [
      { key: 'werewolf', frame: 0 },
      { key: 'werewolf', frame: 1 },
      { key: 'werewolf', frame: 2 },
      { key: 'werewolf', frame: 3 }
    ],
    frameRate: 8,
    repeat: -1
  });

  scene.anims.create({
    key: 'werewolf-lunge',
    frames: [{ key: 'werewolf', frame: 2 }],
    frameRate: 1,
    repeat: 0
  });

  // MJ throw animation (full windup → release → follow-through)
  scene.anims.create({
    key: 'mj-throw',
    frames: [
      { key: 'mj-throw-sheet', frame: 0 },
      { key: 'mj-throw-sheet', frame: 1 },
      { key: 'mj-throw-sheet', frame: 2 },
      { key: 'mj-throw-sheet', frame: 3 }
    ],
    frameRate: 10,
    repeat: 0
  });

  // Hat spin animation
  scene.anims.create({
    key: 'hat-spin',
    frames: [
      { key: 'hat', frame: 0 },
      { key: 'hat', frame: 1 },
      { key: 'hat', frame: 2 },
      { key: 'hat', frame: 3 }
    ],
    frameRate: 12,
    repeat: -1
  });

  // Collectible animations
  scene.anims.create({
    key: 'note-spin',
    frames: [
      { key: 'note', frame: 0 },
      { key: 'note', frame: 1 },
      { key: 'note', frame: 2 },
      { key: 'note', frame: 3 }
    ],
    frameRate: 8,
    repeat: -1
  });
}
