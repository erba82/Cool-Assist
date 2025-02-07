import React, { useState, useEffect } from 'react';
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  Stack,
} from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { PerformanceService } from '../../services/performance/PerformanceService';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { PerformanceData } from '../../types/monitoring';

interface AnalyticsData {
  efficiency: {
    daily: { date: string; value: number }[];
    weekly: { date: string; value: number }[];
    monthly: { date: string; value: number }[];
  };
  componentPerformance: {
    name: string;
    efficiency: number;
    issues: number;
  }[];
  resourceUsage: {
    cpu: number[];
    memory: number[];
    network: number[];
  };
  alerts: {
    critical: number;
    warning: number;
    info: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

/**
 * این تابع تاریخچه عملکرد (PerformanceData[]) را به داده‌های آنالیتیکس تبدیل می‌کند.
 * برای نمونه:
 * - **Efficiency Trends:** میانگین "کارایی" هر روز (محاسبه شده به صورت 100 - cpu)
 * - **Component Performance:** یک مجموعه تجمعی با میانگین کارایی و تعداد مشکلات شناسایی‌شده
 * - **Resource Usage:** آرایه‌ای از مقادیر CPU، Memory و (به صورت پیش‌فرض) Network
 * - **Alerts:** شمارش مشکلات بحرانی و هشدار (براساس آستانه‌های cpu، memory، responseTime و errorRate)
 */
const generateAnalyticsData = (history: PerformanceData[]): AnalyticsData => {
  // گروه‌بندی بر اساس تاریخ (روز)
  const dailyMap = new Map<string, { sumEfficiency: number; count: number }>();
  history.forEach(record => {
    const dateKey = record.timestamp.toISOString().split('T')[0];
    // تعریف کارایی به صورت تقریبی: 100 - درصد مصرف CPU
    const efficiency = 100 - record.metrics.cpu;
    if (dailyMap.has(dateKey)) {
      const entry = dailyMap.get(dateKey)!;
      entry.sumEfficiency += efficiency;
      entry.count += 1;
    } else {
      dailyMap.set(dateKey, { sumEfficiency: efficiency, count: 1 });
    }
  });
  const dailyEfficiency = Array.from(dailyMap.entries()).map(([date, { sumEfficiency, count }]) => ({
    date,
    value: sumEfficiency / count,
  }));

  // برای سادگی، داده‌های هفتگی و ماهانه در این نمونه خالی هستند؛
  // در صورت نیاز می‌توانید آن‌ها را مشابه گروه‌بندی روزانه محاسبه کنید.
  const weeklyEfficiency: { date: string; value: number }[] = [];
  const monthlyEfficiency: { date: string; value: number }[] = [];

  // محاسبه عملکرد اجزای سیستم (در این مثال به‌صورت تجمعی)
  let totalEfficiency = 0;
  let totalIssues = 0;
  history.forEach(record => {
    const efficiency = 100 - record.metrics.cpu;
    totalEfficiency += efficiency;
    // شمارش مشکلات (در اینجا با توجه به مقادیر بحرانی)
    if (record.metrics.cpu >= 90) totalIssues++;
    if (record.metrics.memory >= 95) totalIssues++;
    if (record.metrics.responseTime >= 5000) totalIssues++;
    if (record.metrics.errorRate >= 10) totalIssues++;
  });
  const countRecords = history.length || 1;
  const avgEfficiency = totalEfficiency / countRecords;
  const componentPerformance = [
    { name: 'Performance', efficiency: avgEfficiency, issues: totalIssues },
  ];

  // آرایه‌های استفاده منابع:
  const cpuUsage: number[] = [];
  const memoryUsage: number[] = [];
  const networkUsage: number[] = []; // مقدار پیش‌فرض (چون اطلاعات شبکه موجود نیست)
  history.forEach(record => {
    cpuUsage.push(record.metrics.cpu);
    memoryUsage.push(record.metrics.memory);
    networkUsage.push(0);
  });

  // شمارش هشدارها:
  let critical = 0;
  let warning = 0;
  history.forEach(record => {
    if (
      record.metrics.cpu >= 90 ||
      record.metrics.memory >= 95 ||
      record.metrics.responseTime >= 5000 ||
      record.metrics.errorRate >= 10
    ) {
      critical++;
    } else if (
      record.metrics.cpu >= 70 ||
      record.metrics.memory >= 80 ||
      record.metrics.responseTime >= 2000 ||
      record.metrics.errorRate >= 5
    ) {
      warning++;
    }
  });
  const alerts = {
    critical,
    warning,
    info: 0,
  };

  return {
    efficiency: {
      daily: dailyEfficiency,
      weekly: weeklyEfficiency,
      monthly: monthlyEfficiency,
    },
    componentPerformance,
    resourceUsage: {
      cpu: cpuUsage,
      memory: memoryUsage,
      network: networkUsage,
    },
    alerts,
  };
};

export const PerformanceAnalytics: React.FC = () => {
  const [timeRange, setTimeRange] = useState('7d');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timeRange, startDate, endDate]);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      const performanceService = PerformanceService.getInstance();
      let start = startDate;
      let end = endDate;
      if (!start || !end) {
        end = new Date();
        start = new Date();
        switch (timeRange) {
          case '7d':
            start.setDate(end.getDate() - 7);
            break;
          case '30d':
            start.setDate(end.getDate() - 30);
            break;
          case '90d':
            start.setDate(end.getDate() - 90);
            break;
          default:
            break;
        }
      }
      // دریافت تاریخچه عملکرد بین تاریخ‌های start و end
      const history = await performanceService.getPerformanceHistory(start, end);
      // تبدیل تاریخچه عملکرد به داده‌های آنالیتیکس
      const analytics = generateAnalyticsData(history);
      setAnalyticsData(analytics);
    } catch (error) {
      console.error('Failed to fetch analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <Box sx={{ p: 3 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
          <Typography variant="h4">Performance Analytics</Typography>
          <Stack direction="row" spacing={2}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Time Range</InputLabel>
              <Select
                value={timeRange}
                label="Time Range"
                onChange={(e) => setTimeRange(e.target.value)}
              >
                <MenuItem value="7d">Last 7 Days</MenuItem>
                <MenuItem value="30d">Last 30 Days</MenuItem>
                <MenuItem value="90d">Last 90 Days</MenuItem>
                <MenuItem value="custom">Custom Range</MenuItem>
              </Select>
            </FormControl>
            {timeRange === 'custom' && (
              <>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => setStartDate(newValue)}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                />
              </>
            )}
            <Button variant="contained" onClick={fetchAnalyticsData} disabled={loading}>
              Update
            </Button>
          </Stack>
        </Box>

        <Grid container spacing={3}>
          {/* Efficiency Trends */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Efficiency Trends
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={analyticsData?.efficiency.daily || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="value" stroke="#8884d8" name="Daily Efficiency" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Component Performance */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Component Performance
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={analyticsData?.componentPerformance || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Bar dataKey="efficiency" fill="#82ca9d" name="Efficiency" />
                      <Bar dataKey="issues" fill="#8884d8" name="Issues" />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Resource Usage */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Resource Usage Over Time
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={
                        analyticsData
                          ? analyticsData.resourceUsage.cpu.map((cpuValue, index) => ({
                              timestamp: `T${index + 1}`,
                              cpu: cpuValue,
                              memory: analyticsData.resourceUsage.memory[index],
                              network: analyticsData.resourceUsage.network[index],
                            }))
                          : []
                      }
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="timestamp" />
                      <YAxis />
                      <RechartsTooltip />
                      <Legend />
                      <Line type="monotone" dataKey="cpu" stroke="#8884d8" name="CPU" />
                      <Line type="monotone" dataKey="memory" stroke="#82ca9d" name="Memory" />
                      <Line type="monotone" dataKey="network" stroke="#ffc658" name="Network" />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Alert Distribution */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Alert Distribution
                </Typography>
                <Box height={300}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Critical', value: analyticsData?.alerts.critical || 0 },
                          { name: 'Warning', value: analyticsData?.alerts.warning || 0 },
                          { name: 'Info', value: analyticsData?.alerts.info || 0 },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        fill="#8884d8"
                        paddingAngle={5}
                        dataKey="value"
                        label
                      >
                        {[analyticsData?.alerts.critical, analyticsData?.alerts.warning, analyticsData?.alerts.info].map(
                          (_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          )
                        )}
                      </Pie>
                      <RechartsTooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </LocalizationProvider>
  );
};

export default PerformanceAnalytics;
