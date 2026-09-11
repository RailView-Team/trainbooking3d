import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Environment, ContactShadows, BakeShadows, Html, Text, PerspectiveCamera, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { Info, User, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Focus, RefreshCw } from 'lucide-react';
import { generate3DLayout, getSeatAvailability } from '../coachData';

// --- CUSTOM FIRST PERSON CONTROLS ---
const FirstPersonControls = ({ bounds, moveKeys, resetTrigger, focusedSeat }) => {
  const { camera, gl } = useThree();
  const [keys, setKeys] = useState({ forward: false, backward: false, left: false, right: false });

  // Sync external UI controls with internal keys state
  useEffect(() => {
    setKeys(moveKeys);
  }, [moveKeys]);

  // Keyboard WASD
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['w', 'ArrowUp'].includes(e.key)) setKeys(k => ({ ...k, forward: true }));
      if (['s', 'ArrowDown'].includes(e.key)) setKeys(k => ({ ...k, backward: true }));
      if (['a', 'ArrowLeft'].includes(e.key)) setKeys(k => ({ ...k, left: true }));
      if (['d', 'ArrowRight'].includes(e.key)) setKeys(k => ({ ...k, right: true }));
    };
    const handleKeyUp = (e) => {
      if (['w', 'ArrowUp'].includes(e.key)) setKeys(k => ({ ...k, forward: false }));
      if (['s', 'ArrowDown'].includes(e.key)) setKeys(k => ({ ...k, backward: false }));
      if (['a', 'ArrowLeft'].includes(e.key)) setKeys(k => ({ ...k, left: false }));
      if (['d', 'ArrowRight'].includes(e.key)) setKeys(k => ({ ...k, right: false }));
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse drag to look
  useEffect(() => {
    let isDragging = false;
    let prevPos = { x: 0, y: 0 };

    const handleMouseDown = (e) => {
      isDragging = true;
      prevPos = { x: e.clientX, y: e.clientY };
    };
    const handleMouseUp = () => { isDragging = false; };
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      const dx = e.clientX - prevPos.x;
      const dy = e.clientY - prevPos.y;
      prevPos = { x: e.clientX, y: e.clientY };

      camera.rotation.order = 'YXZ';
      camera.rotation.y -= dx * 0.004;
      camera.rotation.x -= dy * 0.004;
      camera.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, camera.rotation.x));
    };

    // Touch support
    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        isDragging = true;
        prevPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };
    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length !== 1) return;
      const dx = e.touches[0].clientX - prevPos.x;
      const dy = e.touches[0].clientY - prevPos.y;
      prevPos = { x: e.touches[0].clientX, y: e.touches[0].clientY };

      camera.rotation.order = 'YXZ';
      camera.rotation.y -= dx * 0.005;
      camera.rotation.x -= dy * 0.005;
      camera.rotation.x = Math.max(-Math.PI / 2.5, Math.min(Math.PI / 2.5, camera.rotation.x));
    };

    const canvas = gl.domElement;
    canvas.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('touchstart', handleTouchStart);
    window.addEventListener('touchend', handleMouseUp);
    window.addEventListener('touchmove', handleTouchMove);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchend', handleMouseUp);
      window.removeEventListener('touchmove', handleTouchMove);
    };
  }, [camera, gl]);

  // Handle Reset and Focus
  useEffect(() => {
    if (resetTrigger > 0) {
      camera.position.set(0, 1.6, bounds.maxZ - 1);
      camera.rotation.set(0, 0, 0);
    }
  }, [resetTrigger, camera, bounds]);

  const [isFocusing, setIsFocusing] = useState(false);
  const targetPos = useRef(new THREE.Vector3());
  const targetRot = useRef(new THREE.Euler());

  useEffect(() => {
    if (focusedSeat) {
      // Calculate view position near seat
      const seatZ = focusedSeat.position[2];
      const seatX = focusedSeat.position[0];

      // Stand in aisle, look at seat
      const camX = seatX > 0 ? seatX - 1.2 : seatX + 1.2;
      targetPos.current.set(camX, 1.5, seatZ);

      const lookAt = new THREE.Vector3(seatX, 1.0, seatZ);
      const tempCam = camera.clone();
      tempCam.position.copy(targetPos.current);
      tempCam.lookAt(lookAt);
      targetRot.current.copy(tempCam.rotation);

      setIsFocusing(true);
    }
  }, [focusedSeat, camera]);

  useFrame((state, delta) => {
    if (isFocusing) {
      camera.position.lerp(targetPos.current, delta * 4);

      // Slerp rotation
      const qStart = new THREE.Quaternion().setFromEuler(camera.rotation);
      const qEnd = new THREE.Quaternion().setFromEuler(targetRot.current);
      qStart.slerp(qEnd, delta * 4);
      camera.rotation.setFromQuaternion(qStart);

      if (camera.position.distanceTo(targetPos.current) < 0.1) {
        setIsFocusing(false);
      }
      return; // Skip manual movement while focusing
    }

    const speed = 4 * delta;
    const dir = new THREE.Vector3();
    camera.getWorldDirection(dir);
    dir.y = 0;
    dir.normalize();

    const right = new THREE.Vector3().crossVectors(dir, camera.up).normalize();

    if (keys.forward) camera.position.addScaledVector(dir, speed);
    if (keys.backward) camera.position.addScaledVector(dir, -speed);
    if (keys.left) camera.position.addScaledVector(right, -speed);
    if (keys.right) camera.position.addScaledVector(right, speed);

    // Collision / Boundary clamp
    camera.position.x = Math.max(bounds.minX, Math.min(bounds.maxX, camera.position.x));
    camera.position.z = Math.max(bounds.minZ, Math.min(bounds.maxZ, camera.position.z));
    camera.position.y = 1.6; // Keep at eye level
  });

  return null;
};

