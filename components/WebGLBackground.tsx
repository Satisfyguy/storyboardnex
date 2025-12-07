
import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Fix for TypeScript errors regarding missing JSX intrinsic elements
declare global {
  namespace JSX {
    interface IntrinsicElements {
      mesh: any;
      planeGeometry: any;
      shaderMaterial: any;
    }
  }
}

// Custom shader for the industrial grid and noise
const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const fragmentShader = `
  uniform float uTime;
  uniform float uScrollVelocity;
  uniform vec2 uResolution;
  varying vec2 vUv;

  // Pseudo-random noise
  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898,78.233))) * 43758.5453123);
  }

  void main() {
    vec2 st = vUv;
    
    // Vertical Grid Lines
    float gridX = step(0.98, fract(st.x * 20.0 + uScrollVelocity * 0.001)); // Vertical lines
    
    // Scanline effect
    float scanline = sin(st.y * 800.0 + uTime * 5.0) * 0.05;
    
    // Noise grain
    float noise = random(st * uTime) * 0.12;

    // Vignette
    float d = length(st - 0.5);
    float vignette = 1.0 - smoothstep(0.4, 1.2, d);

    // Color composition: Dark Anthracite Background
    vec3 color = vec3(0.145, 0.149, 0.153); // #252627 base
    
    // Add grid lines (faint white/blueish)
    color += vec3(gridX) * 0.08;
    
    // Add noise and scanlines
    color -= noise;
    color -= scanline;
    
    // Apply vignette
    color *= vignette;

    gl_FragColor = vec4(color, 1.0);
  }
`;

interface SceneProps {
  velocityRef: React.MutableRefObject<number>;
}

const BackgroundScene: React.FC<SceneProps> = ({ velocityRef }) => {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const { viewport } = useThree();

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uScrollVelocity: { value: 0 },
      uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
    }),
    [viewport]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.getElapsedTime();
      
      // Access velocity directly from ref to avoid React re-renders
      const targetVelocity = velocityRef.current;
      
      // Smoothly interpolate velocity for visual effect
      materialRef.current.uniforms.uScrollVelocity.value = THREE.MathUtils.lerp(
        materialRef.current.uniforms.uScrollVelocity.value,
        targetVelocity,
        0.1
      );
    }
  });

  return (
    <mesh ref={meshRef} scale={[viewport.width, viewport.height, 1]}>
      <planeGeometry args={[1, 1]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
};

export interface WebGLBackgroundProps {
  velocityRef: React.MutableRefObject<number>;
}

const WebGLBackground: React.FC<WebGLBackgroundProps> = ({ velocityRef }) => {
  return (
    <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none">
      <Canvas camera={{ position: [0, 0, 1] }} dpr={[1, 2]}>
        <BackgroundScene velocityRef={velocityRef} />
      </Canvas>
    </div>
  );
};

export default WebGLBackground;
