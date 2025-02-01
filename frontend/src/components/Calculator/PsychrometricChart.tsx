import React, { useEffect, useRef } from 'react';
import { Box, Paper, Typography } from '@mui/material';
import * as d3 from 'd3';

interface PsychrometricPoint {
  dryBulb: number;
  wetBulb: number;
  relativeHumidity: number;
  humidity: number;
  enthalpy: number;
}

interface PsychrometricChartProps {
  points: PsychrometricPoint[];
  processLines?: { start: PsychrometricPoint; end: PsychrometricPoint }[];
}

const PsychrometricChart: React.FC<PsychrometricChartProps> = ({ points, processLines }) => {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    const width = 800;
    const height = 600;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    // Clear previous content
    svg.selectAll("*").remove();

    // Set up scales
    const xScale = d3.scaleLinear()
      .domain([-10, 50]) // Dry bulb temperature range
      .range([margin.left, width - margin.right]);

    const yScale = d3.scaleLinear()
      .domain([0, 30]) // Humidity ratio range
      .range([height - margin.bottom, margin.top]);

    // Draw axes
    const xAxis = d3.axisBottom(xScale);
    const yAxis = d3.axisLeft(yScale);

    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(xAxis);

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(yAxis);

    // Draw relative humidity curves
    const rhCurves = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0];
    rhCurves.forEach(rh => {
      // Calculate points for RH curve
      const curvePoints = [];
      for (let t = -10; t <= 50; t += 1) {
        const w = calculateHumidityRatio(t, rh);
        curvePoints.push([t, w]);
      }

      // Draw RH curve
      const line = d3.line()
        .x(d => xScale(d[0]))
        .y(d => yScale(d[1]));

      svg.append("path")
        .datum(curvePoints)
        .attr("fill", "none")
        .attr("stroke", "#ccc")
        .attr("stroke-dasharray", "2,2")
        .attr("d", line);
    });

    // Plot points
    svg.selectAll("circle")
      .data(points)
      .enter()
      .append("circle")
      .attr("cx", d => xScale(d.dryBulb))
      .attr("cy", d => yScale(d.humidity))
      .attr("r", 5)
      .attr("fill", "blue");

    // Draw process lines
    if (processLines) {
      processLines.forEach(line => {
        svg.append("line")
          .attr("x1", xScale(line.start.dryBulb))
          .attr("y1", yScale(line.start.humidity))
          .attr("x2", xScale(line.end.dryBulb))
          .attr("y2", yScale(line.end.humidity))
          .attr("stroke", "red")
          .attr("stroke-width", 2);
      });
    }
  }, [points, processLines]);

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Psychrometric Chart
      </Typography>
      <Box sx={{ width: '100%', height: 600 }}>
        <svg ref={svgRef} width="100%" height="100%" viewBox="0 0 800 600" />
      </Box>
    </Paper>
  );
};

export default PsychrometricChart;