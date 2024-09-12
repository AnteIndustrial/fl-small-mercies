/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { IMutationAware, INetworkAware, IStateAware } from "./base";
import { SettingsObject } from "../settings";
import { GameStateController } from "../game_state";
import { getSingletonByClassName } from "../utils";
import { MSG_TYPE_SAVE_SETTINGS, MSG_TYPE_WIKI_API_CALL, MSG_TYPE_WIKI_API_RESPONSE } from "../constants";
import { sendToServiceWorker } from "../comms";
import { WikiResult } from "../wiki";
import { FLApiInterceptor } from "../api_interceptor";

const SAINTLY_DEMAND = "Saintly Demand";
const SOFT_DEMAND = "Soft Demand";
const TEMPESTUOUS_DEMAND = "Tempestuous Demand";
const INSCRUTABLE_DEMAND = "Inscrutable Demand";
const INTRICATE_DEMAND = "Intricate Demand";
const MAUDLIN_DEMAND = "Maudlin Demand";
const THE_RAT_SEASON = "The Rat-Season:";
const DIRECTION_OF_THE_RAT_WIND = "Direction of the Rat-Wind:";
const PHASE_OF_THE_RAT_MOON = "Phase of the Rat-Moon:";
const THE_FALSE_SEASON = "The False-Season:";
const THE_SEASON_IN_SOUP = "The Season in Soup";
const BONE_MARKET_FLUCTUATIONS = "Bone Market Fluctuations:";
const ZOOLOGICAL_MANIA = "Zoological Mania:";
const HEARTS_GAME_SEASON = "Hearts' Game Season (Placeholder)";
const SEASON_OF_THE_SACROBOSCAN_CALENDAR = "Season of the Sacroboscan Calendar";
const WORLD_QUALITIES = [SAINTLY_DEMAND, SOFT_DEMAND, TEMPESTUOUS_DEMAND, INSCRUTABLE_DEMAND, INTRICATE_DEMAND, MAUDLIN_DEMAND,
    THE_RAT_SEASON, DIRECTION_OF_THE_RAT_WIND, PHASE_OF_THE_RAT_MOON, THE_FALSE_SEASON,
    THE_SEASON_IN_SOUP, BONE_MARKET_FLUCTUATIONS, ZOOLOGICAL_MANIA, HEARTS_GAME_SEASON, SEASON_OF_THE_SACROBOSCAN_CALENDAR];

