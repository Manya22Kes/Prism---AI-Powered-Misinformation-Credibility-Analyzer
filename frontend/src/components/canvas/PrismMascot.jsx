import React, { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { MeshTransmissionMaterial, Float, Environment } from '@react-three/drei';
import { useCinematicStore } from '../../store/cinematicStore';
import * as THREE from 'three';
import { useThemeStore } from '../../store/themeStore';
import { useExperienceStore } from '../../store/experienceStore';

export const PrismMascot = ({ mousePosition = { normalizedX: 0, normalizedY: 0 } }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  const lightRef = useRef();
  const openingSequenceStep = useCinematicStore((state) => state.openingSequenceStep);
  const isSequenceComplete = useCinematicStore((state) => state.isSequenceComplete);
  const activeEnvironmentState = useExperienceStore((state) => state.activeEnvironmentState);
  const environmentalIntensity = useExperienceStore((state) => state.environmentalIntensity);
  const pipelineStage = useExperienceStore((state) => state.pipelineStage);
  const environmentalProfile = useExperienceStore((state) => state.environmentalProfile);
  const { theme } = useThemeStore();
  const isLight = theme === 'light';
  
  // Optical Glass Parameters: Slower, heavier, more deliberate rotation driven by Experience Controller
  const config = useMemo(() => {
    const baseScale = 2.4;
    let baseConfig;
    
    switch (activeEnvironmentState) {
      case 'idle':
        baseConfig = { rotSpeed: 0.012, pulseSpeed: 0.4, pulseIntensity: 0.012, floatSpeed: 0.35, scale: baseScale, targetLight: isLight ? 1.8 : 1.3 };
        break;
      case 'hover':
        baseConfig = { rotSpeed: 0.02, pulseSpeed: 0.6, pulseIntensity: 0.015, floatSpeed: 0.4, scale: baseScale * 1.02, targetLight: isLight ? 2.2 : 1.6 };
        break;
      case 'uploadReady':
        baseConfig = { rotSpeed: 0.05, pulseSpeed: 1.2, pulseIntensity: 0.025, floatSpeed: 0.6, scale: baseScale * 0.96, targetLight: isLight ? 2.8 : 2.2 };
        break;
      case 'processing':
        // Continuous intensity mapping: Heavy optical rotation, high internal dispersion
        baseConfig = { 
          rotSpeed: 0.003 + (environmentalIntensity * 0.0002), 
          pulseSpeed: 2.0 + (environmentalIntensity * 0.3), 
          pulseIntensity: 0.03 + (environmentalIntensity * 0.005), 
          floatSpeed: 0.6 + (environmentalIntensity * 0.05), 
          scale: baseScale * 1.08, 
          targetLight: (isLight ? 3.0 : 2.5) + (environmentalIntensity * 0.3)
        };
        break;
      case 'success':
        baseConfig = { rotSpeed: 0.03, pulseSpeed: 0.8, pulseIntensity: 0.03, floatSpeed: 0.35, scale: baseScale * 1.05, targetLight: 3.0 };
        break;
      case 'error':
        baseConfig = { rotSpeed: 0.005, pulseSpeed: 0.2, pulseIntensity: 0.008, floatSpeed: 0.1, scale: baseScale, targetLight: 0.6 };
        break;
      case 'reading':
        baseConfig = { rotSpeed: 0.004, pulseSpeed: 0.25, pulseIntensity: 0.006, floatSpeed: 0.15, scale: baseScale * 0.95, targetLight: 1.1 };
        break;
      case 'focus':
        baseConfig = { rotSpeed: 0.006, pulseSpeed: 0.3, pulseIntensity: 0.008, floatSpeed: 0.18, scale: baseScale * 0.98, targetLight: 1.3 };
        break;
      default:
        baseConfig = { rotSpeed: 0.012, pulseSpeed: 0.4, pulseIntensity: 0.012, floatSpeed: 0.35, scale: baseScale, targetLight: 1.3 };
        break;
    }

    // Apply baseline environmental profile modifiers
    switch (environmentalProfile) {
      case 'report':
        baseConfig.targetLight = Math.max(0.5, baseConfig.targetLight - 0.4);
        baseConfig.rotSpeed *= 0.6;
        break;
      case 'archive':
        baseConfig.targetLight = Math.max(0.4, baseConfig.targetLight - 0.6);
        baseConfig.rotSpeed *= 0.3;
        break;
      case 'missionControl':
        baseConfig.targetLight += 0.3;
        baseConfig.rotSpeed *= 1.2;
        break;
      case 'watchlist':
        baseConfig.targetLight += 0.1;
        baseConfig.rotSpeed *= 1.4;
        break;
      case 'workspace':
      default:
        break;
    }

    return baseConfig;
  }, [activeEnvironmentState, environmentalIntensity, environmentalProfile, isLight]);

  // Handle sequence opacity
  useEffect(() => {
    if (materialRef.current && !isSequenceComplete) {
      materialRef.current.opacity = openingSequenceStep >= 3 ? 1 : 0;
      materialRef.current.transparent = true;
    }
  }, [isSequenceComplete, openingSequenceStep]);

  // Optical Context Colors based on Semantic Pipeline Stage
  const targetColor = useMemo(() => {
    if (activeEnvironmentState === 'error') return new THREE.Color('#fef3c7'); // Restrained amber error
    if (activeEnvironmentState !== 'processing') return new THREE.Color(isLight ? '#0284c7' : '#38bdf8');
    
    switch (pipelineStage) {
      case 'extraction': return new THREE.Color('#e0f2fe'); // Soft cool blue
      case 'claims': return new THREE.Color('#f3e8ff'); // Subtle violet/spectral
      case 'evidence': return new THREE.Color('#cffafe'); // Subtle cyan
      case 'bias': return new THREE.Color('#fef3c7'); // Restrained amber
      case 'credibility': return new THREE.Color('#ffffff'); // Balanced white
      case 'report': return new THREE.Color('#ffffff');
      default: return new THREE.Color('#ffffff'); // input/default
    }
  }, [activeEnvironmentState, pipelineStage, isLight]);

  useFrame((state, delta) => {
    if (meshRef.current) {
      // Deliberate heavy optical rotation
      meshRef.current.rotation.y += delta * config.rotSpeed;
      meshRef.current.rotation.x += delta * (config.rotSpeed * 0.25);
      
      // Subtle inertia parallax response to cursor position
      const targetRotationX = mousePosition.normalizedY * 0.10;
      const targetRotationY = mousePosition.normalizedX * 0.10;
      
      meshRef.current.rotation.x += (targetRotationX - meshRef.current.rotation.x) * delta * 0.3;
      meshRef.current.rotation.y += (targetRotationY - meshRef.current.rotation.y) * delta * 0.3;
      
      // Physically smooth breathing pulse
      const pulse = config.scale + Math.sin(state.clock.elapsedTime * config.pulseSpeed) * config.pulseIntensity;
      meshRef.current.scale.setScalar(pulse);
    }

    // Dynamic internal caustic light pulse reacting to processing core state and intensity
    if (lightRef.current) {
      // Pulse wave driven by environmental intensity
      const pulseWave = Math.sin(state.clock.elapsedTime * config.pulseSpeed) * (0.2 + (environmentalIntensity * 0.05));
      const desiredIntensity = config.targetLight + pulseWave;
      lightRef.current.intensity += (desiredIntensity - lightRef.current.intensity) * delta * 2.5;
      
      // Smooth continuous color transition for optical context
      lightRef.current.color.lerp(targetColor, delta * 1.5);
    }

    if (materialRef.current) {
      if (!isSequenceComplete && openingSequenceStep === 3) {
        materialRef.current.opacity = THREE.MathUtils.lerp(materialRef.current.opacity, 1, delta * 1.5);
      }
      
      // Dispersion increases slightly with intensity during processing
      const baseAberration = isLight ? 0.08 : 0.06;
      const targetAberration = activeEnvironmentState === 'processing' 
        ? baseAberration + (environmentalIntensity * 0.008) 
        : baseAberration;
      materialRef.current.chromaticAberration = THREE.MathUtils.lerp(
        materialRef.current.chromaticAberration, 
        targetAberration, 
        delta * 2
      );
    }
  });

  return (
    <group>
      <Float speed={config.floatSpeed} rotationIntensity={0.08} floatIntensity={0.25}>
        <mesh ref={meshRef} receiveShadow castShadow>
          <octahedronGeometry args={[1, 0]} />
          
          {/* Dense Optical Flint Glass (IoR 1.62 in Light mode for vivid edge definition and internal refractions) */}
          <MeshTransmissionMaterial 
            ref={materialRef}
            backside
            samples={20}
            thickness={isLight ? 2.5 : 2.2}
            chromaticAberration={isLight ? 0.08 : 0.06} // Vivid optical dispersion in Light mode
            anisotropy={0.15}
            distortion={0}
            distortionScale={0}
            temporalDistortion={0}
            ior={isLight ? 1.62 : 1.52} // Flint Glass in Light mode vs Crown Glass in Dark
            color="#ffffff"
            attenuationDistance={8}
            attenuationColor={isLight ? '#0284c7' : '#f8fafc'}
            roughness={0.01}
            envMapIntensity={isLight ? 2.4 : 1.8}
            clearcoat={1}
            clearcoatRoughness={0.01}
            transparent={true}
            transmission={1}
            opacity={!isSequenceComplete && openingSequenceStep < 3 ? 0 : 1}
          />
        </mesh>

        {/* Soft internal spectral glow keeping the settled prism calm & alive */}
        <pointLight ref={lightRef} position={[0, 0, 0]} color={isLight ? '#0284c7' : '#38bdf8'} intensity={isLight ? 1.8 : 1.3} distance={6} />
      </Float>

      {/* External Key & Rim Lighting */}
      <directionalLight position={[5, 5, 5]} intensity={isLight ? 2.2 : 1.6} color="#ffffff" />
      <directionalLight 
        position={[-5, -5, -5]} 
        intensity={(isLight ? 0.9 : 0.6) * (environmentalProfile === 'missionControl' ? 1.4 : 1.0)} 
        color={isLight ? '#38bdf8' : '#818cf8'} 
      />
      <Environment preset="city" />
    </group>
  );
};
