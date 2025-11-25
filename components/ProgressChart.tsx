'use client';

import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProgressData {
  date: string;
  part1: number;
  part2: number;
  part3: number;
  average: number;
}

interface ProgressChartProps {
  data: ProgressData[];
  title?: string;
}

export const ProgressChart: React.FC<ProgressChartProps> = ({
  data,
  title = 'Your IELTS Speaking Progress',
}) => {
  return (
    <div className="bg-white rounded-xl p-8 shadow-lg">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">{title}</h2>

      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            interval={Math.floor(data.length / 5)}
          />
          <YAxis domain={[0, 9]} label={{ value: 'Band Score', angle: -90, position: 'insideLeft' }} />
          <Tooltip
            formatter={(value) => (typeof value === 'number' ? value.toFixed(1) : value)}
            contentStyle={{
              backgroundColor: '#f9fafb',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
          />
          <Legend />
          <Line
            type="monotone"
            dataKey="part1"
            stroke="#3b82f6"
            name="Part 1"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="part2"
            stroke="#8b5cf6"
            name="Part 2"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="part3"
            stroke="#ec4899"
            name="Part 3"
            strokeWidth={2}
            dot={{ r: 4 }}
          />
          <Line
            type="monotone"
            dataKey="average"
            stroke="#10b981"
            name="Overall Average"
            strokeWidth={3}
            dot={{ r: 5 }}
            strokeDasharray="5 5"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {data.length > 0 && (
          <>
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-xs text-blue-600 font-semibold">PART 1 CURRENT</p>
              <p className="text-2xl font-bold text-blue-600">{data[data.length - 1].part1}</p>
            </div>
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-xs text-purple-600 font-semibold">PART 2 CURRENT</p>
              <p className="text-2xl font-bold text-purple-600">{data[data.length - 1].part2}</p>
            </div>
            <div className="bg-pink-50 rounded-lg p-4">
              <p className="text-xs text-pink-600 font-semibold">PART 3 CURRENT</p>
              <p className="text-2xl font-bold text-pink-600">{data[data.length - 1].part3}</p>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-xs text-green-600 font-semibold">OVERALL AVERAGE</p>
              <p className="text-2xl font-bold text-green-600">
                {data[data.length - 1].average.toFixed(1)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
