

import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { ARMY_DATA, MISSIONS, PLAYERS } from '../constants';
import { MatchState, INITIAL_PLAYER_ROUND } from '../types';
import { submitMatchData } from '../services/sheetsService';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';
import { Button } from '../components/ui/Button';
import { RoundInput } from '../components/RoundInput';
import { MatchGraphs } from '../components/MatchGraphs';

const INITIAL_STATE: MatchState = {
  points: 2000,
  primaryMission: '',
  player1: '',
  player2: '',
  army1: '',
  army2: '',
  detachmentP1: '',
  detachmentP2: '',
  rounds: Array(5).fill(null).map((_, i) => ({
    roundNumber: i + 1,
    p1: { ...INITIAL_PLAYER_ROUND },
    p2: { ...INITIAL_PLAYER_ROUND }
  }))
};

export const MatchLogger: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for Tournament Init State
  const tournamentState = location.state as Partial<MatchState> | undefined;

  const [activeTab, setActiveTab] = useState<'setup' | 1 | 2 | 3 | 4 | 5>('setup');
  const [matchData, setMatchData] = useState<MatchState>(() => {
    // If we have tournament state passed in, use it immediately
    if (tournamentState) {
        return { ...INITIAL_STATE, ...tournamentState };
    }

    const saved = localStorage.getItem('battleforge_match_v1');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save (Skip if in tournament mode to avoid overwriting standard local save, or use separate key)
  useEffect(() => {
    if (!tournamentState) {
       localStorage.setItem('battleforge_match_v1', JSON.stringify(matchData));
    }
  }, [matchData, tournamentState]);

  const updateSetup = (field: keyof MatchState, value: any) => {
    setMatchData(prev => ({ ...prev, [field]: value }));
  };

  const updateRound = (roundIdx: number, player: 'p1' | 'p2', data: any) => {
    setMatchData(prev => {
      const newRounds = [...prev.rounds];
      newRounds[roundIdx] = { ...newRounds[roundIdx], [player]: data };
      return { ...prev, rounds: newRounds };
    });
  };

  // Helper to calculate CP at the START of a round based on previous rounds
  const getStartCpForRound = (roundNum: number, player: 'p1' | 'p2'): number => {
    let cp = 0; 
    for(let i=0; i < roundNum - 1; i++) {
       const r = matchData.rounds[i][player];
       const earned = (r.cpEarnedTurn1 ? 1 : 0) + 
                      (r.cpEarnedTurn2 ? 1 : 0) + 
                      (r.cpGainedTurn1 ? 1 : 0) + 
                      (r.cpGainedTurn2 ? 1 : 0) + 
                      r.cpEarnedArmy.reduce((acc, val) => acc + Number(val), 0);
       cp += (earned - r.cpUsed);
    }
    return Math.max(0, cp);
  };

  // Helper to calculate cumulative SCORES (Primary/Secondary) from PREVIOUS rounds
  const getPriorScores = (roundNum: number, player: 'p1' | 'p2') => {
    let primary = 0;
    let secondary = 0;
    for(let i=0; i < roundNum - 1; i++) {
       const r = matchData.rounds[i][player];
       primary += r.primary;
       secondary += (r.secondary1_pts + r.secondary2_pts);
    }
    return { primary, secondary };
  };

  const handleClear = () => {
    if(confirm("Are you sure you want to clear all data?")) {
      setMatchData(INITIAL_STATE);
      setActiveTab('setup');
    }
  };

  const handleSubmit = async () => {
    if (!matchData.player1 || !matchData.player2) {
      alert("Please define players in setup.");
      setActiveTab('setup');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitMatchData(matchData);
      
      // Calculate winner for tournament return
      let p1Score = 0, p2Score = 0;
      matchData.rounds.forEach(r => {
        p1Score += r.p1.primary + r.p1.secondary1_pts + r.p1.secondary2_pts + r.p1.challenger;
        p2Score += r.p2.primary + r.p2.secondary1_pts + r.p2.secondary2_pts + r.p2.challenger;
      });

      const winner = p1Score > p2Score ? matchData.player1 : (p2Score > p1Score ? matchData.player2 : null);

      alert("Match submitted successfully!");
      
      if (tournamentState) {
        // Return to Tournament Hub with result
        navigate('/tournament', { 
            state: { 
                completedMatchId: matchData.bracketMatchId, 
                winner: winner 
            } 
        });
      } else {
        setMatchData(INITIAL_STATE);
        localStorage.removeItem('battleforge_match_v1');
        setActiveTab('setup');
      }

    } catch (e) {
      alert("Failed to submit. Check internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const armyOptions = Object.keys(ARMY_DATA).map(k => ({ label: k, value: k }));
  const playerOptions = PLAYERS.map(p => ({ label: p, value: p }));
  const missionOptions = MISSIONS.map(m => ({ label: m, value: m }));

  const getDetachments = (armyName: string) => {
    return (ARMY_DATA[armyName]?.detachments || []).map(d => ({ label: d, value: d }));
  };

  // Pre-calculate prior scores for current round
  const activeRoundNum = typeof activeTab === 'number' ? activeTab : 1;
  const p1Prior = getPriorScores(activeRoundNum, 'p1');
  const p2Prior = getPriorScores(activeRoundNum, 'p2');

  const isTournamentMode = !!matchData.tournamentId;

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-war-panel border-b border-zinc-700 p-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex flex-col">
            <h1 className="text-2xl font-orbitron font-bold text-war-red tracking-widest leading-none">
              BATTLE<span className="text-white">FORGE</span>
            </h1>
            {isTournamentMode && <span className="text-xs text-green-400 font-mono">TOURNAMENT MATCH</span>}
          </div>
          <div className="flex gap-2">
            {!isTournamentMode && <Button variant="secondary" className="text-xs py-2 px-3" onClick={() => navigate('/history')}>
               STATS
            </Button>}
             <Button variant="secondary" className="text-xs py-2 px-3" onClick={() => navigate('/tournament')}>
               BRACKETS
            </Button>
            <Button variant="danger" className="text-xs py-2 px-3" onClick={handleClear}>
               RESET
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-4xl">
        
        {(matchData.player1 && matchData.player2) && (
          <MatchGraphs matchData={matchData} />
        )}

        {activeTab === 'setup' && (
          <div className="animate-fade-in space-y-6">
             <div className="bg-war-panel p-6 rounded-lg border border-zinc-700 shadow-xl">
                <h2 className="text-xl font-orbitron mb-6 border-b border-zinc-700 pb-2">Match Setup</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                   <Input label="Points Limit" type="number" value={matchData.points} onChange={e => updateSetup('points', parseInt(e.target.value))} />
                   <Select label="Primary Mission" options={missionOptions} value={matchData.primaryMission} onChange={e => updateSetup('primaryMission', e.target.value)} placeholder="Select Mission" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                   <div className="space-y-4 p-4 border border-zinc-800 rounded bg-zinc-900/50">
                      <h3 className="text-war-red font-bold font-orbitron">Player 1 (Attacker)</h3>
                      {isTournamentMode ? (
                        <div className="text-white font-bold text-lg border-b border-zinc-700 pb-2">{matchData.player1}</div>
                      ) : (
                        <Select label="Name" options={playerOptions} value={matchData.player1} onChange={e => updateSetup('player1', e.target.value)} placeholder="Select Player" />
                      )}
                      <Select label="Army" options={armyOptions} value={matchData.army1} onChange={e => updateSetup('army1', e.target.value)} placeholder="Select Faction" />
                      <Select label="Detachment" options={getDetachments(matchData.army1)} value={matchData.detachmentP1} onChange={e => updateSetup('detachmentP1', e.target.value)} placeholder="Select Detachment" disabled={!matchData.army1} />
                   </div>

                   <div className="space-y-4 p-4 border border-zinc-800 rounded bg-zinc-900/50">
                      <h3 className="text-blue-500 font-bold font-orbitron">Player 2 (Defender)</h3>
                      {isTournamentMode ? (
                        <div className="text-white font-bold text-lg border-b border-zinc-700 pb-2">{matchData.player2}</div>
                      ) : (
                        <Select label="Name" options={playerOptions} value={matchData.player2} onChange={e => updateSetup('player2', e.target.value)} placeholder="Select Player" />
                      )}
                      <Select label="Army" options={armyOptions} value={matchData.army2} onChange={e => updateSetup('army2', e.target.value)} placeholder="Select Faction" />
                      <Select label="Detachment" options={getDetachments(matchData.army2)} value={matchData.detachmentP2} onChange={e => updateSetup('detachmentP2', e.target.value)} placeholder="Select Detachment" disabled={!matchData.army2} />
                   </div>
                </div>
             </div>
             
             <div className="flex justify-end">
               <Button onClick={() => setActiveTab(1)}>Start Round 1 &rarr;</Button>
             </div>
          </div>
        )}

        {typeof activeTab === 'number' && (
          <div className="animate-fade-in space-y-6">
            <h2 className="text-2xl font-orbitron text-center mb-6">Round {activeTab}</h2>
            
            <div className="grid grid-cols-1 gap-6">
              <RoundInput 
                playerName={matchData.player1}
                playerData={matchData.rounds[activeTab - 1].p1}
                armyData={ARMY_DATA[matchData.army1]}
                detachmentName={matchData.detachmentP1}
                roundNumber={activeTab}
                primaryMission={matchData.primaryMission}
                onChange={(d) => updateRound(activeTab - 1 as number, 'p1', d)}
                startingCp={getStartCpForRound(activeTab, 'p1')}
                priorPrimary={p1Prior.primary}
                priorSecondary={p1Prior.secondary}
              />
              
              <RoundInput 
                isPlayer2
                playerName={matchData.player2}
                playerData={matchData.rounds[activeTab - 1].p2}
                armyData={ARMY_DATA[matchData.army2]}
                detachmentName={matchData.detachmentP2}
                roundNumber={activeTab}
                primaryMission={matchData.primaryMission}
                onChange={(d) => updateRound(activeTab - 1 as number, 'p2', d)}
                startingCp={getStartCpForRound(activeTab, 'p2')}
                priorPrimary={p2Prior.primary}
                priorSecondary={p2Prior.secondary}
              />
            </div>

            <div className="flex justify-between mt-8">
               {activeTab === 5 ? (
                 <Button onClick={handleSubmit} className="w-full bg-green-600 hover:bg-green-700" disabled={isSubmitting}>
                    {isSubmitting ? 'Submitting...' : 'FINISH GAME'}
                 </Button>
               ) : (
                 <Button onClick={() => setActiveTab((activeTab + 1) as any)} className="w-full">
                    Next Round &rarr;
                 </Button>
               )}
            </div>
          </div>
        )}

      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-black border-t border-zinc-800 flex justify-between items-center text-xs font-orbitron z-50">
         <button onClick={() => setActiveTab('setup')} className={`flex-1 py-4 text-center hover:bg-zinc-900 ${activeTab === 'setup' ? 'text-war-red bg-zinc-900 border-t-2 border-war-red' : 'text-zinc-500'}`}>SETUP</button>
         {[1,2,3,4,5].map(r => (
           <button 
             key={r} 
             onClick={() => setActiveTab(r as any)} 
             className={`flex-1 py-4 text-center hover:bg-zinc-900 ${activeTab === r ? 'text-war-red bg-zinc-900 border-t-2 border-war-red' : 'text-zinc-500'}`}
           >
             R{r}
           </button>
         ))}
      </nav>
    </div>
  );
};
