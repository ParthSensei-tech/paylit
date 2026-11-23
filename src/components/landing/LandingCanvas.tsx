"use client";

import React, { useRef, useMemo, useEffect, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { createSceneCanvasTexture } from "./ScreenTextures";

interface SceneProps {
  sceneIndex: number;
  progress: number;
  mousePos: { x: number; y: number };
}

// Procedural 3D Laptop Model
function ProceduralLaptop({ sceneIndex, progress, mousePos }: SceneProps) {
  const laptopGroupRef = useRef<THREE.Group>(null);
  const lidGroupRef = useRef<THREE.Group>(null);
  const screenMeshRef = useRef<THREE.Mesh>(null);

  // Cache textures for the 6 scenes
  const textures = useMemo(() => {
    if (typeof window === "undefined") return [];
    return [0, 1, 2, 3, 4, 5].map((i) => createSceneCanvasTexture(i));
  }, []);

  useFrame(() => {
    if (!laptopGroupRef.current || !lidGroupRef.current) return;

    // Mouse tilt (max 6 deg ~ 0.1 rad)
    const targetTiltX = (mousePos.y * 0.08);
    const targetTiltY = (mousePos.x * 0.1);
    laptopGroupRef.current.rotation.x = THREE.MathUtils.lerp(laptopGroupRef.current.rotation.x, targetTiltX, 0.05);
    laptopGroupRef.current.rotation.y = THREE.MathUtils.lerp(laptopGroupRef.current.rotation.y, targetTiltY, 0.05);

    // Scene camera/device transitions
    if (sceneIndex === 0) {
      // Scene 1: Starts closed (angle 0), opens to 105 deg (1.83 rad) as you scroll
      const lidAngle = THREE.MathUtils.lerp(0.05, 1.85, Math.min(1, progress * 2.5));
      lidGroupRef.current.rotation.x = THREE.MathUtils.lerp(lidGroupRef.current.rotation.x, -lidAngle, 0.1);
      laptopGroupRef.current.position.set(0, -0.6, 0);
      laptopGroupRef.current.scale.set(1.1, 1.1, 1.1);
    } else if (sceneIndex === 1) {
      // Scene 2: Camera pushes into screen, tilted slightly
      lidGroupRef.current.rotation.x = -1.85;
      laptopGroupRef.current.position.set(0.4, -0.4, 1.8);
      laptopGroupRef.current.rotation.y = -0.15;
    } else if (sceneIndex === 2) {
      // Scene 3: Laptop pitches 15 deg left to make room for phone on right
      lidGroupRef.current.rotation.x = -1.85;
      laptopGroupRef.current.position.set(-1.8, -0.5, 0.6);
      laptopGroupRef.current.rotation.y = 0.35;
    } else if (sceneIndex === 3) {
      // Scene 4: Macro zoom to flagged posting / clause
      lidGroupRef.current.rotation.x = -1.85;
      laptopGroupRef.current.position.set(-0.2, -0.2, 2.2);
      laptopGroupRef.current.rotation.y = 0.05;
    } else if (sceneIndex === 4) {
      // Scene 5: Dual device perspective
      lidGroupRef.current.rotation.x = -1.85;
      laptopGroupRef.current.position.set(-1.4, -0.5, 0.4);
      laptopGroupRef.current.rotation.y = 0.25;
    } else {
      // Scene 6: Devices settle and dolly back
      lidGroupRef.current.rotation.x = -1.85;
      laptopGroupRef.current.position.set(-1.2, -0.6, -0.5);
      laptopGroupRef.current.rotation.y = 0.15;
    }

    // Update screen texture when scene changes
    if (screenMeshRef.current && textures[sceneIndex]) {
      screenMeshRef.current.material = new THREE.MeshStandardMaterial({
        map: textures[sceneIndex],
        roughness: 0.2,
        metalness: 0.1,
      });
    }
  });

  return (
    <group ref={laptopGroupRef} position={[0, -0.6, 0]}>
      {/* Laptop Base (keyboard deck) */}
      <mesh position={[0, 0, 0]} castShadow receiveShadow>
        <boxGeometry args={[3.2, 0.08, 2.2]} />
        <meshStandardMaterial color="#2A2426" metalness={0.8} roughness={0.3} />
      </mesh>

      {/* Trackpad */}
      <mesh position={[0, 0.045, 0.65]}>
        <planeGeometry args={[1.0, 0.65]} />
        <meshStandardMaterial color="#352D30" roughness={0.5} />
      </mesh>

      {/* Keyboard Area */}
      <mesh position={[0, 0.045, -0.25]}>
        <planeGeometry args={[2.8, 1.1]} />
        <meshStandardMaterial color="#161012" roughness={0.7} />
      </mesh>

      {/* Lid Group (Hinged at back of base: z = -1.1) */}
      <group ref={lidGroupRef} position={[0, 0.04, -1.1]}>
        {/* Lid Body */}
        <mesh position={[0, 1.05, 0]} castShadow>
          <boxGeometry args={[3.2, 2.1, 0.06]} />
          <meshStandardMaterial color="#2A2426" metalness={0.85} roughness={0.25} />
        </mesh>

        {/* Screen Bezel & Display Plane */}
        <mesh ref={screenMeshRef} position={[0, 1.05, 0.035]}>
          <planeGeometry args={[3.0, 1.9]} />
          <meshStandardMaterial
            map={textures[sceneIndex] || null}
            roughness={0.2}
            metalness={0.05}
          />
        </mesh>
      </group>
    </group>
  );
}

// Procedural 3D Phone Model
function ProceduralPhone({ sceneIndex, progress, mousePos }: SceneProps) {
  const phoneGroupRef = useRef<THREE.Group>(null);
  const phoneScreenRef = useRef<THREE.Mesh>(null);

  const phoneTexture = useMemo(() => {
    if (typeof window === "undefined") return null;
    return createSceneCanvasTexture(sceneIndex >= 4 ? 4 : 2);
  }, [sceneIndex]);

  useFrame(() => {
    if (!phoneGroupRef.current) return;

    if (sceneIndex < 2) {
      // Offscreen right before Scene 3
      phoneGroupRef.current.position.set(6, -2, 0);
      phoneGroupRef.current.scale.set(0.01, 0.01, 0.01);
    } else if (sceneIndex === 2) {
      // Scene 3: Phone slides in from right
      phoneGroupRef.current.position.set(1.9, -0.2, 1.0);
      phoneGroupRef.current.rotation.set(-0.15, -0.35 + mousePos.x * 0.05, 0.05);
      phoneGroupRef.current.scale.set(0.85, 0.85, 0.85);
    } else if (sceneIndex === 3) {
      phoneGroupRef.current.position.set(2.4, -0.4, 0.6);
      phoneGroupRef.current.rotation.set(-0.1, -0.4, 0.05);
      phoneGroupRef.current.scale.set(0.75, 0.75, 0.75);
    } else if (sceneIndex === 4) {
      // Scene 5: Phone takes prominent focus alongside laptop
      phoneGroupRef.current.position.set(1.5, 0.1, 1.6);
      phoneGroupRef.current.rotation.set(-0.08, -0.2, 0);
      phoneGroupRef.current.scale.set(1.0, 1.0, 1.0);
    } else {
      // Scene 6: Docks symmetrically
      phoneGroupRef.current.position.set(1.4, -0.5, 0.2);
      phoneGroupRef.current.rotation.set(-0.1, -0.2, 0);
      phoneGroupRef.current.scale.set(0.8, 0.8, 0.8);
    }
  });

  return (
    <group ref={phoneGroupRef} position={[6, 0, 0]}>
      {/* Phone Body (Brushed Titanium) */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.2, 2.4, 0.08]} />
        <meshStandardMaterial color="#1E1719" metalness={0.9} roughness={0.2} />
      </mesh>

      {/* Screen */}
      <mesh ref={phoneScreenRef} position={[0, 0, 0.045]}>
        <planeGeometry args={[1.12, 2.3]} />
        <meshStandardMaterial
          map={phoneTexture || undefined}
          roughness={0.15}
          metalness={0.1}
        />
      </mesh>
    </group>
  );
}

