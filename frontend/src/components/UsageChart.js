import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import useThemeStore from '../services/themeStore';

const UsageChart = ({ usage }) => {
  const { isDarkMode } = useThemeStore();

  const data = [
    {
      name: 'Chat Calls',
      used: usage?.chatMessages || Math.floor(Math.random() * 50) + 10,
      limit: usage?.maxChatMessages || 100,
    },
    {
      name: 'Voice Req',
      used: usage?.voiceRequests || Math.floor(Math.random() * 20) + 5,
      limit: usage?.maxVoiceRequests || 50,
    },
    {
      name: 'WhatsApp',
      used: usage?.whatsappMessages || Math.floor(Math.random() * 500) + 50,
      limit: usage?.maxWhatsappMessages || 1000,
    },
  ];

  const chartColors = {
    gridStroke: isDarkMode ? '#374151' : '#f3f4f6',
    axisText: isDarkMode ? '#9ca3af' : '#6b7280',
    axisStroke: isDarkMode ? '#4b5563' : '#e5e7eb',
    tooltipBg: isDarkMode ? '#1f2937' : '#fff',
    tooltipBorder: isDarkMode ? '#4b5563' : '#e5e7eb',
    tooltipText: isDarkMode ? '#e5e7eb' : '#374151',
    legendColor: isDarkMode ? '#d1d5db' : '#4b5563',
  };

  return (
    <div className={`w-full h-72 ${isDarkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg transition-colors duration-300`}>
      <ResponsiveContainer width='100%' height='100%'>
        <BarChart data={data} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray='3 3' stroke={chartColors.gridStroke} vertical={false} />
          <XAxis dataKey='name' tick={{fill: chartColors.axisText, fontSize: 12}} axisLine={{stroke: chartColors.axisStroke}} tickLine={false} />
          <YAxis tick={{fill: chartColors.axisText, fontSize: 12}} axisLine={{stroke: chartColors.axisStroke}} tickLine={false} />
          <Tooltip 
            contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: '4px', boxShadow: '0 1px 2px 0 rgba(0,0,0,0.05)' }}
            itemStyle={{ color: chartColors.tooltipText }}
          />
          <Legend wrapperStyle={{ fontSize: '12px', color: chartColors.legendColor }} />
          <Bar dataKey='used' name='Used' fill='#10b981' radius={[4, 4, 0, 0]} />
          <Bar dataKey='limit' name='Limit' fill={isDarkMode ? '#4b5563' : '#e5e7eb'} radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default UsageChart;
