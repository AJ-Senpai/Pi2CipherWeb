import React from 'react';
import { FileText, Download } from 'lucide-react';

export default function DocumentViewer() {
  return (
    <section id="documents" className="py-20 bg-cyber-black relative border-t border-cyber-green/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center mb-12">
          <FileText className="w-12 h-12 text-cyber-green mb-4 shadow-neon mx-auto p-2 bg-cyber-green/10 rounded-lg" />
          <h2 className="text-4xl font-bold font-mono text-white mb-4">
            Research <span className="text-cyber-green">Documents</span>
          </h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Read the original proposals detailing the cryptography, assumptions, and design rationale behind the Pi² Algorithm.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Layman Document */}
          <div className="bg-cyber-gray-border/30 border border-neon-blue/30 rounded-lg p-6 flex flex-col h-full hover:border-neon-blue transition-colors group">
            <h3 className="text-2xl font-bold font-mono text-white mb-2">Plain English Guide</h3>
            <p className="text-gray-400 text-sm mb-8 flex-grow">
              A gentle introduction to how the cipher works under the hood. Perfect for understanding the core concepts without diving into heavy math.
            </p>
            <a 
              href="/pi2_layman.pdf" 
              download
              className="w-full py-4 bg-neon-blue/10 text-neon-blue font-mono font-bold rounded flex items-center justify-center gap-3 border border-neon-blue/50 group-hover:bg-neon-blue group-hover:text-black transition-all shadow-neon-blue"
            >
              <Download className="w-5 h-5" /> Download Plain English PDF
            </a>
          </div>

          {/* Technical Document */}
          <div className="bg-cyber-gray-border/30 border border-cyber-green/30 rounded-lg p-6 flex flex-col h-full hover:border-cyber-green transition-colors group">
            <h3 className="text-2xl font-bold font-mono text-white mb-2">Technical Draft (v0.1)</h3>
            <p className="text-gray-400 text-sm mb-8 flex-grow">
              The formal Proof of Concept specification containing the algebraic structure, AES basis comparison, and security assumption definitions.
            </p>
            <a 
              href="/pi2_cipher_Draft.pdf" 
              download
              className="w-full py-4 bg-cyber-green/10 text-cyber-green font-mono font-bold rounded flex items-center justify-center gap-3 border border-cyber-green/50 group-hover:bg-cyber-green group-hover:text-black transition-all shadow-neon"
            >
              <Download className="w-5 h-5" /> Download Technical PDF
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
