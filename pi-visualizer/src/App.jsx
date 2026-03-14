import React, { useEffect } from 'react';
import { BookOpen, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';
import DocumentViewer from './components/DocumentViewer';
import ScrollVisualizer from './components/ScrollVisualizer';

function App() {

  return (
    <div className="min-h-screen bg-academic-bg text-academic-text font-serif">
      
      {/* Navigation */}
      <nav className="border-b border-academic-border bg-white/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight">
              Pi<sup className="text-academic-accent">2</sup> Cipher
            </span>
          </div>
          <div className="hidden md:flex gap-8 text-sm text-gray-600">
            <a href="#algorithm" className="hover:text-black transition-colors">Algorithm</a>
            <a href="#visualizer" className="hover:text-black transition-colors">Visualizer</a>
            <a href="#documents" className="hover:text-black transition-colors">Research</a>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <section className="min-h-[75vh] flex flex-col justify-center relative pt-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }} 
            className="z-10"
          >
            <div className="inline-block border border-academic-border bg-gray-50 text-gray-600 px-3 py-1 rounded text-xs mb-8 tracking-wide uppercase">
              Mathematical Proof of Concept
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              Security inside <br />
              The Digits of Pi
            </h1>
            
            <p className="max-w-2xl text-gray-700 text-lg md:text-xl mb-12 leading-relaxed">
              A block cipher whose entire internal structure is derived fundamentally from the infinite, random sequence of Pi, removing the need for predefined magic numbers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <a href="#visualizer" className="px-6 py-3 bg-black text-white font-medium rounded hover:bg-gray-800 transition-all flex items-center justify-center gap-2">
                Explore the Visualizer
                <ChevronDown className="w-4 h-4" />
              </a>
              <a href="#documents" className="px-6 py-3 border border-academic-border hover:bg-gray-50 text-black font-medium rounded transition-all flex items-center justify-center gap-2">
                <BookOpen className="w-4 h-4" />
                Read the Research
              </a>
            </div>
          </motion.div>
          
        </section>

        <ScrollVisualizer />

        <DocumentViewer />

      </main>
      
      <footer className="py-8 border-t border-academic-border text-center text-sm text-gray-500 mt-20">
        Pi<sup className="text-[10px]">2</sup> Cipher POC Domain — Research Purpose Only
      </footer>
    </div>
  );
}

export default App;
