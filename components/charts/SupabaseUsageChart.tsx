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

interface SupabaseUsageChartProps {
  color?: string;
}

export default function SupabaseUsageChart({ color = '#3ECF8E' }: SupabaseUsageChartProps) {
  // Mock usage data since the Management API is limited for detailed stats
  const chartData = {
    labels: ['Database Size', 'Storage', 'Auth Users', 'Edge Funct', 'Realtime'],
    datasets: [
      {
        label: 'Usage % of Plan Limit',
        data: [42, 15, 8, 24, 31],
        backgroundColor: color,
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 40,
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
            return `${context.parsed.y}% of plan limit`;
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
            size: 11,
            weight: 500 as any,
          },
        },
      },
      y: {
        beginAtZero: true,
        max: 100,
        grid: {
          color: '#2A2A2E',
        },
        ticks: {
          color: '#71717A',
          font: {
            size: 11,
          },
          callback: function(value: any) {
            return value + '%';
          },
        },
      },
    },
  };

  return (
    <div className="h-64 md:h-80 w-full mt-4">
      <Bar data={chartData} options={options} />
    </div>
  );
}

