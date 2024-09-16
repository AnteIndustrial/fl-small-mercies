import { IMutationAware, INetworkAware, IStateAware } from "./base";
import { SettingsObject } from "../settings";
import { GameStateController, GameState } from "../game_state";
import { getSingletonByClassName } from "../utils";
import { MSG_TYPE_SAVE_SETTINGS, MSG_TYPE_WIKI_API_CALL, MSG_TYPE_WIKI_API_RESPONSE } from "../constants";
import { sendToServiceWorker } from "../comms";
import { WikiResult } from "../wiki";
import { FLApiInterceptor } from "../api_interceptor";

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
}

type WorldQualityName = "SAINTLY_DEMAND" | "SOFT_DEMAND" | "TEMPESTUOUS_DEMAND" | "INSCRUTABLE_DEMAND" | "INTRICATE_DEMAND" | "MAUDLIN_DEMAND" | "THE_RAT_SEASON" |
    "DIRECTION_OF_THE_RAT_WIND" | "PHASE_OF_THE_RAT_MOON" | "THE_FALSE_SEASON" | "THE_SEASON_IN_SOUP" | "BONE_MARKET_FLUCTUATIONS" | "ZOOLOGICAL_MANIA" |
    "HEARTS_GAME_SEASON" | "SEASON_OF_THE_SACROBOSCAN_CALENDAR"

type FLMessage = { type: string, image: string, relatedId: number, description: string, date: string, ago: string };
interface WorldQuality { name: string, result?: WikiResult, resetDay: number }

export class TimeKeeperFixer implements IMutationAware, IStateAware, INetworkAware {

    private nextTthMoment: null | number = null;
    private knownWorldQualities: Map<string, WikiResult> = new Map()
    private currentSettings!: SettingsObject;
    private currentState!: GameState;
    private displayTimekeeping = true;
    private backupMoments: Map<string, string> = new Map();
    private waitingOnApi = false;
    nextBalmoralMoment = 0;
    nextKhanateMoment = 0;
    nextWellspringMoment = 0;
    nextWaswoodMoment = 0;

    private worldQualities: Record<WorldQualityName, WorldQuality> = {
        SAINTLY_DEMAND: { name: "Saintly Demand", result: undefined, resetDay: 1 }, //Monday
        SOFT_DEMAND: { name: "Soft Demand", result: undefined, resetDay: 1 },
        TEMPESTUOUS_DEMAND: { name: "Tempestuous Demand", result: undefined, resetDay: 1 },
        INSCRUTABLE_DEMAND: { name: "Inscrutable Demand", result: undefined, resetDay: 1 },
        INTRICATE_DEMAND: { name: "Intricate Demand", result: undefined, resetDay: 1 },
        MAUDLIN_DEMAND: { name: "Maudlin Demand", result: undefined, resetDay: 1 },
        THE_RAT_SEASON: { name: "The Rat-Season:", result: undefined, resetDay: 1 },
        DIRECTION_OF_THE_RAT_WIND: { name: "Direction of the Rat-Wind:", result: undefined, resetDay: 1 },
        PHASE_OF_THE_RAT_MOON: { name: "Phase of the Rat-Moon:", result: undefined, resetDay: 1 },
        THE_FALSE_SEASON: { name: "The False-Season:", result: undefined, resetDay: 1 },
        THE_SEASON_IN_SOUP: { name: "The Season in Soup", result: undefined, resetDay: 1 },
        BONE_MARKET_FLUCTUATIONS: { name: "Bone Market Fluctuations:", result: undefined, resetDay: 2 }, //Tuesday
        ZOOLOGICAL_MANIA: { name: "Zoological Mania:", result: undefined, resetDay: 2 },
        HEARTS_GAME_SEASON: { name: "Hearts' Game Season (Placeholder)", result: undefined, resetDay: 2 }, //Only the first time each month
        SEASON_OF_THE_SACROBOSCAN_CALENDAR: { name: "Season of the Sacroboscan Calendar", result: undefined, resetDay: 4 }, //Thursday
    };

