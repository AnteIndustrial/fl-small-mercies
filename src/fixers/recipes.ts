export class Recipe {
    name!: string;
    bones!: Ingredient[];
    type!: string;
    quality!: string;
    steps!: AssemblyStep[];
    //alternateSteps?: { [key: number]: AssemblyStep; }
    buyer?: string;
    payout?: string;
    exhaustion?: number;
    epa?: number;
}

export type AssemblyStep = AssemblyOption[];

export interface Ingredient {
    bone: BoneName;
    quantity: number;
    optional?: boolean;
}

export type SkeletonType = "Chimera" | "Primate" | "Bird" | "Amphibian" | "Reptile" | "Fish" | "Insect" | "Spider" | "Curator";

export type SkeletonQuality = "Antiquity" | "Amalgamy" | "Menace" | "NA";

export type BoneType = "Torso" | "Skull" | "Arm" | "Leg" | "Wing" | "Fin" | "Tentacle" | "Tail" | "Resource";

export const BONE_NAMES = ["Headless Skeleton", "Human Ribcage", "Thorned Ribcage", "Segmented Ribcage", "Skeleton with Seven Necks", "Flourishing Ribcage", "Mammoth Ribcage",
    "Ribcage with a Bouquet of Eight Spines", "Leviathan Frame", "Prismatic Frame", "Five Pointed Ribcage", "Glim-Encrusted Carapace",
    "Carved Ball of Stygian Ivory", "Rubbery Skull", "Horned Skull", "Pentagrammic Skull", "Counterfeit Head of John the Baptist", "Skull in Coral", "Plated Skull",
    "Eyeless Skull", "Doubled Skull", "Sabre-toothed Skull", "Bright Brass Skull", "Severed Chimaerical Head of the Vake", "A Custom-Engraved Skull", "Panoptical Skull", "Your Own Severed Head",
    "Crustacean Pincer", "Knotted Humerus", "Human Arm", "Ivory Humerus", "Fossilised Forelimb",
    "Femur of a Surface Deer", "Unidentified Thigh Bone", "Femur of a Jurassic Beast", "Helical Thighbone", "Holy Relic of the Thigh of Saint Fiacre", "Ivory Femur",
    "Bat Wing", "Wing of a Young Terror Bird", "Albatross Wing",
    "Fin Bones, Collected", "Amber-Crusted Fin",
    "Withered Tentacle",
    "Jet Black Stinger", "Plaster Tail Bones", "Tomb-Lion's Tail", "Obsidian Chitin Tail",
    "Nevercold Brass Sliver", "Knob of Scintillack"
] as const;

export type BoneName = typeof BONE_NAMES[number];

export interface Details {
    id: number,
    name: BoneName,
    type: BoneType;
    additionalCost?: { bone: BoneName, quantity: number; }[];
}


