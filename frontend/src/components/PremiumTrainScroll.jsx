import React, { useRef, useEffect, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Environment, ContactShadows, Float } from '@react-three/drei'
import * as THREE from 'three'

function Train({ scrollProgress }) {
  const trainGroup = useRef()

  useFrame((state, delta) => {
    // Easing for smooth deceleration (easeOutCubic)
    const easeOutCubic = (x) => 1 - Math.pow(1 - x, 3)
    const p = easeOutCubic(scrollProgress)
    
    // Train starts far right (x = 35) and stops at center/left (x = -2)
    const targetX = 35 - (p * 37)
    
    // Smooth lerp to the target position
    trainGroup.current.position.x = THREE.MathUtils.lerp(
      trainGroup.current.position.x, 
      targetX, 
      delta * 5
    )
    
    // Subtle tilt based on movement speed for dynamic feel
    const speed = trainGroup.current.position.x - targetX
    trainGroup.current.rotation.z = THREE.MathUtils.lerp(
      trainGroup.current.rotation.z, 
      speed * 0.05, 
      delta * 5
    )
  })

  return (
    <group ref={trainGroup}>
      <Float speed={2} rotationIntensity={0.02} floatIntensity={0.2}>
        
        {/* Main Body */}
        <mesh position={[0, 1.6, 0]} rotation={[0, 0, -Math.PI / 2]} castShadow receiveShadow>
          <capsuleGeometry args={[1.2, 10, 32, 32]} />
          <meshPhysicalMaterial 
            color="#ffffff" 
            metalness={0.6} 
            roughness={0.2} 
            clearcoat={1} 
            clearcoatRoughness={0.1} 
          />
        </mesh>
        
        {/* Dark Cockpit Glass */}
        <mesh position={[-3.5, 1.8, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <capsuleGeometry args={[1.25, 3, 32, 32]} />
          <meshPhysicalMaterial 
            color="#09090b" 
            metalness={0.9} 
            roughness={0.1} 
            clearcoat={1} 
          />
        </mesh>

        {/* Side Fins */}
        <mesh position={[0, 1.2, 1.3]} castShadow>
          <boxGeometry args={[10, 0.2, 0.4]} />
          <meshPhysicalMaterial color="#18181b" metalness={0.8} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.2, -1.3]} castShadow>
          <boxGeometry args={[10, 0.2, 0.4]} />
          <meshPhysicalMaterial color="#18181b" metalness={0.8} roughness={0.4} />
        </mesh>

        {/* Glowing side strips */}
        <mesh position={[0, 1.25, 1.51]}>
          <boxGeometry args={[8, 0.05, 0.05]} />
          <meshBasicMaterial color="#00ffcc" />
        </mesh>
        <mesh position={[0, 1.25, -1.51]}>
          <boxGeometry args={[8, 0.05, 0.05]} />
          <meshBasicMaterial color="#00ffcc" />
        </mesh>
        
        {/* Front Headlight */}
        <mesh position={[-6.1, 1.6, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <capsuleGeometry args={[0.3, 0.4, 16, 16]} />
          <meshBasicMaterial color="#00ffcc" />
        </mesh>

        {/* Undercarriage base */}
        <mesh position={[0, 0.6, 0]} castShadow>
          <boxGeometry args={[10, 0.8, 1.8]} />
          <meshStandardMaterial color="#09090b" metalness={0.8} roughness={0.5} />
        </mesh>

      </Float>
    </group>
  )
}

function EnvironmentScene() {
  return (
    <group>
      {/* Rails */}
      <mesh position={[0, 0.1, 1.5]} receiveShadow>
        <boxGeometry args={[200, 0.2, 0.2]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.8} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0.1, -1.5]} receiveShadow>
        <boxGeometry args={[200, 0.2, 0.2]} />
        <meshStandardMaterial color="#3f3f46" metalness={0.8} roughness={0.4} />
      </mesh>
      
      {/* Platform/Base */}
      <mesh position={[0, -0.5, 0]} receiveShadow>
        <boxGeometry args={[200, 1, 12]} />
        <meshStandardMaterial color="#18181b" />
      </mesh>

      {/* Decorative track lights */}
      {Array.from({ length: 40 }).map((_, i) => (
        <mesh key={i} position={[-100 + i * 5, 0.2, 2]}>
          <boxGeometry args={[0.2, 0.1, 0.1]} />
          <meshBasicMaterial color="#00ffcc" />
        </mesh>
      ))}
    </group>
  )
}

export default function PremiumTrainScroll() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const scrolled = window.scrollY
          const maxScroll = document.body.scrollHeight - window.innerHeight
          // Fallback to 0 if maxScroll is 0 to avoid NaN
          const p = maxScroll > 0 ? Math.max(0, Math.min(1, scrolled / maxScroll)) : 0
          setProgress(p)
          ticking = false
        })
        ticking = true
      }
    }
    
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div style={{ width: '100%', height: '500vh', backgroundColor: '#09090b', fontFamily: 'system-ui, sans-serif' }}>
      <div style={{ position: 'sticky', top: 0, width: '100%', height: '100vh', overflow: 'hidden' }}>
        
        {/* 3D Scene */}
        <Canvas shadows camera={{ position: [2, 6, 18], fov: 35 }}>
          <color attach="background" args={['#09090b']} />
          <fog attach="fog" args={['#09090b', 15, 45]} />
          
          <ambientLight intensity={0.4} />
          <directionalLight 
            position={[10, 15, 10]} 
            intensity={2} 
            castShadow 
            shadow-mapSize={[2048, 2048]} 
          />
          <spotLight 
            position={[-15, 10, 10]} 
            intensity={1.5} 
            angle={0.4} 
            penumbra={1} 
            color="#00ffcc" 
          />
          
          <Train scrollProgress={progress} />
          <EnvironmentScene />
          
          <ContactShadows position={[0, 0.05, 0]} opacity={0.6} scale={40} blur={2.5} far={10} />
          <Environment preset="city" />
        </Canvas>

        {/* Premium UI Overlay */}
        <div 
          style={{ 
            position: 'absolute', 
            top: '15%', 
            left: '10%', 
            color: 'white',
            pointerEvents: 'none'
          }}
        >
          <h1 style={{ 
            fontSize: '5rem', 
            fontWeight: 800, 
            margin: 0, 
            letterSpacing: '-0.04em',
            textShadow: '0 4px 20px rgba(0,0,0,0.5)'
          }}>
            AERO<span style={{ color: '#00ffcc' }}>RAIL</span>
          </h1>
          <p style={{ 
            color: '#a1a1aa', 
            fontSize: '1.2rem', 
            marginTop: '1rem', 
            maxWidth: '400px',
            lineHeight: 1.6
          }}>
            Experience the future of high-speed transit. Scroll down to initiate arrival sequence.
          </p>
        </div>
        
        {/* Scroll Indicator */}
        <div style={{
          position: 'absolute',
          bottom: '10%',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '8px',
          opacity: 1 - (progress * 2),
          transition: 'opacity 0.3s ease',
          color: '#a1a1aa',
          pointerEvents: 'none'
        }}>
          <div style={{ fontSize: '0.875rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Scroll</div>
          <div style={{ width: '1px', height: '40px', background: 'linear-gradient(to bottom, #00ffcc, transparent)' }}></div>
        </div>

      </div>
    </div>
  )
}
