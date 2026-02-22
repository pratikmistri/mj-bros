import { COLORS, ENEMIES, COLLECTIBLES } from '../config/constants.js';

export class AssetGenerator {
  constructor(scene) {
    this.scene = scene;
    this.S = 2;
  }

  scaledCanvas(key, w, h) {
    const tex = this.scene.textures.createCanvas(key, w * this.S, h * this.S);
    const ctx = tex.getContext();
    ctx.scale(this.S, this.S);
    return { tex, ctx };
  }

  generateAll() {
    this.generatePlatforms();
    this.generateBackgrounds();
    this.generateEnemies();
    this.generateCollectibles();
    this.generateHUD();
    this.generateEffects();
    this.generateHat();
  }

  generatePlatforms() {
    const S = this.S;

    // Street platform
    const { tex: street, ctx: sCtx } = this.scaledCanvas('platform-street', 128, 32);
    sCtx.fillStyle = COLORS.STREET_GRAY;
    sCtx.fillRect(0, 0, 128, 32);
    sCtx.fillStyle = '#888888';
    sCtx.fillRect(0, 0, 128, 2);
    sCtx.strokeStyle = '#ffffff';
    sCtx.lineWidth = 2;
    sCtx.setLineDash([12, 8]);
    sCtx.beginPath();
    sCtx.moveTo(0, 16);
    sCtx.lineTo(128, 16);
    sCtx.stroke();
    street.refresh();

    // Building rooftop platform
    const { tex: building, ctx: bCtx } = this.scaledCanvas('platform-building', 128, 32);
    bCtx.fillStyle = COLORS.BUILDING_DARK;
    bCtx.fillRect(0, 0, 128, 32);
    bCtx.fillStyle = '#778899';
    bCtx.fillRect(0, 0, 128, 4);
    // Windows
    for (let i = 0; i < 5; i++) {
      bCtx.fillStyle = Math.random() > 0.5 ? '#99aabb' : '#778899';
      bCtx.fillRect(8 + i * 24, 12, 8, 10);
    }
    building.refresh();

    // Wood platform (replaces fire escape)
    const { tex: fireEscape, ctx: fCtx } = this.scaledCanvas('platform-fire-escape', 96, 16);
    // Base wood color
    fCtx.fillStyle = '#b5651d';
    fCtx.fillRect(0, 0, 96, 16);
    // Wood grain lines
    fCtx.strokeStyle = '#a0581a';
    fCtx.lineWidth = 0.5;
    for (let y = 3; y < 16; y += 4) {
      fCtx.beginPath();
      fCtx.moveTo(0, y + Math.random() * 2);
      fCtx.bezierCurveTo(24, y - 1, 48, y + 1, 72, y - 1);
      fCtx.lineTo(96, y + Math.random() * 2);
      fCtx.stroke();
    }
    // Plank dividers (vertical nails/gaps)
    fCtx.fillStyle = '#8b4513';
    fCtx.fillRect(31, 0, 2, 16);
    fCtx.fillRect(63, 0, 2, 16);
    // Top highlight
    fCtx.fillStyle = 'rgba(255,255,255,0.15)';
    fCtx.fillRect(0, 0, 96, 2);
    // Bottom shadow
    fCtx.fillStyle = 'rgba(0,0,0,0.15)';
    fCtx.fillRect(0, 14, 96, 2);
    fireEscape.refresh();

    // Brick block
    const { tex: brick, ctx: brCtx } = this.scaledCanvas('platform-brick', 64, 32);
    // Base color
    brCtx.fillStyle = '#8B4513';
    brCtx.fillRect(0, 0, 64, 32);
    // Mortar grid
    brCtx.strokeStyle = '#D2B48C';
    brCtx.lineWidth = 1;
    for (let row = 0; row < 4; row++) {
      const ry = row * 8;
      brCtx.beginPath();
      brCtx.moveTo(0, ry);
      brCtx.lineTo(64, ry);
      brCtx.stroke();
      const offset = (row % 2) * 16;
      for (let cx = offset; cx < 64; cx += 32) {
        brCtx.beginPath();
        brCtx.moveTo(cx, ry);
        brCtx.lineTo(cx, ry + 8);
        brCtx.stroke();
      }
    }
    // Top highlight
    brCtx.fillStyle = 'rgba(255,255,255,0.15)';
    brCtx.fillRect(0, 0, 64, 2);
    // Bottom shadow
    brCtx.fillStyle = 'rgba(0,0,0,0.2)';
    brCtx.fillRect(0, 30, 64, 2);
    brick.refresh();

    // Boss arena platform
    const { tex: arena, ctx: aCtx } = this.scaledCanvas('platform-arena', 128, 32);
    aCtx.fillStyle = '#6b4444';
    aCtx.fillRect(0, 0, 128, 32);
    aCtx.fillStyle = '#7b5555';
    aCtx.fillRect(0, 0, 128, 4);
    aCtx.fillStyle = '#88333333';
    aCtx.fillRect(0, 28, 128, 4);
    arena.refresh();
  }

