/**
 * Pi² Cipher — Technical Visualizer
 *
 * Scroll-driven cinematic animation of every step of the Pi² Cipher.
 * Minimal text — maximum animation.
 *
 * Phases:
 *   0%–8%:  Phase 0 — Initialize Encryption Parameters
 *   10%–32%: Phase 1 — SHA-256 Key Hardening
 *   33%–55%: Phase 2 — Layer 1: Pi Position Generation (BBP + 15-digit chunks → 46 positions)
 *   56%–68%: Phase 3 — Layer 2: Key Material Extraction (4 color-coded streams)
 *   70%–100%: Phase 4 — 14 Rounds (5 sub-steps each, animated 8×8 matrix)
 */

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import { simulatePi2Cipher } from '../utils/cipher';

// ─── Color palette per step ──────────────────────────────────────────────────
const STEP_COLORS = {
  PiSubBytes:   { bg: 'bg-violet-50',  border: 'border-violet-400', text: 'text-violet-700',  cell: '#8b5cf6' },
  PiShiftRows:  { bg: 'bg-cyan-50',    border: 'border-cyan-400',   text: 'text-cyan-700',    cell: '#06b6d4' },
  MixColumns:   { bg: 'bg-orange-50',  border: 'border-orange-400', text: 'text-orange-700',  cell: '#f97316' },
  PiKeyMix:     { bg: 'bg-yellow-50',  border: 'border-yellow-500', text: 'text-yellow-700',  cell: '#eab308', isNovel: true },
  AddRoundKey:  { bg: 'bg-emerald-50', border: 'border-emerald-400',text: 'text-emerald-700', cell: '#10b981' },
  default:      { bg: 'bg-gray-50',    border: 'border-gray-300',   text: 'text-gray-600',    cell: '#6b7280' },
};

const LAYER1_COLORS = {
  roundkey: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-400', label: 'Round Key' },
  sbox:     { bg: 'bg-violet-100',  text: 'text-violet-800',  border: 'border-violet-400',  label: 'S-box Seed' },
  mds:      { bg: 'bg-orange-100',  text: 'text-orange-800',  border: 'border-orange-400',  label: 'MDS Seed' },
  shift:    { bg: 'bg-cyan-100',    text: 'text-cyan-800',    border: 'border-cyan-400',    label: 'Shift Seed' },
};

// ─── BBP Formula SVG ─────────────────────────────────────────────────────────
function BBPFormula({ className = '' }) {
  return (
    <div className={`font-serif text-black select-none ${className}`}>
      <div className="flex items-center gap-3 text-2xl flex-wrap">
        <span className="italic font-bold text-emerald-700">π</span>
        <span>=</span>
        <div className="flex flex-col items-center text-sm">
          <span>∞</span>
          <span className="text-3xl leading-none">∑</span>
          <span className="border-t border-black px-1">k=0</span>
        </div>
        <div className="flex flex-col items-center text-base">
          <span className="border-b border-black pb-0.5 px-2">1</span>
          <span className="pt-1">16<sup className="text-xs">k</sup></span>
        </div>
        <span className="text-3xl">(</span>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-5 gap-y-3 text-base">
          {[['4','8k+1'],['−2','8k+4'],['−1','8k+5'],['−1','8k+6']].map(([num,den]) => (
            <div key={den} className="flex flex-col items-center">
              <span className="border-b border-black pb-0.5 px-2 font-medium">{num}</span>
              <span className="pt-1 text-sm">{den}</span>
            </div>
          ))}
        </div>
        <span className="text-3xl">)</span>
      </div>
    </div>
  );
}

