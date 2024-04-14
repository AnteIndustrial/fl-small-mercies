/* eslint-disable @typescript-eslint/no-unused-vars */
import { IMutationAware, IStateAware } from "./base";
import { SettingsObject } from "../settings";
import { GameStateController } from "../game_state";
import { getSingletonByClassName } from "../utils";


export class MiscTracker implements IMutationAware, IStateAware {

    private displayMiscTracker = true;
    private miscValues: Map<string, TrackedQuality> = new Map();

    constructor() {
        this.miscValues.set("Striped Delights", new TrackedQuality("Story", 0, 105, "tigerstripes"));
        //TODO this.miscValues.set("Striped Delights", [0, 176])
        this.miscValues.set("Silver Horseheads", new TrackedQuality("Story", 0, 176, "horsesilver"));
        this.miscValues.set("Imperial Legitimacy", new TrackedQuality("Story", 0, 100, "empresscourt"));
        this.miscValues.set("Time Passing in Office", new TrackedQuality("Progress", 0, 12, "declaim2"));
        this.miscValues.set("Antique Mystery", new TrackedQuality("Elder", 0, 55, "meteors"));
    }

    applySettings(settings: SettingsObject): void {
        ;
    }

    linkState(state: GameStateController): void {
        state.onCharacterDataLoaded((g) => {
            for (const [key, value] of this.miscValues) {
                const quality = g.getQuality(value.getCategory(), key);
                if (quality) {
                    this.miscValues.get(key)?.setCurrentValue(quality.level);
                } else {
                    this.miscValues.get(key)?.setCurrentValue(0);
                }

                this.updateTracker(key, quality?.level || 0);
            }
        });

        state.onQualityChanged((state, quality, _previous, current) => {
            if (this.miscValues.has(quality.name)) {
                this.miscValues.get(quality.name)?.setCurrentValue(current);
                this.updateTracker(quality.name, current);
            }
        });
    }

    private createTracker(valueName: string): HTMLElement {
        const value = this.miscValues.get(valueName);
        const currentValue = value?.getCurrentValue() || 0;
        const targetValue = value?.getTargetValue() || 0;
        const icon = value?.getImage() || "question";

        const newDisplay = this.createTrackerDisplay(valueName, icon + "small", currentValue, targetValue);

        return newDisplay;
    }

    private updateTracker(title: string, value: number) {
        const miscTracker = document.getElementById("misc-tracker");
        if (!miscTracker) {
            return;
        }

        let qualityDisplay = null;
        const existingDisplays = miscTracker.getElementsByClassName("tracked-misc");
        for (const display of existingDisplays) {
            const displayTitle = (display as HTMLElement).dataset.qualityName;
            if (displayTitle == title) {
                qualityDisplay = display as HTMLElement;
                break;
            }
        }

        if (!qualityDisplay) {
            return;
        }

        const valueSpan = getSingletonByClassName(qualityDisplay, "item__value");
        const target = this.miscValues.get(title)?.getTargetValue() || 1;
        if (valueSpan) {
            valueSpan.textContent = ` ${value} / ${target}`;
        }

        const progressBarSpan = getSingletonByClassName(qualityDisplay, "progress-bar__stripe") as HTMLElement;
        if (progressBarSpan) {
            let percentage = (value / target) * 100;
            if (percentage > 100) {
                percentage = 100;
            }
            progressBarSpan.style.cssText = `width: ${percentage}%;`;
        }
        qualityDisplay.style.cssText = "text-align: left";

    }

    private createTrackerDisplay(title: string, icon: string, initialValue: number, targetValue: number): HTMLElement {
        const li = document.createElement("li");
        li.classList.add("js-item", "item", "sidebar-quality", "tracked-misc");
        li.style.cssText = "text-align: left";
        li.dataset.qualityName = title;

        const div = document.createElement("div");
        div.classList.add("js-icon", "icon", "js-tt", "icon--circular");

        const div3 = document.createElement("div");
        div3.classList.add("item__desc");

        const div4 = document.createElement("div");
        div4.setAttribute("tabindex", "0");
        div4.setAttribute("role", "button");
        div4.setAttribute("aria-label", title);
        div4.style.cssText = "outline: 0px; outline-offset: 0px; cursor: default;";

        const span = document.createElement("span");
        span.classList.add("js-item-name", "item__name");
        span.textContent = title;

        const span3 = document.createElement("span");
        span3.classList.add("item__value");
        span3.textContent = ` ${initialValue} / ${targetValue}`;

        const div5 = document.createElement("div");
        div5.classList.add("progress-bar");

        const img = document.createElement("img");
        img.classList.add("cursor-default");
        img.setAttribute("alt", `Tracking: ${title}`);
        img.setAttribute("src", `//images.fallenlondon.com/icons/${icon}.png`);
        img.setAttribute("aria-label", `${title}`);

        const span4 = document.createElement("span");
        span4.classList.add("progress-bar__stripe", "progress-bar__stripe--has-transition");
        let percentage = (initialValue / targetValue) * 100;
        if (percentage > 100) {
            percentage = 100;
        }
        span4.style.cssText = `width: ${percentage}%;`;

        li.appendChild(div);
        li.appendChild(div3);
        div.appendChild(div4);
        div3.appendChild(span);
        div3.appendChild(span3);
        div3.appendChild(div5);
        div4.appendChild(img);
        div5.appendChild(span4);
        return li;
    }

    checkEligibility(node: HTMLElement): boolean {
        if (!this.displayMiscTracker) {
            return false;
        }

        if (node.getElementsByClassName("travel").length == 0) {
            return false;
        }
        return document.getElementById("misc-tracker") == null;
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

        let miscPanel = document.getElementById("misc-tracker");
        // Trackers are already created and visible, nothing to do here.
        if (!miscPanel) {
            const fragment = document.createDocumentFragment();

            const miscHeader = document.createElement("p");
            miscHeader.classList.add("heading", "heading--4");
            miscHeader.textContent = "Tracked Values";
            fragment.appendChild(miscHeader);

            miscPanel = document.createElement("ul");
            miscPanel.setAttribute("id", "misc-tracker");
            miscPanel.classList.add("items", "items--list");
            fragment.appendChild(miscPanel);

            for (const valueName of this.miscValues.keys()) {
                const miscDisplay = this.createTracker(valueName);
                miscPanel.appendChild(miscDisplay);
            }

            sidebar.appendChild(fragment);
        }

        if (!travelColumn.contains(sidebar)) {
            travelColumn.appendChild(sidebar);
        }
    }

    onNodeRemoved(_node: HTMLElement): void {
        // Do nothing if DOM node is removed.
    }

}

class TrackedQuality {
    private category: string;
    private currentValue: number;
    private targetValue: number;
    private image: string;

    constructor(category: string, currentValue: number, targetValue: number, image: string) {
        this.category = category;
        this.currentValue = currentValue;
        this.targetValue = targetValue;
        this.image = image;
    }

    public getCategory(): string {
        return this.category;
    }

    public getCurrentValue(): number {
        return this.currentValue;
    }

    public setCurrentValue(newValue: number) {
        this.currentValue = newValue;
    }

    public getTargetValue(): number {
        return this.targetValue;
    }

    public getImage(): string {
        return this.image;
    }
}
