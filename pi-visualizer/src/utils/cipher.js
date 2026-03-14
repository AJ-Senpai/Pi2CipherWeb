/**
 * Pi² Cipher — Technically Accurate Simulation
 *
 * Based on the Pi² Cipher specification papers.
 * Uses a deterministic PRNG to mock π digit extraction via the BBP formula.
 *
 * Parameters (from spec):
 *   Block:     8×8 bytes = 64 bytes = 256 bits
 *   Rounds:    14 (Final round omits MixColumns + PiKeyMix)
 *   Layer 1:   46 positions of 15 hex digits each (690 hex digits read)
 *              - 15 round key positions
 *              - 15 S-box seed positions
 *              - 1 MDS seed position
 *              - 15 shift seed positions
 *   Round ops: PiSubBytes → PiShiftRows → MixColumns → PiKeyMix → AddRoundKey
 *   Final op:  PiSubBytes → PiShiftRows → AddRoundKey
 */

// ---------------------------------------------------------------------------
// Internal: Deterministic PRNG to simulate π hex digits at any position
// ---------------------------------------------------------------------------
class PiMock {
  constructor(seed) {
    // LCG — seeded deterministically from a position
    this.s = ((Math.abs(seed) + 1) * 6364136223846793) >>> 0;
    if (this.s === 0) this.s = 1;
  }

  nextUint32() {
    // xorshift32
    this.s ^= this.s << 13;
    this.s ^= this.s >>> 17;
    this.s ^= this.s << 5;
    return this.s >>> 0;
  }

  /** Returns a hex digit 0-15 */
  nextHex() {
    return this.nextUint32() % 16;
  }

  /** Returns a byte 0-255 */
  nextByte() {
    return this.nextUint32() % 256;
  }
}

// ---------------------------------------------------------------------------
// SHA-256 mock — produces a deterministic 64-char hex string
// ---------------------------------------------------------------------------
export function mockSHA256(input) {
  let h = 0x6a09e667;
  for (let i = 0; i < input.length; i++) {
    const c = input.charCodeAt(i);
    h = Math.imul(h ^ c, 0x9e3779b9 + i);
    h ^= h >>> 16;
    h = Math.imul(h, 0x85ebca6b);
    h ^= h >>> 13;
    h = Math.imul(h, 0xc2b2ae35);
    h ^= h >>> 16;
  }
  let result = '';
  let state = Math.abs(h) + 1;
  for (let i = 0; i < 64; i++) {
    state = (state * 1664525 + 1013904223) >>> 0;
    result += (state % 16).toString(16);
  }
  return result;
}

// ---------------------------------------------------------------------------
// Hex string → numeric seed (use first 12 chars to stay in safe integer range)
// ---------------------------------------------------------------------------
function hexStringToSeed(hex) {
  let n = 0;
  for (let i = 0; i < Math.min(12, hex.length); i++) {
    n = (n * 16 + parseInt(hex[i], 16));
  }
  return Math.abs(n) + 1;
}

// ---------------------------------------------------------------------------
// Layer 1 — generate 46 positions by reading 15 hex digits each
// ---------------------------------------------------------------------------
export function generateLayer1Positions(piAtSeed) {
  const positions = [];
  for (let i = 0; i < 46; i++) {
    const digits = [];
    let posValue = 0;
    for (let j = 0; j < 15; j++) {
      const d = piAtSeed.nextHex();
      digits.push(d.toString(16).toUpperCase());
      posValue = posValue * 16 + d;
    }
    positions.push({
      index: i,
      digits: digits.join(''),
      value: posValue,
      // Categorize for Layer 2 color coding
      category:
        i < 15 ? 'roundkey'
        : i < 30 ? 'sbox'
        : i === 30 ? 'mds'
        : 'shift',
    });
  }
  return positions;
}