const CHARACTER_QUALITIES = {
    MAKING_WAVES: "Making Waves",
    NOTABILITY: "Notability",
    BENEFICENCE: "A Beneficence",
    FREE_EVENING: "Free Evening",
    MIRED_IN_MAIL: "Mired in Mail",
    WHISPERS: "Whispers Behind Mrs Chapman's",
    A_KNOCK: "A Knock Behind the Wainscotting",
    A_SUSURRUS: "A Susurrus in the Soup Kitchen",
    UNEARTHLY_WHISPER: "An Unearthly Whisper from Below",
    BACKSTAGE: "Backstage at Mrs Chapman's",
    ACQUAINTANCE_MRS_CHAPMAN: "Acquaintance: Mrs Chapman",
    FAVOURABLE_CIRCUMSTANCE: "Favourable Circumstance",
    PAYMENT: "An Earnest of Payment",
    PROFESSIONAL_PERK: "Professional Perk",
    ROUTE_NADIR: "Route: The Cave of the Nadir",
    IRRIGO: "Irrigo",
    FLEETING_RECOLLECTIONS: "Fleeting Recollections",
    PARABOLAN_COMPANY: "Grand Parabolan Company",
    PARABOLAN_RAVAGES: "Ravages of Parabolan Warfare",
    TRUE_DENIZEN: "A True Denizen of the Neath",
    CONSEQUENCE: "A Consequence of your Ambition -", // todo this may not be working
    ROUTE_BONE_MARKET: "Route: The Bone Market",
    BONE_MARKET_EXHAUSTION: "Bone Market Exhaustion",
    DELAY_NEXT_MEETING: "Delay until the Next Board Meeting",
    RAILWAY_VENTURE: "Involved in a Railway Venture",
    BUREAUCRATIC_ADVANTAGE: "Bureaucratic Advantage",
    APPROACHING_HELL: "Approaching Hell",
    VISITOR_TO_HELL: "A Visitor to Hell",
    FLOWER_FROM_HELL: "The Flower from Hell that Grows Under Your Skin",
    STARVED_EXCHANGE: "Recent Participant in a Starved Cultural Exchange",
    ECDYSIS: "Discovered: Your Own Discarded Exuviae",
    WIDE_EYED: "Wide-Eyed",
    SHARPENED: "Sharpened",
    PARTIALLY_BONELESS: "Partially Boneless",
    RADIANT_BEARING: "Radiant Bearing",
    HALLOW_VESSEL: "Hallow Vessel",
    VOTES_CAST: "Votes Cast on the Matter at Hand",
    JENNYS_WIMPLE: "Sinning Jenny's Forsaken Wimple",
    M_D_A_FOR_F: "M. D_____' A_____ for _______: F____ Edition",
    DRINKING_VESSEL: "Polythreme Drinking Vessel",
    WAX_BOOTS: "Wax-Hardened Boots",
    WORK_GLOVES: "Singed and Stained Work Gloves",
    MINIATURE_MUSEUM: "Memory of a Miniature Museum",
    PERFUMERS_ARTS: "An Initiate into the Perfumer's Arts",
    GEBRANDTS_ADDRESS_BOOK: "Your Name in F.F. Gebrandt's Address Book",
    NASCENCY: "Distinction of Nascency",
    EXCESS: "Distinction of Excess",
    DARES: "Distinction of Dares",
    DEVOTION: "Distinction of Devotion",
    IRREVERENCE: "Distinction of Irreverence",
    DUPLICITY: "Distinction of Duplicity",
    BALMORAL: "A Gift from Balmoral",
    NULL_AND_VOID: "Null and Void",
    KHAGANS_PALACE_REPORT: "A Report from the Khagan's Palace", //0 is available, 1 is not
    AGENT: "An Agent of No Consequence",
}

const MILLISECONDS_IN_MINUTE = 60 * 1000;
const MILLISECONDS_IN_HOUR = 60 * MILLISECONDS_IN_MINUTE;
const SEVEN_DAYS_IN_MILLISECONDS = 7 * 24 * MILLISECONDS_IN_HOUR;
// Sometimes "living story" events do not trigger strictly on the hour,
// so it is good to give them some leeway.
const EVENT_TRIGGER_LEEWAY = 10 * MILLISECONDS_IN_MINUTE;
const BALMORAL_GIFT_BRANCH_IDS = [243583, 243592, 243600];
const KHANATE_REPORT_BRANCH_IDS = [250681];
const WELLSPRING_BRANCH_IDS = [244785, 244786]
const WASWOOD_CALENDAR_BRANCH_IDS = [254769, 254764, 254597, 254763, 254765, 254599, 254598, 254767, 254768, 234347, 254844, 254842, 234348, 254510, 254511, 224801, 254843]

const MESSAGE_STRINGS = {
    KHANATE_MESSAGE: "You can pick up a new report from your agent" , 
    BALMORAL_MESSAGE: "Things change in Balmoral. The railway brings trade, resources, opportunities.", 
    TTH_MESSAGE: "Memory fades; pain departs; rewards arrive!" ,
    CHIMES_MESSAGE: "The apparently illustrious voting body to which you belong" ,
    //ROSE_MESSAGE: "Something blooms in the shadow of the old chapel" ,
    //NULL_AND_VOID_MESSAGE: "The Dauntless Knight has sent a message to your lodgings" , //starts at 10, ends at 11
    //I think only repeatable ones are useful here
}




