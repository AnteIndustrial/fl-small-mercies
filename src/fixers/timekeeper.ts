/* eslint-disable no-prototype-builtins */
import { IMutationAware, INetworkAware, IStateAware } from "./base";
import { SettingsObject } from "../settings";
import { GameStateController, GameState } from "../game_state";
import { getSingletonByClassName } from "../utils";
import { MSG_TYPE_SAVE_SETTINGS, MSG_TYPE_UPDATE_SETTINGS, MSG_TYPE_WIKI_API_CALL, MSG_TYPE_WIKI_API_RESPONSE } from "../constants";
import { sendToServiceWorker } from "../comms";
import { WikiResult } from "../wiki";
import { FLApiInterceptor } from "../api_interceptor";


const MILLISECONDS_IN_MINUTE = 60 * 1000;
const MILLISECONDS_IN_HOUR = 60 * MILLISECONDS_IN_MINUTE;
const MILLISECONDS_IN_DAY = 24 * MILLISECONDS_IN_HOUR;
const SEVEN_DAYS_IN_MILLISECONDS = 7 * MILLISECONDS_IN_DAY;
// Sometimes "living story" events do not trigger strictly on the hour,
// so it is good to give them some leeway.
const EVENT_TRIGGER_LEEWAY = 10 * MILLISECONDS_IN_MINUTE;
const BALMORAL_GIFT_BRANCH_IDS = [243583, 243592, 243600] as const;
const KHANATE_REPORT_BRANCH_IDS = [250681] as const;
const WELLSPRING_BRANCH_IDS = [244785, 244786] as const;
const WASWOOD_CALENDAR_BRANCH_IDS = [254769, 254764, 254597, 254763, 254765, 254599, 254598, 254767, 254768, 234347, 254844, 254842, 234348, 254510, 254511, 224801, 254843] as const;
const CHIMES_BOONS_BRANCH_IDS = [261036, 261037, 261025, 261029, 261030, 261031, 261032, 261033, 261034, 261035] as const;
const CHIMES_BOONS_BRANCHES: Record<number, string> = {
    261036: "A Remarkable Tolerance for Your Eccentric Behaviour",
    261037: "A Remarkable Reluctance to Observe Your Misdeeds",
    261025: "A Machiavellian Mien",
    261029: "A Pseudoscientific Seeming",
    261030: "A Reflective Reputation",
    261031: "A Poisonous Prestige",
    261032: "A Generous Guise",
    261033: "A Cryptoanatomical Celebrity",
    261034: "A Protean Prominence",
    261035: "A Zalty Ztature"
} as const;//calling Object.keys() on this returns string keys. swapping key/value means using values to look up key. Duplicating key list seemed the best option.

interface LivingStory { ids: readonly number[], story: string, timer: number; };
const LIVING_STORY_NAMES = ["livingStoryBookBoon", "livingStoryAstronomerMap", "livingStoryNavalOfficerMap", "livingStoryClayManMap", "livingStoryMrCups", "livingStoryMrHearts",
    "livingStoryMarigold", "livingStoryHighwayman", "livingStoryDilmun", "livingStoryCalmer", "livingStoryTutorial", "livingStoryRoseInBurrow", "livingStoryClara",
    "livingStoryPristineEgg", "livingStoryNextBout",  "livingStoryAirship", "livingStoryRatkind", "livingStoryMatterAtHome", "livingStoryDeparture", "livingStoryRaven", "livingStoryEfficient", "livingStoryRegimental",
    "livingStoryMissive", "livingStoryInvitation", "livingStoryArdour", "livingStoryMinting", "livingStoryWhitsun", "livingStoryEscape", "livingStoryChristmas"] as const
type LivingStoryName = typeof LIVING_STORY_NAMES[number];//todo station 8 master airship
const MISC_LIVING_STORIES: Record<LivingStoryName, LivingStory> = {
    livingStoryBookBoon: { ids: [263646, 263647, 263648, 263645], story: "Another Volume for the Library", timer: SEVEN_DAYS_IN_MILLISECONDS },
    livingStoryAstronomerMap: {  ids: [9650, 9651], story: "The Enterprising Astronomer's Gift", timer: 2 * MILLISECONDS_IN_DAY },
    livingStoryNavalOfficerMap: { ids: [9448, 9449], story: "The Disgruntled Naval Officer's Gift", timer: 2 * MILLISECONDS_IN_DAY },
    livingStoryClayManMap: { ids: [9647, 9648], story: "The Masked Clay Man's Gift", timer: 2 * MILLISECONDS_IN_DAY },
    livingStoryMrCups: { ids: [235721], story: "An Invitation from Mr Cups", timer: MILLISECONDS_IN_DAY },
    livingStoryMrHearts: { ids: [240193, 240200], story: "Mr Hearts' Congratulations", timer: MILLISECONDS_IN_DAY },
    livingStoryMarigold: { ids: [244394, 244395], story: "A Missive from Marigold", timer: SEVEN_DAYS_IN_MILLISECONDS },
    livingStoryHighwayman: { ids: [247112, 247109, 247111, 247511, 247110], story: "The Fate of the Clay Highwayman (Living Story)", timer: MILLISECONDS_IN_DAY },
    livingStoryDilmun: { ids: [9756, 9757, 9758], story: "A meeting of the Dilmun Club", timer: MILLISECONDS_IN_DAY },
    livingStoryCalmer: { ids: [5636, 5639, 5637, 5638, 5634, 5635, 5632, 5633], story: "You're calmer now.", timer: MILLISECONDS_IN_HOUR }, //todo 5498 and 5485, but only on a rare success
    livingStoryTutorial: { ids: [4401, 258747, 4402, 119565], story: "Tutorial: Social Engagements", timer: MILLISECONDS_IN_DAY },
    livingStoryRoseInBurrow: { ids: [260400, 260679, 260401], story: "The Rose in Burrow", timer: 2 * MILLISECONDS_IN_DAY },
    livingStoryClara: { ids: [238909, 238944, 238122, 238073, 238077, 238078, 238072, 238076, 238075, 238079], story: "Weeks have passed since you last saw Clara", timer: MILLISECONDS_IN_DAY },
    livingStoryPristineEgg: { ids: [41166, 119377], story: "Your Pristine Raven's Egg is hatching!", timer: MILLISECONDS_IN_DAY },
    livingStoryNextBout: { ids: [239468, 239462], story: "Waiting for the Next Bout", timer: MILLISECONDS_IN_DAY },
    livingStoryAirship: { ids: [265642, 265643], story: "Your Airship, under construction", timer: SEVEN_DAYS_IN_MILLISECONDS },
    livingStoryRatkind: { ids: [128567, 128568], story: "A Legend Among Ratkind (Living Story)", timer: 2 * MILLISECONDS_IN_DAY },
    livingStoryMatterAtHome: { ids: [237941, 237940], story: "Attending to a Matter at Home", timer: MILLISECONDS_IN_DAY }, //missing id for 'introduce your friend'
    livingStoryDeparture: { ids: [245936, 245568, 245563], story: "The Master's Departure", timer: MILLISECONDS_IN_DAY },
    livingStoryRaven: { ids: [40919], story: "A Raven's triumphant return!", timer: MILLISECONDS_IN_DAY },
    livingStoryEfficient: { ids: [], story: "An Invitation from the Efficient Commissioner", timer: MILLISECONDS_IN_DAY }, //missing ids
    livingStoryRegimental: { ids: [260678], story: "A Regimental Rose", timer: MILLISECONDS_IN_DAY },
    livingStoryMissive: { ids: [260398], story: "A Missive, on a Rose", timer: MILLISECONDS_IN_DAY },
    livingStoryInvitation: { ids: [240114], story: "An Invitation From Mister Hearts", timer: MILLISECONDS_IN_DAY },
    livingStoryArdour: { ids: [266863, 266862, 266860, 266864, 266865, 266866], story: "Oenophilic Ardour", timer: MILLISECONDS_IN_DAY },
    livingStoryMinting: { ids: [250116], story: "A Minting, Completed", timer: MILLISECONDS_IN_DAY },
    livingStoryWhitsun: { ids: [238693], story: "Your Whitsun Egg is Hatching!", timer: 23 * MILLISECONDS_IN_HOUR },
    livingStoryEscape: { ids: [235720], story: "A Clean Escape?", timer: MILLISECONDS_IN_DAY },
    livingStoryChristmas: { ids: [262517], story: "Dissipating Goodwill", timer: 2 * SEVEN_DAYS_IN_MILLISECONDS }
} as const

const MESSAGE_STRINGS = {
    KHANATE_MESSAGE: "You can pick up a new report from your agent",
    BALMORAL_MESSAGE: "Things change in Balmoral. The railway brings trade, resources, opportunities.",
    TTH_MESSAGE: "Memory fades; pain departs; rewards arrive!",
} as const;

const DAYS = { SUNDAY: 0, MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6 } as const;


const RattyDemands = ["ALWAYS", "SAINTLY_DEMAND", "SOFT_DEMAND", "TEMPESTUOUS_DEMAND", "INSCRUTABLE_DEMAND", "INTRICATE_DEMAND", "MAUDLIN_DEMAND", "CALCULATING_DEMAND", "RUINOUS_DEMAND"] as const;
type RattyDemand = typeof RattyDemands[number];
const RAT_MARKET_BUYING: Record<RattyDemand, readonly RatItem[]> = {
    ALWAYS: [{ id: 142797, name: "Fourth-City Echo", price: 125 }],
    SAINTLY_DEMAND: [{ id: 123214, name: "Ratty Reliquary", price: 125 }, { id: 142249, name: "False Hagiotoponym", price: 625 }],
    SOFT_DEMAND: [{ id: 924, name: "Parabola-Linen Scrap", price: 625 }, { id: 925, name: "Scrap of Ivory Organza", price: 3125 }],
    TEMPESTUOUS_DEMAND: [{ id: 849, name: "Storm-Threnody", price: 125 }, { id: 933, name: "Night-Whisper", price: 625 }],
    INSCRUTABLE_DEMAND: [{ id: 812, name: "Uncanny Incunabulum", price: 125 }, { id: 142448, name: "Chimerical Archive", price: 625 }, { id: 141189, name: "Cartographer's Hoard", price: 3125 }],
    INTRICATE_DEMAND: [{ id: 141946, name: "Unlawful Device", price: 125 }, { id: 142840, name: "Crackling Device", price: 625}],
    MAUDLIN_DEMAND: [{ id: 142386, name: "Captivating Ballad", price: 625 }, { id: 142463, name: "Parabolan Parable", price: 3125 }],
    CALCULATING_DEMAND: [{ id: 122489, name: "Vital Intelligence", price: 125 }, { id: 140970 /* and 140971*/, name: "Queen Mate and Epaulette Mate Pairs", price: 500 }, { id: 142793, name: "Corresponding Sounder", price: 3125 }],
    RUINOUS_DEMAND: [{ id: 141882, name: "Mortification of a Great Power", price: 625 }, { id: 814, name: "Dreadful Surmise", price: 3125 }, { id: 141764, name: "Distillation of Retribution", price: 3125}]
} as const;


const ratItemNames = ["WATCH", "UMBRELLA", "PIECE", "CANE", "TIARA", "LENGUALS", "SMOCK", "VAKEBOOTS", "AMBER", "IRRIGO", "GOGGLES", "CINDER", "SKULL",
    "STARSTONE", "COMPENDIUM", "FROCK", "SUIT", "SECRET", "SOUL", "SLIPPERS", "EDICTS", "LEGENDA", "LOCATION", "GLOVES", "TEARS", "GANT",
    "WADERS", "HAIRS", "CATALOGUE", "KNIFE" ] as const;
