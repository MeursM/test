

import { ArmyData, Stratagem, ScoringRule } from './types';

export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyoPUgiARIII7Ee7YvNW0dQeJn77VqAJQ9-2aHOBQNK_h8ge1IidUCIeZnpPGvmEfJp/exec';

export const PLAYERS = [
  "Dylan", "Michiel", "Stijn", "Maarten", "Sven", "Stef", "Steven","Sam"
];

export const MISSIONS = [
   "Burden of Trust", "Hidden Supplies", "Linchpin", "Purge the Foe",
  "Scorched Earth", "Supply Drop", "Take and Hold", "Terraform",
  "The Ritual", "Unexploded Ordnance"
];

// Default Rule: Additive 5s
const STANDARD_PRIMARY: ScoringRule = { type: 'additive', buttons: [5, 5, 5], max: 15 };

export const PRIMARY_SCORING: Record<string, ScoringRule> = {
  "Burden of Trust": { 
    type: 'additive', 
    max: 26,
    groups: [
      { label: "Control Objectives", buttons: [4, 4, 4, 4], max: 16 },
      { label: "Guard", buttons: [2,2,2,2,2], max: 10 }
    ]
  },
  "Hidden Supplies": STANDARD_PRIMARY,
  "Linchpin": { 
    type: 'additive', 
    max: 15,
    groups: [
      { label: "no home Objectives", buttons: [3, 3, 3, 3], max: 12 },
      { label: "With home Objective", buttons: [3,5,5,5,5], max: 15 }
    ]
  },
  "Purge the Foe": { 
    type: 'additive', 
    max: 16,
    groups: [
      { label: "One or more destroyed", buttons: [4], max: 4 },
      { label: "more destroyed", buttons: [4], max: 4 },
      { label: "One Objective, more then the other", buttons: [4,4], max: 8 }
    ]
  },
  // Scorched Earth: Grouped. Burn (Max 10) + Control (Max 10). Global Max 15.
  "Scorched Earth": { 
    type: 'additive', 
    max: 20,
    groups: [
      { label: "Burn Objectives", buttons: [5, 10], max: 10 },
      { label: "Control Objectives", buttons: [5, 5], max: 10 }
    ]
  },
  "Supply Drop": { 
    type: 'additive', 
    max: 16,
    groups: [
      { label: "Second and Third", buttons: [5,5,5], max: 15},
      { label: "Fourth", buttons: [8,8], max: 16 },
      { label: "Fifth", buttons: [15], max: 15 }
    ]
  },
  "Take and Hold": STANDARD_PRIMARY,
  "Terraform": { 
    type: 'additive', 
    max: 16,
    groups: [
      { label: "Terraformed Objectives", buttons: [1,1,1,1], max: 4 },
      { label: "Control Objectives", buttons: [4,4,4,4], max: 12 }
    ]
  },
  "The Ritual": STANDARD_PRIMARY,
  "Unexploded Ordnance": { 
    type: 'additive', 
    max: 24,
    groups: [
      { label: "within opponent deployment", buttons: [8,8,8], max: 24},
      { label: "withing 6''", buttons: [5,5,5], max: 15 },
      { label: "within 12''", buttons: [2,2,2], max: 6 }
    ]
  },
  'default': STANDARD_PRIMARY
};

export const SECONDARIES = [
    "A TEMPTING TARGET",
    "AREA DENIAL",
    "ASSASSINATION",
    "BEHIND ENEMY LINES",
    "BRING IT DOWN",
    "CLEANSE",
    "CULL THE HORDE",
    "DEFEND STRONGHOLD",
    "DISPLAY OF MIGHT",
    "ENGAGE ON ALL FRONTS",
    "ESTABLISH LOCUS",
    "EXTEND BATTLE LINES",
    "MARKED FOR DEATH",
    "NO PRISONERS",
    "OVERWHELMING FORCE",
    "RECOVER ASSETS",
    "SABOTAGE",
    "SECURE NO MAN'S LAND",
    "STORM HOSTILE OBJECTIVE"
];

