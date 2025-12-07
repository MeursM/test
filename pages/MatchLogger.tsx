import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Using HashRouter wrapper in App
import { ARMY_DATA, MISSIONS, PLAYERS } from '../constants';
import { MatchState, INITIAL_PLAYER_ROUND, RoundData } from '../types';
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
  const [activeTab, setActiveTab] = useState<'setup' | 1 | 2 | 3 | 4 | 5>('setup');
  const [matchData, setMatchData] = useState<MatchState>(() => {
    const saved = localStorage.getItem('battleforge_match_v1');
    return saved ? JSON.parse(saved) : INITIAL_STATE;
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-save
  useEffect(() => {
    localStorage.setItem('battleforge_match_v1', JSON.stringify(matchData));
  }, [matchData]);

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
      alert("Match submitted successfully!");
      setMatchData(INITIAL_STATE);
      localStorage.removeItem('battleforge_match_v1');
      setActiveTab('setup');
    } catch (e) {
      alert("Failed to submit. Check internet connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const armyOptions = Object.keys(ARMY_DATA).map(k => ({ label: k, value: k }));
  const playerOptions = PLAYERS.map(p => ({ label: p, value: p }));
  const missionOptions = MISSIONS.map(m => ({ label: m, value: m }));

  // Helper to get detachments based on selected army
  const getDetachments = (armyName: string) => {
    return (ARMY_DATA[armyName]?.detachments || []).map(d => ({ label: d, value: d }));
  };

  return (
    <div className="min-h-screen pb-20">
      <header className="bg-war-panel border-b border-zinc-700 p-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-orbitron font-bold text-war-red tracking-widest">
            BATTLE<span className="text-white">FORGE</span>
          </h1>
          <Button variant="danger" className="text-xs py-2 px-4" onClick={handleClear}>Reset</Button>
        </div>
      </header>

      <main className="container mx-auto p-4 max-w-4xl">
        
        {/* Analytics visible on all pages if setup is done */}
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
                   {/* Player 1 Block */}
                   <div className="space-y-4 p-4 border border-zinc-800 rounded bg-zinc-900/50">
                      <h3 className="text-war-red font-bold font-orbitron">Player 1 (Attacker)</h3>
                      <Select label="Name" options={playerOptions} value={matchData.player1} onChange={e => updateSetup('player1', e.target.value)} placeholder="Select Player" />
                      <Select label="Army" options={armyOptions} value={matchData.army1} onChange={e => updateSetup('army1', e.target.value)} placeholder="Select Faction" />
                      <Select label="Detachment" options={getDetachments(matchData.army1)} value={matchData.detachmentP1} onChange={e => updateSetup('detachmentP1', e.target.value)} placeholder="Select Detachment" disabled={!matchData.army1} />
                   </div>

                   {/* Player 2 Block */}
                   <div className="space-y-4 p-4 border border-zinc-800 rounded bg-zinc-900/50">
                      <h3 className="text-blue-500 font-bold font-orbitron">Player 2 (Defender)</h3>
                      <Select label="Name" options={playerOptions} value={matchData.player2} onChange={e => updateSetup('player2', e.target.value)} placeholder="Select Player" />
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
                onChange={(d) => updateRound(activeTab - 1 as number, 'p1', d)}
              />
              
              <RoundInput 
                isPlayer2
                playerName={matchData.player2}
                playerData={matchData.rounds[activeTab - 1].p2}
                armyData={ARMY_DATA[matchData.army2]}
                detachmentName={matchData.detachmentP2}
                roundNumber={activeTab}
                onChange={(d) => updateRound(activeTab - 1 as number, 'p2', d)}
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

      {/* Navigation Footer */}
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
