import React, { useMemo } from 'react';
import { PlayerRoundData, ArmyData } from '../types';
import { GENERAL_STRATAGEMS, DETACHMENT_STRATAGEMS, SECONDARIES } from '../constants';
import { Input } from './ui/Input';
import { Select } from './ui/Select';

interface RoundInputProps {
  playerData: PlayerRoundData;
  playerName: string;
  armyData?: ArmyData;
  detachmentName: string;
  roundNumber: number;
  onChange: (newData: PlayerRoundData) => void;
  isPlayer2?: boolean;
}

export const RoundInput: React.FC<RoundInputProps> = ({ 
  playerData, playerName, armyData, detachmentName, roundNumber, onChange, isPlayer2 
}) => {
  
  // Calculate Stratagems List based on detachment
  const availableStratagems = useMemo(() => {
    const specific = DETACHMENT_STRATAGEMS[detachmentName] || [];
    return [...GENERAL_STRATAGEMS, ...specific];
  }, [detachmentName]);

  const secondaryOptions = SECONDARIES.map(s => ({ label: s, value: s }));

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

  const calculateTotal = () => {
    return playerData.primary + playerData.secondary1_pts + playerData.secondary2_pts + playerData.challenger;
  };

  const calculateNetCP = () => {
    const gained = (playerData.cpEarnedTurn1 ? 1 : 0) + 
                   (playerData.cpEarnedTurn2 ? 1 : 0) + 
                   (playerData.cpGainedTurn1 ? 1 : 0) + 
                   (playerData.cpGainedTurn2 ? 1 : 0) + 
                   playerData.cpEarnedArmy.reduce((a, b) => a + parseFloat(b), 0);
    return gained - playerData.cpUsed;
  };

  const borderColor = isPlayer2 ? 'border-blue-900/50' : 'border-red-900/50';
  const headerColor = isPlayer2 ? 'text-blue-400' : 'text-red-400';

  return (
    <div className={`bg-war-panel p-4 rounded-lg border ${borderColor} relative`}>
      <div className="absolute top-0 right-0 bg-black/40 px-3 py-1 rounded-bl-lg border-b border-l border-zinc-700 text-xs font-mono text-zinc-400">
         VP: <span className="text-white font-bold">{calculateTotal()}</span> | 
         Net CP: <span className={calculateNetCP() < 0 ? 'text-red-500' : 'text-green-500'}>{calculateNetCP()}</span>
      </div>

      <h3 className={`font-orbitron text-lg font-bold mb-4 ${headerColor}`}>{playerName || (isPlayer2 ? 'Player 2' : 'Player 1')}</h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Scoring */}
        <div className="space-y-3">
          <Input 
            label="Primary VP" 
            type="number" 
            value={playerData.primary} 
            onChange={e => updateField('primary', parseInt(e.target.value) || 0)} 
          />
          
          <div className="flex gap-2">
            <Select 
              label="Secondary 1"
              className="flex-1"
              options={secondaryOptions} 
              placeholder="Select Mission"
              value={playerData.secondary1_name}
              onChange={e => updateField('secondary1_name', e.target.value)}
            />
            <Input 
              type="number" 
              className="w-20" 
              label="Pts"
              value={playerData.secondary1_pts}
              onChange={e => updateField('secondary1_pts', parseInt(e.target.value) || 0)}
            />
          </div>

          <div className="flex gap-2">
            <Select 
              label="Secondary 2"
              className="flex-1"
              options={secondaryOptions} 
              placeholder="Select Mission"
              value={playerData.secondary2_name}
              onChange={e => updateField('secondary2_name', e.target.value)}
            />
            <Input 
              type="number" 
              className="w-20" 
              label="Pts"
              value={playerData.secondary2_pts}
              onChange={e => updateField('secondary2_pts', parseInt(e.target.value) || 0)}
            />
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
          <label className="text-war-gray text-xs font-orbitron uppercase">CP Earned</label>
          <div className="grid grid-cols-2 gap-2 mb-2">
             <div className="flex flex-col gap-2">
               <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={playerData.cpEarnedTurn1} onChange={e => updateField('cpEarnedTurn1', e.target.checked)} className="accent-war-red" />
                  Turn 1 CMD
               </label>
               <label className="flex items-center gap-2 text-sm text-gray-300">
                  <input type="checkbox" checked={playerData.cpEarnedTurn2} onChange={e => updateField('cpEarnedTurn2', e.target.checked)} className="accent-war-red" />
                  Turn 2 CMD
               </label>
             </div>
             <div className="flex flex-col gap-2 border-l border-zinc-700 pl-2">
               <label className="flex items-center gap-2 text-sm text-war-red-dim hover:text-war-red cursor-pointer transition-colors">
                  <input type="checkbox" checked={playerData.cpGainedTurn1} onChange={e => updateField('cpGainedTurn1', e.target.checked)} className="accent-war-red" />
                  Gained CP
               </label>
               <label className="flex items-center gap-2 text-sm text-war-red-dim hover:text-war-red cursor-pointer transition-colors">
                  <input type="checkbox" checked={playerData.cpGainedTurn2} onChange={e => updateField('cpGainedTurn2', e.target.checked)} className="accent-war-red" />
                  Gained CP
               </label>
             </div>
          </div>

          {armyData?.cpEarners && (
             <div className="flex flex-col gap-1">
                <span className="text-xs text-zinc-500">Army Abilities:</span>
                <select 
                  multiple 
                  className="bg-zinc-800 border border-zinc-700 text-xs rounded p-1 h-20 text-gray-300"
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
            label="Manual CP Used Adjustment" 
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