export const SECONDARY_SCORING: Record<string, ScoringRule> = {
  "AREA DENIAL": { type: 'tiered', options: [0, 2, 5], max: 5 },
  "ASSASSINATION": { type: 'tiered', options: [0, 3, 4, 5], max: 5 },
  "A TEMPTING TARGET": { type: 'tiered', options: [0, 5], max: 5 },

  "BEHIND ENEMY LINES": { type: 'tiered', options: [0, 3, 4], max: 4 },
  "BRING IT DOWN": { type: 'tiered', options: [0, 2, 4], max: 4 },

  "CLEANSE": { type: 'tiered', options: [0, 2, 4, 5], max: 4 },
  "CULL THE HORDE": { type: 'tiered', options: [0, 5], max: 5 },

  "DEFEND STRONGHOLD": { type: 'tiered', options: [0, 3], max: 3 },
  "DISPLAY OF MIGHT": { type: 'tiered', options: [0, 4], max: 4 },

  "ENGAGE ON ALL FRONTS": { type: 'tiered', options: [0, 1, 2, 4], max: 4 },
  "ESTABLISH LOCUS": { type: 'tiered', options: [0, 2 ,4], max: 4 },
  "EXTEND BATTLE LINES": { type: 'tiered', options: [0, 2 ,4], max: 4 },

  "MARKED FOR DEATH": { type: 'tiered', options: [0, 2, 5], max: 5 },

  "NO PRISONERS": { type: 'tiered', options: [0, 2, 4, 5], max: 5 },

  "OVERWHELMING FORCE": { type: 'tiered', options: [0, 3, 5], max: 5 },

  "RECOVER ASSETS": { type: 'tiered', options: [0, 3, 5], max: 5 },

  "SABOTAGE": { type: 'tiered', options: [0, 3 , 6], max: 6 },
  "SECURE NO MAN'S LAND": { type: 'tiered', options: [0, 2, 5], max: 5 },
  "STORM HOSTILE OBJECTIVE": { type: 'tiered', options: [0, 4], max: 4 },

};


export const GENERAL_STRATAGEMS: Stratagem[] = [
  { name: "COMMAND RE-ROLL(move)", cost: 1 },
  { name: "COMMAND RE-ROLL(shoot)", cost: 1 },
  { name: "COMMAND RE-ROLL(charge)", cost: 1 },
  { name: "COMMAND RE-ROLL(fight)", cost: 1 },
  { name: "COUNTER-OFFENSIVE", cost: 2 },
  { name: "EPIC CHALLENGE", cost: 1 },
  { name: "INSANE BRAVERY", cost: 1 },
  { name: "GRENADE", cost: 1 },
  { name: "TANK SHOCK", cost: 1 },
  { name: "RAPID INGRESS", cost: 1 },
  { name: "FIRE OVERWATCH", cost: 1 },
  { name: "GO TO GROUND", cost: 1 },
  { name: "SMOKESCREEN", cost: 1 },
  { name: "HEROIC INTERVENTION", cost: 1 }
];

export const DETACHMENT_STRATAGEMS: Record<string, Stratagem[]> = {
  "Experimental Prototype Cadre": [
    { name: "AUTOMATED REPAIR DRONES", cost: 1 },
    { name: "EXPERIMENTAL AMMUNITION", cost: 1 },
    { name: "REACTIVE IMPACT DAMPENERS", cost: 1 },
    { name: "EXPERIMENTAL WEAPONRY", cost: 1 },
    { name: "THREAT ASSESSMENT ANALYSER", cost: 1 },
    { name: "NEUROWEB SYSTEM JAMMER", cost: 1 }
  ],
  "Kauyon": [
    { name: "A TEMPTING TRAP", cost: 1 },
    { name: "POINT-BLANK AMBUSH", cost: 1 },
    { name: "COORDINATE TO ENGAGE", cost: 1 },
    { name: "COMBAT EMBARKATION", cost: 1 },
    { name: "PHOTON GRENADES", cost: 1 },
    { name: "WALL OF MIRRORS", cost: 1 }
  ],
  "Mont’ka": [
    { name: "PINPOINT COUNTER-OFFENSIVE", cost: 1 },
    { name: "AGGRESSIVE MOBILITY", cost: 1 },
    { name: "FOCUSED FIRE", cost: 1 },
    { name: "COMBAT DEBARKATION", cost: 1 },
    { name: "PULSE ONSLAUGHT", cost: 2 },
    { name: "COUNTERFIRE DEFENCE SYSTEMS", cost: 2 }
  ],
  "Invasion Fleet": [
    { name: "RAPID REGENERATION", cost: 1 },
    { name: "ADRENAL SURGE", cost: 2 },
    { name: "DEATH FRENZY", cost: 1 },
    { name: "OVERRUN", cost: 1 },
    { name: "PREDATORY IMPERATIVE", cost: 1 },
    { name: "ENDLESS SWARM", cost: 1 }
  ],
  "War Horde": [
    { name: "CAREEN!", cost: 1 },
    { name: "HARD AS NAILS", cost: 1 },
    { name: "ORKS IS NEVER BEATEN", cost: 2 },
    { name: "UNBRIDLED CARNAGE", cost: 1 },
    { name: "MOB RULE", cost: 1 },
    { name: "ERE WE GO", cost: 1 }
  ],
  "Awakened Dynasty": [
    { name: "PROTOCOL OF THE ETERNAL REVENANT", cost: 1 },
    { name: "PROTOCOL OF THE SUDDEN STORM", cost: 1 },
    { name: "PROTOCOL OF THE UNDYING LEGIONS", cost: 1 },
    { name: "PROTOCOL OF THE CONQUERING TYRANT", cost: 1 },
    { name: "PROTOCOL OF THE HUNGRY VOID", cost: 1 },
    { name: "PROTOCOL OF THE VENGEFUL STARS", cost: 2 }
  ],
  "Lions of the Emperor": [
    { name: "GILDED CHAMPION", cost: 1 },
    { name: "UNLEASH THE LIONS", cost: 1 },
    { name: "DEFIANT TO THE LAST", cost: 1 },
    { name: "MANOEUVRE AND FIRE", cost: 1 },
    { name: "PEERLESS WARRIOR", cost: 1 },
    { name: "SWIFT AS THE EAGLE", cost: 1 }
  ],
  "Black Spear Task Force": [
    { name: "ARMOUR OF CONTEMPT", cost: 1 },
    { name: "ADAPTIVE TACTICS", cost: 1 },
    { name: "HELLFIRE ROUNDS", cost: 1 },
    { name: "KRAKEN ROUNDS", cost: 1 },
    { name: "DRAGONFIRE ROUNDS", cost: 1 },
    { name: "SITE-TO-SITE TELEPORTATION", cost: 1 }
  ]
};

