
import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { PLAYERS } from '../constants';
import { Tournament, TournamentMatch } from '../types';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { getTournaments, saveTournament, deleteTournamentFromSheet } from '../services/sheetsService';
import { Loader2, RefreshCw, Trophy, Users, Calendar, Trash2, Plus } from 'lucide-react';

export const TournamentHub: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTournament, setActiveTournament] = useState<Tournament | null>(null);
  const [allTournaments, setAllTournaments] = useState<Tournament[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isProcessingResult, setIsProcessingResult] = useState(false);
  
  const [view, setView] = useState<'list' | 'create' | 'active'>('list');
  
  const [newTourneyName, setNewTourneyName] = useState('');
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);
  const [tourneyType, setTourneyType] = useState<'single' | 'double'>('single');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Load tournaments from sheets
  const fetchTournaments = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getTournaments();
      if (data) {
        const parsed: Tournament[] = data.map(t => {
          let tourneyObj: any = null;
          if (typeof t.data === 'string') {
            try {
              tourneyObj = JSON.parse(t.data);
            } catch (e) {
              console.error("Failed to parse tournament data for ID:", t.id);
            }
          } else if (t.data && typeof t.data === 'object') {
            tourneyObj = t.data;
          }

          if (tourneyObj) {
            // Ensure ID consistency
            if (!tourneyObj.id) tourneyObj.id = t.id;
            return tourneyObj as Tournament;
          }
          return null;
        }).filter((t): t is Tournament => t !== null);

        setAllTournaments(parsed);
        
        const savedId = localStorage.getItem('battleforge_active_tournament_id');
        if (savedId) {
          const found = parsed.find(t => t.id === savedId);
          if (found) {
            setActiveTournament(found);
            setView('active');
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch tournaments:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTournaments();
  }, [fetchTournaments]);

  // Handle return from MatchLogger with results
  useEffect(() => {
    if (location.state && location.state.completedMatchId && location.state.winner && !isProcessingResult) {
      // If we are still loading, wait for it to finish
      if (isLoading) return;

      if (!activeTournament) {
        console.warn("Match completed but no active tournament found to apply it to.");
        // Clear the state to prevent infinite loops/warnings
        navigate(location.pathname, { replace: true, state: {} });
        return;
      }

      const { completedMatchId, winner } = location.state;
      
      // Prevent double processing
      setIsProcessingResult(true);
      handleMatchCompletion(completedMatchId, winner).finally(() => {
        setIsProcessingResult(false);
        navigate(location.pathname, { replace: true, state: {} });
      });
    }
  }, [location.state, activeTournament, isLoading, navigate, location.pathname, isProcessingResult]);

  // --- Core Logic: Advance Players ---
  
  const advancePlayerToMatch = (matches: TournamentMatch[], targetId: string, player: string): boolean => {
    const target = matches.find(m => m.id === targetId);
    if (!target) return false;
    
    // Idempotency check
    if (target.player1 === player || target.player2 === player) return false;

    let changed = false;
    
    // Fill empty slot
    if (!target.player1) {
       target.player1 = player;
       changed = true;
    } else if (!target.player2) {
       target.player2 = player;
       changed = true;
    }

    if (changed) {
        if (target.player1 && target.player2) {
            target.status = 'ready';
        } else {
            target.status = 'pending';
        }
    }
    
    return changed;
  };

  const settleBracket = (matches: TournamentMatch[]) => {
    let changed = true;
    let iterations = 0;
    while(changed && iterations < 50) {
      changed = false;
      iterations++;
      
      matches.forEach(m => {
         // RULE 1: Auto-resolve pending/ready matches
         if (m.status !== 'completed') {
             const p1 = m.player1;
             const p2 = m.player2;
             
             if (p1 && p2) {
                 // 1a. Handle BYE (Auto-Win)
                 if (p1 === 'BYE' || p2 === 'BYE') {
                     m.winner = p1 === 'BYE' ? p2 : p1;
                     m.status = 'completed';
                     changed = true; 
                 } 
                 // 1b. Handle Initial Pending -> Ready
                 else if (m.status === 'pending') {
                     m.status = 'ready';
                     changed = true;
                 }
             }
         }

         // RULE 2: Propagate Completed Matches
         if (m.status === 'completed' && m.winner) {
             // Advance Winner
             if (m.nextMatchId) {
                if (advancePlayerToMatch(matches, m.nextMatchId, m.winner)) changed = true;
             }
             // Advance Loser (Double Elim)
             if (m.loserNextMatchId && m.player1 && m.player2) {
                const loser = m.winner === m.player1 ? m.player2 : m.player1;
                if (loser && advancePlayerToMatch(matches, m.loserNextMatchId, loser)) changed = true;
             }
         }
      });
    }
  };

  const handleMatchCompletion = async (matchId: string, winner: string | null) => {
    if (!activeTournament || !winner) return;

    const newMatches = JSON.parse(JSON.stringify(activeTournament.matches)); 
    const match = newMatches.find((m: TournamentMatch) => m.id === matchId);
    
    if (match && match.status === 'completed' && match.winner === winner) return;
    
    if (match) {
        match.winner = winner;
        match.status = 'completed';
    
        settleBracket(newMatches);
        const pruned = pruneBracket(newMatches);
        settleBracket(pruned);
    
        const updatedTourney = { ...activeTournament, matches: pruned };
        setActiveTournament(updatedTourney);
        
        // Persist to Sheets
        setIsSaving(true);
        try {
          await saveTournament(updatedTourney);
        } catch (e) {
          console.error("Failed to sync tournament:", e);
        } finally {
          setIsSaving(false);
        }
    }
  };

  // --- Pruning Logic (Injection Method) ---
  const pruneBracket = (matches: TournamentMatch[]) => {
    let activeMatches = [...matches];
    let changed = true;
    let iterations = 0;
    
    while(changed && iterations < 20) {
        changed = false;
        iterations++;
        const toRemoveIds: string[] = [];
        
        // Sort by round to process upstream matches first
        activeMatches.sort((a,b) => a.roundIndex - b.roundIndex);

        for(const m of activeMatches) {
            const isWbR0 = m.bracketType === 'winner' && m.roundIndex === 0;
            
            let p1 = m.player1;
            let p2 = m.player2;
            
            const isByeBye = p1 === 'BYE' && p2 === 'BYE';
            const isPlayerBye = (p1 === 'BYE' || p2 === 'BYE') && !isByeBye; 
            
            let shouldPrune = false;
            let projectedWinner: string | null = null;
            let projectedLoser: string | null = null;

            // 1. BYE vs BYE -> Winner is BYE, Loser is BYE. Always Remove.
            if (isByeBye) {
                shouldPrune = true;
                projectedWinner = 'BYE';
                projectedLoser = 'BYE';
            } 
            // 2. Player vs BYE -> Winner is Player, Loser is BYE. Remove unless WB Round 0.
            else if (isPlayerBye && !isWbR0) {
                shouldPrune = true;
                projectedWinner = p1 === 'BYE' ? p2 : p1;
                projectedLoser = 'BYE';
            }

            if (shouldPrune && projectedWinner) {
                // INJECT RESULTS DOWNSTREAM
                // This simulates the match happening instantly and auto-forwarding the result
                if (m.nextMatchId) {
                    if (advancePlayerToMatch(activeMatches, m.nextMatchId, projectedWinner)) {
                        // If we successfully advanced, we might have created a new pruning opportunity downstream
                        // The loop will catch it in the next iteration
                    }
                }
                if (m.loserNextMatchId) {
                    if (advancePlayerToMatch(activeMatches, m.loserNextMatchId, projectedLoser!)) {
                        // same here
                    }
                }

                toRemoveIds.push(m.id);
                changed = true;
            }
        }
        
        if (toRemoveIds.length > 0) {
            activeMatches = activeMatches.filter(m => !toRemoveIds.includes(m.id));
        }
    }
    return activeMatches;
  };

  // --- Generators ---

  const generateFullSingleElim = (participants: string[], idOffset = 0): { matches: TournamentMatch[], rounds: number, nextId: number } => {
     const shuffled = [...participants].sort(() => 0.5 - Math.random());
     let size = 2;
     while(size < shuffled.length) size *= 2;
     
     // Fill with BYEs
     const seeded = [...shuffled];
     while(seeded.length < size) seeded.push("BYE");

     // Standard pairing (0v1, 2v3...)
     const r1Pairs: {p1: string, p2: string}[] = [];
     for(let i=0; i<size; i+=2) {
         r1Pairs.push({ p1: seeded[i], p2: seeded[i+1] });
     }

     const matches: TournamentMatch[] = [];
     let matchIdCounter = idOffset + 1;
     const getId = () => `m_${matchIdCounter++}`;

     // Round 1
     const round1Ids: string[] = [];
     r1Pairs.forEach(pair => {
        const id = getId();
        round1Ids.push(id);
        matches.push({
          id,
          roundIndex: 0,
          bracketType: 'winner',
          player1: pair.p1,
          player2: pair.p2,
          winner: null,
          status: 'pending' 
        });
     });

     // Subsequent Rounds
     let currentIds = round1Ids;
     let rIdx = 1;
     while(currentIds.length > 1) {
       const nextIds: string[] = [];
       for(let i=0; i<currentIds.length; i+=2) {
         const id = getId();
         nextIds.push(id);
         
         const m1 = matches.find(m => m.id === currentIds[i]);
         const m2 = matches.find(m => m.id === currentIds[i+1]);
         if(m1) m1.nextMatchId = id;
         if(m2) m2.nextMatchId = id;
         
         matches.push({
           id,
           roundIndex: rIdx,
           bracketType: 'winner',
           player1: null,
           player2: null,
           winner: null,
           status: 'pending'
         });
       }
       currentIds = nextIds;
       rIdx++;
     }
     
     return { matches, rounds: rIdx, nextId: matchIdCounter };
  };

  const generateDoubleElim = (participants: string[]): { matches: TournamentMatch[], rounds: number } => {
    // 1. Generate FULL Winner Bracket
    const { matches: wbMatches, rounds: wbRounds, nextId } = generateFullSingleElim(participants);
    const matches = [...wbMatches];
    
    const wbByRound: Record<number, TournamentMatch[]> = {};
    matches.forEach(m => {
      if(!wbByRound[m.roundIndex]) wbByRound[m.roundIndex] = [];
      wbByRound[m.roundIndex].push(m);
    });

    let matchIdCounter = nextId + 1000;
    const getId = () => `m_${matchIdCounter++}`;

    const lbMatches: TournamentMatch[] = [];
    let prevLBRoundMatches: TournamentMatch[] = [];

    // --- LB Round 0: Consumes WB Round 0 Losers ---
    const wbR0 = wbByRound[0];
    const lbR0Count = wbR0.length / 2;
    
    for (let i = 0; i < lbR0Count; i++) {
        const m: TournamentMatch = { 
            id: getId(), 
            roundIndex: 0, 
            bracketType: 'loser', 
            player1: null, 
            player2: null, 
            winner: null, 
            status: 'pending' 
        };
        lbMatches.push(m);
        prevLBRoundMatches.push(m);

        wbR0[i*2].loserNextMatchId = m.id;
        wbR0[i*2+1].loserNextMatchId = m.id;
    }

    let lbRoundIndex = 1;

    // --- Feed Remaining WB Rounds ---
    for (let i = 1; i < wbRounds; i++) {
        const wbRoundMatches = wbByRound[i]; 
        
        // Injection Round (Winner of previous LB vs Loser of current WB)
        const injectionMatches: TournamentMatch[] = [];
        for (let j = 0; j < wbRoundMatches.length; j++) {
            const m: TournamentMatch = {
                id: getId(),
                roundIndex: lbRoundIndex,
                bracketType: 'loser',
                player1: null,
                player2: null,
                winner: null,
                status: 'pending'
            };
            injectionMatches.push(m);
            lbMatches.push(m);

            if (prevLBRoundMatches[j]) prevLBRoundMatches[j].nextMatchId = m.id;
            wbRoundMatches[j].loserNextMatchId = m.id;
        }
        prevLBRoundMatches = injectionMatches;
        lbRoundIndex++;

        // Reduction Round (Winner of LB vs Winner of LB) - Only if not the last WB round
        if (prevLBRoundMatches.length > 1) {
            const reductionMatches: TournamentMatch[] = [];
            for (let j = 0; j < prevLBRoundMatches.length; j += 2) {
                const m: TournamentMatch = {
                    id: getId(),
                    roundIndex: lbRoundIndex,
                    bracketType: 'loser',
                    player1: null, 
                    player2: null,
                    winner: null, 
                    status: 'pending'
                };
                reductionMatches.push(m);
                lbMatches.push(m);

                prevLBRoundMatches[j].nextMatchId = m.id;
                prevLBRoundMatches[j+1].nextMatchId = m.id;
            }
            prevLBRoundMatches = reductionMatches;
            lbRoundIndex++;
        }
    }

    // --- Grand Final ---
    const grandFinal: TournamentMatch = {
        id: getId(),
        roundIndex: 0,
        bracketType: 'final',
        player1: null,
        player2: null,
        winner: null,
        status: 'pending'
    };
    matches.push(grandFinal);

    // Winner of WB Final -> Final
    const wbFinal = wbByRound[wbRounds-1][0];
    wbFinal.nextMatchId = grandFinal.id;

    // Winner of LB Final -> Final
    if (prevLBRoundMatches[0]) {
        prevLBRoundMatches[0].nextMatchId = grandFinal.id;
    }

    matches.push(...lbMatches);
    
    return { matches, rounds: lbRoundIndex };
  };

  const createTournament = async () => {
    if (!newTourneyName || selectedPlayers.length < 2) {
      alert("Enter name and select at least 2 players.");
      return;
    }

    let result;
    if (tourneyType === 'double') {
      result = generateDoubleElim(selectedPlayers);
    } else {
      const full = generateFullSingleElim(selectedPlayers);
      result = { matches: full.matches, rounds: full.rounds };
    }

    let matches = result.matches;
    settleBracket(matches);
    matches = pruneBracket(matches);
    settleBracket(matches);

    const newTourney: Tournament = {
      id: newTourneyName.replace(/\s+/g, '') + '_' + Date.now(),
      name: newTourneyName,
      type: tourneyType,
      participants: selectedPlayers,
      matches: matches,
      rounds: result.rounds,
      status: 'active',
      dateCreated: new Date().toISOString()
    };

    setIsSaving(true);
    try {
      await saveTournament(newTourney);
      setActiveTournament(newTourney);
      localStorage.setItem('battleforge_active_tournament_id', newTourney.id);
      setView('active');
      fetchTournaments(); // Refresh list in background
    } catch (e) {
      alert("Failed to save tournament to sheets. Check your connection.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectTournament = (t: Tournament) => {
    setActiveTournament(t);
    localStorage.setItem('battleforge_active_tournament_id', t.id);
    setView('active');
  };

  const handleBackToList = () => {
    setActiveTournament(null);
    localStorage.removeItem('battleforge_active_tournament_id');
    setView('list');
    fetchTournaments();
  };

  const handlePlayerToggle = (p: string) => {
    if (selectedPlayers.includes(p)) setSelectedPlayers(selectedPlayers.filter(x => x !== p));
    else setSelectedPlayers([...selectedPlayers, p]);
  };

  const confirmDelete = async () => {
     if (!activeTournament) return;
     
     setIsSaving(true);
     try {
       await deleteTournamentFromSheet(activeTournament.id);
       localStorage.removeItem('battleforge_active_tournament_id');
       setActiveTournament(null);
       setNewTourneyName('');
       setSelectedPlayers([]);
       setShowDeleteModal(false);
       setView('list');
       fetchTournaments();
     } catch (e) {
       alert("Failed to delete tournament.");
     } finally {
       setIsSaving(false);
     }
  };

  const startMatch = (m: TournamentMatch) => {
     if (!activeTournament) return;
     if (m.status !== 'ready') return;
     
     navigate('/', { 
       state: {
         player1: m.player1,
         player2: m.player2,
         tournamentId: activeTournament.id,
         bracketMatchId: m.id,
         roundIndex: m.roundIndex,
         bracketType: m.bracketType
       }
     });
  };

  const renderBracketSection = (title: string, matches: TournamentMatch[]) => {
      // Visual Filter: Even after pruning, hide any stubborn Bye matches
      const visibleMatches = matches.filter(m => {
          if (m.player1 === 'BYE' && m.player2 === 'BYE') return false;
          return true;
      });

      if (visibleMatches.length === 0) return null;
      
      // Dynamic Column Mapping:
      // Map the distinct 'roundIndex' values to 1, 2, 3...
      // This ensures if Round 2 is pruned entirely, Round 3 becomes the 2nd visual column.
      const activeRoundIndices = Array.from(new Set(visibleMatches.map(m => m.roundIndex))).sort((a,b) => a-b);
      
      return (
        <div className="mb-8">
           <h3 className="text-war-red font-orbitron font-bold uppercase mb-4 sticky left-0">{title}</h3>
           <div className="flex gap-8 min-w-max">
              {activeRoundIndices.map((roundIdx, displayIdx) => {
                 const roundMatches = visibleMatches.filter(m => m.roundIndex === roundIdx);
                 
                 return (
                   <div key={roundIdx} className="flex flex-col justify-around gap-8 w-64">
                      <div className="text-center text-zinc-500 font-orbitron text-xs font-bold uppercase mb-4 bg-black/40 p-1 rounded">
                        Round {displayIdx + 1}
                      </div>
                      {roundMatches.map(m => {
                        const isReady = m.status === 'ready';
                        const isComplete = m.status === 'completed';
                        const p1Won = isComplete && m.winner === m.player1;
                        const p2Won = isComplete && m.winner === m.player2;

                        return (
                          <div 
                             key={m.id} 
                             onClick={() => isReady && startMatch(m)}
                             className={`
                               relative p-3 rounded border transition-all 
                               ${isComplete ? 'bg-green-900/10 border-green-900/30' : isReady ? 'bg-war-panel border-war-red cursor-pointer hover:bg-zinc-800 hover:scale-[1.02] shadow-[0_0_10px_rgba(255,45,45,0.2)]' : 'bg-zinc-900 border-zinc-800 opacity-60'}
                             `}
                          >
                             <div className={`text-sm font-bold flex justify-between ${p1Won ? 'text-green-400' : p2Won ? 'text-red-900 line-through opacity-50' : 'text-zinc-300'}`}>
                               <span>{m.player1 || 'Waiting...'}</span>
                               {p1Won && <span>✓</span>}
                             </div>
                             <div className="h-px bg-zinc-700 my-2"></div>
                             <div className={`text-sm font-bold flex justify-between ${p2Won ? 'text-green-400' : p1Won ? 'text-red-900 line-through opacity-50' : 'text-zinc-300'}`}>
                               <span>{m.player2 || 'Waiting...'}</span>
                               {p2Won && <span>✓</span>}
                             </div>
                          </div>
                        );
                      })}
                   </div>
                 );
              })}
           </div>
        </div>
      );
  };

  return (
    <div className="min-h-screen bg-war-dark pb-20 p-4">
      {/* Syncing Overlay */}
      {isSaving && (
        <div className="fixed top-4 right-4 z-[100] bg-war-panel border border-war-red/50 rounded-lg px-4 py-2 shadow-lg flex items-center gap-3 animate-pulse">
          <Loader2 className="w-4 h-4 animate-spin text-war-red" />
          <span className="text-xs font-orbitron text-white uppercase tracking-wider">Syncing with Sheets...</span>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
            <div className="bg-war-panel border border-red-900/50 rounded-lg p-6 max-w-md w-full shadow-[0_0_20px_rgba(255,45,45,0.1)]">
                <h3 className="text-xl font-orbitron font-bold text-white mb-2">Delete Tournament?</h3>
                <p className="text-zinc-400 mb-6 text-sm">
                    Are you sure you want to delete <span className="text-white font-bold">{activeTournament?.name}</span>? 
                    This action cannot be undone and all bracket progress will be lost.
                </p>
                <div className="flex gap-3 justify-end">
                    <Button variant="secondary" onClick={() => setShowDeleteModal(false)} className="text-xs">Cancel</Button>
                    <Button variant="danger" onClick={confirmDelete} className="text-xs bg-red-600 hover:bg-red-700" disabled={isSaving}>
                      {isSaving ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : null}
                      Yes, Delete It
                    </Button>
                </div>
            </div>
        </div>
      )}

      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-orbitron font-bold text-war-red">
          TOURNAMENT<span className="text-white">HUB</span>
        </h1>
        <div className="flex gap-2">
          {view !== 'list' && (
            <Button variant="secondary" onClick={handleBackToList} className="text-xs py-2 px-3">
              &larr; All Brackets
            </Button>
          )}
          <Button variant="secondary" onClick={() => navigate('/')} className="text-xs py-2 px-3">App</Button>
        </div>
      </header>

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-500">
          <Loader2 className="w-10 h-10 animate-spin mb-4 text-war-red" />
          <p className="font-orbitron text-sm uppercase tracking-widest">Loading Brackets...</p>
        </div>
      ) : view === 'list' ? (
        <div className="max-w-4xl mx-auto animate-fade-in">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-orbitron text-white uppercase tracking-tight">Active Brackets</h2>
            <div className="flex gap-2">
              <button 
                onClick={fetchTournaments}
                className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition-colors"
                title="Refresh"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
              <Button onClick={() => setView('create')} className="text-xs">
                <Plus className="w-4 h-4 mr-2" /> New Bracket
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {allTournaments.length === 0 ? (
              <div className="col-span-full bg-war-panel border border-zinc-800 rounded-xl p-12 text-center">
                <Trophy className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-500 font-orbitron text-sm uppercase">No tournaments found</p>
                <Button onClick={() => setView('create')} variant="secondary" className="mt-4 text-xs">Create the first one</Button>
              </div>
            ) : (
              allTournaments.sort((a,b) => new Date(b.dateCreated).getTime() - new Date(a.dateCreated).getTime()).map(t => (
                <div 
                  key={t.id}
                  onClick={() => selectTournament(t)}
                  className="bg-war-panel border border-zinc-700 rounded-xl p-5 cursor-pointer hover:border-war-red transition-all group shadow-lg"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-orbitron font-bold text-white group-hover:text-war-red transition-colors">{t.name}</h3>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-bold ${t.type === 'double' ? 'bg-indigo-900/30 text-indigo-300 border border-indigo-800' : 'bg-amber-900/30 text-amber-300 border border-amber-800'}`}>
                          {t.type} Elim
                        </span>
                        <span className="text-[10px] text-zinc-500 flex items-center gap-1">
                          <Calendar className="w-3 h-3" /> {new Date(t.dateCreated).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <Trophy className="w-6 h-6 text-zinc-700 group-hover:text-war-red transition-colors" />
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-zinc-400 bg-black/20 p-2 rounded border border-zinc-800">
                    <div className="flex items-center gap-2">
                      <Users className="w-3 h-3" />
                      <span>{t.participants.length} Players</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${t.status === 'active' ? 'bg-green-500 animate-pulse' : 'bg-zinc-600'}`}></div>
                      <span className="uppercase font-bold text-[10px]">{t.status}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      ) : view === 'create' ? (
        <div className="bg-war-panel border border-zinc-700 rounded-lg p-6 max-w-2xl mx-auto shadow-xl animate-fade-in">
           <div className="flex items-center gap-3 mb-6">
             <div className="p-2 bg-war-red/10 rounded-lg">
               <Trophy className="w-6 h-6 text-war-red" />
             </div>
             <h2 className="text-xl font-orbitron text-white">Create New Tournament</h2>
           </div>
           
           <div className="space-y-4">
             <Input label="Tournament Name" value={newTourneyName} onChange={e => setNewTourneyName(e.target.value)} placeholder="e.g. Summer Slam 2024" />
             
             <div className="flex flex-col gap-1">
               <label className="text-war-gray text-xs font-orbitron uppercase">Format</label>
               <div className="flex gap-2">
                 <button onClick={() => setTourneyType('single')} className={`flex-1 py-2 rounded border transition-all font-orbitron text-xs uppercase ${tourneyType === 'single' ? 'bg-war-red border-war-red text-white shadow-[0_0_10px_rgba(255,45,45,0.3)]' : 'bg-zinc-800 border-zinc-700 text-gray-400'}`}>Single Elimination</button>
                 <button onClick={() => setTourneyType('double')} className={`flex-1 py-2 rounded border transition-all font-orbitron text-xs uppercase ${tourneyType === 'double' ? 'bg-war-red border-war-red text-white shadow-[0_0_10px_rgba(255,45,45,0.3)]' : 'bg-zinc-800 border-zinc-700 text-gray-400'}`}>Double Elimination</button>
               </div>
             </div>

             <div className="flex flex-col gap-1">
               <label className="text-war-gray text-xs font-orbitron uppercase">Participants ({selectedPlayers.length})</label>
               <div className="grid grid-cols-2 md:grid-cols-4 gap-2 bg-zinc-900 p-3 rounded border border-zinc-800 max-h-40 overflow-y-auto">
                 {PLAYERS.map(p => (
                   <button 
                     key={p} 
                     onClick={() => handlePlayerToggle(p)}
                     className={`text-xs p-2 rounded text-left transition-colors font-medium ${selectedPlayers.includes(p) ? 'bg-green-900/50 text-green-200 border border-green-700' : 'bg-zinc-800 text-zinc-400 hover:bg-zinc-700'}`}
                   >
                     {p}
                   </button>
                 ))}
               </div>
             </div>

             <Button onClick={createTournament} className="w-full mt-4" disabled={isSaving}>
               {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
               Generate & Share Bracket
             </Button>
             <Button variant="secondary" onClick={() => setView('list')} className="w-full">Cancel</Button>
           </div>
        </div>
      ) : (
        <div className="animate-fade-in overflow-x-auto">
           {/* Sticky header updated with z-index and background to ensure clickable buttons */}
           <div className="flex justify-between items-center mb-4 min-w-[600px] sticky left-0 z-10 bg-war-dark p-2 border-b border-zinc-800">
             <div>
               <div className="flex items-center gap-2">
                 <h2 className="text-2xl font-bold font-orbitron text-white">{activeTournament?.name}</h2>
                 {isSaving && <Loader2 className="w-4 h-4 animate-spin text-war-red" />}
               </div>
               <div className="text-xs text-zinc-500">Status: {activeTournament?.status} | Type: {activeTournament?.type}</div>
             </div>
             <div className="flex gap-2">
               <button 
                 onClick={fetchTournaments}
                 className="p-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg text-zinc-400 transition-colors"
                 title="Sync"
               >
                 <RefreshCw className="w-4 h-4" />
               </button>
               <Button variant="danger" onClick={() => setShowDeleteModal(true)} className="text-xs py-1 px-3 bg-red-800 hover:bg-red-700 text-white border-red-900 shadow-lg">
                 <Trash2 className="w-3 h-3 mr-2" /> Delete
               </Button>
             </div>
           </div>

           {/* Render Brackets Split by Type */}
           {activeTournament?.type === 'single' ? (
              renderBracketSection("Bracket", activeTournament.matches)
           ) : (
              <div>
                {renderBracketSection("Winners Bracket", activeTournament?.matches.filter(m => m.bracketType === 'winner') || [])}
                {renderBracketSection("Losers Bracket", activeTournament?.matches.filter(m => m.bracketType === 'loser') || [])}
                {renderBracketSection("Finals", activeTournament?.matches.filter(m => m.bracketType === 'final') || [])}
              </div>
           )}
        </div>
      )}
    </div>
  );
};
