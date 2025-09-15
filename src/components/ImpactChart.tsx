import React from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ImpactSummary } from '../types';
import './ImpactChart.css';

interface ImpactChartProps {
  summary: ImpactSummary;
}

export const ImpactChart: React.FC<ImpactChartProps> = ({ summary }) => {
  // Prepare data for charts
  const impactTypeData = Object.entries(summary.impactsByType).map(([type, data]) => ({
    name: type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value: data.total,
    color: getColorForImpactType(type)
  }));

  const regionData = Object.entries(summary.regionBreakdown).map(([region, data]) => ({
    name: region,
    donations: data.donations,
    amount: data.amount,
    beneficiaries: data.beneficiaries
  }));

  function getColorForImpactType(type: string): string {
    const colors: { [key: string]: string } = {
      'meals_served': '#ff6b6b',
      'books_distributed': '#4ecdc4',
      'students_supported': '#45b7d1',
      'scholarships_provided': '#96ceb4',
      'trees_planted': '#ffeaa7'
    };
    return colors[type] || '#95a5a6';
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="tooltip-value" style={{ color: entry.color }}>
              {`${entry.dataKey}: ${entry.dataKey === 'amount' ? formatCurrency(entry.value) : entry.value.toLocaleString()}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="impact-charts">
      <h2>Impact Visualization</h2>
      
      <div className="charts-grid">
        <div className="chart-container">
          <h3>Impact Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={impactTypeData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {impactTypeData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Regional Impact</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={regionData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar dataKey="donations" fill="#4f46e5" name="Donations" />
              <Bar dataKey="beneficiaries" fill="#059669" name="Beneficiaries" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};