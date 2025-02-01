import React, { useState, useCallback } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Connection,
  addEdge,
  Background,
  Controls,
  MiniMap,
  NodeTypes
} from 'reactflow';
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
  IconButton,
  TextField,
  Button,
  Stack
} from '@mui/material';
import {
  AcUnit as CoolingIcon,
  Whatshot as HeatingIcon,
  Air as FanIcon,
  Compress as CompressorIcon,
  ShowChart as SensorIcon,
  Settings as ControlIcon
} from '@mui/icons-material';

// Custom Node Components
const CustomNode = ({ data }: { data: any }) => (
  <Paper
    elevation={3}
    sx={{
      padding: 1,
      minWidth: 150,
      backgroundColor: data.color || '#fff'
    }}
  >
    <Typography variant="subtitle2">{data.label}</Typography>
    {data.details && (
      <Typography variant="caption" display="block">
        {data.details}
      </Typography>
    )}
  </Paper>
);

const nodeTypes = {
  custom: CustomNode
};

interface FlowDiagramData {
  nodes: Node[];
  edges: Edge[];
}

export const FlowDiagramDesigner: React.FC = () => {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    []
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setSelectedNode(node);
  }, []);

  const addNewNode = (type: string) => {
    const newNode = {
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
    // TODO: Implement backend save functionality
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
          <ListItem button onClick={() => addNewNode('Cooling')}>
            <ListItemIcon>
              <CoolingIcon />
            </ListItemIcon>
            <ListItemText primary="Cooling Unit" />
          </ListItem>
          <ListItem button onClick={() => addNewNode('Heating')}>
            <ListItemIcon>
              <HeatingIcon />
            </ListItemIcon>
            <ListItemText primary="Heating Unit" />
          </ListItem>
          <ListItem button onClick={() => addNewNode('Fan')}>
            <ListItemIcon>
              <FanIcon />
            </ListItemIcon>
            <ListItemText primary="Fan" />
          </ListItem>
          <ListItem button onClick={() => addNewNode('Compressor')}>
            <ListItemIcon>
              <CompressorIcon />
            </ListItemIcon>
            <ListItemText primary="Compressor" />
          </ListItem>
          <ListItem button onClick={() => addNewNode('Sensor')}>
            <ListItemIcon>
              <SensorIcon />
            </ListItemIcon>
            <ListItemText primary="Sensor" />
          </ListItem>
          <ListItem button onClick={() => addNewNode('Control')}>
            <ListItemIcon>
              <ControlIcon />
            </ListItemIcon>
            <ListItemText primary="Control" />
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
          open={!!selectedNode}
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