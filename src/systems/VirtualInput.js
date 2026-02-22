// Shared virtual input state — TouchControls writes, Player.js reads
const VirtualInput = {
  left: false,
  right: false,
  jump: false,
  moonwalk: false,   // latch: set true on tap, consumed by Player.js
  throwHat: false     // latch: set true on tap, consumed by Player.js
};

export default VirtualInput;
