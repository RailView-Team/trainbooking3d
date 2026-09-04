import React, { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, BakeShadows, Html, Text, PerspectiveCamera } from '@react-three/drei';
import * as THREE from 'three';
import { Info, User, CheckCircle2, RotateCcw, Tag } from 'lucide-react';
import { generate3DLayout, getSeatAvailability } from '../coachData';

const SeatMesh = ({ seat, status, selected, recommended, focused, coachId, price, onToggle, setHovered }) => {
  const isAvail = status === 'available';
  const isRAC = status === 'RAC';
  const isOcc = status === 'occupied';

  let baseColor = '#1d4ed8'; // Standard blue for IR
  if (seat.type.includes('Exec')) baseColor = '#b91c1c';
  if (seat.type.includes('Bench')) baseColor = '#475569';

  let color = baseColor;
  let emissive = '#000000';
  let emissiveIntensity = 0;

  if (selected) {
    color = '#10b981';
    emissive = '#10b981';
    emissiveIntensity = 0.4;
  } else if (recommended) {
    color = '#f59e0b';
    emissive = '#f59e0b';
    emissiveIntensity = 0.3;
  } else if (isOcc) {
    color = '#1e293b';
  } else if (isRAC) {
    color = '#f59e0b';
  }

  const isChair = seat.type.includes('Chair') || seat.type.includes('Bench');
  const isBerth = seat.type.includes('Berth') || seat.type.includes('Side');
  
  const [hovered, setLocalHovered] = useState(false);
  const meshRef = useRef();

  useFrame((state, delta) => {
    const targetScale = hovered || selected ? 1.05 : 1;
    if (meshRef.current) {
      const s = THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale, delta * 12);
      meshRef.current.scale.set(s, s, s);
    }
  });

  return (
    <group 
      ref={meshRef}
      position={seat.position} 
      rotation={seat.rotation}
      onClick={(e) => {
        e.stopPropagation();
        if (isAvail || isRAC) onToggle(seat.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered({ ...seat, status });
        setLocalHovered(true);
        document.body.style.cursor = (isAvail || isRAC) ? 'pointer' : 'not-allowed';
      }}
      onPointerOut={() => {
        setHovered(null);
        setLocalHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[seat.size[0] * 0.95, seat.size[1], seat.size[2] * 0.95]} />
        <meshPhysicalMaterial 
          color={color} 
          roughness={0.7} 
          clearcoat={0.1}
          emissive={emissive}
          emissiveIntensity={emissiveIntensity}
        />
      </mesh>

      <Text 
        position={[0, seat.size[1]/2 + 0.01, 0]} 
        rotation={[-Math.PI/2, 0, 0]}
        fontSize={0.15} 
        color={selected ? "white" : (isOcc ? "#94a3b8" : "white")}
        anchorX="center" 
        anchorY="middle"
      >
        {seat.id}
      </Text>

      <mesh position={[0, -seat.size[1]/2 - 0.05, 0]} castShadow>
        <boxGeometry args={[seat.size[0]*0.9, 0.1, seat.size[2]*0.8]} />
        <meshStandardMaterial color="#475569" metalness={0.5} roughness={0.5} />
      </mesh>

      {isChair && (
        <group position={[0, 0.35, -seat.size[2]/2 + 0.1]}>
          <mesh castShadow receiveShadow rotation={[-0.15, 0, 0]}>
            <boxGeometry args={[seat.size[0] * 0.9, 0.7, 0.15]} />
            <meshPhysicalMaterial 
              color={color} 
              roughness={0.7}
              emissive={emissive}
              emissiveIntensity={emissiveIntensity}
            />
          </mesh>
          <Text 
            position={[0, 0.2, 0.08]} 
            rotation={[-0.15, 0, 0]}
            fontSize={0.15} 
            color={selected ? "white" : (isOcc ? "#94a3b8" : "white")}
            anchorX="center" 
            anchorY="middle"
          >
            {seat.id}
          </Text>
        </group>
      )}

      {isChair && (seat.type === 'Exec Chair' || seat.type === 'Chair') && (
        <>
          <mesh position={[-seat.size[0]/2, 0.25, 0]} castShadow>
            <boxGeometry args={[0.08, 0.05, seat.size[2]*0.8]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
          <mesh position={[seat.size[0]/2, 0.25, 0]} castShadow>
            <boxGeometry args={[0.08, 0.05, seat.size[2]*0.8]} />
            <meshStandardMaterial color="#334155" roughness={0.6} />
          </mesh>
        </>
      )}

      {isBerth && (seat.type.includes('Middle') || seat.type.includes('Upper')) && (
        <>
          <mesh position={[seat.size[0]/2 - 0.1, 0.5, seat.size[2]/2 - 0.1]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 1]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh position={[-seat.size[0]/2 + 0.1, 0.5, seat.size[2]/2 - 0.1]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 1]} />
            <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
          </mesh>
        </>
      )}

      {focused && (
        <Html position={[0, 1.0, 0]} center zIndexRange={[100, 0]}>
          <div className="bg-stone-900/95 backdrop-blur-md border border-stone-800 p-4 rounded-xl shadow-[0_10px_30px_rgba(0,0,0,0.5)] min-w-[200px] animate-in zoom-in-95 fade-in duration-300 pointer-events-none">
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-rose-600 text-white font-black px-2 py-0.5 rounded text-sm shadow-xl shadow-black/20">Seat {seat.id}</div>
              <div className="text-stone-500 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-stone-900/50 border border-stone-800 rounded">{coachId}</div>
            </div>
            <div className="text-white font-bold mb-1">{seat.type}</div>
            <div className="text-stone-400 text-xs mb-3">{seat.pos} Side</div>
            <div className="flex justify-between items-center pt-3 border-t border-stone-800/50">
              <span className="text-stone-500 text-[10px] uppercase tracking-widest font-bold">Base Fare</span>
              <span className="text-rose-400 font-black">₹{price}</span>
            </div>
          </div>
        </Html>
      )}
    </group>
  );
};

const CoachShell = ({ length, classCode }) => {
  const isSleeper = ['1A', '2A', '3A', 'SL'].includes(classCode);
  const baySize = isSleeper ? 4 : (classCode === 'CC' ? 1.5 : (classCode === 'EC' ? 2 : 1.3));
  const numBays = Math.floor(length / baySize);

  const wallColor = "#e5e0d8";
  const floorColor = classCode === '1A' || classCode === 'EC' ? "#6b7280" : "#292524";
  const roofColor = "#f5f5f0";

  return (
    <group>
      <mesh position={[0, -0.05, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, length]} />
        <meshStandardMaterial color={floorColor} roughness={0.8} />
      </mesh>
      
      <mesh position={[0, -0.04, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.0, length]} />
        <meshStandardMaterial color="#1c1917" roughness={0.9} />
      </mesh>

      <mesh position={[0, 2.8, 0]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, length]} />
        <meshStandardMaterial color={roofColor} roughness={0.9} />
      </mesh>
      <mesh position={[-2.05, 2.65, 0]} receiveShadow rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.05, length]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>
      <mesh position={[2.05, 2.65, 0]} receiveShadow rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.5, 0.05, length]} />
        <meshStandardMaterial color={roofColor} />
      </mesh>

      <mesh position={[-2.4, 0.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 0.9, length]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[2.4, 0.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 0.9, length]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      
      <mesh position={[-2.4, 2.3, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 0.8, length]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[2.4, 2.3, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 0.8, length]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {Array.from({ length: numBays + 1 }).map((_, i) => {
        const z = (i * baySize) - (length / 2);
        return (
          <group key={`pillar-${i}`}>
            <mesh position={[-2.4, 1.35, z]} receiveShadow castShadow>
              <boxGeometry args={[0.15, 1.1, 0.3]} />
              <meshStandardMaterial color={wallColor} />
            </mesh>
            <mesh position={[2.4, 1.35, z]} receiveShadow castShadow>
              <boxGeometry args={[0.15, 1.1, 0.3]} />
              <meshStandardMaterial color={wallColor} />
            </mesh>
            
            {i < numBays && (
              <>
                <mesh position={[-2.4, 1.35, z + baySize/2]}>
                  <boxGeometry args={[0.05, 0.9, baySize - 0.3]} />
                  <meshPhysicalMaterial color="#87ceeb" transparent opacity={0.3} roughness={0.1} transmission={0.9} clearcoat={1} ior={1.5} />
                </mesh>
                <mesh position={[2.4, 1.35, z + baySize/2]}>
                  <boxGeometry args={[0.05, 0.9, baySize - 0.3]} />
                  <meshPhysicalMaterial color="#87ceeb" transparent opacity={0.3} roughness={0.1} transmission={0.9} clearcoat={1} ior={1.5} />
                </mesh>
                
                <mesh position={[0, 2.78, z + baySize/2]}>
                  <boxGeometry args={[0.6, 0.05, 1.2]} />
                  <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
                </mesh>
                <pointLight position={[0, 2.5, z + baySize/2]} intensity={0.3} distance={6} color="#fffaed" />
                
                {isSleeper && (
                  <group position={[0, 2.7, z + baySize/2]}>
                    <mesh><cylinderGeometry args={[0.05, 0.05, 0.1]} /><meshStandardMaterial color="#444" /></mesh>
                    <mesh position={[0, -0.05, 0]} rotation={[0, 0, 0]}>
                      <boxGeometry args={[0.6, 0.01, 0.05]} />
                      <meshStandardMaterial color="#444" />
                    </mesh>
                    <mesh position={[0, -0.05, 0]} rotation={[0, Math.PI/2, 0]}>
                      <boxGeometry args={[0.6, 0.01, 0.05]} />
                      <meshStandardMaterial color="#444" />
                    </mesh>
                  </group>
                )}

                {isSleeper && (
                  <group position={[0.7, 1.0, z + baySize/2]}>
                    <mesh position={[-0.1, 0, 0]} castShadow><cylinderGeometry args={[0.02, 0.02, 2]} /><meshStandardMaterial color="#cbd5e1" metalness={0.8} /></mesh>
                    <mesh position={[0.1, 0, 0]} castShadow><cylinderGeometry args={[0.02, 0.02, 2]} /><meshStandardMaterial color="#cbd5e1" metalness={0.8} /></mesh>
                    <mesh position={[0, -0.5, 0]} castShadow><cylinderGeometry args={[0.01, 0.01, 0.2]} rotation={[0,0,Math.PI/2]} /><meshStandardMaterial color="#cbd5e1" metalness={0.8} /></mesh>
                    <mesh position={[0, 0, 0]} castShadow><cylinderGeometry args={[0.01, 0.01, 0.2]} rotation={[0,0,Math.PI/2]} /><meshStandardMaterial color="#cbd5e1" metalness={0.8} /></mesh>
                    <mesh position={[0, 0.5, 0]} castShadow><cylinderGeometry args={[0.01, 0.01, 0.2]} rotation={[0,0,Math.PI/2]} /><meshStandardMaterial color="#cbd5e1" metalness={0.8} /></mesh>
                  </group>
                )}
              </>
            )}
          </group>
        );
      })}

      <mesh position={[0, 1.4, length/2]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.8, 0.1]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </mesh>
      <mesh position={[0, 1.4, -length/2]} castShadow receiveShadow>
        <boxGeometry args={[1.6, 2.8, 0.1]} />
        <meshStandardMaterial color="#8b4513" roughness={0.7} />
      </mesh>

      {(classCode === 'CC' || classCode === 'EC' || classCode === '2S') && (
        <>
          <mesh position={[-1.6, 2.2, 0]} castShadow>
            <boxGeometry args={[1.4, 0.05, length]} />
            <meshStandardMaterial color="#cbd5e1" opacity={0.8} transparent />
          </mesh>
          <mesh position={[1.6, 2.2, 0]} castShadow>
            <boxGeometry args={[1.4, 0.05, length]} />
            <meshStandardMaterial color="#cbd5e1" opacity={0.8} transparent />
          </mesh>
        </>
      )}

      {classCode === '1A' && (
        <mesh position={[0.4, 1.4, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.05, 2.8, length]} />
          <meshStandardMaterial color="#f0ebd8" transparent opacity={0.95} />
        </mesh>
      )}
    </group>
  );
};

