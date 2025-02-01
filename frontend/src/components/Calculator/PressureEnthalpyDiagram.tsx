import React from 'react';
import { Box, Paper, Typography } from '@mui/material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';

interface PHDiagramProps {
  systemType: string;
  cyclePoints: Array<{
    enthalpy: number;
    pressure: number;
    state: string;
  }>;
}

const PressureEnthalpyDiagram: React.FC<PHDiagramProps> = ({ systemType, cyclePoints }) => {
  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Pressure-Enthalpy Diagram ({systemType})
      </Typography>
      <Box sx={{ width: '100%', height: 400 }}>
        <LineChart
          width={800}
          height={400}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="enthalpy"
            type="number"
            label={{ value: 'Enthalpy (kJ/kg)', position: 'bottom' }}
          />
          <YAxis
            type="number"
            label={{ value: 'Pressure (bar)', angle: -90, position: 'left' }}
            scale="log"
          />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            data={cyclePoints}
            dataKey="pressure"
            stroke="#8884d8"
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
          {/* Add saturation curves and other reference lines */}
        </LineChart>
      </Box>
    </Paper>
  );
};

export default PressureEnthalpyDiagram;