type RatItemName = typeof ratItemNames[number];
const RAT_MARKET_ITEMS: Record<RatItemName, RatItem> = {
    WATCH: { id: 655, name: "Ratwork Watch", price: 3200 },
    UMBRELLA: { id: 729, name: "Poison-tipped Umbrella", price: 3200 },
    PIECE: { id: 143128, name: "Ratwork Pocket Piece", price: 3200 },
    CANE: { id: 143129, name: "Rat's-Head Cane", price: 3200 },
    TIARA: { id: 21845, name: "Fecund Amber Tiara", price: 2800 },
    LENGUALS: { id: 21848, name: "Pair of Lenguals", price: 2800 },
    SMOCK: { id: 21895, name: "Smock of Four Thousand Three Hundred and Eight Pockets", price: 2800 },
    VAKEBOOTS: { id: 364, name: "Pair of Vakeskin Boots", price: 2800 },
    AMBER: { id: 16308, name: "Nodule of Fecund Amber", price: 3125 },
    IRRIGO: { id: 142711, name: "Irrigo-filled Mirrorcatch Box", price: 3500 },
    GOGGLES: { id: 23901, name: "Pair of Irrigo Goggles", price: 2000 },
    CINDER: { id: 1053, name: "Ray-Drenched Cinder", price: 3125 },
    SKULL: { id: 23504, name: "Eyeless Skull", price: 625 },
    STARSTONE: { id: 936, name: "Starstone Demark", price: 3125 },
    COMPENDIUM: { id: 931, name: "Intriguer's Compendium", price: 3125 },
    FROCK: { id: 23897, name: "Strange-Shore Parabola Frock", price: 5000 },
    SUIT: { id: 23898, name: "Strange-Shore Parabola Suit", price: 5000 },
    SECRET: { id: 14975, name: "Elemental Secret", price: 3125 },
    SOUL: { id: 669, name: "Coruscating Soul", price: 3125 },
    SLIPPERS: { id: 23902, name: "Pair of Forgotten Spidersilk Slippers", price: 3000 },
    EDICTS: { id: 142087, name: "Edicts of the First City", price: 3125 },
    LEGENDA: { id: 142295, name: "Legenda Cosmogone", price: 3125 },
    LOCATION: { id: 929, name: "Reported Location of a One-Time Prince of Hell", price: 15625 },
    GLOVES: { id: 143130, name: "Stainless Gloves", price: 4000 },
    TEARS: { id: 12350, name: "Vial of Tears of the Bazaar", price: 3125 },
    GANT: { id: 142712, name: "Gant-filled Mirrorcatch Box", price: 3750 },
    WADERS: { id: 143131, name: "Venge-Rat Waders", price: 10000 },
    HAIRS: { id: 143303, name: "Seven of St Eligius' Very Own Beard Hairs", price: 10000 },
    CATALOGUE: { id: 143415, name: "False-Star Catalogue", price: 10000 },
    KNIFE: { id: 143625, name: "Leviathan-Bone Knife", price: 10000 }
} as const;


const ratWinds = ["East", "South", "West", "North"] as const;
type RatWind = typeof ratWinds[number];
const ratMoons = ["Blue", "Soft", "Hard", "Runny"] as const;
type RatMoon = typeof ratMoons[number];
const ratSeasons = ["Freeze-and-Fall", "Lying-Longing", "Candle-Canker", "Wink-and-Wane", "Vial-Vane", "Take-and-Toil", "Wine-Whisper", "Rise-and-Rake",
    "Nitre-Knife", "Kifer-Caitiff", "Skitter-Scatter", "Dimmest-Dark"] as const;
type RatSeason = typeof ratSeasons[number];
const falseSeasons = ["Autumn", "Winter", "Spring", "Summer"] as const;
type FalseSeason = typeof falseSeasons[number];
type RatSellingCategory = RatWind | RatMoon | RatSeason | FalseSeason;

const RAT_MARKET_SELLING: Record<RatSellingCategory, readonly RatItem[]> = {
    "East": [RAT_MARKET_ITEMS.WATCH],
    "South": [RAT_MARKET_ITEMS.UMBRELLA],
    "West": [RAT_MARKET_ITEMS.PIECE],
    "North": [RAT_MARKET_ITEMS.CANE],
    "Blue": [RAT_MARKET_ITEMS.TIARA],
    "Soft": [RAT_MARKET_ITEMS.LENGUALS],
    "Hard": [RAT_MARKET_ITEMS.SMOCK],
    "Runny": [RAT_MARKET_ITEMS.VAKEBOOTS],
    "Freeze-and-Fall": [RAT_MARKET_ITEMS.AMBER, RAT_MARKET_ITEMS.IRRIGO, RAT_MARKET_ITEMS.GOGGLES, RAT_MARKET_ITEMS.CINDER],
    "Lying-Longing": [RAT_MARKET_ITEMS.SKULL, RAT_MARKET_ITEMS.IRRIGO, RAT_MARKET_ITEMS.GOGGLES, RAT_MARKET_ITEMS.CINDER],
    "Candle-Canker": [RAT_MARKET_ITEMS.SKULL, RAT_MARKET_ITEMS.STARSTONE, RAT_MARKET_ITEMS.GOGGLES, RAT_MARKET_ITEMS.CINDER],
    "Wink-and-Wane": [RAT_MARKET_ITEMS.SKULL, RAT_MARKET_ITEMS.STARSTONE, RAT_MARKET_ITEMS.COMPENDIUM, RAT_MARKET_ITEMS.FROCK, RAT_MARKET_ITEMS.SUIT],
    "Vial-Vane": [RAT_MARKET_ITEMS.SECRET, RAT_MARKET_ITEMS.STARSTONE, RAT_MARKET_ITEMS.COMPENDIUM, RAT_MARKET_ITEMS.FROCK, RAT_MARKET_ITEMS.SUIT],
    "Take-and-Toil": [RAT_MARKET_ITEMS.SECRET, RAT_MARKET_ITEMS.SOUL, RAT_MARKET_ITEMS.COMPENDIUM, RAT_MARKET_ITEMS.FROCK, RAT_MARKET_ITEMS.SUIT],
    "Wine-Whisper": [RAT_MARKET_ITEMS.SECRET, RAT_MARKET_ITEMS.SOUL, RAT_MARKET_ITEMS.SLIPPERS, RAT_MARKET_ITEMS.EDICTS],
    "Rise-and-Rake": [RAT_MARKET_ITEMS.LEGENDA, RAT_MARKET_ITEMS.SOUL, RAT_MARKET_ITEMS.SLIPPERS, RAT_MARKET_ITEMS.EDICTS],
    "Nitre-Knife": [RAT_MARKET_ITEMS.LEGENDA, RAT_MARKET_ITEMS.LOCATION, RAT_MARKET_ITEMS.SLIPPERS, RAT_MARKET_ITEMS.EDICTS],
    "Kifer-Caitiff": [RAT_MARKET_ITEMS.LEGENDA, RAT_MARKET_ITEMS.LOCATION, RAT_MARKET_ITEMS.GLOVES, RAT_MARKET_ITEMS.TEARS],
    "Skitter-Scatter": [RAT_MARKET_ITEMS.AMBER, RAT_MARKET_ITEMS.LOCATION, RAT_MARKET_ITEMS.GLOVES, RAT_MARKET_ITEMS.TEARS],
    "Dimmest-Dark": [RAT_MARKET_ITEMS.AMBER, RAT_MARKET_ITEMS.IRRIGO, RAT_MARKET_ITEMS.GLOVES, RAT_MARKET_ITEMS.TEARS],
    "Autumn": [RAT_MARKET_ITEMS.WADERS],
    "Winter": [RAT_MARKET_ITEMS.HAIRS],
    "Spring": [RAT_MARKET_ITEMS.CATALOGUE],
    "Summer": [RAT_MARKET_ITEMS.KNIFE]
} as const;
Object.freeze(RAT_MARKET_SELLING);

type SeasonWithItems = "1" | "2" | "3" | "8" | "9";
const WASWOOD_ITEMS: Record<SeasonWithItems, readonly CharacterQualityName[]> = {
    "1": ["JENNYS_WIMPLE"],
    "2": ["ANON_WHITE_MASK"],
    "3": ["VISCOUNT_COLLAR", "VISCOUNTESS_COLLAR"],
    "8": ["STURDY_PICK", "SPEAKING_TUBE", "M_D_A_FOR_F", "DRINKING_VESSEL", "POISONED_PEN", "WAX_BOOTS", "WORK_GLOVES"],
    "9": ["MINIATURE_MUSEUM", "PERFUMERS_ARTS", "GEBRANDTS_ADDRESS_BOOK"]
} as const;

type HeartsGameSeason = "Nascency" | "Excess" | "Dares" | "Devotions" | "Irreverences" | "Duplicities"
type HeartsGameDistinction = "NASCENCY" | "EXCESS" | "DARES" | "DEVOTION" | "IRREVERENCE" | "DUPLICITY";
const HEARTS_GAME_SEASON_TO_DISTINCTION: Record<HeartsGameSeason, HeartsGameDistinction> = {
    Nascency: "NASCENCY",
    Excess: "EXCESS",
    Dares: "DARES",
    Devotions: "DEVOTION",
    Irreverences: "IRREVERENCE",
    Duplicities: "DUPLICITY",
} as const;

const worldQualityNames = ["SAINTLY_DEMAND", "SOFT_DEMAND", "TEMPESTUOUS_DEMAND", "INSCRUTABLE_DEMAND", "INTRICATE_DEMAND", "MAUDLIN_DEMAND", "CALCULATING_DEMAND", "RUINOUS_DEMAND",
    "THE_RAT_SEASON", "DIRECTION_OF_THE_RAT_WIND", "PHASE_OF_THE_RAT_MOON", "THE_FALSE_SEASON", "THE_SEASON_IN_SOUP", "BONE_MARKET_FLUCTUATIONS", "ZOOLOGICAL_MANIA",
    "HEARTS_GAME_SEASON", "SEASON_OF_THE_SACROBOSCAN_CALENDAR"] as const;
type WorldQualityName = typeof worldQualityNames[number];

type CharacterQualityName = "MAKING_WAVES" | "NOTABILITY" | "BENEFICENCE" | "FREE_EVENING" | "MIRED_IN_MAIL" | "WHISPERS" | "A_KNOCK" | "A_SUSURRUS" | "UNEARTHLY_WHISPER" |
    "BACKSTAGE" | "ACQUAINTANCE_MRS_CHAPMAN" | "FAVOURABLE_CIRCUMSTANCE" | "PAYMENT" | "PROFESSIONAL_PERK" | "ROUTE_NADIR" | "IRRIGO" | "FLEETING_RECOLLECTIONS" | "VIOLANT_SIGHTS" |
    "ANTICANDLE" | "MEMORY_OF_LIGHT" | "KHAGANIAN_LIGHTBULB" | "FIRMAMENT" | "DREADED_BOON" | "PARABOLAN_COMPANY" |
    "PARABOLAN_RAVAGES" | "PARABOLAN_CAMPAIGN" | "PARABOLAN_WAR_STAGE" | "PARABOLAN_WAR_ADVANCE" | "TRUE_DENIZEN" | "CONSEQUENCE" | "ROUTE_BONE_MARKET" | "BONE_MARKET_EXHAUSTION" |
    "DELAY_NEXT_MEETING" | "RAILWAY_VENTURE" | "BUREAUCRATIC_ADVANTAGE" | "APPROACHING_HELL" | "VISITOR_TO_HELL" | "FLOWER_FROM_HELL" | "STARVED_EXCHANGE" | "ECDYSIS" | "WIDE_EYED" |
    "PARTIALLY_BONELESS" | "RADIANT_BEARING" | "HALLOW_VESSEL" | "VOTES_CAST" | "VOTES_ALLOWED" | "JENNYS_WIMPLE" | "ANON_WHITE_MASK" | "VISCOUNT_COLLAR" | "VISCOUNTESS_COLLAR" | "STURDY_PICK" |
    "SPEAKING_TUBE" | "M_D_A_FOR_F" | "DRINKING_VESSEL" | "POISONED_PEN" | "WAX_BOOTS" | "WORK_GLOVES" | "MINIATURE_MUSEUM" | "PERFUMERS_ARTS" | "GEBRANDTS_ADDRESS_BOOK" | "NASCENCY" |
    "EXCESS" | "DARES" | "DEVOTION" | "IRREVERENCE" | "DUPLICITY" | "BALMORAL" | "NULL_AND_VOID" | "KHAGANS_PALACE_REPORT" | "AGENT" | "JAUNT_WASWOOD" | "DISCOVERED_WELLSPRING" |
    "GLOWING_VIRIC" | "BALMORAL_CASTELLAN" | "BALMORAL_GIFT" | "RAT_MARKET_SATURATION"