export const BoneDetails: Record<BoneName, Details> = {
    "Thorned Ribcage": { id: 140833, name: "Thorned Ribcage", type: "Torso" },
    "Ribcage with a Bouquet of Eight Spines": { id: 140844, name: "Ribcage with a Bouquet of Eight Spines", type: "Torso" },
    "Human Ribcage": { id: 140839, name: "Human Ribcage", type: "Torso" },
    "Bright Brass Skull": { id: 749, name: "Bright Brass Skull", type: "Skull", additionalCost: [{ bone: "Nevercold Brass Sliver", quantity: 200 }] },
    "Skull in Coral": { id: 141774, name: "Skull in Coral", type: "Skull", additionalCost: [{ bone: "Knob of Scintillack", quantity: 1 }] },
    "Nevercold Brass Sliver": { id: 387, name: "Nevercold Brass Sliver", type: "Resource" },
    "Helical Thighbone": { id: 141480, name: "Helical Thighbone", type: "Leg" },
    "Albatross Wing": { id: 140850, name: "Albatross Wing", type: "Wing" },
    "Knob of Scintillack": { id: 122495, name: "Knob of Scintillack", type: "Resource" },
    "Obsidian Chitin Tail": { id: 142727, name: "Obsidian Chitin Tail", type: "Tail" },
    "A Custom-Engraved Skull": { id: 136048, name: "A Custom-Engraved Skull", type: "Skull" },
    "Amber-Crusted Fin": { id: 141380, name: "Amber-Crusted Fin", type: "Fin" },
    "Bat Wing": { id: 140879, name: "Bat Wing", type: "Wing" },
    "Carved Ball of Stygian Ivory": { id: 122483, name: "Carved Ball of Stygian Ivory", type: "Skull" },
    "Counterfeit Head of John the Baptist": { id: 413, name: "Counterfeit Head of John the Baptist", type: "Skull" },
    "Crustacean Pincer": { id: 140880, name: "Crustacean Pincer", type: "Arm" },
    "Doubled Skull": { id: 141479, name: "Doubled Skull", type: "Skull" },
    "Eyeless Skull": { id: 23504, name: "Eyeless Skull", type: "Skull" },
    "Femur of a Jurassic Beast": { id: 140773, name: "Femur of a Jurassic Beast", type: "Leg" },
    "Femur of a Surface Deer": { id: 140771, name: "Femur of a Surface Deer", type: "Leg" },
    "Fin Bones, Collected": { id: 140852, name: "Fin Bones, Collected", type: "Fin" },
    "Five Pointed Ribcage": { id: 141640, name: "Five Pointed Ribcage", type: "Torso" },
    "Flourishing Ribcage": { id: 140840, name: "Flourishing Ribcage", type: "Torso" },
    "Fossilised Forelimb": { id: 141540, name: "Fossilised Forelimb", type: "Arm" },
    "Glim-Encrusted Carapace": { id: 145008, name: "Glim-Encrusted Carapace", type: "Torso" },
    "Headless Skeleton": { id: 140814, name: "Headless Skeleton", type: "Torso" },
    "Holy Relic of the Thigh of Saint Fiacre": { id: 140774, name: "Holy Relic of the Thigh of Saint Fiacre", type: "Leg" },
    "Horned Skull": { id: 141371, name: "Horned Skull", type: "Skull" },
    "Human Arm": { id: 140813, name: "Human Arm", type: "Arm" },
    "Ivory Femur": { id: 142351, name: "Ivory Femur", type: "Leg" },
    "Ivory Humerus": { id: 140849, name: "Ivory Humerus", type: "Arm" },
    "Jet Black Stinger": { id: 140883, name: "Jet Black Stinger", type: "Tail" },
    "Knotted Humerus": { id: 140772, name: "Knotted Humerus", type: "Arm" },
    "Leviathan Frame": { id: 140845, name: "Leviathan Frame", type: "Torso" },
    "Mammoth Ribcage": { id: 140843, name: "Mammoth Ribcage", type: "Torso" },
    "Panoptical Skull": { id: 145642, name: "Panoptical Skull", type: "Skull" },
    "Pentagrammic Skull": { id: 142298, name: "Pentagrammic Skull", type: "Skull" },
    "Plaster Tail Bones": { id: 140851, name: "Plaster Tail Bones", type: "Tail" },
    "Plated Skull": { id: 140882, name: "Plated Skull", type: "Skull" },
    "Prismatic Frame": { id: 140857, name: "Prismatic Frame", type: "Torso" },
    "Rubbery Skull": { id: 811, name: "Rubbery Skull", type: "Skull" },
    "Sabre-toothed Skull": { id: 140847, name: "Sabre-toothed Skull", type: "Skull" },
    "Segmented Ribcage": { id: 143548, name: "Segmented Ribcage", type: "Torso" },
    "Severed Chimaerical Head of the Vake": { id: 140721, name: "Severed Chimaerical Head of the Vake", type: "Skull" },
    "Skeleton with Seven Necks": { id: 140838, name: "Skeleton with Seven Necks", type: "Torso" },
    "Tomb-Lion's Tail": { id: 140881, name: "Tomb-Lion's Tail", type: "Tail" },
    "Unidentified Thigh Bone": { id: 140756, name: "Unidentified Thigh Bone", type: "Leg" },
    "Wing of a Young Terror Bird": { id: 141372, name: "Wing of a Young Terror Bird", type: "Wing" },
    "Withered Tentacle": { id: 140853, name: "Withered Tentacle", type: "Tentacle" },
    "Your Own Severed Head": { id: 127097, name: "Your Own Severed Head", type: "Skull" },
};

