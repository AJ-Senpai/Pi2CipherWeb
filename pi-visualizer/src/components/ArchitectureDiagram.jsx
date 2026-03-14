import React from 'react';
import { motion } from 'framer-motion';
import { Database, Zap, Cpu, Key, FileText } from 'lucide-react';

export default function ArchitectureDiagram() {
  
  const boxVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } }
  };

  const lineVariants = {
    hidden: { pathLength: 0, opacity: 0 },
    visible: { pathLength: 1, opacity: 1, transition: { duration: 1, ease: "easeInOut" } }
  };

  return (
    <section id="algorithm" className="py-20 relative bg-black/50 border-t border-cyber-green/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-16">
          <Database className="w-12 h-12 text-neon-blue mb-4 drop-shadow-neon-blue mx-auto" />
          <h2 className="text-4xl font-bold font-mono text-white mb-4">
            <span className="text-neon-blue">Cipher</span> Architecture
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            The defining feature of Pi² Cipher is its double-layer indirection. The secret key never interacts directly with the plaintext; instead, it generates coordinates to extract scrambling materials from the digits of Pi.
          </p>
        </div>

        {/* CSS Grid for Architecture Layout */}
        <motion.div 
           initial="hidden"
           whileInView="visible"
           viewport={{ once: true, margin: "-100px" }}
           className="relative max-w-4xl mx-auto flex flex-col items-center"
        >
          {/* Node: Key */}
          <motion.div variants={boxVariants} className="w-64 bg-cyber-gray-border/80 border border-cyber-green/50 rounded-lg p-4 flex flex-col items-center shadow-neon z-10">
            <Key className="text-cyber-green mb-2" />
            <span className="font-mono font-bold">Secret Seed (256-bit)</span>
          </motion.div>

          {/* SVG Line down */}
          <svg width="4" height="60" className="my-2 z-0 relative">
            <motion.line x1="2" y1="0" x2="2" y2="60" stroke="#00ff41" strokeWidth="2" variants={lineVariants} strokeDasharray="4 4" />
          </svg>

          {/* Node: SHA-256 */}
          <motion.div variants={boxVariants} className="w-64 bg-cyber-gray-border/80 border border-neon-pink/50 rounded-lg p-4 flex flex-col items-center shadow-[0_0_15px_rgba(255,0,60,0.3)] z-10">
            <Zap className="text-neon-pink mb-2" />
            <span className="font-mono font-bold text-center">SHA-256(Seed || Nonce)<br/><span className="text-xs text-gray-400">Generates Starting Address</span></span>
          </motion.div>

          <svg width="4" height="60" className="my-2 z-0 relative">
            <motion.line x1="2" y1="0" x2="2" y2="60" stroke="#00ff41" strokeWidth="2" variants={lineVariants} strokeDasharray="4 4" />
          </svg>

          {/* Node: Layer 1 */}
          <motion.div variants={boxVariants} className="w-80 bg-cyber-gray-border/80 border border-neon-blue/50 rounded-lg p-4 flex flex-col items-center shadow-neon-blue z-10">
            <Database className="text-neon-blue mb-2" />
            <span className="font-mono font-bold">Layer 1: Position Generation</span>
            <span className="text-xs text-gray-400 mt-1 text-center">Group 15 consecutive pi digits to form<br/>46 massive random numbers</span>
          </motion.div>

          <svg width="4" height="60" className="my-2 z-0 relative">
            <motion.line x1="2" y1="0" x2="2" y2="60" stroke="#00f0ff" strokeWidth="2" variants={lineVariants} strokeDasharray="4 4" />
          </svg>

          {/* Node: Layer 2 */}
          <motion.div variants={boxVariants} className="w-96 bg-cyber-gray-border/80 border border-cyber-green rounded-lg p-4 flex items-center justify-center gap-4 shadow-neon z-10">
            <Cpu className="text-cyber-green shrink-0 w-8 h-8" />
            <div className="flex flex-col">
               <span className="font-mono font-bold">Layer 2: Key Material Extraction</span>
               <span className="text-xs text-gray-400">Use the 46 positions to jump across Pi and extract actual bytes for the cipher steps.</span>
            </div>
          </motion.div>

          {/* Branching SVG Lines */}
          <div className="relative w-full h-20 my-2 flex justify-center">
            <svg width="600" height="80" className="absolute top-0">
               {/* Left branch */}
               <motion.path d="M 300 0 C 300 40 100 40 100 80" fill="none" stroke="#00ff41" strokeWidth="2" variants={lineVariants} />
               {/* Center branch */}
               <motion.line x1="300" y1="0" x2="300" y2="80" stroke="#00ff41" strokeWidth="2" variants={lineVariants} />
               {/* Right branch */}
               <motion.path d="M 300 0 C 300 40 500 40 500 80" fill="none" stroke="#00ff41" strokeWidth="2" variants={lineVariants} />
            </svg>
          </div>

          <div className="w-full flex justify-between gap-4 max-w-3xl z-10 pb-10">
             <motion.div variants={boxVariants} className="flex-1 bg-cyber-gray-border border border-amber-500/50 rounded p-4 text-center">
                <span className="font-mono font-bold text-amber-500 text-sm">PiSubBytes Boxes</span>
             </motion.div>
             <motion.div variants={boxVariants} className="flex-1 bg-cyber-gray-border border border-amber-500/50 rounded p-4 text-center">
                <span className="font-mono font-bold text-amber-500 text-sm">MixColumns MDS</span>
             </motion.div>
             <motion.div variants={boxVariants} className="flex-1 bg-cyber-gray-border border border-amber-500/50 rounded p-4 text-center">
                <span className="font-mono font-bold text-amber-500 text-sm">Round Keys</span>
             </motion.div>
          </div>

        </motion.div>
      </div>
    </section>
  );
}
