import React, { useRef } from 'react';
import { Stage, Layer, Line, Circle, Text } from 'react-konva';
import { Box, Paper, Button, Typography } from '@mui/material';

interface WiringDiagramProps {
  components: {
    id: string;
    type: 'compressor' | 'fan' | 'heater' | 'control';
    position: { x: number; y: number };
    connections: string[];
  }[];
}

const WiringDiagram: React.FC<WiringDiagramProps> = ({ components }) => {
  const stageRef = useRef<any>(null);

  const drawComponent = (component: any) => {
    switch (component.type) {
      case 'compressor':
        return drawCompressor(component);
      case 'fan':
        return drawFan(component);
      case 'heater':
        return drawHeater(component);
      case 'control':
        return drawControl(component);
      default:
        return null;
    }
  };

  const exportToPDF = () => {
    const uri = stageRef.current.toDataURL();
    // Implementation of PDF export using the uri
    console.log("Export PDF URI: ", uri);
  };

  const exportToCAD = () => {
    // Implementation of CAD export
    console.log("Export CAD functionality not implemented yet.");
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6">Wiring Diagram</Typography>
        <Box>
          <Button onClick={exportToPDF} sx={{ mr: 1 }}>Export to PDF</Button>
          <Button onClick={exportToCAD}>Export to CAD</Button>
        </Box>
      </Box>

      <Stage width={800} height={600} ref={stageRef}>
        <Layer>
          {components.map(component => (
            <React.Fragment key={component.id}>
              {drawComponent(component)}
            </React.Fragment>
          ))}
          {/* Draw connections */}
          {components.map(component => {
            const { x, y } = component.position;
            return component.connections.map((targetId: string, index: number) => {
              // Find target component
              const targetComponent = components.find(c => c.id === targetId);
              if (!targetComponent) return null;
              const { x: tx, y: ty } = targetComponent.position;
              return (
                <Line
                  key={`${component.id}-${targetId}-${index}`}
                  points={[x, y, tx, ty]}
                  stroke="grey"
                  strokeWidth={2}
                />
              );
            });
          })}
        </Layer>
      </Stage>
    </Paper>
  );
};

function drawCompressor(component: any) {
  const { x, y } = component.position;
  const radius = 25;
  return (
    <>
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill="lightcoral"
        stroke="black"
        strokeWidth={2}
      />
      <Text
        text="Compressor"
        x={x - radius}
        y={y + radius + 5}
        fontSize={12}
        fill="black"
      />
    </>
  );
}

function drawFan(component: any) {
  const { x, y } = component.position;
  const radius = 20;
  return (
    <>
      <Circle
        x={x}
        y={y}
        radius={radius}
        fill="lightblue"
        stroke="black"
        strokeWidth={2}
      />
      <Line
        points={[x - radius, y, x + radius, y]}
        stroke="black"
        strokeWidth={2}
      />
      <Line
        points={[x, y - radius, x, y + radius]}
        stroke="black"
        strokeWidth={2}
      />
      <Text
        text="Fan"
        x={x - 15}
        y={y + radius + 5}
        fontSize={12}
        fill="black"
      />
    </>
  );
}

function drawHeater(component: any) {
  const { x, y } = component.position;
  const width = 40;
  const height = 20;
  return (
    <>
      <Line
        points={[
          x - width / 2, y - height / 2,
          x + width / 2, y - height / 2,
          x + width / 2, y + height / 2,
          x - width / 2, y + height / 2,
          x - width / 2, y - height / 2
        ]}
        stroke="black"
        strokeWidth={2}
        fill="orange"
        closed
      />
      <Line
        points={[x - width / 3, y, x + width / 3, y]}
        stroke="black"
        strokeWidth={2}
      />
      <Text
        text="Heater"
        x={x - 20}
        y={y + height / 2 + 5}
        fontSize={12}
        fill="black"
      />
    </>
  );
}

function drawControl(component: any) {
  const { x, y } = component.position;
  const width = 40;
  const height = 40;
  return (
    <>
      <Line
        points={[
          x - width / 2, y - height / 2,
          x + width / 2, y - height / 2,
          x + width / 2, y + height / 2,
          x - width / 2, y + height / 2,
          x - width / 2, y - height / 2
        ]}
        stroke="black"
        strokeWidth={2}
        fill="lightgreen"
        closed
      />
      <Text
        text="Control"
        x={x - 25}
        y={y - 7}
        fontSize={12}
        fill="black"
      />
      <Line
        points={[x - 15, y + 10, x + 15, y + 10]}
        stroke="black"
        strokeWidth={2}
      />
    </>
  );
}

export default WiringDiagram;