// --- COACH SHELL (Walls, Floor, Windows, Toilet) ---
const CoachShell = ({ length, classCode }) => {
  const isSleeper = ['1A', '2A', '3A', 'SL'].includes(classCode);
  const baySize = isSleeper ? 4 : (classCode === 'CC' ? 1.5 : (classCode === 'EC' ? 2 : 1.3));
  const numBays = Math.floor(length / baySize);

  // Colors based on Indian Coach images
  const wallColor = "#e4e1d9"; // Beige/off-white walls
  const floorColor = "#2c3e50"; // Dark blue speckled floor
  const ceilingColor = "#f8f9fa";
  const frameColor = "#a3a3a3";

  return (
    <group>
      {/* Floor */}
      <mesh position={[0, 0, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, length + 4]} />
        <meshStandardMaterial color={floorColor} roughness={0.9} />
      </mesh>

      {/* Aisle strip */}
      <mesh position={[0, 0.01, 0]} receiveShadow rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[0.8, length + 4]} />
        <meshStandardMaterial color="#34495e" roughness={0.8} />
      </mesh>

      {/* Ceiling */}
      <mesh position={[0, 2.8, 0]} receiveShadow rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[4.8, length + 4]} />
        <meshStandardMaterial color={ceilingColor} roughness={0.5} />
      </mesh>

      {/* Side Walls */}
      <mesh position={[-2.4, 1.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 2.8, length + 4]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      <mesh position={[2.4, 1.4, 0]} receiveShadow castShadow>
        <boxGeometry args={[0.1, 2.8, length + 4]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>

      {/* End Walls & Doors */}
      {[-length / 2 - 2, length / 2 + 2].map((z, idx) => (
        <group key={`end-${idx}`} position={[0, 0, z]}>
          {/* Main End wall */}
          <mesh position={[0, 1.4, 0]} receiveShadow castShadow>
            <boxGeometry args={[4.8, 2.8, 0.1]} />
            <meshStandardMaterial color={wallColor} />
          </mesh>
          {/* Passage Door cutout (simulate with a dark mesh in front) */}
          <mesh position={[0, 1.0, idx === 0 ? 0.06 : -0.06]} receiveShadow>
            <boxGeometry args={[1.2, 2.0, 0.02]} />
            <meshStandardMaterial color="#1a1a1a" />
          </mesh>
          {/* Toilet Doors (sides) */}
          <mesh position={[-1.5, 1.0, idx === 0 ? 0.06 : -0.06]} receiveShadow>
            <boxGeometry args={[0.8, 2.0, 0.02]} />
            <meshStandardMaterial color="#8b9dc3" metalness={0.4} roughness={0.6} />
          </mesh>
          <mesh position={[1.5, 1.0, idx === 0 ? 0.06 : -0.06]} receiveShadow>
            <boxGeometry args={[0.8, 2.0, 0.02]} />
            <meshStandardMaterial color="#8b9dc3" metalness={0.4} roughness={0.6} />
          </mesh>

          {/* Wash basin mirror (small reflective plane) */}
          <mesh position={[-1.5, 1.5, idx === 0 ? 0.07 : -0.07]}>
            <planeGeometry args={[0.4, 0.6]} />
            <meshStandardMaterial color="#e0e0e0" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Wash basin sink */}
          <mesh position={[-1.5, 1.0, idx === 0 ? 0.2 : -0.2]} castShadow>
            <boxGeometry args={[0.5, 0.1, 0.3]} />
            <meshStandardMaterial color="#e2e8f0" />
          </mesh>

          {/* Info Labels for Toilet and Wash Basin */}
          <Html position={[-1.5, 1.5, idx === 0 ? 0.3 : -0.3]} center transform distanceFactor={3}>
            <div className="bg-stone-900/80 text-white px-2 py-1 rounded text-[8px] font-bold tracking-wider backdrop-blur pointer-events-none">
              Wash Basin
            </div>
          </Html>
          <Html position={[1.5, 1.5, idx === 0 ? 0.3 : -0.3]} center transform distanceFactor={3}>
            <div className="bg-stone-900/80 text-white px-2 py-1 rounded text-[8px] font-bold tracking-wider backdrop-blur pointer-events-none">
              Toilet
            </div>
          </Html>
        </group>
      ))}

      {/* Windows and Pillars */}
      {Array.from({ length: numBays }).map((_, i) => {
        const z = (i * baySize) - (length / 2) + baySize / 2;
        return (
          <group key={`bay-${i}`}>
            {/* Windows Left */}
            <mesh position={[-2.35, 1.3, z]}>
              <boxGeometry args={[0.1, 0.8, baySize * 0.6]} />
              <meshPhysicalMaterial color="#a5f3fc" transparent opacity={0.3} transmission={0.8} roughness={0.1} />
            </mesh>
            <mesh position={[-2.35, 1.3, z]}>
              <boxGeometry args={[0.12, 0.82, baySize * 0.62]} />
              <meshStandardMaterial color={frameColor} wireframe />
            </mesh>

            {/* Windows Right */}
            <mesh position={[2.35, 1.3, z]}>
              <boxGeometry args={[0.1, 0.8, baySize * 0.6]} />
              <meshPhysicalMaterial color="#a5f3fc" transparent opacity={0.3} transmission={0.8} roughness={0.1} />
            </mesh>
            <mesh position={[2.35, 1.3, z]}>
              <boxGeometry args={[0.12, 0.82, baySize * 0.62]} />
              <meshStandardMaterial color={frameColor} wireframe />
            </mesh>

            {/* Ceiling Lights */}
            <mesh position={[0, 2.75, z]} castShadow>
              <boxGeometry args={[0.6, 0.05, 1.2]} />
              <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.8} />
            </mesh>
            <pointLight position={[0, 2.5, z]} intensity={0.4} distance={8} color="#fdfbf7" />

            {/* Ceiling Fans */}
            <group position={[0, 2.7, z - 0.8]}>
              <mesh><cylinderGeometry args={[0.05, 0.05, 0.1]} /><meshStandardMaterial color="#27272a" /></mesh>
              <mesh position={[0, -0.05, 0]}><boxGeometry args={[0.5, 0.01, 0.05]} /><meshStandardMaterial color="#27272a" /></mesh>
              <mesh position={[0, -0.05, 0]} rotation={[0, Math.PI / 2, 0]}><boxGeometry args={[0.5, 0.01, 0.05]} /><meshStandardMaterial color="#27272a" /></mesh>
            </group>

            {/* Luggage Rack / Upper Berth Support (for day travel coaches) */}
            {!isSleeper && (
              <>
                <mesh position={[-1.7, 2.2, z]} castShadow>
                  <boxGeometry args={[1.2, 0.05, baySize * 0.9]} />
                  <meshStandardMaterial color="#9ca3af" metalness={0.6} />
                </mesh>
                <mesh position={[1.7, 2.2, z]} castShadow>
                  <boxGeometry args={[1.2, 0.05, baySize * 0.9]} />
                  <meshStandardMaterial color="#9ca3af" metalness={0.6} />
                </mesh>
              </>
            )}
          </group>
        );
      })}
    </group>
  );
};