export const ASSEMBLY_OPTIONS = ["Add a Bat Wing to your (Skeleton Type)",
    "Add four more joints to your skeleton",
    "Add the Wing of a Young Terror Bird to your (Skeleton Type)",
    "Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)",
    "Affix a Bright Brass Skull to your (Skeleton Type)",
    "Affix a Custom-Engraved Skull to your (Skeleton Type)",
    "Affix a Doubled Skull to your (Skeleton Type)",
    "Affix a Horned Skull to your (Skeleton Type)",
    "Affix a Panoptical Skull to your (Skeleton Type)",
    "Affix a Pentagrammic Skull to your (Skeleton Type)",
    "Affix a Plated Skull to your (Skeleton Type)",
    "Affix a Rubbery Skull to your (Skeleton Type)",
    "Affix a Sabre-toothed Skull to your (Skeleton Type)",
    "Affix a Segmented Ribcage as the \"skull\"",
    "Affix a Skull in Coral to your (Skeleton Type)",
    "Affix an Eyeless Skull to your (Skeleton Type)",
    "Affix the Helical Thighbone to your (Skeleton Type)",
    "Apply Plaster Tail Bones to your (Skeleton Type)",
    "Apply a Crustacean Pincer to your (Skeleton Type)",
    "Apply a Fossilised Forelimb to your (Skeleton Type)",
    "Apply a Jet Black Stinger to your (Skeleton Type)",
    "Apply a Jurassic Thigh Bone to your (Skeleton Type)",
    "Apply a Knotted Humerus to your (Skeleton Type)",
    "Apply a Tomb-Lion's Tail to your (Skeleton Type)",
    "Apply a Withered Tentacle as a tail on your (Skeleton Type)",
    "Apply an Ivory Femur to your (Skeleton Type)",
    "Apply an Ivory Humerus to your (Skeleton Type)",
    "Apply an Obsidian Chitin Tail to your (Skeleton Type)",
    "Apply an Unidentified Thigh Bone to your (Skeleton Type)",
    "Apply the Femur of a Surface Deer to your (Skeleton Type)",
    "Attach the Amber-Crusted Fin to your (Skeleton Type)",
    "Break down your (Skeleton Type) for parts (Five-Pointed Ribcage)",
    "Break down your (Skeleton Type) for parts (Flourishing Ribcage)",
    "Break down your (Skeleton Type) for parts (Glim-Encrusted Carapace)",
    "Break down your (Skeleton Type) for parts (Headless Skeleton)",
    "Break down your (Skeleton Type) for parts (Human Ribcage)",
    "Break down your (Skeleton Type) for parts (Leviathan Frame)",
    "Break down your (Skeleton Type) for parts (Mammoth Ribcage)",
    "Break down your (Skeleton Type) for parts (Prismatic Frame)",
    "Break down your (Skeleton Type) for parts (Ribcage with a Bouquet of Eight Spines)",
    "Break down your (Skeleton Type) for parts (Segmented Ribcage)",
    "Break down your (Skeleton Type) for parts (Skeleton with Seven Necks)",
    "Break down your (Skeleton Type) for parts (Thorned Ribcage)",
    "Build on a Segmented Ribcage",
    "Build on the Five-Pointed Frame",
    "Build on the Flourishing Ribcage",
    "Build on the Human Ribcage",
    "Build on the Leviathan Frame",
    "Build on the Mammoth Ribcage",
    "Build on the Prismatic Frame",
    "Build on the Ribcage with the Eight Spines",
    "Build on the Skeleton with Seven Necks",
    "Cap this with a victim's skull",
    "Carve away some evidence of age",
    "Decide your (Skeleton Type) needs no tail",
    "Declare your (Skeleton Type) a completed Amphibian",
    "Declare your (Skeleton Type) a completed Ape",
    "Declare your (Skeleton Type) a completed Bird",
    "Declare your (Skeleton Type) a completed Chimera",
    "Declare your (Skeleton Type) a completed Curator",
    "Declare your (Skeleton Type) a completed Fish",
    "Declare your (Skeleton Type) a completed Humanoid",
    "Declare your (Skeleton Type) a completed Insect",
    "Declare your (Skeleton Type) a completed Monkey",
    "Declare your (Skeleton Type) a completed Reptile",
    "Declare your (Skeleton Type) a completed Spider",
    "Disguise the amalgamy of this piece",
    "Duplicate the Vake's skull and use it to decorate your (Skeleton Type)",
    "Duplicate the skull of John the Baptist, if you can call that a skull",
    "Duplicate your own skull and affix it here",
    "Extend the tail end with another Segmented Ribcage",
    "Join a Human Arm to your (Skeleton Type)",
    "Make something of your Glim-Encrusted Carapace",
    "Make something of your Thorned Ribcage",
    "Make your skeleton less dreadful",
    "Put Fins on your (Skeleton Type)",
    "Put a Withered Tentacle on your (Skeleton Type)",
    "Put an Albatross Wing on your (Skeleton Type)",
    "Reassemble your Headless Humanoid",
    "Remove the tail from your (Skeleton Type)",
    "Supply a skeleton of your own",
    "Use a Carved Ball of Stygian Ivory to cap off your (Skeleton Type)"] as const;

