export interface SystemStatus {
    compressor: {
      pressure: number;
      power: number;
      temperature: number;
      status: 'running' | 'stopped' | 'error';
    };
    condenser: {
      temperature: number;
      fanSpeed: number;
      pressure: number;
    };
    evaporator: {
      temperature: number;
      superheat: number;
      fanStatus: boolean;
    };
    expansion: {
      openingPercentage: number;
      pressure: number;
    };
    sensors: {
      compressorPressure: number;
      systemTemp: number;
      humidity: number;
      powerConsumption: number;
    };
    limits: {
      maxPressure: number;
      minTemp: number;
      maxTemp: number;
    };
  }
  
  export interface SensorData {
    timestamp: Date;
    compressorPressure: number;
    systemTemp: number;
    humidity: number;
    powerConsumption: number;
  }