interface RatItem { id: number, name: string, price: number; };
interface WorldQuality { name: string, result?: WikiResult, resetDay: number; blindspot?: boolean}
interface CharacterQuality { id: number, value: number, name?: string; }

const timekeeperSettings = ["nextTthISOString", "nextKhanateISOString", "nextBalmoralISOString", "nextWaswoodISOString", "nextWellspringISOString", "nextChimesISOString",
    "KHANATE_MESSAGE", "BALMORAL_MESSAGE", "TTH_MESSAGE", "highestBDR"];
//todo update stuff. When the wiki gives a new world quality, update everything that uses it. Refresh all 'hours remaining' text. Update item quantities.
//add panels when you get a boon. Remove panels when they expire. etc.
//fill out the settings modal with add time, delete world quality, etc (put in add/delete misc tracker json too just for development purposes)
//add a countdown to the last thursday of the month for new exceptional stories
//when TtH comes, add 7 days to the old one. Update the value any time you see api/tth. Only use messages if there's nothing else.
//when waswood items are available, say how long until they're gone
export class TimeKeeperFixer implements IMutationAware, IStateAware, INetworkAware {

    currentSettings!: SettingsObject;
    currentState!: GameState;
    displayTimekeeping = true;
    backupMoments: Map<string, string> = new Map();
    waitingOnApi = false;
    activeLivingStories: Record<string, string> = {};
    worldQualities: Record<WorldQualityName, WorldQuality> = {
        SAINTLY_DEMAND: { name: "Saintly Demand", result: undefined, resetDay: DAYS.MONDAY },
        SOFT_DEMAND: { name: "Soft Demand", result: undefined, resetDay: DAYS.MONDAY },
        TEMPESTUOUS_DEMAND: { name: "Tempestuous Demand", result: undefined, resetDay: DAYS.MONDAY },
        INSCRUTABLE_DEMAND: { name: "Inscrutable Demand", result: undefined, resetDay: DAYS.MONDAY },
        INTRICATE_DEMAND: { name: "Intricate Demand", result: undefined, resetDay: DAYS.MONDAY },
        MAUDLIN_DEMAND: { name: "Maudlin Demand", result: undefined, resetDay: DAYS.MONDAY },
        CALCULATING_DEMAND: { name: "Calculating Demand", result: undefined, resetDay: DAYS.MONDAY },
        RUINOUS_DEMAND: { name: "Ruinous Demand", result: undefined, resetDay: DAYS.MONDAY },
        THE_RAT_SEASON: { name: "The Rat-Season:", result: undefined, resetDay: DAYS.MONDAY },
        DIRECTION_OF_THE_RAT_WIND: { name: "Direction of the Rat-Wind:", result: undefined, resetDay: DAYS.MONDAY },
        PHASE_OF_THE_RAT_MOON: { name: "Phase of the Rat-Moon:", result: undefined, resetDay: DAYS.MONDAY },
        THE_FALSE_SEASON: { name: "The False-Season:", result: undefined, resetDay: DAYS.MONDAY },
        THE_SEASON_IN_SOUP: { name: "The Season in Soup", result: undefined, resetDay: DAYS.MONDAY },
        BONE_MARKET_FLUCTUATIONS: { name: "Bone Market Fluctuations:", result: undefined, resetDay: DAYS.TUESDAY },
        ZOOLOGICAL_MANIA: { name: "Zoological Mania:", result: undefined, resetDay: DAYS.TUESDAY },
        HEARTS_GAME_SEASON: { name: "Hearts' Game Season (Placeholder)", result: undefined, resetDay: DAYS.TUESDAY },
        SEASON_OF_THE_SACROBOSCAN_CALENDAR: { name: "Season of the Sacroboscan Calendar", result: undefined, resetDay: DAYS.THURSDAY },
    };//todo I'm saving the whole thing, maybe just save the results?

    private characterQualities: Record<CharacterQualityName, CharacterQuality> = {
        MAKING_WAVES: { id: 545, value: 0 },
        NOTABILITY: { id: 101305, value: 0 },
        BENEFICENCE: { id: 141145, value: 0 },
        FREE_EVENING: { id: 106147, value: 0 },
        MIRED_IN_MAIL: { id: 142520, value: 0 },
        WHISPERS: { id: 143984, value: 0 },
        A_KNOCK: { id: 143982, value: 0 },
        A_SUSURRUS: { id: 143981, value: 0 },
        UNEARTHLY_WHISPER: { id: 143980, value: 0 },
        BACKSTAGE: { id: 143985, value: 0 },
        ACQUAINTANCE_MRS_CHAPMAN: { id: 143992, value: 0 },
        FAVOURABLE_CIRCUMSTANCE: { id: 23980, value: 0 },
        PAYMENT: { id: 13927, value: 0 },
        PROFESSIONAL_PERK: { id: 22836, value: 0 },
        ROUTE_NADIR: { id: 23569, value: 0 },
        IRRIGO: { id: 23879, value: 0 },
        FLEETING_RECOLLECTIONS: { id: 107562, value: 0 },
        VIOLANT_SIGHTS: { id: 145614, value: 0 },
        ANTICANDLE: { id: 142750, value: 0 },
        MEMORY_OF_LIGHT: { id: 589, value: 0 },
        KHAGANIAN_LIGHTBULB: { id: 142728, value: 0 },
        FIRMAMENT: { id: 144986, value: 0 },
        PARABOLAN_COMPANY: { id: 142527, value: 0 },
        PARABOLAN_RAVAGES: { id: 141647, value: 0 },
        PARABOLAN_CAMPAIGN: { id: 142468, value: 0 },
        PARABOLAN_WAR_STAGE: { id: 142455, value: 0 },
        PARABOLAN_WAR_ADVANCE: { id: 142452, value: 0 },
        TRUE_DENIZEN: { id: 140753, value: 0 },
        CONSEQUENCE: { id: 140799, value: 0 },
        ROUTE_BONE_MARKET: { id: 140958, value: 0 },
        BONE_MARKET_EXHAUSTION: { id: 141648, value: 0 },
        DELAY_NEXT_MEETING: { id: 141545, value: 0 },
        RAILWAY_VENTURE: { id: 140992, value: 0 },
        BUREAUCRATIC_ADVANTAGE: { id: 141651, value: 0 },
        APPROACHING_HELL: { id: 142923, value: 0 },
        VISITOR_TO_HELL: { id: 142983, value: 0 },
        FLOWER_FROM_HELL: { id: 143027, value: 0 },
        STARVED_EXCHANGE: { id: 144487, value: 0 },
        ECDYSIS: { id: 145023, value: 0 },
        WIDE_EYED: { id: 145006, value: 0 },
        //SHARPENED: {id: ??, value: 0},
        PARTIALLY_BONELESS: { id: 145011, value: 0 },
        RADIANT_BEARING: { id: 145010, value: 0 },
        HALLOW_VESSEL: { id: 145013, value: 0 },
        VOTES_CAST: { id: 144587, value: 0 },
        VOTES_ALLOWED: { id: 144584, value: 0 },
        JENNYS_WIMPLE: { id: 128206, value: 0, name: "Sinning Jenny's Forsaken Wimple" },
        ANON_WHITE_MASK: { id: 140461, value: 0, name: "Anonymous White Mask, Zee-Stained and Mildewy" },
        VISCOUNT_COLLAR: { id: 141787, value: 0, name: "Viscount's Bejewelled Collar" },
        VISCOUNTESS_COLLAR: { id: 141789, value: 0, name: "Viscountess' Bejewelled Collar" },
        STURDY_PICK: { id: 142967, value: 0, name: "Sturdy Pick" },
        SPEAKING_TUBE: { id: 126636, value: 0, name: "A Pre-Lapsarian Speaking Tube" },
        M_D_A_FOR_F: { id: 142997, value: 0, name: "M. D_____' A_____ for _______: F____ Edition" },
        DRINKING_VESSEL: { id: 127174, value: 0, name: "Polythreme Drinking Vessel" },
        POISONED_PEN: { id: 127175, value: 0, name: "A Poisoned Pen" },
        WAX_BOOTS: { id: 127177, value: 0, name: "Wax-Hardened Boots" },
        WORK_GLOVES: { id: 142999, value: 0, name: "Singed and Stained Work Gloves" },
        MINIATURE_MUSEUM: { id: 143538, value: 0, name: "Memory of a Miniature Museum" },
        PERFUMERS_ARTS: { id: 143748, value: 0, name: "An Initiate into the Perfumer's Arts" },
        GEBRANDTS_ADDRESS_BOOK: { id: 143752, value: 0, name: "Your Name in F.F. Gebrandt's Address Book" },
        NASCENCY: { id: 144836, value: 0 },
        EXCESS: { id: 144837, value: 0 },
        DARES: { id: 144838, value: 0 },
        DEVOTION: { id: 144839, value: 0 },
        IRREVERENCE: { id: 144840, value: 0 },
        DUPLICITY: { id: 144841, value: 0 },
        BALMORAL: { id: 141783, value: 0 },
        NULL_AND_VOID: { id: 141948, value: 0 },
        KHAGANS_PALACE_REPORT: { id: 142863, value: 0 },
        AGENT: { id: 142862, value: 0 },
        JAUNT_WASWOOD: { id: 143416, value: 0 },
        DISCOVERED_WELLSPRING: { id: 141973, value: 0 },
        GLOWING_VIRIC: { id: 141974, value: 0 },
        BALMORAL_CASTELLAN: { id: 141780, value: 0 },
        BALMORAL_GIFT: { id: 141783, value: 0 },
        RAT_MARKET_SATURATION: { id: 145145, value: 0 },
        DREADED_BOON: { id: 142225, value: 0}
    };

    characterEffectiveQualities: Record<string, CharacterQuality> = {
        BIZARRE: { id: 958, value: 0 },
        DREADED: { id: 957, value: 0 },
        RESPECTABLE: { id: 950, value: 0 },
    };//these will not always be up to date
    //gamestate.onEquipmentChange returns their values before the change, which isn't super helpful