// --- SEAT / BERTH MESH ---
const SeatMesh = ({ seat, status, selected, recommended, focused, coachId, price, onToggle, setPreview }) => {
  const isAvail = status === 'available';
  const isRAC = status === 'RAC';
  const isOcc = status === 'occupied';

  // Indian coach seat colors
  let padColor = '#1e3a8a'; // Deep blue cushions
  if (seat.type.includes('Exec')) padColor = '#7f1d1d';
  if (seat.type.includes('Bench')) padColor = '#334155';

  let frameColor = '#94a3b8'; // Grey metal frames

  let activeColor = padColor;
  let emissive = '#000000';

  if (selected) {
    activeColor = '#e11d48'; // Rose-600
    emissive = '#be123c';
  } else if (isOcc) {
    activeColor = '#1c1917'; // Dark stone
  } else if (isRAC) {
    activeColor = '#d97706'; // Amber
  }

  const isChair = seat.type.includes('Chair') || seat.type.includes('Bench');

  const [hovered, setLocalHovered] = useState(false);
  const meshRef = useRef();

  useFrame((state, delta) => {
    const targetScale = hovered || selected ? 1.02 : 1;
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
        setPreview({ ...seat, status });
      }}
      onDoubleClick={(e) => {
        e.stopPropagation();
        if (isAvail || isRAC) onToggle(seat.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setLocalHovered(true);
        document.body.style.cursor = (isAvail || isRAC) ? 'pointer' : 'not-allowed';
      }}
      onPointerOut={() => {
        setLocalHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Base Cushion */}
      <mesh castShadow receiveShadow>
        <boxGeometry args={[seat.size[0] * 0.95, seat.size[1], seat.size[2] * 0.95]} />
        <meshPhysicalMaterial color={activeColor} roughness={0.8} emissive={emissive} emissiveIntensity={0.2} />
      </mesh>

      {/* Frame support below */}
      <mesh position={[0, -seat.size[1] / 2 - 0.05, 0]} castShadow>
        <boxGeometry args={[seat.size[0] * 0.9, 0.1, seat.size[2] * 0.8]} />
        <meshStandardMaterial color={frameColor} metalness={0.6} roughness={0.4} />
      </mesh>

      {/* Label embedded on the seat */}
      <Text
        position={[0, seat.size[1] / 2 + 0.01, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.12}
        color={selected ? "white" : (isOcc ? "#a8a29e" : "white")}
        anchorX="center"
        anchorY="middle"
      >
        {seat.id}
      </Text>

      {/* Backrest for Chairs */}
      {isChair && (
        <group position={[0, 0.35, -seat.size[2] / 2 + 0.1]}>
          <mesh castShadow receiveShadow rotation={[-0.1, 0, 0]}>
            <boxGeometry args={[seat.size[0] * 0.9, 0.7, 0.1]} />
            <meshPhysicalMaterial color={activeColor} roughness={0.8} emissive={emissive} emissiveIntensity={0.2} />
          </mesh>
          <Text
            position={[0, 0.2, 0.06]}
            rotation={[-0.1, 0, 0]}
            fontSize={0.12}
            color={selected ? "white" : (isOcc ? "#a8a29e" : "white")}
            anchorX="center"
            anchorY="middle"
          >
            {seat.id}
          </Text>
        </group>
      )}

      {/* Armrests for Exec Chairs */}
      {isChair && (seat.type === 'Exec Chair') && (
        <>
          <mesh position={[-seat.size[0] / 2, 0.25, 0]} castShadow>
            <boxGeometry args={[0.06, 0.05, seat.size[2] * 0.8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
          <mesh position={[seat.size[0] / 2, 0.25, 0]} castShadow>
            <boxGeometry args={[0.06, 0.05, seat.size[2] * 0.8]} />
            <meshStandardMaterial color="#1e293b" roughness={0.8} />
          </mesh>
        </>
      )}

      {/* Chains/Supports for Upper/Middle Berths */}
      {!isChair && (seat.type.includes('Middle') || seat.type.includes('Upper')) && (
        <>
          <mesh position={[seat.size[0] / 2 - 0.05, 0.5, seat.size[2] / 2 - 0.05]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 1]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
          </mesh>
          <mesh position={[-seat.size[0] / 2 + 0.05, 0.5, seat.size[2] / 2 - 0.05]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 1]} />
            <meshStandardMaterial color="#64748b" metalness={0.8} roughness={0.3} />
          </mesh>
        </>
      )}
    </group>
  );
};

const Scene = ({ classCode, coachId, selectedSeats, recommendedSeatId, focusedSeatId, price, handleToggleSeat, setHoveredSeat, moveKeys, resetTrigger }) => {
  const { seats, coachLength } = useMemo(() => generate3DLayout(classCode), [classCode]);

  // Boundary constraints for the camera
  const bounds = {
    minX: -0.7, maxX: 0.7, // Keep within the aisle mostly
    minZ: -coachLength / 2 - 1, maxZ: coachLength / 2 + 1
  };

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 1.6, coachLength / 2 - 1]} fov={75} near={0.1} far={50} />
      <FirstPersonControls bounds={bounds} moveKeys={moveKeys} resetTrigger={resetTrigger} focusedSeat={seats.find(s => s.id === focusedSeatId)} />

      <ambientLight intensity={0.5} color="#ffffff" />
      <directionalLight position={[10, 15, 5]} intensity={1.2} color="#fef08a" castShadow shadow-mapSize={[2048, 2048]} shadow-bias={-0.0005} />

      <CoachShell length={coachLength} classCode={classCode} />

      {seats.map(seat => {
        // Check real availability data first, fall back to mock
        let status = seatStatusMap[seat.id];
        if (!status) {
          status = getSeatAvailability(coachId, seat.id);
        }
        return (
          <SeatMesh
            key={seat.id}
            seat={seat}
            status={status}
            selected={selectedSeats.includes(seat.id)}
            recommended={seat.id === recommendedSeatId && !selectedSeats.includes(seat.id)}
            focused={seat.id === focusedSeatId}
            coachId={coachId}
            price={price}
            onToggle={handleToggleSeat}
            setPreview={setHoveredSeat}
          />
        );
      })}
    </>
  );
};