// ─── Animated Position Formula ────────────────────────────────────────────────
function AnimatedPositionFormula() {
  const [step, setStep] = React.useState(0);
  const steps = [
    {
      label: 'Start at S_eff',
      desc: 'The SHA-256 output becomes the starting address into π',
      formula: <span className="font-mono text-emerald-700 text-lg">address = S<sub>eff</sub></span>,
    },
    {
      label: 'Read 15 hex digits',
      desc: 'For position i, read 15 consecutive hex digits from π',
      formula: <span className="font-mono text-purple-700 text-lg">π[S<sub>eff</sub> + 15i + j] &nbsp; j∈[0,14]</span>,
    },
    {
      label: 'Combine into P_i',
      desc: 'Treat them as a base-16 number — a huge integer up to 16¹⁵',
      formula: (
        <span className="font-mono text-orange-700 text-lg">
          P<sub>i</sub> = Σ π[…+j] · 16<sup>(14−j)</sup>
        </span>
      ),
    },
    {
      label: 'Range: [0, 16¹⁵−1]',
      desc: 'Each position spans ≈ 1.15 × 10¹⁸ — virtually infinite address space in π',
      formula: <span className="font-mono text-emerald-700 text-lg">P<sub>i</sub> ∈ [0, 1.15×10¹⁸]</span>,
    },
  ];

  React.useEffect(() => {
    const id = setInterval(() => setStep(s => (s + 1) % steps.length), 1800);
    return () => clearInterval(id);
  }, []);

  const s = steps[step];
  return (
    <div className="border-l border-emerald-100 pl-6 text-left min-w-[220px]">
      <div className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3">Position formula</div>
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.35 }}
        >
          <div className="text-[10px] font-serif font-black uppercase tracking-widest text-emerald-600 mb-1">Step {step + 1}/4 · {s.label}</div>
          <div className="mb-2">{s.formula}</div>
          <div className="text-[10px] text-gray-500 leading-relaxed">{s.desc}</div>
          <div className="flex gap-1 mt-3">
            {steps.map((_, i) => (
              <div key={i} className={`h-1 flex-1 rounded-full transition-all duration-500 ${i === step ? 'bg-emerald-500' : 'bg-gray-200'}`} />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ScrollVisualizer() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });

  const [plaintext, setPlaintext] = useState('PI2 IS SECURE');
  const [key,       setKey]       = useState('secret_seed_256');
  const [nonce,     setNonce]     = useState('random_nonce_128');

  // Computed cipher state
  const [cipherData, setCipherData] = useState(null);

  useEffect(() => {
    const result = simulatePi2Cipher(plaintext || 'A', key || 'B', nonce || 'C');
    setCipherData(result);
  }, [plaintext, key, nonce]);

  const hashHex        = cipherData?.hashHex        ?? '';
  const layer1Positions= cipherData?.layer1Positions ?? [];
  const states         = cipherData?.states          ?? [];

  // ── Scroll → phase opacities ────────────────────────────────────────────
  const ph0Op = useTransform(scrollYProgress, [0, 0.06, 0.09], [1, 1, 0]);
  const ph1Op = useTransform(scrollYProgress, [0.10, 0.14, 0.30, 0.34], [0, 1, 1, 0]);
  const ph2Op = useTransform(scrollYProgress, [0.34, 0.38, 0.54, 0.57], [0, 1, 1, 0]);
  const ph3Op = useTransform(scrollYProgress, [0.57, 0.61, 0.68, 0.71], [0, 1, 1, 0]);
  const ph4Op = useTransform(scrollYProgress, [0.71, 0.75, 1.0, 1.0],   [0, 1, 1, 1]);

  // Phase 1 — hash card appearance (no horizontal movement to avoid clipping)
  const hashScale = useTransform(scrollYProgress, [0.14, 0.24], [0.8, 1]);
  const hashInfoOp= useTransform(scrollYProgress, [0.22, 0.28], [0, 1]);

  // Phase 2 — BBP fades in, then position pills appear
  const bbpOp   = useTransform(scrollYProgress, [0.36, 0.41], [0, 1]);
  const pillsOp = useTransform(scrollYProgress, [0.43, 0.48], [0, 1]);

  // Phase 4 — map scroll → active state index
  const stateProgress = useTransform(scrollYProgress, [0.75, 0.99], [0, states.length - 1], { clamp: true });
  const [activeIdx, setActiveIdx] = useState(0);
  useEffect(() => {
    const unsub = stateProgress.on('change', v => setActiveIdx(Math.floor(v)));
    return () => unsub();
  }, [stateProgress]);

  const activeState = states[activeIdx] || states[0];

  // Which row is currently shifting (for animation highlight)
  const animRow = activeState?.step === 'PiShiftRows' && activeState?.shifts
    ? (activeIdx % 8) : -1;
  const animCol = activeState?.step === 'MixColumns'
    ? (activeIdx % 8) : -1;

  // ── Layer 2 category stats ──────────────────────────────────────────────
  const l2Categories = useMemo(() => {
    const counts = { roundkey: 0, sbox: 0, mds: 0, shift: 0 };
    layer1Positions.forEach(p => counts[p.category]++);
    return [
      { key: 'roundkey', count: counts.roundkey, label: '15 Round Keys',  sub: '32 bytes each',  ...LAYER1_COLORS.roundkey },
      { key: 'sbox',     count: counts.sbox,     label: '15 S-box Seeds', sub: 'Fisher-Yates, 256-byte permutation', ...LAYER1_COLORS.sbox },
      { key: 'mds',      count: counts.mds,      label: '1 MDS Seed',    sub: '8×8 over GF(2⁸)', ...LAYER1_COLORS.mds },
      { key: 'shift',    count: counts.shift,    label: '15 Shift Seeds', sub: 'σᵢ = π[P+i] mod 8', ...LAYER1_COLORS.shift },
    ];
  }, [layer1Positions]);

  const stepColor = STEP_COLORS[activeState?.step] || STEP_COLORS.default;

  return (
    <div ref={containerRef} className="relative h-[900vh] bg-white font-serif" id="visualizer">

      {/* ── Sticky viewport ─────────────────────────────────────────────── */}
      <div className="sticky top-16 h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden bg-white border-t border-gray-200">

        {/* ════════════════════════════════════════════════════════════════
            PHASE 0 — Initialize Encryption Parameters
        ════════════════════════════════════════════════════════════════ */}
        <motion.div style={{ opacity: ph0Op }} className="absolute inset-0 flex items-center justify-center z-20 px-6">
          <div className="w-full max-w-4xl">
            <div className="text-center mb-8">
              <span className="inline-block px-4 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-gray-100 text-gray-500 border border-gray-200">
                Pi² Cipher · 256-bit Block · 14 Rounds
              </span>
            </div>
            <div className="bg-white border border-gray-200 p-10 rounded-3xl shadow-2xl">
              <h3 className="text-black font-bold mb-8 text-center text-3xl font-serif">
                Initialize Encryption Parameters
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { label: 'Plaintext', value: plaintext, set: setPlaintext, max: 64,  hint: '≤ 64 chars → 8×8 block' },
                  { label: 'Secret Seed',  value: key,       set: setKey,       max: 256, hint: '256-bit key material' },
                  { label: 'Public Nonce', value: nonce,      set: setNonce,     max: 128, hint: 'Prevents keystream reuse' },
                ].map(({ label, value, set, max, hint }) => (
                  <div key={label}>
                    <label className="text-xs font-black text-gray-400 mb-1 block uppercase tracking-widest">{label}</label>
                    <input
                      type="text"
                      value={value}
                      onChange={e => set(e.target.value)}
                      maxLength={max}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-black font-mono text-sm focus:outline-none focus:border-emerald-400 transition-colors shadow-sm"
                    />
                    <p className="text-[10px] text-gray-400 mt-1 font-mono">{hint}</p>
                  </div>
                ))}
              </div>
            </div>
            <p className="text-center mt-6 text-sm text-gray-400 animate-bounce">↓ Scroll to see the cipher in action</p>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════
            PHASE 1 — SHA-256 Key Hardening
            S_eff = SHA-256(seed ∥ nonce ∥ block_ctr)
        ════════════════════════════════════════════════════════════════ */}
        <motion.div style={{ opacity: ph1Op }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
          <div className="w-full max-w-5xl flex flex-col items-center gap-8">

            {/* Formula */}
            <div className="text-center">
              <span className="text-xs font-serif font-black uppercase tracking-widest text-emerald-600">Key Hardening</span>
              <div className="mt-2 font-mono text-lg text-gray-700">
                S<sub>eff</sub> = SHA-256( seed <span className="text-emerald-500">∥</span> nonce <span className="text-emerald-500">∥</span> block_ctr )
              </div>
            </div>

            {/* Hash card — stable position, subtle scale to indicate importance */}
            <motion.div style={{ scale: hashScale }} className="w-full flex justify-center">
              <div className="bg-white border-2 border-emerald-300 rounded-xl shadow-xl p-5 max-w-3xl w-full">
                <div className="text-[10px] font-serif font-bold uppercase tracking-widest text-emerald-400 mb-2">
                  256-bit output → starting address into π
                </div>
                <div className="font-mono text-sm md:text-base text-emerald-800 break-all leading-relaxed tracking-wider mb-4 border-b border-emerald-50 pb-2">
                  {hashHex || '...computing...'}
                </div>
                <div className="flex gap-2 flex-wrap justify-center">
                  {hashHex && Array.from({ length: 16 }, (_, i) => (
                    <span key={i} className="px-2 py-0.5 bg-emerald-50 border border-emerald-200 rounded font-mono text-[10px] text-emerald-600 whitespace-nowrap">
                      {hashHex.slice(i * 4, i * 4 + 4)}
                    </span>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Info panel */}
            <motion.div style={{ opacity: hashInfoOp }} className="max-w-lg text-center">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'Unpredictable', sub: 'One bit change → completely different output' },
                  { label: '2²⁵⁶ space',   sub: 'More than atoms in the observable universe' },
                  { label: 'PRF secure',    sub: 'Security reduces to SHA-256 assumption' },
                ].map(({ label, sub }) => (
                  <div key={label} className="bg-white border border-emerald-100 rounded-xl p-3 text-left shadow-sm">
                    <div className="font-serif font-bold text-emerald-700 text-sm">{label}</div>
                    <div className="text-gray-500 text-[10px] mt-1">{sub}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════
            PHASE 2 — Layer 1: Pi Position Generation
            Read 690 hex digits → 46 positions × 15 digits
        ════════════════════════════════════════════════════════════════ */}
        <motion.div style={{ opacity: ph2Op }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
          <div className="w-full max-w-5xl flex flex-col items-center gap-6">

            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-serif font-black uppercase tracking-widest bg-emerald-100 text-emerald-700 border border-emerald-300">
                Layer 1 · Pi Access · BBP Formula
              </span>
            </div>

            <motion.div style={{ opacity: bbpOp }} className="bg-white border border-emerald-200 rounded-2xl p-6 shadow-lg w-full">
              <div className="flex flex-col md:flex-row items-center gap-6 justify-between">
                <div className="flex-1">
                  <div className="text-[10px] font-serif font-black uppercase tracking-widest text-emerald-400 mb-3">
                    Extract π[S_eff], π[S_eff+1], ... → group 15 hex digits each
                  </div>
                  <BBPFormula />
                </div>
                <AnimatedPositionFormula />
              </div>
            </motion.div>

            {/* 46 position pills */}
            <motion.div style={{ opacity: pillsOp }} className="w-full">
              <div className="text-xs font-serif font-black uppercase tracking-widest text-center text-gray-400 mb-3">
                46 positions generated · 15 hex digits each
              </div>
              <div className="flex flex-wrap gap-1 justify-center">
                {layer1Positions.map((pos, i) => {
                  const c = LAYER1_COLORS[pos.category];
                  return (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.01 }}
                      className={`px-1.5 py-0.5 rounded border font-mono text-[8px] ${c.bg} ${c.border} ${c.text} flex items-center gap-1 shadow-sm`}
                    >
                      <span className="font-serif font-black">P{i}</span>
                      <span className="opacity-90 tracking-tight">{pos.digits}</span>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════
            PHASE 3 — Layer 2: Key Material Extraction
            46 positions → 4 color-coded material streams
        ════════════════════════════════════════════════════════════════ */}
        <motion.div style={{ opacity: ph3Op }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6">
          <div className="w-full max-w-4xl flex flex-col items-center gap-6">

            <div className="text-center">
              <span className="inline-block px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-purple-100 text-purple-700 border border-purple-300">
                Layer 2 · Key Material Extraction
              </span>
              <p className="text-xs text-gray-400 mt-2 font-mono">
                Jump to each of 46 Pi positions → extract cryptographic ingredients
              </p>
            </div>

            {/* Double-indirection diagram */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-xl w-full">
              <div className="flex items-center justify-center gap-3 mb-6 text-sm font-mono text-gray-600">
                <div className="px-3 py-1.5 bg-emerald-100 text-emerald-700 rounded-lg border border-emerald-300 text-xs font-bold">
                  S_eff (SHA-256 output)
                </div>
                <span className="text-emerald-400">→ π →</span>
                <div className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg border border-gray-300 text-xs font-bold">
                  46 positions P₀…P₄₅
                </div>
                <span className="text-purple-400">→ π →</span>
                <div className="px-3 py-1.5 bg-purple-100 text-purple-700 rounded-lg border border-purple-300 text-xs font-bold">
                  Key material
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {l2Categories.map((cat, i) => (
                  <motion.div
                    key={cat.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className={`rounded-xl border-2 p-4 ${cat.bg} ${cat.border}`}
                  >
                    <div className={`text-2xl font-black ${cat.text} mb-1`}>{cat.count}</div>
                    <div className={`text-sm font-bold ${cat.text}`}>{cat.label}</div>
                    <div className="text-[10px] text-gray-500 mt-1">{cat.sub}</div>
                    <div className="mt-3 flex flex-wrap gap-1">
                      {Array.from({ length: cat.count }, (_, j) => (
                        <div key={j} className={`w-3 h-3 rounded-sm ${cat.bg} border ${cat.border} opacity-60`} />
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-4 text-center text-[10px] text-gray-400 font-mono">
                Double-indirection: knowing Layer 1 positions doesn&apos;t reveal Layer 2 material without the seed
              </div>
            </div>
          </div>
        </motion.div>

        {/* ════════════════════════════════════════════════════════════════
            PHASE 4 — 14 Rounds (5 sub-steps each)
        ════════════════════════════════════════════════════════════════ */}
        <motion.div style={{ opacity: ph4Op }} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-2 pb-0">
          <div className="w-full max-w-5xl flex flex-col items-center gap-2">

            {/* ── Round header ──────────────────────────────────────── */}
            <div className="flex items-center gap-2 flex-wrap justify-center w-full bg-white rounded-xl px-3 py-2 border border-emerald-100 shadow-sm">
              {/* Round number badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeState?.round}
                  initial={{ scale: 0.7, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.7, opacity: 0 }}
                  className={`w-9 h-9 rounded-lg flex items-center justify-center font-black text-lg text-white shadow-sm transition-colors duration-500 ${
                    stepColor.border.replace('border-', 'bg-')
                  }`}
                >
                  {activeState?.round ?? 0}
                </motion.div>
              </AnimatePresence>

              <div className="text-left">
                <div className="text-[8px] font-black uppercase tracking-widest text-gray-400">Round</div>
                <div className="text-lg font-bold text-gray-900 leading-tight">{activeState?.name ?? 'Initializing…'}</div>
              </div>

              {/* Current step badge */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeState?.step}
                  initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }}
                  className={`px-2 py-1 rounded-lg border-2 font-black text-[10px] uppercase tracking-widest ${stepColor.bg} ${stepColor.border} ${stepColor.text} shadow-sm`}
                >
                  {activeState?.label ?? ''}
                  {activeState?.isNovel && <span className="ml-1 text-yellow-500">★ Novel</span>}
                </motion.div>
              </AnimatePresence>

              {activeState?.isFinalRound && (
                <div className="px-2 py-1 rounded-full bg-red-50 border border-red-300 text-red-600 text-[8px] font-black uppercase tracking-widest">
                  No MixColumns · No PiKeyMix
                </div>
              )}
            </div>

            {/* Description */}
            <div className={`text-[10px] font-mono text-center px-4 py-1.5 rounded-lg w-full ${stepColor.bg} ${stepColor.text} border ${stepColor.border} max-w-2xl`}>
              {activeState?.description ?? ''}
            </div>

            {/* 5-step progress icons */}
            {activeState && (
              <div className="flex gap-1.5 items-center justify-center">
                {['PiSubBytes', 'PiShiftRows', ...(activeState.isFinalRound ? [] : ['MixColumns', 'PiKeyMix']), 'AddRoundKey'].map(step => {
                  const palette = STEP_COLORS[step];
                  const isActive = activeState.step === step;
                  return (
                    <div key={step} title={step} className={`w-2.5 h-2.5 rounded-full border transition-all duration-300 ${
                      isActive ? `${palette.bg} ${palette.border} scale-125 shadow-sm` : 'bg-gray-100 border-gray-200'
                    }`} />
                  );
                })}
              </div>
            )}

            {/* 8×8 Block Matrix — Compacted */}
            <div className="w-full flex justify-center">
              <div className={`p-1 rounded-xl shadow-xl border ${stepColor.border} transition-colors duration-700`}>
                <div className="grid grid-cols-8 gap-0.5 p-2 bg-white rounded-lg">
                  {activeState?.block && activeState.block.map((byte, i) => {
                    const row = Math.floor(i / 8);
                    const col = i % 8;
                    const isActive = (row === animRow || col === animCol);
                    return (
                      <motion.div
                        key={i}
                        layout
                        className={`
                          w-8 h-8 md:w-10 md:h-10 flex flex-col items-center justify-center
                          font-mono rounded border text-[10px] transition-all duration-300
                          ${isActive ? `${stepColor.bg} ${stepColor.border} z-10` : 'bg-gray-50 border-gray-100'}
                        `}
                      >
                         <span className={`font-bold ${isActive ? stepColor.text : 'text-gray-800'}`}>
                          {byte.toString(16).padStart(2, '0').toUpperCase()}
                        </span>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── Round 1–14 progress bar ───────────────────────────── */}
            <div className="flex gap-1 w-full max-w-4xl items-center bg-white rounded-xl px-2 py-1.5 border border-emerald-100 shadow-sm mt-1">
              <span className="text-[10px] font-serif font-black text-emerald-700 w-12 shrink-0">Round</span>
              <div className="flex gap-0.5 flex-1">
                {Array.from({ length: 14 }, (_, i) => {
                  const r = i + 1;
                  const done = r < (activeState?.round ?? 0);
                  const active = r === (activeState?.round ?? 0);
                  return (
                    <div
                      key={r}
                      className={`flex-1 h-5 rounded transition-all duration-500 flex items-center justify-center relative ${
                        done   ? 'bg-emerald-400' :
                        active ? stepColor.border.replace('border-', 'bg-') :
                                 'bg-gray-100'
                      }`}
                    >
                      <span className={`text-[9px] font-black ${
                        done || active ? 'text-white' : 'text-gray-300'
                      }`}>{r}</span>
                    </div>
                  );
                })}
              </div>
              <span className="text-[10px] font-serif font-black text-emerald-700 w-8 text-right shrink-0">
                {activeState?.round ?? 0}/14
              </span>
            </div>
            {/* State index in current round */}
            <div className="text-[9px] font-mono text-gray-400 mt-0.5">
              state {activeIdx + 1} / {states.length}
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}
