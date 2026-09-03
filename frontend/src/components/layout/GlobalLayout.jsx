import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useCinematicStore } from '../../store/cinematicStore';
import { ComparisonActionBar } from './ComparisonModal';

import { useLocation } from 'react-router-dom';

const revealVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: "easeOut",
    }
  }
};

const AmbientCursorGlow = React.memo(() => {
  const mousePosition = useMousePosition();
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{
        opacity: 0.2,
        background: `radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, var(--color-prism-accent-glow), transparent 40%)`
      }}
      transition={{ opacity: { duration: 2 }, background: { type: "tween", ease: "backOut", duration: 0.1 } }}
      className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
    />
  );
});

const GlobalLayout = ({ children }) => {
  const location = useLocation();
  const showUI = true;

  return (
    <div className="relative min-h-screen text-prism-text-primary overflow-hidden transition-colors duration-500 bg-transparent">
      
      {/* Ambient Light Refraction (Mouse Reactive over 3D background) */}
      <AnimatePresence>
        {showUI && <AmbientCursorGlow />}
      </AnimatePresence>
      
      {/* Cinematic Grid Background */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="absolute inset-0 z-0 pointer-events-none" 
            style={{
              backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)',
              backgroundSize: '4rem 4rem',
              maskImage: 'radial-gradient(circle at center, black, transparent 80%)'
            }}
          />
        )}
      </AnimatePresence>

      {/* Floating Application Shell */}
      <div className="relative z-10 flex h-screen w-full bg-transparent">
        {/* Sidebar */}
        <Sidebar />
        
        <main className="flex-1 flex flex-col h-full relative bg-transparent">
          {/* Navbar */}
          <div className="w-full">
            <Navbar />
          </div>
          
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 sm:p-6 md:p-12 w-full max-w-screen-2xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      <ComparisonActionBar />
    </div>
  );
};

export default GlobalLayout;