    private characterQualities = {
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
        PARABOLAN_COMPANY: { id: 142527, value: 0 },
        PARABOLAN_RAVAGES: { id: 141647, value: 0 },
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
        //SHARPENED: "Sharpened",
        PARTIALLY_BONELESS: { id: 145011, value: 0 },
        RADIANT_BEARING: { id: 145010, value: 0 },
        HALLOW_VESSEL: { id: 145013, value: 0 },
        VOTES_CAST: { id: 144587, value: 0 },
        JENNYS_WIMPLE: { id: 128206, value: 0 },
        M_D_A_FOR_F: { id: 142997, value: 0 },
        DRINKING_VESSEL: { id: 127174, value: 0 },
        WAX_BOOTS: { id: 127177, value: 0 },
        WORK_GLOVES: { id: 142999, value: 0 },
        MINIATURE_MUSEUM: { id: 143538, value: 0 },
        PERFUMERS_ARTS: { id: 143748, value: 0 },
        GEBRANDTS_ADDRESS_BOOK: { id: 143752, value: 0 },
        NASCENCY: { id: 144836, value: 0 },
        EXCESS: { id: 144837, value: 0 },
        DARES: { id: 144838, value: 0 },
        DEVOTION: { id: 144839, value: 0 },
        IRREVERENCE: { id: 144840, value: 0 },
        DUPLICITY: { id: 144841, value: 0 },
        BALMORAL: { id: 141783, value: 0 },
        NULL_AND_VOID: { id: 141948, value: 0 },
        KHAGANS_PALACE_REPORT: { id: 142863, value: 0 }, //0 is available, 1 is not
        AGENT: { id: 142862, value: 0 },
    }

