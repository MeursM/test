
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatchHistory } from '../services/sheetsService';
import { HistoricalMatch } from '../types';
import { Button } from '../components/ui/Button';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<HistoricalMatch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMatchHistory().then(data => {
      // Sort by newest first
      setMatches(data.reverse());
      setLoading(false);
    });
  }, []);

  // Calculate Leaderboard
  const leaderboard: Record<string, { played: number, wins: number, draws: number, pointsScored: number }> = {};

  matches.forEach(m => {
    // Init players
    if (!leaderboard[m.player1]) leaderboard[m.player1] = { played: 0, wins: 0, draws: 0, pointsScored: 0 };
    if (!leaderboard[m.player2]) leaderboard[m.player2] = { played: 0, wins: 0, draws: 0, pointsScored: 0 };

    // Update played
    leaderboard[m.player1].played++;
    leaderboard[m.player2].played++;
    leaderboard[m.player1].pointsScored += Number(m.p1Score) || 0;
    leaderboard[m.player2].pointsScored += Number(m.p2Score) || 0;

    // Update wins
    if (m.p1Score > m.p2Score) leaderboard[m.player1].wins++;
    else if (m.p2Score > m.p1Score) leaderboard[m.player2].wins++;
    else {
      leaderboard[m.player1].draws++;
      leaderboard[m.player2].draws++;
    }
  });

  const sortedLeaderboard = Object.entries(leaderboard).sort(([, a], [, b]) => {
    // Sort by Win % then Total Wins
    const aRate = a.wins / a.played;
    const bRate = b.wins / b.played;
    return bRate - aRate || b.wins - a.wins;
  });

  return (
    <div className="min-h-screen bg-war-dark pb-20 p-4">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-orbitron font-bold text-war-red">
          BATTLE<span className="text-white">LOGS</span>
        </h1>
        <Button variant="secondary" onClick={() => navigate('/')} className="text-xs py-2">
           &larr; Back to Tracker
        </Button>
      </header>

      {loading ? (
        <div className="text-center text-zinc-500 font-orbitron animate-pulse mt-20">Accessing Archives...</div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-8 animate-fade-in">
          
          {/* LEADERBOARD */}
          <div className="bg-war-panel border border-zinc-700 rounded-lg p-6 shadow-xl">
             <h2 className="text-xl font-orbitron text-white mb-4 border-b border-zinc-700 pb-2">Commander Rankings</h2>
             <div className="overflow-x-auto">
               <table className="w-full text-left border-collapse">
                 <thead>
                   <tr className="text-war-gray text-xs font-orbitron uppercase border-b border-zinc-700">
                     <th className="p-3">Rank</th>
                     <th className="p-3">Player</th>
                     <th className="p-3 text-center">Matches</th>
                     <th className="p-3 text-center">W / D / L</th>
                     <th className="p-3 text-right">Win Rate</th>
                   </tr>
                 </thead>
                 <tbody>
                   {sortedLeaderboard.map(([player, stats], idx) => (
                     <tr key={player} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors text-sm font-mono">
                       <td className="p-3 text-zinc-500">#{idx + 1}</td>
                       <td className="p-3 font-bold text-white">{player}</td>
                       <td className="p-3 text-center">{stats.played}</td>
                       <td className="p-3 text-center text-zinc-400">
                         <span className="text-green-400">{stats.wins}</span> / {stats.draws} / <span className="text-red-400">{stats.played - stats.wins - stats.draws}</span>
                       </td>
                       <td className="p-3 text-right font-bold text-war-red">
                         {((stats.wins / stats.played) * 100).toFixed(0)}%
                       </td>
                     </tr>
                   ))}
                   {sortedLeaderboard.length === 0 && (
                     <tr><td colSpan={5} className="p-4 text-center text-zinc-500">No data found</td></tr>
                   )}
                 </tbody>
               </table>
             </div>
          </div>

          {/* MATCH HISTORY */}
          <div className="space-y-4">
             <h2 className="text-xl font-orbitron text-white">Recent Conflicts</h2>
             {matches.map((m) => (
               <div key={m.id} className="bg-war-panel border border-zinc-700 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center shadow-lg hover:border-war-red/50 transition-colors">
                  <div className="flex-1 w-full">
                     <div className="text-xs text-war-gray mb-1 flex justify-between">
                       <span>{new Date(m.date).toLocaleDateString()}</span>
                       <span className="uppercase tracking-wider">{m.mission}</span>
                     </div>
                     <div className="flex justify-between items-center bg-black/30 p-3 rounded">
                        <div className={`flex-1 text-center ${Number(m.p1Score) > Number(m.p2Score) ? 'text-green-400 font-bold' : 'text-zinc-400'}`}>
                           <div className="text-sm uppercase mb-1">{m.player1}</div>
                           <div className="text-xs text-zinc-500 mb-1">{m.army1}</div>
                           <div className="text-2xl font-orbitron">{m.p1Score}</div>
                        </div>
                        <div className="px-4 text-zinc-600 font-bold text-sm">VS</div>
                        <div className={`flex-1 text-center ${Number(m.p2Score) > Number(m.p1Score) ? 'text-green-400 font-bold' : 'text-zinc-400'}`}>
                           <div className="text-sm uppercase mb-1">{m.player2}</div>
                           <div className="text-xs text-zinc-500 mb-1">{m.army2}</div>
                           <div className="text-2xl font-orbitron">{m.p2Score}</div>
                        </div>
                     </div>
                  </div>
               </div>
             ))}
          </div>

        </div>
      )}
    </div>
  );
};
