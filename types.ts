export interface Stratagem {
  name: string;
  cost: number;
}

export interface ArmyData {
  name: string;
  detachments: string[];
  cpEarners?: { name: string; cp: number }[];
}

export interface PlayerRoundData {
  primary: number;
  secondary1_name: string;
  secondary1_pts: number;
  secondary2_name: string;
  secondary2_pts: number;
  challenger: number;
  cpEarnedTurn1: boolean; // T1 checkbox
  cpGainedTurn1: boolean; // T1 Gained CP (e.g. discard secondary)
  cpEarnedTurn2: boolean; // T2 checkbox
  cpGainedTurn2: boolean; // T2 Gained CP
  cpEarnedArmy: string[]; // List of CP amounts from army abilities
  cpUsed: number;
  stratagems: string[];
}

export interface RoundData {
  roundNumber: number;
  p1: PlayerRoundData;
  p2: PlayerRoundData;
}

export interface MatchSetup {
  points: number;
  primaryMission: string;
  player1: string;
  player2: string;
  army1: string;
  army2: string;
  detachmentP1: string;
  detachmentP2: string;
}

export interface MatchState extends MatchSetup {
  rounds: RoundData[];
}

export const INITIAL_PLAYER_ROUND: PlayerRoundData = {
  primary: 0,
  secondary1_name: '',
  secondary1_pts: 0,
  secondary2_name: '',
  secondary2_pts: 0,
  challenger: 0,
  cpEarnedTurn1: false,
  cpGainedTurn1: false,
  cpEarnedTurn2: false,
  cpGainedTurn2: false,
  cpEarnedArmy: [],
  cpUsed: 0,
  stratagems: []
};