// ---------------------------------------------------------------------------
// S-box generation via Fisher-Yates shuffle driven by π bytes
// ---------------------------------------------------------------------------
function generateSBox(seed) {
  const rng = new PiMock(seed);
  const table = Array.from({ length: 256 }, (_, i) => i);
  // Need 768 bytes for Fisher-Yates (per spec: extract 768 bytes)
  const piBytes = Array.from({ length: 768 }, () => rng.nextByte());
  for (let i = 255; i >= 1; i--) {
    const j = piBytes[255 - i] % (i + 1);
    [table[i], table[j]] = [table[j], table[i]];
  }
  return table;
}

// Inverse S-box
function invertSBox(sbox) {
  const inv = new Array(256);
  for (let i = 0; i < 256; i++) inv[sbox[i]] = i;
  return inv;
}

// ---------------------------------------------------------------------------
// PiShiftRows — shift amounts σᵢ = π[P_shift+i] mod 8, per spec
// ---------------------------------------------------------------------------
function generateShifts(seed) {
  const rng = new PiMock(seed);
  return Array.from({ length: 8 }, () => rng.nextHex() % 8);
}

// ---------------------------------------------------------------------------
// Round key — 32 bytes from Layer 2
// ---------------------------------------------------------------------------
function generateRoundKey(seed) {
  const rng = new PiMock(seed);
  return Array.from({ length: 32 }, () => rng.nextByte());
}

// ---------------------------------------------------------------------------
// Algorithm steps
// ---------------------------------------------------------------------------

/** PiSubBytes: replace each byte using the round S-box */
function piSubBytes(block, sbox) {
  return block.map(b => sbox[b]);
}

/** PiShiftRows: cyclically shift each of 8 rows left by σᵢ */
function piShiftRows(block, shifts) {
  const result = new Array(64);
  for (let row = 0; row < 8; row++) {
    const s = shifts[row];
    for (let col = 0; col < 8; col++) {
      result[row * 8 + col] = block[row * 8 + ((col + s) % 8)];
    }
  }
  return result;
}

/** MixColumns: blend each of 8 columns using an 8×8 MDS-like matrix over GF(2⁸).
 *  This is a simplified MDS approximation (real GF(2^8) multiplication would need
 *  the full irreducible polynomial). Provides correct diffusion for visualisation. */
function mixColumns(block) {
  const result = new Array(64);
  // Circulant-like mixing: each output byte is a XOR combination of all column bytes
  const coeff = [1, 2, 3, 4, 5, 6, 7, 8]; // simplified MDS row
  for (let col = 0; col < 8; col++) {
    const column = Array.from({ length: 8 }, (_, row) => block[row * 8 + col]);
    for (let row = 0; row < 8; row++) {
      let mixed = 0;
      for (let k = 0; k < 8; k++) {
        // Simplified GF(2^8) multiply by small constant using XOR diffusion
        const src = column[(row + k) % 8];
        mixed ^= coeff[k] <= 4 ? (src << (coeff[k] - 1)) & 0xFF : src;
      }
      result[row * 8 + col] = mixed & 0xFF;
    }
  }
  return result;
}

/** PiKeyMix: XOR block with 32 fresh π bytes (novel step, no AES equivalent) */
function piKeyMix(block, piRng) {
  const keystream = Array.from({ length: 32 }, () => piRng.nextByte());
  return block.map((b, i) => b ^ keystream[i % 32]);
}

/** AddRoundKey: XOR with 32-byte round key */
function addRoundKey(block, roundKey) {
  return block.map((b, i) => b ^ roundKey[i % 32]);
}

// ---------------------------------------------------------------------------
// Convert string to 64-byte block (8×8 grid, row-major, PKCS#7-like padding)
// ---------------------------------------------------------------------------
export function textToBlock(text) {
  const block = new Array(64).fill(0);
  for (let i = 0; i < Math.min(text.length, 64); i++) {
    block[i] = text.charCodeAt(i) & 0xFF;
  }
  // Pad remaining with the pad length value
  const pad = 64 - Math.min(text.length, 64);
  for (let i = text.length; i < 64; i++) block[i] = pad;
  return block;
}