// Floating Subtle Dust Particles for Parallax Depth
function FloatingDust() {
  const pointsRef = useRef<THREE.Points>(null);
  const count = 120;

  const [positions] = useState(() => {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 12;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 8;
    }
    return pos;
  });

  useFrame((state) => {
    if (!pointsRef.current) return;
    pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.02;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.035}
        color="#F0D9DD"
        transparent
        opacity={0.35}
        sizeAttenuation
      />
    </points>
  );
}

export default function LandingCanvas({
  sceneIndex,
  progress,
}: {
  sceneIndex: number;
  progress: number;
}) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (typeof window !== "undefined") {
      const handleMouseMove = (e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        setMousePos({ x, y });
      };

      window.addEventListener("mousemove", handleMouseMove, { passive: true });
      return () => window.removeEventListener("mousemove", handleMouseMove);
    }
  }, []);

  return (
    <div className="w-full h-full relative">
      <Canvas
        camera={{ position: [0, 0.4, 5.2], fov: 42 }}
        shadows
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        className="w-full h-full pointer-events-none"
      >
        {/* Lighting: Deep stage, white key, and Cherry Red (#C8102E) rim light */}
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[4, 6, 5]}
          intensity={1.5}
          castShadow
          shadow-mapSize={[1024, 1024]}
        />
        {/* Cherry Red Volumetric Rim Light */}
        <pointLight position={[-4, 3, -2]} color="#C8102E" intensity={4.5} distance={18} />
        <pointLight position={[3, -2, 2]} color="#C8102E" intensity={2.5} distance={12} />

        {/* 3D Devices */}
        <ProceduralLaptop sceneIndex={sceneIndex} progress={progress} mousePos={mousePos} />
        <ProceduralPhone sceneIndex={sceneIndex} progress={progress} mousePos={mousePos} />

        {/* Floating dust particles */}
        <FloatingDust />

        {/* Soft Shadow Ground Plane */}
        <mesh position={[0, -1.8, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[20, 20]} />
          <shadowMaterial opacity={0.35} />
        </mesh>
      </Canvas>
    </div>
  );
}
