'use client';

import React from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend);

interface ProjectDistributionChartProps {
  data: Record<string, number>;
  colors?: string[];
}

// Theme-appropriate colors - more saturated, darker, less pastel
const DEFAULT_COLORS = [
  '#F97316', // Orange (primary)
  '#8B5CF6', // Purple
  '#3B82F6', // Blue
  '#10B981', // Green
  '#EF4444', // Red
  '#EAB308', // Yellow/Amber
  '#06B6D4', // Cyan
  '#EC4899', // Pink
];

export default function ProjectDistributionChart({ 
  data,
  colors = DEFAULT_COLORS
}: ProjectDistributionChartProps) {
  if (!data || Object.keys(data).length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-secondary">
        No project data available
      </div>
    );
  }

  const entries = Object.entries(data).sort((a, b) => b[1] - a[1]);
  const labels = entries.map(([framework]) => framework || 'Unknown');
  const values = entries.map(([, count]) => count);

  // Convert hex to RGB
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const chartData = {
    labels: labels.map(label => label.charAt(0).toUpperCase() + label.slice(1)),
    datasets: [
      {
        data: values,
        backgroundColor: (context: any) => {
          const index = context.dataIndex;
          const color = colors[index % colors.length];
          const rgb = hexToRgb(color);
          
          if (!context.chart.chartArea || !rgb) {
            return color;
          }

          const chart = context.chart;
          const ctx = chart.ctx;
          const centerX = chart.chartArea.left + (chart.chartArea.right - chart.chartArea.left) / 2;
          const centerY = chart.chartArea.top + (chart.chartArea.bottom - chart.chartArea.top) / 2;
          const radius = Math.min(
            (chart.chartArea.right - chart.chartArea.left) / 2,
            (chart.chartArea.bottom - chart.chartArea.top) / 2
          );

          // Create radial gradient for depth effect
          const gradient = ctx.createRadialGradient(
            centerX - radius * 0.3, // Offset gradient center for depth
            centerY - radius * 0.3,
            0,
            centerX,
            centerY,
            radius
          );

          // Gradient from lighter (inner) to darker (outer) for depth
          gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`); // Inner: 90% opacity
          gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`); // Middle: 85% opacity
          gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`); // Outer: 75% opacity

          return gradient;
        },
        borderColor: '#1A1A1C',
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right' as const,
        labels: {
          color: '#fff',
          font: {
            size: 12,
          },
          padding: 15,
          usePointStyle: true,
          pointStyle: 'circle',
        },
      },
      tooltip: {
        backgroundColor: '#1A1A1C',
        borderColor: '#2A2A2E',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        callbacks: {
          label: function(context: any) {
            const label = context.label || '';
            const value = context.parsed || 0;
            const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: ${value} project${value !== 1 ? 's' : ''} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <div className="h-64 md:h-80 w-full">
      <Doughnut data={chartData} options={options} />
    </div>
  );
}