  generateBackgrounds() {
    const S = this.S;

    // Daytime sky
    const { tex: sky, ctx: skyCtx } = this.scaledCanvas('bg-sky', 800, 600);
    const gradient = skyCtx.createLinearGradient(0, 0, 0, 600);
    gradient.addColorStop(0, COLORS.SKY_TOP);
    gradient.addColorStop(1, COLORS.SKY_BOTTOM);
    skyCtx.fillStyle = gradient;
    skyCtx.fillRect(0, 0, 800, 600);
    // Sun
    skyCtx.fillStyle = '#ffdd44';
    skyCtx.beginPath();
    skyCtx.arc(650, 80, 35, 0, Math.PI * 2);
    skyCtx.fill();
    skyCtx.fillStyle = '#ffee88';
    skyCtx.beginPath();
    skyCtx.arc(650, 80, 28, 0, Math.PI * 2);
    skyCtx.fill();
    // Clouds
    skyCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    skyCtx.beginPath();
    skyCtx.ellipse(150, 120, 60, 20, 0, 0, Math.PI * 2);
    skyCtx.fill();
    skyCtx.beginPath();
    skyCtx.ellipse(170, 110, 40, 16, 0, 0, Math.PI * 2);
    skyCtx.fill();
    skyCtx.beginPath();
    skyCtx.ellipse(450, 80, 50, 18, 0, 0, Math.PI * 2);
    skyCtx.fill();
    skyCtx.beginPath();
    skyCtx.ellipse(470, 70, 35, 14, 0, 0, Math.PI * 2);
    skyCtx.fill();
    skyCtx.beginPath();
    skyCtx.ellipse(300, 180, 45, 15, 0, 0, Math.PI * 2);
    skyCtx.fill();
    sky.refresh();

    // Building silhouettes (parallax layer)
    const { tex: buildings, ctx: bgCtx } = this.scaledCanvas('bg-buildings', 1600, 600);
    bgCtx.clearRect(0, 0, 1600, 600);

    const buildingData = [];
    let bx = 0;
    while (bx < 1600) {
      const w = 60 + Math.random() * 100;
      const h = 150 + Math.random() * 250;
      buildingData.push({ x: bx, w, h });
      bx += w + 15 + Math.random() * 30;
    }

    for (const b of buildingData) {
      const gray = 140 + Math.random() * 40;
      bgCtx.fillStyle = `rgb(${gray - 10}, ${gray}, ${gray + 10})`;
      bgCtx.fillRect(b.x, 600 - b.h, b.w, b.h);
      // Windows - reduced density
      for (let wy = 600 - b.h + 15; wy < 580; wy += 24) {
        for (let wx = b.x + 8; wx < b.x + b.w - 8; wx += 24) {
          if (Math.random() > 0.6) {
            const colors = ['#bbccdd', '#ccbbaa', '#aabbbb', '#cccccc'];
            bgCtx.fillStyle = colors[Math.floor(Math.random() * colors.length)];
            bgCtx.fillRect(wx, wy, 8, 10);
          }
        }
      }
    }
    buildings.refresh();
  }

