import React, { useRef, useMemo, useEffect, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as THREE from 'three';
import { useMousePosition } from '../../hooks/useMousePosition';
import { useCinematicStore } from '../../store/cinematicStore';
import { useThemeStore } from '../../store/themeStore';
import { useSettingsStore } from '../../store/settingsStore';
import { useExperienceStore } from '../../store/experienceStore';
import { PrismMascot } from './PrismMascot';
import { cn } from '../../utils/cn';
import { motion, AnimatePresence } from 'framer-motion';
import { FastForward } from 'lucide-react';

// Plausible misinformation & news claim fragments with desktop and mobile non-overlapping layouts
const CHAOS_ITEMS = [
  { 
    id: 1, 
    raw: "Intermittent fasting increases lifespan by 40% in clinical trial.", 
    tag: "EXAGGERATED CLAIM", 
    detail: "CONTEXT: MICE TRIAL ONLY | HUMAN IMPACT UNPROVEN", 
    pos: { top: '22%', left: '12%' },
    mobilePos: { top: '10%', left: '5%', right: 'auto', maxWidth: '270px' }
  },
  { 
    id: 2, 
    raw: "Researchers discover AI can detect depression from a single selfie.", 
    tag: "UNSUBSTANTIATED", 
    detail: "METHODOLOGY: OVERFITTED SAMPLE SIZE (N=42)", 
    pos: { top: '32%', left: '58%' },
    mobilePos: null // Hidden on narrow mobile to prevent overlap with Item 5
  },
  { 
    id: 3, 
    raw: "Climate prediction models deliberately altered in official report.", 
    tag: "FALSEHOOD DEBUNKED", 
    detail: "EVIDENCE: AUDITED RAW METEOROLOGICAL DATA", 
    pos: { top: '62%', left: '16%' },
    mobilePos: { top: '63%', left: '5%', right: 'auto', maxWidth: '270px' }
  },
  { 
    id: 4, 
    raw: "WHO quietly updated global vaccine safety guidance.", 
    tag: "MISLEADING CONTEXT", 
    detail: "FACT: STANDARD PERIODIC SCHEDULE REVISION", 
    pos: { top: '72%', left: '52%' },
    mobilePos: { top: '78%', left: 'auto', right: '5%', maxWidth: '270px' }
  },
  { 
    id: 5, 
    raw: "Government study confirms 14% error rate in facial recognition.", 
    tag: "PARTIALLY VERIFIED", 
    detail: "BIAS: HIGH ERROR IN LOW-LIGHT ANGLE SCENARIOS", 
    pos: { top: '18%', left: '68%' },
    mobilePos: { top: '25%', left: 'auto', right: '5%', maxWidth: '270px' }
  }
];

// High-Visibility Volumetric Dust Cloud along Light Beam & Prism Path
const VolumetricDustCloud = ({ openingSequenceStep, theme }) => {
  const ref = useRef();
  const environmentalIntensity = useExperienceStore((state) => state.environmentalIntensity);
  const activeEnvironmentState = useExperienceStore((state) => state.activeEnvironmentState);
  const environmentalProfile = useExperienceStore((state) => state.environmentalProfile);
  const reducedMotion = useSettingsStore((state) => state.settings.reducedMotion);

  // 1500 bright golden/white dust specks around the central light beam & prism
  const [positions] = useMemo(() => {
    const pos = new Float32Array(1500 * 3);
    for (let i = 0; i < 1500; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 28;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 7;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 7;
    }
    return [pos];
  }, []);

  const matRef = useRef();

  useFrame((state, delta) => {
    if (reducedMotion) return;
    if (ref.current) {
      const speedMult = activeEnvironmentState === 'processing' ? 1.0 + (environmentalIntensity * 0.15) : 1.0;
      ref.current.rotation.y += delta * 0.04 * speedMult;
      ref.current.rotation.z += delta * 0.02 * speedMult;
    }
    if (matRef.current) {
      // Glow intensely when beam arrives & hits prism (step >= 2)
      let targetOpacity = openingSequenceStep >= 2 ? 0.65 : 0.08;
      
      if (environmentalProfile === 'reading') targetOpacity *= 0.25;
      if (environmentalProfile === 'report') targetOpacity *= 0.5;
      if (environmentalProfile === 'archive') targetOpacity *= 0.6;
      
      matRef.current.opacity += (targetOpacity - matRef.current.opacity) * delta * 3;
    }
  });

  return (
    <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
      <PointMaterial 
        ref={matRef}
        transparent 
        color={theme === 'light' ? '#dc2626' : '#fef3c7'} 
        size={theme === 'light' ? 0.11 : 0.08}
        sizeAttenuation={true} 
        depthWrite={false}
        opacity={theme === 'light' ? 0.65 : 0.45}
        blending={theme === 'light' ? THREE.NormalBlending : THREE.AdditiveBlending}
      />
    </Points>
  );
};

// General Ambient Particle Field distributed across the full 3D viewport
const ParticleField = ({ mousePosition, openingSequenceStep, theme }) => {
  const ref = useRef();
  const matRef = useRef();
  const activeEnvironmentState = useExperienceStore((state) => state.activeEnvironmentState);
  const environmentalIntensity = useExperienceStore((state) => state.environmentalIntensity);
  const environmentalProfile = useExperienceStore((state) => state.environmentalProfile);

  const count = 3500;
  const [positions, initialPos, particleData] = useMemo(() => {
    const pos = new Float32Array(count * 3);
    const initPos = [];
    const pData = [];
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 65;
      const y = (Math.random() - 0.5) * 45;
      const z = (Math.random() - 0.5) * 35;
      
      pos[i * 3] = x;
      pos[i * 3 + 1] = y;
      pos[i * 3 + 2] = z;
      
      const speed = 0.001 + Math.random() * 0.006;
      const angle = Math.random() * Math.PI * 2;
      
      initPos.push({ x, y, z });
      pData.push({
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        swirlPhase: Math.random() * Math.PI * 2
      });
    }
    return [pos, initPos, pData];
  }, []);

  useFrame((state, delta) => {
    if (ref.current) {
      const posAttr = ref.current.geometry.attributes.position;
      
      // Determine dynamics based on Experience Controller State
      let timeScale = 1.0;
      if (activeEnvironmentState === 'processing') {
         // Scale linearly with environmental intensity: calm (1.0) up to very energetic (3.5+)
         timeScale = 1.0 + (environmentalIntensity * 0.25);
      }
      if (activeEnvironmentState === 'reading' || activeEnvironmentState === 'focus') timeScale = 0.25;
      
      // Apply baseline environmental profile modifiers additively
      switch (environmentalProfile) {
        case 'reading': timeScale *= 0.15; break;
        case 'report': timeScale *= 0.4; break;
        case 'archive': timeScale *= 0.2; break;
        case 'missionControl': timeScale *= 1.2; break;
        case 'watchlist': timeScale *= 1.1; break;
        case 'workspace':
        default: break;
      }
      
      const mouseX = (mousePosition?.normalizedX || 0) * 22;
      const mouseY = (mousePosition?.normalizedY || 0) * 14;

      for (let i = 0; i < count; i++) {
        let px = posAttr.getX(i);
        let py = posAttr.getY(i);
        let pz = posAttr.getZ(i);
        const data = particleData[i];
        const origin = initialPos[i];

        // 1. Natural slow ambient drift
        data.swirlPhase += delta * 0.4 * timeScale;
        px += (data.vx + Math.sin(data.swirlPhase) * 0.0015) * delta * 60 * timeScale;
        py += (data.vy + Math.cos(data.swirlPhase) * 0.0015) * delta * 60 * timeScale;

        // 2. State-Driven Physics (Upload Magnetic Flow vs Interactive Cursor Repulsion)
        if (activeEnvironmentState === 'uploadReady') {
          const dx = 0 - px;
          const dy = -1 - py;
          const distSq = dx * dx + dy * dy;
          if (distSq > 0.2) {
            const dist = Math.sqrt(distSq);
            px += (dx / dist) * delta * 2.5;
            py += (dy / dist) * delta * 2.5;
          }
        } else {
          const dx = px - mouseX;
          const dy = py - mouseY;
          const distSq = dx * dx + dy * dy;

          if (distSq < 36 && distSq > 0.001) {
            const dist = Math.sqrt(distSq);
            const force = (1 - dist / 6) * 2.2 * delta;
            const perpX = -dy / dist;
            const perpY = dx / dist;
            px += (dx / dist * force * 1.4) + (perpX * force * 0.6);
            py += (dy / dist * force * 1.4) + (perpY * force * 0.6);
          }
        }

        // 3. Smooth elastic return toward home bounds
        px += (origin.x - px) * delta * 0.35 * timeScale;
        py += (origin.y - py) * delta * 0.35 * timeScale;
        pz += (origin.z - pz) * delta * 0.35 * timeScale;
        
        // 4. Profile Specific Flow Adjustments
        if (environmentalProfile === 'missionControl') {
           // Structured pull to a grid-like horizontal plane
           py += (0 - py) * delta * 0.2; 
        } else if (environmentalProfile === 'watchlist') {
           // Subtle upward continuous directional drift
           py += delta * 1.5;
           if (py > 22) py = -22; // Loop vertically
        }

        posAttr.setXYZ(i, px, py, pz);
      }
      posAttr.needsUpdate = true;
    }
    
    if (matRef.current) {
      let targetOpacity = theme === 'light' ? 0.65 : (openingSequenceStep >= 2 ? 0.45 : 0.25);
      if (activeEnvironmentState === 'reading' || activeEnvironmentState === 'focus') {
        targetOpacity *= 0.35; // Quieter density during reading and typing focus
      }
      matRef.current.opacity += (targetOpacity - matRef.current.opacity) * delta * 2;
    }
  });

  return (
    <group>
      <Points ref={ref} positions={positions} stride={3} frustumCulled={false}>
        <PointMaterial 
          ref={matRef}
          transparent 
          color={theme === 'light' ? '#ef4444' : (openingSequenceStep >= 2 ? '#fef3c7' : '#f8fafc')} 
          size={theme === 'light' ? 0.068 : 0.045}
          sizeAttenuation={true} 
          depthWrite={false}
          opacity={theme === 'light' ? 0.60 : 0.55}
          blending={THREE.NormalBlending}
        />
      </Points>
    </group>
  );
};

