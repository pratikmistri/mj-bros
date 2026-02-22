# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MJ Bros is a Mario Bros-style 2D platformer built with **Phaser 3** (loaded via CDN). Michael Jackson is the playable character. The game features Zombie/Thriller-themed enemies and a single level called "Moonwalk Boulevard."

## Running the Game

```bash
npx serve .
# Open http://localhost:3000 in a browser
```

No build step or npm install required. Phaser is loaded via CDN in `index.html`. Source files use native ES modules (`<script type="module">`).

## Architecture

- **Scenes** (`src/scenes/`) — Phaser scene lifecycle: BootScene (asset loading) → MenuScene → GameScene (gameplay) → GameOverScene
- **Entities** (`src/entities/`) — Game objects extending `Phaser.Physics.Arcade.Sprite`: Player, Zombie, Ghost, Werewolf
- **Systems** (`src/systems/`) — Shared services: AssetGenerator (programmatic canvas art), LevelBuilder (data-driven level layout), HUD (score/lives display)
- **Config** (`src/config/`) — Constants (all tunable game values) and animation definitions

## Key Patterns

- All non-MJ visual assets are generated programmatically in `AssetGenerator.js` using Canvas 2D API — there are no external image files for enemies, platforms, or collectibles.
- The level is defined as a data structure in `LevelBuilder.js` (no Tiled/tilemap editor). Platforms, enemies, and collectibles are arrays of `{x, y, type, ...}` objects.
- Player sprite is loaded from `mj sprite.png` (256x512px per frame, 2x4 grid, scaled to 0.15x in-game).
- Phaser Arcade Physics handles gravity, collisions, and movement. Stomp detection uses velocity + position checks in overlap callbacks.

## Controls

Arrow keys = move, Space/Z = jump, X = moonwalk (special move)
