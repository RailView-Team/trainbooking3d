import React, { useState, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, ContactShadows, BakeShadows } from '@react-three/drei';
import * as THREE from 'three';
import { Armchair, ChevronRight, Info, User, CheckCircle2, RotateCcw } from 'lucide-react';

// --- 3D DATA GENERATOR ---
function generate3DLayout(classCode) {
  const seats = [];
  let currentId = 1;
  let coachLength = 40;

  const getStatus = (id) => {
    const rand = (id * 17) % 100;
    if (rand < 55) return 'available';
    if (rand < 85) return 'occupied';
    return 'RAC';
  };

  const addSeat = (type, pos, position, rotation = [0,0,0], size = [1, 0.2, 2]) => {
    const id = currentId++;
    seats.push({
      id, type, pos,
      status: getStatus(id),
      position, rotation, size,
    });
  };

  if (classCode === '3A' || classCode === 'SL') {
    coachLength = 9 * 4 + 2;
    for (let i = 0; i < 9; i++) {
      const z = (i * 4) - (coachLength / 2) + 2;
      
      // Main Left
      addSeat('Lower Berth', 'Window', [-1.4, 0.3, z - 0.7], [0,0,0], [1.8, 0.15, 0.8]);
      addSeat('Middle Berth', 'Middle', [-1.4, 1.1, z - 0.7], [0,0,0], [1.8, 0.1, 0.8]);
      addSeat('Upper Berth', 'Aisle', [-1.4, 1.9, z - 0.7], [0,0,0], [1.8, 0.1, 0.8]);
      
      // Main Right
      addSeat('Lower Berth', 'Window', [-1.4, 0.3, z + 0.7], [0,0,0], [1.8, 0.15, 0.8]);
      addSeat('Middle Berth', 'Middle', [-1.4, 1.1, z + 0.7], [0,0,0], [1.8, 0.1, 0.8]);
      addSeat('Upper Berth', 'Aisle', [-1.4, 1.9, z + 0.7], [0,0,0], [1.8, 0.1, 0.8]);

      // Side
      addSeat('Side Lower', 'Window', [1.4, 0.3, z], [0, Math.PI / 2, 0], [1.8, 0.15, 0.7]);
      addSeat('Side Upper', 'Window', [1.4, 1.9, z], [0, Math.PI / 2, 0], [1.8, 0.1, 0.7]);
    }
  } else if (classCode === '2A') {
    coachLength = 8 * 4 + 2;
    for (let i = 0; i < 8; i++) {
      const z = (i * 4) - (coachLength / 2) + 2;
      
      addSeat('Lower Berth', 'Window', [-1.4, 0.3, z - 0.7], [0,0,0], [1.8, 0.15, 0.8]);
      addSeat('Upper Berth', 'Aisle', [-1.4, 1.5, z - 0.7], [0,0,0], [1.8, 0.1, 0.8]);
      
      addSeat('Lower Berth', 'Window', [-1.4, 0.3, z + 0.7], [0,0,0], [1.8, 0.15, 0.8]);
      addSeat('Upper Berth', 'Aisle', [-1.4, 1.5, z + 0.7], [0,0,0], [1.8, 0.1, 0.8]);

      addSeat('Side Lower', 'Window', [1.4, 0.3, z], [0, Math.PI / 2, 0], [1.8, 0.15, 0.7]);
      addSeat('Side Upper', 'Window', [1.4, 1.5, z], [0, Math.PI / 2, 0], [1.8, 0.1, 0.7]);
    }
  } else if (classCode === '1A') {
    coachLength = 6 * 4 + 2;
    for (let i = 0; i < 6; i++) {
      const isCabin = i % 3 !== 0;
      const z = (i * 4) - (coachLength / 2) + 2;
      
      addSeat('Lower Berth', 'Window', [-1.4, 0.3, z - 0.7], [0,0,0], [1.8, 0.15, 0.8]);
      addSeat('Upper Berth', 'Aisle', [-1.4, 1.5, z - 0.7], [0,0,0], [1.8, 0.1, 0.8]);
      
      if (isCabin) {
        addSeat('Lower Berth', 'Window', [-1.4, 0.3, z + 0.7], [0,0,0], [1.8, 0.15, 0.8]);
        addSeat('Upper Berth', 'Aisle', [-1.4, 1.5, z + 0.7], [0,0,0], [1.8, 0.1, 0.8]);
      }
    }
  } else if (classCode === 'CC') {
    coachLength = 15 * 1.5 + 2;
    for (let i = 0; i < 15; i++) {
      const z = (i * 1.5) - (coachLength / 2) + 1.5;
      addSeat('Chair', 'Window', [-1.5, 0.3, z], [0,0,0], [0.5, 0.15, 0.5]);
      addSeat('Chair', 'Middle', [-0.9, 0.3, z], [0,0,0], [0.5, 0.15, 0.5]);
      addSeat('Chair', 'Aisle',  [-0.3, 0.3, z], [0,0,0], [0.5, 0.15, 0.5]);
      
      addSeat('Chair', 'Aisle',  [0.7, 0.3, z], [0,0,0], [0.5, 0.15, 0.5]);
      addSeat('Chair', 'Window', [1.3, 0.3, z], [0,0,0], [0.5, 0.15, 0.5]);
    }
  } else if (classCode === 'EC') {
    coachLength = 14 * 2.0 + 2;
    for (let i = 0; i < 14; i++) {
      const z = (i * 2.0) - (coachLength / 2) + 1.5;
      addSeat('Exec Chair', 'Window', [-1.2, 0.3, z], [0,0,0], [0.6, 0.15, 0.6]);
      addSeat('Exec Chair', 'Aisle',  [-0.4, 0.3, z], [0,0,0], [0.6, 0.15, 0.6]);
      
      addSeat('Exec Chair', 'Aisle',  [0.6, 0.3, z], [0,0,0], [0.6, 0.15, 0.6]);
      addSeat('Exec Chair', 'Window', [1.4, 0.3, z], [0,0,0], [0.6, 0.15, 0.6]);
    }
  } else if (classCode === '2S') {
    coachLength = 18 * 1.3 + 2;
    for (let i = 0; i < 18; i++) {
      const z = (i * 1.3) - (coachLength / 2) + 1.5;
      addSeat('Bench', 'Window', [-1.6, 0.3, z], [0,0,0], [0.45, 0.15, 0.5]);
      addSeat('Bench', 'Middle', [-1.1, 0.3, z], [0,0,0], [0.45, 0.15, 0.5]);
      addSeat('Bench', 'Aisle',  [-0.6, 0.3, z], [0,0,0], [0.45, 0.15, 0.5]);
      
      addSeat('Bench', 'Aisle',  [0.6, 0.3, z], [0,0,0], [0.45, 0.15, 0.5]);
      addSeat('Bench', 'Middle', [1.1, 0.3, z], [0,0,0], [0.45, 0.15, 0.5]);
      addSeat('Bench', 'Window', [1.6, 0.3, z], [0,0,0], [0.45, 0.15, 0.5]);
    }
  }
  return { seats, coachLength };
}

