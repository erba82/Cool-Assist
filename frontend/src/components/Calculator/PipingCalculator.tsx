import React, { useState } from 'react';
import {
  Box,
  Grid,
  Paper,
  Typography,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  IconButton
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { calculatePipeDiameter, calculatePressureDrop } from '../../utils/pipingCalculator';

interface PipingSection {
  id: string;
  type: 'suction' | 'discharge' | 'liquid';
  length: number;
  flow: number;
  temperature: number;
  pressure: number;
  fittings: {
    elbows: number;
    tees: number;
    valves: number;
  };
}

const PipingCalculator: React.FC = () => {
  const [sections, setSections] = useState<PipingSection[]>([]);
  const [currentSection, setCurrentSection] = useState<PipingSection>({
    id: '',
    type: 'suction',
    length: 0,
    flow: 0,
    temperature: 0,
    pressure: 0,
    fittings: {
      elbows: 0,
      tees: 0,
      valves: 0
    }
  });

  const [results, setResults] = useState<{
    recommendedDiameter: number;
    pressureDrop: number;
    velocity: number;
  } | null>(null);

  const handleCalculate = () => {
    const diameter = calculatePipeDiameter({
      type: currentSection.type,
      flow: currentSection.flow,
      temperature: currentSection.temperature,
      pressure: currentSection.pressure
    });

    const pressureDrop = calculatePressureDrop({
      ...currentSection,
      diameter
    });

    setResults({
      recommendedDiameter: diameter,
      pressureDrop: pressureDrop.totalDrop,
      velocity: pressureDrop.velocity
    });
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Refrigeration Piping Calculator
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Pipe Section Type</InputLabel>
              <Select
                value={currentSection.type}
                onChange={(e) => setCurrentSection({
                  ...currentSection,
                  type: e.target.value as PipingSection['type']
                })}
              >
                <MenuItem value="suction">Suction Line</MenuItem>
                <MenuItem value="discharge">Discharge Line</MenuItem>
                <MenuItem value="liquid">Liquid Line</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Pipe Length (m)"
              type="number"
              value={currentSection.length}
              onChange={(e) => setCurrentSection({
                ...currentSection,
                length: Number(e.target.value)
              })}
              fullWidth
            />

            <TextField
              label="Mass Flow Rate (kg/h)"
              type="number"
              value={currentSection.flow}
              onChange={(e) => setCurrentSection({
                ...currentSection,
                flow: Number(e.target.value)
              })}
              fullWidth
            />

            <Grid container spacing={2}>
              <Grid item xs={6}>
                <TextField
                  label="Temperature (°C)"
                  type="number"
                  value={currentSection.temperature}
                  onChange={(e) => setCurrentSection({
                    ...currentSection,
                    temperature: Number(e.target.value)
                  })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  label="Pressure (bar)"
                  type="number"
                  value={currentSection.pressure}
                  onChange={(e) => setCurrentSection({
                    ...currentSection,
                    pressure: Number(e.target.value)
                  })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
              Fittings
              <Tooltip title="Enter the number of each fitting type in the pipe section">
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
            </Typography>

            <Grid container spacing={2}>
              <Grid item xs={4}>
                <TextField
                  label="Elbows"
                  type="number"
                  value={currentSection.fittings.elbows}
                  onChange={(e) => setCurrentSection({
                    ...currentSection,
                    fittings: {
                      ...currentSection.fittings,
                      elbows: Number(e.target.value)
                    }
                  })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Tees"
                  type="number"
                  value={currentSection.fittings.tees}
                  onChange={(e) => setCurrentSection({
                    ...currentSection,
                    fittings: {
                      ...currentSection.fittings,
                      tees: Number(e.target.value)
                    }
                  })}
                  fullWidth
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  label="Valves"
                  type="number"
                  value={currentSection.fittings.valves}
                  onChange={(e) => setCurrentSection({
                    ...currentSection,
                    fittings: {
                      ...currentSection.fittings,
                      valves: Number(e.target.value)
                    }
                  })}
                  fullWidth
                />
              </Grid>
            </Grid>

            <Button
              variant="contained"
              color="primary"
              onClick={handleCalculate}
              fullWidth
              sx={{ mt: 2 }}
            >
              Calculate
            </Button>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          {results && (
            <Box>
              <Typography variant="h6" gutterBottom>
                Calculation Results
              </Typography>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Recommended Pipe Diameter</TableCell>
                      <TableCell>{results.recommendedDiameter.toFixed(2)} mm</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Pressure Drop</TableCell>
                      <TableCell>{results.pressureDrop.toFixed(2)} kPa</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>Flow Velocity</TableCell>
                      <TableCell>{results.velocity.toFixed(2)} m/s</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Grid>
      </Grid>
    </Paper>
  );
};

export default PipingCalculator;