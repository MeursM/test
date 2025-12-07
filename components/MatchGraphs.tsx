import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { MatchState } from '../types';

interface MatchGraphsProps {
  matchData: MatchState;
}

export const MatchGraphs: React.FC<MatchGraphsProps> = ({ matchData }) => {
  // Process data for charts
  const data = matchData.rounds.map(r => {
    const p1Total = r.p1.primary + r.p1.secondary1_pts + r.p1.secondary2_pts + r.p1.challenger;
    const p2Total = r.p2.primary + r.p2.secondary1_pts + r.p2.secondary2_pts + r.p2.challenger;
    
    return {
      round: `R${r.roundNumber}`,
      [matchData.player1 || 'P1']: p1Total,
      [matchData.player2 || 'P2']: p2Total,
      p1Cum: 0, // Calculated below
      p2Cum: 0  // Calculated below
    };
  });

  // Calculate Cumulative
  let p1Sum = 0;
  let p2Sum = 0;
  data.forEach(d => {
    p1Sum += d[matchData.player1 || 'P1'] as number;
    p2Sum += d[matchData.player2 || 'P2'] as number;
    d.p1Cum = p1Sum;
    d.p2Cum = p2Sum;
  });

  const p1Name = matchData.player1 || 'Player 1';
  const p2Name = matchData.player2 || 'Player 2';

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Cumulative Score Chart */}
      <div className="bg-war-panel p-4 rounded-lg border border-zinc-700 shadow-xl">
        <h3 className="text-war-red font-orbitron text-lg mb-4 text-center">Total Victory Points</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorP1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff2d2d" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#ff2d2d" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorP2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="round" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '4px' }}
                itemStyle={{ color: '#e5e5e5' }}
              />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="p1Cum" 
                name={p1Name} 
                stroke="#ff2d2d" 
                fillOpacity={1} 
                fill="url(#colorP1)" 
              />
              <Area 
                type="monotone" 
                dataKey="p2Cum" 
                name={p2Name} 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorP2)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Round by Round Comparison */}
      <div className="bg-war-panel p-4 rounded-lg border border-zinc-700 shadow-xl">
        <h3 className="text-war-red font-orbitron text-lg mb-4 text-center">Points Per Round</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="round" stroke="#666" />
              <YAxis stroke="#666" />
              <Tooltip 
                 contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333', borderRadius: '4px' }}
              />
              <Legend />
              <Line type="monotone" dataKey={p1Name} stroke="#ff2d2d" strokeWidth={2} dot={{ r: 4 }} />
              <Line type="monotone" dataKey={p2Name} stroke="#3b82f6" strokeWidth={2} dot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};