// --- 3D COMPONENTS ---
const SeatMesh = ({ seat, selected, onToggle, setHovered }) => {
  const isAvail = seat.status === 'available';
  const isRAC = seat.status === 'RAC';
  const isOcc = seat.status === 'occupied';

  // Materials based on state
  let color = '#475569'; // available (slate-600)
  if (selected) color = '#e11d48'; // rose-600
  else if (isOcc) color = '#0f172a'; // slate-900
  else if (isRAC) color = '#d97706'; // amber-600

  const isChair = seat.type.includes('Chair') || seat.type.includes('Bench');
  
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
        setHovered(seat);
        setLocalHovered(true);
        document.body.style.cursor = (isAvail || isRAC) ? 'pointer' : 'not-allowed';
      }}
      onPointerOut={() => {
        setHovered(null);
        setLocalHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Base/Cushion */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={seat.size} />
        <meshPhysicalMaterial 
          color={color} 
          roughness={0.9} 
          clearcoat={0.1}
          emissive={selected ? color : '#000000'}
          emissiveIntensity={selected ? 0.6 : 0}
        />
      </mesh>
      
      {/* Backrest for chairs */}
      {isChair && (
        <mesh position={[0, 0.4, -0.2]} castShadow receiveShadow>
          <boxGeometry args={[seat.size[0], 0.7, 0.1]} />
          <meshPhysicalMaterial 
            color={color} 
            roughness={0.9}
            clearcoat={0.1}
            emissive={selected ? color : '#000000'}
            emissiveIntensity={selected ? 0.6 : 0}
          />
        </mesh>
      )}

      {/* Armrests for chairs */}
      {isChair && seat.type === 'Exec Chair' && (
        <>
          <mesh position={[-seat.size[0]/2 - 0.05, 0.2, 0]} castShadow>
            <boxGeometry args={[0.1, 0.4, 0.5]} />
            <meshPhysicalMaterial color="#1e293b" roughness={0.7} />
          </mesh>
          <mesh position={[seat.size[0]/2 + 0.05, 0.2, 0]} castShadow>
            <boxGeometry args={[0.1, 0.4, 0.5]} />
            <meshPhysicalMaterial color="#1e293b" roughness={0.7} />
          </mesh>
        </>
      )}
    </group>
  );
};

