import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  CircularProgress,
  Alert,
  Button,
  Tabs,
  Tab
} from '@mui/material';
import { Line } from 'react-chartjs-2';
import { analyzeSystem, SystemData, AnalysisResult } from '../../utils/systemAnalysis';
import { ExportToPDF } from '../../utils/exportUtils';

const SystemAnalyzer: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [systemData, setSystemData] = useState<SystemData | null>(null);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performAnalysis = async () => {
    try {
      setLoading(true);
      const results = await analyzeSystem(systemData!);
      setAnalysisResults(results);
      setError(null);
    } catch (err) {
      setError('Error performing system analysis');
    } finally {
      setLoading(false);
    }
  };

  const generateReport = () => {
    if (!analysisResults) return;
    ExportToPDF.generateSystemReport(analysisResults);
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        System Analysis & Optimization
      </Typography>

      <Tabs value={activeTab} onChange={(_, newValue) => setActiveTab(newValue)} sx={{ mb: 3 }}>
        <Tab label="Performance Analysis" />
        <Tab label="Energy Efficiency" />
        <Tab label="Cost Analysis" />
        <Tab label="Optimization Suggestions" />
      </Tabs>

      {loading ? (
        <Box display="flex" justifyContent="center" p={3}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
      ) : analysisResults && (
        <Grid container spacing={3}>
          {activeTab === 0 && (
            <Grid item xs={12}>
              <PerformanceAnalysis data={analysisResults.performance} />
            </Grid>
          )}
          {activeTab === 1 && (
            <Grid item xs={12}>
              <EnergyEfficiencyAnalysis data={analysisResults.energyEfficiency} />
            </Grid>
          )}
          {activeTab === 2 && (
            <Grid item xs={12}>
              <CostAnalysis data={analysisResults.costAnalysis} />
            </Grid>
          )}
          {activeTab === 3 && (
            <Grid item xs={12}>
              <OptimizationSuggestions suggestions={analysisResults.optimizationSuggestions} />
            </Grid>
          )}
        </Grid>
      )}

      <Box sx={{ mt: 3, display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button 
          variant="contained" 
          color="primary"
          onClick={performAnalysis}
          disabled={!systemData}
        >
          Analyze System
        </Button>
        <Button 
          variant="outlined"
          onClick={generateReport}
          disabled={!analysisResults}
        >
          Generate Report
        </Button>
      </Box>
    </Paper>
  );
};

const PerformanceAnalysis: React.FC<{ data: any }> = ({ data }) => (
  <Card>
    <CardContent>
      <Typography variant="h6" gutterBottom>
        System Performance Metrics
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Box sx={{ height: 300 }}>
            <Line
              data={data.performanceChart}
              options={{
                responsive: true,
                maintainAspectRatio: false,
              }}
            />
          </Box>
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography variant="subtitle1" gutterBottom>
            Key Performance Indicators
          </Typography>
          {/* Add KPI display components */}
        </Grid>
      </Grid>
    </CardContent>
  </Card>
);

// Similar components for other analysis sections...

export default SystemAnalyzer;