  generateEnemies() {
    const S = this.S;

    // Zombie spritesheet (4 frames, 32x48 each)
    const zw = ENEMIES.ZOMBIE.WIDTH;
    const zh = ENEMIES.ZOMBIE.HEIGHT;
    const { tex: zombie, ctx: zCtx } = this.scaledCanvas('zombie', zw * 4, zh);

    for (let f = 0; f < 4; f++) {
      const ox = f * zw;
      const legOffset = f % 2 === 0 ? 0 : 3;
      // Body
      zCtx.fillStyle = COLORS.ZOMBIE_GREEN;
      zCtx.fillRect(ox + 8, 10, 16, 18);
      // Head
      zCtx.fillStyle = '#5a8a4a';
      zCtx.fillRect(ox + 10, 0, 12, 12);
      // Eyes
      zCtx.fillStyle = '#ff0000';
      zCtx.fillRect(ox + 12, 3, 3, 3);
      zCtx.fillRect(ox + 18, 3, 3, 3);
      // Arms stretched out
      zCtx.fillStyle = COLORS.ZOMBIE_GREEN;
      zCtx.fillRect(ox + 2, 12 + (f % 2) * 2, 8, 4);
      zCtx.fillRect(ox + 22, 14 - (f % 2) * 2, 8, 4);
      // Legs
      zCtx.fillStyle = '#3a5a2a';
      zCtx.fillRect(ox + 10, 28, 5, 20 - legOffset);
      zCtx.fillRect(ox + 17, 28, 5, 20 - (3 - legOffset));
    }
    zombie.refresh();

    for (let f = 0; f < 4; f++) {
      zombie.add(f, 0, f * zw * S, 0, zw * S, zh * S);
    }

    // Ghost spritesheet (2 frames, 32x36 each)
    const gw = ENEMIES.GHOST.WIDTH;
    const gh = ENEMIES.GHOST.HEIGHT;
    const { tex: ghost, ctx: gCtx } = this.scaledCanvas('ghost', gw * 2, gh);

    for (let f = 0; f < 2; f++) {
      const ox = f * gw;
      // Body (translucent blob)
      gCtx.fillStyle = f === 0 ? COLORS.GHOST_WHITE : 'rgba(200, 220, 240, 0.5)';
      gCtx.beginPath();
      gCtx.ellipse(ox + 16, 14, 14, 14, 0, 0, Math.PI * 2);
      gCtx.fill();
      // Wavy bottom
      gCtx.beginPath();
      gCtx.moveTo(ox + 2, 20);
      gCtx.lineTo(ox + 2, 32);
      gCtx.quadraticCurveTo(ox + 10, 26, ox + 16, 32);
      gCtx.quadraticCurveTo(ox + 22, 26, ox + 30, 32);
      gCtx.lineTo(ox + 30, 20);
      gCtx.fill();
      if (f === 0) {
        // Eyes (visible/chasing)
        gCtx.fillStyle = '#000';
        gCtx.fillRect(ox + 10, 10, 5, 6);
        gCtx.fillRect(ox + 19, 10, 5, 6);
        // Mouth
        gCtx.fillRect(ox + 12, 20, 8, 4);
      }
    }
    ghost.refresh();

    for (let f = 0; f < 2; f++) {
      ghost.add(f, 0, f * gw * S, 0, gw * S, gh * S);
    }

    // Werewolf spritesheet (4 frames, 48x56 each)
    const ww = ENEMIES.WEREWOLF.WIDTH;
    const wh = ENEMIES.WEREWOLF.HEIGHT;
    const { tex: werewolf, ctx: wCtx } = this.scaledCanvas('werewolf', ww * 4, wh);

    for (let f = 0; f < 4; f++) {
      const ox = f * ww;
      const legOffset = f % 2 === 0 ? 0 : 4;
      // Body
      wCtx.fillStyle = COLORS.WEREWOLF_BROWN;
      wCtx.fillRect(ox + 12, 14, 24, 22);
      // Head
      wCtx.fillStyle = '#7b5433';
      wCtx.fillRect(ox + 14, 0, 20, 16);
      // Ears
      wCtx.fillStyle = '#8b6443';
      wCtx.beginPath();
      wCtx.moveTo(ox + 14, 4);
      wCtx.lineTo(ox + 10, -2);
      wCtx.lineTo(ox + 18, 2);
      wCtx.fill();
      wCtx.beginPath();
      wCtx.moveTo(ox + 34, 4);
      wCtx.lineTo(ox + 38, -2);
      wCtx.lineTo(ox + 30, 2);
      wCtx.fill();
      // Eyes
      wCtx.fillStyle = '#ffff00';
      wCtx.fillRect(ox + 18, 5, 4, 4);
      wCtx.fillRect(ox + 28, 5, 4, 4);
      // Snout
      wCtx.fillStyle = '#5a3413';
      wCtx.fillRect(ox + 20, 10, 8, 5);
      // Teeth
      wCtx.fillStyle = '#ffffff';
      wCtx.fillRect(ox + 22, 14, 2, 2);
      wCtx.fillRect(ox + 26, 14, 2, 2);
      // Arms
      wCtx.fillStyle = COLORS.WEREWOLF_BROWN;
      wCtx.fillRect(ox + 4, 16 + (f === 2 ? -4 : 0), 10, 6);
      wCtx.fillRect(ox + 34, 18 + (f === 2 ? -4 : 0), 10, 6);
      // Claws
      wCtx.fillStyle = '#ffffff';
      wCtx.fillRect(ox + 2, 16 + (f === 2 ? -4 : 0), 3, 2);
      wCtx.fillRect(ox + 43, 18 + (f === 2 ? -4 : 0), 3, 2);
      // Legs
      wCtx.fillStyle = '#5a3413';
      wCtx.fillRect(ox + 14, 36, 8, 20 - legOffset);
      wCtx.fillRect(ox + 26, 36, 8, 20 - (4 - legOffset));
    }
    werewolf.refresh();

    for (let f = 0; f < 4; f++) {
      werewolf.add(f, 0, f * ww * S, 0, ww * S, wh * S);
    }

    // Shockwave
    const { tex: shock, ctx: shCtx } = this.scaledCanvas('shockwave', 32, 16);
    shCtx.fillStyle = '#ff440088';
    shCtx.beginPath();
    shCtx.ellipse(16, 12, 16, 8, 0, 0, Math.PI * 2);
    shCtx.fill();
    shCtx.fillStyle = '#ff880044';
    shCtx.beginPath();
    shCtx.ellipse(16, 12, 12, 5, 0, 0, Math.PI * 2);
    shCtx.fill();
    shock.refresh();
  }

