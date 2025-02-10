/**
 * @author erba82
 * @lastModified 2025-02-07 12:13:21
 */

import React, { useEffect, useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Collapse,
  List,
  ListItem,
  ListItemText,
  TablePagination,
  TextField,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  KeyboardArrowDown as ExpandMoreIcon,
  KeyboardArrowUp as ExpandLessIcon,
} from '@mui/icons-material';
import { PerformanceOptimizer } from '../../services/optimization/PerformanceOptimizer';

interface OptimizationRecord {
  id: string;
  timestamp: Date;
  parameter: string;
  previousValue: number;
  newValue: number;
  improvement: number;
  status: 'pending' | 'applied' | 'reverted' | 'failed';
  impact: 'positive' | 'neutral' | 'negative';
  steps: string[];
  notes: string;
}

export const OptimizationHistory: React.FC = () => {
  const [history, setHistory] = useState<OptimizationRecord[]>([]);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterImpact, setFilterImpact] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const optimizer = PerformanceOptimizer.getInstance();
        const historyData = await (optimizer as any).getHistory();
        setHistory(historyData);
      } catch (error) {
        console.error('Failed to fetch optimization history:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, []);

  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'applied':
        return 'success';
      case 'pending':
        return 'warning';
      case 'reverted':
        return 'error';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'positive':
        return 'success';
      case 'neutral':
        return 'info';
      case 'negative':
        return 'error';
      default:
        return 'default';
    }
  };

  const filteredHistory = history.filter(record => {
    if (filterStatus !== 'all' && record.status !== filterStatus) return false;
    if (filterImpact !== 'all' && record.impact !== filterImpact) return false;
    return true;
  });

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Optimization History
      </Typography>

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box display="flex" gap={2}>
            <TextField
              select
              label="Status Filter"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              sx={{ width: 200 }}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="applied">Applied</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
              <MenuItem value="reverted">Reverted</MenuItem>
              <MenuItem value="failed">Failed</MenuItem>
            </TextField>

            <TextField
              select
              label="Impact Filter"
              value={filterImpact}
              onChange={(e) => setFilterImpact(e.target.value)}
              sx={{ width: 200 }}
            >
              <MenuItem value="all">All Impact</MenuItem>
              <MenuItem value="positive">Positive</MenuItem>
              <MenuItem value="neutral">Neutral</MenuItem>
              <MenuItem value="negative">Negative</MenuItem>
            </TextField>
          </Box>
        </CardContent>
      </Card>

      <Card>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox" />
              <TableCell>Date</TableCell>
              <TableCell>Parameter</TableCell>
              <TableCell>Change</TableCell>
              <TableCell>Improvement</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Impact</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredHistory
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((record) => (
                <React.Fragment key={record.id}>
                  <TableRow>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => setExpandedRow(
                          expandedRow === record.id ? null : record.id // اصلاح خطا
                        )}
                      >
                        {expandedRow === record.id ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                      </IconButton>
                    </TableCell>
                    <TableCell>{record.timestamp.toLocaleString()}</TableCell>
                    <TableCell>{record.parameter}</TableCell>
                    <TableCell>{`${record.previousValue} -> ${record.newValue}`}</TableCell>
                    <TableCell>{record.improvement}</TableCell>
                    <TableCell>
                      <Chip label={record.status} color={getStatusColor(record.status)} />
                    </TableCell>
                    <TableCell>
                      <Chip label={record.impact} color={getImpactColor(record.impact)} />
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell colSpan={7} style={{ paddingBottom: 0, paddingTop: 0 }}>
                      <Collapse in={expandedRow === record.id} timeout="auto" unmountOnExit>
                        <Box margin={1}>
                          <Typography variant="h6" gutterBottom component="div">
                            Details
                          </Typography>
                          <List>
                            {record.steps.map((step, index) => (
                              <ListItem key={index}>
                                <ListItemText primary={step} />
                              </ListItem>
                            ))}
                          </List>
                          <Typography variant="body2">{record.notes}</Typography>
                        </Box>
                      </Collapse>
                    </TableCell>
                  </TableRow>
                </React.Fragment>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredHistory.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Card>
      {loading && <CircularProgress />}
    </Box>
  );
};

export default OptimizationHistory;