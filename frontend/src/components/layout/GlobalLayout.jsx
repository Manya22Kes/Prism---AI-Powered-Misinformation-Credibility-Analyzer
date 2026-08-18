import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useCinematicStore } from '../../store/cinematicStore';

import { useLocation } from 'react-router-dom';

const revealVariants = {
  hidden: { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
  visible: (custom) => ({
    opacity: 1,
    clipPath: 'inset(0 0% 0 0)',
    transition: {
      delay: custom.delay,
      duration: 1.5,
      ease: [0.25, 0.1, 0.25, 1],
    }
  })
};

const GlobalLayout = ({ children }) => {
  const mousePosition = useMousePosition();
  const location = useLocation();
  const { openingSequenceStep, isSequenceComplete } = useCinematicStore();

  const isHomePage = location.pathname === '/';
  const showUI = isSequenceComplete || !isHomePage || openingSequenceStep >= 6;

  return (
    <div className="relative min-h-screen text-prism-text-primary overflow-hidden transition-colors duration-500 bg-transparent">
      
      {/* Ambient Light Refraction (Mouse Reactive over 3D background) */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{
              opacity: 0.2,
              background: `radial-gradient(circle 800px at ${mousePosition.x}px ${mousePosition.y}px, var(--color-prism-accent-glow), transparent 40%)`
            }}
            transition={{ opacity: { duration: 2 }, background: { type: "tween", ease: "backOut", duration: 0.1 } }}
            className="absolute top-0 left-0 w-full h-full pointer-events-none z-0 mix-blend-screen"
          />
        )}
      </AnimatePresence>
      
      {/* Cinematic Grid Background */}
      <AnimatePresence>
        {showUI && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2, delay: 0.5 }}
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
      <AnimatePresence>
        {showUI && (
          <div className="relative z-10 flex h-screen w-full">
            {/* Sidebar Birth */}
            <motion.div
              custom={{ delay: isSequenceComplete ? 0 : 0 }}
              variants={revealVariants}
              initial={isSequenceComplete ? false : "hidden"}
              animate="visible"
            >
              <Sidebar />
            </motion.div>
            
            <main className="flex-1 flex flex-col h-full relative">
              {/* Navbar Birth */}
              <motion.div
                custom={{ delay: isSequenceComplete ? 0 : 0.5 }}
                variants={revealVariants}
                initial={isSequenceComplete ? false : "hidden"}
                animate="visible"
                className="w-full"
              >
                <Navbar />
              </motion.div>
              
              {/* Main Content Area Birth */}
              <motion.div 
                custom={{ delay: isSequenceComplete ? 0 : 1 }}
                variants={revealVariants}
                initial={isSequenceComplete ? false : "hidden"}
                animate="visible"
                className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-12 w-full max-w-screen-2xl mx-auto"
              >
                {children}
              </motion.div>
            </main>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default GlobalLayout;