type FLMessage = { type: string, image: string, relatedId: number, description: string, date: string, ago: string };

export class TimeKeeperFixer implements IMutationAware, IStateAware, INetworkAware {

    private nextTthMoment: null | number = null;
    private knownWorldQualities: Map<string, WikiResult> = new Map()
    private currentSettings: SettingsObject = {};
    private displayTimekeeping = true;
    private playerQualities = new Map()
    private backupMoments: Map<string, string> = new Map();
    nextBalmoralMoment = 0;
    nextKhanateMoment = 0;
    nextWellspringMoment = 0;
    nextWaswoodMoment = 0;
    

    //private i = 0; //resets settings, for testing purposes

    constructor() {
        Object.values(CHARACTER_QUALITIES).forEach((value) => {
            this.playerQualities.set(value, 0);
        });
        window.addEventListener("message", (event) => {
            if (event.data.action === MSG_TYPE_WIKI_API_RESPONSE) {
                const results: Map<string, WikiResult> = new Map(Object.entries(JSON.parse(event.data.results)));
                console.log(`wiki gave us these results: ${results.keys}`)
                let dirty = false;
                results.forEach((val, key) => {
                    //todo check the timestamp
                    if (this.knownWorldQualities.get(key)?.value !== val.value) {
                        dirty = true;
                        this.knownWorldQualities.set(key, val)
                    }
                });
                if (dirty) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                    this.currentSettings!.worldQualities = JSON.stringify(Object.fromEntries(this.knownWorldQualities))
                    sendToServiceWorker(MSG_TYPE_SAVE_SETTINGS, { settings: this.currentSettings });
                }
            }
        });
    }

    linkState(state: GameStateController): void {
        state.onCharacterDataLoaded((g) => {
            for (const quality of g.enumerateQualities()) {
                if (Object.values(CHARACTER_QUALITIES).includes(quality.name)) {
                    this.playerQualities.set(quality.name, quality.level);
                }

            }
        });
        state.onQualityChanged((_state, quality, _previous, _current) => {
            if (Object.values(CHARACTER_QUALITIES).includes(quality.name)) {
                this.playerQualities.set(quality.name, quality.level);
            }
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
                (sidebar as HTMLElement).style.cssText = "margin-top: 30px";
            }
        }

        let timekeeperPanel = document.getElementById("timekeeper-panel");
        // Trackers are already created and visible, nothing to do here.
        if (!timekeeperPanel) {
            const fragment = document.createDocumentFragment();

            const timekeeperHeader = document.createElement("p");
            timekeeperHeader.classList.add("heading", "heading--4");
            timekeeperHeader.textContent = "Timekeeper";
            fragment.appendChild(timekeeperHeader);

            timekeeperPanel = document.createElement("ul");
            timekeeperPanel.setAttribute("id", "timekeeper-panel");
            if (this.currentSettings!.tth) {
                timekeeperPanel.appendChild(this.buildTthPanel());
            }
            if (this.currentSettings!.wellspring || this.currentSettings!.waswood || this.currentSettings!.house_of_chimes || this.currentSettings!.balmoral ||
                this.currentSettings!.khanate || this.currentSettings!.boons_and_burdens) {

                timekeeperPanel.appendChild(this.buildLivingStoryPanel());
            }
            if (this.currentSettings!.rat_market) {
                timekeeperPanel.appendChild(this.buildRatMarketPanel());
            }
            if (this.currentSettings!.bone_market) {
                timekeeperPanel.appendChild(this.buildBoneMarketPanel());
            }

            fragment.appendChild(timekeeperPanel);

            sidebar.appendChild(fragment);
        }

        if (!travelColumn.contains(sidebar)) {
            travelColumn.appendChild(sidebar);
        }
    }

    //only works with strings, but string | boolean makes it play nicer with settings
    private calculateRemainingTimeFromIsoOrNumberString(datetime: string | boolean | undefined) {
        if (datetime == undefined) {
            return "";
        }
        return this.calculateRemainingTime(new Date(datetime as string).getTime());
    }

    calculateRemainingTime(moment: number) {
        const now = new Date().getTime();
        const minutesLeft = Math.round((moment - now) / (MILLISECONDS_IN_MINUTE));
        const hoursLeft = Math.floor(minutesLeft / 60) + (minutesLeft % 60 >= 30 ? 1 : 0);
        const daysLeft = hoursLeft >= 24 ? Math.ceil(hoursLeft / 24) : 0;

        let remainingText;

        console.log(`Time till this moment comes: ${daysLeft} days or ${hoursLeft} hours or ${minutesLeft} minutes.`)

        if (daysLeft > 0) {
            const unit = daysLeft === 1 ? "day" : "days";

            remainingText = `in ${daysLeft} ${unit}.`;
        } else if (hoursLeft > 0) {
            const unit = hoursLeft === 1 ? "hour" : "hours";

            remainingText = `in ${hoursLeft} ${unit}.`;
        } else if (minutesLeft > 0) {
            const unit = minutesLeft === 1 ? "minute" : "minutes";
            remainingText = `in ${minutesLeft} ${unit}.`;
        } else {
            remainingText = `again someday.`;
        }

        return remainingText;
    }

    buildTthPanel(): HTMLUListElement {
        console.log(this.currentSettings)
        console.log(Object.fromEntries(this.playerQualities) )
        const tthPanel = document.createElement("ul");
        const lines = [];
        if (this.nextTthMoment) {
            const remainingText = this.calculateRemainingTime(this.nextTthMoment);
            lines.push(`Time the Healer cometh ${remainingText}`);
        } else {
            //TODO get tth moment
        }
        if (this.currentSettings!.notability) {
            const currentMakingWaves = this.playerQualities.get("Making Waves");
            const currentNotability = this.playerQualities.get("Notability");
            if (currentMakingWaves < currentNotability) {
                lines.push(`You will lose Notability! (${currentMakingWaves} MW < ${currentNotability} Nota)`);
            }
        }
        if (this.currentSettings!.beneficence) {
            if (!this.playerQualities.get(CHARACTER_QUALITIES.BENEFICENCE)) {
                lines.push("A Beneficence is still available")
            }
        }
        if (this.currentSettings!.free_evenings) {
            const evenings = this.playerQualities.get(CHARACTER_QUALITIES.FREE_EVENING);
            if (evenings) {
                lines.push(`${evenings} Free Evenings are available`);
            }
        }
        if (this.currentSettings!.mired_in_mail) {
            const mired = this.playerQualities.get(CHARACTER_QUALITIES.MIRED_IN_MAIL)
            if (mired < 5) {
                lines.push(`${5 - mired} letter readings are available`);
            }
        }
        if (this.currentSettings!.backstage) {
            //if you can do something, and haven't maxxed your acquaintance yet
            if (this.playerQualities.get(CHARACTER_QUALITIES.WHISPERS) && this.playerQualities.get(CHARACTER_QUALITIES.ACQUAINTANCE_MRS_CHAPMAN) < 4) {

                //if you have all the prerequisites to visit
                if (this.playerQualities.get(CHARACTER_QUALITIES.A_KNOCK) && this.playerQualities.get(CHARACTER_QUALITIES.A_SUSURRUS) &&
                    this.playerQualities.get(CHARACTER_QUALITIES.UNEARTHLY_WHISPER)) {
                    lines.push("You can go Backstage at Mrs Chapman's");
                } else {
                    //you need a prerequisite
                    if (this.knownWorldQualities.get(THE_SEASON_IN_SOUP)) {
                        switch (Number(this.knownWorldQualities.get(THE_SEASON_IN_SOUP)!.value)) {
                            case 1:
                                console.log("do nothing")
                                break; //nothing to do here
                            case 2:
                                if (!this.playerQualities.get(CHARACTER_QUALITIES.A_KNOCK)) {
                                    lines.push("You can Promenade in Mrs Chapman's Parlor");
                                }
                                break;
                            case 3:
                                if (!this.playerQualities.get(CHARACTER_QUALITIES.A_SUSURRUS)) {
                                    lines.push("You can have the Mrs Chapman's Flavour of Dahut soup");
                                }
                                break;
                            case 4:
                                if (!this.playerQualities.get(CHARACTER_QUALITIES.UNEARTHLY_WHISPER)) {
                                    lines.push("You can take absinthe at Mrs Chapman's Parlor");
                                }
                        }
                    } else {
                        //todo handling missing wiki call
                    }
                    
                }
            }
        }
        if (this.currentSettings!.favourable_circumstance) {
            if (this.playerQualities.get(CHARACTER_QUALITIES.FAVOURABLE_CIRCUMSTANCE)) {
                lines.push("You can use a Favourable Circumstance");
            }
        }
        if (this.currentSettings!.professional_perks) {
            if (this.playerQualities.get(CHARACTER_QUALITIES.PROFESSIONAL_PERK) === 4) {
                lines.push("You have 4 Professional Perks, use them before TtH arrives");
            }
        }
        if (this.currentSettings!.irrigo && this.playerQualities.get(CHARACTER_QUALITIES.ROUTE_NADIR)! > 2) {
            if (!this.playerQualities.get(CHARACTER_QUALITIES.IRRIGO) || this.playerQualities.get(CHARACTER_QUALITIES.FLEETING_RECOLLECTIONS)) {
                lines.push("You can visit the Cave of the Nadir");
            }
        }
        if (this.currentSettings!.parabolan_ravages && this.playerQualities.get(CHARACTER_QUALITIES.PARABOLAN_COMPANY)) {
            if (this.playerQualities.get(CHARACTER_QUALITIES.PARABOLAN_RAVAGES)! < 10) {
                lines.push("Your Parabolan Ravages is below 10");
            }
        }
        if (this.currentSettings!.ambition_reward && this.playerQualities.get(CHARACTER_QUALITIES.TRUE_DENIZEN)) {
            if (this.playerQualities.get(CHARACTER_QUALITIES.CONSEQUENCE) === 4) {
                lines.push("You can collect your monthly Ambition reward")
            } else {
                const weeksRemaining = 3 - this.playerQualities.get(CHARACTER_QUALITIES.CONSEQUENCE)!;
                if (this.nextTthMoment) {
                    const ambitionDate = new Date(this.nextTthMoment + (weeksRemaining * SEVEN_DAYS_IN_MILLISECONDS));
                    const ambitionText = this.calculateRemainingTime(ambitionDate.getTime());
                    lines.push(ambitionText);
                } else {
                    lines.push(`You can collect your monthly Ambition reward in approximately ${weeksRemaining} weeks`);
                }
            }
        }
        if (this.currentSettings!.bone_market_exhaustion && this.playerQualities.get(CHARACTER_QUALITIES.ROUTE_BONE_MARKET)) {
            const remainingExh = 4 - this.playerQualities.get(CHARACTER_QUALITIES.BONE_MARKET_EXHAUSTION)!
            if (remainingExh > 0) {
                lines.push(`You can use ${remainingExh} Bone Market Exhaustion`);
            }
        }
        if (this.currentSettings!.board_meeting && this.playerQualities.get(CHARACTER_QUALITIES.RAILWAY_VENTURE)) {
            const bureaucraticAdvantageUsed = this.playerQualities.get(CHARACTER_QUALITIES.RAILWAY_VENTURE)! > 0 &&
                this.playerQualities.get(CHARACTER_QUALITIES.RAILWAY_VENTURE)! < 121 &&
                this.playerQualities.get(CHARACTER_QUALITIES.BUREAUCRATIC_ADVANTAGE) === 1;
            const meetingAvailable = this.playerQualities.get(CHARACTER_QUALITIES.DELAY_NEXT_MEETING) === 0;
            if (bureaucraticAdvantageUsed) {
                if (meetingAvailable) {
                    lines.push("You can call a GHR Board meeting.");
                }
            } else {
                if (meetingAvailable) {
                    lines.push("You can call two GHR Board meetings.");
                } else {
                    lines.push("You can call a GHR Board meeting, with the Board Secretary's help.");
                }
            }

        }
        if (this.currentSettings!.visit_hell && this.playerQualities.get(CHARACTER_QUALITIES.APPROACHING_HELL) === 777) {
            if (!this.playerQualities.get(CHARACTER_QUALITIES.VISITOR_TO_HELL) && !this.playerQualities.get(CHARACTER_QUALITIES.FLOWER_FROM_HELL)) {
                lines.push("You can visit Hell");
            }
        }
        if (this.currentSettings!.starved_embassy) {
            if (!this.playerQualities.get(CHARACTER_QUALITIES.STARVED_EXCHANGE)) {
                lines.push("You can visit the Starved Embassy.");
            }
        }
        if (this.currentSettings!.ecdysis && this.playerQualities.get(CHARACTER_QUALITIES.ECDYSIS)) {
            if (!(this.playerQualities.get(CHARACTER_QUALITIES.WIDE_EYED) ||
                this.playerQualities.get(CHARACTER_QUALITIES.SHARPENED) ||
                this.playerQualities.get(CHARACTER_QUALITIES.PARTIALLY_BONELESS) ||
                this.playerQualities.get(CHARACTER_QUALITIES.RADIANT_BEARING) ||
                this.playerQualities.get(CHARACTER_QUALITIES.HALLOW_VESSEL))) {

                lines.push("You can get a boon from Ecdysis.");
            }
        }
        for (const line of lines) {
            const li = document.createElement("li");
            li.textContent = line;
            tthPanel.appendChild(li);
        }

        return tthPanel;
    }

    buildLivingStoryPanel(): HTMLUListElement {
        const livingStoryPanel = document.createElement("ul");
        if (this.currentSettings!.wellspring) {
            ;
        }
        if (this.currentSettings!.waswood) {
            ;
        }
        if (this.currentSettings!.house_of_chimes) {
            ;
        }
        if (this.currentSettings!.balmoral) {
            ;
        }

        //if (this.currentSettings!.khanate && this.playerQualities.get(CHARACTER_QUALITIES.AGENT)) {
            const khanateDiv = this.createKhanateDiv();

            livingStoryPanel.appendChild(khanateDiv);
        //}
        if (this.currentSettings!.boons_and_burdens) {
            ;
        }

        return livingStoryPanel;
    }

    

    private createKhanateDiv() {
        const now = new Date().getTime();
        let nextKhanateReport = "";
        if (this.playerQualities.get(CHARACTER_QUALITIES.AGENT) && !this.playerQualities.get(CHARACTER_QUALITIES.KHAGANS_PALACE_REPORT)) {
            nextKhanateReport = "A 'report' is waiting for you in Khanate.";
        } else {
            //Report is not ready
            const nextKhanateMoment = this.currentSettings.nextKhanateMoment ? new Date(this.currentSettings.nextKhanateMoment as string).getTime() : undefined;
            if (nextKhanateMoment && nextKhanateMoment > now) {
                //Saved moment suggests the report will be ready in future
                nextKhanateReport = this.calculateRemainingTime(nextKhanateMoment);
            } else {
                //No saved moment, or moment in past. Check backup (taken from messages)
                const backupMoment = this.backupMoments.get(MESSAGE_STRINGS.KHANATE_MESSAGE) ?
                    new Date(this.backupMoments.get(MESSAGE_STRINGS.KHANATE_MESSAGE) as string).getTime() :
                    undefined;
                if (backupMoment && backupMoment > now) {
                    //Backup moment looks good, save it and use it
                    this.currentSettings.nextKhanateMoment = backupMoment.toString();
                    sendToServiceWorker(MSG_TYPE_SAVE_SETTINGS, { settings: this.currentSettings });
                    nextKhanateReport = this.calculateRemainingTime(backupMoment);
                }
                nextKhanateReport = this.calculateRemainingTimeFromIsoOrNumberString(this.backupMoments.get(MESSAGE_STRINGS.KHANATE_MESSAGE));
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

        const khanateModal = this.createKhanateModal();

        const modalButton = document.createElement("button");
        modalButton.classList.add("js-tt", "button", "button--primary", "button--go");
        modalButton.style.padding = "2px 5px";
        modalButton.addEventListener("click", () => {
            khanateModal.showModal();
        });
        const editText = document.createElement("span");
        editText.textContent = "Edit time";
        modalButton.appendChild(editText);

        khanateDiv.appendChild(nextReportMessage);
        khanateDiv.appendChild(modalButton);
        return khanateDiv;
    }

    createKhanateModal() {
        const khanateModal = document.createElement("dialog");
        document.body.appendChild(khanateModal);
        khanateModal.setAttribute("id", "khanate-modal");

        const khanateForm = document.createElement("form");
        khanateForm.setAttribute("method", "dialog");

        const khanateLabel = document.createElement("label");
        khanateLabel.textContent = "Enter an estimate of the next time a 'report' will be available. It should be in UTC time."
        khanateLabel.htmlFor = "khanate-date-picker";

        const khanateDatePicker = document.createElement("input");
        const now = new Date();
        now.setMinutes(0);
        now.setSeconds(0);
        now.setMilliseconds(0);

        khanateDatePicker.id = "khanate-date-picker"
        khanateDatePicker.type = "datetime-local";
        khanateDatePicker.value = now.toISOString().slice(0, -1);
        khanateDatePicker.max = new Date(now.getTime() + SEVEN_DAYS_IN_MILLISECONDS).toISOString().slice(0, -1);
        khanateDatePicker.min = now.toISOString().slice(0, -1);
        khanateDatePicker.step = "900";

        const khanateModalCancel = document.createElement("button");
        khanateModalCancel.textContent = "Cancel";
        khanateModalCancel.addEventListener("click", () => {
            khanateModal.close();
        });
        khanateModalCancel.classList.add("js-tt", "button", "button--primary", "button--go");
        khanateModalCancel.style.padding = "2px 5px";

        const khanateModalConfirm = document.createElement("button");
        khanateModalConfirm.textContent = "Confirm";
        khanateModalConfirm.addEventListener("click", () => {
            const nextKhanateMoment = khanateDatePicker.value + "Z";
            console.log(nextKhanateMoment)
            console.log(new Date(nextKhanateMoment).getTime().toString())

            console.log(this.currentSettings.nextKhanateMoment)
            this.currentSettings.nextKhanateMoment = new Date(nextKhanateMoment).getTime().toString();
            console.log(this.currentSettings.nextKhanateMoment)
            sendToServiceWorker(MSG_TYPE_SAVE_SETTINGS, { settings: this.currentSettings });
            const nextKhanateReport = "A 'report' from Khagan's Palace is due " + this.calculateRemainingTimeFromIsoOrNumberString(nextKhanateMoment);
            document.getElementById("next-khanate-report-message")!.textContent = nextKhanateReport;
            khanateModal.close();
        });
        khanateModalConfirm.classList.add("js-tt", "button", "button--primary", "button--go");
        khanateModalConfirm.style.padding = "2px 5px";

        khanateModal.appendChild(khanateForm);
        khanateForm.appendChild(khanateLabel);
        khanateLabel.appendChild(khanateDatePicker);
        khanateForm.appendChild(khanateModalCancel);
        khanateForm.appendChild(khanateModalConfirm);

        return khanateModal;
    }

    buildBoneMarketPanel(): HTMLElement {
        const boneMarketPanel = document.createElement("div");

        return boneMarketPanel;
    }

    buildRatMarketPanel(): HTMLElement {
        const ratMarketPanel = document.createElement("div");

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
        return document.getElementById("timekeeper-panel") == null;
    }

    applySettings(settings: SettingsObject): void {
        this.currentSettings = settings;
        /*if (this.i === 0) {
            this.currentSettings.worldQualities = ""
            this.i = 1;
        }*/ //clears saved qualities
        this.displayTimekeeping = this.currentSettings.display_timekeeping as boolean;
        if (this.currentSettings.worldQualities) {
            this.knownWorldQualities = new Map(Object.entries(JSON.parse(this.currentSettings.worldQualities as string)))
        }
        if (settings.nextTthMoment) {
            this.nextTthMoment = new Date(settings.nextTthMoment as string).getTime();
        } else {
            console.log("no tth")
            //todo something?
        }
        
        const missingWorldQualities: string[] = []
        WORLD_QUALITIES.forEach((name) => {
            if (!this.knownWorldQualities.has(name)) {
                missingWorldQualities.push(name);
            }
        });

        //TODO foreach(if time < now, add them to missing to get an update)

        if (missingWorldQualities.length > 0) {
            const qualityString = JSON.stringify(missingWorldQualities)

            sendToServiceWorker(MSG_TYPE_WIKI_API_CALL, { missingQualities: qualityString })
        }
    }

    linkNetworkTools(interceptor: FLApiInterceptor): void {
        interceptor.onResponseReceived("/api/storylet/choosebranch", (request, response) => {
            if (!this.displayTimekeeping) {
                return;
            }

            if (response.messages && KHANATE_REPORT_BRANCH_IDS.includes(request.branchId)) {
                this.nextKhanateMoment = new Date().getTime() + SEVEN_DAYS_IN_MILLISECONDS + EVENT_TRIGGER_LEEWAY;

                this.currentSettings.nextKhanateMoment = this.nextKhanateMoment.toString();
                sendToServiceWorker(MSG_TYPE_SAVE_SETTINGS, { settings: this.currentSettings });
            }
            if (BALMORAL_GIFT_BRANCH_IDS.includes(request.branchId)) {
                this.nextBalmoralMoment = new Date().getTime() + SEVEN_DAYS_IN_MILLISECONDS + EVENT_TRIGGER_LEEWAY;
                sendToServiceWorker(MSG_TYPE_SAVE_SETTINGS, { settings: this.currentSettings });
            }

            if (WELLSPRING_BRANCH_IDS.includes(request.branchId)) {
                this.nextWellspringMoment = new Date().getTime() + SEVEN_DAYS_IN_MILLISECONDS + EVENT_TRIGGER_LEEWAY;
                sendToServiceWorker(MSG_TYPE_SAVE_SETTINGS, { settings: this.currentSettings });
            }

            if (WASWOOD_CALENDAR_BRANCH_IDS.includes(request.branchId)) {
                this.nextWaswoodMoment = new Date().getTime() + SEVEN_DAYS_IN_MILLISECONDS + EVENT_TRIGGER_LEEWAY;
                sendToServiceWorker(MSG_TYPE_SAVE_SETTINGS, { settings: this.currentSettings });
            }

            return;
        });
        interceptor.onResponseReceived("/api/messages", (_, response) => this.parseSavedMessages(response.feedMessages));
    }

    parseSavedMessages(messages: FLMessage[]) {
        for (const message of messages) {
            console.log(message.description)
            for (const messageType of Object.values(MESSAGE_STRINGS)) {

                if (message.description.startsWith(messageType)) {
                    const previousMoment = this.backupMoments.get(messageType);
                    if (previousMoment && new Date(previousMoment) > new Date(message.date)) {
                        break; //already have a more recent backup date
                    }
                    this.backupMoments.set(messageType, message.date)
                }
            }
        }
    }
}
