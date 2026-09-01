'use client';

import { Suspense, useMemo, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { Environment, Lightformer } from '@react-three/drei';
import * as THREE from 'three';
import { Bottle } from '@/components/hero/Bottle';

/**
 * The hero environment. Everything is generated at runtime — no HDRI download,
 * no model fetch — so the scene costs one shader compile and nothing on the
 * network. The canvas mounts only on capable devices (see Hero).
 */

/**
 * A dark amber well behind the bottle. It exists to give the glass something to
 * refract; it is deliberately dim, because a bright backdrop turns the frame
 * into a sunset and the product stops being the subject.
 */
function Backdrop({ deep }: { deep: string }) {
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 512;
    c.height = 512;
    const ctx = c.getContext('2d')!;
    const g = ctx.createRadialGradient(256, 286, 8, 256, 286, 250);
    g.addColorStop(0, '#6B4318');
    g.addColorStop(0.3, deep);
    g.addColorStop(0.62, '#100B06');
    g.addColorStop(1, '#070504');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 512, 512);
    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, [deep]);

  return (
    <mesh position={[0, 0.2, -6]}>
      <planeGeometry args={[30, 20]} />
      <meshBasicMaterial map={texture} toneMapped={false} />
    </mesh>
  );
}

interface Props {
  accent: string;
  deep: string;
  flavour: string;
  progress: React.MutableRefObject<number>;
  paused?: boolean;
  quality?: 'high' | 'low';
}

export default function BottleScene({
  accent,
  deep,
  flavour,
  progress,
  paused = false,
  quality = 'high',
}: Props) {
  const pointer = useRef({ x: 0, y: 0 });

  const onPointerMove = (e: React.PointerEvent) => {
    const { innerWidth, innerHeight } = window;
    pointer.current.x = (e.clientX / innerWidth - 0.5) * 2;
    pointer.current.y = (e.clientY / innerHeight - 0.5) * 2;
  };

  return (
    <div className="absolute inset-0" onPointerMove={onPointerMove}>
      <Canvas
        frameloop={paused ? 'never' : 'always'}
        dpr={quality === 'high' ? [1, 1.75] : [1, 1.25]}
        // The bottle stands 4.3 units tall; at fov 30 this frames it to about
        // two-thirds of the viewport height, with air above and below.
        camera={{ position: [0, 0, 12], fov: 30 }}
        gl={{
          antialias: quality === 'high',
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.toneMapping = THREE.ACESFilmicToneMapping;
          gl.toneMappingExposure = 0.92;
        }}
      >
        <Suspense fallback={null}>
          <Backdrop deep={deep} />

          <ambientLight intensity={0.35} />
          <directionalLight position={[4, 6, 5]} intensity={1.9} color="#FFE7C2" />
          <directionalLight position={[-5, 2, -3]} intensity={1.1} color={accent} />
          <pointLight position={[0, -2.6, 2.2]} intensity={3.2} color={accent} distance={7} />

          {/* studio built from light cards rather than an HDRI file */}
          <Environment resolution={quality === 'high' ? 256 : 128} frames={1}>
            <Lightformer form="rect" intensity={3.2} position={[3, 3, 3]} scale={[6, 9, 1]} color="#FFE9C9" />
            <Lightformer form="rect" intensity={1.5} position={[-4, 1, 2]} scale={[4, 8, 1]} color={accent} />
            <Lightformer form="circle" intensity={2} position={[0, 5, -3]} scale={6} color="#FFFFFF" />
            <Lightformer form="rect" intensity={0.9} position={[0, -4, 2]} scale={[8, 3, 1]} color={deep} />
          </Environment>

          <Bottle
            accent={accent}
            deep={deep}
            flavour={flavour}
            progress={progress}
            pointer={pointer}
            bubbleCount={quality === 'high' ? 140 : 60}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
