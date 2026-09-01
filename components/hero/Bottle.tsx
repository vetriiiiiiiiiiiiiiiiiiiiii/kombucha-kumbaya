'use client';

import { useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * The Kumbayah bottle, built in code rather than loaded as a model:
 * a lathed glass profile, an amber body of liquid inside it, a printed label
 * drawn onto a canvas texture, and a crown cap. No GLTF to download, and the
 * silhouette can be tuned in one array of points.
 */

/** Bottle silhouette, bottom to top. x = radius, y = height. */
const GLASS_PROFILE: Array<[number, number]> = [
  [0.0, -2.0],
  [0.5, -2.0],
  [0.66, -1.985],
  [0.7, -1.93],
  [0.705, -1.84],
  [0.705, 0.5],
  [0.7, 0.72],
  [0.655, 0.95],
  [0.53, 1.19],
  [0.37, 1.4],
  [0.27, 1.58],
  [0.245, 1.74],
  [0.243, 2.02],
  [0.278, 2.07],
  [0.278, 2.16],
  [0.2, 2.16],
  [0.0, 2.16],
];

const FILL_TOP = 1.24;

function latheFrom(points: Array<[number, number]>, segments = 96) {
  return new THREE.LatheGeometry(
    points.map(([x, y]) => new THREE.Vector2(x, y)),
    segments
  );
}

/** Liquid profile: the glass profile pulled in slightly and cut at the fill line. */
function liquidProfile(): Array<[number, number]> {
  const inner = GLASS_PROFILE.filter(([, y]) => y <= FILL_TOP).map(
    ([x, y]) => [Math.max(x - 0.045, 0), y] as [number, number]
  );
  const last = inner[inner.length - 1];
  return [...inner, [Math.max(last[0] - 0.02, 0), FILL_TOP + 0.02], [0, FILL_TOP + 0.03]];
}

/** The printed label, drawn once into a canvas and used as a texture. */
function useLabelTexture(flavour: string, accent: string) {
  return useMemo(() => {
    if (typeof document === 'undefined') return null;
    const c = document.createElement('canvas');
    c.width = 1024;
    c.height = 512;
    const ctx = c.getContext('2d');
    if (!ctx) return null;

    ctx.fillStyle = '#EFE7D8';
    ctx.fillRect(0, 0, 1024, 512);

    // paper tooth
    for (let i = 0; i < 5200; i++) {
      ctx.fillStyle = `rgba(23,17,9,${Math.random() * 0.05})`;
      ctx.fillRect(Math.random() * 1024, Math.random() * 512, 1.4, 1.4);
    }

    ctx.textAlign = 'center';
    ctx.fillStyle = '#171109';
    ctx.font = '600 74px Georgia, serif';
    ctx.fillText('KUMBAYAH', 512, 190);

    ctx.strokeStyle = 'rgba(23,17,9,0.35)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(300, 226);
    ctx.lineTo(724, 226);
    ctx.stroke();

    ctx.fillStyle = accent;
    ctx.font = '400 40px Menlo, monospace';
    ctx.fillText(flavour.toUpperCase(), 512, 296);

    ctx.fillStyle = 'rgba(23,17,9,0.55)';
    ctx.font = '400 24px Menlo, monospace';
    ctx.fillText('F E R M E N T E D   3 0   D A Y S', 512, 366);
    ctx.fillText('3 3 0   M L', 512, 412);

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.anisotropy = 4;
    return tex;
  }, [flavour, accent]);
}

interface Props {
  accent: string;
  deep: string;
  flavour: string;
  /** 0–1 scroll progress through the hero */
  progress: React.MutableRefObject<number>;
  pointer: React.MutableRefObject<{ x: number; y: number }>;
  bubbleCount?: number;
}

export function Bottle({ accent, deep, flavour, progress, pointer, bubbleCount = 130 }: Props) {
  const group = useRef<THREE.Group>(null);
  const inner = useRef<THREE.Group>(null);
  const bubbles = useRef<THREE.InstancedMesh>(null);
  const { viewport } = useThree();

  const glassGeo = useMemo(() => latheFrom(GLASS_PROFILE), []);
  const liquidGeo = useMemo(() => latheFrom(liquidProfile(), 64), []);
  const labelTex = useLabelTexture(flavour, accent);

  const seeds = useMemo(
    () =>
      Array.from({ length: bubbleCount }, () => ({
        angle: Math.random() * Math.PI * 2,
        radius: Math.random() * 0.55,
        y: -1.9 + Math.random() * (FILL_TOP + 1.9),
        speed: 0.14 + Math.random() * 0.5,
        scale: 0.012 + Math.random() * 0.042,
        wobble: Math.random() * 2,
      })),
    [bubbleCount]
  );

  const dummy = useMemo(() => new THREE.Object3D(), []);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const p = progress.current;
    const d = Math.min(delta, 0.05);

    if (group.current) {
      // breathing float — the bottle is never quite still
      group.current.position.y = Math.sin(t * 0.55) * 0.055 - p * 0.5;

      // pointer parallax, damped
      const targetY = pointer.current.x * 0.5 + p * Math.PI * 1.15;
      const targetX = -pointer.current.y * 0.22 + p * 0.16;
      group.current.rotation.y += (targetY - group.current.rotation.y) * Math.min(d * 3.4, 1);
      group.current.rotation.x += (targetX - group.current.rotation.x) * Math.min(d * 3.4, 1);
      group.current.rotation.z = Math.sin(t * 0.4) * 0.012 + p * 0.14;

      // Narrow viewports get a smaller bottle so the headline still has room.
      const s = (viewport.width < 8 ? 0.74 : 0.92) * (1 + p * 0.16);
      group.current.scale.setScalar(s);
    }

    if (inner.current) {
      // liquid lags the glass a touch, as liquid does
      inner.current.rotation.y = Math.sin(t * 0.5) * 0.05;
    }

    if (bubbles.current) {
      // fizz builds as the visitor scrolls
      const rise = 1 + p * 2.6;
      for (let i = 0; i < seeds.length; i++) {
        const b = seeds[i];
        b.y += b.speed * d * rise;
        if (b.y > FILL_TOP - 0.04) b.y = -1.92;

        const wob = Math.sin(t * (0.9 + b.wobble) + i) * 0.028;
        dummy.position.set(
          Math.cos(b.angle) * b.radius + wob,
          b.y,
          Math.sin(b.angle) * b.radius + wob * 0.6
        );
        const grow = 1 + (b.y + 1.9) * 0.16;
        dummy.scale.setScalar(b.scale * grow);
        dummy.updateMatrix();
        bubbles.current.setMatrixAt(i, dummy.matrix);
      }
      bubbles.current.instanceMatrix.needsUpdate = true;
    }
  });

  return (
    <group ref={group} rotation={[0, 0, 0]}>
      {/* liquid */}
      <group ref={inner}>
        <mesh geometry={liquidGeo}>
          <meshPhysicalMaterial
            color={accent}
            roughness={0.18}
            metalness={0}
            transmission={0.55}
            thickness={1.6}
            ior={1.36}
            attenuationColor={deep}
            attenuationDistance={1.1}
            clearcoat={0.4}
          />
        </mesh>

        {/* fizz */}
        <instancedMesh ref={bubbles} args={[undefined, undefined, seeds.length]}>
          <sphereGeometry args={[1, 8, 8]} />
          <meshBasicMaterial color="#FFF6E4" transparent opacity={0.55} depthWrite={false} />
        </instancedMesh>
      </group>

      {/* glass */}
      <mesh geometry={glassGeo}>
        <meshPhysicalMaterial
          color="#EFE9DC"
          roughness={0.06}
          metalness={0}
          transmission={0.94}
          thickness={0.55}
          ior={1.48}
          reflectivity={0.6}
          clearcoat={1}
          clearcoatRoughness={0.05}
        />
      </mesh>

      {/* Label. Rotated a half turn: a cylinder maps u=0.5 to its far side,
          which would otherwise put the wordmark on the back of the bottle. */}
      {labelTex ? (
        <mesh position={[0, -0.5, 0]} rotation={[0, Math.PI, 0]}>
          <cylinderGeometry args={[0.716, 0.716, 1.16, 64, 1, true]} />
          <meshStandardMaterial
            map={labelTex}
            roughness={0.78}
            metalness={0}
            side={THREE.DoubleSide}
          />
        </mesh>
      ) : null}

      {/* crown cap */}
      <group position={[0, 2.24, 0]}>
        <mesh>
          <cylinderGeometry args={[0.3, 0.3, 0.2, 48]} />
          <meshStandardMaterial color={deep} roughness={0.32} metalness={0.85} />
        </mesh>
        <mesh position={[0, -0.09, 0]}>
          <cylinderGeometry args={[0.312, 0.28, 0.06, 48]} />
          <meshStandardMaterial color={accent} roughness={0.4} metalness={0.6} />
        </mesh>
      </group>
    </group>
  );
}
