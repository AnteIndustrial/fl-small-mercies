export class Recipe {
    name!: string;
    bones!: Ingredient[];
    type!: SkeletonType;
    quality!: SkeletonQuality[];
    steps!: AssemblyStep[];
    mania!: SkeletonMania[];
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

export type SkeletonType = "Chimera" | "Primate" | "Bird" | "Amphibian" | "Reptile" | "Fish" | "Insect" | "Spider" | "Curator"; //replace primate with humanoid, ape, monkey?

export type SkeletonMania = "Primates" | "Birds" | "Amphibians" | "Reptiles" | "Fish" | "Insects" | "Arachnids" | "NA";

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
    "Nevercold Brass Sliver", "Knob of Scintillack", "Nodule of Trembling Amber", "Nodule of Warm Amber", "Jade Fragment"
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
    "Jade Fragment": { id: 377, name: "Jade Fragment", type: "Resource" },
    "Jet Black Stinger": { id: 140883, name: "Jet Black Stinger", type: "Tail" },
    "Knotted Humerus": { id: 140772, name: "Knotted Humerus", type: "Arm" },
    "Leviathan Frame": { id: 140845, name: "Leviathan Frame", type: "Torso" },
    "Mammoth Ribcage": { id: 140843, name: "Mammoth Ribcage", type: "Torso" },
    "Nodule of Trembling Amber": { id: 949, name: "Nodule of Trembling Amber", type: "Resource" },
    "Nodule of Warm Amber": { id: 328, name: "Nodule of Warm Amber", type: "Resource" },
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

interface AssemblyOptionDetails {
    name: AssemblyOption;
    id: number,
    cost: Ingredient[];
    prerequisite?: string;
    skill?: { name: string, level: string; };
    //if I track skeleton value, that would go here
}

export const AssemblyDetails: Record<AssemblyOption, AssemblyOptionDetails> = {
    "Add a Bat Wing to your (Skeleton Type)": { name: "Add a Bat Wing to your (Skeleton Type)", id: 242511, cost: [{ "bone": "Bat Wing", "quantity": 1 }], skill: { name: "Monstrous Anatomy", level: "5 + 2 * fin" } },
    "Add four more joints to your skeleton": { name: "Add four more joints to your skeleton", id: 242528, cost: [{ "bone": "Nodule of Trembling Amber", "quantity": 1 }, { "bone": "Nodule of Warm Amber", quantity: 25 /* 25*joints^2 */ }], skill: { name: "Shapeling Arts", level: "12" } },
    "Add the Wing of a Young Terror Bird to your (Skeleton Type)": { name: "Add the Wing of a Young Terror Bird to your (Skeleton Type)", id: 242541, cost: [{ "bone": "Wing of a Young Terror Bird", "quantity": 1 }] },
    "Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)": { name: "Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)", id: 242477, cost: [{ "bone": "Holy Relic of the Thigh of Saint Fiacre", "quantity": 1 }] },
    "Affix a Bright Brass Skull to your (Skeleton Type)": { name: "Affix a Bright Brass Skull to your (Skeleton Type)", id: 242470, cost: [{ "bone": "Bright Brass Skull", "quantity": 1 }, { bone: "Nevercold Brass Sliver", quantity: 200 }] },
    "Affix a Custom-Engraved Skull to your (Skeleton Type)": { name: "Affix a Custom-Engraved Skull to your (Skeleton Type)", id: 242473, cost: [{ "bone": "A Custom-Engraved Skull", "quantity": 1 }] },
    "Affix a Doubled Skull to your (Skeleton Type)": { name: "Affix a Doubled Skull to your (Skeleton Type)", id: 242530, cost: [{ "bone": "Doubled Skull", "quantity": 1 }] },
    "Affix a Horned Skull to your (Skeleton Type)": { name: "Affix a Horned Skull to your (Skeleton Type)", id: 242525, cost: [{ "bone": "Horned Skull", "quantity": 1 }] },
    "Affix a Panoptical Skull to your (Skeleton Type)": { name: "Affix a Panoptical Skull to your (Skeleton Type)", id: 268834, cost: [{ "bone": "Panoptical Skull", "quantity": 1 }] },
    "Affix a Pentagrammic Skull to your (Skeleton Type)": { name: "Affix a Pentagrammic Skull to your (Skeleton Type)", id: 246422, cost: [{ "bone": "Pentagrammic Skull", "quantity": 1 }] },
    "Affix a Plated Skull to your (Skeleton Type)": { name: "Affix a Plated Skull to your (Skeleton Type)", id: 242512, cost: [{ "bone": "Plated Skull", "quantity": 1 }] },
    "Affix a Rubbery Skull to your (Skeleton Type)": { name: "Affix a Rubbery Skull to your (Skeleton Type)", id: 242471, cost: [{ "bone": "Rubbery Skull", "quantity": 1 }] },
    "Affix a Sabre-toothed Skull to your (Skeleton Type)": { name: "Affix a Sabre-toothed Skull to your (Skeleton Type)", id: 242487, cost: [{ "bone": "Sabre-toothed Skull", "quantity": 1 }] },
    "Affix a Segmented Ribcage as the \"skull\"": { name: "Affix a Segmented Ribcage as the \"skull\"", id: 255216, cost: [{ "bone": "Segmented Ribcage", "quantity": 1 }] },
    "Affix a Skull in Coral to your (Skeleton Type)": { name: "Affix a Skull in Coral to your (Skeleton Type)", id: 243522, cost: [{ "bone": "Skull in Coral", "quantity": 1 }, { bone: "Knob of Scintillack", quantity: 1 }] },
    "Affix an Eyeless Skull to your (Skeleton Type)": { name: "Affix an Eyeless Skull to your (Skeleton Type)", id: 242472, cost: [{ "bone": "Eyeless Skull", "quantity": 1 }] },
    "Affix the Helical Thighbone to your (Skeleton Type)": { name: "Affix the Helical Thighbone to your (Skeleton Type)", id: 242529, cost: [{ "bone": "Helical Thighbone", "quantity": 1 }] },
    "Apply Plaster Tail Bones to your (Skeleton Type)": { name: "Apply Plaster Tail Bones to your (Skeleton Type)", id: 242489, cost: [{ "bone": "Plaster Tail Bones", "quantity": 1 }] },
    "Apply a Crustacean Pincer to your (Skeleton Type)": { name: "Apply a Crustacean Pincer to your (Skeleton Type)", id: 242513, cost: [{ "bone": "Crustacean Pincer", "quantity": 1 }] },
    "Apply a Fossilised Forelimb to your (Skeleton Type)": { name: "Apply a Fossilised Forelimb to your (Skeleton Type)", id: 242536, cost: [{ "bone": "Fossilised Forelimb", "quantity": 1 }] },
    "Apply a Jet Black Stinger to your (Skeleton Type)": { name: "Apply a Jet Black Stinger to your (Skeleton Type)", id: 242534, cost: [{ "bone": "Jet Black Stinger", "quantity": 1 }] },
    "Apply a Jurassic Thigh Bone to your (Skeleton Type)": { name: "Apply a Jurassic Thigh Bone to your (Skeleton Type)", id: 242478, cost: [{ "bone": "Femur of a Jurassic Beast", "quantity": 1 }] },
    "Apply a Knotted Humerus to your (Skeleton Type)": { name: "Apply a Knotted Humerus to your (Skeleton Type)", id: 242480, cost: [{ "bone": "Knotted Humerus", "quantity": 1 }] },
    "Apply a Tomb-Lion's Tail to your (Skeleton Type)": { name: "Apply a Tomb-Lion's Tail to your (Skeleton Type)", id: 242542, cost: [{ "bone": "Tomb-Lion's Tail", "quantity": 1 }] },
    "Apply a Withered Tentacle as a tail on your (Skeleton Type)": { name: "Apply a Withered Tentacle as a tail on your (Skeleton Type)", id: 242510, cost: [{ "bone": "Withered Tentacle", "quantity": 1 }] },
    "Apply an Ivory Femur to your (Skeleton Type)": { name: "Apply an Ivory Femur to your (Skeleton Type)", id: 246962, cost: [{ "bone": "Ivory Femur", "quantity": 1 }] },
    "Apply an Ivory Humerus to your (Skeleton Type)": { name: "Apply an Ivory Humerus to your (Skeleton Type)", id: 245885, cost: [{ "bone": "Ivory Humerus", "quantity": 1 }] },
    "Apply an Obsidian Chitin Tail to your (Skeleton Type)": { name: "Apply an Obsidian Chitin Tail to your (Skeleton Type)", id: 249843, cost: [{ "bone": "Obsidian Chitin Tail", "quantity": 1 }] },
    "Apply an Unidentified Thigh Bone to your (Skeleton Type)": { name: "Apply an Unidentified Thigh Bone to your (Skeleton Type)", id: 242481, cost: [{ "bone": "Unidentified Thigh Bone", "quantity": 1 }] },
    "Apply the Femur of a Surface Deer to your (Skeleton Type)": { name: "Apply the Femur of a Surface Deer to your (Skeleton Type)", id: 242531, cost: [{ "bone": "Femur of a Surface Deer", "quantity": 1 }] },
    "Attach the Amber-Crusted Fin to your (Skeleton Type)": { name: "Attach the Amber-Crusted Fin to your (Skeleton Type)", id: 244455, cost: [{ "bone": "Amber-Crusted Fin", "quantity": 1 }] },
    "Break down your (Skeleton Type) for parts (Five-Pointed Ribcage)": { name: "Break down your (Skeleton Type) for parts (Five-Pointed Ribcage)", id: 246454, cost: [] },
    "Break down your (Skeleton Type) for parts (Flourishing Ribcage)": { name: "Break down your (Skeleton Type) for parts (Flourishing Ribcage)", id: 242501, cost: [] },
    "Break down your (Skeleton Type) for parts (Glim-Encrusted Carapace)": { name: "Break down your (Skeleton Type) for parts (Glim-Encrusted Carapace)", id: 265592, cost: [] },
    "Break down your (Skeleton Type) for parts (Headless Skeleton)": { name: "Break down your (Skeleton Type) for parts (Headless Skeleton)", id: 242483, cost: [] },
    "Break down your (Skeleton Type) for parts (Human Ribcage)": { name: "Break down your (Skeleton Type) for parts (Human Ribcage)", id: 242499, cost: [] },
    "Break down your (Skeleton Type) for parts (Leviathan Frame)": { name: "Break down your (Skeleton Type) for parts (Leviathan Frame)", id: 242504, cost: [] },
    "Break down your (Skeleton Type) for parts (Mammoth Ribcage)": { name: "Break down your (Skeleton Type) for parts (Mammoth Ribcage)", id: 242502, cost: [] },
    "Break down your (Skeleton Type) for parts (Prismatic Frame)": { name: "Break down your (Skeleton Type) for parts (Prismatic Frame)", id: 242505, cost: [] },
    "Break down your (Skeleton Type) for parts (Ribcage with a Bouquet of Eight Spines)": { name: "Break down your (Skeleton Type) for parts (Ribcage with a Bouquet of Eight Spines)", id: 242503, cost: [] },
    "Break down your (Skeleton Type) for parts (Segmented Ribcage)": { name: "Break down your (Skeleton Type) for parts (Segmented Ribcage)", id: 242483, cost: [] },
    "Break down your (Skeleton Type) for parts (Skeleton with Seven Necks)": { name: "Break down your (Skeleton Type) for parts (Skeleton with Seven Necks)", id: 242500, cost: [] },
    "Break down your (Skeleton Type) for parts (Thorned Ribcage)": { name: "Break down your (Skeleton Type) for parts (Thorned Ribcage)", id: 242486, cost: [] },
    "Build on a Segmented Ribcage": { name: "Build on a Segmented Ribcage", id: 255215, cost: [{ "bone": "Segmented Ribcage", "quantity": 1 }] },
    "Build on the Five-Pointed Frame": { name: "Build on the Five-Pointed Frame", id: 246417, cost: [{ "bone": "Five Pointed Ribcage", "quantity": 1 }] },
    "Build on the Flourishing Ribcage": { name: "Build on the Flourishing Ribcage", id: 242492, cost: [{ "bone": "Flourishing Ribcage", "quantity": 1 }] },
    "Build on the Human Ribcage": { name: "Build on the Human Ribcage", id: 242491, cost: [{ "bone": "Human Ribcage", "quantity": 1 }] },
    "Build on the Leviathan Frame": { name: "Build on the Leviathan Frame", id: 242495, cost: [{ "bone": "Leviathan Frame", "quantity": 1 }] },
    "Build on the Mammoth Ribcage": { name: "Build on the Mammoth Ribcage", id: 242493, cost: [{ "bone": "Mammoth Ribcage", "quantity": 1 }] },
    "Build on the Prismatic Frame": { name: "Build on the Prismatic Frame", id: 242496, cost: [{ "bone": "Prismatic Frame", "quantity": 1 }] },
    "Build on the Ribcage with the Eight Spines": { name: "Build on the Ribcage with the Eight Spines", id: 242494, cost: [{ "bone": "Ribcage with a Bouquet of Eight Spines", "quantity": 1 }] },
    "Build on the Skeleton with Seven Necks": { name: "Build on the Skeleton with Seven Necks", id: 242490, cost: [{ "bone": "Skeleton with Seven Necks", "quantity": 1 }] },
    "Cap this with a victim's skull": { name: "Cap this with a victim's skull", id: 242527, cost: [], prerequisite: "A List of Aliases, Writ in Gant" },
    "Carve away some evidence of age": { name: "Carve away some evidence of age", id: 242533, cost: [], prerequisite: "Scrimshander Carving Knife" },
    "Decide your (Skeleton Type) needs no tail": { name: "Decide your (Skeleton Type) needs no tail", id: 242479, cost: [] },
    "Declare your (Skeleton Type) a completed Amphibian": { name: "Declare your (Skeleton Type) a completed Amphibian", id: 242518, cost: [], prerequisite: "A Complete Account of Frogs, Toads, and Other Croaking Beasts" },
    "Declare your (Skeleton Type) a completed Ape": { name: "Declare your (Skeleton Type) a completed Ape", id: 242484, cost: [] },
    "Declare your (Skeleton Type) a completed Bird": { name: "Declare your (Skeleton Type) a completed Bird", id: 242519, cost: [], prerequisite: "Comprehensive Study of Avian Anatomies, Oneiric and Otherwise" },
    "Declare your (Skeleton Type) a completed Chimera": { name: "Declare your (Skeleton Type) a completed Chimera", id: 242474, cost: [] },
    "Declare your (Skeleton Type) a completed Curator": { name: "Declare your (Skeleton Type) a completed Curator", id: 242523, cost: [] },
    "Declare your (Skeleton Type) a completed Fish": { name: "Declare your (Skeleton Type) a completed Fish", id: 242520, cost: [], prerequisite: "Unexpurgated Accounting of the Anatomies of Aquatic Life-forms" },
    "Declare your (Skeleton Type) a completed Humanoid": { name: "Declare your (Skeleton Type) a completed Humanoid", id: 242475, cost: [] },
    "Declare your (Skeleton Type) a completed Insect": { name: "Declare your (Skeleton Type) a completed Insect", id: 242522, cost: [], prerequisite: "Survey of Arachnids and Insects Native to the Neath and Unterzee" },
    "Declare your (Skeleton Type) a completed Monkey": { name: "Declare your (Skeleton Type) a completed Monkey", id: 242485, cost: [] },
    "Declare your (Skeleton Type) a completed Reptile": { name: "Declare your (Skeleton Type) a completed Reptile", id: 242517, cost: [], prerequisite: "A Complete Account of Frogs, Toads, and Other Croaking Beasts" },
    "Declare your (Skeleton Type) a completed Spider": { name: "Declare your (Skeleton Type) a completed Spider", id: 242521, cost: [], prerequisite: "Survey of Arachnids and Insects Native to the Neath and Unterzee" },
    "Disguise the amalgamy of this piece": { name: "Disguise the amalgamy of this piece", id: 242537, cost: [{ "bone": "Jade Fragment", "quantity": 25 }], prerequisite: "Lithification Liquid" },
    "Duplicate the Vake's skull and use it to decorate your (Skeleton Type)": { name: "Duplicate the Vake's skull and use it to decorate your (Skeleton Type)", id: 242524, cost: [{ "bone": "Severed Chimaerical Head of the Vake", "quantity": 1 }] },
    "Duplicate the skull of John the Baptist, if you can call that a skull": { name: "Duplicate the skull of John the Baptist, if you can call that a skull", id: 242540, cost: [{ "bone": "Counterfeit Head of John the Baptist", "quantity": 1 }] },
    "Duplicate your own skull and affix it here": { name: "Duplicate your own skull and affix it here", id: 242539, cost: [{ "bone": "Your Own Severed Head", "quantity": 1 }] },
    "Extend the tail end with another Segmented Ribcage": { name: "Extend the tail end with another Segmented Ribcage", id: 255217, cost: [{ "bone": "Segmented Ribcage", "quantity": 1 }] },
    "Join a Human Arm to your (Skeleton Type)": { name: "Join a Human Arm to your (Skeleton Type)", id: 242482, cost: [{ "bone": "Human Arm", "quantity": 1 }] },
    "Make something of your Glim-Encrusted Carapace": { name: "Make something of your Glim-Encrusted Carapace", id: 265586, cost: [{ "bone": "Glim-Encrusted Carapace", "quantity": 1 }] },
    "Make something of your Thorned Ribcage": { name: "Make something of your Thorned Ribcage", id: 242469, cost: [{ "bone": "Thorned Ribcage", "quantity": 1 }] },
    "Make your skeleton less dreadful": { name: "Make your skeleton less dreadful", id: 242538, cost: [], prerequisite: "Patent Osteological Sand and Wax" },
    "Put Fins on your (Skeleton Type)": { name: "Put Fins on your (Skeleton Type)", id: 242508, cost: [{ "bone": "Fin Bones, Collected", "quantity": 1 }] },
    "Put a Withered Tentacle on your (Skeleton Type)": { name: "Put a Withered Tentacle on your (Skeleton Type)", id: 242509, cost: [{ "bone": "Withered Tentacle", "quantity": 1 }] },
    "Put an Albatross Wing on your (Skeleton Type)": { name: "Put an Albatross Wing on your (Skeleton Type)", id: 242507, cost: [{ "bone": "Albatross Wing", "quantity": 1 }] },
    "Reassemble your Headless Humanoid": { name: "Reassemble your Headless Humanoid", id: 242468, cost: [{ "bone": "Headless Skeleton", "quantity": 1 }] },
    "Remove the tail from your (Skeleton Type)": { name: "Remove the tail from your (Skeleton Type)", id: 242532, cost: [], prerequisite: "Ravenglass Knife" },
    "Supply a skeleton of your own": { name: "Supply a skeleton of your own", id: 242526, cost: [], prerequisite: "A List of Aliases, Writ in Gant" },
    "Use a Carved Ball of Stygian Ivory to cap off your (Skeleton Type)": { name: "Use a Carved Ball of Stygian Ivory to cap off your (Skeleton Type)", id: 242498, cost: [{ "bone": "Carved Ball of Stygian Ivory", "quantity": 1 }] }
}

type AssemblyOption2 = { name: AssemblyOption; cost?: Ingredient[]; prerequisite?: string; }

type AssemblyStep2 = AssemblyOption2[]

export class Recipe2 {
    name!: string;
    type!: SkeletonType;
    quality!: SkeletonQuality[];
    steps!: AssemblyStep2[];
    mania!: SkeletonMania[];
    buyer?: string;
    payout?: string;
    exhaustion?: number;
    epa?: number;
}

export const recipeMap2 = new Map<string, Recipe2>([
    ["Amalgamy Bird 1 Exhaustion", {
        "name": "Amalgamy Bird 1 Exhaustion",
        "buyer": "A Tentacled Entrepreneur",
        "type": "Bird",
        "mania": ["Birds"],
        "quality": ["Amalgamy"],
        "payout": "227-249 MoDS + 196-238 FB; 213.07-245.4 Echoes",
        "exhaustion": 1,
        "epa": 7.48,
        "steps": [
            [{ name: "Make something of your Thorned Ribcage", cost: [{ "bone": "Thorned Ribcage", "quantity": 1 }]}],
            [{ name: "Affix a Bright Brass Skull to your (Skeleton Type)", cost: [{ "bone": "Bright Brass Skull", "quantity": 1 } ]}],
            [{ name: "Affix the Helical Thighbone to your (Skeleton Type)"}],
            [{ name: "Affix the Helical Thighbone to your (Skeleton Type)"}],
            [{ name: "Put an Albatross Wing on your (Skeleton Type)"}],
            [{ name: "Put an Albatross Wing on your (Skeleton Type)"}],
            [{ name: "Apply a Withered Tentacle as a tail on your (Skeleton Type)" }, { name: "Decide your (Skeleton Type) needs no tail"}],
            [{ name: "Declare your (Skeleton Type) a completed Bird"}]
        ]
    }]
])

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
        "mania": ["Birds"],
        "quality": ["Amalgamy"],
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
        "mania": ["Birds"],
        "quality": ["Amalgamy"],
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
        "mania": ["Reptiles", "Fish", "Arachnids", "Insects"],
        "quality": ["Amalgamy"],
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
        "mania": ["Primates"],
        "quality": ["Amalgamy"],
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
        "mania": ["Amphibians"],
        "quality": ["Amalgamy"],
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
        "mania": ["Birds", "Amphibians", "Reptiles", "Insects", "Arachnids"],
        "quality": ["Menace"],
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
        "mania": ["Fish"],
        "quality": ["Menace"],
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
    }],
    ["Menacing Primate 1 Exhaustion", {
        "name": "Menacing Primate 1 Exhaustion",
        "bones": [
            { "bone": "Thorned Ribcage", "quantity": 1 },
            { "bone": "Horned Skull", "quantity": 1 },
            { "bone": "Ivory Humerus", "quantity": 2 },
            { "bone": "Crustacean Pincer", "quantity": 2 },
            { "bone": "Jet Black Stinger" , "quantity": 1}
        ],
        "buyer": "A Teller of Terrors",
        "type": "Primate",
        "mania": ["Primates", "Amphibians", "Reptiles", "Insects", "Arachnids"],
        "quality": ["Menace"],
        "payout": "184.5 echoes",
        "exhaustion": 1,
        "epa": 6.52,
        "steps": [
            ["Make something of your Thorned Ribcage"],
            ["Affix a Horned Skull to your (Skeleton Type)"],
            ["Apply an Ivory Humerus to your (Skeleton Type)"],
            ["Apply an Ivory Humerus to your (Skeleton Type)"],
            ["Apply a Crustacean Pincer to your (Skeleton Type)"],
            ["Apply a Crustacean Pincer to your (Skeleton Type)"],
            ["Apply a Jet Black Stinger to your (Skeleton Type)"],
            ["Declare your (Skeleton Type) a completed Monkey"],
        ]
    }],
    ["Antique Reptile 1 Exhaustion", {
        "name": "Antique Reptile 1 Exhaustion",
        "bones": [
            { "bone": "Mammoth Ribcage", "quantity": 1 },
            { "bone": "Bright Brass Skull", "quantity": 1 },
            { "bone": "Femur of a Jurassic Beast", "quantity": 4 },
            { "bone": "Tomb-Lion's Tail", "quantity": 1 }
        ],
        "buyer": "An Investment-Minded Ambassador",
        "type": "Reptile",
        "mania": ["Reptiles"],
        "quality": ["Antiquity"],
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
        "mania": ["Amphibians", "Fish", "Insects", "Arachnids"],
        "quality": ["Antiquity"],
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
        "mania": ["Birds"],
        "quality": ["Antiquity"],
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
        "mania": ["Primates"],
        "quality": ["Antiquity"],
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
    }],
    ["Roof Pope", {
        "name": "Roof Pope",
        "bones": [
            { "bone": "Glim-Encrusted Carapace", "quantity": 1 },
            { "bone": "Carved Ball of Stygian Ivory", "quantity": 1 },
            { "bone": "Holy Relic of the Thigh of Saint Fiacre", "quantity": 8 }
        ],
        "buyer": "Bohemian Sculptress",
        "type": "Spider",
        "mania": ["Arachnids"],
        "quality": ["NA"],
        "payout": "79 Preserved Surface Blooms, 40 Rumours, 297.5 echoes",
        "exhaustion": 0,
        "epa": 6.34,
        "steps": [
            ["Make something of your Glim-Encrusted Carapace"],
            ["Use a Carved Ball of Stygian Ivory to cap off your (Skeleton Type)"],
            ["Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)"],
            ["Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)"],
            ["Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)"],
            ["Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)"],
            ["Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)"],
            ["Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)"],
            ["Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)"],
            ["Affix Saint Fiacre's Thigh Relic to your (Skeleton Type)"],
            ["Declare your (Skeleton Type) a completed Spider"]
        ]
    }],
    ["Prismatic Walrus", {
        "name": "Prismatic Walrus",
        "bones": [
            { "bone": "Prismatic Frame", "quantity": 1 },
            { "bone": "Sabre-toothed Skull", "quantity": 1 },
            { "bone": "Carved Ball of Stygian Ivory", "quantity": 2 },
            { "bone": "Amber-Crusted Fin", "quantity": 3 }
        ],
        "buyer": "Author of Gothic Tales",
        "type": "Fish",
        "mania": ["Fish"],
        "quality": ["Menace", "Antiquity"],
        "payout": "983 Scrip, 14 Carved Balls of Stygian Ivory, 534.92 Echoes",
        "exhaustion": 0,
        "steps": [
            ["Build on the Prismatic Frame"],
            ["Affix a Sabre-toothed Skull to your (Skeleton Type)"],
            ["Use a Carved Ball of Stygian Ivory to cap off your (Skeleton Type)"],
            ["Use a Carved Ball of Stygian Ivory to cap off your (Skeleton Type)"],
            ["Attach the Amber-Crusted Fin to your (Skeleton Type)"],
            ["Attach the Amber-Crusted Fin to your (Skeleton Type)"],
            ["Attach the Amber-Crusted Fin to your (Skeleton Type)"],
            ["Declare your (Skeleton Type) a completed Fish"]
        ]
    }],
    ["Brass Lollipop", {
        "name": "Brass Lollipop",
        "bones": [
            { "bone": "Bright Brass Skull", "quantity": 1 },
            { "bone": "Headless Skeleton", "quantity": 1, "optional": true }
        ],
        "buyer": "a Theologian of the Old School",
        "type": "Primate",
        "mania": ["Primates"],
        "quality": ["NA"],
        "payout": "34 Crates of Biscuits, 170 scrip",
        "exhaustion": 0,
        "epa": 5.5,
        "steps": [
            ["Reassemble your Headless Humanoid", "Supply a skeleton of your own"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Declare your (Skeleton Type) a completed Humanoid"]
        ]
    }],
    ["7 Headed Identity Uncoverer", {
        "name": "7 Headed Identity Uncoverer",
        "bones": [
            { "bone": "Bright Brass Skull", "quantity": 7 },
            { "bone": "Skeleton with Seven Necks", "quantity": 1 },
            { "bone": "Albatross Wing" , "quantity": 2}
        ],
        "buyer": "Balmoral Dumbwaiter",
        "type": "Bird",
        "mania": ["NA"],
        "quality": ["NA"],
        "payout": "217 Identity Uncovered, 542.5 echoes",
        "exhaustion": 0,
        "epa": 4.88,
        "steps": [
            ["Build on the Skeleton with Seven Necks"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Put an Albatross Wing on your (Skeleton Type)"],
            ["Put an Albatross Wing on your (Skeleton Type)"],
            ["Declare your (Skeleton Type) a completed Bird"]
        ]
    }],
    ["Bombazine Fish", {
        "name": "Bombazine Fish",
        "bones": [
            { "bone": "Bright Brass Skull", "quantity": 1 },
            { "bone": "Leviathan Frame", "quantity": 1 },
            { "bone": "Amber-Crusted Fin", "quantity": 2 }
        ],
        "buyer": "A Naive Collector",
        "type": "Fish",
        "mania": ["Fish"],
        "quality": ["NA"],
        "payout": "187 Thirsty Bombazine Scrap, 467.5 echoes",
        "exhaustion": 0,
        "epa": 5.3,
        "steps": [
            ["Build on the Leviathan Frame"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Attach the Amber-Crusted Fin to your (Skeleton Type)"],
            ["Attach the Amber-Crusted Fin to your (Skeleton Type)"],
            ["Declare your (Skeleton Type) a completed Fish"]
        ]
    }],
    ["Bone Generator Bird", {
        "name": "Bone Generator Bird",
        "bones": [
            { "bone": "Bright Brass Skull", "quantity": 7 },
            { "bone": "Skeleton with Seven Necks", "quantity": 1 },
            { "bone": "Albatross Wing", "quantity": 2 }
        ],
        "buyer": "A Palaeontologist with Hoarding Propensities",
        "type": "Bird",
        "mania": ["Birds"],
        "quality": ["NA"],
        "payout": "59680 Bone Fragments, 2 Unearthly Fossil.",
        "exhaustion": 0,
        "epa": 5.41,
        "steps": [
            ["Build on the Skeleton with Seven Necks"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Affix a Bright Brass Skull to your (Skeleton Type)"],
            ["Put an Albatross Wing on your (Skeleton Type)"],
            ["Put an Albatross Wing on your (Skeleton Type)"],
            ["Declare your (Skeleton Type) a completed Bird"]
        ]
    }]
]);

