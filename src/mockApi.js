// Mock API for ESP32 Gate System

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

let mockState = {
  ultrasonicDistance: 120, // cm
  gateStatus: 'closed', // 'open', 'closed', 'opening', 'closing'
  mistingPump: false,
  batteryLevel: 85,
  mode: 'auto' // 'auto' or 'manual'
};

const generateMockLogs = () => {
  return [
    { id: 1, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(), type: 'entry_detected', detail: 'Distance: 45cm' },
    { id: 2, timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), type: 'gate_open', detail: 'Auto triggered' },
    { id: 3, timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), type: 'misting_cycle', detail: 'Duration: 15s' },
    { id: 4, timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), type: 'mode_change', detail: 'Switched to Auto' }
  ];
};

let mockLogs = generateMockLogs();

export const api = {
  // Get current system state
  getStatus: async () => {
    await delay(300);
    // Simulate slight sensor fluctuation
    const fluctuation = Math.floor(Math.random() * 5) - 2;
    mockState.ultrasonicDistance = Math.max(10, Math.min(400, mockState.ultrasonicDistance + fluctuation));
    return { ...mockState, timestamp: new Date().toISOString() };
  },

  // Manual Override: Toggle Mode
  setMode: async (mode) => {
    await delay(500);
    mockState.mode = mode;
    mockLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: 'mode_change',
      detail: `Switched to ${mode}`
    });
    return mockState;
  },

  // Manual Override: Gate Control
  setGateStatus: async (status) => {
    await delay(500);
    if (mockState.mode !== 'manual') throw new Error('Must be in manual mode');
    mockState.gateStatus = status === 'open' ? 'opening' : 'closing';
    
    // Simulate gate movement
    setTimeout(() => {
      mockState.gateStatus = status;
      mockLogs.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: `gate_${status}`,
        detail: 'Manual trigger'
      });
    }, 2000);

    return mockState;
  },

  // Manual Override: Misting Control
  triggerMisting: async () => {
    await delay(300);
    if (mockState.mode !== 'manual') throw new Error('Must be in manual mode');
    mockState.mistingPump = true;

    // Simulate misting cycle
    setTimeout(() => {
      mockState.mistingPump = false;
      mockLogs.unshift({
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: 'misting_cycle',
        detail: 'Duration: 10s (Manual)'
      });
    }, 10000);

    return { success: true };
  },
  
  // Emergency Stop
  emergencyStop: async () => {
    await delay(200);
    mockState.mode = 'manual';
    mockState.gateStatus = 'closed';
    mockState.mistingPump = false;
    mockLogs.unshift({
      id: Date.now(),
      timestamp: new Date().toISOString(),
      type: 'emergency_stop',
      detail: 'System halted'
    });
    return mockState;
  },

  // Get Event Logs
  getLogs: async () => {
    await delay(400);
    return [...mockLogs];
  }
};