export default function CoachViewer3D({ classCode, coachId, selectedSeats, recommendedSeatId, price, onToggleSeat, availabilityData }) {
  const [hoveredSeat, setHoveredSeat] = useState(null);
  const [moveKeys, setMoveKeys] = useState({ forward: false, backward: false, left: false, right: false });
  const [resetTrigger, setResetTrigger] = useState(0);
  const [focusedSeatId, setFocusedSeatId] = useState(null);

  // Build a map of available seats from the API data
  const seatStatusMap = useMemo(() => {
    if (!availabilityData?.coaches) return {};

    const map = {};
    availabilityData.coaches.forEach(coach => {
      if (coach.coachId === coachId || coach.coachNumber === coachId) {
        coach.seats?.forEach(seat => {
          map[seat.id] = seat.available ? 'available' : 'occupied';
        });
      }
    });
    return map;
  }, [availabilityData, coachId]);

  // Helper for UI buttons
  const handleKey = (key, val) => () => setMoveKeys(prev => ({ ...prev, [key]: val }));

  return (
    <div className="w-full h-full relative bg-stone-950">

      {/* On-Screen Controls */}
      <div className="absolute bottom-6 left-6 z-10 flex flex-col items-center gap-2">
        <button
          onPointerDown={handleKey('forward', true)} onPointerUp={handleKey('forward', false)} onPointerLeave={handleKey('forward', false)}
          className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl border border-white/20 flex items-center justify-center text-white transition-colors"
        >
          <ArrowUp className="w-6 h-6" />
        </button>
        <div className="flex gap-2">
          <button
            onPointerDown={handleKey('left', true)} onPointerUp={handleKey('left', false)} onPointerLeave={handleKey('left', false)}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl border border-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <button
            onPointerDown={handleKey('backward', true)} onPointerUp={handleKey('backward', false)} onPointerLeave={handleKey('backward', false)}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl border border-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowDown className="w-6 h-6" />
          </button>
          <button
            onPointerDown={handleKey('right', true)} onPointerUp={handleKey('right', false)} onPointerLeave={handleKey('right', false)}
            className="w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl border border-white/20 flex items-center justify-center text-white transition-colors"
          >
            <ArrowRight className="w-6 h-6" />
          </button>
        </div>
        <p className="text-[10px] text-white/50 font-bold tracking-widest uppercase mt-1">Move (WASD)</p>
      </div>

      <div className="absolute bottom-6 right-6 z-10 flex gap-3">
        {selectedSeats.length > 0 && (
          <button
            onClick={() => {
              setFocusedSeatId(selectedSeats[selectedSeats.length - 1]);
              setTimeout(() => setFocusedSeatId(null), 2000); // Unset after focus
            }}
            className="px-4 py-3 bg-rose-700/80 hover:bg-rose-700 backdrop-blur rounded-xl border border-rose-500/50 flex items-center gap-2 text-white font-bold text-sm transition-colors"
          >
            <Focus className="w-4 h-4" /> View My Seat
          </button>
        )}
        <button
          onClick={() => setResetTrigger(v => v + 1)}
          className="px-4 py-3 bg-white/10 hover:bg-white/20 backdrop-blur rounded-xl border border-white/20 flex items-center gap-2 text-white font-bold text-sm transition-colors"
        >
          <RefreshCw className="w-4 h-4" /> Reset View
        </button>
      </div>

      <div className="absolute top-6 left-6 pointer-events-none z-10 bg-stone-900/90 backdrop-blur border border-stone-800 p-3 rounded-lg flex items-center gap-4 shadow-xl shadow-black/20">
        <div className="text-xs font-semibold text-stone-300">
          <span className="text-white font-bold">Drag</span> to look around
        </div>
        <div className="w-px h-4 bg-stone-800"></div>
        <div className="text-xs font-semibold text-stone-300">
          Double-click to select
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
          moveKeys={moveKeys}
          resetTrigger={resetTrigger}
        />
      </Canvas>

      {/* Floating Tooltip HTML Overlay */}
      {hoveredSeat && (
        <div
          className="absolute z-20 bg-stone-900 border border-stone-800 shadow-[0_10px_30px_rgba(0,0,0,0.5)] rounded-xl p-4 flex flex-col items-center min-w-[200px] animate-in slide-in-from-top-4 fade-in"
          style={{ bottom: '2rem', left: '50%', transform: 'translateX(-50%)' }}
        >
          <button
            onClick={() => setHoveredSeat(null)}
            className="absolute top-2 right-2 text-stone-500 hover:text-white"
          >
            ×
          </button>
          <div className="flex items-center gap-2 mb-2">
            <span className="font-black text-rose-400 text-2xl">{hoveredSeat.id}</span>
            <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${hoveredSeat.status === 'available' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              hoveredSeat.status === 'RAC' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-stone-800 text-stone-500'
              }`}>
              {hoveredSeat.status === 'occupied' ? 'Unavailable' : hoveredSeat.status}
            </span>
          </div>
          <div className="text-white font-bold text-sm mb-1">{hoveredSeat.type}</div>
          <div className="text-stone-500 text-xs flex items-center gap-1 font-medium mb-3">
            <Info className="w-3 h-3" /> {hoveredSeat.pos}
          </div>
          {(hoveredSeat.status === 'available' || hoveredSeat.status === 'RAC') && (
            <p className="text-stone-400 text-[10px] uppercase font-bold tracking-widest text-center mt-1">
              Double-click to select
            </p>
          )}
        </div>
      )}
    </div>
  );
}
