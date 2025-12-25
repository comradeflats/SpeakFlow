'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressData {
  date: string;
  average: number;
}

interface ProgressChartProps {
  data: ProgressData[];
  title?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  title = 'Your Speaking Progress',
}) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-slate-dark mb-6">{title}</h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12, fill: '#475569' }}
            interval={Math.floor(data.length / 5)}
          />
          <YAxis
            domain={[0, 6]}
            label={{ value: 'CEFR Level', angle: -90, position: 'insideLeft', fill: '#475569' }}
            ticks={[1, 2, 3, 4, 5, 6]}
            tickFormatter={(value) => {
              const labels: Record<number, string> = {
                1: 'A1', 2: 'A2', 3: 'B1', 4: 'B2', 5: 'C1', 6: 'C2'
              };
              return labels[value] || '';
            }}
          />
          <Tooltip
            formatter={(value) => (typeof value === 'number' ? value.toFixed(1) : value)}
            contentStyle={{
              backgroundColor: '#ffffff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            labelStyle={{ color: '#1e293b' }}
          />
          <Legend wrapperStyle={{ color: '#475569' }} />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#0066cc"
            name="Your CEFR Level"
            strokeWidth={3}
            dot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        {data.length > 0 && (
          <>
            <div className="bg-ocean-50 rounded-lg p-4 border border-ocean-200">
              <p className="text-xs text-ocean-600 font-semibold">CURRENT LEVEL</p>
              <p className="text-2xl font-bold text-ocean-600">
                {(() => {
                  const score = data[data.length - 1].average;
                  if (score >= 5.5) return 'C2';
                  if (score >= 5) return 'C1';
                  if (score >= 4) return 'B2';
                  if (score >= 3) return 'B1';
                  if (score >= 2) return 'A2';
                  return 'A1';
                })()}
              </p>
            </div>
            <div className="bg-success_light rounded-lg p-4 border border-success">
              <p className="text-xs text-success font-semibold">LATEST SCORE</p>
              <p className="text-2xl font-bold text-success">
                {data[data.length - 1].average.toFixed(1)}
              </p>
            </div>
            <div className="bg-info_light rounded-lg p-4 border border-info">
              <p className="text-xs text-info font-semibold">TOTAL SESSIONS</p>
              <p className="text-2xl font-bold text-info">{data.length}</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
