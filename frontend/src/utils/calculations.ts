export interface HVACLoadParams {
    roomLength: number;
    roomWidth: number;
    roomHeight: number;
    occupants: number;
    equipment: number;
    windows: number;
    insulation: string;
    outdoorTemp: number;
    desiredTemp: number;
  }
  
  export interface RefrigerationParams {
    capacity: number;
    evaporatingTemp: number;
    condensingTemp: number;
    subcooling: number;
    superheating: number;
    refrigerantType: string;
  }
  
  export const calculateHVACLoad = (params: HVACLoadParams) => {
    // Implementation of HVAC load calculations
    // ...
  };
  
  export const calculateRefrigeration = (params: RefrigerationParams) => {
    // Implementation of refrigeration system calculations
    // ...
  };