    //private i = 0; //resets settings, for testing purposes

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
                    //todo check the timestamp
                });
                if (dirty) {
                    this.currentSettings.worldQualities = JSON.stringify(this.worldQualities)
                    sendToServiceWorker(MSG_TYPE_SAVE_SETTINGS, { settings: this.currentSettings });
                }
                this.waitingOnApi = false;
            }
        });
    }

    linkState(state: GameStateController): void {
        state.onCharacterDataLoaded((g) => {
            this.currentState = g;
            Object.values(this.characterQualities).forEach((characterQuality) => {
                characterQuality.value = g.getQualityById(characterQuality.id)?.level || 0;
            })
        });
        state.onQualityChanged((_state, quality, _previous, _current) => {
            Object.values(this.characterQualities).forEach((characterQuality) => {
                if (characterQuality.id === quality.qualityId) {
                    characterQuality.value = quality.level;
                }
            });
        });
    }
    //todo does this do anything?
    currentRetries = 0;
    node?: HTMLElement;

    onNodeAdded(node: HTMLElement): void {
        this.node = node;
        const delay = (ms: number) => new Promise(res => setTimeout(res, ms));
        const waitForSettings = async () => {
            await delay(100);
            console.log("Waited 100ms");
        };
        const maxRetries = 5;
        console.log(Date.now())
        if (!(this.currentState && this.currentSettings) && this.currentRetries < maxRetries) {
            console.log(Date.now())
            this.currentRetries++;
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            waitForSettings().then(() => this.onNodeAdded(this.node!));
        }
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
            timekeeperPanel.id = "timekeeper-panel";
            timekeeperPanel.classList.add("items", "items--list");
            if (this.currentSettings.tth) {
                timekeeperPanel.appendChild(this.buildTthPanel());
            }
            if (this.currentSettings.wellspring || this.currentSettings.waswood || this.currentSettings.house_of_chimes || this.currentSettings.balmoral ||
                this.currentSettings.khanate || this.currentSettings.boons_and_burdens) {

                timekeeperPanel.appendChild(this.buildLivingStoryPanel());
            }
            if (this.currentSettings.rat_market) {
                timekeeperPanel.appendChild(this.buildRatMarketPanel());
            }
            if (this.currentSettings.bone_market_trends) {
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
        if (datetime == undefined || typeof datetime === "boolean") {
            return "";
        }
        return this.calculateRemainingTime(new Date(datetime as string).getTime());
    }

    calculateTimeDifference(moment: number, now: number) {
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
            remainingText = `again someday.`; //In theory this means it's ready for pickup. Or it's been picked up and no new time entered
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
        const lines = [];
        if (this.nextTthMoment) {
            const remainingText = this.calculateRemainingTime(this.nextTthMoment);
            lines.push(`Time the Healer cometh ${remainingText}`);
        } else {
            //TODO get tth moment
        }
        if (this.currentSettings.notability) {
            const currentMakingWaves = this.characterQualities.MAKING_WAVES;
            const currentNotability = this.characterQualities.NOTABILITY;
            if (currentMakingWaves < currentNotability) {
                lines.push(`You will lose Notability! (${currentMakingWaves} MW < ${currentNotability} Nota)`);
            }
            const currentBDR = this.getBDR();
            lines.push(`Current BDR is ${currentBDR}`)
            const requiredMakingWaves = 20 - currentBDR + 4 * this.characterQualities.NOTABILITY.value
            if (this.characterQualities.MAKING_WAVES.value >= requiredMakingWaves) {
                lines.push("You can increase your Notability now.")
            } else {
                lines.push(`You need ${requiredMakingWaves - this.characterQualities.MAKING_WAVES.value} more Making Waves to increase your Notability.`)
            }
            //todo update the BDR calculation
        }
        if (this.currentSettings.beneficence) {
            if (!this.characterQualities.BENEFICENCE.value) {
                lines.push("A Beneficence is still available.")
            }
        }
        if (this.currentSettings.free_evenings) {
            const evenings = this.characterQualities.FREE_EVENING.value;
            if (evenings) {
                if (evenings === 1) {
                    lines.push(`1 Free Evening is available.`)
                } else {
                    lines.push(`${evenings} Free Evenings are available.`);
                }
            }
        }
        if (this.currentSettings.mired_in_mail) {
            const mired = this.characterQualities.MIRED_IN_MAIL.value;
            if (mired === 4) {
                lines.push(`1 letter reading is available.`);
            } else if (mired < 5) {
                lines.push(`${5 - mired} letter readings are available.`);
            }
        }
        if (this.currentSettings.backstage) {
            //if you can do something, and haven't maxed your acquaintance yet
            if (this.characterQualities.WHISPERS.value && this.characterQualities.ACQUAINTANCE_MRS_CHAPMAN.value < 4) {

                //if you have all the prerequisites to visit
                if (this.characterQualities.A_KNOCK.value && this.characterQualities.A_SUSURRUS.value &&
                    this.characterQualities.UNEARTHLY_WHISPER.value) {
                    lines.push("You can go Backstage at Mrs Chapman's");
                } else {
                    //you need a prerequisite
                    if (this.worldQualities.THE_SEASON_IN_SOUP.result) {
                        switch (Number(this.worldQualities.THE_SEASON_IN_SOUP.result?.value)) {
                            case 1:
                                break; //nothing to do here
                            case 2:
                                if (!this.characterQualities.A_KNOCK.value) {
                                    lines.push("You can Promenade in Mrs Chapman's Parlor");
                                }
                                break;
                            case 3:
                                if (!this.characterQualities.A_SUSURRUS.value) {
                                    lines.push("You can have the Mrs Chapman's Flavour of Dahut soup");
                                }
                                break;
                            case 4:
                                if (!this.characterQualities.UNEARTHLY_WHISPER.value) {
                                    lines.push("You can take absinthe at Mrs Chapman's Parlor");
                                }
                        }
                    } else {
                        //todo handling missing wiki call
                    }

                }
            }
        }
        if (this.currentSettings.favourable_circumstance) {
            if (this.characterQualities.FAVOURABLE_CIRCUMSTANCE.value) {
                lines.push("You can use a Favourable Circumstance");
            }
        }
        if (this.currentSettings.professional_perks) {
            if (this.characterQualities.PROFESSIONAL_PERK.value === 4) {
                lines.push("You have 4 Professional Perks, use them before TtH arrives");
            }
        }
        if (this.currentSettings.irrigo && this.characterQualities.ROUTE_NADIR.value > 2) {
            if (!this.characterQualities.IRRIGO.value || this.characterQualities.FLEETING_RECOLLECTIONS.value) {
                lines.push("You can visit the Cave of the Nadir");
            }
        }
        if (this.currentSettings.parabolan_ravages && this.characterQualities.PARABOLAN_COMPANY.value) {
            if (this.characterQualities.PARABOLAN_RAVAGES.value < 10) {
                lines.push("Your Parabolan Ravages is below 10");
            }
        }
        if (this.currentSettings.ambition_reward && this.characterQualities.TRUE_DENIZEN.value) {
            if (this.characterQualities.CONSEQUENCE.value === 4) {
                lines.push("You can collect your monthly Ambition reward")
            } else {
                const weeksRemaining = 3 - this.characterQualities.CONSEQUENCE.value;
                if (this.nextTthMoment) {
                    const ambitionDate = new Date(this.nextTthMoment + (weeksRemaining * SEVEN_DAYS_IN_MILLISECONDS));
                    const ambitionText = this.calculateRemainingTime(ambitionDate.getTime());
                    lines.push(`Your ambition reward will be available in ${ambitionText}`);
                } else {
                    lines.push(`You can collect your monthly Ambition reward in approximately ${weeksRemaining} weeks`);
                }
            }
        }
        if (this.currentSettings.bone_market_exhaustion && this.characterQualities.ROUTE_BONE_MARKET.value) {
            const remainingExh = 4 - this.characterQualities.BONE_MARKET_EXHAUSTION.value
            if (remainingExh > 0) {
                lines.push(`You can use ${remainingExh} Bone Market Exhaustion`);
            }
        }
        if (this.currentSettings.board_meeting && this.characterQualities.RAILWAY_VENTURE.value) {
            const bureaucraticAdvantageAvailable = this.characterQualities.RAILWAY_VENTURE.value > 0 &&
                this.characterQualities.RAILWAY_VENTURE.value < 121 &&
                this.characterQualities.BUREAUCRATIC_ADVANTAGE.value === 0;
            //this should return true if the quality = 0, or if the quality is not set (which it probably shouldn't be if it's 0)

            const meetingAvailable = this.characterQualities.DELAY_NEXT_MEETING.value === 0;
            if (bureaucraticAdvantageAvailable) {
                if (meetingAvailable) {
                    lines.push("You can call two GHR Board meetings.");
                } else {
                    lines.push("You can call a GHR Board meeting, with the Board Secretary's help.");
                }
            } else {
                if (meetingAvailable) {
                    lines.push("You can call a GHR Board meeting.");
                }
            }

        }
        if (this.currentSettings.visit_hell && this.characterQualities.APPROACHING_HELL.value === 777) {
            if (!this.characterQualities.VISITOR_TO_HELL.value && !this.characterQualities.FLOWER_FROM_HELL.value) {
                lines.push("You can visit Hell");
            }
        }
        if (this.currentSettings.starved_embassy) {
            if (!this.characterQualities.STARVED_EXCHANGE.value) {
                lines.push("You can visit the Starved Embassy.");
            }
        }
        if (this.currentSettings.ecdysis && this.characterQualities.ECDYSIS.value) {
            if (!(this.characterQualities.WIDE_EYED.value ||
                //this.characterQualities.SHARPENED) ||
                this.characterQualities.PARTIALLY_BONELESS.value ||
                this.characterQualities.RADIANT_BEARING.value ||
                this.characterQualities.HALLOW_VESSEL.value)) {

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

    getBDR(): number {
        return (this.currentState.getQualityById(957)?.effectiveLevel || 0) +
            (this.currentState.getQualityById(958)?.effectiveLevel || 0) +
            (this.currentState.getQualityById(950)?.effectiveLevel || 0);
    }

    buildLivingStoryPanel(): HTMLUListElement {
        const livingStoryPanel = document.createElement("ul");
        livingStoryPanel.id = "living-story-panel";
        livingStoryPanel.classList.add("items", "items--list");
        if (this.currentSettings.wellspring) {
            ;
        }
        if (this.currentSettings.waswood) {
            ;
        }
        if (this.currentSettings.house_of_chimes) {
            ;
        }
        if (this.currentSettings.balmoral) {
            ;
        }

        if (this.currentSettings.khanate && this.characterQualities.AGENT.value) {
            const khanateDiv = this.createKhanateDiv();

            livingStoryPanel.appendChild(khanateDiv);
        }
        if (this.currentSettings.boons_and_burdens) {
            ;
        }

        return livingStoryPanel;
    }

    private createKhanateDiv() {
        const now = new Date().getTime();
        let nextKhanateReport = "";
        if (this.characterQualities.AGENT.value && !this.characterQualities.KHAGANS_PALACE_REPORT.value) {
            nextKhanateReport = "A 'report' is waiting for you in Khanate.";
        } else {
            //Report is not ready
            const nextKhanateMoment = this.currentSettings.nextKhanateMoment ? new Date(this.currentSettings.nextKhanateMoment as string).getTime() : undefined;
            if (nextKhanateMoment && nextKhanateMoment > now) {
                //Saved moment suggests the report will be ready in future
                nextKhanateReport = this.calculateRemainingTime(nextKhanateMoment);
            } else {
                //No saved moment, or moment in past. Check backup (taken from messages)
                
                const backupString = this.backupMoments.get(MESSAGE_STRINGS.KHANATE_MESSAGE);
                if (backupString) {
                    const nextBackupDate = new Date(this.backupMoments.get(MESSAGE_STRINGS.KHANATE_MESSAGE) as string)
                    nextBackupDate.setDate(nextBackupDate.getDate() + 7);
                    const nextBackupMoment = nextBackupDate.getTime();
                    if (nextBackupDate.getTime() > now) {
                        //Backup moment looks good, save it and use it
                        this.currentSettings.nextKhanateMoment = nextBackupDate.toISOString();
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

        const khanateWrapperDiv = document.createElement("div");
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
            this.currentSettings.nextKhanateMoment = new Date(nextKhanateMoment).toISOString();
            sendToServiceWorker(MSG_TYPE_SAVE_SETTINGS, { settings: this.currentSettings });
            const nextKhanateReport = "A 'report' from Khagan's Palace is due " + this.calculateRemainingTimeFromIsoOrNumberString(nextKhanateMoment);
            const nextKhanateReportSpan = document.getElementById("next-khanate-report-message");
            if (nextKhanateReportSpan) {
                nextKhanateReportSpan.textContent = nextKhanateReport;
            }
            khanateModal.close();
        });
        khanateModalConfirm.classList.add("js-tt", "button", "button--primary", "button--go");
        khanateModalConfirm.style.padding = "2px 5px";

        khanateModal.appendChild(khanateWrapperDiv);
        khanateWrapperDiv.appendChild(khanateForm);
        khanateForm.appendChild(khanateLabel);
        khanateLabel.appendChild(khanateDatePicker);
        khanateForm.appendChild(khanateModalCancel);
        khanateForm.appendChild(khanateModalConfirm);
        khanateModal.addEventListener("click", (event) => {
            if (event.target === khanateModal) {
                khanateModal.close();
            }
        });
        khanateModal.style.padding = "0";
        khanateWrapperDiv.style.margin = "0";
        khanateWrapperDiv.style.padding = "1rem";
        return khanateModal;
    }

    private getNextTuesday() {
        const now = new Date();
        const nextResetDay = new Date();
        nextResetDay.setUTCHours(11, 0, 0, 0);

        if (now.getUTCDay() == 2) { //tuesday
            if (now.getUTCHours() < 11) {
                //don't change the date
            } else {
                nextResetDay.setUTCDate(nextResetDay.getUTCDate() + 7);
                //next reset is nearly 7 days away
            }
        } else {
            nextResetDay.setUTCDate(now.getUTCDate() + (2 + 7 - now.getUTCDay()) % 7)
            //next reset is 1-6 days away
        }
        return this.calculateRemainingTime(nextResetDay.getTime());
    }

    buildBoneMarketPanel(): HTMLElement {
        const boneMarketPanel = document.createElement("div");
        const boneMarketHeader = document.createElement("h4");
        boneMarketHeader.textContent = "Bone Market";
        const preferredQualitySpan = document.createElement("span");
        const preferredQuality = this.worldQualities.BONE_MARKET_FLUCTUATIONS.result?.value;
        preferredQualitySpan.textContent = `Preferred Quality: ${preferredQuality}`;
        const zoologicalManiaSpan = document.createElement("span");
        const zoologicalMania = this.worldQualities.ZOOLOGICAL_MANIA.result?.value;
        zoologicalManiaSpan.textContent = `Zoological Mania: ${zoologicalMania}`;
        const refreshSpan = document.createElement("span");

        refreshSpan.textContent = `These values will change ${this.getNextTuesday()}`;

        const currentExhaustion = this.characterQualities.BONE_MARKET_EXHAUSTION.value;
        const exhaustionSpan = document.createElement("span");
        if(this.nextTthMoment) {
            exhaustionSpan.textContent = `You have ${currentExhaustion} exhaustion, reducing by 4 ${this.calculateRemainingTime(this.nextTthMoment)}`;
        }

        boneMarketPanel.appendChild(boneMarketHeader);
        boneMarketPanel.appendChild(preferredQualitySpan);
        boneMarketPanel.appendChild(zoologicalManiaSpan);
        boneMarketPanel.appendChild(refreshSpan);
        boneMarketPanel.appendChild(exhaustionSpan);
        return boneMarketPanel;
    }

    buildRatMarketPanel(): HTMLElement {
        const ratMarketPanel = document.createElement("div");
        //get what the rats are buying and selling.
        //check inventory for useful things that could be picked up.check inventory for rat - shilling value of current items
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
            this.worldQualities = JSON.parse(this.currentSettings.worldQualities as string)
            this.removeOutdatedWorldQualities();
        }
        if (settings.nextTthMoment) {
            this.nextTthMoment = new Date(settings.nextTthMoment as string).getTime();
        } else {
            console.log("no tth")
            //todo something?
        }
        
        const missingWorldQualities: string[] = []

        Object.values(this.worldQualities).forEach((quality) => {
            if (!quality.result) {
                missingWorldQualities.push(quality.name);
            }//todo if quality.time + something > now, add them to missing to get an update
        });

        if (missingWorldQualities.length > 0 && !this.waitingOnApi) {
            const qualityString = JSON.stringify(missingWorldQualities);

            sendToServiceWorker(MSG_TYPE_WIKI_API_CALL, { missingQualities: qualityString });
            this.waitingOnApi = true;
        }
    }

    removeOutdatedWorldQualities() {
        const now = new Date();
        for (const worldQuality of this.knownWorldQualities) {
            ;//todo
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
