export const CLASSES = [
  { code: '1A', name: 'First AC', fare: 4200, desc: 'Premium luxury, spacious cabins, privacy doors', capacity: 24, type: 'Cabins/Coupes', layoutDesc: '2 Berths per Coupe, 4 per Cabin' },
  { code: '2A', name: 'Second AC', fare: 2800, desc: 'Comfortable air-conditioned sleeper with curtains', capacity: 48, type: '2-Tier Sleeper', layoutDesc: 'Lower & Upper + Side Lower & Side Upper' },
  { code: '3A', name: 'Third AC', fare: 1800, desc: 'Air-conditioned sleeper, budget friendly', capacity: 72, type: '3-Tier Sleeper', layoutDesc: 'Lower, Middle, Upper + Side Lower & Side Upper' },
  { code: 'SL', name: 'Sleeper', fare: 650, desc: 'Standard non-AC sleeper class', capacity: 72, type: '3-Tier Sleeper (Non-AC)', layoutDesc: 'Lower, Middle, Upper + Side Lower & Side Upper' },
  { code: 'EC', name: 'Executive Class', fare: 1850, desc: 'Premium AC chair seating with extra legroom', capacity: 56, type: '2x2 Premium Seating', layoutDesc: '2 Chairs Left, 2 Chairs Right' },
  { code: 'CC', name: 'AC Chair Car', fare: 950, desc: 'Air-conditioned chair seating for day travel', capacity: 64, type: '2x2 Seating', layoutDesc: '2 Chairs Left, 2 Chairs Right' },
  { code: '2S', name: '2nd Seating', fare: 250, desc: 'Basic non-AC seating', capacity: 108, type: '3x3 Bench Seating', layoutDesc: '3 Seats Left, 3 Seats Right' },
];

export const CC_SEAT_MAPPING = {
  Seat_01_L1: 1,  Seat_01_L2: 2,  Seat_01_R1: 3,  Seat_01_R2: 4,
  Seat_02_L1: 5,  Seat_02_L2: 6,  Seat_02_R1: 7,  Seat_02_R2: 8,
  Seat_03_L1: 9,  Seat_03_L2: 10, Seat_03_R1: 11, Seat_03_R2: 12,
  Seat_04_L1: 13, Seat_04_L2: 14, Seat_04_R1: 15, Seat_04_R2: 16,
  Seat_05_L1: 17, Seat_05_L2: 18, Seat_05_R1: 19, Seat_05_R2: 20,
  Seat_06_L1: 21, Seat_06_L2: 22, Seat_06_R1: 23, Seat_06_R2: 24,
  Seat_07_L1: 25, Seat_07_L2: 26, Seat_07_R1: 27, Seat_07_R2: 28,
  Seat_08_L1: 29, Seat_08_L2: 30, Seat_08_R1: 31, Seat_08_R2: 32,
  Seat_09_L1: 33, Seat_09_L2: 34, Seat_09_R1: 35, Seat_09_R2: 36,
  Seat_10_L1: 37, Seat_10_L2: 38, Seat_10_R1: 39, Seat_10_R2: 40,
  Seat_11_L1: 41, Seat_11_L2: 42, Seat_11_R1: 43, Seat_11_R2: 44,
  Seat_12_L1: 45, Seat_12_L2: 46, Seat_12_R1: 47, Seat_12_R2: 48,
  Seat_13_L1: 49, Seat_13_L2: 50, Seat_13_R1: 51, Seat_13_R2: 52,
  Seat_14_L1: 53, Seat_14_L2: 54, Seat_14_R1: 55, Seat_14_R2: 56,
  Seat_15_L1: 57, Seat_15_L2: 58, Seat_15_R1: 59, Seat_15_R2: 60,
  Seat_16_L1: 61, Seat_16_L2: 62, Seat_16_R1: 63, Seat_16_R2: 64,
};
export const ccSeatMapping = CC_SEAT_MAPPING;

