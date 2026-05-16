

import { ArmyData, Stratagem, ScoringRule } from './types';

export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyJyZQqTEfGVwGZKCA2dZKESNMv3OZW4TlFoE3_ZDIZxnI9b4yWHoFNoJRwSCzX94O4/exec';

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

  //tau
  "Kauyon": [
    { "name": "A TEMPTING TRAP", "cost": 1 },
    { "name": "POINT-BLANK AMBUSH", "cost": 1 },
    { "name": "COORDINATE TO ENGAGE", "cost": 1 },
    { "name": "COMBAT EMBARKATION", "cost": 1 },
    { "name": "PHOTON GRENADES", "cost": 1 },
    { "name": "WALL OF MIRRORS", "cost": 1 }
  ],

  "Mont’ka": [
    { "name": "PINPOINT COUNTER-OFFENSIVE", "cost": 1 },
    { "name": "AGGRESSIVE MOBILITY", "cost": 1 },
    { "name": "FOCUSED FIRE", "cost": 1 },
    { "name": "COMBAT DEBARKATION", "cost": 1 },
    { "name": "PULSE ONSLAUGHT", "cost": 2 },
    { "name": "COUNTERFIRE DEFENCE SYSTEMS", "cost": 2 }
  ],

  "Retaliation Cadre": [
    { "name": "FAIL-SAFE DETONATOR", "cost": 2 },
    { "name": "STIMM INJECTORS", "cost": 1 },
    { "name": "THE SHORTENED BLADE", "cost": 2 },
    { "name": "THE ARRO’KON PROTOCOL", "cost": 1 },
    { "name": "THE TORCHSTAR GAMBIT", "cost": 1 },
    { "name": "GRAV-INHIBITOR FIELD", "cost": 1 }
  ],

  "Kroot Hunting Pack": [
    { "name": "JOIN THE HUNT", "cost": 2 },
    { "name": "A TRAP WELL LAID", "cost": 1 },
    { "name": "EMP GRENADES", "cost": 1 },
    { "name": "THE GRISLY FEAST", "cost": 1 },
    { "name": "GUERRILLA WARRIORS", "cost": 1 },
    { "name": "HIDDEN HUNTERS", "cost": 1 }
  ],

  "Auxiliary Cadre": [
    { "name": "EXPERIMENTAL MODIFICATIONS", "cost": 1 },
    { "name": "MULTISENSORY SCANNING", "cost": 1 },
    { "name": "INTERLOCKING MANOUEVRES", "cost": 1 },
    { "name": "PHEROMONE WAYPOINTS", "cost": 1 },
    { "name": "ALIEN EXPERTISE", "cost": 1 },
    { "name": "GUIDED FIRE", "cost": 1 }
  ],

  "Experimental Prototype Cadre": [
    { "name": "AUTOMATED REPAIR DRONES", "cost": 1 },
    { "name": "REACTIVE IMPACT DAMPENERS", "cost": 1 },
    { "name": "EXPERIMENTAL WEAPONRY", "cost": 1 },
    { "name": "EXPERIMENTAL AMMUNITION", "cost": 1 },
    { "name": "THREAT ASSESSMENT ANALYSER", "cost": 1 },
    { "name": "NEUROWEB SYSTEM JAMMER", "cost": 1 }
  ],
  //deathguard
  "Virulent Vectorium": [
    { "name": "PUTRID DETONATION", "cost": 1 },
    { "name": "DISGUSTINGLY RESILIENT", "cost": 2 },
    { "name": "PLAGUESURGE", "cost": 2 },
    { "name": "LEECHSPORE ERUPTION", "cost": 1 },
    { "name": "OVERWHELMING GENEROSITY", "cost": 1 },
    { "name": "CREEPING BLIGHT", "cost": 1 }
  ],

  "Mortarion’s Hammer": [
    { "name": "BLIGHTED LAND", "cost": 2 },
    { "name": "RELENTLESS GRIND", "cost": 1 },
    { "name": "DRAWN TO DESPAIR", "cost": 1 },
    { "name": "FONT OF FILTH", "cost": 1 },
    { "name": "EYESTINGER STORM", "cost": 1 },
    { "name": "STINKING MIRE", "cost": 1 }
  ],

  "Champions of Contagion": [
    { "name": "BLESSINGS OF FILTH", "cost": 1 },
    { "name": "MALIGNANCE MAGNIFIED", "cost": 2 },
    { "name": "GROTESQUE FORTITUDE", "cost": 1 },
    { "name": "RABID INFUSION", "cost": 1 },
    { "name": "MOBILE VECTOR", "cost": 1 },
    { "name": "DEATH’S HEADS", "cost": 1 }
  ],

  "Tallyband Summoners": [
    { "name": "PERSISTENT PESTS", "cost": 1 },
    { "name": "CLUTCHING CORRUPTION", "cost": 1 },
    { "name": "ALL IS ROT", "cost": 1 },
    { "name": "FLESHY AVALANCHE", "cost": 1 },
    { "name": "AVATARS OF DECAY", "cost": 1 },
    { "name": "MIRESLICK", "cost": 1 }
  ],

  "Shamblerot Vectorium": [
    { "name": "GRIP OF THE WALKING POX", "cost": 1 },
    { "name": "SMEARED WITH FILTH", "cost": 1 },
    { "name": "GNAWING HUNGER", "cost": 1 },
    { "name": "HIDDEN AMONGST THE DEAD", "cost": 1 },
    { "name": "SHOCK AND HORROR", "cost": 1 },
    { "name": "SHAMBLING WALL", "cost": 1 }
  ],

  "Death Lord’s Chosen": [
    { "name": "BLOOMING PESTILENCE", "cost": 1 },
    { "name": "GRIM REAPERS", "cost": 1 },
    { "name": "UNDYING SPITE", "cost": 1 },
    { "name": "SIGNAL POX", "cost": 1 },
    { "name": "MORTARION'S TEACHINGS", "cost": 1 },
    { "name": "SICKENING IMPACT", "cost": 1 }
  ],

  "Flyblown Host": [
    { "name": "NAUSEATING PAROXYSMS", "cost": 1 },
    { "name": "VERMIN CLOUD", "cost": 1 },
    { "name": "EYE OF THE SWARM", "cost": 1 },
    { "name": "DRONING HORROR", "cost": 1 },
    { "name": "ENERVATING ONSLAUGHT", "cost": 1 },
    { "name": "MYPHITIC INVIGORATION", "cost": 1 }
  ],
  //Tyranids
  "Invasion Fleet": [
    { "name": "RAPID REGENERATION", "cost": 1 },
    { "name": "ADRENAL SURGE", "cost": 2 },
    { "name": "DEATH FRENZY", "cost": 1 },
    { "name": "OVERRUN", "cost": 1 },
    { "name": "PREDATORY IMPERATIVE", "cost": 1 },
    { "name": "ENDLESS SWARM", "cost": 1 }
  ],

  "Crusher Stampede": [
    { "name": "CORROSIVE VISCERA", "cost": 1 },
    { "name": "RAMPAGING MONSTROSITIES", "cost": 1 },
    { "name": "SAVAGE ROAR", "cost": 1 },
    { "name": "UNTRAMMELLED FEROCITY", "cost": 1 },
    { "name": "SWARM-GUIDED SALVOES", "cost": 1 },
    { "name": "MASSIVE IMPACT", "cost": 1 }
  ],

  "Unending Swarm": [
    { "name": "SYNAPTIC GOADING", "cost": 1 },
    { "name": "UNENDING WAVES", "cost": 2 },
    { "name": "TEEMING MASSES", "cost": 1 },
    { "name": "SWARMING MASSES", "cost": 1 },
    { "name": "BOUNDING ADVANCE", "cost": 1 },
    { "name": "PRESERVATION IMPERATIVE", "cost": 1 }
  ],

  "Assimilation Swarm": [
    { "name": "BROODGUARD IMPULSE", "cost": 1 },
    { "name": "RECLAIM BIOMASS", "cost": 1 },
    { "name": "TYRANNOFORMED", "cost": 1 },
    { "name": "ABLATIVE CARAPACE", "cost": 2 },
    { "name": "SECURE BIOMASS", "cost": 1 },
    { "name": "RAPACIOUS HUNGER", "cost": 1 }
  ],

  "Vanguard Onslaught": [
    { "name": "SURPRISE ASSAULT", "cost": 1 },
    { "name": "ASSASSIN BEASTS", "cost": 1 },
    { "name": "SEEDED BROODS", "cost": 1 },
    { "name": "HYPERSENSORY SCILLIA", "cost": 2 },
    { "name": "UNSEEN LURKERS", "cost": 1 },
    { "name": "INVISIBLE HUNTER", "cost": 1 }
  ],

  "Synaptic Nexus": [
    { "name": "THE SMOTHERING SHADOW", "cost": 1 },
    { "name": "SYNAPTIC CHANNELLING", "cost": 1 },
    { "name": "IRRESISTIBLE WILL", "cost": 1 },
    { "name": "REINFORCED HIVE NODE", "cost": 1 },
    { "name": "IMPERATIVE DOMINANCE", "cost": 1 },
    { "name": "OVERRIDE INSTINCTS", "cost": 1 }
  ],

  "Subterranean Assault": [
    { "name": "ADAPTIVE OPTIMISATION", "cost": 1 },
    { "name": "REPLENISHING SWARMS", "cost": 1 },
    { "name": "ENFILADING EMERGENCE", "cost": 1 },
    { "name": "TUNNEL NETWORK", "cost": 1 },
    { "name": "SWARMING ASSAULT", "cost": 1 },
    { "name": "RETREAT BELOW", "cost": 1 }
  ],
  //goude mannen
  "Talons of the Emperor": [
    { "name": "HUNT AS ONE", "cost": 1 },
    { "name": "TALONS INTERLOCKED", "cost": 1 },
    { "name": "EMPYRIC SEVERANCE", "cost": 1 },
    { "name": "EMPEROR’S EXECUTIONERS", "cost": 2 },
    { "name": "TALONED PINCER", "cost": 1 },
    { "name": "SHIELD OF HONOUR", "cost": 1 }
  ],

  "Shield Host": [
    { "name": "ARCANE GENETIC ALCHEMY", "cost": 1 },
    { "name": "AVENGE THE FALLEN", "cost": 1 },
    { "name": "UNWAVERING SENTINELS", "cost": 1 },
    { "name": "MULTIPOTENTIALITY", "cost": 1 },
    { "name": "VIGILANCE ETERNAL", "cost": 1 },
    { "name": "ARCHEOTECH MUNITIONS", "cost": 1 }
  ],

  "Null Maiden Vigil": [
    { "name": "DESPERATION’S PRICE", "cost": 1 },
    { "name": "WITCH HUNTERS", "cost": 1 },
    { "name": "ANATHEMA BLADEMASTERY", "cost": 1 },
    { "name": "PSY-CHAFF VOLLEY", "cost": 1 },
    { "name": "PURGATION SWEEP", "cost": 1 },
    { "name": "PSYCHIC ABOMINATIONS", "cost": 1 }
  ],

  "Auric Champions": [
    { "name": "SLAYER OF CHAMPIONS", "cost": 1 },
    { "name": "SUPERHUMAN RESERVES", "cost": 2 },
    { "name": "THE EMPEROR’S AUSPICE", "cost": 1 },
    { "name": "EARNING OF A NAME", "cost": 1 },
    { "name": "VIGIL UNENDING", "cost": 2 },
    { "name": "SHOULDER THE MANTLE", "cost": 1 }
  ],

  "Solar Spearhead": [
    { "name": "FLAWLESS CONSTRUCTION", "cost": 1 },
    { "name": "EMPEROR’S VENGEANCE", "cost": 1 },
    { "name": "WRATHFUL ADVANCE", "cost": 1 },
    { "name": "UNSTOPPABLE", "cost": 1 },
    { "name": "RELENTLESS PERSECUTION", "cost": 1 },
    { "name": "PUNISHMENT INESCAPABLE", "cost": 1 }
  ],

  "Lions of the Emperor": [
    { "name": "GILDED CHAMPION", "cost": 1 },
    { "name": "DEFIANT TO THE LAST", "cost": 1 },
    { "name": "PEERLESS WARRIOR", "cost": 1 },
    { "name": "UNLEASH THE LIONS", "cost": 1 },
    { "name": "MANOEUVRE AND FIRE", "cost": 1 },
    { "name": "SWIFT AS THE EAGLE", "cost": 1 }
  ],
  //ork
  "War Horde": [
    { "name": "CAREEN!", "cost": 1 },
    { "name": "ORKS IS NEVER BEATEN", "cost": 2 },
    { "name": "UNBRIDLED CARNAGE", "cost": 1 },
    { "name": "’ARD AS NAILS", "cost": 1 },
    { "name": "MOB RULE", "cost": 1 },
    { "name": "ERE WE GO", "cost": 1 }
  ],

  "Da Big Hunt": [
    { "name": "DRAG IT DOWN", "cost": 1 },
    { "name": "UNSTOPPABLE MOMENTUM", "cost": 1 },
    { "name": "DAT ONE’S EVEN BIGGA!", "cost": 1 },
    { "name": "WHERE D’YA FINK YOU’RE GOING?", "cost": 1 },
    { "name": "STALKIN’ TAKTIKS", "cost": 1 },
    { "name": "INSTINCTIVE HUNTERS", "cost": 1 }
  ],

  "Kult of Speed": [
    { "name": "SPEEDIEST FREEKS", "cost": 1 },
    { "name": "SQUIG FLINGIN’", "cost": 1 },
    { "name": "DAKKASTORM", "cost": 1 },
    { "name": "BLITZA FIRE", "cost": 1 },
    { "name": "FULL THROTTLE!", "cost": 1 },
    { "name": "MORE GITZ OVER ’ERE!", "cost": 1 }
  ],

  "Dread Mob": [
    { "name": "KLANKIN’ KLAWS", "cost": 1 },
    { "name": "SUPERFUELLED BOILER", "cost": 1 },
    { "name": "BIGGER SHELLS FOR BIGGER GITZ", "cost": 1 },
    { "name": "DAKKA! DAKKA! DAKKA!", "cost": 1 },
    { "name": "CONNIVING RUNTS", "cost": 1 },
    { "name": "EXTRA GUBBINZ", "cost": 1 }
  ],

  "Green Tide": [
    { "name": "COMPETITIVE STREAK", "cost": 1 },
    { "name": "BULLDOZER BRUTALITY", "cost": 1 },
    { "name": "BRAGGIN’ RIGHTS", "cost": 1 },
    { "name": "COME ON LADZ!", "cost": 1 },
    { "name": "TIDE OF MUSCLE", "cost": 1 },
    { "name": "GO GET ’EM!", "cost": 1 }
  ],

  "Bully Boyz": [
    { "name": "ARMED TO DATEEF", "cost": 1 },
    { "name": "TOO ARROGANT TO DIE", "cost": 1 },
    { "name": "ALWAYS LOOKIN’ FER A FIGHT", "cost": 1 },
    { "name": "CRUSHING IMPACT", "cost": 1 },
    { "name": "CUT’EM DOWN", "cost": 1 },
    { "name": "HULKING BRUTES", "cost": 1 }
  ],

  "Taktikal Brigade": [
    { "name": "DAT’S OURS", "cost": 1 },
    { "name": "FIGHT PROPPA", "cost": 1 },
    { "name": "TAKTIKAL RETREAT", "cost": 1 },
    { "name": "KRUNCHIN’ DESCENT", "cost": 1 },
    { "name": "ON TO DA NEXT", "cost": 1 },
    { "name": "DED SNEAKY", "cost": 1 }
  ],

  "More Dakka!": [
    { "name": "ORKS IS STILL ORKS", "cost": 1 },
    { "name": "GET STUCK IN, LADZ!", "cost": 2 },
    { "name": "HUGE SHOW-OFFS", "cost": 1 },
    { "name": "LONG, UNCONTROLLED BURSTS", "cost": 1 },
    { "name": "SPESHUL SHELLS", "cost": 1 },
    { "name": "CALL DAT DAKKA?", "cost": 1 }
  ],

  "Freebooter Krew": [
    { "name": "BASH AND GRAB", "cost": 1 },
    { "name": "GRAB AND BASH", "cost": 1 },
    { "name": "BOARDIN’ RUSH", "cost": 1 },
    { "name": "DECK FRAGGERS", "cost": 1 },
    { "name": "ROLLING LOOT-HEAP", "cost": 1 },
    { "name": "KRUMP AND RUN", "cost": 1 }
  ],

  "Speedwaaagh!": [
    { "name": "ON DA MOVE", "cost": 1 },
    { "name": "MOBILE DAKKASTORM", "cost": 1 },
    { "name": "SPESHUL AMMO", "cost": 1 },
    { "name": "DED KILLY CONSTRUCTION", "cost": 1 },
    { "name": "DUST TRAILS", "cost": 1 },
    { "name": "EVASIVE MANOOVA", "cost": 1 }
  ],

  "Blitz Brigade": [
    { "name": "MOUNT UP, LADZ", "cost": 1 },
    { "name": "MEKANISED BRUTALITY", "cost": 1 },
    { "name": "RUN ’EM DOWN", "cost": 1 },
    { "name": "ARMOURED DUELLISTS", "cost": 1 },
    { "name": "IMPERVIOUS", "cost": 1 },
    { "name": "YOOZ IN TROUBLE NOW", "cost": 1 }
  ],
  //necorns
  "Awakened Dynasty": [
    { "name": "PROTOCOL OF THE ETERNAL REVENANT", "cost": 1 },
    { "name": "PROTOCOL OF THE UNDYING LEGIONS", "cost": 1 },
    { "name": "PROTOCOL OF THE HUNGRY VOID", "cost": 1 },
    { "name": "PROTOCOL OF THE SUDDEN STORM", "cost": 1 },
    { "name": "PROTOCOL OF THE CONQUERING TYRANT", "cost": 1 },
    { "name": "PROTOCOL OF THE VENGEFUL STARS", "cost": 2 }
  ],

  "Annihilation Legion": [
    { "name": "MASKS OF DEATH", "cost": 1 },
    { "name": "THE SPOOR OF FRAILTY", "cost": 1 },
    { "name": "MURDEROUS REANIMATION", "cost": 1 },
    { "name": "PITILESS HUNTERS", "cost": 1 },
    { "name": "BLOOD-FUELLED CRUELTY", "cost": 1 },
    { "name": "INSANITY’S IRE", "cost": 1 }
  ],

  "Canoptek Court": [
    { "name": "CURSE OF THE CRYPTEK", "cost": 1 },
    { "name": "CYNOSURE OF ERADICATION", "cost": 2 },
    { "name": "SOLAR PULSE", "cost": 1 },
    { "name": "REACTIVE SUBROUTINES", "cost": 1 },
    { "name": "COUNTERTEMPORAL SHIFT", "cost": 1 },
    { "name": "SUBOPTIMAL FACADE", "cost": 1 }
  ],

  "Obeisance Phalanx": [
    { "name": "YOUR TIME IS NIGH", "cost": 1 },
    { "name": "ENSLAVED ARTIFICE", "cost": 1 },
    { "name": "NANOASSEMBLY PROTOCOLS", "cost": 1 },
    { "name": "SENTINELS OF ETERNITY", "cost": 1 },
    { "name": "SUFFER NO RIVAL", "cost": 1 },
    { "name": "TERRITORIAL OBSESSION", "cost": 1 }
  ],

  "Hypercrypt Legion": [
    { "name": "HYPERPHASIC RECALL", "cost": 2 },
    { "name": "QUANTUM DEFLECTION", "cost": 1 },
    { "name": "REANIMATION CRYPTS", "cost": 1 },
    { "name": "COSMIC PRECISION", "cost": 1 },
    { "name": "DIMENSIONAL CORRIDOR", "cost": 2 },
    { "name": "ENTROPIC DAMPING", "cost": 1 }
  ],

  "Starshatter Arsenal": [
    { "name": "MERCILESS RECLAMATION", "cost": 2 },
    { "name": "UNYIELDING FORMS", "cost": 2 },
    { "name": "CHRONOSHIFT", "cost": 1 },
    { "name": "DIMENSIONAL TUNNEL", "cost": 1 },
    { "name": "ENDLESS SERVITUDE", "cost": 1 },
    { "name": "REACTIVE REPOSITION", "cost": 1 }
  ],

  "Cryptek Conclave": [
    { "name": "MOLECULAR TARGETING", "cost": 1 },
    { "name": "MICROSCARAB SWARM", "cost": 1 },
    { "name": "ANIMUS CURSE", "cost": 1 },
    { "name": "SYNERGISTIC EMPOWERMENT", "cost": 1 },
    { "name": "UNTAPPED POWER", "cost": 1 },
    { "name": "POTENTIALITY SYPHON", "cost": 1 }
  ],

  "Cursed Legion": [
    { "name": "METHODICAL MURDER", "cost": 1 },
    { "name": "IMAGE OF DEATH", "cost": 1 },
    { "name": "MORTIS PROTOCOLS", "cost": 1 },
    { "name": "DRIVEN TO BUTCHERY", "cost": 1 },
    { "name": "SPREADING MADNESS", "cost": 1 },
    { "name": "UNNATURAL AGGRESSION", "cost": 2 }
  ],

  "Pantheon of Woe": [
    { "name": "DISHARMONISATION CASCADE", "cost": 1 },
    { "name": "MOLECULAR EROSION", "cost": 1 },
    { "name": "MASS TRANSMOGRIFICATION", "cost": 1 },
    { "name": "ENTROPHASIC AURA TARGETING", "cost": 1 },
    { "name": "CHRONODISTORTION", "cost": 1 },
    { "name": "PHASE MELDING", "cost": 1 }
  ],
  //thousand suns
  "Grand Coven": [
    { "name": "PSYCHIC DOMINION", "cost": 1 },
    { "name": "DESTINED BY FATE", "cost": 1 },
    { "name": "EGOTISTICAL POWER", "cost": 1 },
    { "name": "DESECRATION OF WORLDS", "cost": 1 },
    { "name": "ARCANE FOCUS", "cost": 1 },
    { "name": "DEVASTATING SORCERY", "cost": 2 }
  ],

  "Changehost of Deceit": [
    { "name": "SULPHUROUS VEIL", "cost": 1 },
    { "name": "DECEPTIVE GLAMOUR", "cost": 2 },
    { "name": "ETHEREAL PHANTASM", "cost": 1 },
    { "name": "FRACTAL DISJUNCTION", "cost": 1 },
    { "name": "CHRONOSORCEROUS BLEED", "cost": 1 },
    { "name": "GLIMMERSHIFT PORTAL", "cost": 1 }
  ],

  "Warpmeld Pact": [
    { "name": "GIFT OF CHANGE", "cost": 1 },
    { "name": "WARPED VICISSITUDE", "cost": 1 },
    { "name": "DERANGED FEROCITY", "cost": 1 },
    { "name": "BLESSED TRANSMUTATIONS", "cost": 1 },
    { "name": "TOUCHED BY TZEENTCH", "cost": 1 },
    { "name": "TWISTED MIRAGE", "cost": 1 }
  ],

  "Rubricae Phalanx": [
    { "name": "ARDENT AUTOMATA", "cost": 1 },
    { "name": "INEXORABLE ADVANCE", "cost": 1 },
    { "name": "INFERNAL FUSILLADE", "cost": 2 },
    { "name": "REVENGE OF THE RUBRICAE", "cost": 1 },
    { "name": "IMPLACABLE GUARDIANS", "cost": 2 },
    { "name": "UNWAVERING PHALANX", "cost": 1 }
  ],

  "Warpforged Cabal": [
    { "name": "HEX-MARKED ARMOUR", "cost": 1 },
    { "name": "MUTATE LANDSCAPE", "cost": 1 },
    { "name": "CYBERSPIRIT MACHINATIONS", "cost": 1 },
    { "name": "MALEVOLENT ANIMUS", "cost": 1 },
    { "name": "ENSORCELLED INFUSION", "cost": 1 },
    { "name": "WARPFLAME GARGOYLES", "cost": 1 }
  ],

  "Hexwarp Thrallband": [
    { "name": "WARDING HEX", "cost": 1 },
    { "name": "WRATH OF THE DOOMED", "cost": 1 },
    { "name": "STRANDS OF TIME", "cost": 1 },
    { "name": "THROUGH THE VEIL", "cost": 1 },
    { "name": "SCOURING WARPFLAME", "cost": 1 },
    { "name": "KALEIDOSCOPIC TEMPEST", "cost": 1 }
  ],
  //death watch
  "Black Spear Task Force": [
    { "name": "ARMOUR OF CONTEMPT", "cost": 1 },
    { "name": "ADAPTIVE TACTICS", "cost": 1 },
    { "name": "HELLFIRE ROUNDS", "cost": 1 },
    { "name": "KRAKEN ROUNDS", "cost": 1 },
    { "name": "DRAGONFIRE ROUNDS", "cost": 1 },
    { "name": "SITE-TO-SITE TELEPORTATION", "cost": 1 }
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
    detachments: ["Annihilation Legion", "Awakened Dynasty", "Canoptek Court", "Hypercrypt Legion", "Obeisance Phalanx", "Starshatter Arsenal", "Cryptek Conclave", "Cursed Legion", "Pantheon of Woe"],
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
  },
  "Thousand Sons": {
    name: "Thousand Sons",
    detachments: ["Grand Coven","Changehost of Deceit","Warpmeld Pact","Rubricae Phalanx","Warpforged Cabal","Hexwarp Thrallband"],
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