// Physical Volumetric Incoming Light Beam
const FirstLightBeam = ({ openingSequenceStep }) => {
  const beamGroupRef = useRef();
  
  useFrame((state, delta) => {
    if (!beamGroupRef.current) return;
    
    if (openingSequenceStep === 2) {
      // Beam moves smoothly in from left to center
      beamGroupRef.current.position.x += (0 - beamGroupRef.current.position.x) * delta * 2;
    } else if (openingSequenceStep >= 3 && openingSequenceStep <= 4) {
      beamGroupRef.current.position.x = 0;
    } else if (openingSequenceStep >= 5) {
      beamGroupRef.current.scale.x += (0 - beamGroupRef.current.scale.x) * delta * 4;
    }
  });

  if (openingSequenceStep < 2) return null;

  return (
    <group ref={beamGroupRef} position={[-20, 0, 0]}>
      {/* Incoming Straight Physical Beam */}
      <mesh position={[-10, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.06, 0.06, 20, 16]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      {/* Outer Volumetric Glow Halo */}
      <mesh position={[-10, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.4, 0.4, 20, 16]} />
        <meshBasicMaterial color="#fef3c7" transparent opacity={0.2} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <pointLight position={[0, 0, 0]} color="#ffffff" intensity={4} distance={10} />
    </group>
  );
};

// Physically Realistic Spectral Refraction Fan
const RefractedSpectrumFan = ({ openingSequenceStep }) => {
  const fanGroupRef = useRef();
  const colors = ['#8b5cf6', '#6366f1', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#d97706', '#ef4444'];
  
  useFrame((state, delta) => {
    if (!fanGroupRef.current) return;
    if (openingSequenceStep >= 4) {
      const targetRotationZ = Math.sin(state.clock.elapsedTime * 0.2) * 0.05 - 0.25;
      fanGroupRef.current.rotation.z += (targetRotationZ - fanGroupRef.current.rotation.z) * delta * 2;
    }
  });

  if (openingSequenceStep < 4) return null;

  return (
    <group ref={fanGroupRef} position={[0.2, -0.1, 0]}>
      {colors.map((col, idx) => {
        const spreadAngle = (idx - colors.length / 2) * 0.06 - 0.25;
        return (
          <group key={col} rotation={[0, 0, spreadAngle]}>
            <mesh position={[12, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
              <cylinderGeometry args={[0.03 + idx * 0.005, 0.22 + idx * 0.02, 24, 8]} />
              <meshBasicMaterial color={col} transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          </group>
        );
      })}
    </group>
  );
};

// Cinematic Camera Handling
const CinematicCamera = ({ mousePosition, openingSequenceStep, isSequenceComplete }) => {
  const { camera } = useThree();
  
  useEffect(() => {
    if (!isSequenceComplete && openingSequenceStep === 0) {
      camera.position.set(0, 0, 22);
      camera.lookAt(0, 0, 0);
    }
  }, [camera, openingSequenceStep, isSequenceComplete]);

  useFrame((state, delta) => {
    if (isSequenceComplete) {
      const targetX = mousePosition.normalizedX * 0.4;
      const targetY = mousePosition.normalizedY * 0.4;
      camera.position.x += (targetX - camera.position.x) * delta * 2;
      camera.position.y += (targetY - camera.position.y) * delta * 2;
      camera.position.z += (15 - camera.position.z) * delta * 2;
      camera.lookAt(0, 0, 0);
      return;
    }

    switch (openingSequenceStep) {
      case 0:
      case 1:
        camera.position.set(0, 0, 22);
        break;
      case 2:
        camera.position.x += (-3 - camera.position.x) * delta * 0.8;
        break;
      case 3:
      case 4:
        camera.position.x += (0 - camera.position.x) * delta * 1;
        camera.position.z += (14 - camera.position.z) * delta * 0.5;
        camera.lookAt(0, 0, 0);
        break;
      case 5:
      case 6:
        camera.position.z += (18 - camera.position.z) * delta * 1.5;
        camera.lookAt(0, 0, 0);
        break;
      default:
        break;
    }
  });
  return null;
};

// Sequence Timeline Orchestrator (15-20s strict runtime)
const SequenceOrchestrator = () => {
  const { openingSequenceStep, setSequenceStep, isSequenceComplete } = useCinematicStore();

  useEffect(() => {
    if (isSequenceComplete) return;

    const runFilmSequence = async () => {
      // 0–3.0s: Misinformation Hook
      await new Promise((r) => setTimeout(r, 3000));
      
      // 2.5–5.5s: Plausible Information Chaos
      setSequenceStep(1);
      await new Promise((r) => setTimeout(r, 3000));
      
      // 5.5–8.5s: Arrival of Physical Light (Beam enters & illuminates dust)
      setSequenceStep(2);
      await new Promise((r) => setTimeout(r, 3000));
      
      // 8.5–11.5s: Prism Materializes & Beam Enters
      setSequenceStep(3);
      await new Promise((r) => setTimeout(r, 3000));
      
      // 11.5–14.5s: Physical Refraction & Signature Optical Moment
      setSequenceStep(4);
      await new Promise((r) => setTimeout(r, 3000));
      
      // 14.5–17.5s: Identity Reveal (PRISM title in geometric sans + serif subtitle)
      setSequenceStep(5);
      await new Promise((r) => setTimeout(r, 3000));
      
      // 17.5–19.5s: Workspace Transition
      setSequenceStep(6);
      await new Promise((r) => setTimeout(r, 2000));
      
      // Complete
      setSequenceStep(7);
    };

    runFilmSequence();
  }, [isSequenceComplete, setSequenceStep]);

  return null;
};

// Twin Revolving Flanking Prisms during Workspace Carving Transition (Step 6)
const TwinFlankingPrisms = ({ mousePosition }) => {
  const leftGroupRef = useRef();
  const rightGroupRef = useRef();

  useFrame((state, delta) => {
    if (leftGroupRef.current) {
      leftGroupRef.current.rotation.y += delta * 0.4;
      leftGroupRef.current.rotation.x += delta * 0.2;
    }
    if (rightGroupRef.current) {
      rightGroupRef.current.rotation.y -= delta * 0.4;
      rightGroupRef.current.rotation.x -= delta * 0.2;
    }
  });

  return (
    <>
      <group ref={leftGroupRef} position={[-7.5, 0, -1]} scale={2.8}>
        <PrismMascot mousePosition={mousePosition} />
      </group>
      <group ref={rightGroupRef} position={[7.5, 0, -1]} scale={2.8}>
        <PrismMascot mousePosition={mousePosition} />
      </group>
    </>
  );
};

// Dynamic Anchor handling both standard floating interpolation and Awards-Show Screen Sweeps
const SmoothPrismAnchor = ({ prismPosition, prismScale, mousePosition, readingModeWipe }) => {
  const groupRef = useRef();
  const wipeStartTime = useRef(null);
  const prevWipe = useRef(null);

  useFrame((state, delta) => {
    if (!groupRef.current) return;

    if (readingModeWipe) {
      if (prevWipe.current !== readingModeWipe) {
        prevWipe.current = readingModeWipe;
        wipeStartTime.current = performance.now();
      }

      const elapsed = performance.now() - wipeStartTime.current;
      const progress = Math.min(Math.max(elapsed / 1000, 0), 1);
      
      const eased = progress < 0.5 
        ? 4 * progress * progress * progress 
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      if (readingModeWipe === 'enter') {
        // Sweeps across from offscreen left (-18) to offscreen right (+18)
        const startX = -18;
        const endX = 18;
        const currentX = startX + (endX - startX) * eased;
        const currentY = Math.sin(progress * Math.PI) * 1.6;
        const currentZ = 1.4;

        groupRef.current.position.set(currentX, currentY, currentZ);
        groupRef.current.scale.set(2.8, 2.8, 2.8);
        groupRef.current.rotation.y += delta * 4.5;
        groupRef.current.rotation.z = Math.sin(progress * Math.PI) * 0.45;
      } else if (readingModeWipe === 'exit') {
        // Sweeps across from offscreen right (+18) back to resting position [4, -2, -5]
        const startX = 18;
        const endX = 4;
        const currentX = startX + (endX - startX) * eased;
        const currentY = (1 - eased) * 1.6 + eased * -2;
        const currentZ = (1 - eased) * 1.4 + eased * -5;
        const currentScale = (1 - eased) * 2.8 + eased * 1.0;

        groupRef.current.position.set(currentX, currentY, currentZ);
        groupRef.current.scale.set(currentScale, currentScale, currentScale);
        groupRef.current.rotation.y += delta * 3.5;
      }
    } else {
      prevWipe.current = null;
      const targetPos = new THREE.Vector3(...prismPosition);
      groupRef.current.position.lerp(targetPos, Math.min(delta * 5, 1));
      
      const currentScale = groupRef.current.scale.x;
      const targetScale = typeof prismScale === 'number' ? prismScale : 1;
      const newScale = THREE.MathUtils.lerp(currentScale, targetScale, Math.min(delta * 5, 1));
      groupRef.current.scale.set(newScale, newScale, newScale);
    }
  });

  return (
    <group ref={groupRef} position={prismPosition} scale={prismScale}>
      <PrismMascot mousePosition={mousePosition} />
    </group>
  );
};

export const CinematicLayer = ({ className }) => {
  const mousePosition = useMousePosition();
  const { ambientIntensity, prismPosition, prismScale, openingSequenceStep, isSequenceComplete, skipSequence } = useCinematicStore();
  const readingModeWipe = useExperienceStore((state) => state.readingModeWipe);
  const { theme } = useThemeStore();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isSequenceComplete) {
        skipSequence();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSequenceComplete, skipSequence]);

  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isLight = theme === 'light';
  const bgColor = isLight ? '#f7f7f5' : '#020202';
  const fogColor = isLight ? '#e8e8e2' : '#020202';

  return (
    <div 
      className={cn("fixed inset-0 pointer-events-none overflow-hidden select-none transition-colors duration-500", !isSequenceComplete ? "z-50" : "z-0", className)}
      style={{ backgroundColor: bgColor }}
    >
      {/* Interactive Skip Intro Overlay Button during sequence */}
      {!isSequenceComplete && (
        <motion.button
          type="button"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileTap={{ scale: 0.92 }}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            skipSequence();
          }}
          onTouchEnd={(e) => {
            e.preventDefault();
            e.stopPropagation();
            skipSequence();
          }}
          style={{ touchAction: 'manipulation', WebkitTapHighlightColor: 'transparent' }}
          className={cn(
            "fixed sm:absolute z-[9999] pointer-events-auto rounded-full font-mono uppercase tracking-wider backdrop-blur-md transition-all flex items-center shadow-lg cursor-pointer",
            // Mobile specific: real, tactile, safe from status bar/notch, min 44px touch target
            "top-[max(1rem,env(safe-area-inset-top))] right-[max(1rem,env(safe-area-inset-right))] min-h-[44px] px-4 py-2.5 text-xs font-bold gap-2",
            isLight 
              ? "bg-white/95 hover:bg-white text-slate-900 border border-slate-300 shadow-md active:bg-slate-100" 
              : "bg-black/80 hover:bg-black/95 text-white border border-white/25 shadow-[0_4px_20px_rgba(0,0,0,0.6)] active:bg-black",
            // Laptop/desktop specific: preserve exact layout and ESC badge
            "sm:top-6 sm:right-6 sm:px-4 sm:py-2 sm:text-xs sm:tracking-widest sm:font-normal sm:min-h-0",
            isLight
              ? "sm:bg-prism-text-primary/10 sm:text-slate-700 sm:border-prism-text-primary/20"
              : "sm:bg-prism-text-primary/10 sm:text-prism-text-primary/80 sm:border-prism-text-primary/20"
          )}
          aria-label="Skip Introduction"
        >
          <FastForward size={14} className={isLight ? "text-cyan-600" : "text-cyan-400"} />
          <span>Skip Intro</span>
          <span className="hidden sm:inline-block text-[10px] bg-prism-text-primary/20 px-1.5 py-0.5 rounded text-prism-text-primary/90 ml-1">
            ESC
          </span>
        </motion.button>
      )}

      <SequenceOrchestrator />
      
      {/* 0. MISINFORMATION DECEPTION HOOK (0s - 2.5s) */}
      <AnimatePresence>
        {!isSequenceComplete && openingSequenceStep === 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10, filter: 'blur(8px)' }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
            className="absolute inset-0 z-30 flex flex-col items-center justify-center text-center p-6 pointer-events-none"
          >
            <h2 className={cn("font-serif italic text-3xl md:text-5xl font-light tracking-wide max-w-3xl leading-relaxed", isLight ? "text-slate-800" : "text-amber-200/90")}>
              "In an era of engineered deception..."
            </h2>
            <p className={cn("font-sans text-xs uppercase tracking-[0.4em] mt-6 font-light", isLight ? "text-slate-500" : "text-gray-400")}>
              When everything is presented as fact, how do you recognize truth?
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1 & 4. PLAUSIBLE INFORMATION CHAOS -> TRANSFORMED TRUTH NODES */}
      <AnimatePresence>
        {!isSequenceComplete && openingSequenceStep >= 1 && openingSequenceStep <= 5 && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {CHAOS_ITEMS.map((item, idx) => {
              if (isMobile && !item.mobilePos) return null;
              const currentPos = isMobile && item.mobilePos ? item.mobilePos : item.pos;
              const isTransformed = openingSequenceStep >= 4;
              return (
                <motion.div
                  key={item.id}
                  style={currentPos}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{
                    opacity: isTransformed ? 0.95 : 0.55,
                    y: isTransformed ? 0 : [0, -8, 0],
                    scale: isTransformed ? 1 : [0.98, 1, 0.98]
                  }}
                  transition={{
                    opacity: { duration: 1.2 },
                    y: { duration: 4 + idx, repeat: isTransformed ? 0 : Infinity, ease: "easeInOut" },
                    scale: { duration: 3 + idx, repeat: isTransformed ? 0 : Infinity, ease: "easeInOut" }
                  }}
                  className="absolute max-w-[270px] sm:max-w-sm"
                >
                  {!isTransformed ? (
                    // Plausible Claim Fragment in Darkness
                    <div className={cn("font-mono text-[11px] sm:text-xs p-2.5 sm:p-3.5 rounded-lg backdrop-blur-sm shadow-lg leading-relaxed tracking-wide border", isLight ? "text-slate-700 bg-prism-text-primary/50 border-slate-200" : "text-gray-300 bg-white/[0.03] border-white/[0.08]")}>
                      <span className={cn("mr-2", isLight ? "text-slate-500" : "text-amber-400/80")}>?</span>
                      "{item.raw}"
                    </div>
                  ) : (
                    // Transformed Analysis Node
                    <motion.div 
                      initial={{ opacity: 0, filter: "blur(10px)" }}
                      animate={{ opacity: 1, filter: "blur(0px)" }}
                      transition={{ duration: 1, delay: idx * 0.15 }}
                      className={cn("font-mono text-[11px] sm:text-xs p-2.5 sm:p-3.5 rounded-xl backdrop-blur-md border", isLight ? "text-emerald-800 bg-emerald-100/50 border-emerald-500/20" : "text-emerald-300/90 bg-emerald-950/30 border-emerald-500/40")}
                    >
                      <div className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-emerald-600 mb-1 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {item.tag}
                      </div>
                      <div className="text-[10px] sm:text-[11px] font-sans mb-1.5">"{item.raw}"</div>
                      <div className="text-[8px] sm:text-[9px] text-emerald-700/80 border-t border-emerald-500/20 pt-1">
                        {item.detail}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </AnimatePresence>

      {/* SIGNATURE OPTICAL MOMENT (Step 4 Refraction Flash Sweep) */}
      <AnimatePresence>
        {!isSequenceComplete && openingSequenceStep === 4 && (
          <motion.div
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{
              opacity: [0, 0.9, 0],
              backdropFilter: ['blur(0px)', 'blur(10px) contrast(125%)', 'blur(0px)']
            }}
            transition={{ duration: 1.4, ease: "easeOut" }}
            className="absolute inset-0 z-20 pointer-events-none mix-blend-screen"
            style={{
              background: 'radial-gradient(circle at 50% 50%, rgba(139,92,246,0.25), rgba(16,185,129,0.2), transparent 70%)'
            }}
          />
        )}
      </AnimatePresence>

      {/* IDENTITY REVEAL (Step 5 & 6) */}
      <AnimatePresence>
        {!isSequenceComplete && (openingSequenceStep === 5 || openingSequenceStep === 6) && (
          <motion.div 
            initial={{ opacity: 0, y: 20, filter: "blur(14px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={{ opacity: 0, transition: { duration: 1 } }}
            transition={{ duration: 2, ease: "easeOut" }}
            className="absolute inset-0 z-20 flex flex-col items-center justify-center text-center pointer-events-none"
          >
            <h1 className={cn("text-7xl md:text-8xl font-extralight tracking-[0.35em] uppercase mb-4 font-sans", isLight ? "text-slate-900" : "text-prism-text-primary")}>
              PRISM
            </h1>
            <p className={cn("text-xs md:text-sm font-serif italic tracking-[0.3em] font-light border-t pt-4 px-10", isLight ? "text-slate-600 border-slate-300" : "text-gray-300 border-prism-text-primary/10")}>
              Misinformation & Credibility Analyzer
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3D Canvas Scene */}
      <div className="absolute inset-0">
        <Canvas>
          <CinematicCamera mousePosition={mousePosition} openingSequenceStep={openingSequenceStep} isSequenceComplete={isSequenceComplete} />
          
          <fog attach="fog" args={[fogColor, 8, 35]} />
          <ambientLight intensity={isLight ? 0.9 : (ambientIntensity > 0 ? ambientIntensity : 0.15)} />
          
          <ParticleField mousePosition={mousePosition} openingSequenceStep={openingSequenceStep} theme={theme} />
          <VolumetricDustCloud openingSequenceStep={openingSequenceStep} theme={theme} />
          
          {!isSequenceComplete && openingSequenceStep >= 2 && (
            <FirstLightBeam openingSequenceStep={openingSequenceStep} />
          )}
          
          {!isSequenceComplete && openingSequenceStep >= 4 && (
            <RefractedSpectrumFan openingSequenceStep={openingSequenceStep} />
          )}
          
          {/* Twin Enlarged Revolving Flanking Prisms during Step 6 (Workspace Carving Transition) */}
          {!isSequenceComplete && openingSequenceStep === 6 && (
            <TwinFlankingPrisms mousePosition={mousePosition} />
          )}
          
          {(isSequenceComplete || openingSequenceStep >= 3) && openingSequenceStep !== 6 && (
            <SmoothPrismAnchor 
              prismPosition={prismPosition} 
              prismScale={prismScale} 
              mousePosition={mousePosition}
              readingModeWipe={readingModeWipe}
            />
          )}
        </Canvas>
      </div>

      {/* Awards Show Style Broadcast Optical Light Streak Wipe */}
      <AnimatePresence>
        {readingModeWipe && (
          <div className="fixed inset-0 overflow-hidden pointer-events-none z-30">
            <motion.div
              key={`awards-wipe-${readingModeWipe}`}
              initial={{ left: readingModeWipe === 'enter' ? '-30%' : '110%', opacity: 0 }}
              animate={{ 
                left: readingModeWipe === 'enter' ? '110%' : '-30%',
                opacity: [0, 0.85, 1, 0]
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.95, ease: [0.25, 0.1, 0.25, 1.0] }}
              className={cn(
                "absolute inset-y-0 w-72 sm:w-96 pointer-events-none",
                isLight ? "mix-blend-normal" : "mix-blend-screen"
              )}
              style={{
                background: isLight
                  ? 'linear-gradient(90deg, transparent, rgba(220,38,38,0.25), rgba(239,68,68,0.5), rgba(244,63,94,0.35), transparent)'
                  : 'linear-gradient(90deg, transparent, rgba(34,211,238,0.5), rgba(255,255,255,0.9), rgba(168,85,247,0.5), transparent)',
                transform: 'skewX(-20deg)',
                filter: 'blur(12px)'
              }}
            />
          </div>
        )}
      </AnimatePresence>
      
      {/* Subtle Vignette Overlay */}
      {!isLight && (
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_180px_rgba(0,0,0,0.95)]" />
      )}
    </div>
  );
};