export const TRAIN_COMPOSITION = {
  '1A': ['H1'],
  '2A': ['A1', 'A2'],
  '3A': ['B1', 'B2', 'B3', 'B4'],
  'SL': ['S1', 'S2', 'S3', 'S4', 'S5'],
  'EC': ['E1'],
  'CC': ['C1', 'C2'],
  '2S': ['D1', 'D2', 'D3'],
};

export function getSeatAvailability(coachId, seatId) {
  // Deterministic mock data based on coach string and seat ID
  const seed = coachId.charCodeAt(0) + (coachId.charCodeAt(1) || 0) * 10;
  const rand = ((seatId * 17) + seed * 31) % 100;
  if (rand < 55) return 'available';
  if (rand < 85) return 'occupied';
  return 'RAC';
}

export function generate2DLayout(classCode) {
  let layout = [];
  let currentId = 1;

  if (classCode === '3A' || classCode === 'SL') {
    for (let i = 0; i < 9; i++) {
      layout.push({
        type: 'bay',
        mainLeft: [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Middle Berth', pos: 'Middle' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ],
        mainRight: [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Middle Berth', pos: 'Middle' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ],
        side: [
          { id: currentId++, type: 'Side Lower', pos: 'Window' },
          { id: currentId++, type: 'Side Upper', pos: 'Window' }
        ]
      });
    }
  } else if (classCode === '2A') {
    for (let i = 0; i < 8; i++) {
      layout.push({
        type: 'bay',
        mainLeft: [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ],
        mainRight: [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ],
        side: [
          { id: currentId++, type: 'Side Lower', pos: 'Window' },
          { id: currentId++, type: 'Side Upper', pos: 'Window' }
        ]
      });
    }
  } else if (classCode === '1A') {
    for (let i = 0; i < 6; i++) {
      const isCabin = i % 3 !== 0; 
      layout.push({
        type: 'cabin',
        isCabin,
        name: String.fromCharCode(65 + i),
        mainLeft: [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ],
        mainRight: isCabin ? [
          { id: currentId++, type: 'Lower Berth', pos: 'Window' },
          { id: currentId++, type: 'Upper Berth', pos: 'Aisle' }
        ] : []
      });
    }
  } else if (classCode === 'CC') {
    for (let i = 0; i < 16; i++) {
      layout.push({
        type: 'row',
        left: [
          { id: currentId++, type: 'AC Chair', pos: 'Window' },
          { id: currentId++, type: 'AC Chair', pos: 'Aisle' }
        ],
        right: [
          { id: currentId++, type: 'AC Chair', pos: 'Aisle' },
          { id: currentId++, type: 'AC Chair', pos: 'Window' }
        ]
      });
    }
  } else if (classCode === 'EC') {
    for (let i = 0; i < 14; i++) {
      layout.push({
        type: 'row',
        left: [
          { id: currentId++, type: 'Exec Chair', pos: 'Window' },
          { id: currentId++, type: 'Exec Chair', pos: 'Aisle' }
        ],
        right: [
          { id: currentId++, type: 'Exec Chair', pos: 'Aisle' },
          { id: currentId++, type: 'Exec Chair', pos: 'Window' }
        ]
      });
    }
  } else if (classCode === '2S') {
    for (let i = 0; i < 18; i++) {
      layout.push({
        type: 'row',
        left: [
          { id: currentId++, type: 'Bench', pos: 'Window' },
          { id: currentId++, type: 'Bench', pos: 'Middle' },
          { id: currentId++, type: 'Bench', pos: 'Aisle' }
        ],
        right: [
          { id: currentId++, type: 'Bench', pos: 'Aisle' },
          { id: currentId++, type: 'Bench', pos: 'Middle' },
          { id: currentId++, type: 'Bench', pos: 'Window' }
        ]
      });
    }
  }
  return layout;
}

export function generate3DLayout(classCode) {
  const seats = [];
  let currentId = 1;
  let coachLength = 40;

  const addSeat = (type, pos, position, rotation = [0,0,0], size = [1, 0.2, 2], extra = {}) => {
    seats.push({
      id: currentId++, type, pos,
      position, rotation, size,
      ...extra,
    });
  };

  if (classCode === '3A') {
    coachLength = 23.3;
    const bayCenters = [-5.11, -1.70, 1.72, 5.13];
    bayCenters.forEach((z) => {
      // Main Compartment (Right side of aisle in coach.glb, x = 1.02m)
      // Side A (facing +Z, z - 1.20m)
      addSeat('Lower Berth',  'Window', [1.02, 0.38, z - 1.20], [0, 0, 0], [1.65, 0.12, 0.72]);
      addSeat('Middle Berth', 'Middle', [1.02, 1.25, z - 1.20], [0, 0, 0], [1.65, 0.10, 0.72]);
      addSeat('Upper Berth',  'Aisle',  [1.02, 2.05, z - 1.20], [0, 0, 0], [1.65, 0.10, 0.72]);
      // Side B (facing -Z, z + 1.20m)
      addSeat('Lower Berth',  'Window', [1.02, 0.38, z + 1.20], [0, 0, 0], [1.65, 0.12, 0.72]);
      addSeat('Middle Berth', 'Middle', [1.02, 1.25, z + 1.20], [0, 0, 0], [1.65, 0.10, 0.72]);
      addSeat('Upper Berth',  'Aisle',  [1.02, 2.05, z + 1.20], [0, 0, 0], [1.65, 0.10, 0.72]);
      // Side Berths (Left side of aisle in coach.glb, x = -1.48m)
      addSeat('Side Lower',   'Window', [-1.48, 0.38, z],        [0, 0, 0], [0.72, 0.12, 1.80]);
      addSeat('Side Upper',   'Window', [-1.48, 2.00, z],        [0, 0, 0], [0.72, 0.10, 1.80]);
    });
  } else if (classCode === 'SL') {
    coachLength = 9 * 4 + 2;
    for (let i = 0; i < 9; i++) {
      const z = (i * 4) - (coachLength / 2) + 2;
      addSeat('Lower Berth', 'Window', [-1.4, 0.3, z - 0.7], [0,0,0], [1.8, 0.15, 0.8]);
      addSeat('Middle Berth', 'Middle', [-1.4, 1.1, z - 0.7], [0,0,0], [1.8, 0.1, 0.8]);
      addSeat('Upper Berth', 'Aisle', [-1.4, 1.9, z - 0.7], [0,0,0], [1.8, 0.1, 0.8]);
      addSeat('Lower Berth', 'Window', [-1.4, 0.3, z + 0.7], [0,0,0], [1.8, 0.15, 0.8]);
      addSeat('Middle Berth', 'Middle', [-1.4, 1.1, z + 0.7], [0,0,0], [1.8, 0.1, 0.8]);
      addSeat('Upper Berth', 'Aisle', [-1.4, 1.9, z + 0.7], [0,0,0], [1.8, 0.1, 0.8]);
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
    coachLength = 26.0;
    for (let i = 0; i < 16; i++) {
      const z = -10.284 + (i * 1.36);
      const rowStr = String(i + 1).padStart(2, '0');
      addSeat('AC Chair', 'Window', [-1.18, 0.90, z], [0, 0, 0], [0.525, 1.1, 0.788], { unitName: `Seat_${rowStr}_L1` });
      addSeat('AC Chair', 'Aisle',  [-0.66, 0.90, z], [0, 0, 0], [0.525, 1.1, 0.788], { unitName: `Seat_${rowStr}_L2` });
      addSeat('AC Chair', 'Aisle',  [ 0.66, 0.90, z], [0, 0, 0], [0.525, 1.1, 0.788], { unitName: `Seat_${rowStr}_R1` });
      addSeat('AC Chair', 'Window', [ 1.18, 0.90, z], [0, 0, 0], [0.525, 1.1, 0.788], { unitName: `Seat_${rowStr}_R2` });
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
