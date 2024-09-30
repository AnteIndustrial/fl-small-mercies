/* eslint-disable @typescript-eslint/no-non-null-assertion */
/* eslint-disable @typescript-eslint/no-empty-function */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import { TimeKeeperFixer, DAYS, WorldQualityName, WorldQuality } from "./fixers/timekeeper";
import {sendToServiceWorker} from "./comms";
import { MiscTrackerFixer, TrackedQuality } from "./fixers/misc_tracker";

jest.mock("./comms");


describe('testAsuite', () => {

    beforeEach(() => {
        (sendToServiceWorker as jest.MockedFunction<typeof sendToServiceWorker>).mockClear();
    })

    it('testNextDay', () => {
        const timekeeper = new TimeKeeperFixer();
        const date = new Date('2024-09-28T09:28:35.017Z'); //sat
        const nextSun = new Date(timekeeper.getNextDay(date, 0));
        expect(nextSun).toStrictEqual(new Date('2024-09-29T11:00:00.000Z'));
        const nextMon = new Date(timekeeper.getNextDay(date, 1));
        expect(nextMon).toStrictEqual(new Date('2024-09-30T11:00:00.000Z'));
        const nextTue = new Date(timekeeper.getNextDay(date, 2));
        expect(nextTue).toStrictEqual(new Date('2024-10-01T11:00:00.000Z'));
        const nextWed = new Date(timekeeper.getNextDay(date, 3));
        expect(nextWed).toStrictEqual(new Date('2024-10-02T11:00:00.000Z'));
        const nextThur = new Date(timekeeper.getNextDay(date, 4));
        expect(nextThur).toStrictEqual(new Date('2024-10-03T11:00:00.000Z'));
        const nextFri = new Date(timekeeper.getNextDay(date, 5));
        expect(nextFri).toStrictEqual(new Date('2024-10-04T11:00:00.000Z'));
        const thisSat = new Date(timekeeper.getNextDay(date, 6));
        expect(thisSat).toStrictEqual(new Date('2024-09-28T11:00:00.000Z'));

        const laterSat = new Date('2024-09-28T15:28:35.017Z');
        const nextSat = new Date(timekeeper.getNextDay(laterSat, 6));
        expect(nextSat).toStrictEqual(new Date('2024-10-05T11:00:00.000Z'));

        const earlyTues = new Date('2024-10-01T05:28:35.017Z');
        const tuesReset = timekeeper.getNextDay(earlyTues, 2)
        expect(tuesReset).toBe(new Date('2024-10-01T11:00:00.00Z').getTime())
    });

    it('testNextHeartsGameReset', () => {
        const timekeeper = new TimeKeeperFixer();
        const date1 = new Date('2024-09-28T09:28:35.017Z');
        const nextReset1 = new Date('2024-10-01T11:00:00.00Z');
        expect(timekeeper.getNextHeartsGameReset(date1)).toStrictEqual(nextReset1);

        const date2 = new Date('2024-09-04T09:28:35.017Z');
        expect(timekeeper.getNextHeartsGameReset(date2)).toStrictEqual(nextReset1);

        const date3 = new Date('2024-10-01T05:28:35.017Z');
        expect(timekeeper.getNextHeartsGameReset(date3)).toStrictEqual(nextReset1);

        const date4 = new Date('2024-10-01T11:28:35.017Z');
        const nextReset2 = new Date('2024-11-05T11:00:00.00Z')
        expect(timekeeper.getNextHeartsGameReset(date4)).toStrictEqual(nextReset2);

        const date5 = new Date('2024-11-18T11:28:35.017Z');
        const nextReset3 = new Date('2024-12-03T11:00:00.00Z');
        expect(timekeeper.getNextHeartsGameReset(date5)).toStrictEqual(nextReset3);
    })

    it('testApplySettings', () => {
        ;// const timekeeper = new TimeKeeperFixer();
    })

    it('testTimekeeperConstructor', () => {
        const events: any = {};
        jest.spyOn(window, 'addEventListener').mockImplementation((event, handle, _options?) => {
            // @ts-ignore
            events[event] = handle;
        });
        const timekeeper = new TimeKeeperFixer();

        timekeeper.currentSettings = {};
        expect(events["message"]).toBeTruthy();
        const callback = events["message"];
        const event = { data: { action: "FL_SM_wikiResponse", results: `{"Bone Market Fluctuations:":{"name":"Bone Market Fluctuations:","value":"Menace","timestamp":1727409904666},"Direction of the Rat-Wind:":{"name":"Direction of the Rat-Wind:","value":"North","timestamp":1727409904666},"Hearts' Game Season (Placeholder)":{"name":"Hearts' Game Season (Placeholder)","value":"Irreverences","timestamp":1727409904666},"Inscrutable Demand":{"name":"Inscrutable Demand","value":"4","timestamp":1727409904666},"Intricate Demand":{"name":"Intricate Demand","value":"2","timestamp":1727409904666},"Maudlin Demand":{"name":"Maudlin Demand","value":"0","timestamp":1727409904666},"Phase of the Rat-Moon:":{"name":"Phase of the Rat-Moon:","value":"Blue","timestamp":1727409904666},"Saintly Demand":{"name":"Saintly Demand","value":"2","timestamp":1727409904666},"Season of the Sacroboscan Calendar":{"name":"Season of the Sacroboscan Calendar","value":"4","timestamp":1727409904666},"Soft Demand":{"name":"Soft Demand","value":"1","timestamp":1727409904666},"Tempestuous Demand":{"name":"Tempestuous Demand","value":"4","timestamp":1727409904666},"The False-Season:":{"name":"The False-Season:","value":"Autumn","timestamp":1727409904666},"The Rat-Season:":{"name":"The Rat-Season:","value":"Kifer-Caitiff","timestamp":1727409904666},"The Season in Soup":{"name":"The Season in Soup","value":"4","timestamp":1727409904666},"Zoological Mania:":{"name":"Zoological Mania:","value":"Amphibians","timestamp":1727409904666}}` } }
        callback(event);
        expect(sendToServiceWorker).toHaveBeenCalled();
        const calls = (sendToServiceWorker as jest.MockedFunction<typeof sendToServiceWorker>).mock.calls;
        expect(calls).toHaveLength(1);
        expect(calls[0][0]).toEqual("FL_SM_updateSettings")

        const worldQualities: Record<WorldQualityName, WorldQuality> = {
            SAINTLY_DEMAND: { name: "Saintly Demand", result: { name: "Saintly Demand", value: "2", timestamp: 1727409904666 }, resetDay: DAYS.MONDAY, blindspot: false },
            SOFT_DEMAND: { name: "Soft Demand", result: { name: "Soft Demand", value: "1", timestamp: 1727409904666 }, resetDay: DAYS.MONDAY, blindspot: false },
            TEMPESTUOUS_DEMAND: { name: "Tempestuous Demand", result: { name: "Tempestuous Demand", value: "4", timestamp: 1727409904666 }, resetDay: DAYS.MONDAY, blindspot: false },
            INSCRUTABLE_DEMAND: { name: "Inscrutable Demand", result: { name: "Inscrutable Demand", value: "4", timestamp: 1727409904666 }, resetDay: DAYS.MONDAY, blindspot: false },
            INTRICATE_DEMAND: { name: "Intricate Demand", result: { name: "Intricate Demand", value: "2", timestamp: 1727409904666 }, resetDay: DAYS.MONDAY, blindspot: false },
            MAUDLIN_DEMAND: { name: "Maudlin Demand", result: { name: "Maudlin Demand", value: "0", timestamp: 1727409904666 }, resetDay: DAYS.MONDAY, blindspot: false },
            THE_RAT_SEASON: { name: "The Rat-Season:", result: { name: "The Rat-Season:", value: "Kifer-Caitiff", timestamp: 1727409904666 }, resetDay: DAYS.MONDAY, blindspot: false },
            DIRECTION_OF_THE_RAT_WIND: { name: "Direction of the Rat-Wind:", result: { name: "Direction of the Rat-Wind:", value: "North", timestamp: 1727409904666 }, resetDay: DAYS.MONDAY, blindspot: false },
            PHASE_OF_THE_RAT_MOON: { name: "Phase of the Rat-Moon:", result: { name: "Phase of the Rat-Moon:", value: "Blue", timestamp: 1727409904666 }, resetDay: DAYS.MONDAY, blindspot: false },
            THE_FALSE_SEASON: { name: "The False-Season:", result: { name: "The False-Season:", value: "Autumn", timestamp: 1727409904666 }, resetDay: DAYS.MONDAY, blindspot: false },
            THE_SEASON_IN_SOUP: { name: "The Season in Soup", result: { name: "The Season in Soup", value: "4", timestamp: 1727409904666 }, resetDay: DAYS.MONDAY, blindspot: false },
            BONE_MARKET_FLUCTUATIONS: { name: "Bone Market Fluctuations:", result: { name: "Bone Market Fluctuations:", value: "Menace", timestamp: 1727409904666 }, resetDay: DAYS.TUESDAY, blindspot: false },
            ZOOLOGICAL_MANIA: { name: "Zoological Mania:", result: { name: "Zoological Mania:", value: "Amphibians", timestamp: 1727409904666 }, resetDay: DAYS.TUESDAY, blindspot: false },
            HEARTS_GAME_SEASON: { name: "Hearts' Game Season (Placeholder)", result: { name: "Hearts' Game Season (Placeholder)", value: "Irreverences", timestamp: 1727409904666 }, resetDay: DAYS.TUESDAY, blindspot: false },
            SEASON_OF_THE_SACROBOSCAN_CALENDAR: { name: "Season of the Sacroboscan Calendar", result: { name: "Season of the Sacroboscan Calendar", value: "4", timestamp: 1727409904666 }, resetDay: DAYS.THURSDAY, blindspot: false },
        };
        const worldString = JSON.stringify(worldQualities);

        expect(calls[0][1]).toStrictEqual({ settings: { worldQualities: worldString } });

    })

    it('testTimekeeperRemoveOutdatedSetBlindspot', () => {
        const events: any = {};
        jest.spyOn(window, 'addEventListener').mockImplementation((event, handle, _options?) => {
            // @ts-ignore
            events[event] = handle;
        });
        const timekeeper = new TimeKeeperFixer();

        const worldQualities: Record<WorldQualityName, WorldQuality> = {
            SAINTLY_DEMAND: { name: "Saintly Demand", result: { name: "a", value: "0", timestamp: 0 }, resetDay: DAYS.MONDAY }, //should be removed as outdated
            SOFT_DEMAND: { name: "Soft Demand", result: undefined, resetDay: DAYS.MONDAY }, //should be unchanged
            TEMPESTUOUS_DEMAND: { name: "Tempestuous Demand", result: { name: "b", value: "0", timestamp: 1727003435017 }, resetDay: DAYS.MONDAY }, //outdated
            INSCRUTABLE_DEMAND: { name: "Inscrutable Demand", result: { name: "c", value: "0", timestamp: 1727176235017 }, resetDay: DAYS.MONDAY }, //unchanged
            INTRICATE_DEMAND: { name: "Intricate Demand", result: { name: "d", value: "0", timestamp: 1725621035017 }, resetDay: DAYS.MONDAY }, //outdated
            MAUDLIN_DEMAND: { name: "Maudlin Demand", result: undefined, resetDay: DAYS.MONDAY },
            THE_RAT_SEASON: { name: "The Rat-Season:", result: undefined, resetDay: DAYS.MONDAY },
            DIRECTION_OF_THE_RAT_WIND: { name: "Direction of the Rat-Wind:", result: undefined, resetDay: DAYS.MONDAY },
            PHASE_OF_THE_RAT_MOON: { name: "Phase of the Rat-Moon:", result: undefined, resetDay: DAYS.MONDAY },
            THE_FALSE_SEASON: { name: "The False-Season:", result: undefined, resetDay: DAYS.MONDAY },
            THE_SEASON_IN_SOUP: { name: "The Season in Soup", result: undefined, resetDay: DAYS.MONDAY },
            BONE_MARKET_FLUCTUATIONS: { name: "Bone Market Fluctuations:", result: { name: "e", value: "", timestamp: 1727176235017 }, resetDay: DAYS.TUESDAY }, //timestamp is in blindspot
            ZOOLOGICAL_MANIA: { name: "Zoological Mania:", result: undefined, resetDay: DAYS.TUESDAY }, 
            HEARTS_GAME_SEASON: { name: "Hearts' Game Season (Placeholder)", result: { name: "f", value: "", timestamp: 1725880235017 }, resetDay: DAYS.TUESDAY }, //unchanged
            SEASON_OF_THE_SACROBOSCAN_CALENDAR: { name: "Season of the Sacroboscan Calendar", result: { name: "g", value: "0", timestamp: 1727176235017 }, resetDay: DAYS.THURSDAY }, //now is in blindspot
        };

        timekeeper.worldQualities = worldQualities;

        const fakeNow = new Date('2024-09-26T11:10:35.017Z') //thursday
        const dirty = timekeeper.removeOutdatedWorldQualities(fakeNow)

        const expected: Record<WorldQualityName, WorldQuality> = {
            SAINTLY_DEMAND: { name: "Saintly Demand", result: undefined, resetDay: DAYS.MONDAY, blindspot: false },
            SOFT_DEMAND: { name: "Soft Demand", result: undefined, resetDay: DAYS.MONDAY, blindspot: false },
            TEMPESTUOUS_DEMAND: { name: "Tempestuous Demand", result: undefined, resetDay: DAYS.MONDAY, blindspot: false },
            INSCRUTABLE_DEMAND: { name: "Inscrutable Demand", result: { name: "c", value: "0", timestamp: 1727176235017 }, resetDay: DAYS.MONDAY, blindspot: false },
            INTRICATE_DEMAND: { name: "Intricate Demand", result: undefined, resetDay: DAYS.MONDAY, blindspot: false },
            MAUDLIN_DEMAND: { name: "Maudlin Demand", result: undefined, resetDay: DAYS.MONDAY, blindspot: false },
            THE_RAT_SEASON: { name: "The Rat-Season:", result: undefined, resetDay: DAYS.MONDAY, blindspot: false },
            DIRECTION_OF_THE_RAT_WIND: { name: "Direction of the Rat-Wind:", result: undefined, resetDay: DAYS.MONDAY, blindspot: false },
            PHASE_OF_THE_RAT_MOON: { name: "Phase of the Rat-Moon:", result: undefined, resetDay: DAYS.MONDAY, blindspot: false },
            THE_FALSE_SEASON: { name: "The False-Season:", result: undefined, resetDay: DAYS.MONDAY, blindspot: false },
            THE_SEASON_IN_SOUP: { name: "The Season in Soup", result: undefined, resetDay: DAYS.MONDAY, blindspot: false },
            BONE_MARKET_FLUCTUATIONS: { name: "Bone Market Fluctuations:", result: undefined, resetDay: DAYS.TUESDAY, blindspot: false },
            ZOOLOGICAL_MANIA: { name: "Zoological Mania:", result: undefined, resetDay: DAYS.TUESDAY, blindspot: false },
            HEARTS_GAME_SEASON: { name: "Hearts' Game Season (Placeholder)", result: { name: "f", value: "", timestamp: 1725880235017 }, resetDay: DAYS.TUESDAY, blindspot: false },
            SEASON_OF_THE_SACROBOSCAN_CALENDAR: { name: "Season of the Sacroboscan Calendar", result: undefined, resetDay: DAYS.THURSDAY, blindspot: true }
        };
        expect(timekeeper.worldQualities).toStrictEqual(expected);
        expect(dirty).toBe(true);
        //assert stuff
    })

    it('testTrackerParseJSON', () => {
        const foo: Map<string, TrackedQuality> = new Map(Object.entries(JSON.parse(`{"Campaign Morale":{"name":"Campaign Morale","category":"Progress","currentValue":13,"targetValues":[16],"image":"flag"},"Advance!":{"name":"Advance!","category":"SidebarTransient","currentValue":0,"targetValues":[24],"image":"drum"}}`)));
        expect(foo.get("Campaign Morale")!.category).toEqual("Progress");
        expect(foo.get("Advance!")!.targetValues![0]).toEqual(24)
    });

    it('testTrackerReplaceElements', () => {
        
        document.body.innerHTML = `<div>a<span id="b" /><button id="c" /><ul id="foo"><li id="1-tracker" /><li id="2-tracker" /></ul><ul id="foo-edit"><li id="1-tracker-edit" /><li id="2-tracker-edit" /></ul></div>`;
        const quality: TrackedQuality = { name: "1", category: "", currentValue: 1, image: "" };
        const tracker = new MiscTrackerFixer();
        tracker.regenerateTracker(quality);
        expect(document.getElementById("1-tracker")?.classList.contains("tracked-quality")).toEqual(true);
        expect(document.getElementById("1-tracker-value-and-target-no-target")?.textContent).toEqual("1");
        expect(document.getElementById("2-tracker")?.children.length).toEqual(0);
        expect(document.getElementById("1-tracker-edit")?.classList.contains("tracked-quality-edit")).toEqual(true);
    })

    it('testTrackerMoveItem', () => {
        document.body.innerHTML = `<ul id="quality-tracker"><li id="1-tracker" /><li id="2-tracker" /><li id="3-tracker" /></ul>` +
            `<ul id="quality-tracker-edit"><li id="1-tracker-edit" /><li id="2-tracker-edit" /><li id="3-tracker-edit" /></ul>`
        const tracker = new MiscTrackerFixer();
        tracker.currentSettings = {};
        tracker.trackedQualities = new Map();
        tracker.trackedQualities.set("1", { name: "1", category: "1", currentValue: 1, image: "1" });
        tracker.trackedQualities.set("2", { name: "2", category: "2", currentValue: 2, image: "2" });
        tracker.trackedQualities.set("3", { name: "3", category: "3", currentValue: 3, image: "3" });

        tracker.moveItem("1", "DOWN");//1,2,3 -> 2,1,3
        let qualities = document.getElementById("quality-tracker")!.children;
        expect(qualities[0].id).toEqual("2-tracker");
        expect(qualities[1].id).toEqual("1-tracker");
        expect(qualities[2].id).toEqual("3-tracker");
        let qualitiesEdit = document.getElementById("quality-tracker-edit")!.children;
        expect(qualitiesEdit[0].id).toEqual("2-tracker-edit");
        expect(qualitiesEdit[1].id).toEqual("1-tracker-edit");
        expect(qualitiesEdit[2].id).toEqual("3-tracker-edit");
        expect(Array.from(tracker.trackedQualities.keys())).toEqual(["2", "1", "3"]);
        expect(sendToServiceWorker).toHaveBeenCalled();
        (sendToServiceWorker as jest.MockedFunction<typeof sendToServiceWorker>).mockClear();

        tracker.moveItem("2", "UP");//2 already at top, do nothing
        qualities = document.getElementById("quality-tracker")!.children;
        expect(qualities[0].id).toEqual("2-tracker");
        expect(qualities[1].id).toEqual("1-tracker");
        expect(qualities[2].id).toEqual("3-tracker");
        qualitiesEdit = document.getElementById("quality-tracker-edit")!.children;
        expect(qualitiesEdit[0].id).toEqual("2-tracker-edit");
        expect(qualitiesEdit[1].id).toEqual("1-tracker-edit");
        expect(qualitiesEdit[2].id).toEqual("3-tracker-edit");
        expect(Array.from(tracker.trackedQualities.keys())).toEqual(["2", "1", "3"]);
        expect(sendToServiceWorker).not.toHaveBeenCalled();
        (sendToServiceWorker as jest.MockedFunction<typeof sendToServiceWorker>).mockClear();

        tracker.moveItem("3", "DOWN");//3 already at bottom, do nothing
        qualities = document.getElementById("quality-tracker")!.children;
        expect(qualities[0].id).toEqual("2-tracker");
        expect(qualities[1].id).toEqual("1-tracker");
        expect(qualities[2].id).toEqual("3-tracker");
        qualitiesEdit = document.getElementById("quality-tracker-edit")!.children;
        expect(qualitiesEdit[0].id).toEqual("2-tracker-edit");
        expect(qualitiesEdit[1].id).toEqual("1-tracker-edit");
        expect(qualitiesEdit[2].id).toEqual("3-tracker-edit");
        expect(Array.from(tracker.trackedQualities.keys())).toEqual(["2", "1", "3"]);
        expect(sendToServiceWorker).not.toHaveBeenCalled();
        (sendToServiceWorker as jest.MockedFunction<typeof sendToServiceWorker>).mockClear();

        tracker.moveItem("3", "UP");//2,1,3 -> 2,3,1
        qualities = document.getElementById("quality-tracker")!.children;
        expect(qualities[0].id).toEqual("2-tracker");
        expect(qualities[1].id).toEqual("3-tracker");
        expect(qualities[2].id).toEqual("1-tracker");
        qualitiesEdit = document.getElementById("quality-tracker-edit")!.children;
        expect(qualitiesEdit[0].id).toEqual("2-tracker-edit");
        expect(qualitiesEdit[1].id).toEqual("3-tracker-edit");
        expect(qualitiesEdit[2].id).toEqual("1-tracker-edit");
        expect(Array.from(tracker.trackedQualities.keys())).toEqual(["2", "3", "1"]);
        expect(sendToServiceWorker).toHaveBeenCalled();
        (sendToServiceWorker as jest.MockedFunction<typeof sendToServiceWorker>).mockClear();
    })

    it('testTrackerHideUpAndDownButtons', () => {
        document.body.innerHTML = `<ul id="quality-tracker-edit"><li id="1-tracker-edit"><button class="up-button" /><button class="down-button" hidden disabled style="opacity: 0"/></li>` +
            `<li id="2-tracker-edit"><button class="up-button" hidden disabled style="opacity: 0" /><button class="down-button" /></li>` +
            `<li id="3-tracker-edit"><button class="up-button" style="opacity: 1"/><button class="down-button" hidden disabled style="opacity: 0" /></li>`;
        const tracker = new MiscTrackerFixer();
        tracker.hideUpAndDownButtons();
        
        const buttons = document.getElementsByTagName("button") as HTMLCollectionOf<HTMLButtonElement>;
        expect(buttons[0].getAttribute("hidden")).toStrictEqual("");
        expect(buttons[1].getAttribute("hidden")).toStrictEqual(null);
        expect(buttons[2].getAttribute("hidden")).toStrictEqual(null);
        expect(buttons[3].getAttribute("hidden")).toStrictEqual(null);
        expect(buttons[4].getAttribute("hidden")).toStrictEqual(null);
        expect(buttons[5].getAttribute("hidden")).toStrictEqual("");
        expect(buttons[0].getAttribute("disabled")).toStrictEqual("");
        expect(buttons[1].getAttribute("disabled")).toStrictEqual(null);
        expect(buttons[2].getAttribute("disabled")).toStrictEqual(null);
        expect(buttons[3].getAttribute("disabled")).toStrictEqual(null);
        expect(buttons[4].getAttribute("disabled")).toStrictEqual(null);
        expect(buttons[5].getAttribute("disabled")).toStrictEqual("");
        expect(buttons[0].style.opacity).toStrictEqual("0");
        expect(buttons[1].style.opacity).toStrictEqual("1");
        expect(buttons[2].style.opacity).toStrictEqual("1");
        expect(buttons[3].style.opacity).toStrictEqual("1");
        expect(buttons[4].style.opacity).toStrictEqual("1");
        expect(buttons[5].style.opacity).toStrictEqual("0");
    })
});