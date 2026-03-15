

import { GOOGLE_SCRIPT_URL } from '../constants';
import { MatchState, HistoricalMatch } from '../types';

export const submitMatchData = async (matchState: MatchState) => {
  // Transform the React State Tree into the flat JSON structure expected by the GAS doPost
  
  // METADATA PACKING:
  // Since we can't change the GAS backend easily, we pack tournament data and game mode into the 'primaryMission' string.
  // Format: "MissionName [TID:123|MID:456|GM:Tournament]"
  let missionField = matchState.primaryMission;
  const tags = [];
  if (matchState.tournamentId) {
    tags.push(`TID:${matchState.tournamentId}`);
    tags.push(`MID:${matchState.bracketMatchId || '0'}`);
    if (matchState.roundIndex !== undefined) tags.push(`RID:${matchState.roundIndex}`);
    if (matchState.bracketType) tags.push(`BT:${matchState.bracketType}`);
  }
  tags.push(`GM:${matchState.gameMode}`);
  missionField = `${matchState.primaryMission} [${tags.join('|')}]`;

  const flatData: any = {
    points: matchState.points,
    player1: matchState.player1,
    player2: matchState.player2,
    army1: matchState.army1,
    army2: matchState.army2,
    detachmentP1: matchState.detachmentP1,
    detachmentP2: matchState.detachmentP2,
    primaryMission: missionField,
    gameMode: matchState.gameMode, // Still send it separately just in case the backend is updated
  };

  matchState.rounds.forEach((round, index) => {
    const i = index + 1; // 1-based index for GAS
    
    // Player 1
    flatData[`p1_primary_${i}`] = round.p1.primary;
    flatData[`p1_secondary1_name_${i}`] = round.p1.secondary1_name;
    flatData[`p1_secondary1_pts_${i}`] = round.p1.secondary1_pts;
    flatData[`p1_secondary2_name_${i}`] = round.p1.secondary2_name;
    flatData[`p1_secondary2_pts_${i}`] = round.p1.secondary2_pts;
    flatData[`p1_secondary_${i}`] = round.p1.secondary1_pts + round.p1.secondary2_pts; // Sum needed by backend
    flatData[`p1_challenger_${i}`] = round.p1.challenger;
    
    // Calculate Total CP Earned for the round
    const p1CpFromTurn = (round.p1.cpEarnedTurn1 ? 1 : 0) + (round.p1.cpEarnedTurn2 ? 1 : 0);
    const p1CpFromGained = (round.p1.cpGainedTurn1 ? 1 : 0) + (round.p1.cpGainedTurn2 ? 1 : 0);
    const p1CpFromArmy = round.p1.cpEarnedArmy.reduce((sum, val) => sum + parseFloat(val), 0);
    flatData[`p1_cp_earned_${i}`] = p1CpFromTurn + p1CpFromGained + p1CpFromArmy;
    
    flatData[`p1_cp_used_${i}`] = round.p1.cpUsed;
    
    // Send arrays for Stratagems/CP - GAS will join them
    flatData[`p1_stratagems_${i}`] = round.p1.stratagems; 
    flatData[`p1_cp_army_${i}`] = round.p1.cpEarnedArmy; 

    // Player 2
    flatData[`p2_primary_${i}`] = round.p2.primary;
    flatData[`p2_secondary1_name_${i}`] = round.p2.secondary1_name;
    flatData[`p2_secondary1_pts_${i}`] = round.p2.secondary1_pts;
    flatData[`p2_secondary2_name_${i}`] = round.p2.secondary2_name;
    flatData[`p2_secondary2_pts_${i}`] = round.p2.secondary2_pts;
    flatData[`p2_secondary_${i}`] = round.p2.secondary1_pts + round.p2.secondary2_pts;
    flatData[`p2_challenger_${i}`] = round.p2.challenger;

    const p2CpFromTurn = (round.p2.cpEarnedTurn1 ? 1 : 0) + (round.p2.cpEarnedTurn2 ? 1 : 0);
    const p2CpFromGained = (round.p2.cpGainedTurn1 ? 1 : 0) + (round.p2.cpGainedTurn2 ? 1 : 0);
    const p2CpFromArmy = round.p2.cpEarnedArmy.reduce((sum, val) => sum + parseFloat(val), 0);
    flatData[`p2_cp_earned_${i}`] = p2CpFromTurn + p2CpFromGained + p2CpFromArmy;

    flatData[`p2_cp_used_${i}`] = round.p2.cpUsed;
    
    // Send arrays for Stratagems/CP
    flatData[`p2_stratagems_${i}`] = round.p2.stratagems;
    flatData[`p2_cp_army_${i}`] = round.p2.cpEarnedArmy;
  });

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors', 
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(flatData)
    });
    return true;
  } catch (error) {
    console.error("Transmission error:", error);
    throw error;
  }
};

export const getMatchHistory = async (): Promise<HistoricalMatch[] | null> => {
  try {
    // Add cache busting and action param to ensure GET request is fresh
    const response = await fetch(`${GOOGLE_SCRIPT_URL}?action=getHistory&t=${Date.now()}`, {
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    if (!Array.isArray(data)) return [];

    // Unpack Metadata
    return data.map((m: any) => {
      let tournamentId = undefined;
      let bracketMatchId = undefined;
      let roundIndex = undefined;
      let bracketType = undefined;
      let gameMode: any = m.gameMode || 'Tournament'; // Use separate field if exists, else default
      let cleanMission = m.mission;

      // Check for [TID:...] or [GM:...] tag in mission string
      const metaMatch = m.mission && m.mission.match(/\[(.*?)\]/);
      if (metaMatch) {
        const tagContent = metaMatch[1];
        const parts = tagContent.split('|');
        parts.forEach((part: string) => {
          if (part.startsWith('TID:')) tournamentId = part.replace('TID:', '');
          if (part.startsWith('MID:')) bracketMatchId = part.replace('MID:', '');
          if (part.startsWith('RID:')) roundIndex = parseInt(part.replace('RID:', ''));
          if (part.startsWith('BT:')) bracketType = part.replace('BT:', '') as any;
          if (part.startsWith('GM:')) gameMode = part.replace('GM:', '');
        });
        cleanMission = m.mission.replace(/\[.*?\]/, '').trim();
      }

      return {
        ...m,
        mission: cleanMission, // Show clean name in UI
        tournamentId,
        bracketMatchId,
        roundIndex,
        bracketType,
        gameMode
      };
    });

  } catch (error) {
    console.error("Fetch history error:", error);
    return null; 
  }
};