    constructor() {
        window.addEventListener("message", (event) => {
            if (event.data.action === MSG_TYPE_WIKI_API_RESPONSE) {
                const results: Map<string, WikiResult> = new Map(Object.entries(JSON.parse(event.data.results)));
                let dirty = false;
                results.forEach((val, key) => {
                    Object.values(this.worldQualities).forEach((quality) => {
                        if (quality.name === key) {
                            quality.result = val;
                            dirty = true;
                        }
                    });
                });
                if (dirty) {
                    this.removeOutdatedWorldQualities(new Date());
                    sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { worldQualities: JSON.stringify(this.worldQualities) } });
                }
                this.waitingOnApi = false;
            }
        });
    }

    linkState(state: GameStateController): void {
        this.currentState = state.getState();
        state.onCharacterDataLoaded((g) => {
            Object.values(this.characterQualities).forEach((characterQuality) => {
                characterQuality.value = g.getQualityById(characterQuality.id)?.level || 0;
            });
            Object.values(this.characterEffectiveQualities).forEach((characterQuality) => {
                characterQuality.value = g.getQualityById(characterQuality.id)?.effectiveLevel || 0;
            });
            this.populateNotabilityItems(); //this happens after equip change
        });
        state.onQualityChanged((_state, quality, _previous, _current) => {
            Object.values(this.characterQualities).forEach((characterQuality) => {
                if (characterQuality.id === quality.qualityId) {
                    characterQuality.value = quality.level;
                }//todo this would be better with a map... but the nested thing doesn't work great with a map.
            });//and characterqualities isn't that big so I don't think it's a huge cost
            Object.values(this.characterEffectiveQualities).forEach((characterQuality) => {
                if (characterQuality.id === quality.qualityId) {
                    characterQuality.value = quality.effectiveLevel;
                }
            });

        });
    }

    onNodeAdded(node: HTMLElement): void {
        const travelColumn = getSingletonByClassName(node, "travel");
        if (!travelColumn) return;

        let sidebar = document.getElementById("right-sidebar");
        if (!sidebar) {
            sidebar = document.createElement("div");
            sidebar.setAttribute("id", "right-sidebar");
            sidebar.classList.add("sidebar");

            if (travelColumn.querySelector("div[class='snippet']")) {
                // Give some clearance in case snippets are not disabled.
                sidebar.style.cssText = "margin-top: 30px";
            }
        }

        const timekeeperPanel = document.getElementById("timekeeper-panel");
        // Trackers are already created and visible, nothing to do here.
        if (!timekeeperPanel) {
            const wrapperDiv = this.createTimekeeperPanel();

            sidebar.appendChild(wrapperDiv);
        }

        if (!travelColumn.contains(sidebar)) {
            travelColumn.appendChild(sidebar);
        }
    }

    private createTimekeeperPanel() {
        const wrapperDiv = document.createElement("div");
        const timekeeperHeader = document.createElement("p");
        timekeeperHeader.classList.add("heading", "heading--4");
        timekeeperHeader.textContent = "Timekeeper";
        wrapperDiv.appendChild(timekeeperHeader);

        const timekeeperPanel = document.createElement("ul");
        timekeeperPanel.id = "timekeeper-panel";
        timekeeperPanel.classList.add("items", "items--list");
        if (this.currentSettings.tth) {
            timekeeperPanel.appendChild(this.buildTthPanel());
        }
        if (this.currentSettings.wellspring || this.currentSettings.waswood || this.currentSettings.house_of_chimes || this.currentSettings.balmoral ||
            this.currentSettings.khanate || this.currentSettings.chimes_boons) {

            timekeeperPanel.appendChild(this.buildLivingStoryPanel());
        }
        if (this.currentSettings.rat_market) {
            timekeeperPanel.appendChild(this.buildRatMarketPanel());
        }
        if (this.currentSettings.bone_market_trends) {
            timekeeperPanel.appendChild(this.buildBoneMarketPanel());
        }

        this.createSettingsModal();

        const modalButton = document.createElement("button");
        modalButton.classList.add("js-tt", "button", "button--primary", "button--go");
        modalButton.style.padding = "2px 5px";
        modalButton.addEventListener("click", () => {
            (document.getElementById("timekeeper-modal") as HTMLDialogElement).showModal();
        });
        const editText = document.createElement("span");
        editText.textContent = "Edit timekeeper";
        modalButton.appendChild(editText);
        timekeeperPanel.appendChild(modalButton);

        wrapperDiv.appendChild(timekeeperPanel);
        return wrapperDiv;
    }

    //only works with strings, but string | boolean makes it play nicer with settings
    private calculateRemainingTimeFromIsoOrNumberString(datetime: string | boolean | undefined) {
        if (datetime == undefined || typeof datetime === "boolean") {
            return "";
        }
        return this.calculateRemainingTime(new Date(datetime as string).getTime());
    }

    calculateTimeDifference(moment: number, now: number) {
        const minutesLeft = Math.round((moment - now) / (MILLISECONDS_IN_MINUTE));
        const hoursLeft = Math.floor(minutesLeft / 60) + (minutesLeft % 60 >= 30 ? 1 : 0);
        const daysLeft = minutesLeft >= 1440 ? Math.floor(minutesLeft / 1440) : 0;
        const daysAndHours = daysLeft >= 1 ? hoursLeft - 24 * daysLeft : hoursLeft;

        let remainingText;

        if (daysLeft > 0) {
            const unit = daysLeft === 1 ? "day" : "days";
            const hoursUnit = daysAndHours === 1 ? "hour" : "hours";

            remainingText = `in ${daysLeft} ${unit} ${daysAndHours} ${hoursUnit}.`;
        } else if (hoursLeft > 0) {
            const unit = hoursLeft === 1 ? "hour" : "hours";

            remainingText = `in ${hoursLeft} ${unit}.`;
        } else if (minutesLeft > 0) {
            const unit = minutesLeft === 1 ? "minute" : "minutes";
            remainingText = `in ${minutesLeft} ${unit}.`;
        } else {
            remainingText = `again someday.`; //This probably means it's been picked up and no new time entered
        }

        return remainingText;
    }

    calculateRemainingTime(moment: number) {
        const now = new Date().getTime();
        return this.calculateTimeDifference(moment, now);
    }

    buildTthPanel(): HTMLUListElement {
        const tthPanel = document.createElement("ul");
        tthPanel.id = "tth-panel";
        tthPanel.classList.add("items", "items--list");

        const tthComingItem = document.createElement("li");
        tthComingItem.id = "tth-remaining-item";
        const remainingText = this.calculateRemainingTimeFromIsoOrNumberString(this.currentSettings.nextTthISOString);
        tthComingItem.textContent = `Time the Healer cometh ${remainingText}`;
        tthPanel.appendChild(tthComingItem);
        const losingNotability = document.createElement("li");
        losingNotability.id = 'losing-notability-item';
        tthPanel.appendChild(losingNotability);
        const currentBdrItem = document.createElement("li");
        currentBdrItem.id = 'current-bdr-item';
        tthPanel.appendChild(currentBdrItem);
        const bdrRequiredItem = document.createElement("li");
        bdrRequiredItem.id = 'bdr-required-item';
        tthPanel.appendChild(bdrRequiredItem);
        const beneficenceItem = document.createElement("li");
        beneficenceItem.id = "beneficence-item";
        tthPanel.appendChild(beneficenceItem);
        const freeEveningsItem = document.createElement("li");
        freeEveningsItem.id = 'free-evenings-item';
        tthPanel.appendChild(freeEveningsItem);
        const miredItem = document.createElement("li");
        miredItem.id = 'mired-item';
        tthPanel.appendChild(miredItem);
        const chapmansItem = document.createElement("li");
        chapmansItem.id = 'backstage-chapmans-item';
        tthPanel.appendChild(chapmansItem);
        const favourableItem = document.createElement("li");
        favourableItem.id = 'favourable-circumstance-item';
        tthPanel.appendChild(favourableItem);
        const perkItem = document.createElement("li");
        perkItem.id = 'professional-perk-item';
        tthPanel.appendChild(perkItem);
        const zenithItem = document.createElement("li");
        zenithItem.id = 'zenith-item';
        tthPanel.appendChild(zenithItem);
        const nadirItem = document.createElement("li");
        nadirItem.id = 'cave-of-nadir-item';
        tthPanel.appendChild(nadirItem);
        const paraRavages = document.createElement("li");
        paraRavages.id = 'parabolan-ravages-item';
        tthPanel.appendChild(paraRavages);
        const ambitionItem = document.createElement("li");
        ambitionItem.id = 'ambition-item';
        tthPanel.appendChild(ambitionItem);
        const boneExhItem = document.createElement("li");
        boneExhItem.id = 'bone-exhaustion-item';
        tthPanel.appendChild(boneExhItem);
        const boardMeetingItem = document.createElement("li");
        boardMeetingItem.id = 'board-meeting-item';
        tthPanel.appendChild(boardMeetingItem);
        const visitHellItem = document.createElement("li");
        visitHellItem.id = 'visit-hell-item';
        tthPanel.appendChild(visitHellItem);
        const starvedItem = document.createElement("li");
        starvedItem.id = 'starved-embassy-item';
        tthPanel.appendChild(starvedItem);
        const ecdysisItem = document.createElement("li");
        ecdysisItem.id = 'ecdysis-item';
        tthPanel.appendChild(ecdysisItem);
        const heartsGameItem = document.createElement("li");
        heartsGameItem.id = "hearts-game-item";
        tthPanel.appendChild(heartsGameItem);
        const exceptionalStoryItem = document.createElement("li");
        exceptionalStoryItem.id = "exceptional-story-item";
        tthPanel.appendChild(exceptionalStoryItem);

        if (this.currentSettings.notability) {
            this.populateNotabilityItems(losingNotability, currentBdrItem, bdrRequiredItem);
            //todo update the BDR calculation
        }
        if (this.currentSettings.beneficence) {
            if (!this.characterQualities.BENEFICENCE.value) {
                beneficenceItem.textContent = "A Beneficence is still available.";
            }
        }
        if (this.currentSettings.free_evenings) {
            const evenings = this.characterQualities.FREE_EVENING.value;
            if (evenings) {
                if (evenings === 1) {
                    freeEveningsItem.textContent = `1 Free Evening is available.`;
                } else {
                    freeEveningsItem.textContent = `${evenings} Free Evenings are available.`;
                }
            }
        }
        if (this.currentSettings.mired_in_mail) {
            const mired = this.characterQualities.MIRED_IN_MAIL.value;
            if (mired === 4) {
                miredItem.textContent = `1 letter reading is available.`;
            } else if (mired < 5) {
                miredItem.textContent = `${5 - mired} letter readings are available.`;
            }
        }
        if (this.currentSettings.backstage) {
            this.buildMrsChapmanItem(chapmansItem);
        }
        if (this.currentSettings.favourable_circumstance) {
            if (this.characterQualities.FAVOURABLE_CIRCUMSTANCE.value) {
                favourableItem.textContent = "You can use a Favourable Circumstance";
            }
        }
        if (this.currentSettings.professional_perks) {
            if (this.characterQualities.PROFESSIONAL_PERK.value === 4) {
                perkItem.textContent = "You have 4 Professional Perks, use them before TtH arrives";
            }
        }
        if (this.currentSettings.zenith && this.characterQualities.FIRMAMENT.value >= 300) {
            if (this.characterQualities.VIOLANT_SIGHTS.value === 0) {
                zenithItem.textContent = "You may enter Zenith.";
                if (this.characterQualities.ANTICANDLE.value >= 12) {
                    zenithItem.textContent += " You have enough Anticandles to use them in Zenith.";
                } else {
                    zenithItem.textContent += ` You need ${12 - this.characterQualities.ANTICANDLE.value} more Anticandles to use them in Zenith.`
                }
                if (this.characterQualities.MEMORY_OF_LIGHT.value >= 60) {
                    zenithItem.textContent += " You have enough Memories of Light to use them in Zenith.";
                } else {
                    zenithItem.textContent += ` You need ${60 - this.characterQualities.MEMORY_OF_LIGHT.value} more Memories of Light to use them in Zenith.`;
                }
                if (this.characterQualities.KHAGANIAN_LIGHTBULB.value >= 300) {
                    zenithItem.textContent += " You have enough Khaganian Lightbulbs to use them in Zenith.";
                } else {
                    zenithItem.textContent += ` You need ${300 - this.characterQualities.KHAGANIAN_LIGHTBULB.value} more Khaganian Lightbulbs to use them in Zenith.`;
                }
            }
        }
        if (this.currentSettings.irrigo && this.characterQualities.ROUTE_NADIR.value > 2) {
            if (!this.characterQualities.IRRIGO.value || this.characterQualities.FLEETING_RECOLLECTIONS.value) {
                nadirItem.textContent = "You can visit the Cave of the Nadir.";
                if (this.characterQualities.VIOLANT_SIGHTS.value === 0) {
                    nadirItem.textContent += " Consider going to Zenith first.";
                }
            }
        }
        if (this.currentSettings.parabolan_ravages && this.characterQualities.PARABOLAN_COMPANY.value) {
            if (this.characterQualities.PARABOLAN_RAVAGES.value < 10 && this.characterQualities.PARABOLAN_CAMPAIGN.value) {
                paraRavages.textContent = "Your Parabolan Ravages is below 10, you can continue your campaign.";
            }//if(active campaign and ravages < 10) or (no campaign and ravages 0)
            else if (this.characterQualities.PARABOLAN_RAVAGES.value === 0) {
                paraRavages.textContent = "Your Parabolan Ravages is 0, you can begin a campaign.";
            }
        }
        if (this.currentSettings.ambition_reward && this.characterQualities.TRUE_DENIZEN.value) {
            if (this.characterQualities.CONSEQUENCE.value === 4) {
                ambitionItem.textContent = "You can collect your monthly Ambition reward";
            } else {
                const weeksRemaining = 3 - this.characterQualities.CONSEQUENCE.value;
                if (this.currentSettings.nextTthISOString) {
                    const nextTthDate = new Date(this.currentSettings.nextTthISOString as string);
                    const ambitionDate = new Date(nextTthDate.getTime() + weeksRemaining * SEVEN_DAYS_IN_MILLISECONDS);
                    const ambitionText = this.calculateRemainingTime(ambitionDate.getTime());
                    ambitionItem.textContent = `Your ambition reward will be available in ${ambitionText}`;
                } else {
                    ambitionItem.textContent = `You can collect your monthly Ambition reward in approximately ${weeksRemaining} weeks`;
                }
            }
        }
        if (this.currentSettings.bone_market_exhaustion && this.characterQualities.ROUTE_BONE_MARKET.value) {
            const remainingExh = 4 - this.characterQualities.BONE_MARKET_EXHAUSTION.value;
            if (remainingExh > 0) {
                boneExhItem.textContent = `You can use ${remainingExh} Bone Market Exhaustion`;
            }
        }
        if (this.currentSettings.board_meeting && this.characterQualities.RAILWAY_VENTURE.value) {
            const bureaucraticAdvantageAvailable = this.characterQualities.RAILWAY_VENTURE.value > 0 &&
                this.characterQualities.RAILWAY_VENTURE.value < 121 &&
                this.characterQualities.BUREAUCRATIC_ADVANTAGE.value === 0;

            const meetingAvailable = this.characterQualities.DELAY_NEXT_MEETING.value === 0;
            if (bureaucraticAdvantageAvailable) {
                if (meetingAvailable) {
                    boardMeetingItem.textContent = "You can call two GHR Board meetings.";
                } else {
                    boardMeetingItem.textContent = "You can call a GHR Board meeting, with the Board Secretary's help.";
                }
            } else {
                if (meetingAvailable) {
                    boardMeetingItem.textContent = "You can call a GHR Board meeting.";
                }
            }
            if (this.characterQualities.PARABOLAN_COMPANY.value && (bureaucraticAdvantageAvailable || meetingAvailable)) {
                if (this.characterQualities.PARABOLAN_WAR_ADVANCE.value === 0 &&
                    this.characterQualities.PARABOLAN_CAMPAIGN.value > 0 &&
                    this.characterQualities.PARABOLAN_CAMPAIGN.value < 7 &&
                    this.characterQualities.PARABOLAN_RAVAGES.value < 3) {

                    boardMeetingItem.textContent += " Now would be a good time to send your train to fight in Parabola.";
                } else {
                    boardMeetingItem.textContent += " You cannot currently send a train to Parabola, you may need to set up the campaign first.";
                }
            }
        }
        if (this.currentSettings.visit_hell && this.characterQualities.APPROACHING_HELL.value === 777) {
            if (!this.characterQualities.VISITOR_TO_HELL.value && !this.characterQualities.FLOWER_FROM_HELL.value) {
                visitHellItem.textContent = "You can visit Hell";
            }
        }
        if (this.currentSettings.starved_embassy) {
            if (!this.characterQualities.STARVED_EXCHANGE.value) {
                starvedItem.textContent = "You can visit the Starved Embassy.";
            }
        }
        //todo you can have multiple boons, so this needs to add them up
        if (this.currentSettings.ecdysis && this.characterQualities.ECDYSIS.value) {
            const sharpened = this.currentState.getQuality("Boon", "Sharpened");
            if (!(this.characterQualities.WIDE_EYED.value ||
                sharpened || //this.characterQualities.SHARPENED.value) ||
                this.characterQualities.PARTIALLY_BONELESS.value ||
                this.characterQualities.RADIANT_BEARING.value ||
                this.characterQualities.HALLOW_VESSEL.value)) {

                ecdysisItem.textContent = "You can get a boon from Ecdysis.";
            } else {
                ecdysisItem.textContent = "Your Ecdysis boon will end when TtH arrives.";
            }
        }
        if (this.currentSettings.hearts_game) {
            this.buildHeartsGameItem(heartsGameItem);
        }
        if (this.currentSettings.exceptional_story) {
            const now = new Date();
            const changeDate = this.getNextExceptionalStoryDate(now);
            const remainingTime = this.calculateRemainingTime(changeDate.getTime());
            exceptionalStoryItem.textContent = `The next Exceptional Story will be available ${remainingTime}`;
        }
        return tthPanel;
    }

    private buildMrsChapmanItem(chapmansItem?: HTMLLIElement) {
        if (!chapmansItem) {
            chapmansItem = document.getElementById("backstage-chapmans-item") as HTMLLIElement;
            if (!chapmansItem) {
                return;
            }
        }
        if (this.worldQualities.THE_SEASON_IN_SOUP.blindspot) {
            chapmansItem.textContent = `The Season in Soup World Quality is changing now, which can lead to inaccuracies. Try again in around 30 minutes.`;
            return;
        }
        //if you can do something, and haven't maxed your acquaintance yet
        if (this.characterQualities.WHISPERS.value && this.characterQualities.ACQUAINTANCE_MRS_CHAPMAN.value < 4) {
            //if you have all the prerequisites to visit
            if (this.characterQualities.A_KNOCK.value && this.characterQualities.A_SUSURRUS.value &&
                this.characterQualities.UNEARTHLY_WHISPER.value) {
                chapmansItem.textContent = "You can go Backstage at Mrs Chapman's";
            } else {
                //you need a prerequisite
                if (this.worldQualities.THE_SEASON_IN_SOUP.result) {
                    switch (Number(this.worldQualities.THE_SEASON_IN_SOUP.result?.value)) {
                        case 1:
                            break; //nothing to do here
                        case 2:
                            if (!this.characterQualities.A_KNOCK.value) {
                                chapmansItem.textContent = "You can Promenade in Mrs Chapman's Parlor";
                            }
                            break;
                        case 3:
                            if (!this.characterQualities.A_SUSURRUS.value) {
                                chapmansItem.textContent = "You can have the Mrs Chapman's Flavour of Dahut soup";
                            }
                            break;
                        case 4:
                            if (!this.characterQualities.UNEARTHLY_WHISPER.value) {
                                chapmansItem.textContent = "You can take absinthe at Mrs Chapman's Parlor";
                            }
                    }
                } else {
                    chapmansItem.textContent = "Could not determine if you can visit Mrs Chapman.";
                }
            }
        }
    }

    private buildHeartsGameItem(heartsGameItem?: HTMLLIElement) {
        if (!heartsGameItem) {
            heartsGameItem = document.getElementById("hearts-game-item") as HTMLLIElement;
            if (!heartsGameItem) {
                return;
            }
        }
        if (this.worldQualities.HEARTS_GAME_SEASON.blindspot) {
            heartsGameItem.textContent = `The Hearts' Game Season World Quality is changing now, which can lead to inaccuracies. This can take a long time to update on the Wiki. Check in-game manually, or wait about 1 day.`;
            return;
        }
        const season = this.worldQualities.HEARTS_GAME_SEASON.result?.value as HeartsGameSeason;
        if (season) {
            const distinctionKey = HEARTS_GAME_SEASON_TO_DISTINCTION[season];
            if (this.characterQualities[distinctionKey]?.value) {
                let nextMissingDistinction;
                const seasons = Object.keys(HEARTS_GAME_SEASON_TO_DISTINCTION) as HeartsGameSeason[];
                let idx = seasons.indexOf(season) + 1;
                if (idx >= seasons.length) {
                    idx = 0;
                }
                const upcomingSeasons = seasons.slice(idx).concat(seasons.slice(0, idx));
                for (const upcomingSeason of upcomingSeasons) {
                    const upcomingDistinctionKey = HEARTS_GAME_SEASON_TO_DISTINCTION[upcomingSeason];
                    if (!this.characterQualities[upcomingDistinctionKey]?.value) {
                        nextMissingDistinction = upcomingSeason;
                        break;
                    }
                }
                if (nextMissingDistinction) {
                    const currentSeasonIdx = upcomingSeasons.indexOf(season);
                    let targetSeasonIdx = upcomingSeasons.indexOf(nextMissingDistinction);
                    if (currentSeasonIdx > targetSeasonIdx) {
                        targetSeasonIdx += seasons.length;
                    }
                    const seasonChangesNeeded = targetSeasonIdx - currentSeasonIdx;
                    const now = new Date();
                    let changeDate = this.getNextHeartsGameReset(now);
                    for (let i = 1; i < seasonChangesNeeded; i++) { //start on i = 1 because we've already done one change
                        changeDate.setUTCDate(changeDate.getUTCDate() + 1);
                        changeDate = this.getNextHeartsGameReset(changeDate);
                    }
                    const remainingTime = this.calculateRemainingTime(changeDate.getTime());
                    heartsGameItem.textContent = `You have this season's Hearts' Game Distinction. Next season you need the Distinction from is ${remainingTime}`;
                } else {
                    heartsGameItem.textContent = `You have all seasons' Hearts' Game Distinctions.`;
                }
            } else {
                const now = new Date();
                const changeTime = this.getNextHeartsGameReset(now).getTime();
                const remainingTime = this.calculateRemainingTime(changeTime);
                heartsGameItem.textContent = `You don't have this season's Hearts' Game Distinction. Season changes ${remainingTime}`;
            }
        }
    }

    getNextHeartsGameReset(start: Date): Date {
        const changeDate = new Date(this.getNextDay(start, this.worldQualities.HEARTS_GAME_SEASON.resetDay));
        while (changeDate.getUTCDate() > 7) {
            changeDate.setUTCDate(changeDate.getUTCDate() + 7);
        }
        return changeDate;
    }

    getNextExceptionalStoryDate(start: Date, iteration = 0): Date {
        const changeDate = new Date(this.getNextDay(start, DAYS.THURSDAY));
        while (changeDate.getUTCDate() > 7) {
            changeDate.setUTCDate(changeDate.getUTCDate() + 7);
        }
        changeDate.setUTCDate(changeDate.getUTCDate() - 7);
        if (changeDate.getTime() < start.getTime()) {
            if (iteration > 5) {
                return changeDate;//just trying to stop an infinite loop
            }
            changeDate.setUTCDate(changeDate.getUTCDate() + 7);
            return this.getNextExceptionalStoryDate(changeDate, iteration++);
        } else {
            return changeDate;
        }
    }

    private populateNotabilityItems(losingNotability?: HTMLLIElement, currentBdrItem?: HTMLLIElement, bdrRequiredItem?: HTMLLIElement) {
        if (!losingNotability) {
            losingNotability = (document.getElementById("losing-notability-item") as HTMLLIElement);
        }
        if (!currentBdrItem) {
            currentBdrItem = (document.getElementById("current-bdr-item") as HTMLLIElement);
        }
        if (!bdrRequiredItem) {
            bdrRequiredItem = (document.getElementById("bdr-required-item") as HTMLLIElement);
        }
        if (!losingNotability || !currentBdrItem || !bdrRequiredItem) {
            return; // don't need to update them if they don't exist
        }
        const currentMakingWaves = this.characterQualities.MAKING_WAVES.value;
        const currentNotability = this.characterQualities.NOTABILITY.value;
        if (currentMakingWaves < currentNotability) {
            losingNotability.textContent = `You will lose Notability! (${currentMakingWaves} MW < ${currentNotability} Nota)`;
        }
        const highestBDR = this.getHighestBDR();
        currentBdrItem.textContent = `Your highest BDR is ${highestBDR}.`;
        if (this.characterQualities.DREADED_BOON.value === 0 && Number(this.currentSettings.highestBDRRequiresBoon) === 1) {
            currentBdrItem.textContent += " You will need to regain the Not To Be Trifled With boon to reach this again.";
            const requiredMakingWaves = 20 - highestBDR + 1 + 4 * this.characterQualities.NOTABILITY.value;
            if (currentMakingWaves >= requiredMakingWaves) {
                bdrRequiredItem.textContent = "You can increase your Notability now.";
            } else {
                if (currentMakingWaves + 1 === requiredMakingWaves) {
                    bdrRequiredItem.textContent = `You need to regain your Dreaded boon or gain 1 more Making Waves to increase your Notability.`;
                } else {
                    bdrRequiredItem.textContent = `You need ${requiredMakingWaves - currentMakingWaves} more Making Waves to increase your Notability.`;
                }
            }
        } else {
            const requiredMakingWaves = 20 - highestBDR + 4 * this.characterQualities.NOTABILITY.value;
            if (currentMakingWaves >= requiredMakingWaves) {
                bdrRequiredItem.textContent = "You can increase your Notability now.";
            } else {
                bdrRequiredItem.textContent = `You need ${requiredMakingWaves - currentMakingWaves} more Making Waves to increase your Notability.`;
            }
        }
    }

    getHighestBDR(): number {
        const currentBDR = this.getBDR();
        const highestBDR = Number(this.currentSettings.highestBDR);
        if (!highestBDR || currentBDR >= highestBDR) {
            this.currentSettings.highestBDR = currentBDR.toString();
            this.currentSettings.highestBDRRequiresBoon = this.characterQualities.DREADED_BOON.value.toString();
            sendToServiceWorker(MSG_TYPE_SAVE_SETTINGS, { settings: this.currentSettings });
        }
        return Number(this.currentSettings.highestBDR);
    }

    getBDR(): number {
        return this.characterEffectiveQualities.BIZARRE.value + this.characterEffectiveQualities.DREADED.value + this.characterEffectiveQualities.RESPECTABLE.value;
    }

    buildLivingStoryPanel(): HTMLUListElement {
        const livingStoryPanel = document.createElement("ul");
        livingStoryPanel.id = "living-story-panel";
        livingStoryPanel.classList.add("items", "items--list");
        if (this.currentSettings.wellspring && this.characterQualities.DISCOVERED_WELLSPRING.value) {
            const wellspringItem = document.createElement("li");
            wellspringItem.id = "wellspring-item";
            if (this.characterQualities.GLOWING_VIRIC.value) {
                let remainingText;
                if (this.currentSettings.nextWellspringISOString) {
                    remainingText = this.calculateRemainingTimeFromIsoOrNumberString(this.currentSettings.nextWellspringISOString);
                } else {
                    remainingText = "in an unknown time, up to seven days.";
                }
                wellspringItem.textContent = `You can visit the Wellspring of Moulin ${remainingText}`;
            } else {
                wellspringItem.textContent = "You can visit the Wellspring of Moulin now.";
            }
            livingStoryPanel.appendChild(wellspringItem);
        }
        if (this.currentSettings.waswood) {
            const waswoodPanel = this.buildWaswoodPanel();
            livingStoryPanel.appendChild(waswoodPanel);
        }

        if (this.currentSettings.house_of_chimes) {
            const chimesItem = document.createElement("li");
            chimesItem.id = "chimes-item";
            if (this.characterQualities.VOTES_ALLOWED.value) {
                const cast = this.characterQualities.VOTES_CAST.value;
                const remaining = this.characterQualities.VOTES_ALLOWED.value - cast;
                if (remaining) {
                    chimesItem.textContent = `You have ${remaining} votes remaining at the House of Chimes.`;
                } else {
                    chimesItem.textContent = `All House of Chimes votes used.`;
                }
                if (this.currentSettings.nextChimesISOString) {
                    chimesItem.textContent += ` Votes will refresh ${this.calculateRemainingTimeFromIsoOrNumberString(this.currentSettings.nextChimesISOString)}`;
                } else {
                    chimesItem.textContent += ` Could not determine when votes will refresh.`
                }
            }
            livingStoryPanel.appendChild(chimesItem);
        }

        if (this.currentSettings.balmoral && this.characterQualities.BALMORAL_CASTELLAN.value) {
            const balmoralItem = document.createElement("li");
            balmoralItem.id = "balmoral-item";
            if (this.characterQualities.BALMORAL_GIFT.value) {
                let remainingText;
                if (this.currentSettings.nextBalmoralISOString) {
                    remainingText = this.calculateRemainingTimeFromIsoOrNumberString(this.currentSettings.nextBalmoralISOString);
                } else {
                    remainingText = "in an unknown time, up to seven days.";
                }
                balmoralItem.textContent = `You can receive a gift from Balmoral ${remainingText}`;
            } else {
                balmoralItem.textContent = "You can receive a gift from Balmoral now.";
            }
            livingStoryPanel.appendChild(balmoralItem);
        }

        if (this.currentSettings.khanate && this.characterQualities.AGENT.value) {
            const khanateDiv = this.createKhanateDiv();

            livingStoryPanel.appendChild(khanateDiv);
        }
        if (this.currentSettings.chimes_boons) {
            const chimesBoons = document.createElement("div");
            for (const [id, boonName] of Object.entries(CHIMES_BOONS_BRANCHES)) {
                if (this.currentSettings[boonName]) {
                    const expiryDate = this.currentSettings[boonName];
                    if (new Date(expiryDate as string).getTime() > new Date().getTime()) {
                        const boonItem = document.createElement("li");
                        boonItem.id = `chimes-item-${id}`;
                        const remaining = this.calculateRemainingTimeFromIsoOrNumberString(expiryDate);
                        boonItem.textContent = `${boonName} will expire ${remaining}`;
                        chimesBoons.appendChild(boonItem);
                    }
                }
            }
            livingStoryPanel.appendChild(chimesBoons);
        }
        //todo need a setting to turn this feature on/off
        for (const [title, livingStory] of Object.entries(MISC_LIVING_STORIES)) {
            if (this.currentSettings[title]) {
                const livingStoryDiv = document.createElement("div");
                const remaining = this.calculateRemainingTimeFromIsoOrNumberString(this.currentSettings[title]);
                livingStoryDiv.textContent = `${livingStory.story} will complete ${remaining}`;
                livingStoryPanel.appendChild(livingStoryDiv);
            }
        }

        return livingStoryPanel;
    }

    buildWaswoodPanel(): HTMLElement {
        if (!this.worldQualities.SEASON_OF_THE_SACROBOSCAN_CALENDAR.result) {
            const failure = document.createElement("div");
            failure.textContent = "Could not get Waswood season.";
            return failure;
        }
        const waswoodPanel = document.createElement("div");
        if (this.worldQualities.SEASON_OF_THE_SACROBOSCAN_CALENDAR.blindspot) {
            waswoodPanel.textContent = `The Season of the Sacroboscan Calendar World Quality is changing now, which can lead to inaccuracies. Try again in around 30 minutes.`;
            return waswoodPanel;
        }
        const waswoodHeader = document.createElement("h4");
        waswoodHeader.textContent = "Waswood";
        waswoodPanel.appendChild(waswoodHeader);
        const waswoodList = document.createElement("ul");
        waswoodList.classList.add("items", "items--list");
        if (this.characterQualities.JAUNT_WASWOOD.value) {
            const waswoodBlocked = document.createElement("li");
            if (this.currentSettings.nextWaswoodISOString) {
                const unblocked = new Date(this.currentSettings.nextWaswoodISOString as string);
                if (unblocked.getTime() > new Date().getTime()) {
                    const remaining = this.calculateRemainingTime(unblocked.getTime());
                    waswoodBlocked.textContent = `Waswood will open ${remaining}`;
                } else {
                    waswoodBlocked.textContent = `Waswood will open in 0 to 7 days.`;
                }
            } else {
                waswoodBlocked.textContent = `Waswood will open in 0 to 7 days.`;
            }
            waswoodList.appendChild(waswoodBlocked);
        }
        let startAt = Number(this.worldQualities.SEASON_OF_THE_SACROBOSCAN_CALENDAR.result.value);
        if (startAt >= 4 && startAt <= 7) {
            startAt = 8;
        }
        const keys = Object.keys(WASWOOD_ITEMS).sort((a, b) => { return Number(a) - Number(b); }) as SeasonWithItems[];
        while (Number(keys[0]) !== startAt) {
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            keys.push(keys.shift()!);
        }
        for (const key of keys) {
            for (const item of (WASWOOD_ITEMS[key])) {
                if (this.characterQualities[item].value === 0) {
                    const missingItem = this.characterQualities[item];
                    const waswoodListItem = document.createElement("li");
                    let nextAvailable = "";
                    const nextWaswoodReset = this.getNextDay(new Date(), DAYS.THURSDAY);
                    const currentWeek = Number(this.worldQualities.SEASON_OF_THE_SACROBOSCAN_CALENDAR.result.value);
                    let targetWeek = Number(key);
                    if (currentWeek === targetWeek) {
                        if (this.characterQualities.JAUNT_WASWOOD.value) {
                            if (this.currentSettings.nextWaswoodMoment) {
                                if (nextWaswoodReset < Number(this.currentSettings.nextWaswoodMoment)) {
                                    nextAvailable = this.calculateRemainingTime(nextWaswoodReset);
                                } else {
                                    const wholeWeeksToWait = 8;
                                    const nextTimeForThisEvent = nextWaswoodReset + wholeWeeksToWait * SEVEN_DAYS_IN_MILLISECONDS;
                                    nextAvailable = this.calculateRemainingTime(nextTimeForThisEvent);
                                }
                            } else {
                                nextAvailable = `as soon as the Waswood living story clears.`;
                            }
                        } else {
                            nextAvailable = "now.";
                        }
                    } else {
                        if (currentWeek > targetWeek) {
                            targetWeek += 9;
                        }
                        const wholeWeeksToWait = targetWeek - currentWeek - 1;
                        const nextTimeForThisEvent = nextWaswoodReset + wholeWeeksToWait * SEVEN_DAYS_IN_MILLISECONDS;
                        nextAvailable = this.calculateRemainingTime(nextTimeForThisEvent);
                    }

                    waswoodListItem.textContent = `${missingItem.name} is available ${nextAvailable}`;
                    waswoodList.appendChild(waswoodListItem);
                }
            }
        }

        waswoodPanel.appendChild(waswoodList);
        return waswoodPanel;
    }

    private createKhanateDiv() {
        const now = new Date().getTime();
        let nextKhanateReport = "";
        if (this.characterQualities.AGENT.value && !this.characterQualities.KHAGANS_PALACE_REPORT.value) {
            nextKhanateReport = "A 'report' is waiting for you in Khanate.";
        } else {
            //Report is not ready
            const nextKhanateMoment = this.currentSettings.nextKhanateISOString ? new Date(this.currentSettings.nextKhanateISOString as string).getTime() : undefined;
            if (nextKhanateMoment && nextKhanateMoment > now) {
                //Saved moment suggests the report will be ready in future
                nextKhanateReport = this.calculateRemainingTime(nextKhanateMoment);
            } else {
                //No saved moment, or moment in past. Check backup (taken from messages)

                const backupString = this.backupMoments.get(MESSAGE_STRINGS.KHANATE_MESSAGE);
                if (backupString) {
                    const nextBackupDate = new Date(this.backupMoments.get(MESSAGE_STRINGS.KHANATE_MESSAGE) as string);
                    nextBackupDate.setUTCDate(nextBackupDate.getUTCDate() + 7);
                    const nextBackupMoment = nextBackupDate.getTime();
                    if (nextBackupDate.getTime() > now) {
                        //Backup moment looks good, save it and use it
                        this.currentSettings.nextKhanateISOString = nextBackupDate.toISOString();
                        sendToServiceWorker(MSG_TYPE_SAVE_SETTINGS, { settings: this.currentSettings });
                        nextKhanateReport = this.calculateRemainingTime(nextBackupMoment);
                    }
                }
            }
            if (nextKhanateReport) {
                nextKhanateReport = "A 'report' from Khagan's Palace is due " + nextKhanateReport;
            } else {
                nextKhanateReport = "Unable to determine the next Khaganian 'report'. Consider entering an estimate.";
            }
        }

        const khanateDiv = document.createElement("div");
        const nextReportMessage = document.createElement("span");
        nextReportMessage.id = "next-khanate-report-message";
        nextReportMessage.textContent = nextKhanateReport;

        khanateDiv.appendChild(nextReportMessage);
        return khanateDiv;
    }

    createSettingsModal() {
        //todo add options to manually enter any recurring time (I think this can ignore the one-off living stories)
        if (document.getElementById("timekeeper-modal")) {
            return;
        }
        const timekeeperModal = document.createElement("dialog");
        document.body.appendChild(timekeeperModal);
        timekeeperModal.setAttribute("id", "timekeeper-modal");

        const modalWrapperDiv = document.createElement("div");
        const modalForm = document.createElement("form");
        modalForm.setAttribute("method", "dialog");

        //const khanateLabel = document.createElement("label");
        //khanateLabel.textContent = "Enter an estimate of the next time a 'report' will be available. It should be in UTC time.";
        //khanateLabel.htmlFor = "khanate-date-picker";

        //const khanateDatePicker = this.generateDatePicker();

        //const khanateConfirm = this.generateDatePickerConfirmButton();

        //const tthButton = document.createElement("button");
        //tthButton.textContent = "Clear TTH timer";
        //tthButton.classList.add("js-tt", "button", "button--primary", "button--go");
        //tthButton.style.padding = "2px 5px";
        //tthButton.addEventListener("click", () => {
        //    sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { nextTthISOString: null } });
        //});

        timekeeperModal.appendChild(modalWrapperDiv);
        modalWrapperDiv.appendChild(modalForm);
        //modalForm.appendChild(khanateLabel);
        //khanateLabel.appendChild(khanateDatePicker);
        //modalForm.appendChild(khanateConfirm);
        //modalForm.appendChild(tthButton);
        timekeeperModal.addEventListener("click", (event) => {
            if (event.target === (document.getElementById("timekeeper-modal") as HTMLDialogElement)) {
                (document.getElementById("timekeeper-modal") as HTMLDialogElement).close();
            }
        });
        const settingsList = document.createElement("ul");
        modalForm.appendChild(settingsList);

        for (const key of timekeeperSettings) {
            const settingsItem = document.createElement("li");
            settingsItem.textContent = `[${key}]: ${this.currentSettings[key]}`;
            settingsList.appendChild(settingsItem);
            if (key.endsWith("ISOString")) {
                settingsList.appendChild(this.generateDatePicker(key));
                settingsList.appendChild(this.generateDatePickerConfirmButton(key));
            }
            const clearButton = document.createElement("button");
            clearButton.textContent = `Clear ${key}`;
            clearButton.addEventListener("click", () => {
                sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { [key]: "" } });
            });
            clearButton.classList.add("js-tt", "button", "button--primary", "button--go");
            clearButton.style.padding = "2px 5px";
            settingsList.appendChild(clearButton);
        }
        const worldQualities: Record<WorldQualityName, WorldQuality> = JSON.parse(this.currentSettings.worldQualities as string);
        for (const [key, val] of Object.entries(worldQualities)) {
            const wqItem = document.createElement("li");
            const timestamp = val.result ? new Date(val.result.timestamp).toISOString() : "unknown";
            wqItem.textContent = `[${key}]: ${val.result?.value}, timestamp: ${timestamp}, blindspot: ${val.blindspot}`;
            settingsList.appendChild(wqItem);
        }
        const clearButton = document.createElement("button");
        clearButton.textContent = `Clear World Qualities`;
        clearButton.addEventListener("click", () => {
            sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { worldQualities: "" } });
        });
        settingsList.appendChild(clearButton);
        clearButton.classList.add("js-tt", "button", "button--primary", "button--go");
        clearButton.style.padding = "2px 5px";

        const charQuals = document.createElement("li");
        for (const [name, qual] of Object.entries(this.characterQualities)) {
            charQuals.textContent += `{${name}: ${qual.value}}, `
        }
        for (const [name, qual] of Object.entries(this.characterEffectiveQualities)) {
            charQuals.textContent += `{${name}: ${qual.value}}, `;
        }
        settingsList.appendChild(charQuals);

        timekeeperModal.style.padding = "0";
        modalWrapperDiv.style.margin = "0";
        modalWrapperDiv.style.padding = "1rem";

        const timekeeperModalCancel = document.createElement("button");
        timekeeperModalCancel.textContent = "Cancel";
        timekeeperModalCancel.addEventListener("click", () => {
            (document.getElementById("timekeeper-modal") as HTMLDialogElement).close();
        });
        timekeeperModalCancel.classList.add("js-tt", "button", "button--primary", "button--go");
        timekeeperModalCancel.style.padding = "2px 5px";
        modalForm.appendChild(timekeeperModalCancel);
    }

    private generateDatePickerConfirmButton(name: string) {
        const confirmButton = document.createElement("button");
        confirmButton.textContent = "Confirm";
        confirmButton.addEventListener("click", () => {
            const nextISOString = (document.getElementById(`${name}-date-picker`) as HTMLInputElement).value + "Z";
            //this.currentSettings[name] = new Date(nextISOString).toISOString();
            sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { [name]: nextISOString } });
            //const nextKhanateReport = "A 'report' from Khagan's Palace is due " + this.calculateRemainingTimeFromIsoOrNumberString(nextISOString);
            //const nextKhanateReportSpan = document.getElementById("next-khanate-report-message");
            //if (nextKhanateReportSpan) {
            //    nextKhanateReportSpan.textContent = nextKhanateReport;
            //}
            (document.getElementById("timekeeper-modal") as HTMLDialogElement).close();
        });
        confirmButton.classList.add("js-tt", "button", "button--primary", "button--go");
        confirmButton.style.padding = "2px 5px";
        return confirmButton;
    }

    private generateDatePicker(name: string) {
        const datePicker = document.createElement("input");
        const now = new Date();
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);

        datePicker.id = `${name}-date-picker`;
        datePicker.type = "datetime-local";
        datePicker.value = now.toISOString().slice(0, -1);
        if (name.includes("Chimes")) {
            datePicker.max = new Date(now.getTime() + 4 * SEVEN_DAYS_IN_MILLISECONDS).toISOString().slice(0, -1);
        } else {
            datePicker.max = new Date(now.getTime() + SEVEN_DAYS_IN_MILLISECONDS).toISOString().slice(0, -1);
        }
        datePicker.min = now.toISOString().slice(0, -1);
        datePicker.step = "900";
        return datePicker;
    }

    getNextDay(startDate: Date, day: number) {

        const nextResetDay = new Date();
        nextResetDay.setUTCFullYear(startDate.getUTCFullYear());
        nextResetDay.setUTCMonth(startDate.getUTCMonth());
        nextResetDay.setUTCHours(11, 0, 0, 0);
        if (startDate.getUTCDay() == day) {
            if (startDate.getUTCHours() < 11) {
                nextResetDay.setUTCDate(startDate.getUTCDate());
            } else {
                nextResetDay.setUTCDate(startDate.getUTCDate() + 7);
                //next reset is nearly 7 days away
            }
        } else {
            nextResetDay.setUTCDate(startDate.getUTCDate() + (day + 7 - startDate.getUTCDay()) % 7);
            //next reset is 1-6 days away
        }
        return nextResetDay.getTime();
    }

    buildBoneMarketPanel(): HTMLElement {
        const boneMarketPanel = document.createElement("div");
        if (this.worldQualities.BONE_MARKET_FLUCTUATIONS.blindspot) {
            boneMarketPanel.textContent = `The Bone Market's World Qualities are changing now, which can lead to inaccuracies. Try again in around 30 minutes.`;
            return boneMarketPanel;
        }
        const boneMarketHeader = document.createElement("h4");
        boneMarketHeader.textContent = "Bone Market";
        const boneMarketList = document.createElement("ul");
        boneMarketList.classList.add("items", "items--list");
        const preferredQualityItem = document.createElement("li");
        const preferredQuality = this.worldQualities.BONE_MARKET_FLUCTUATIONS.result?.value;
        preferredQualityItem.textContent = `Preferred Quality: ${preferredQuality}`;
        const zoologicalManiaItem = document.createElement("li");
        const zoologicalMania = this.worldQualities.ZOOLOGICAL_MANIA.result?.value;
        zoologicalManiaItem.textContent = `Zoological Mania: ${zoologicalMania}`;
        const refreshItem = document.createElement("li");

        refreshItem.textContent = `These values will change ${this.calculateRemainingTime(this.getNextDay(new Date(), DAYS.TUESDAY))}`;

        const currentExhaustion = this.characterQualities.BONE_MARKET_EXHAUSTION.value;
        const exhaustionItem = document.createElement("li");
        exhaustionItem.textContent = `You have ${currentExhaustion} exhaustion`;
        if (this.currentSettings.nextTthISOString) {
            exhaustionItem.textContent += `, reducing by 4 ${this.calculateRemainingTimeFromIsoOrNumberString(this.currentSettings.nextTthISOString)}`;
        }

        boneMarketPanel.appendChild(boneMarketHeader);
        boneMarketPanel.appendChild(boneMarketList);
        boneMarketList.appendChild(preferredQualityItem);
        boneMarketList.appendChild(zoologicalManiaItem);
        boneMarketList.appendChild(refreshItem);
        boneMarketList.appendChild(exhaustionItem);
        return boneMarketPanel;
    }

    buildRatMarketPanel(): HTMLElement {
        const ratMarketPanel = document.createElement("div");
        if (this.worldQualities.SAINTLY_DEMAND.blindspot) {
            ratMarketPanel.textContent = `The Rat Market's World Qualities are changing now, which can lead to inaccuracies. Try again in around 30 minutes.`;
            return ratMarketPanel;
        }
        const ratMarketHeader = document.createElement("h4");
        ratMarketHeader.textContent = "Rat Market";
        ratMarketPanel.appendChild(ratMarketHeader);
        const ratMarketList = document.createElement("ul");
        ratMarketList.classList.add("items", "items--list");
        const now = new Date();
        let open: boolean;
        switch (now.getUTCDay()) {
            case 6: //sat (out of place so it can fall through to sun)
                ;//fallthrough
            case 0: //sun
                open = true;
                break;
            case 1: //mon
                open = now.getUTCHours() < 11;
                break;
            case 2: //tues
                ;//fallthrough
            case 3: //wed
                ; //fallthrough
            case 4: //thur
                open = false;
                break;
            case 5: //fri
                open = now.getUTCHours() >= 11;
                break;
            default:
                console.error("uh oh"); //I don't see how this can happen, so just make the compiler happy
                return document.createElement("div"); //return an empty div?
        }
        const ratMarketOpenItem = document.createElement("li");
        ratMarketOpenItem.textContent = open ? "The Rat Market is Open." : "The Rat Market is Closed.";
        ratMarketList.appendChild(ratMarketOpenItem);
        const tillNextRefresh = this.calculateRemainingTime(this.getNextDay(new Date(), DAYS.MONDAY));
        
        if (open) {
            const saturationItem = document.createElement("li");
            const currentSaturation = this.characterQualities.RAT_MARKET_SATURATION.value;
            saturationItem.textContent = `Current Rat Market Saturation: ${currentSaturation}.`;
            if (currentSaturation < 65000) {
                saturationItem.textContent += ` ${65000 - currentSaturation} saturation remaining at maximum markup.`;
            } else if (currentSaturation < 180000) {
                saturationItem.textContent += ` ${180000 - currentSaturation} saturation remaining at small markup.`;
            } else {
                saturationItem.textContent += ` No markup remaining.`
            }
            ratMarketList.appendChild(saturationItem);
            const closingItem = document.createElement("li");
            closingItem.textContent = `Closing ${tillNextRefresh}`;
            ratMarketList.appendChild(closingItem);
        } else {
            const openingItem = document.createElement("li");
            openingItem.textContent = `Opening ${this.calculateRemainingTime(this.getNextDay(new Date(), DAYS.FRIDAY))}`;
            ratMarketList.appendChild(openingItem);
        }
        let totalSellPrice = 0;
        const buyingFourthCityItem = document.createElement("li");
        buyingFourthCityItem.textContent = "Always buying Fourth City Echoes for 125 Rat-Shillings.";
        ratMarketList.appendChild(buyingFourthCityItem);
        totalSellPrice += 125 * (this.currentState.getQualityById(RAT_MARKET_BUYING.ALWAYS[0].id)?.level || 0);
        for (const [demand, items] of Object.entries(RAT_MARKET_BUYING)) {
            const available = this.worldQualities[demand as WorldQualityName]?.result?.value;
            if (available === "1" || available === "2") {
                for (const item of items) {
                    let owned;
                    if (item.id == 140970) { //special case for pairs of epaulette and queen mates
                        owned = Math.min(this.currentState.getQualityById(140970)?.level || 0, this.currentState.getQualityById(140971)?.level || 0)
                    } else {
                        owned = this.currentState.getQualityById(item.id)?.level || 0;
                    }
                    const ratMarketBuyingItem = document.createElement("li");
                    ratMarketBuyingItem.textContent = `Buying ${item.name} for ${item.price}-${item.price * 1.32} Rat-Shillings. You have ${owned}.`;
                    ratMarketBuyingItem.textContent += available === "1" ? ` Also buying next week.` : ` Last week.`;
                    totalSellPrice += item.price * owned;
                    ratMarketList.appendChild(ratMarketBuyingItem);
                }
            }
        };
        let sellPriceMarkedUp = 0;
        if (totalSellPrice > 18000) { //over 1800 echoes there's no markup
            sellPriceMarkedUp += (totalSellPrice - 18000);
        }
        if (totalSellPrice > 6500) { //650-1800 echoes there's 12% markup
            sellPriceMarkedUp += (Math.min(totalSellPrice, 18000) - 6500) * 1.12;
        }
        sellPriceMarkedUp += Math.min(totalSellPrice, 6500) * 1.32;
        const sellPriceListItem = document.createElement("li");
        sellPriceListItem.textContent = `Sale price of all sellable items is ${sellPriceMarkedUp} Rat-Shillings.`;
        ratMarketList.appendChild(sellPriceListItem);

        const wind = this.worldQualities.DIRECTION_OF_THE_RAT_WIND.result?.value as RatWind;
        const moon = this.worldQualities.PHASE_OF_THE_RAT_MOON.result?.value as RatMoon;
        const ratSeason = this.worldQualities.THE_RAT_SEASON.result?.value as RatSeason;
        const falseSeason = this.worldQualities.THE_FALSE_SEASON.result?.value as FalseSeason;
        const sellingCategories: RatSellingCategory[] = [wind, moon, ratSeason, falseSeason];
        for (const category of sellingCategories) {
            for (const item of RAT_MARKET_SELLING[category]) {
                const sellingItem = document.createElement("li");
                const current = this.currentState.getQualityById(item.id)?.level || 0;
                sellingItem.textContent = `Selling ${item.name} for ${item.price} Rat-shillings. You currently have ${current}.`;
                ratMarketList.appendChild(sellingItem);
            }
        }
        //special case
        if (this.worldQualities.TEMPESTUOUS_DEMAND.result?.value === "1" || this.worldQualities.TEMPESTUOUS_DEMAND.result?.value === "2") {
            const sellingItem = document.createElement("li");
            const item = RAT_MARKET_ITEMS.GANT;
            const current = this.currentState.getQualityById(item.id)?.level || 0;
            sellingItem.textContent = `Selling ${item.name} for ${item.price} Rat-shillings. You currently have ${current}.`;
            ratMarketList.appendChild(sellingItem);
        }

        const nextRefreshItem = document.createElement("li");
        nextRefreshItem.textContent = `New items will be selected ${tillNextRefresh}`;
        ratMarketList.appendChild(nextRefreshItem);

        ratMarketPanel.appendChild(ratMarketList);
        return ratMarketPanel;
    }

    onNodeRemoved(_node: HTMLElement): void {
        ;//do nothing
    }

    checkEligibility(_node: HTMLElement): boolean {
        if (!this.displayTimekeeping) {
            return false;
        }
        if (document.getElementById("main") == null) {
            return false;
        }
        if (!this.currentSettings) {
            console.log("no settings");
            return false;
        }
        if (!this.currentState) {
            console.log("no state");
            return false;
        }
        return document.getElementById("timekeeper-panel") == null;
    }

    applySettings(settings: SettingsObject): void {
        this.currentSettings = settings;
        this.displayTimekeeping = this.currentSettings.display_timekeeping as boolean;
        if (this.displayTimekeeping && this.currentSettings.nextTthISOString) {
            const tthListItem = document.getElementById("tth-remaining-item");
            if (tthListItem) {
                const tthDate = new Date(this.currentSettings.nextTthISOString as string);
                //if tth in the past, add 7 days
                if (tthDate.getTime() < new Date().getTime() + MILLISECONDS_IN_MINUTE * 10) {
                    tthDate.setTime(tthDate.getTime() + SEVEN_DAYS_IN_MILLISECONDS);
                    sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { nextTthISOString: tthDate.toISOString() } });
                }
                
                const remainingText = this.calculateRemainingTime(tthDate.getTime());
                tthListItem.textContent = `Time the Healer cometh ${remainingText}`;
            }
        }
        if (this.currentSettings.worldQualities) {
            this.worldQualities = JSON.parse(this.currentSettings.worldQualities as string);
            const dirty = this.removeOutdatedWorldQualities(new Date());
            if (dirty) {
                sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { worldQualities: JSON.stringify(this.worldQualities) } });
            }
        }

        const missingWorldQualities: string[] = [];

        Object.values(this.worldQualities).forEach((quality) => {
            if (!quality.result && !quality.blindspot) {
                missingWorldQualities.push(quality.name);
            }
        });

        if (missingWorldQualities.length > 0 && !this.waitingOnApi) {
            const qualityString = JSON.stringify(missingWorldQualities);

            sendToServiceWorker(MSG_TYPE_WIKI_API_CALL, { missingQualities: qualityString });
            this.waitingOnApi = true;
        }
        for (const key of Object.keys(MISC_LIVING_STORIES)) {
            if (this.currentSettings[key]) {
                this.activeLivingStories[key] = this.currentSettings[key] as string;
            }
        }
    }
    
    removeOutdatedWorldQualities(now: Date): boolean {
        let dirty = false;
        for (const [name, quality] of Object.entries(this.worldQualities)) {
            if (quality.result) {
                const retrievedTime = new Date(quality.result.timestamp);
                if (name === "SEASON_OF_THE_SACROBOSCAN_CALENDAR") {
                    if (retrievedTime.getUTCDay() === quality.resetDay && retrievedTime.getUTCHours() === 14 && retrievedTime.getUTCMinutes() < 50) {
                        //result was retrieved during blindspot, may be up to date, or not, best delete it.
                        quality.result = undefined;
                        dirty = true;
                    }
                } else {
                    if (retrievedTime.getUTCDay() === quality.resetDay && retrievedTime.getUTCHours() === 11 && retrievedTime.getUTCMinutes() < 50) {
                        //result was retrieved during blindspot, may be up to date, or not, best delete it.
                        quality.result = undefined;
                        dirty = true;
                    }
                }
                let changeTime;
                if (name === "HEARTS_GAME_SEASON") {
                    changeTime = this.getNextHeartsGameReset(retrievedTime).getTime();
                } else {
                    changeTime = this.getNextDay(retrievedTime, quality.resetDay);
                }
                if (name === "SEASON_OF_THE_SACROBOSCAN_CALENDAR") {
                    const temp = new Date(changeTime);
                    temp.setUTCHours(14);
                    changeTime = temp.getTime();
                }
                if (name === "HEARTS_GAME_SEASON") {
                    //wiki takes a long time to update this, let's say 1 day
                    if (now.getTime() > changeTime + MILLISECONDS_IN_DAY) {
                        if (quality.result) {
                            dirty = true;
                        }
                        quality.result = undefined;
                        quality.blindspot = false;
                    }

                    if (now.getTime() > changeTime && now.getTime() < changeTime + MILLISECONDS_IN_DAY) {
                        if (quality.result || !quality.blindspot) {
                            dirty = true;
                        }
                        quality.blindspot = true;
                        quality.result = undefined;
                    } else {
                        if (quality.blindspot) {
                            dirty = true;
                        }
                        quality.blindspot = false;
                    }
                } else {
                    //wiki takes about 15 minutes to update - todo add a notification when this happens
                    if (now.getTime() > changeTime + 50 * MILLISECONDS_IN_MINUTE) {
                        if (quality.result) {
                            dirty = true;
                        }
                        quality.result = undefined;
                        quality.blindspot = false;
                    }

                    if (now.getTime() > changeTime && now.getTime() < changeTime + 50 * MILLISECONDS_IN_MINUTE) {
                        if (quality.result || !quality.blindspot) {
                            dirty = true;
                        }
                        quality.blindspot = true;
                        quality.result = undefined;
                    } else {
                        if (quality.blindspot) {
                            dirty = true;
                        }
                        quality.blindspot = false;
                    }
                }
            } else {
                if (now.getUTCDay() === quality.resetDay && now.getUTCHours() === 11 && now.getUTCMinutes() < 50) {
                    if (!quality.blindspot) {
                        dirty = true;
                    }
                    quality.blindspot = true;
                } else {
                    if (quality.blindspot) {
                        dirty = true;
                    }
                    quality.blindspot = false;
                }
            }
        }
        return dirty;
    }

    linkNetworkTools(interceptor: FLApiInterceptor): void {
        interceptor.onResponseReceived("/api/storylet/choosebranch", (request, response) => {
            if (!response.messages) {
                return;
            }

            if (KHANATE_REPORT_BRANCH_IDS.includes(request.branchId)) {
                const nextKhanateMoment = new Date().getTime() + SEVEN_DAYS_IN_MILLISECONDS + EVENT_TRIGGER_LEEWAY;
                sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { nextKhanateISOString: new Date(nextKhanateMoment).toISOString() } });
            }
            if (BALMORAL_GIFT_BRANCH_IDS.includes(request.branchId)) {
                const nextBalmoralMoment = new Date().getTime() + SEVEN_DAYS_IN_MILLISECONDS + EVENT_TRIGGER_LEEWAY;
                sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { nextBalmoralISOString: new Date(nextBalmoralMoment).toISOString() } });
            }

            if (WELLSPRING_BRANCH_IDS.includes(request.branchId)) {
                const nextWellspringMoment = new Date().getTime() + SEVEN_DAYS_IN_MILLISECONDS + EVENT_TRIGGER_LEEWAY;
                sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { nextWellspringISOString: new Date(nextWellspringMoment).toISOString() } });
            }
            if (WASWOOD_CALENDAR_BRANCH_IDS.includes(request.branchId)) {
                const nextWaswoodMoment = new Date().getTime() + SEVEN_DAYS_IN_MILLISECONDS + EVENT_TRIGGER_LEEWAY;
                sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { nextWaswoodISOString: new Date(nextWaswoodMoment).toISOString() } });
            }
            if (CHIMES_BOONS_BRANCH_IDS.includes(request.branchId)) {
                const boonExpires = new Date().getTime() + SEVEN_DAYS_IN_MILLISECONDS + EVENT_TRIGGER_LEEWAY;
                const boonName = CHIMES_BOONS_BRANCHES[request.branchId]
                sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { [boonName]: new Date(boonExpires).toISOString() } });
            }
            for (const [title, livingStory] of Object.entries(MISC_LIVING_STORIES)) {
                if (livingStory.ids.includes(request.branchId)) {
                    const expiryTime = new Date().getTime() + livingStory.timer + EVENT_TRIGGER_LEEWAY;
                    sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { [title]: new Date(expiryTime).toISOString() } });
                }
            }
            return;
        });
        interceptor.onResponseReceived("/api/messages", (_, response) => {
            const data: Map<string, string> = new Map();
            for (const message of response.feedMessages) {
                if (message.description.startsWith("The apparently illustrious voting body to which you belong")) {
                    let nextChimesVote = new Date(message.date).getTime();
                    const now = new Date().getTime();
                    let iter = 0;
                    while (nextChimesVote < now && iter < 5) { //iter < 5 is just about stopping a huge loop if message.date = 0 or something
                        nextChimesVote += 4 * SEVEN_DAYS_IN_MILLISECONDS;
                        iter++;
                    }
                    if (nextChimesVote > now) {
                        data.set("nextChimesISOString", new Date(nextChimesVote).toISOString());
                    }
                } else {
                    for (const [key, messageType] of Object.entries(MESSAGE_STRINGS)) {
                        if (message.description.startsWith(messageType)) {
                            if (new Date(message.date).getTime() + SEVEN_DAYS_IN_MILLISECONDS < new Date().getTime()) {
                                break; //message is over 7 days old
                            }
                            data.set(key, message.date);
                        }
                    }
                }
            }
            if (data.size) {
                sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: Object.fromEntries(data) });
            }
        });
        interceptor.onResponseReceived("/api/settings/timethehealer", (_, response) => {
            if (response.dateTimeToExecute) {
                sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { nextTthISOString: response.dateTimeToExecute } });
            }
        });
    }
}

export { DAYS, WorldQualityName, WorldQuality };