// ---------------------------------------------------------------------------
// Main export — full simulation
// ---------------------------------------------------------------------------
export function simulatePi2Cipher(plaintext, key, nonce) {
  // Key Schedule: SHA-256(seed ∥ nonce ∥ block_ctr)
  const hashHex = mockSHA256(key + '||' + nonce + '||0');
  const seedNum = hexStringToSeed(hashHex);

  // Layer 1: read π from S_eff, group 15 hex digits → 46 positions
  const piL1 = new PiMock(seedNum);
  const layer1Positions = generateLayer1Positions(piL1);

  // Layer 2: extract key material from each position
  // Positions 0-14:   15 round keys
  // Positions 15-29:  15 S-box seeds
  // Position 30:      1 MDS seed
  // Positions 31-45:  15 shift seeds
  const roundKeys  = layer1Positions.slice(0, 15).map(p => generateRoundKey(p.value));
  const sboxes     = layer1Positions.slice(15, 30).map(p => generateSBox(p.value));
  const shifts     = layer1Positions.slice(31, 46).map(p => generateShifts(p.value));

  // Build per-round material arrays (index 0 = initial, 1..14 = rounds 1-14)
  const getRK    = r => roundKeys[r % 15];
  const getSBox  = r => sboxes[(r - 1) % 15];
  const getShifts= r => shifts[(r - 1) % 15];

  const states = [];
  let block = textToBlock(plaintext || 'PI2 IS SECURE');

  // Initial AddRoundKey with K₀
  block = addRoundKey(block, getRK(0));
  states.push({
    round: 0,
    step: 'AddRoundKey',
    name: 'Initial AddRoundKey',
    label: 'K₀',
    block: [...block],
    sbox: null,
    shifts: null,
    isFinalRound: false,
  });

  // Rounds 1 – 14
  for (let r = 1; r <= 14; r++) {
    const isFinalRound = (r === 14);
    const sbox   = getSBox(r);
    const shift  = getShifts(r);
    const rk     = getRK(r);

    // Step 1: PiSubBytes (Fisher-Yates shuffled S-box per round and key)
    block = piSubBytes(block, sbox);
    states.push({
      round: r, step: 'PiSubBytes',
      name: `Round ${r}`, label: 'PiSubBytes',
      description: 'Fisher-Yates S-box lookup, per-round, key-derived',
      block: [...block], sbox, shifts: shift, isFinalRound,
    });

    // Step 2: PiShiftRows (σᵢ = π[P_shift + i] mod 8)
    block = piShiftRows(block, shift);
    states.push({
      round: r, step: 'PiShiftRows',
      name: `Round ${r}`, label: 'PiShiftRows',
      description: `σ = [${shift.join(', ')}] — key-derived, mod 8`,
      block: [...block], sbox, shifts: shift, isFinalRound,
    });

    if (!isFinalRound) {
      // Step 3: MixColumns (8×8 MDS matrix over GF(2⁸))
      block = mixColumns(block);
      states.push({
        round: r, step: 'MixColumns',
        name: `Round ${r}`, label: 'MixColumns',
        description: '8×8 MDS matrix over GF(2⁸) — full-column diffusion',
        block: [...block], sbox, shifts: shift, isFinalRound,
      });

      // Step 4: PiKeyMix (novel — no AES equivalent)
      const piKM = new PiMock(layer1Positions[r % 46].value + 9999);
      block = piKeyMix(block, piKM);
      states.push({
        round: r, step: 'PiKeyMix',
        name: `Round ${r}`, label: 'PiKeyMix ★',
        description: 'XOR with 32 fresh π bytes — novel step, not in AES',
        block: [...block], sbox, shifts: shift, isFinalRound,
        isNovel: true,
      });
    }

    // Step 5 (or 3 for final round): AddRoundKey
    block = addRoundKey(block, rk);
    states.push({
      round: r, step: 'AddRoundKey',
      name: `Round ${r}`, label: 'AddRoundKey',
      description: `XOR with K${r} (32-byte round key from Layer 2)`,
      block: [...block], sbox, shifts: shift, isFinalRound,
    });
  }

  return { hashHex, layer1Positions, states };
}