const CoachShell = ({ length, classCode }) => {
  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.1, length]} />
        <meshPhysicalMaterial color="#0f172a" roughness={0.6} metalness={0.4} />
      </mesh>

      {/* Aisle LED Strips */}
      <mesh position={[-0.4, 0.06, 0]} receiveShadow>
        <boxGeometry args={[0.02, 0.02, length]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.6} transparent />
      </mesh>
      <mesh position={[0.4, 0.06, 0]} receiveShadow>
        <boxGeometry args={[0.02, 0.02, length]} />
        <meshBasicMaterial color="#38bdf8" opacity={0.6} transparent />
      </mesh>
      
      {/* Ceiling Lights & Roof */}
      <mesh position={[0, 3.2, 0]} receiveShadow>
        <boxGeometry args={[4.2, 0.1, length]} />
        <meshStandardMaterial color="#1e293b" roughness={0.9} />
      </mesh>

      {Array.from({ length: Math.floor(length / 4) }).map((_, i) => (
        <group key={i} position={[0, 3.1, (i * 4) - length/2 + 2]}>
          <mesh>
            <boxGeometry args={[0.8, 0.05, 2]} />
            <meshPhysicalMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
          </mesh>
          <pointLight intensity={0.5} distance={8} color="#f8fafc" />
        </group>
      ))}

      {/* Side Walls (Glassy/Transparent) */}
      <mesh position={[-2.05, 1.6, 0]} castShadow>
        <boxGeometry args={[0.1, 3.1, length]} />
        <meshPhysicalMaterial color="#1e293b" transparent opacity={0.3} roughness={0.0} transmission={1} clearcoat={1} ior={1.5} />
      </mesh>
      <mesh position={[2.05, 1.6, 0]} castShadow>
        <boxGeometry args={[0.1, 3.1, length]} />
        <meshPhysicalMaterial color="#1e293b" transparent opacity={0.3} roughness={0.0} transmission={1} clearcoat={1} ior={1.5} />
      </mesh>

      {/* End Doors */}
      <mesh position={[0, 1.6, length/2]} castShadow>
        <boxGeometry args={[1.5, 2.5, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>
      <mesh position={[0, 1.6, -length/2]} castShadow>
        <boxGeometry args={[1.5, 2.5, 0.1]} />
        <meshStandardMaterial color="#1e293b" />
      </mesh>

      {/* Luggage Racks (for Chair Cars) */}
      {(classCode === 'CC' || classCode === 'EC' || classCode === '2S') && (
        <>
          <mesh position={[-1.4, 2.5, 0]} castShadow>
            <boxGeometry args={[1.2, 0.05, length]} />
            <meshStandardMaterial color="#cbd5e1" opacity={0.5} transparent />
          </mesh>
          <mesh position={[1.4, 2.5, 0]} castShadow>
            <boxGeometry args={[1.2, 0.05, length]} />
            <meshStandardMaterial color="#cbd5e1" opacity={0.5} transparent />
          </mesh>
        </>
      )}

      {/* 1A Aisle Wall */}
      {classCode === '1A' && (
        <mesh position={[0.4, 1.6, 0]} receiveShadow castShadow>
          <boxGeometry args={[0.05, 3.1, length]} />
          <meshStandardMaterial color="#1e293b" transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
};

const Scene = ({ classCode, selectedSeats, handleToggleSeat, setHoveredSeat }) => {
  const { seats, coachLength } = useMemo(() => generate3DLayout(classCode), [classCode]);
  const controlsRef = useRef();

  return (
    <>
      <fog attach="fog" args={['#020617', 5, 30]} />
      <ambientLight intensity={0.4} />
      <Environment preset="city" />
      <directionalLight position={[10, 15, 10]} intensity={1.5} castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0001} />
      
      <CoachShell length={coachLength} classCode={classCode} />
      
      {seats.map(seat => (
        <SeatMesh 
          key={seat.id} 
          seat={seat} 
          selected={selectedSeats.includes(seat.id)}
          onToggle={handleToggleSeat}
          setHovered={setHoveredSeat}
        />
      ))}

      <ContactShadows position={[0, -0.05, 0]} opacity={0.6} scale={50} blur={2.5} far={4} color="#000000" />
      <BakeShadows />
      <OrbitControls 
        ref={controlsRef}
        makeDefault 
        minDistance={3} 
        maxDistance={25}
        maxPolarAngle={Math.PI / 2 - 0.05} // Prevent camera from going under floor
        enableDamping={true}
        dampingFactor={0.05}
        autoRotate={true}
        autoRotateSpeed={0.3}
      />
    </>
  );
};


// --- MAIN UI COMPONENT ---
export default function Coach3D() {
  const [activeClass, setActiveClass] = useState('3A');
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [hoveredSeat, setHoveredSeat] = useState(null);

  const handleClassChange = (cls) => {
    setActiveClass(cls);
    setSelectedSeats([]);
    setHoveredSeat(null);
  };

  const handleToggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length >= 6) {
        alert("Maximum 6 seats allowed per booking.");
        return;
      }
      setSelectedSeats([...selectedSeats, seatId]);
    }
  };

  return (
    <section className="relative w-full h-[90vh] bg-slate-950 flex flex-col border-t border-slate-900/50">
      
      {/* TOP BAR: Class & Coach Selector */}
      <div className="h-20 bg-slate-900 border-b border-slate-800 flex items-center justify-between px-8 z-10">
        <div>
          <h2 className="text-xl font-extrabold text-white">3D Seat Selection</h2>
          <p className="text-slate-400 text-sm font-medium">Coach B1 • AeroExpress 104</p>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-xl border border-slate-800">
          {['1A', '2A', '3A', 'SL', 'EC', 'CC', '2S'].map(cls => (
            <button
              key={cls}
              onClick={() => handleClassChange(cls)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                activeClass === cls 
                  ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.3)]' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {cls}
            </button>
          ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* CENTER: 3D VIEWPORT */}
        <div className="flex-1 relative bg-gradient-to-b from-slate-950 to-slate-900">
          
          {/* Instructions Overlay */}
          <div className="absolute top-6 left-6 pointer-events-none z-10 bg-slate-900/60 backdrop-blur border border-slate-800 p-3 rounded-lg flex items-center gap-4 shadow-xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              <RotateCcw className="w-4 h-4 text-slate-500" /> Drag to Rotate
            </div>
            <div className="w-px h-4 bg-slate-700"></div>
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
              Scroll to Zoom
            </div>
          </div>

          <Canvas shadows camera={{ position: [15, 12, 15], fov: 45 }}>
            <Scene 
              classCode={activeClass} 
              selectedSeats={selectedSeats}
              handleToggleSeat={handleToggleSeat}
              setHoveredSeat={setHoveredSeat}
            />
          </Canvas>

          {/* Floating Tooltip HTML Overlay */}
          {hoveredSeat && (
            <div className="absolute top-6 left-1/2 -translate-x-1/2 pointer-events-none z-20 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-4 flex flex-col items-center min-w-[200px] animate-in slide-in-from-top-4 fade-in">
              <div className="text-rose-500 font-black text-2xl mb-1">{hoveredSeat.id}</div>
              <div className="text-white font-bold text-sm mb-1">{hoveredSeat.type}</div>
              <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
                <Info className="w-3 h-3" /> {hoveredSeat.pos}
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full ${
                hoveredSeat.status === 'available' ? 'bg-slate-800 text-slate-300' : 
                hoveredSeat.status === 'RAC' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'
              }`}>
                {hoveredSeat.status === 'occupied' ? 'Unavailable' : hoveredSeat.status}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: BOOKING SUMMARY */}
        <div className="w-80 bg-slate-900 border-l border-slate-800 p-6 flex flex-col z-10 shadow-2xl">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center justify-between">
            Summary
            <span className="bg-rose-500/20 text-rose-400 text-xs px-2 py-1 rounded-md">{selectedSeats.length} Seats</span>
          </h3>
          
          {selectedSeats.length === 0 ? (
            <div className="text-center py-10 flex-1 flex flex-col justify-center">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-4 border border-slate-700">
                <Armchair className="w-6 h-6 text-slate-500" />
              </div>
              <p className="text-slate-400 font-medium text-sm">Click available seats in the 3D viewer to select them.</p>
            </div>
          ) : (
            <div className="flex-1 flex flex-col">
              <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 space-y-3 mb-6">
                {selectedSeats.map(id => (
                  <div key={id} className="flex items-center justify-between bg-slate-950 border border-slate-800 p-3 rounded-xl shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-rose-600 flex items-center justify-center font-black text-white shadow-lg">{id}</div>
                      <div className="text-left">
                        <div className="text-white font-bold text-xs uppercase tracking-wider">Seat {id}</div>
                        <div className="text-rose-400 font-medium text-[10px] uppercase">Selected</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-slate-800/60 pt-6">
                <div className="flex justify-between text-slate-400 font-medium text-sm mb-3">
                  <span>Base Fare ({selectedSeats.length}x)</span>
                  <span className="text-white font-bold">₹{selectedSeats.length * 45}</span>
                </div>
                <div className="flex justify-between text-slate-400 font-medium text-sm mb-5">
                  <span>Taxes & Fees</span>
                  <span className="text-white font-bold">₹{selectedSeats.length * 5}</span>
                </div>
                <div className="flex justify-between items-center bg-slate-950 p-4 rounded-xl border border-rose-500/30 shadow-[0_0_20px_rgba(225,29,72,0.05)]">
                  <span className="text-slate-300 font-bold uppercase tracking-wider text-xs">Total Amount</span>
                  <span className="text-2xl font-black text-rose-500">₹{selectedSeats.length * 50}</span>
                </div>

                <button className="w-full bg-rose-600 hover:bg-rose-500 text-white rounded-xl py-4 font-bold text-lg tracking-wide transition-all shadow-[0_0_20px_rgba(225,29,72,0.3)] hover:-translate-y-0.5 mt-6 flex justify-center items-center gap-2">
                  Checkout <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
        
      </div>
    </section>
  );
}