  generateCollectibles() {
    const S = this.S;

    // Musical note (4 spin frames)
    const nw = COLLECTIBLES.NOTE.WIDTH;
    const nh = COLLECTIBLES.NOTE.HEIGHT;
    const { tex: note, ctx: nCtx } = this.scaledCanvas('note', nw * 4, nh);

    for (let f = 0; f < 4; f++) {
      const ox = f * nw;
      const scaleX = Math.abs(Math.cos(f * Math.PI / 4)) * 0.6 + 0.4;
      const cx = ox + nw / 2;

      nCtx.fillStyle = COLORS.GOLD;
      // Note head
      nCtx.beginPath();
      nCtx.ellipse(cx - 2 * scaleX, 18, 5 * scaleX, 4, 0, 0, Math.PI * 2);
      nCtx.fill();
      // Stem
      nCtx.fillRect(cx + 2 * scaleX, 4, 2 * scaleX, 15);
      // Flag
      nCtx.beginPath();
      nCtx.moveTo(cx + 2 * scaleX + 2 * scaleX, 4);
      nCtx.quadraticCurveTo(cx + 10 * scaleX, 8, cx + 2 * scaleX + 2 * scaleX, 12);
      nCtx.fill();
    }
    note.refresh();

    for (let f = 0; f < 4; f++) {
      note.add(f, 0, f * nw * S, 0, nw * S, nh * S);
    }

    // White glove
    const { tex: glove, ctx: glCtx } = this.scaledCanvas('glove', COLLECTIBLES.GLOVE.WIDTH, COLLECTIBLES.GLOVE.HEIGHT);
    glCtx.fillStyle = '#ffffff';
    glCtx.beginPath();
    glCtx.ellipse(12, 14, 10, 10, 0, 0, Math.PI * 2);
    glCtx.fill();
    // Fingers
    glCtx.fillRect(4, 4, 4, 8);
    glCtx.fillRect(9, 2, 4, 8);
    glCtx.fillRect(14, 2, 4, 8);
    glCtx.fillRect(19, 4, 4, 8);
    // Sparkle
    glCtx.fillStyle = COLORS.GOLD;
    glCtx.fillRect(2, 2, 2, 2);
    glCtx.fillRect(20, 0, 2, 2);
    glove.refresh();

    // Microphone
    const { tex: mic, ctx: mCtx } = this.scaledCanvas('microphone', COLLECTIBLES.MICROPHONE.WIDTH, COLLECTIBLES.MICROPHONE.HEIGHT);
    // Head
    mCtx.fillStyle = '#cccccc';
    mCtx.beginPath();
    mCtx.ellipse(10, 8, 8, 8, 0, 0, Math.PI * 2);
    mCtx.fill();
    // Mesh
    mCtx.strokeStyle = '#999999';
    mCtx.lineWidth = 1;
    for (let y = 2; y < 14; y += 3) {
      mCtx.beginPath();
      mCtx.moveTo(4, y);
      mCtx.lineTo(16, y);
      mCtx.stroke();
    }
    // Handle
    mCtx.fillStyle = '#444444';
    mCtx.fillRect(8, 14, 4, 16);
    mCtx.fillStyle = '#666666';
    mCtx.fillRect(7, 14, 6, 3);
    mic.refresh();

    // Sequined glove (star power-up)
    const { tex: starGlove, ctx: sgCtx } = this.scaledCanvas('star-glove', COLLECTIBLES.STAR_GLOVE.WIDTH, COLLECTIBLES.STAR_GLOVE.HEIGHT);
    // Glove base
    sgCtx.fillStyle = '#ffffff';
    sgCtx.beginPath();
    sgCtx.ellipse(14, 16, 12, 12, 0, 0, Math.PI * 2);
    sgCtx.fill();
    // Sequins (sparkles)
    const sparkleColors = [COLORS.NEON_PINK, COLORS.NEON_BLUE, COLORS.GOLD, COLORS.NEON_GREEN];
    for (let i = 0; i < 12; i++) {
      sgCtx.fillStyle = sparkleColors[i % sparkleColors.length];
      const angle = (i / 12) * Math.PI * 2;
      const r = 6 + Math.random() * 4;
      sgCtx.fillRect(14 + Math.cos(angle) * r - 1, 16 + Math.sin(angle) * r - 1, 3, 3);
    }
    starGlove.refresh();
  }

