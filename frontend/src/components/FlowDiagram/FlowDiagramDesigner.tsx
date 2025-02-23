import React, { useState, useCallback } from 'react';
import ReactFlow, { addEdge, Background, Controls, MiniMap } from 'reactflow';
import 'reactflow/dist/style.css';
import {
  Box,
  Paper,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  TextField,
  Button,
  Stack,
  ListItemButton
} from '@mui/material';
import {
  AcUnit as CoolingIcon,
  Whatshot as HeatingIcon,
  Air as FanIcon,
  Compress as CompressorIcon,
  ShowChart as SensorIcon,
  Settings as ControlIcon
} from '@mui/icons-material';

// Instead of using the types from reactflow which may cause namespace issues,
// we define our own minimal type interfaces for our diagram.
export interface FlowNode<T = any> {
  id: string;
  type?: string;
  position: { x: number; y: number };
  data: T;
  // Additional properties can be added if needed.
}

export interface FlowEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
  type?: string;
  animated?: boolean;
  style?: React.CSSProperties;
  // You can extend this interface with additional properties as required.
}

export interface FlowConnection {
  source: string | null;
  target: string | null;
  sourceHandle: string | null;
  targetHandle: string | null;
}

// Custom Node Component for rendering our nodes.
const CustomNode = ({ data }: { data: any }) => (
  <Paper
    elevation={3}
    style={{ padding: 8, minWidth: 150, backgroundColor: data.color || '#fff' }}
  >
    <Typography variant="subtitle2">{data.label}</Typography>
    {data.details && (
      <Typography variant="caption" display="block">
        {data.details}
      </Typography>
    )}
  </Paper>
);

const nodeTypes = { custom: CustomNode };

interface FlowDiagramData {
  nodes: FlowNode<any>[];
  edges: FlowEdge[];
}

export const FlowDiagramDesigner: React.FC = () => {
  const [nodes, setNodes] = useState<FlowNode<any>[]>([]);
  const [edges, setEdges] = useState<FlowEdge[]>([]);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(true);
  const [selectedNode, setSelectedNode] = useState<FlowNode<any> | null>(null);

  const onConnect = useCallback(
    (params: FlowConnection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onNodeClick = useCallback(
    (event: React.MouseEvent, node: FlowNode<any>) => {
      setSelectedNode(node);
    },
    []
  );

  const addNewNode = (type: string) => {
    const newNode: FlowNode<any> = {
      id: `${type}-${nodes.length + 1}`,
      type: 'custom',
      position: { x: 100, y: 100 },
      data: {
        label: type,
        type: type,
        color: getNodeColor(type),
        details: getDefaultDetails(type)
      }
    };
    setNodes((nds) => [...nds, newNode]);
  };

  const getNodeColor = (type: string): string => {
    switch (type) {
      case 'Cooling':
        return '#e3f2fd';
      case 'Heating':
        return '#ffebee';
      case 'Fan':
        return '#e8f5e9';
      case 'Compressor':
        return '#ede7f6';
      case 'Sensor':
        return '#fff3e0';
      case 'Control':
        return '#f5f5f5';
      default:
        return '#ffffff';
    }
  };

  const getDefaultDetails = (type: string): string => {
    switch (type) {
      case 'Cooling':
        return 'Capacity: 0 kW';
      case 'Heating':
        return 'Capacity: 0 kW';
      case 'Fan':
        return 'Flow: 0 m³/h';
      case 'Compressor':
        return 'Power: 0 kW';
      case 'Sensor':
        return 'Type: Temperature';
      case 'Control':
        return 'PID Controller';
      default:
        return '';
    }
  };

  const updateNodeDetails = (id: string, details: string) => {
    setNodes((nds) =>
      nds.map((node) => {
        if (node.id === id) {
          return {
            ...node,
            data: {
              ...node.data,
              details: details
            }
          };
        }
        return node;
      })
    );
  };

  const onSave = () => {
    const flowData: FlowDiagramData = {
      nodes,
      edges
    };
    localStorage.setItem('flowDiagram', JSON.stringify(flowData));
    // Additional backend save functionality can be implemented if needed.
  };

  const onLoad = () => {
    const savedData = localStorage.getItem('flowDiagram');
    if (savedData) {
      const flowData: FlowDiagramData = JSON.parse(savedData);
      setNodes(flowData.nodes);
      setEdges(flowData.edges);
    }
  };

  return (
    <Box sx={{ height: '100vh', display: 'flex' }}>
      <Drawer
        variant="persistent"
        anchor="left"
        open={drawerOpen}
        sx={{
          width: 240,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: 240,
            boxSizing: 'border-box'
          }
        }}
      >
        <List>
          <ListItem>
            <Typography variant="h6">Components</Typography>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => addNewNode('Cooling')}>
              <ListItemIcon>
                <CoolingIcon />
              </ListItemIcon>
              <ListItemText primary="Cooling Unit" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => addNewNode('Heating')}>
              <ListItemIcon>
                <HeatingIcon />
              </ListItemIcon>
              <ListItemText primary="Heating Unit" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => addNewNode('Fan')}>
              <ListItemIcon>
                <FanIcon />
              </ListItemIcon>
              <ListItemText primary="Fan" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => addNewNode('Compressor')}>
              <ListItemIcon>
                <CompressorIcon />
              </ListItemIcon>
              <ListItemText primary="Compressor" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => addNewNode('Sensor')}>
              <ListItemIcon>
                <SensorIcon />
              </ListItemIcon>
              <ListItemText primary="Sensor" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton onClick={() => addNewNode('Control')}>
              <ListItemIcon>
                <ControlIcon />
              </ListItemIcon>
              <ListItemText primary="Control" />
            </ListItemButton>
          </ListItem>
        </List>
        <Stack spacing={2} sx={{ p: 2 }}>
          <Button variant="contained" onClick={onSave}>
            Save Diagram
          </Button>
          <Button variant="outlined" onClick={onLoad}>
            Load Diagram
          </Button>
        </Stack>
      </Drawer>
      <Box sx={{ flexGrow: 1 }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onConnect={onConnect}
          onNodeClick={onNodeClick}
          nodeTypes={nodeTypes}
          fitView
        >
          <Background />
          <Controls />
          <MiniMap />
        </ReactFlow>
      </Box>
      {selectedNode && (
        <Drawer
          anchor="right"
          open={Boolean(selectedNode)}
          onClose={() => setSelectedNode(null)}
          sx={{ width: 300 }}
        >
          <Box sx={{ p: 2 }}>
            <Typography variant="h6">Properties</Typography>
            <TextField
              fullWidth
              label="Details"
              defaultValue={selectedNode.data.details}
              margin="normal"
              onChange={(e) => updateNodeDetails(selectedNode.id, e.target.value)}
            />
          </Box>
        </Drawer>
      )}
    </Box>
  );
};

export default FlowDiagramDesigner;