const Scene = ({ classCode, coachId, selectedSeats, recommendedSeatId, focusedSeatId, price, handleToggleSeat, setHoveredSeat }) => {
  const { seats, coachLength } = useMemo(() => generate3DLayout(classCode), [classCode]);
  const controlsRef = useRef();

  useFrame((state, delta) => {
    if (focusedSeatId && controlsRef.current) {
      const seat = seats.find(s => s.id === focusedSeatId);
      if (seat) {
        const target = new THREE.Vector3(...seat.position);
        controlsRef.current.target.lerp(target, delta * 4);
        
        const camTarget = new THREE.Vector3(0, 1.6, seat.position[2] - 2.5);
        state.camera.position.lerp(camTarget, delta * 3);
      }
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, coachLength / 2 - 1]} fov={60} />
      <fog attach="fog" args={['#0c0a09', 2, 25]} />
      <ambientLight intensity={0.4} color="#ffffff" />
      <Environment preset="city" environmentIntensity={0.5} />
      <directionalLight position={[15, 10, 5]} intensity={1.5} color="#ffedd5" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
      
      <CoachShell length={coachLength} classCode={classCode} />
      
      {seats.map(seat => (
        <SeatMesh 
          key={seat.id} 
          seat={seat} 
          status={getSeatAvailability(coachId, seat.id)}
          selected={selectedSeats.includes(seat.id)}
          recommended={seat.id === recommendedSeatId && !selectedSeats.includes(seat.id)}
          focused={seat.id === focusedSeatId}
          coachId={coachId}
          price={price}
          onToggle={handleToggleSeat}
          setHovered={setHoveredSeat}
        />
      ))}

      <ContactShadows position={[0, -0.04, 0]} opacity={0.6} scale={50} blur={2.5} far={4} color="#000000" />
      <BakeShadows />
      <OrbitControls 
        ref={controlsRef}
        makeDefault 
        minDistance={0.1} 
        maxDistance={20}
        maxPolarAngle={Math.PI / 2 - 0.05}
        enableDamping={true}
        dampingFactor={0.05}
        autoRotate={false}
        target={[0, 1.6, coachLength / 2 - 5]}
      />
    </>
  );
};