  generateHat() {
    const S = this.S;

    // Spinning fedora hat (4 frames, 24x24 each)
    const fw = 24;
    const fh = 24;
    const { tex: hat, ctx: hCtx } = this.scaledCanvas('hat', fw * 4, fh);

    for (let f = 0; f < 4; f++) {
      const ox = f * fw;
      const cx = ox + fw / 2;
      const cy = fh / 2;
      const angle = (f / 4) * Math.PI * 2;
      const scaleX = Math.cos(angle);
      const absScale = Math.abs(scaleX) * 0.7 + 0.3;

      // Hat brim
      hCtx.fillStyle = '#1a1a1a';
      hCtx.beginPath();
      hCtx.ellipse(cx, cy + 3, 11 * absScale, 4, 0, 0, Math.PI * 2);
      hCtx.fill();

      // Hat crown
      hCtx.fillStyle = '#222222';
      hCtx.beginPath();
      hCtx.ellipse(cx, cy - 2, 7 * absScale, 6, 0, 0, Math.PI * 2);
      hCtx.fill();

      // Top dent
      hCtx.fillStyle = '#111111';
      hCtx.beginPath();
      hCtx.ellipse(cx, cy - 5, 4 * absScale, 2, 0, 0, Math.PI * 2);
      hCtx.fill();

      // Hat band
      hCtx.fillStyle = '#888888';
      hCtx.fillRect(cx - 7 * absScale, cy, 14 * absScale, 2);
    }
    hat.refresh();

    for (let f = 0; f < 4; f++) {
      hat.add(f, 0, f * fw * S, 0, fw * S, fh * S);
    }
  }

