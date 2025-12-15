'use client';

import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface DeploymentFrequencyChartProps {
  data: Array<{ date: string; count: number }>;
  color?: string;
}

export default function DeploymentFrequencyChart({ 
  data, 
  color = '#F97316' // Default to orange/primary color
}: DeploymentFrequencyChartProps) {

  if (!data || data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-secondary">
        No deployment data available
      </div>
    );
  }

  // Generate last 15 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const last15Days: Array<{ date: string; count: number }> = [];
  for (let i = 14; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateString = date.toISOString().split('T')[0];
    
    // Find matching data or default to 0
    const matchingData = data.find(item => {
      const itemDate = new Date(item.date);
      itemDate.setHours(0, 0, 0, 0);
      return itemDate.getTime() === date.getTime();
    });
    
    last15Days.push({
      date: dateString,
      count: matchingData ? matchingData.count : 0
    });
  }

  // Convert hex color to RGB for gradient
  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  };

  const baseColor = color || '#F97316';
  const rgb = hexToRgb(baseColor);
  
  const chartData = {
    labels: last15Days.map(item => {
      const date = new Date(item.date);
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }),
    datasets: [
      {
        label: 'Deployments',
        data: last15Days.map(item => item.count),
        backgroundColor: (context: any) => {
          if (!context.chart.chartArea) {
            return baseColor;
          }
          const chart = context.chart;
          const ctx = chart.ctx;
          const gradient = ctx.createLinearGradient(0, chart.chartArea.bottom, 0, chart.chartArea.top);
          
          if (rgb) {
            // Create visible gradient from darker to lighter
            gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.9)`); // Bottom: 90% opacity
            gradient.addColorStop(0.5, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.85)`); // Middle: 85% opacity
            gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.75)`); // Top: 75% opacity
          } else {
            gradient.addColorStop(0, `${baseColor}E6`);
            gradient.addColorStop(1, `${baseColor}BF`);
          }
          
          return gradient;
        },
        borderColor: rgb ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0.4)` : `${baseColor}66`,
        borderWidth: 0,
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: '#1A1A1C',
        borderColor: '#2A2A2E',
        borderWidth: 1,
        titleColor: '#fff',
        bodyColor: '#fff',
        padding: 12,
        displayColors: false,
        callbacks: {
          label: function(context: any) {
            const value = context.parsed.y;
            if (value === 0) {
              return 'No deployments';
            }
            return `${value} deployment${value !== 1 ? 's' : ''}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: {
          display: false,
        },
        ticks: {
          color: '#71717A',
          font: {
            size: 10,
          },
          maxRotation: 45,
          minRotation: 45,
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: '#2A2A2E',
        },
        ticks: {
          color: '#71717A',
          font: {
            size: 11,
          },
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div className="h-64 md:h-80 w-full">
      <Bar data={chartData} options={options} />
    </div>
  );
}
