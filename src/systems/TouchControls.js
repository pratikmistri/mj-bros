import VirtualInput from './VirtualInput.js';

const isTouchDevice = () => 'ontouchstart' in window || navigator.maxTouchPoints > 0;

export class TouchControls {
  constructor() {
    this.overlay = null;
    this.styleEl = null;
    this._onResize = null;
  }

  init() {
    if (!isTouchDevice()) return;

    this._injectStyles();
    this._buildOverlay();
    this._updateOrientation();
    this._onResize = () => this._updateOrientation();
    window.addEventListener('resize', this._onResize);
  }

  _injectStyles() {
    this.styleEl = document.createElement('style');
    this.styleEl.textContent = `
      #touch-overlay {
        position: fixed; top: 0; left: 0; width: 100%; height: 100%;
        z-index: 1000; pointer-events: none;
        user-select: none; -webkit-user-select: none;
      }
      .touch-group {
        position: absolute; bottom: 3vmin; display: flex; gap: 2vmin;
        pointer-events: all;
      }
      .touch-group.left { left: 3vmin; align-items: flex-end; }
      .touch-group.right { right: 3vmin; align-items: flex-end; }
      .touch-btn {
        width: 14vmin; height: 14vmin; border-radius: 50%;
        background: rgba(255,255,255,0.25); border: 2px solid rgba(255,255,255,0.5);
        display: flex; align-items: center; justify-content: center;
        font-size: 5vmin; color: rgba(255,255,255,0.85);
        font-family: Arial, sans-serif; font-weight: bold;
        touch-action: none; -webkit-tap-highlight-color: transparent;
        transition: background 0.08s;
      }
      .touch-btn.active {
        background: rgba(255,255,255,0.55);
      }
      .right-btns-top { display: flex; gap: 2vmin; margin-bottom: 2vmin; }
    `;
    document.head.appendChild(this.styleEl);
  }

  _buildOverlay() {
    this.overlay = document.createElement('div');
    this.overlay.id = 'touch-overlay';

    // Left group: directional arrows
    const leftGroup = document.createElement('div');
    leftGroup.className = 'touch-group left';
    leftGroup.appendChild(this._makeButton('◀', 'left', 'held'));
    leftGroup.appendChild(this._makeButton('▶', 'right', 'held'));

    // Right group: action buttons in triangle layout
    const rightGroup = document.createElement('div');
    rightGroup.className = 'touch-group right';
    rightGroup.style.flexDirection = 'column';
    rightGroup.style.alignItems = 'center';

    const topRow = document.createElement('div');
    topRow.className = 'right-btns-top';
    topRow.appendChild(this._makeButton('B', 'moonwalk', 'latch'));
    topRow.appendChild(this._makeButton('C', 'throwHat', 'latch'));

    const bottomRow = document.createElement('div');
    bottomRow.style.display = 'flex';
    bottomRow.style.justifyContent = 'center';
    bottomRow.appendChild(this._makeButton('A', 'jump', 'held'));

    rightGroup.appendChild(topRow);
    rightGroup.appendChild(bottomRow);

    this.overlay.appendChild(leftGroup);
    this.overlay.appendChild(rightGroup);
    document.body.appendChild(this.overlay);
  }

  _svgTriangle(direction) {
    const rotations = { left: '270', right: '90' };
    const rotate = rotations[direction] || '0';
    return `<svg width="40%" height="40%" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style="transform:rotate(${rotate}deg)"><polygon points="12,4 22,20 2,20" fill="rgba(255,255,255,0.85)"/></svg>`;
  }

  _makeButton(label, inputKey, mode) {
    const btn = document.createElement('div');
    btn.className = 'touch-btn';
    if (label === '◀' || label === '▶') {
      btn.innerHTML = this._svgTriangle(label === '◀' ? 'left' : 'right');
    } else {
      btn.textContent = label;
    }

    const setActive = (active) => {
      if (active) btn.classList.add('active');
      else btn.classList.remove('active');
    };

    if (mode === 'held') {
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        VirtualInput[inputKey] = true;
        setActive(true);
      }, { passive: false });
      btn.addEventListener('touchend', (e) => {
        e.preventDefault();
        VirtualInput[inputKey] = false;
        setActive(false);
      }, { passive: false });
      btn.addEventListener('touchcancel', (e) => {
        e.preventDefault();
        VirtualInput[inputKey] = false;
        setActive(false);
      }, { passive: false });
    } else {
      // latch: set true on touchstart, Player.js consumes it
      btn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        VirtualInput[inputKey] = true;
        setActive(true);
        setTimeout(() => setActive(false), 150);
      }, { passive: false });
    }

    return btn;
  }

  _updateOrientation() {
    if (!this.overlay) return;
    const landscape = window.innerWidth > window.innerHeight;
    this.overlay.classList.toggle('landscape', landscape);
    this.overlay.classList.toggle('portrait', !landscape);
  }

  destroy() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.styleEl) {
      this.styleEl.remove();
      this.styleEl = null;
    }
    if (this._onResize) {
      window.removeEventListener('resize', this._onResize);
      this._onResize = null;
    }
    // Reset all flags
    VirtualInput.left = false;
    VirtualInput.right = false;
    VirtualInput.jump = false;
    VirtualInput.moonwalk = false;
    VirtualInput.throwHat = false;
  }
}
