export const CLASSES = [
  { code: '1A', name: 'First AC', fare: 4200, desc: 'Premium luxury, spacious cabins, privacy doors', capacity: 24, type: 'Cabins/Coupes', layoutDesc: '2 Berths per Coupe, 4 per Cabin' },
  { code: '2A', name: 'Second AC', fare: 2800, desc: 'Comfortable air-conditioned sleeper with curtains', capacity: 48, type: '2-Tier Sleeper', layoutDesc: 'Lower & Upper + Side Lower & Side Upper' },
  { code: '3A', name: 'Third AC', fare: 1800, desc: 'Air-conditioned sleeper, budget friendly', capacity: 72, type: '3-Tier Sleeper', layoutDesc: 'Lower, Middle, Upper + Side Lower & Side Upper' },
  { code: 'SL', name: 'Sleeper', fare: 650, desc: 'Standard non-AC sleeper class', capacity: 72, type: '3-Tier Sleeper (Non-AC)', layoutDesc: 'Lower, Middle, Upper + Side Lower & Side Upper' },
  { code: 'EC', name: 'Exec Chair', fare: 1850, desc: 'Spacious AC seating with ample legroom', capacity: 56, type: '2x2 Premium Seating', layoutDesc: '2 Chairs Left, 2 Chairs Right' },
  { code: 'CC', name: 'AC Chair', fare: 950, desc: 'Air-conditioned seating for day travel', capacity: 75, type: '3x2 Seating', layoutDesc: '3 Chairs Left, 2 Chairs Right' },
  { code: '2S', name: '2nd Seating', fare: 250, desc: 'Basic non-AC seating', capacity: 108, type: '3x3 Bench Seating', layoutDesc: '3 Seats Left, 3 Seats Right' },
];

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
    for (let i = 0; i < 15; i++) {
      layout.push({
        type: 'row',
        left: [
          { id: currentId++, type: 'Chair', pos: 'Window' },
          { id: currentId++, type: 'Chair', pos: 'Middle' },
          { id: currentId++, type: 'Chair', pos: 'Aisle' }
        ],
        right: [
          { id: currentId++, type: 'Chair', pos: 'Aisle' },
          { id: currentId++, type: 'Chair', pos: 'Window' }
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

  const addSeat = (type, pos, position, rotation = [0,0,0], size = [1, 0.2, 2]) => {
    seats.push({
      id: currentId++, type, pos,
      position, rotation, size,
    });
  };

  if (classCode === '3A' || classCode === 'SL') {
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