  generateHUD() {
    const S = this.S;

    // Heart
    const { tex: heart, ctx: hCtx } = this.scaledCanvas('heart', 16, 16);
    hCtx.fillStyle = '#ff0000';
    hCtx.beginPath();
    hCtx.moveTo(8, 14);
    hCtx.bezierCurveTo(0, 8, 0, 2, 4, 2);
    hCtx.bezierCurveTo(6, 2, 8, 4, 8, 6);
    hCtx.bezierCurveTo(8, 4, 10, 2, 12, 2);
    hCtx.bezierCurveTo(16, 2, 16, 8, 8, 14);
    hCtx.fill();
    heart.refresh();

    // Note icon for HUD
    const { tex: noteIcon, ctx: niCtx } = this.scaledCanvas('note-icon', 12, 12);
    niCtx.fillStyle = COLORS.GOLD;
    niCtx.beginPath();
    niCtx.ellipse(4, 9, 3, 2.5, 0, 0, Math.PI * 2);
    niCtx.fill();
    niCtx.fillRect(6, 2, 2, 8);
    niCtx.fillRect(6, 2, 5, 2);
    noteIcon.refresh();
  }

  generateEffects() {
    const S = this.S;

    // Sparkle particle
    const { tex: sparkle, ctx: spCtx } = this.scaledCanvas('sparkle', 4, 4);
    spCtx.fillStyle = COLORS.GOLD;
    spCtx.fillRect(0, 0, 4, 4);
    sparkle.refresh();

    // Brick particle for destruction debris
    const { tex: brickParticle, ctx: bpCtx } = this.scaledCanvas('brick-particle', 6, 6);
    bpCtx.fillStyle = '#8B4513';
    bpCtx.fillRect(0, 0, 6, 6);
    bpCtx.fillStyle = '#A0522D';
    bpCtx.fillRect(1, 1, 4, 4);
    brickParticle.refresh();

    // White sparkle for moonwalk
    const { tex: wSparkle, ctx: wsCtx } = this.scaledCanvas('sparkle-white', 4, 4);
    wsCtx.fillStyle = '#ffffff';
    wsCtx.fillRect(1, 0, 2, 4);
    wsCtx.fillRect(0, 1, 4, 2);
    wSparkle.refresh();

    // Stardust particle for jump trail
    const { tex: stardust, ctx: sdCtx } = this.scaledCanvas('stardust', 6, 6);
    sdCtx.fillStyle = '#fffbe6';
    sdCtx.fillRect(2, 0, 2, 6);
    sdCtx.fillRect(0, 2, 6, 2);
    sdCtx.fillStyle = COLORS.GOLD;
    sdCtx.fillRect(2, 2, 2, 2);
    stardust.refresh();
  }
}
