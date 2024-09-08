/* eslint-disable @typescript-eslint/no-unused-vars */
import { IMutationAware, IStateAware } from "./base";
import { SettingsObject } from "../settings";
import { GameState, GameStateController } from "../game_state";
import { getSingletonByClassName } from "../utils";
import { MSG_TYPE_SAVE_SETTINGS, MSG_TYPE_WIKI_API_CALL } from "../constants";
import { sendToServiceWorker } from "../comms";

type ApiCallObject = { [key: string]: string | ((results: Map<string, unknown>) => void) };
type ApiCallMessage = { action: string; message: ApiCallObject };

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

    private tthMoment: null | number = null;
    private balmoralMoment = null;
    private khanateMoment = null;
    private wellspringMoment = null;
    private calendarMoment = null;

    private worldQualityNames = ["Saintly Demand", "Soft Demand", "Tempestuous Demand", "Inscrutable Demand", "Intricate Demand", "Maudlin Demand",
        "The Rat - Season:", "Direction of the Rat - Wind:", "Phase of the Rat - Moon:", "The False - Season:",
        "The Season in Soup",
        "Bone Market Fluctuations:", "Zoological Mania:",
        "Hearts' Game Season (Placeholder)",
        "Season of the Sacroboscan Calendar"];
    private knownWorldQualities: Map<string, string> = new Map()
    private currentSettings: SettingsObject | undefined;
    private displayTimekeeping = true;
    private currentState?: GameState;


    //private worldQualitiesMap;

    //private const qualities = new Map();

    // eslint-disable-next-line @typescript-eslint/no-empty-function
    constructor() {
    }

    linkState(state: GameStateController): void {
        state.onCharacterDataLoaded((g) => {
            this.currentState = g;
        });
        state.onQualityChanged((state, quality, _previous, current) => {
            this.currentState = state;
        });
    }
    onNodeAdded(node: HTMLElement): void {
        //build some html
    }
    onNodeRemoved(node: HTMLElement): void {
        ;//do nothing
    }
    checkEligibility(node: HTMLElement): boolean {
        if (!this.displayTimekeeping) {
            return false;
        }

        return getSingletonByClassName(node, "timekeeper") != null;
    }
    applySettings(settings: SettingsObject): void {
        this.currentSettings = settings;
        this.displayTimekeeping = this.currentSettings.display_timekeeping as boolean;
        if (this.currentSettings.worldQualities) {
            this.knownWorldQualities = JSON.parse(this.currentSettings.worldQualities as string)
        }
        
        const missingWorldQualities: string[] = []
        this.worldQualityNames.forEach((name) => {
            if (!this.knownWorldQualities.has(name)) {
                missingWorldQualities.push(name);
            }
        });
        console.log("sending message");
        console.log(missingWorldQualities)
        const qualityString = JSON.stringify(missingWorldQualities)


        sendToServiceWorker(MSG_TYPE_WIKI_API_CALL, { missingQualities: qualityString })
        /* injected code can't call chrome.runtime
        chrome.runtime.sendMessage({ missingQualities: qualityString }, (response) => {
            console.log("got a response!")
            console.log(response);
        });*/
    }

    makeMessage(qualities: string): ApiCallObject{
        return { missingQualities: qualities, callback: this.updateFromWiki }
    }
    
    updateFromWiki(results: Map<string, unknown>) {
        console.log(results)
        for (const key of results.keys()) {
            console.log(key)
            const value = results.get(key);
            console.log(value)
            //this.knownWorldQualities.set(key, value.printouts.)
        }
        console.log("done")
    }
}