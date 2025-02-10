declare module 'react-chartjs-2' {
    import { Component } from 'react';
    import { ChartData, ChartOptions } from 'chart.js';
  
    interface LineProps {
      data: ChartData;
      options?: ChartOptions;
    }
  
    export class Line extends Component<LineProps, any> {}
    export default Line;
  }