export default function CoachViewer3D({ classCode, coachId, selectedSeats, recommendedSeatId, focusedSeatId, price, onToggleSeat }) {
  const [hoveredSeat, setHoveredSeat] = useState(null);

  return (
    <div className="w-full h-full relative bg-stone-950">
      <div className="absolute top-6 left-6 pointer-events-none z-10 bg-stone-900/90 backdrop-blur border border-stone-800 p-3 rounded-lg flex items-center gap-4 shadow-xl shadow-black/20">
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
          <RotateCcw className="w-4 h-4 text-stone-500" /> Drag to Rotate
        </div>
        <div className="w-px h-4 bg-stone-800"></div>
        <div className="flex items-center gap-2 text-xs font-semibold text-stone-300">
          Scroll to Zoom
        </div>
      </div>

      <Canvas shadows dpr={[1, 2]} performance={{ min: 0.5 }}>
        <Scene 
          classCode={classCode} 
          coachId={coachId}
          selectedSeats={selectedSeats}
          recommendedSeatId={recommendedSeatId}
          focusedSeatId={focusedSeatId}
          price={price}
          handleToggleSeat={onToggleSeat}
          setHoveredSeat={setHoveredSeat}
        />
      </Canvas>

      {hoveredSeat && (
        <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-20 bg-stone-900 border border-stone-800 shadow-xl rounded-xl p-4 flex flex-col items-center min-w-[200px] animate-in slide-in-from-top-4 fade-in">
          <div className="text-rose-400 font-black text-2xl mb-1">{hoveredSeat.id}</div>
          <div className="text-white font-bold text-sm mb-1">{hoveredSeat.type}</div>
          <div className="flex items-center gap-2 text-xs text-stone-500 mb-3 font-medium">
            <Info className="w-3 h-3" /> {hoveredSeat.pos}
          </div>
          <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
            hoveredSeat.status === 'available' ? 'bg-stone-900/50 text-stone-300' : 
            hoveredSeat.status === 'RAC' ? 'bg-amber-50 text-amber-600' : 'bg-stone-800 text-stone-500'
          }`}>
            {hoveredSeat.status === 'occupied' ? 'Unavailable' : hoveredSeat.status}
          </div>
        </div>
      )}
    </div>
  );
}
