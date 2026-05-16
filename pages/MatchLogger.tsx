

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
  gameMode: 'Tournament',
  rounds: Array(5).fill(null).map((_, i) => ({
    roundNumber: i + 1,
    p1: { ...INITIAL_PLAYER_ROUND },
    p2: { ...INITIAL_PLAYER_ROUND }
  }))
};

export const MatchLogger: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Check for Tournament or Edit Init State
  const incomingState = location.state as { editMatch?: any } & Partial<MatchState> | undefined;

  const [activeTab, setActiveTab] = useState<'setup' | 1 | 2 | 3 | 4 | 5>('setup');
  const [matchData, setMatchData] = useState<MatchState>(() => {
    // If we are in edit mode
    if (incomingState?.editMatch) {
      const m = incomingState.editMatch;
      const rounds = m.rawRounds ? m.rawRounds.map((r: any) => ({
        roundNumber: r.round,
        p1: {
          ...INITIAL_PLAYER_ROUND,
          primary: Number(r.p1.primary) || 0,
          secondary1_name: r.p1.secondary1Name || '',
          secondary1_pts: Number(r.p1.secondary1Pts) || 0,
          secondary1_discarded: !!r.p1.secondary1Discarded,
          secondary2_name: r.p1.secondary2Name || '',
          secondary2_pts: Number(r.p1.secondary2Pts) || 0,
          secondary2_discarded: !!r.p1.secondary2Discarded,
          secondary3_name: r.p1.secondary3Name || '',
          secondary3_pts: Number(r.p1.secondary3Pts) || 0,
          challenger: Number(r.p1.challenger) || 0,
          cpUsed: Number(r.p1.cpUsed) || 0,
          cpEarnedArmy: [String(r.p1.cpEarned || 0)] // Put total into army CP since we don't have granular breakdown
        },
        p2: {
          ...INITIAL_PLAYER_ROUND,
          primary: Number(r.p2.primary) || 0,
          secondary1_name: r.p2.secondary1Name || '',
          secondary1_pts: Number(r.p2.secondary1Pts) || 0,
          secondary1_discarded: !!r.p2.secondary1Discarded,
          secondary2_name: r.p2.secondary2Name || '',
          secondary2_pts: Number(r.p2.secondary2Pts) || 0,
          secondary2_discarded: !!r.p2.secondary2Discarded,
          secondary3_name: r.p2.secondary3Name || '',
          secondary3_pts: Number(r.p2.secondary3Pts) || 0,
          challenger: Number(r.p2.challenger) || 0,
          cpUsed: Number(r.p2.cpUsed) || 0,
          cpEarnedArmy: [String(r.p2.cpEarned || 0)]
        }
      })) : INITIAL_STATE.rounds;

      return {
        ...INITIAL_STATE,
        player1: m.player1,
        player2: m.player2,
        army1: m.army1,
        army2: m.army2,
        detachmentP1: m.detachment1 || '',
        detachmentP2: m.detachment2 || '',
        points: m.points || 2000,
        primaryMission: m.mission || '',
        gameMode: m.gameMode || 'Tournament',
        tournamentId: m.tournamentId,
        bracketMatchId: m.bracketMatchId,
        roundIndex: m.roundIndex,
        bracketType: m.bracketType,
        rounds: rounds
      };
    }

    // If we have tournament state passed in, use it immediately
    if (incomingState) {
        return { ...INITIAL_STATE, ...incomingState };
    }

    const saved = localStorage.getItem('battleforge_match_v1');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save (Skip if in specialty mode to avoid overwriting standard local save)
  useEffect(() => {
    if (!incomingState) {
       localStorage.setItem('battleforge_match_v1', JSON.stringify(matchData));
    }
  }, [matchData, incomingState]);

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
    const scoredSecondaries = new Set<string>();
    
    for(let i=0; i < roundNum - 1; i++) {
       const r = matchData.rounds[i][player];
       primary += r.primary;
       secondary += (r.secondary1_pts + r.secondary2_pts + (r.secondary3_pts || 0));
       
       if (r.secondary1_name && (r.secondary1_pts > 0 || r.secondary1_discarded)) scoredSecondaries.add(r.secondary1_name);
       if (r.secondary2_name && (r.secondary2_pts > 0 || r.secondary2_discarded)) scoredSecondaries.add(r.secondary2_name);
       if (r.secondary3_name && (r.secondary3_pts > 0)) scoredSecondaries.add(r.secondary3_name);
    }
    return { primary, secondary, scoredSecondaries: Array.from(scoredSecondaries) };
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleClear = () => {
    setMatchData(INITIAL_STATE);
    localStorage.removeItem('battleforge_match_v1');
    setActiveTab('setup');
    if (incomingState) {
      navigate(location.pathname, { replace: true, state: {} });
    }
    setShowResetConfirm(false);
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
      let p1Prim = 0, p1Sec = 0, p1Chal = 0;
      let p2Prim = 0, p2Sec = 0, p2Chal = 0;
      
      matchData.rounds.forEach(r => {
        p1Prim += r.p1.primary;
        p1Sec += (r.p1.secondary1_pts + r.p1.secondary2_pts + (r.p1.secondary3_pts || 0));
        p1Chal += r.p1.challenger;

        p2Prim += r.p2.primary;
        p2Sec += (r.p2.secondary1_pts + r.p2.secondary2_pts + (r.p2.secondary3_pts || 0));
        p2Chal += r.p2.challenger;
      });

      const p1Score = Math.min(50, p1Prim) + Math.min(40, p1Sec) + p1Chal;
      const p2Score = Math.min(50, p2Prim) + Math.min(40, p2Sec) + p2Chal;

      const winner = p1Score > p2Score ? matchData.player1 : (p2Score > p1Score ? matchData.player2 : null);

      alert("Match submitted successfully!" + (incomingState?.editMatch ? " Note: Edits result in a new entry in the records." : ""));
      
      if (incomingState?.tournamentId) {
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
        navigate('/history');
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
  const isEditMode = !!incomingState?.editMatch;

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
      <div className="min-h-screen pb-20 scale-90 origin-top-left transform-gpu w-[111.11vw]">
      <header className="bg-war-panel border-b border-zinc-700 p-1.5 sticky top-0 z-50 shadow-lg">
        <div className="w-full px-2 flex justify-between items-center">
          <div className="flex flex-col shrink-0">
            <h1 className="text-base font-orbitron font-bold text-war-red tracking-tight leading-none">
              BATTLE<span className="text-white">FORGE</span>
            </h1>
            <div className="flex gap-2 items-center">
              {isTournamentMode && <span className="text-[9px] text-green-400 font-mono">TOURNAMENT</span>}
              {isEditMode && <span className="text-[9px] text-amber-500 font-mono italic">EDIT</span>}
            </div>
          </div>
          <div className="flex gap-1 items-center">
            {showResetConfirm ? (
              <div className="flex gap-1 items-center animate-fade-in">
                <span className="text-[8px] text-war-red font-bold uppercase whitespace-nowrap">Sure?</span>
                <Button variant="danger" className="text-[8px] h-7 px-2 min-w-0" onClick={handleClear}>
                   YES
                </Button>
                <Button variant="secondary" className="text-[8px] h-7 px-2 min-w-0" onClick={() => setShowResetConfirm(false)}>
                   NO
                </Button>
              </div>
            ) : (
              <>
                {!isTournamentMode && <Button variant="secondary" className="text-[8px] h-7 px-1.5 min-w-0" onClick={() => navigate('/history')}>
                   STATS
                </Button>}
                 <Button variant="secondary" className="text-[8px] h-7 px-1.5 min-w-0" onClick={() => navigate('/tournament')}>
                   BRACKETS
                </Button>
                <Button variant="danger" className="text-[8px] h-7 px-1.5 min-w-0" onClick={() => setShowResetConfirm(true)}>
                   RESET
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="w-full p-2">
        
        {(matchData.player1 && matchData.player2) && (
          <MatchGraphs matchData={matchData} />
        )}

        {activeTab === 'setup' && (
          <div className="animate-fade-in space-y-6">
             <div className="bg-war-panel p-3 rounded-lg border border-zinc-700 shadow-xl">
                <h2 className="text-lg font-orbitron mb-4 border-b border-zinc-700 pb-2">Match Setup</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                   <Input label="Points Limit" type="number" value={matchData.points} onChange={e => updateSetup('points', parseInt(e.target.value))} className="text-xs" />
                   <Select label="Primary Mission" options={missionOptions} value={matchData.primaryMission} onChange={e => updateSetup('primaryMission', e.target.value)} placeholder="Select Mission" className="text-xs" />
                   <Select 
                     label="Game Mode" 
                     options={[
                       { label: 'Tournament', value: 'Tournament' },
                       { label: 'Colosseum', value: 'Colosseum' }
                     ]} 
                     value={matchData.gameMode} 
                     onChange={e => updateSetup('gameMode', e.target.value)} 
                     className="text-xs"
                   />
                </div>

                <div className="grid grid-cols-2 gap-3">
                   <div className="space-y-3 p-2 border border-zinc-800 rounded bg-zinc-900/50">
                      <h3 className="text-war-red font-bold font-orbitron text-[10px] uppercase">Attacker</h3>
                      {isTournamentMode ? (
                        <div className="text-white font-bold text-sm border-b border-zinc-700 pb-1">{matchData.player1}</div>
                      ) : (
                        <Select label="Name" options={playerOptions} value={matchData.player1} onChange={e => updateSetup('player1', e.target.value)} placeholder="Player" />
                      )}
                      <Select label="Faction" options={armyOptions} value={matchData.army1} onChange={e => updateSetup('army1', e.target.value)} placeholder="Faction" />
                      <Select label="Detachment" options={getDetachments(matchData.army1)} value={matchData.detachmentP1} onChange={e => updateSetup('detachmentP1', e.target.value)} placeholder="Detachment" disabled={!matchData.army1} />
                   </div>

                   <div className="space-y-3 p-2 border border-zinc-800 rounded bg-zinc-900/50">
                      <h3 className="text-blue-500 font-bold font-orbitron text-[10px] uppercase">Defender</h3>
                      {isTournamentMode ? (
                        <div className="text-white font-bold text-sm border-b border-zinc-700 pb-1">{matchData.player2}</div>
                      ) : (
                        <Select label="Name" options={playerOptions} value={matchData.player2} onChange={e => updateSetup('player2', e.target.value)} placeholder="Player" />
                      )}
                      <Select label="Faction" options={armyOptions} value={matchData.army2} onChange={e => updateSetup('army2', e.target.value)} placeholder="Faction" />
                      <Select label="Detachment" options={getDetachments(matchData.army2)} value={matchData.detachmentP2} onChange={e => updateSetup('detachmentP2', e.target.value)} placeholder="Detachment" disabled={!matchData.army2} />
                   </div>
                </div>
             </div>
             
             <div className="flex justify-end">
               <Button onClick={() => setActiveTab(1)}>Start Round 1 &rarr;</Button>
             </div>
          </div>
        )}

        {typeof activeTab === 'number' && (
          <div className="animate-fade-in space-y-4">
            <h2 className="text-xl font-orbitron text-center mb-4">Round {activeTab}</h2>
            
            <div className="grid grid-cols-2 gap-3">
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
                scoredSecondaries={p1Prior.scoredSecondaries}
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
                scoredSecondaries={p2Prior.scoredSecondaries}
              />
            </div>


            <div className="flex justify-between mt-6">
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
    </div>
  );
};
