

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
  // Tournament Metadata
  tournamentId?: string;
  bracketMatchId?: string;
}

export interface MatchState extends MatchSetup {
  rounds: RoundData[];
}

// Data structure received from Google Apps Script
export interface HistoricalRoundData {
  round: number;
  p1: { 
    primary: number; 
    secondary1Name: string;
    secondary1Pts: number;
    secondary2Name: string;
    secondary2Pts: number;
    secondary: number; 
    challenger: number; 
    cpEarned: number; 
    cpUsed: number; 
  };
  p2: { 
    primary: number; 
    secondary1Name: string;
    secondary1Pts: number;
    secondary2Name: string;
    secondary2Pts: number;
    secondary: number; 
    challenger: number; 
    cpEarned: number; 
    cpUsed: number; 
  };
}

export interface HistoricalMatch {
  id: string | number;
  date: string;
  points: number;
  player1: string;
  army1: string;
  detachment1?: string;
  player2: string;
  army2: string;
  detachment2?: string;
  mission: string;
  p1Score: number;
  p2Score: number;
  rawRounds?: HistoricalRoundData[];
  // Hydrated metadata
  tournamentId?: string;
}

export interface ScoringGroup {
  label?: string;
  buttons: number[]; // e.g. [5, 10]
  max?: number; // e.g. 10
}

export interface ScoringRule {
  type: 'fixed' | 'tiered' | 'cumulative' | 'manual' | 'additive';
  options?: number[]; // For tiered/fixed, e.g. [0, 2, 5]
  increment?: number; // For cumulative, e.g. 4 for Assassination
  buttons?: number[]; // For simple additive, e.g. [2, 4]
  groups?: ScoringGroup[]; // For complex grouped additive
  max?: number;
}

// Tournament Types
export interface TournamentMatch {
  id: string;
  roundIndex: number; // 0 = Ro16, 1 = QF, etc.
  player1: string | null; // Null if waiting for previous match
  player2: string | null;
  winner: string | null;
  nextMatchId?: string; // ID of the match the winner advances to
  loserNextMatchId?: string; // For double elimination
  status: 'pending' | 'ready' | 'completed';
  bracketType?: 'winner' | 'loser' | 'final';
}

export interface Tournament {
  id: string;
  name: string;
  type: 'single' | 'double';
  participants: string[];
  matches: TournamentMatch[];
  rounds: number; // Total number of rounds
  status: 'active' | 'completed';
  dateCreated: string;
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
