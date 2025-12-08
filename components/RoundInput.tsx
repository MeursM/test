
import React, { useMemo, useState, useEffect } from 'react';
import { PlayerRoundData, ArmyData, ScoringRule, ScoringGroup } from '../types';
import { GENERAL_STRATAGEMS, DETACHMENT_STRATAGEMS, SECONDARIES, SECONDARY_SCORING, PRIMARY_SCORING } from '../constants';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface RoundInputProps {
  playerData: PlayerRoundData;
  playerName: string;
  armyData?: ArmyData;
  detachmentName: string;
  roundNumber: number;
  primaryMission: string;
  onChange: (newData: PlayerRoundData) => void;
  isPlayer2?: boolean;
  startingCp: number;
  priorPrimary: number;
  priorSecondary: number;
}

// Subcomponent for Scoring Control
const ScoreControl: React.FC<{ 
  label: string; 
  value: number; 
  rule: ScoringRule; 
  onChange: (val: number) => void; 
}> = ({ label, value, rule, onChange }) => {
  
  // Track manual clicks to differentiate between combinations that sum to the same value (e.g., 5 vs 5)
  const [manualSelection, setManualSelection] = useState<Map<number, number[]> | null>(null);

  // Reset manual selection if the external value doesn't match the internal sum (e.g. Reset button, or data load)
  useEffect(() => {
    if (manualSelection) {
      let sum = 0;
      const groups = rule.groups || (rule.buttons ? [{ buttons: rule.buttons }] : []);
      manualSelection.forEach((indices, gIdx) => {
        if (groups[gIdx]) {
           let gSum = 0;
           indices.forEach(i => gSum += groups[gIdx].buttons[i]);
           if (groups[gIdx].max && gSum > groups[gIdx].max!) gSum = groups[gIdx].max!;
           sum += gSum;
        }
      });
      if (rule.max && sum > rule.max) sum = rule.max;
      
      if (sum !== value) {
        setManualSelection(null);
      }
    }
  }, [value, rule, manualSelection]);

  const handleInc = (delta: number) => {
    const next = value + delta;
    if (next < 0) return;
    if (rule.max && next > rule.max) return;
    onChange(next);
  };

  // SOLVER: Reverse-engineer which buttons are active based on the single integer score
  // Used as fallback when no manual interaction has happened yet (e.g. page load)
  const activeIndices = useMemo(() => {
    // If user has manually clicked, prioritize that visual state
    if (manualSelection) return manualSelection;

    if (rule.type !== 'additive') return new Map<number, number[]>();
    
    const target = value;
    const groups = rule.groups || (rule.buttons ? [{ buttons: rule.buttons }] : []);

    // Greedy Solver: Try to fill groups in order (0, 1, 2...)
    // This provides a deterministic "Default" state for a given score.
    const solve = (gIdx: number, currentScore: number, state: Map<number, number[]>): Map<number, number[]> | null => {
      if (currentScore === target) return state;
      if (gIdx >= groups.length) return null;

      const group = groups[gIdx];
      const buttons = group.buttons;
      
      // Generate all combinations for this group
      const n = buttons.length;
      const combinations: { indices: number[], sum: number }[] = [];
      for (let i = 0; i < (1 << n); i++) {
        const indices: number[] = [];
        let sum = 0;
        for (let j = 0; j < n; j++) {
          if ((i >> j) & 1) {
            indices.push(j);
            sum += buttons[j];
          }
        }
        // Group Cap
        if (group.max && sum > group.max) sum = group.max;
        combinations.push({ indices, sum });
      }

      // Sort combinations: Prefer higher sums to fill quota, then fewer buttons
      combinations.sort((a, b) => b.sum - a.sum);

      for (const combo of combinations) {
        // Optimization: Don't exceed target
        if (currentScore + combo.sum > target) continue;

        const newState = new Map(state);
        newState.set(gIdx, combo.indices);
        
        // If exact match
        if (currentScore + combo.sum === target) return newState;

        // Otherwise recurse
        const result = solve(gIdx + 1, currentScore + combo.sum, newState);
        if (result) return result;
      }
      
      return null;
    };

    return solve(0, 0, new Map()) || new Map();

  }, [value, rule, manualSelection]);

  const handleAdditiveToggle = (groupIndex: number, buttonIndex: number, btnVal: number, isActive: boolean) => {
    const groups = rule.groups || (rule.buttons ? [{ buttons: rule.buttons }] : []);
    
    // Start with current visual state
    const nextState = new Map(activeIndices);
    
    // Update the specific group
    const currentGroupIndices = [...(nextState.get(groupIndex) || [])];
    if (isActive) {
      const idx = currentGroupIndices.indexOf(buttonIndex);
      if (idx > -1) currentGroupIndices.splice(idx, 1);
    } else {
      currentGroupIndices.push(buttonIndex);
    }
    nextState.set(groupIndex, currentGroupIndices);

    // Calculate new total score
    let totalScore = 0;
    nextState.forEach((indices, gIdx) => {
      const grp = groups[gIdx];
      let groupSum = 0;
      indices.forEach(i => groupSum += grp.buttons[i]);
      if (grp.max && groupSum > grp.max) groupSum = grp.max;
      totalScore += groupSum;
    });

    if (rule.max && totalScore > rule.max) totalScore = rule.max;

    // Set manual selection state to lock visuals, then propogate value
    setManualSelection(nextState);
    onChange(totalScore);
  };

  // Determine Groups to render
  const renderGroups = rule.groups || (rule.buttons ? [{ buttons: rule.buttons }] : []);

  return (
    <div className="flex flex-col gap-1 w-full">
      <div className="flex justify-between items-center">
        <label className="text-war-gray text-xs font-orbitron uppercase tracking-wider">{label}</label>
        {rule.type === 'additive' && (
           <span className="text-white font-orbitron font-bold text-lg">{value}{rule.max ? `/${rule.max}` : ''}</span>
        )}
      </div>
      
      {/* TIERED / FIXED */}
      {(rule.type === 'tiered' || rule.type === 'fixed') && rule.options && (
        <div className="flex gap-2 flex-wrap">
          {rule.options.map(opt => (
            <button
              key={opt}
              onClick={() => onChange(opt)}
              className={`flex-1 py-2 rounded text-sm font-bold border transition-all min-w-[3rem] ${
                value === opt 
                  ? 'bg-war-red border-war-red text-white' 
                  : 'bg-zinc-800 border-zinc-700 text-gray-400 hover:bg-zinc-700'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      )}

      {/* ADDITIVE GROUPS */}
      {rule.type === 'additive' && (
        <div className="flex flex-col gap-3">
           {renderGroups.map((grp, gIdx) => (
             <div key={gIdx} className="flex flex-col gap-1">
               {grp.label && <span className="text-[10px] text-zinc-500 uppercase">{grp.label} {grp.max ? `(Max ${grp.max})` : ''}</span>}
               <div className="flex flex-wrap gap-2">
                 {grp.buttons.map((btn, bIdx) => {
                   const isActive = activeIndices.get(gIdx)?.includes(bIdx);
                   return (
                     <button
                       key={bIdx}
                       onClick={() => handleAdditiveToggle(gIdx, bIdx, btn, !!isActive)}
                       className={`
                          w-12 h-12 rounded font-bold text-lg transition-all transform active:scale-95 border
                          ${isActive 
                            ? 'bg-green-600 border-green-500 text-white shadow-[0_0_10px_rgba(34,197,94,0.4)]' 
                            : 'bg-zinc-800 border-zinc-600 text-gray-400 hover:bg-zinc-700'}
                       `}
                     >
                       {btn}
                     </button>
                   );
                 })}
               </div>
             </div>
           ))}
           <div className="flex justify-end">
             <button 
               onClick={() => { setManualSelection(null); onChange(0); }}
               className="text-xs text-red-400 hover:text-red-300 underline"
             >
               Reset Score
             </button>
           </div>
        </div>
      )}

      {/* CUMULATIVE */}
      {rule.type === 'cumulative' && (
        <div className="flex items-center gap-2 bg-zinc-900 rounded border border-zinc-700 p-1">
          <button onClick={() => handleInc(-(rule.increment || 1))} className="w-10 h-8 bg-zinc-800 rounded hover:bg-zinc-700 text-white font-bold">-</button>
          <div className="flex-1 text-center font-orbitron font-bold text-white text-lg">{value}</div>
          <button onClick={() => handleInc(rule.increment || 1)} className="w-10 h-8 bg-zinc-800 rounded hover:bg-zinc-700 text-white font-bold">+</button>
        </div>
      )}

      {/* MANUAL */}
      {rule.type === 'manual' && (
         <input 
           type="number" 
           value={value} 
           onChange={(e) => onChange(parseInt(e.target.value) || 0)}
           className="bg-war-panel border border-zinc-700 rounded p-2 text-white font-mono w-full"
         />
      )}
    </div>
  );
};

export const RoundInput: React.FC<RoundInputProps> = ({ 
  playerData, playerName, armyData, detachmentName, roundNumber, primaryMission, onChange, isPlayer2, startingCp,
  priorPrimary, priorSecondary
}) => {
  
  const availableStratagems = useMemo(() => {
    const specific = DETACHMENT_STRATAGEMS[detachmentName] || [];
    return [...GENERAL_STRATAGEMS, ...specific];
  }, [detachmentName]);

  const secondaryOptions = SECONDARIES.map(s => ({ label: s, value: s }));

  // Determine Scoring Rules
  const primaryRule = PRIMARY_SCORING[primaryMission] || PRIMARY_SCORING['default'];
  
  const getSecondaryRule = (name: string): ScoringRule => {
    return SECONDARY_SCORING[name] || { type: 'manual' }; 
  };

  const updateField = (field: keyof PlayerRoundData, value: any) => {
    onChange({ ...playerData, [field]: value });
  };

  const handleStratagemToggle = (stratName: string, cost: number) => {
    let newStratagems = [...playerData.stratagems];
    let newCost = playerData.cpUsed;

    if (newStratagems.includes(stratName)) {
      newStratagems = newStratagems.filter(s => s !== stratName);
      newCost -= cost;
    } else {
      newStratagems.push(stratName);
      newCost += cost;
    }
    onChange({ ...playerData, stratagems: newStratagems, cpUsed: Math.max(0, newCost) });
  };

  const calculateCurrentCP = () => {
    const earned = (playerData.cpEarnedTurn1 ? 1 : 0) + 
                   (playerData.cpEarnedTurn2 ? 1 : 0) + 
                   (playerData.cpGainedTurn1 ? 1 : 0) + 
                   (playerData.cpGainedTurn2 ? 1 : 0) + 
                   playerData.cpEarnedArmy.reduce((a, b) => a + parseFloat(b), 0);
    return startingCp + earned - playerData.cpUsed;
  };

  // Calculate Running Totals with Caps
  const totalPrimary = priorPrimary + playerData.primary;
  const cappedPrimary = Math.min(50, totalPrimary);
  
  const totalSecondary = priorSecondary + playerData.secondary1_pts + playerData.secondary2_pts;
  const cappedSecondary = Math.min(40, totalSecondary);

  const currentCp = calculateCurrentCP();
  
  const borderColor = isPlayer2 ? 'border-blue-900/50' : 'border-red-900/50';
  const headerColor = isPlayer2 ? 'text-blue-400' : 'text-red-400';

  return (
    <div className={`bg-war-panel p-4 rounded-lg border ${borderColor} relative`}>
      <div className="absolute top-0 right-0 bg-black/40 px-3 py-1 rounded-bl-lg border-b border-l border-zinc-700 text-xs font-mono text-zinc-400 flex gap-3">
         <span>pVP: <span className="text-white font-bold">{cappedPrimary}</span></span>
         <span className="text-zinc-600">|</span>
         <span>sVP: <span className="text-white font-bold">{cappedSecondary}</span></span>
         <span className="text-zinc-600">|</span>
         <span>CP: <span className={currentCp < 0 ? 'text-red-500 font-bold' : 'text-green-500 font-bold'}>{currentCp}</span></span>
      </div>

      <h3 className={`font-orbitron text-lg font-bold mb-4 ${headerColor}`}>{playerName || (isPlayer2 ? 'Player 2' : 'Player 1')}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Scoring */}
        <div className="space-y-4">
          
          <ScoreControl 
            label={`Primary: ${primaryMission || 'None'}`}
            value={playerData.primary}
            rule={primaryRule}
            onChange={(val) => updateField('primary', val)}
          />
          
          <div className="p-3 bg-zinc-900/30 rounded border border-zinc-800 space-y-3">
             <Select 
              label="Secondary 1"
              options={secondaryOptions} 
              placeholder="Select Mission"
              value={playerData.secondary1_name}
              onChange={e => updateField('secondary1_name', e.target.value)}
            />
            {playerData.secondary1_name && (
              <ScoreControl 
                label="Score"
                value={playerData.secondary1_pts}
                rule={getSecondaryRule(playerData.secondary1_name)}
                onChange={(val) => updateField('secondary1_pts', val)}
              />
            )}
          </div>

          <div className="p-3 bg-zinc-900/30 rounded border border-zinc-800 space-y-3">
            <Select 
              label="Secondary 2"
              options={secondaryOptions} 
              placeholder="Select Mission"
              value={playerData.secondary2_name}
              onChange={e => updateField('secondary2_name', e.target.value)}
            />
             {playerData.secondary2_name && (
              <ScoreControl 
                label="Score"
                value={playerData.secondary2_pts}
                rule={getSecondaryRule(playerData.secondary2_name)}
                onChange={(val) => updateField('secondary2_pts', val)}
              />
            )}
          </div>

          <Input 
            label="Challenger VP" 
            type="number" 
            value={playerData.challenger} 
            onChange={e => updateField('challenger', parseInt(e.target.value) || 0)} 
          />
        </div>

        {/* Command Points & Stratagems */}
        <div className="space-y-3 bg-black/20 p-3 rounded">
          <label className="text-war-gray text-xs font-orbitron uppercase">CP Management</label>
          
          <div className="grid grid-cols-2 gap-2 mb-2">
             <div className="flex flex-col gap-2">
               <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={playerData.cpEarnedTurn1} onChange={e => updateField('cpEarnedTurn1', e.target.checked)} className="accent-war-red" />
                  Turn 1 CMD (+1)
               </label>
               <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={playerData.cpEarnedTurn2} onChange={e => updateField('cpEarnedTurn2', e.target.checked)} className="accent-war-red" />
                  Turn 2 CMD (+1)
               </label>
             </div>
             <div className="flex flex-col gap-2 border-l border-zinc-700 pl-2">
               <label className="flex items-center gap-2 text-sm text-war-red-dim hover:text-war-red cursor-pointer transition-colors">
                  <input type="checkbox" checked={playerData.cpGainedTurn1} onChange={e => updateField('cpGainedTurn1', e.target.checked)} className="accent-war-red" />
                  Gained (e.g Discard)
               </label>
               <label className="flex items-center gap-2 text-sm text-war-red-dim hover:text-war-red cursor-pointer transition-colors">
                  <input type="checkbox" checked={playerData.cpGainedTurn2} onChange={e => updateField('cpGainedTurn2', e.target.checked)} className="accent-war-red" />
                  Gained (e.g Discard)
               </label>
             </div>
          </div>

          {armyData?.cpEarners && (
             <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500">Army Abilities:</span>
                <select 
                  multiple 
                  className="bg-zinc-800 border border-zinc-700 text-xs rounded p-1 h-20 text-gray-300 w-full"
                  value={playerData.cpEarnedArmy}
                  onChange={e => {
                    const selected = Array.from(e.target.selectedOptions, (option: HTMLOptionElement) => option.value);
                    updateField('cpEarnedArmy', selected);
                  }}
                >
                  {armyData.cpEarners.map((cp, idx) => (
                    <option key={idx} value={cp.cp}>{cp.name} (+{cp.cp} CP)</option>
                  ))}
                </select>
             </div>
          )}

          <Input 
            label="Manual CP Used" 
            type="number" 
            value={playerData.cpUsed} 
            onChange={e => updateField('cpUsed', parseInt(e.target.value) || 0)} 
          />

          <div className="flex flex-col gap-1 mt-2">
            <span className="text-war-gray text-xs font-orbitron uppercase">Stratagems Used</span>
            <div className="h-40 overflow-y-auto bg-zinc-800 border border-zinc-700 rounded p-2">
              {availableStratagems.map((strat, idx) => {
                 const isSelected = playerData.stratagems.includes(strat.name);
                 return (
                    <div 
                      key={idx} 
                      onClick={() => handleStratagemToggle(strat.name, strat.cost)}
                      className={`cursor-pointer text-xs p-1 mb-1 rounded flex justify-between items-center ${isSelected ? 'bg-war-red text-white' : 'text-gray-400 hover:bg-zinc-700'}`}
                    >
                      <span>{strat.name}</span>
                      <span className="font-bold opacity-70">{strat.cost}CP</span>
                    </div>
                 );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
