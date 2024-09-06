/* eslint-disable @typescript-eslint/no-unused-vars */
import { IMutationAware, IStateAware } from "./base";
import { SettingsObject } from "../settings";
import { GameState, GameStateController } from "../game_state";
import { getSingletonByClassName } from "../utils";
import { MSG_TYPE_SAVE_SETTINGS } from "../constants";
import { sendToServiceWorker } from "../comms";

export class TimeKeeperFixer implements IMutationAware, IStateAware {

    private DONE = 4;
    private MILLISECONDS_IN_MINUTE = 60 * 1000;
    private MILLISECONDS_IN_HOUR = 60 * this.MILLISECONDS_IN_MINUTE;
    private SEVEN_DAYS_IN_MILLISECONDS = 7 * 24 * this.MILLISECONDS_IN_HOUR;
    // Sometimes "living story" events do not trigger strictly on the hour,
    // so it is good to give them some leeway.
    private EVENT_TRIGGER_LEEWAY = 10 * this.MILLISECONDS_IN_MINUTE;
    private BALMORAL_GIFT_BRANCH_IDS = [243583, 243592, 243600];
    private KHANATE_REPORT_BRANCH_IDS = [250681];
    private WELLSPRING_BRANCH_IDS = [244785, 244786]
    private WASWOOD_CALENDAR_BRANCH_IDS = [254769, 254764, 254597, 254763, 254765, 254599, 254598, 254767, 254768, 234347, 254844, 254842, 234348, 254510, 254511, 224801, 254843]

    private authToken = null;
    private currentUserId = null;

    private infoDisplay = null;
    private tthContainer = null;

    private tthMoment = null;
    private balmoralMoment = null;
    private khanateMoment = null;
    private wellspringMoment = null;
    private calendarMoment = null;

    private worldQualities = ["Saintly Demand", "Soft Demand", "Tempestuous Demand", "Inscrutable Demand", "Intricate Demand", "Maudlin Demand",
        "The Rat - Season:", "Direction of the Rat - Wind:", "Phase of the Rat - Moon:", "The False - Season:",
        "The Season in Soup",
        "Bone Market Fluctuations:", "Zoological Mania:",
        "Hearts' Game Season (Placeholder)",
        "Season of the Sacroboscan Calendar]"];

    //private worldQualitiesMap;

    //private const qualities = new Map();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {

    }
    linkState(state: GameStateController): void {
        throw new Error("Method not implemented.");
    }
    onNodeAdded(node: HTMLElement): void {
        throw new Error("Method not implemented.");
    }
    onNodeRemoved(node: HTMLElement): void {
        throw new Error("Method not implemented.");
    }
    checkEligibility(node: HTMLElement): boolean {
        throw new Error("Method not implemented.");
    }
    applySettings(settings: SettingsObject): void {
        throw new Error("Method not implemented.");
    }


}