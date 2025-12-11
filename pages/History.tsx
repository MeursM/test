
import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMatchHistory } from '../services/sheetsService';
import { HistoricalMatch } from '../types';
import { Button } from '../components/ui/Button';
import { Select } from '../components/ui/Select';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export const History: React.FC = () => {
  const navigate = useNavigate();
  const [matches, setMatches] = useState<HistoricalMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'leaderboard' | 'tournaments' | 'matchups' | 'analysis' | 'game' | 'logs'>('leaderboard');
  
  // Winrate Filter State
  const [winrateFilter, setWinrateFilter] = useState<'all' | '2000' | 'sub2000'>('all');

  // Analysis State
  const [selectedPlayer, setSelectedPlayer] = useState<string>('');
  const [selectedGameId, setSelectedGameId] = useState<string>('');
  
  // Scorecard Modal State
  const [selectedMatch, setSelectedMatch] = useState<HistoricalMatch | null>(null);

  const loadData = () => {
    setLoading(true);
    setError(null);
    getMatchHistory().then(data => {
      if (data === null) {
        setError("Unable to connect to the database. Please check your internet connection or deployment settings.");
      } else {
        // Filter out any rows that are actually headers (e.g. "Player 1")
        const validMatches = data.filter(m => {
          const p1 = m.player1?.trim().toLowerCase();
          const p2 = m.player2?.trim().toLowerCase();
          if (!p1 || !p2) return false;
          // Check for common header values
          const invalidNames = ['player 1', 'player 2', 'name', 'player name', 'player', 'p1', 'p2'];
          if (invalidNames.includes(p1) || invalidNames.includes(p2)) return false;
          return true;
        });

        setMatches(validMatches.reverse());
      }
      setLoading(false);
    });
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Winrate Logic (Leaderboard) ---
  const winrates = useMemo(() => {
    const results: Record<string, { wins: number, losses: number, draws: number }> = {};
    
    // Filter matches based on points criteria
    const filteredMatches = matches.filter(m => {
      // Exclude tournament games from general winrates if desired? User asked for "separate".
      // Let's keep them in unless explicitly asked to remove, but the filter handles points.
      
      if (winrateFilter === '2000') return m.points === 2000;
      if (winrateFilter === 'sub2000') return m.points < 2000;
      return true; // 'all'
    });

    filteredMatches.forEach(m => {
       const key1 = `${m.player1} | ${m.army1}`;
       const key2 = `${m.player2} | ${m.army2}`;
       
       if (!results[key1]) results[key1] = { wins: 0, losses: 0, draws: 0 };
       if (!results[key2]) results[key2] = { wins: 0, losses: 0, draws: 0 };
       
       let p1 = 0;
       let p2 = 0;

       if (m.rawRounds && m.rawRounds.length > 0) {
         p1 = m.rawRounds.reduce((acc, r) => acc + (Number(r.p1.primary)||0) + (Number(r.p1.secondary)||0) + (Number(r.p1.challenger)||0), 0);
         p2 = m.rawRounds.reduce((acc, r) => acc + (Number(r.p2.primary)||0) + (Number(r.p2.secondary)||0) + (Number(r.p2.challenger)||0), 0);
       } else {
         p1 = Number(m.p1Score) || 0;
         p2 = Number(m.p2Score) || 0;
       }

       if (p1 > p2) {
         results[key1].wins++;
         results[key2].losses++;
       } else if (p1 < p2) {
         results[key1].losses++;
         results[key2].wins++;
       } else {
         results[key1].draws++;
         results[key2].draws++;
       }
    });

    return Object.entries(results).map(([key, stats]) => {
      const [player, army] = key.split(" | ");
      const total = stats.wins + stats.losses + stats.draws;
      const rate = total > 0 ? (stats.wins / total) * 100 : 0;
      return { player, army, total, ...stats, rate };
    }).sort((a, b) => b.rate - a.rate);
  }, [matches, winrateFilter]); 

  // --- Tournament Grouping Logic ---
  const tournamentGroups = useMemo(() => {
    const groups: Record<string, HistoricalMatch[]> = {};
    matches.forEach(m => {
      if (m.tournamentId) {
        if (!groups[m.tournamentId]) groups[m.tournamentId] = [];
        groups[m.tournamentId].push(m);
      }
    });
    return Object.entries(groups).map(([id, ms]) => ({ id, matches: ms }));
  }, [matches]);

  // --- Matchup Logic ---
  const matchups = useMemo(() => {
    const counts: Record<string, number> = {};
    matches.forEach(m => {
       const players = [m.player1, m.player2].sort();
       const key = `${players[0]} vs ${players[1]}`;
       counts[key] = (counts[key] || 0) + 1;
    });
    return Object.entries(counts)
      .map(([matchup, count]) => ({ matchup, count }))
      .sort((a, b) => b.count - a.count);
  }, [matches]);

  // --- Player Average Graph Logic ---
  const playerAverageData = useMemo(() => {
    if (!selectedPlayer) return [];
    
    const totals = Array(5).fill(0).map(() => ({ primary: 0, secondary: 0, challenger: 0 }));
    let gameCount = 0;

    matches.forEach(m => {
      if ((m.player1 === selectedPlayer || m.player2 === selectedPlayer) && m.rawRounds) {
        gameCount++;
        m.rawRounds.forEach((r, idx) => {
          if (idx >= 5) return; 
          const isP1 = m.player1 === selectedPlayer;
          const pData = isP1 ? r.p1 : r.p2;
          totals[idx].primary += Number(pData.primary) || 0;
          totals[idx].secondary += Number(pData.secondary) || 0;
          totals[idx].challenger += Number(pData.challenger) || 0;
        });
      }
    });

    if (gameCount === 0) return [];

    let cumPrimary = 0, cumSecondary = 0, cumChallenger = 0;
    
    return totals.map((t, idx) => {
      const avgPrim = t.primary / gameCount;
      const avgSec = t.secondary / gameCount;
      const avgChal = t.challenger / gameCount;
      
      cumPrimary += avgPrim;
      cumSecondary += avgSec;
      cumChallenger += avgChal;

      return {
        round: `R${idx + 1}`,
        Primary: parseFloat(cumPrimary.toFixed(1)),
        Secondary: parseFloat(cumSecondary.toFixed(1)),
        Challenger: parseFloat(cumChallenger.toFixed(1)),
        Total: parseFloat((cumPrimary + cumSecondary + cumChallenger).toFixed(1))
      };
    });
  }, [matches, selectedPlayer]);

  // --- Single Game Graph Logic ---
  const singleGameData = useMemo(() => {
    if (!selectedGameId) return null;
    const m = matches.find(match => String(match.id) === selectedGameId);
    if (!m || !m.rawRounds) return null;

    let p1Sum = 0, p2Sum = 0;
    const data = m.rawRounds.map(r => {
       const p1RoundTotal = (Number(r.p1.primary)||0) + (Number(r.p1.secondary)||0) + (Number(r.p1.challenger)||0);
       const p2RoundTotal = (Number(r.p2.primary)||0) + (Number(r.p2.secondary)||0) + (Number(r.p2.challenger)||0);
       p1Sum += p1RoundTotal;
       p2Sum += p2RoundTotal;
       
       return {
         round: `R${r.round}`,
         [m.player1]: p1Sum,
         [m.player2]: p2Sum
       };
    });
    return { data, p1: m.player1, p2: m.player2 };
  }, [matches, selectedGameId]);

  const allPlayers = Array.from(new Set(matches.flatMap(m => [m.player1, m.player2]))).sort();
  const allGameOptions = matches.map(m => ({ label: `${m.date.split('T')[0]}: ${m.player1} vs ${m.player2}`, value: String(m.id) }));

  const getScore = (m: HistoricalMatch, p: 'p1' | 'p2') => {
      if (m.rawRounds && m.rawRounds.length > 0) {
          return m.rawRounds.reduce((acc, r) => acc + (Number(r[p].primary)||0) + (Number(r[p].secondary)||0) + (Number(r[p].challenger)||0), 0);
      }
      return p === 'p1' ? m.p1Score : m.p2Score;
  }

  // --- SCORECARD COMPONENT ---
  const ScorecardModal: React.FC<{ match: HistoricalMatch; onClose: () => void }> = ({ match, onClose }) => {
    if (!match.rawRounds) return null;

    const getUniqueSecondaries = (player: 'p1' | 'p2') => {
      const set = new Set<string>();
      match.rawRounds?.forEach(r => {
         const d = r[player];
         if (d.secondary1Name) set.add(d.secondary1Name);
         if (d.secondary2Name) set.add(d.secondary2Name);
      });
      const list = Array.from(set);
      if (list.length === 0) {
         const totalSecPoints = match.rawRounds?.reduce((acc, r) => acc + (Number(r[player].secondary1Pts)||0) + (Number(r[player].secondary2Pts)||0), 0) || 0;
         if (totalSecPoints > 0) return ["Legacy / Unknown Secondary"];
      }
      return list;
    };

    const p1Secondaries = getUniqueSecondaries('p1');
    const p2Secondaries = getUniqueSecondaries('p2');

    const calculateCpFlow = (player: 'p1' | 'p2') => {
       let current = 0; 
       const flow = [];
       for(let i=0; i<5; i++) {
          const r = match.rawRounds![i];
          if(!r) { flow.push(0); continue; }
          const pData = r[player];
          const start = current;
          const end = start + Number(pData.cpEarned) - Number(pData.cpUsed);
          current = Math.max(0, end);
          flow.push(current);
       }
       return flow;
    };

    const p1Cp = calculateCpFlow('p1');
    const p2Cp = calculateCpFlow('p2');
    const s1Total = getScore(match, 'p1');
    const s2Total = getScore(match, 'p2');
    const winner = s1Total > s2Total ? match.player1 : (s2Total > s1Total ? match.player2 : "Draw");

    const ScoreRow: React.FC<{ label: string, data: any[], type: 'p1'|'p2' }> = ({ label, data, type }) => {
      const total = data.reduce((a,b) => a+b, 0);
      return (
        <div className="grid grid-cols-[3fr_repeat(5,1fr)_1.5fr] text-sm border-b border-zinc-800 hover:bg-white/5">
           <div className="p-2 text-zinc-400 truncate border-r border-zinc-800">{label}</div>
           {[0,1,2,3,4].map(idx => (
             <div key={idx} className="p-2 text-center text-zinc-300 border-r border-zinc-800">
               {data[idx] > 0 ? data[idx] : <span className="text-zinc-700">-</span>}
             </div>
           ))}
           <div className="p-2 text-center font-bold text-white bg-white/5">{total}</div>
        </div>
      );
    };

    const SecondaryRow: React.FC<{ mission: string, type: 'p1'|'p2' }> = ({ mission, type }) => {
       const scores = [0,1,2,3,4].map(idx => {
          const r = match.rawRounds![idx];
          if (!r) return 0;
          const d = r[type];
          let pts = 0;
          if (mission === "Legacy / Unknown Secondary") {
             if (!d.secondary1Name) pts += Number(d.secondary1Pts);
             if (!d.secondary2Name) pts += Number(d.secondary2Pts);
          } else {
             if (d.secondary1Name === mission) pts += Number(d.secondary1Pts);
             if (d.secondary2Name === mission) pts += Number(d.secondary2Pts);
          }
          return pts;
       });
       return <ScoreRow label={mission} data={scores} type={type} />;
    };

    const renderPlayerSection = (player: string, army: string, detach: string | undefined, type: 'p1'|'p2', cpData: number[]) => {
       const rounds = match.rawRounds || [];
       const primaryScores = rounds.map(r => Number(r[type].primary)||0);
       const challScores = rounds.map(r => Number(r[type].challenger)||0);
       const score = type === 'p1' ? s1Total : s2Total;
       const isWinner = winner === player;

       return (
         <div className="mb-8">
            <div className="flex justify-between items-end mb-2 border-b-2 border-zinc-700 pb-2">
               <div>
                 <div className="text-xl font-bold font-orbitron text-white">{player}</div>
                 <div className="text-xs text-zinc-400">{army}</div>
                 {detach && <div className="text-[10px] text-zinc-500">{detach}</div>}
               </div>
               <div className={`text-3xl font-orbitron font-bold ${isWinner ? 'text-green-500' : 'text-zinc-500'}`}>
                 {score}
               </div>
            </div>
            <div className="bg-zinc-900/50 rounded border border-zinc-800 overflow-hidden">
               <div className="grid grid-cols-[3fr_repeat(5,1fr)_1.5fr] bg-black/40 text-xs text-zinc-500 font-bold uppercase">
                  <div className="p-2">Mission</div>
                  {[1,2,3,4,5].map(r => <div key={r} className="p-2 text-center">R{r}</div>)}
                  <div className="p-2 text-center">Total</div>
               </div>
               <ScoreRow label={match.mission} data={primaryScores} type={type} />
               {(type === 'p1' ? p1Secondaries : p2Secondaries).map(m => (
                  <SecondaryRow key={m} mission={m} type={type} />
               ))}
               {challScores.some(s => s > 0) && (
                 <ScoreRow label="Challenger" data={challScores} type={type} />
               )}
               <div className="grid grid-cols-[3fr_repeat(5,1fr)_1.5fr] text-sm border-t border-zinc-700 bg-white/5 mt-1">
                  <div className="p-2 text-zinc-400 font-bold border-r border-zinc-800">CP Remaining</div>
                  {cpData.map((cp, idx) => (
                    <div key={idx} className="p-2 text-center text-zinc-300 border-r border-zinc-800">{cp}</div>
                  ))}
                  <div className="p-2 bg-black/20"></div>
               </div>
            </div>
         </div>
       );
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-fade-in">
         <div className="bg-war-panel w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-zinc-700 shadow-2xl flex flex-col">
            <div className="p-4 border-b border-zinc-700 flex justify-between items-center bg-black/40 sticky top-0 z-10 backdrop-blur">
               <div>
                  <div className="text-xs text-zinc-500 font-mono">{new Date(match.date).toLocaleDateString()}</div>
                  <div className="text-lg font-orbitron text-war-red font-bold">MATCH SCORECARD</div>
               </div>
               <button onClick={onClose} className="text-zinc-400 hover:text-white hover:bg-zinc-800 p-2 rounded transition-colors">
                 ✕ Close
               </button>
            </div>
            <div className="p-6">
               <div className="flex justify-center items-center gap-6 mb-8 font-orbitron font-bold">
                  <div className={`text-2xl ${s1Total > s2Total ? 'text-green-500' : s1Total < s2Total ? 'text-red-500' : 'text-zinc-400'}`}>{s1Total}</div>
                  <div className="text-zinc-600 text-sm">VS</div>
                  <div className={`text-2xl ${s2Total > s1Total ? 'text-green-500' : s2Total < s1Total ? 'text-red-500' : 'text-zinc-400'}`}>{s2Total}</div>
               </div>
               {renderPlayerSection(match.player1, match.army1, match.detachment1, 'p1', p1Cp)}
               {renderPlayerSection(match.player2, match.army2, match.detachment2, 'p2', p2Cp)}
            </div>
         </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-war-dark pb-20 p-4">
      {selectedMatch && <ScorecardModal match={selectedMatch} onClose={() => setSelectedMatch(null)} />}

      <header className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-2xl font-orbitron font-bold text-war-red">
          BATTLE<span className="text-white">LOGS</span>
        </h1>
        <div className="flex flex-wrap gap-2 justify-center">
           <Button variant={view === 'leaderboard' ? 'primary' : 'secondary'} onClick={() => setView('leaderboard')} className="text-xs py-2 px-3">Winrates</Button>
           <Button variant={view === 'tournaments' ? 'primary' : 'secondary'} onClick={() => setView('tournaments')} className="text-xs py-2 px-3">Tournaments</Button>
           <Button variant={view === 'matchups' ? 'primary' : 'secondary'} onClick={() => setView('matchups')} className="text-xs py-2 px-3">Matchups</Button>
           <Button variant={view === 'analysis' ? 'primary' : 'secondary'} onClick={() => setView('analysis')} className="text-xs py-2 px-3">Player Avg</Button>
           <Button variant={view === 'game' ? 'primary' : 'secondary'} onClick={() => setView('game')} className="text-xs py-2 px-3">Game Review</Button>
           <Button variant={view === 'logs' ? 'primary' : 'secondary'} onClick={() => setView('logs')} className="text-xs py-2 px-3">History</Button>
           <Button variant="secondary" onClick={() => navigate('/')} className="text-xs py-2 px-3">&larr; App</Button>
        </div>
      </header>

      {loading ? (
        <div className="text-center text-zinc-500 font-orbitron animate-pulse mt-20">Accessing Archives...</div>
      ) : error ? (
        <div className="text-center mt-20 p-6 bg-war-panel border border-red-900 rounded-lg max-w-lg mx-auto">
          <p className="text-red-400 font-bold mb-4 font-orbitron">Connection Failed</p>
          <p className="text-zinc-400 mb-4">{error}</p>
          <Button onClick={loadData} variant="primary">Retry Connection</Button>
        </div>
      ) : (
        <div className="max-w-5xl mx-auto space-y-8 animate-fade-in">
          
          {/* WINRATES VIEW */}
          {view === 'leaderboard' && (
              <div className="bg-war-panel border border-zinc-700 rounded-lg p-6 shadow-xl">
                 <div className="flex flex-col md:flex-row justify-between items-center mb-4 border-b border-zinc-700 pb-2 gap-3">
                   <h2 className="text-xl font-orbitron text-white">
                     {winrateFilter === 'all' ? 'Overall Winrates' : winrateFilter === '2000' ? '2000 Pts Winrates' : 'Sub-2000 Pts Winrates'}
                   </h2>
                   <div className="flex gap-2">
                     <button 
                        onClick={() => setWinrateFilter('all')} 
                        className={`text-xs px-3 py-1 rounded transition-colors ${winrateFilter === 'all' ? 'bg-war-red text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                     >
                       Overall
                     </button>
                     <button 
                        onClick={() => setWinrateFilter('2000')} 
                        className={`text-xs px-3 py-1 rounded transition-colors ${winrateFilter === '2000' ? 'bg-war-red text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                     >
                       2000 Pts
                     </button>
                     <button 
                        onClick={() => setWinrateFilter('sub2000')} 
                        className={`text-xs px-3 py-1 rounded transition-colors ${winrateFilter === 'sub2000' ? 'bg-war-red text-white font-bold' : 'bg-zinc-800 text-zinc-400 hover:text-white'}`}
                     >
                       &lt; 2000 Pts
                     </button>
                   </div>
                 </div>

                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="text-war-gray text-xs font-orbitron uppercase border-b border-zinc-700">
                         <th className="p-3">Player</th>
                         <th className="p-3">Army</th>
                         <th className="p-3 text-center">Games</th>
                         <th className="p-3 text-center">W / L / D</th>
                         <th className="p-3 text-right">Win %</th>
                       </tr>
                     </thead>
                     <tbody>
                       {winrates.length === 0 ? (
                         <tr><td colSpan={5} className="p-4 text-center text-zinc-500">No matches found for this category.</td></tr>
                       ) : winrates.map((stat, idx) => (
                         <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors text-sm font-mono text-gray-300">
                           <td className="p-3 font-bold text-white">{stat.player}</td>
                           <td className="p-3 text-zinc-400">{stat.army}</td>
                           <td className="p-3 text-center">{stat.total}</td>
                           <td className="p-3 text-center text-zinc-400">
                             <span className="text-green-400">{stat.wins}</span> / <span className="text-red-400">{stat.losses}</span> / {stat.draws}
                           </td>
                           <td className="p-3 text-right font-bold text-war-red">
                             {stat.rate.toFixed(1)}%
                           </td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>
          )}

          {/* TOURNAMENTS VIEW */}
          {view === 'tournaments' && (
              <div className="space-y-6">
                 {tournamentGroups.length === 0 ? (
                    <div className="text-center text-zinc-500">No tournament games found.</div>
                 ) : (
                    tournamentGroups.map(group => (
                       <div key={group.id} className="bg-war-panel border border-zinc-700 rounded-lg p-6 shadow-xl">
                          <h2 className="text-xl font-orbitron text-white mb-4 border-b border-zinc-700 pb-2">Tournament: <span className="text-war-red">{group.id.split('_')[0]}</span></h2>
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                             {group.matches.map(m => {
                               const s1 = getScore(m, 'p1');
                               const s2 = getScore(m, 'p2');
                               return (
                                 <div key={m.id} className="bg-black/30 p-3 rounded border border-zinc-800 hover:border-zinc-600 cursor-pointer" onClick={() => setSelectedMatch(m)}>
                                    <div className="text-[10px] text-zinc-500 mb-2 flex justify-between">
                                       <span>{new Date(m.date).toLocaleDateString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                       <span className={s1 > s2 ? 'text-green-400 font-bold' : 'text-zinc-400'}>{m.player1} ({s1})</span>
                                       <span className="text-zinc-600 text-xs px-2">VS</span>
                                       <span className={s2 > s1 ? 'text-green-400 font-bold' : 'text-zinc-400'}>{m.player2} ({s2})</span>
                                    </div>
                                 </div>
                               );
                             })}
                          </div>
                       </div>
                    ))
                 )}
              </div>
          )}

          {/* MATCHUPS VIEW */}
          {view === 'matchups' && (
              <div className="bg-war-panel border border-zinc-700 rounded-lg p-6 shadow-xl">
                 <h2 className="text-xl font-orbitron text-white mb-4 border-b border-zinc-700 pb-2">Most Played Matchups</h2>
                 <div className="overflow-x-auto">
                   <table className="w-full text-left border-collapse">
                     <thead>
                       <tr className="text-war-gray text-xs font-orbitron uppercase border-b border-zinc-700">
                         <th className="p-3">Matchup</th>
                         <th className="p-3 text-right">Times Played</th>
                       </tr>
                     </thead>
                     <tbody>
                       {matchups.length === 0 ? (
                         <tr><td colSpan={2} className="p-4 text-center text-zinc-500">No matches recorded yet.</td></tr>
                       ) : matchups.map((m, idx) => (
                         <tr key={idx} className="border-b border-zinc-800 hover:bg-zinc-800/50 transition-colors text-sm font-mono text-gray-300">
                           <td className="p-3 font-bold text-white">{m.matchup}</td>
                           <td className="p-3 text-right font-orbitron text-war-red">{m.count}</td>
                         </tr>
                       ))}
                     </tbody>
                   </table>
                 </div>
              </div>
          )}

          {/* MATCH LOGS */}
          {view === 'logs' && (
              <div className="space-y-4">
                 <h2 className="text-xl font-orbitron text-white">Full Match History</h2>
                 {matches.length === 0 ? <div className="text-center text-zinc-500">No matches found.</div> : 
                 matches.map((m) => {
                   const s1 = getScore(m, 'p1');
                   const s2 = getScore(m, 'p2');
                   const canViewScorecard = m.rawRounds && m.rawRounds.length > 0;
                   
                   return (
                   <div key={m.id} className="bg-war-panel border border-zinc-700 rounded-lg p-4 flex flex-col md:flex-row gap-4 items-center shadow-lg hover:border-war-red/50 transition-colors group relative">
                      <div className="flex-1 w-full">
                         <div className="text-xs text-war-gray mb-1 flex justify-between">
                           <span>{new Date(m.date).toLocaleDateString()}</span>
                           <span className="uppercase tracking-wider font-bold text-war-red">{m.mission} <span className="text-zinc-500 text-[10px] ml-1">({m.points}pts)</span></span>
                         </div>
                         <div className="flex justify-between items-center bg-black/30 p-3 rounded mb-2">
                            <div className={`flex-1 text-center ${s1 > s2 ? 'text-green-400 font-bold' : 'text-zinc-400'}`}>
                               <div className="text-sm uppercase mb-1">{m.player1}</div>
                               <div className="text-xs text-zinc-500 mb-1">{m.army1}</div>
                               <div className="text-2xl font-orbitron">{s1}</div>
                            </div>
                            <div className="px-4 text-zinc-600 font-bold text-sm">VS</div>
                            <div className={`flex-1 text-center ${s2 > s1 ? 'text-green-400 font-bold' : 'text-zinc-400'}`}>
                               <div className="text-sm uppercase mb-1">{m.player2}</div>
                               <div className="text-xs text-zinc-500 mb-1">{m.army2}</div>
                               <div className="text-2xl font-orbitron">{s2}</div>
                            </div>
                         </div>
                         {canViewScorecard && (
                            <div className="text-center">
                               <button 
                                 onClick={() => setSelectedMatch(m)}
                                 className="text-xs uppercase tracking-widest text-zinc-500 hover:text-white transition-colors py-1 px-4 border border-zinc-800 hover:border-zinc-600 rounded"
                               >
                                 View Scorecard
                               </button>
                            </div>
                         )}
                      </div>
                   </div>
                 )})}
              </div>
          )}

          {/* PLAYER AVERAGE ANALYSIS */}
          {view === 'analysis' && (
             <div className="bg-war-panel border border-zinc-700 rounded-lg p-6 shadow-xl min-h-[500px]">
                <h2 className="text-xl font-orbitron text-white mb-6">Player Average Performance</h2>
                <div className="mb-6 max-w-xs">
                   <Select 
                      options={allPlayers.map(p => ({ label: p, value: p }))} 
                      value={selectedPlayer}
                      onChange={e => setSelectedPlayer(e.target.value)}
                      placeholder="Select Player to Analyze"
                   />
                </div>
                
                {selectedPlayer && playerAverageData.length > 0 ? (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={playerAverageData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="round" stroke="#666" />
                        <YAxis stroke="#666" label={{ value: 'VP (Cumulative)', angle: -90, position: 'insideLeft', fill:'#666' }}/>
                        <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }} />
                        <Legend />
                        <Line type="monotone" dataKey="Total" stroke="#fff" strokeWidth={3} />
                        <Line type="monotone" dataKey="Primary" stroke="#ff2d2d" strokeWidth={2} />
                        <Line type="monotone" dataKey="Secondary" stroke="#3b82f6" strokeWidth={2} />
                        <Line type="monotone" dataKey="Challenger" stroke="#fbbf24" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                    <p className="text-center text-xs text-zinc-500 mt-4">Graph shows Cumulative Average VP over 5 rounds.</p>
                  </div>
                ) : (
                  <div className="text-center text-zinc-500 mt-20">Select a player with recorded games to see analysis.</div>
                )}
             </div>
          )}

          {/* SINGLE GAME ANALYSIS */}
          {view === 'game' && (
             <div className="bg-war-panel border border-zinc-700 rounded-lg p-6 shadow-xl min-h-[500px]">
                <h2 className="text-xl font-orbitron text-white mb-6">Match Replay</h2>
                <div className="mb-6 max-w-md">
                   <Select 
                      options={allGameOptions} 
                      value={selectedGameId}
                      onChange={e => setSelectedGameId(e.target.value)}
                      placeholder="Select a Match"
                   />
                </div>
                
                {singleGameData ? (
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={singleGameData.data}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                        <XAxis dataKey="round" stroke="#666" />
                        <YAxis stroke="#666" label={{ value: 'VP', angle: -90, position: 'insideLeft', fill:'#666' }} />
                        <Tooltip contentStyle={{ backgroundColor: '#1e1e1e', border: '1px solid #333' }} />
                        <Legend />
                        <Line type="monotone" dataKey={singleGameData.p1} stroke="#ff2d2d" strokeWidth={3} dot={{r:6}} />
                        <Line type="monotone" dataKey={singleGameData.p2} stroke="#3b82f6" strokeWidth={3} dot={{r:6}} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="text-center text-zinc-500 mt-20">Select a match to view the scoring timeline.</div>
                )}
             </div>
          )}

        </div>
      )}
    </div>
  );
};
