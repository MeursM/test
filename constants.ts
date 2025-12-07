import { ArmyData, Stratagem } from './types';

export const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwCcCOQmj9xCok8lDbfNhgpe3JpxuoGXaEqrp2K_BcdKyJtPlwLKYslaV4S_NsT5M-1/exec';

export const PLAYERS = [
  "Dylan", "Michiel", "Stijn", "Maarten", "Sven", "Stef", "Steven"
];

export const MISSIONS = [
  "Hidden Supplies", "Burden of Trust", "Linchpin", "Purge the Foe",
  "Scorched Earth", "Supply Drop", "Take and Hold", "Terraform",
  "The Ritual", "Unexploded Ordnance"
];

export const SECONDARIES = [
  "A TEMPTING TARGET", "RECOVER ASSETS", "ASSASSINATION", "CULL THE HORDE",
  "BEHIND ENEMY LINES", "AREA DENIAL", "BRING IT DOWN", "CLEANSE",
  "DISPLAY OF MIGHT", "DEFEND STRONGHOLD", "ENGAGE ON ALL FRONTS",
  "ESTABLISH LOCUS", "EXTEND BATTLE LINES", "MARKED FOR DEATH",
  "NO PRISONERS", "OVERWHELMING FORCE", "SABOTAGE",
  "SECURE NO MAN'S LAND", "STORM HOSTILE OBJECTIVE"
];

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
    { name: "’ARD AS NAILS", cost: 1 },
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
  "Tau Empire": {
    name: "Tau Empire",
    detachments: ["Kauyon", "Mont’ka", "Retaliation Cadre", "Kroot Hunting Pack", "Auxiliary Cadre", "Experimental Prototype Cadre"],
    cpEarners: [{ name: "ETHEREAL COMMAND", cp: 1 }, { name: "KAU'YON", cp: 1 }, { name: "OTHER1", cp: 1 }]
  },
  "Death Guard": {
    name: "Death Guard",
    detachments: ["Virulent Vectorium", "Mortarion’s Hammer", "Champions of Contagion", "Tallyband Summoners", "Shamblerot Vectorium", "Death Lord’s Chosen", "Flyblown Host"],
    cpEarners: [{ name: "INEXORABLE ADVANCE", cp: 1 }, { name: "OTHER1", cp: 1 }]
  },
  "Adeptus Custodes": {
    name: "Adeptus Custodes",
    detachments: ["Auric Champions", "Lions of the Emperor", "Null Maiden Vigil", "Shield Host", "Solar Spearhead", "Talons of the Emperor"],
    cpEarners: [{ name: "SHIELD HOST TACTICS", cp: 1 }]
  },
  "Death Watch": {
    name: "Death Watch",
    detachments: ["1st Company Task Force", "Anvil Siege Force", "Black Spear Task Force", "Firestorm Assault Force", "Gladius Task Force", "Ironstorm Spearhead", "Librarius Conclave", "Stormlance Task Force", "Vanguard Spearhead"],
    cpEarners: [{ name: "Watch Master", cp: 1 }, { name: "Rites of Battle", cp: 1 }]
  },
  "Orks": {
    name: "Orks",
    detachments: ["Bully Boyz", "Da Big Hunt", "Dread Mob", "Green Tide", "Kult of Speed", "More Dakka!", "Taktikal Brigade", "War Horde"],
    cpEarners: [{ name: "OTHER1", cp: 1 }]
  },
  "Necrons": {
    name: "Necrons",
    detachments: ["Annihilation Legion", "Awakened Dynasty", "Canoptek Court", "Hypercrypt Legion", "Obeisance Phalanx", "Starshatter Arsenal"],
    cpEarners: [{ name: "OTHER1", cp: 1 }]
  },
  "Tyranids": {
    name: "Tyranids",
    detachments: ["Assimilation Swarm", "Crusher Stampede", "Invasion Fleet", "Subterranean Assault", "Synaptic Nexus", "Unending Swarm", "Vanguard Onslaught", "Warrior Bioform Onslaught"],
    cpEarners: [{ name: "OTHER1", cp: 1 }]
  }
};
// Add placeholder for other armies mentioned in the original code to avoid crashes if selected
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
            detachments: ["Index Detachment", "Special Task Force"], // Default placeholders
            cpEarners: [{name: "General Ability", cp: 1}]
        }
    }
});