export const ARMY_DATA: Record<string, ArmyData> = {
  "Adeptus Custodes": {
    name: "Adeptus Custodes",
    detachments: ["Auric Champions", "Lions of the Emperor", "Null Maiden Vigil", "Shield Host", "Solar Spearhead", "Talons of the Emperor"],
    cpEarners: [{ name: "SHIELD HOST TACTICS", cp: 1 }]
  },
  "Death Guard": {
    name: "Death Guard",
    detachments: ["Virulent Vectorium", "Mortarion’s Hammer", "Champions of Contagion", "Tallyband Summoners", "Shamblerot Vectorium", "Death Lord’s Chosen", "Flyblown Host"],
    cpEarners: [{ name: "INEXORABLE ADVANCE", cp: 1 }, { name: "OTHER1", cp: 1 }]
  },
  "Deathwatch": {
    name: "Deathwatch",
    detachments: ["1st Company Task Force", "Anvil Siege Force", "Black Spear Task Force", "Firestorm Assault Force", "Gladius Task Force", "Ironstorm Spearhead", "Librarius Conclave", "Stormlance Task Force", "Vanguard Spearhead"],
    cpEarners: [{ name: "Watch Master", cp: 1 }, { name: "Rites of Battle", cp: 1 }]
  },
  "Necrons": {
    name: "Necrons",
    detachments: ["Annihilation Legion", "Awakened Dynasty", "Canoptek Court", "Hypercrypt Legion", "Obeisance Phalanx", "Starshatter Arsenal"],
    cpEarners: [{ name: "OTHER1", cp: 1 }]
  },
  "Orks": {
    name: "Orks",
    detachments: ["Bully Boyz", "Da Big Hunt", "Dread Mob", "Green Tide", "Kult of Speed", "More Dakka!", "Taktikal Brigade", "War Horde"],
    cpEarners: [{ name: "OTHER1", cp: 1 }]
  },

  "T'au Empire": {
    name: "Tau Empire",
    detachments: ["Kauyon", "Mont’ka", "Retaliation Cadre", "Kroot Hunting Pack", "Auxiliary Cadre", "Experimental Prototype Cadre"],
    cpEarners: [{ name: "ETHEREAL COMMAND", cp: 1 }, { name: "KAU'YON", cp: 1 }, { name: "OTHER1", cp: 1 }]
  },
  "Tyranids": {
    name: "Tyranids",
    detachments: ["Assimilation Swarm", "Crusher Stampede", "Invasion Fleet", "Subterranean Assault", "Synaptic Nexus", "Unending Swarm", "Vanguard Onslaught", "Warrior Bioform Onslaught"],
    cpEarners: [{ name: "OTHER1", cp: 1 }]
  }
};

const OTHER_ARMIES = [
  "Agents of the Imperium", "Adeptus Mechanicus", "Adepta Sororitas", "Aeldari", 
  "Black Templars", "Blood Angels", "Chaos Daemons", "Chaos Knights", 
  "Chaos Space Marines", "Dark Angels", "Drukhari", "Genestealer Cults", 
  "Grey Knights", "Imperial Guard", "Imperial Knights", "Leagues of Votann", 
  "Space Marines", "Space Wolves", "Thousand Sons", "World Eaters"
];

OTHER_ARMIES.forEach(army => {
    if (!ARMY_DATA[army]) {
        ARMY_DATA[army] = {
            name: army,
            detachments: ["Index Detachment", "Special Task Force"],
            cpEarners: [{name: "General Ability", cp: 1}]
        }
    }
});