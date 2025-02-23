import { ChartData, ChartOptions } from 'chart.js';

declare module 'react-chartjs-2' {
    interface LineProps {
      data: ChartData;
      options?: ChartOptions;
    }
}
export {};