export type AssemblyOption = typeof ASSEMBLY_OPTIONS[number];

export const AssemblyOptionIDMap: Record<AssemblyOption, number> = {
    "Add a Bat Wing to your (Skeleton Type)": 242511,
    "Add four more joints to your skeleton": 242528,
    "Add the Wing of a Young Terror Bird to your (Skeleton Type)": 242541,
    "Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)": 242477,
    "Affix a Bright Brass Skull to your (Skeleton Type)": 242470,
    "Affix a Custom-Engraved Skull to your (Skeleton Type)": 242473,
    "Affix a Doubled Skull to your (Skeleton Type)": 242530,
    "Affix a Horned Skull to your (Skeleton Type)": 242525,
    "Affix a Panoptical Skull to your (Skeleton Type)": 268834,
    "Affix a Pentagrammic Skull to your (Skeleton Type)": 246422,
    "Affix a Plated Skull to your (Skeleton Type)": 242512,
    "Affix a Rubbery Skull to your (Skeleton Type)": 242471,
    "Affix a Sabre-toothed Skull to your (Skeleton Type)": 242487,
    "Affix a Segmented Ribcage as the \"skull\"": 255216,
    "Affix a Skull in Coral to your (Skeleton Type)": 243522,
    "Affix an Eyeless Skull to your (Skeleton Type)": 242472,
    "Affix the Helical Thighbone to your (Skeleton Type)": 242529,
    "Apply Plaster Tail Bones to your (Skeleton Type)": 242489,
    "Apply a Crustacean Pincer to your (Skeleton Type)": 242513,
    "Apply a Fossilised Forelimb to your (Skeleton Type)": 242536,
    "Apply a Jet Black Stinger to your (Skeleton Type)": 242534,
    "Apply a Jurassic Thigh Bone to your (Skeleton Type)": 242478,
    "Apply a Knotted Humerus to your (Skeleton Type)": 242480,
    "Apply a Tomb-Lion's Tail to your (Skeleton Type)": 242542,
    "Apply a Withered Tentacle as a tail on your (Skeleton Type)": 242510,
    "Apply an Ivory Femur to your (Skeleton Type)": 246962,
    "Apply an Ivory Humerus to your (Skeleton Type)": 245885,
    "Apply an Obsidian Chitin Tail to your (Skeleton Type)": 249843,
    "Apply an Unidentified Thigh Bone to your (Skeleton Type)": 242481,
    "Apply the Femur of a Surface Deer to your (Skeleton Type)": 242531,
    "Attach the Amber-Crusted Fin to your (Skeleton Type)": 244455,
    "Break down your (Skeleton Type) for parts (Five-Pointed Ribcage)": 246454,
    "Break down your (Skeleton Type) for parts (Flourishing Ribcage)": 242501,
    "Break down your (Skeleton Type) for parts (Glim-Encrusted Carapace)": 265592,
    "Break down your (Skeleton Type) for parts (Headless Skeleton)": 242483,
    "Break down your (Skeleton Type) for parts (Human Ribcage)": 242499,
    "Break down your (Skeleton Type) for parts (Leviathan Frame)": 242504,
    "Break down your (Skeleton Type) for parts (Mammoth Ribcage)": 242502,
    "Break down your (Skeleton Type) for parts (Prismatic Frame)": 242505,
    "Break down your (Skeleton Type) for parts (Ribcage with a Bouquet of Eight Spines)": 242503,
    "Break down your (Skeleton Type) for parts (Segmented Ribcage)": 242483,
    "Break down your (Skeleton Type) for parts (Skeleton with Seven Necks)": 242500,
    "Break down your (Skeleton Type) for parts (Thorned Ribcage)": 242486,
    "Build on a Segmented Ribcage": 255215,
    "Build on the Five-Pointed Frame": 246417,
    "Build on the Flourishing Ribcage": 242492,
    "Build on the Human Ribcage": 242491,
    "Build on the Leviathan Frame": 242495,
    "Build on the Mammoth Ribcage": 242493,
    "Build on the Prismatic Frame": 242496,
    "Build on the Ribcage with the Eight Spines": 242494,
    "Build on the Skeleton with Seven Necks": 242490,
    "Cap this with a victim's skull": 242527,
    "Carve away some evidence of age": 242533,
    "Decide your (Skeleton Type) needs no tail": 242479,
    "Declare your (Skeleton Type) a completed Amphibian": 242518,
    "Declare your (Skeleton Type) a completed Ape": 242484,
    "Declare your (Skeleton Type) a completed Bird": 242519,
    "Declare your (Skeleton Type) a completed Chimera": 242474,
    "Declare your (Skeleton Type) a completed Curator": 242523,
    "Declare your (Skeleton Type) a completed Fish": 242520,
    "Declare your (Skeleton Type) a completed Humanoid": 242475,
    "Declare your (Skeleton Type) a completed Insect": 242522,
    "Declare your (Skeleton Type) a completed Monkey": 242485,
    "Declare your (Skeleton Type) a completed Reptile": 242517,
    "Declare your (Skeleton Type) a completed Spider": 242521,
    "Disguise the amalgamy of this piece": 242537,
    "Duplicate the Vake's skull and use it to decorate your (Skeleton Type)": 242524,
    "Duplicate the skull of John the Baptist, if you can call that a skull": 242540,
    "Duplicate your own skull and affix it here": 242539,
    "Extend the tail end with another Segmented Ribcage": 255217,
    "Join a Human Arm to your (Skeleton Type)": 242482,
    "Make something of your Glim-Encrusted Carapace": 265586,
    "Make something of your Thorned Ribcage": 242469,
    "Make your skeleton less dreadful": 242538,
    "Put Fins on your (Skeleton Type)": 242508,
    "Put a Withered Tentacle on your (Skeleton Type)": 242509,
    "Put an Albatross Wing on your (Skeleton Type)": 242507,
    "Reassemble your Headless Humanoid": 242468,
    "Remove the tail from your (Skeleton Type)": 242532,
    "Supply a skeleton of your own": 242526,
    "Use a Carved Ball of Stygian Ivory to cap off your (Skeleton Type)": 242498
};

