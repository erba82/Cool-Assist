import { SystemStatus, SensorData } from '../types/monitoring';

class MonitoringService {
  private websocket: WebSocket | null = null;
  private listeners: ((data: any) => void)[] = [];

  constructor() {
    this.initializeWebSocket();
  }

  private initializeWebSocket() {
    this.websocket = new WebSocket(process.env.REACT_APP_WS_URL || 'ws://localhost:8080');

    this.websocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      this.listeners.forEach(listener => listener(data));
    };

    this.websocket.onclose = () => {
      setTimeout(() => this.initializeWebSocket(), 5000);
    };
  }

  async getCurrentStatus(): Promise<SystemStatus> {
    return new Promise((resolve, reject) => {
      if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
        reject(new Error('WebSocket connection not available'));
        return;
      }

      this.websocket.send(JSON.stringify({ type: 'GET_STATUS' }));
      
      const handleMessage = (event: MessageEvent) => {
        const data = JSON.parse(event.data);
        if (data.type === 'STATUS_UPDATE') {
          this.websocket?.removeEventListener('message', handleMessage);
          resolve(data.status);
        }
      };

      this.websocket.addEventListener('message', handleMessage);
    });
  }

  addStatusListener(callback: (data: any) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(l => l !== callback);
    };
  }

  async getHistoricalData(startTime: Date, endTime: Date): Promise<SensorData[]> {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/monitoring/historical`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ startTime, endTime }),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch historical data');
    }

    return response.json();
  }

  async setAlertThresholds(thresholds: {
    maxPressure: number;
    minTemp: number;
    maxTemp: number;
  }) {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/api/monitoring/thresholds`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(thresholds),
    });

    if (!response.ok) {
      throw new Error('Failed to update alert thresholds');
    }

    return response.json();
  }
}

export const monitoringService = new MonitoringService();