export const recipeMap = new Map<string, Recipe>([
    ["Amalgamy Bird 1 Exhaustion", {
        "name": "Amalgamy Bird 1 Exhaustion",
        "bones": [
            { "bone": "Thorned Ribcage", "quantity": 1 },
            { "bone": "Bright Brass Skull", "quantity": 1 },
            { "bone": "Helical Thighbone", "quantity": 2 },
            { "bone": "Albatross Wing", "quantity": 2 },
            { "bone": "Withered Tentacle", "quantity": 1, optional: true }
        ],
        "buyer": "A Tentacled Entrepreneur",
        "type": "Bird",
        "quality": "Amalgamy",
        "payout": "227-249 MoDS + 196-238 FB; 213.07-245.4 Echoes",
        "exhaustion": 1,
        "epa": 7.48,
        "steps": [
            ["Make something of your Thorned Ribcage"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix the Helical Thighbone to your (Skeleton Type)"],
            ["Affix the Helical Thighbone to your (Skeleton Type)"],
            ["Put an Albatross Wing on your (Skeleton Type)"],
            ["Put an Albatross Wing on your (Skeleton Type)"],
            ["Apply a Withered Tentacle as a tail on your (Skeleton Type)", "Decide your (Skeleton Type) needs no tail"],
            ["Declare your (Skeleton Type) a completed Bird"]
        ]
        //alternateSteps: { 6: "Decide your (Skeleton Type) needs no tail" }
    }],
    ["Amalgamy Bomb", {
        "name": "Amalgamy Bomb",
        "bones": [
            { "bone": "Ribcage with a Bouquet of Eight Spines", "quantity": 1 },
            { "bone": "Skull in Coral", "quantity": 8 },
            { "bone": "Helical Thighbone", "quantity": 2 },
            { "bone": "Albatross Wing", "quantity": 2 },
            { "bone": "Obsidian Chitin Tail", "quantity": 1 }
        ],
        "buyer": "A Tentacled Entrepreneur",
        "type": "Bird",
        "quality": "Amalgamy",
        "payout": "1080 MoDS + 3166 FB; 2148.33 Echoes",
        "exhaustion": 23,
        "epa": 13.47,
        "steps": [
            ["Build on the Ribcage with the Eight Spines"],
            ["Affix a Skull in Coral to your (Skeleton Type)"],
            ["Affix a Skull in Coral to your (Skeleton Type)"],
            ["Affix a Skull in Coral to your (Skeleton Type)"],
            ["Affix a Skull in Coral to your (Skeleton Type)"],
            ["Affix a Skull in Coral to your (Skeleton Type)"],
            ["Affix a Skull in Coral to your (Skeleton Type)"],
            ["Affix a Skull in Coral to your (Skeleton Type)"],
            ["Affix a Skull in Coral to your (Skeleton Type)"],
            ["Affix the Helical Thighbone to your (Skeleton Type)"],
            ["Affix the Helical Thighbone to your (Skeleton Type)"],
            ["Put an Albatross Wing on your (Skeleton Type)"],
            ["Put an Albatross Wing on your (Skeleton Type)"],
            ["Apply an Obsidian Chitin Tail to your (Skeleton Type)"],
            ["Declare your (Skeleton Type) a completed Bird"]
        ]
    }],
    ["Amalgamy Reptile 1 Exhaustion", {
        "name": "Amalgamy Reptile 1 Exhaustion",
        "bones": [
            { "bone": "Thorned Ribcage",  "quantity": 1 },
            { "bone": "Bright Brass Skull", "quantity": 1 },
            { "bone": "Knotted Humerus", "quantity": 2 },
            { "bone": "Helical Thighbone",  "quantity": 2 },
            { "bone": "Withered Tentacle", "quantity": 1, optional: true }
        ],
        "buyer": "A Tentacled Entrepreneur",
        "type": "Reptile",
        "quality": "Amalgamy",
        "payout": "189-207 MoDS + 196-238 FB; 194.07-224.4 Echoes",
        "exhaustion": 1,
        "epa": 8.02,
        "steps": [
            ["Make something of your Thorned Ribcage"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix the Helical Thighbone to your (Skeleton Type)"],
            ["Affix the Helical Thighbone to your (Skeleton Type)"],
            ["Apply a Knotted Humerus to your (Skeleton Type)"],
            ["Apply a Knotted Humerus to your (Skeleton Type)"],
            ["Apply a Withered Tentacle as a tail on your (Skeleton Type)", "Decide your (Skeleton Type) needs no tail"],
            ["Declare your (Skeleton Type) a completed Reptile"]
        ]
        //alternateSteps: { 6: "Decide your (Skeleton Type) needs no tail" }
    }],
    ["Amalgamy Primate 1 Exhaustion", {
        "name": "Amalgamy Primate 1 Exhaustion",
        "bones": [
            { "bone": "Thorned Ribcage", "quantity": 1 },
            { "bone": "Bright Brass Skull", "quantity": 1 },
            { "bone": "Knotted Humerus", "quantity": 2 },
            { "bone": "Helical Thighbone", "quantity": 2 }
        ],
        "buyer": "A Tentacled Entrepreneur",
        "type": "Primate",
        "quality": "Amalgamy",
        "payout": "",
        "exhaustion": 1,
        "epa": 7.93,
        "steps": [
            ["Make something of your Thorned Ribcage"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix the Helical Thighbone to your (Skeleton Type)"],
            ["Affix the Helical Thighbone to your (Skeleton Type)"],
            ["Apply a Knotted Humerus to your (Skeleton Type)"],
            ["Apply a Knotted Humerus to your (Skeleton Type)"],
            ["Decide your (Skeleton Type) needs no tail"],
            ["Declare your (Skeleton Type) a completed Humanoid"]
        ]
    }],
    ["Amalgamy Amphibian 1 Exhaustion", {
        "name": "Amalgamy Amphibian 1 Exhaustion",
        "bones": [
            { "bone": "Thorned Ribcage", "quantity": 1 },
            { "bone": "Bright Brass Skull", "quantity": 1 },
            { "bone": "Helical Thighbone", "quantity": 3 },
            { "bone": "Unidentified Thigh Bone", "quantity": 1 }
        ],
        "buyer": "A Tentacled Entrepreneur",
        "type": "Amphibian",
        "quality": "Amalgamy",
        "payout": "",
        "exhaustion": 1,
        "epa": 7.81,
        "steps": [
            ["Make something of your Thorned Ribcage"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix the Helical Thighbone to your (Skeleton Type)"],
            ["Affix the Helical Thighbone to your (Skeleton Type)"],
            ["Affix the Helical Thighbone to your (Skeleton Type)"],
            ["Apply an Unidentified Thigh Bone to your (Skeleton Type)"],
            ["Decide your (Skeleton Type) needs no tail"],
            ["Declare your (Skeleton Type) a completed Amphibian"]
        ]
    }],
    ["Menacing Bird 1 Exhaustion", {
        "name": "Menacing Bird 1 Exhaustion",
        "bones": [
            { "bone": "Thorned Ribcage", "quantity": 1 },
            { "bone": "Horned Skull", "quantity": 1 },
            { "bone": "Wing of a Young Terror Bird", "quantity": 2 },
            { "bone": "Unidentified Thigh Bone", "quantity": 2 },
            { "bone": "Jet Black Stinger", "quantity": 1 }
        ],
        "buyer": "A Teller of Terrors",
        "type": "Bird",
        "quality": "Menace",
        "payout": "",
        "exhaustion": 1,
        "epa": 8.65,
        "steps": [
            ["Make something of your Thorned Ribcage"],
            ["Affix a Horned Skull to your (Skeleton Type)"],
            ["Add the Wing of a Young Terror Bird to your (Skeleton Type)"],
            ["Add the Wing of a Young Terror Bird to your (Skeleton Type)"],
            ["Apply an Unidentified Thigh Bone to your (Skeleton Type)"],
            ["Apply an Unidentified Thigh Bone to your (Skeleton Type)"],
            ["Apply a Jet Black Stinger to your (Skeleton Type)"],
            ["Declare your (Skeleton Type) a completed Bird"]
        ]
    }],
    ["Menacing Fish 1 Exhaustion", {
        "name": "Menacing Fish 1 Exhaustion",
        "bones": [
            { "bone": "Thorned Ribcage", "quantity": 1 },
            { "bone": "Horned Skull", "quantity": 1 },
            { "bone": "Amber-Crusted Fin", "quantity": 4 },
            { "bone": "Withered Tentacle", "quantity": 1, optional: true }
        ],
        "buyer": "A Teller of Terrors",
        "type": "Fish",
        "quality": "Menace",
        "payout": "",
        "exhaustion": 1,
        "epa": 8.08,
        "steps": [
            ["Make something of your Thorned Ribcage"],
            ["Affix a Horned Skull to your (Skeleton Type)"],
            ["Attach the Amber-Crusted Fin to your (Skeleton Type)"],
            ["Attach the Amber-Crusted Fin to your (Skeleton Type)"],
            ["Attach the Amber-Crusted Fin to your (Skeleton Type)"],
            ["Attach the Amber-Crusted Fin to your (Skeleton Type)"],
            ["Apply a Withered Tentacle as a tail on your (Skeleton Type)", "Decide your (Skeleton Type) needs no tail"],
            ["Declare your (Skeleton Type) a completed Fish"]
        ]
        //alternateSteps: { 6: "Decide your (Skeleton Type) needs no tail" }
    }],
    ["Menacing Fish 1 Exhaustion", {
        "name": "Antique Reptile 1 Exhaustion",
        "bones": [
            { "bone": "Mammoth Ribcage", "quantity": 1 },
            { "bone": "Bright Brass Skull", "quantity": 1 },
            { "bone": "Femur of a Jurassic Beast", "quantity": 4 },
            { "bone": "Tomb-Lion's Tail", "quantity": 1 }
        ],
        "buyer": "An Investment-Minded Ambassador",
        "type": "Reptile",
        "quality": "Antiquity",
        "payout": "",
        "exhaustion": 1,
        "epa": 7.24,
        "steps": [
            ["Build on the Mammoth Ribcage"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Apply a Tomb-Lion's Tail to your (Skeleton Type)"],
            ["Declare your (Skeleton Type) a completed Reptile"]
        ]
    }],
    ["Antique Amphibian 1 Exhaustion", {
        "name": "Antique Amphibian 1 Exhaustion",
        "bones": [
            { "bone": "Mammoth Ribcage", "quantity": 1 },
            { "bone": "Sabre-toothed Skull", "quantity": 1 },
            { "bone": "Femur of a Jurassic Beast", "quantity": 4 }
        ],
        "buyer": "An Investment-Minded Ambassador",
        "type": "Amphibian",
        "quality": "Antiquity",
        "payout": "",
        "exhaustion": 1,
        "epa": 6.97,
        "steps": [
            ["Build on the Mammoth Ribcage"],
            ["Affix a Sabre-toothed Skull to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Decide your (Skeleton Type) needs no tail"],
            ["Declare your (Skeleton Type) a completed Amphibian"]
        ]
    }],
    ["Antique Bird 1 Exhaustion", {
        "name": "Antique Bird 1 Exhaustion",
        "bones": [
            { "bone": "Mammoth Ribcage", "quantity": 1 },
            { "bone": "Sabre-toothed Skull", "quantity": 1 },
            { "bone": "Femur of a Jurassic Beast", "quantity": 2 },
            { "bone": "Wing of a Young Terror Bird", "quantity": 2 },
            { "bone": "Plaster Tail Bones", "quantity": 1, optional: true }
        ],
        "buyer": "An Investment-Minded Ambassador",
        "type": "Bird",
        "quality": "Antiquity",
        "payout": "",
        "exhaustion": 1,
        "epa": 6.78,
        "steps": [
            ["Build on the Mammoth Ribcage"],
            ["Affix a Sabre-toothed Skull to your (Skeleton Type)"],
            ["Add the Wing of a Young Terror Bird to your (Skeleton Type)"],
            ["Add the Wing of a Young Terror Bird to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Apply Plaster Tail Bones to your (Skeleton Type)", "Decide your (Skeleton Type) needs no tail"],
            ["Declare your (Skeleton Type) a completed Bird"]
        ]
        //alternateSteps: { 6: "Decide your (Skeleton Type) needs no tail" }
    }],
    ["Antique Primate 1 Exhaustion", {
        "name": "Antique Primate 1 Exhaustion",
        "bones": [
            { "bone": "Human Ribcage", "quantity": 1 },
            { "bone": "Sabre-toothed Skull", "quantity": 1 },
            { "bone": "Femur of a Jurassic Beast", "quantity": 2 },
            { "bone": "Fossilised Forelimb", "quantity": 2 }
        ],
        "buyer": "An Investment-Minded Ambassador",
        "type": "Primate",
        "quality": "Antiquity",
        "payout": "",
        "exhaustion": 1,
        "epa": 6.45,
        "steps": [
            ["Build on the Human Ribcage"],
            ["Affix a Sabre-toothed Skull to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Apply a Jurassic Thigh Bone to your (Skeleton Type)"],
            ["Apply a Fossilised Forelimb to your (Skeleton Type)"],
            ["Apply a Fossilised Forelimb to your (Skeleton Type)"],
            ["Decide your (Skeleton Type) needs no tail"],
            ["Declare your (Skeleton Type) a completed Humanoid"]
        ]
    }]
]);

