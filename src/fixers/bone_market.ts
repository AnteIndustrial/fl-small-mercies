import { IMutationAware, IStateAware } from "./base";
import { SettingsObject } from "../settings";
import { GameStateController, GameState } from "../game_state";
import { MSG_TYPE_UPDATE_SETTINGS } from "../constants";
import { sendToServiceWorker } from "../comms";
import { FLApiInterceptor } from "../api_interceptor";
import { SortableTable } from "../sortable-table";
import { AssemblyOptionIDMap, BoneDetails, BONE_NAMES, Recipe, recipeMap, AssemblyDetails, BoneName, SkeletonMania, SkeletonQuality } from "./recipes";
import { WorldQuality, WorldQualityName } from "./timekeeper";

//Knock-Kneed Newt recipe checks for failed checks, and changes the recipe to recover. Maybe deal with that?
//Steps can have costs (add more joints) or prerequisites (carve away age). How to deal with that?
//branches can currently only be one step
//Calculate cost of adding more joints
//consider changing to indexeddb
export class BoneMarketFixer implements IMutationAware, IStateAware {

    currentSettings!: SettingsObject;

    currentState!: GameState;
    enableBoneMarketHelper = true;
    currentRecipeName = "";
    currentRecipeStep = 0;
    currentlyActive = false;
    fourExhaustion = false;
    mania: string | undefined;
    quality: string | undefined;

    constructor() {
        //
    }

    shouldBoneMarketHelpersExist() {
        return this.enableBoneMarketHelper && this.currentState.location.area.areaId === 111138 &&
            document.getElementsByClassName("media").length !== 0;
    }

    linkState(state: GameStateController): void {
        this.currentState = state.getState();
        state.onLocationChanged((_, __) => {
            if (this.shouldBoneMarketHelpersExist()) {
                this.createBoneMarketPanels();
            } else if (this.currentlyActive) {
                this.deletePanels(undefined, undefined);
                this.currentlyActive = false;
            }
        });
    }

    checkEligibility(_: HTMLElement): boolean {
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
        return this.shouldBoneMarketHelpersExist();
    }

    onNodeAdded(node: HTMLElement): void {
        if (document.getElementById("bone-market-recipe-helper") === null) {
            this.createBoneMarketPanels();
        } else {
            if (Object.prototype.hasOwnProperty.call(node, '_tippy')){
                return; //ignore tooltips
            }
            this.placeDivsInRightPosition();
            const headings = document.getElementsByClassName("media__heading heading heading--2 storylet-root__heading");
            if (headings && headings.length === 1) {
                if (headings[0].textContent === "Assemble a Skeleton") {
                    this.lockOrUnlockButtons();
                }
            }
        }
    }

    createBoneMarketPanels() {
        const headings = document.getElementsByClassName("media__heading heading heading--2 storylet-root__heading");
        const recipeDiv = document.getElementById("bone-market-recipe-helper") as HTMLDivElement || this.createRecipeSelect();
        const ingredientDiv = document.getElementById("bone-market-ingredient-container") as HTMLDivElement || this.generateIngredientTable();
        this.placeDivsInRightPosition(recipeDiv, ingredientDiv);
        if (headings && headings.length === 1) {
            if (headings[0].textContent === "Assemble a Skeleton") {
                this.lockOrUnlockButtons();
            }
        }
        this.currentlyActive = true;
    }

    createRecipeSelect() {
        const containerDiv = document.createElement("div");
        containerDiv.classList.add("media");
        containerDiv.id = "bone-market-recipe-container";
        containerDiv.style.cssText = "outline: none;";

        const displayDiv = document.createElement("div");
        displayDiv.className = "storylet__body";

        const contentsDiv = document.createElement("div");
        contentsDiv.className = "storylet__title-and-description";

        const infoDisplay = document.createElement("div");
        infoDisplay.id = "bone-market-recipe-helper";
        infoDisplay.style.display = "flex";
        infoDisplay.style.justifyContent = "space-between";

        const left = document.createElement("div");
        left.style.display = "inline-block";
        left.style.flexBasis = "100%";
        infoDisplay.appendChild(left)

        const recipeSelect = document.createElement("select");
        recipeSelect.id = "recipe-select";
        const defaultOption = document.createElement("option");
        defaultOption.setAttribute("value", "");
        recipeSelect.appendChild(defaultOption);

        for (const [name, _] of recipeMap) {
            const option = document.createElement("option");
            option.textContent = name;
            option.value = name;
            recipeSelect.appendChild(option);
        }
        recipeSelect.value = this.currentRecipeName;

        recipeSelect.addEventListener("change", () => {
            const chartParent = document.getElementById("bone-market-recipe-helper");
            if (!chartParent) {
                console.log("couldn't find requirements list or chart parent");
                return;
            }
            const recipeSelectInner = document.getElementById("recipe-select") as HTMLSelectElement;
            if (!recipeSelectInner) {
                console.log("couldn't find recipe select");
                return;
            }
            this.currentRecipeName = recipeSelectInner.value;
            this.currentRecipeStep = 0;
            sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { current_recipe_name: recipeSelectInner.value, current_recipe_step: "0" } });
            this.createRecipeDetailsPanel(recipeSelectInner.value);

            const oldDiagram = document.getElementById("bone-market-recipe-diagram")
            oldDiagram?.parentNode?.removeChild(oldDiagram);

            chartParent.appendChild(this.makeChartWithCss(recipeSelectInner.value));
            this.lockOrUnlockButtons();
        });
        left.appendChild(recipeSelect);
        
        left.appendChild(this.createRecipeDetailsPanel(recipeSelect.value));
        infoDisplay.appendChild(this.makeChartWithCss(recipeSelect.value))

        contentsDiv.appendChild(infoDisplay);
        displayDiv.appendChild(contentsDiv);
        containerDiv.appendChild(displayDiv);

        return containerDiv;
    }

    makeChartWithCss(recipeName: string): HTMLDivElement { //account for ""
        const diagramDiv = document.createElement("div");
        diagramDiv.id = "bone-market-recipe-diagram";
        const recipe = recipeMap.get(recipeName);
        if (!recipe) {
            return diagramDiv;
        }
        diagramDiv.classList.add("diagram-col");
        diagramDiv.style.flexBasis = "100%"
        for (let i = 0; i < recipe.steps.length; i++) {
            const step = recipe.steps[i];
            const diagramRow = document.createElement("div");
            diagramDiv.appendChild(diagramRow);
            diagramRow.classList.add("diagram-pill");
            diagramRow.classList.add("diagram-row");
            for (const stepOption of step) {
                const optionDiv = document.createElement("div");
                optionDiv.classList.add("diagram-rect");
                optionDiv.textContent = stepOption;
                diagramRow.appendChild(optionDiv);
            }
            if (i < recipe.steps.length - 1) {
                const diagramLine = document.createElement("div");
                diagramLine.classList.add("diagram-line-h");
                diagramDiv.appendChild(diagramLine);
            }
        }
        this.highlightCurrentStepOnDiagram(diagramDiv);
        return diagramDiv;
    }

    highlightCurrentStepOnDiagram(diagramDiv?: HTMLDivElement) {
        if (!diagramDiv) {
            diagramDiv = document.getElementById("bone-market-recipe-diagram") as HTMLDivElement;
            if (!diagramDiv) {
                return;
            }
        }
        diagramDiv.getElementsByClassName("highlight-step")[0]?.classList.remove("highlight-step");
        const allRows = diagramDiv.getElementsByClassName("diagram-row");
        if (!allRows || allRows.length === 0) {
            return;
        }
        if (this.currentRecipeStep < allRows.length) {
            allRows[this.currentRecipeStep].classList.add("highlight-step");
        } else {
            allRows[0].classList.add("highlight-step");
        }
    }

    createRecipeDetailsPanel(recipeName: string): HTMLDivElement { //todo is this updated?
        const recipe = recipeMap.get(recipeName) || blankRecipe;

        const recipeDetails = document.createElement("div");
        recipeDetails.id = "recipe-details-container-div";
        this.populateRecipeDetails(recipe, recipeDetails);


        if (recipe.exhaustion && recipe.exhaustion > 0 && !document.getElementById("four-exhaustion-checkbox")) {
            const fourExhaustionCheckbox = document.createElement("input");
            fourExhaustionCheckbox.type = "checkbox";
            fourExhaustionCheckbox.id = "four-exhaustion-checkbox";
            if (this.fourExhaustion) {
                fourExhaustionCheckbox.checked = true;
            }
            fourExhaustionCheckbox.addEventListener("change", (_) => {
                const checkBoxInner = document.getElementById("four-exhaustion-checkbox") as HTMLInputElement;
                this.fourExhaustion = checkBoxInner.checked;
                sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { four_exhaustion: fourExhaustionCheckbox.checked } });
                this.createRecipeDetailsPanel(this.currentRecipeName);
            });
            recipeDetails.appendChild(fourExhaustionCheckbox);
            const label = document.createElement("label");
            label.htmlFor = "four-exhaustion-checkbox";
            label.textContent = "Multiply requirements to use four exhaustion.";
            recipeDetails.appendChild(label);
        }

        const checkBox = document.getElementById("four-exhaustion-checkbox") as HTMLInputElement;
        if (checkBox) {
            recipe.exhaustion ? checkBox.disabled = false : checkBox.disabled = true; //todo also hidden?
        }

        this.populateRequirements(recipe, recipeDetails);
        return recipeDetails;
    }

    populateRecipeDetails(recipe: Recipe, parent: HTMLDivElement) {
        let detailsList = document.getElementById("recipe-details-list") as HTMLUListElement;
        if (detailsList) {
            detailsList.replaceChildren()
        } else {
            detailsList = document.createElement("ul");
            detailsList.id = "recipe-details-list";
            detailsList.style.listStyleType = "none";
            parent.appendChild(detailsList);
        }

        if (recipe.name === "") {
            const name = document.createElement("li");
            name.textContent = `No recipe selected.`;
            detailsList.appendChild(name);
            const recTitle = document.createElement("li");
            recTitle.textContent = `Recommended recipes for ${this.quality} and ${this.mania} week:`;
            detailsList.appendChild(recTitle);
            const recommended = this.getRecommendedRecipeNames();
            for (const recipeName of recommended) {
                const recc = document.createElement("li");
                recc.textContent = recipeName;
                detailsList.appendChild(recc);
            }
            return;
        }
        
        const name = document.createElement("li");
        name.textContent = `Recipe name: ${recipe.name}.`;
        detailsList.appendChild(name);

        if (recipe.quality.length !== 0 && !recipe.quality.includes("NA")) {
            const quality = document.createElement("li");
            quality.textContent = `To be made in ${recipe.quality.join(", ")} weeks.`;
            detailsList.appendChild(quality);
        }
        if (recipe.mania.length !== 0 && !recipe.mania.includes("NA")) {
            const mania = document.createElement("li");
            mania.textContent = `To be made in ${recipe.mania.join(", ")} weeks.`;
            detailsList.appendChild(mania);
        }
        if (recipe.buyer) {
            const buyer = document.createElement("li");
            buyer.textContent = `Sell to ${recipe.buyer}.`;
            detailsList.appendChild(buyer);
        }
        if (recipe.payout) {
            const payout = document.createElement("li");
            payout.textContent = `Sells for ${recipe.payout}.`;
            detailsList.appendChild(payout);
        }
        if (recipe.exhaustion || recipe.exhaustion === 0) {
            const exhaustion = document.createElement("li");
            exhaustion.textContent = `Costs ${recipe.exhaustion || 0} exhaustion.`;
            detailsList.appendChild(exhaustion);
        }
        if (recipe.epa) {
            const epa = document.createElement("li");
            epa.textContent = `Estimated EPA: ${recipe.epa}.`;
            detailsList.appendChild(epa);
        }
    }

    //todo maybe something like if bonefragments are low, recommend that
    getRecommendedRecipeNames(): string[] {
        const recommended: string[] = []
        for (const [key, val] of recipeMap) {
            if (val.exhaustion) {
                if (val.mania.includes(this.mania as SkeletonMania) && val.quality.includes(this.quality as SkeletonQuality)) {
                    recommended.push(key)
                }
            } else {
                if (val.mania.includes(this.mania as SkeletonMania) || val.quality.includes(this.quality as SkeletonQuality)) {
                    recommended.push(key);
                }
            }
        }
        return recommended;
    }

    populateRequirements(recipe: Recipe, parent: HTMLDivElement) {
        let requirementsList = document.getElementById("requirements-list") as HTMLUListElement;
        if (requirementsList) {
            requirementsList.replaceChildren();
        } else {
            requirementsList = document.createElement("ul");
            requirementsList.id = "requirements-list";
            requirementsList.style.listStyleType = "none";
            parent.appendChild(requirementsList);
        }
        
        const reqMap: Map<BoneName, number> = new Map();
        const optMap: Map<BoneName, number> = new Map();

        for (const steps of recipe.steps) {
            if (steps.length === 1) {
                for (const ingredient of AssemblyDetails[steps[0]].cost) {
                    reqMap.set(ingredient.bone, ingredient.quantity + (reqMap.get(ingredient.bone) || 0));
                }
            } else {
                for (const step of steps) {
                    for (const ingredient of AssemblyDetails[step].cost) {
                        optMap.set(ingredient.bone, ingredient.quantity + (optMap.get(ingredient.bone) || 0));
                    }
                }
            }
        }

        //todo update this with player's current exhaustion?
        let multiplier;
        if (this.fourExhaustion) {
            switch (recipe.exhaustion) {
                case (undefined): //fallthrough
                case (0): multiplier = 0;
                    break;
                case (1):
                    multiplier = 4;
                    break;
                case (2): //fallthrough
                case (3):
                    multiplier = 2;
                    break;
                case (4): //fallthrough
                default:
                    multiplier = 1;
            }
        }

        for (const [boneName, boneNum] of reqMap) {
            const item = document.createElement("li");
            const boneID = BoneDetails[boneName].id;
            const bonesOwned = this.currentState.getQualityById(boneID)?.level || 0;
            if (multiplier && recipe.exhaustion) {
                item.textContent = `${boneName}: ${boneNum * multiplier} needed for ${recipe.exhaustion * multiplier} exhaustion, currently have ${bonesOwned}`;
                if (boneNum * multiplier - bonesOwned > 0) {
                    item.style.fontWeight = "bold";
                }
            } else {
                item.textContent = `${boneName}: ${boneNum} needed, currently have ${bonesOwned}`;
                if (boneNum - bonesOwned > 0) {
                    item.style.fontWeight = "bold";
                }
            }
            
            requirementsList.appendChild(item);
        }

        for (const [boneName, boneNum] of optMap) {
            const item = document.createElement("li");
            const boneID = BoneDetails[boneName].id;
            const bonesOwned = this.currentState.getQualityById(boneID)?.level || 0;
            if (multiplier && recipe.exhaustion) {
                item.textContent = `${boneName}: ${boneNum * multiplier} can optionally be added for ${recipe.exhaustion * multiplier} exhaustion, currently have ${bonesOwned}`;
                if (boneNum * multiplier - bonesOwned > 0) {
                    item.style.fontWeight = "bold";
                }
            } else {
                item.textContent = `${boneName}: ${boneNum} can optionally be added, currently have ${bonesOwned}`;
                if (boneNum - bonesOwned > 0) {
                    item.style.fontWeight = "bold";
                }
            }
            requirementsList.appendChild(item);
        }
    }

    generateIngredientTable(): HTMLDivElement {//todo is this updated?
        const containerDiv = document.createElement("div");
        containerDiv.classList.add("media");
        containerDiv.id = "bone-market-ingredient-container";
        containerDiv.style.cssText = "outline: none;";

        const displayDiv = document.createElement("div");
        displayDiv.className = "storylet__body";

        const contentsDiv = document.createElement("div");
        contentsDiv.className = "storylet__title-and-description";

        const tableDiv = document.createElement("div");
        tableDiv.classList.add("table-wrap")
        const table = document.createElement("table");
        table.classList.add("sortable")
        tableDiv.appendChild(table)
        const tableHead = document.createElement("thead");
        table.appendChild(tableHead);
        const headRow = document.createElement("tr");
        tableHead.appendChild(headRow);
        for (const heading of ["Name", "Type", "Owned"]) {
            const headingCell = document.createElement("th");
            if (heading === "Owned") {
                headingCell.classList.add("num");
            }
            const headingButton = document.createElement("button");
            headingCell.appendChild(headingButton);
            headingButton.textContent = heading;
            const buttonSpan = document.createElement("span");
            buttonSpan.setAttribute("aria-hidden", "true");
            headingButton.appendChild(buttonSpan)
            headRow.appendChild(headingCell);
        }
        const tableBody = document.createElement("tbody");
        table.appendChild(tableBody);
        for (const name of BONE_NAMES) {
            const row = document.createElement("tr");
            const details = BoneDetails[name];
            const nameCell = document.createElement("td");
            nameCell.textContent = name;
            row.appendChild(nameCell);
            const typeCell = document.createElement("td");
            typeCell.textContent = details?.type as string;
            row.appendChild(typeCell);
            const ownedCell = document.createElement("td");
            if (details) {
                const owned = this.currentState.getQualityById(details.id)?.level || 0
                ownedCell.textContent = String(owned);
                ownedCell.classList.add("num")
            }
            row.appendChild(ownedCell);
            tableBody.appendChild(row);
        }
        new SortableTable(table);
        contentsDiv.appendChild(tableDiv);
        displayDiv.appendChild(contentsDiv);
        containerDiv.appendChild(displayDiv);
        return containerDiv;
    }

    onNodeRemoved(_: HTMLElement): void {
        //do nothing?
    }

    placeDivsInRightPosition(recipes?: HTMLDivElement, ingredients?: HTMLDivElement) {
        if (!recipes) {
            recipes = document.getElementById("bone-market-recipe-container") as HTMLDivElement;
        }
        if (!ingredients) {
            ingredients = document.getElementById("bone-market-ingredient-container") as HTMLDivElement;
        }
        if (this.currentState.location.area.areaId !== 111138 || !this.enableBoneMarketHelper) {
            this.deletePanels(recipes, ingredients);
            return;
        }
        const media = document.getElementsByClassName("media");
        if (!recipes || !ingredients || !media || media.length < 1) {
            return;
        }
        const fifthCityStories = document.getElementsByClassName("disclosure-wrapper");
        if (fifthCityStories && fifthCityStories.length > 0) {
            fifthCityStories[0].after(recipes);
        } else {
            const mediaRoot = document.getElementsByClassName("media--root");
            if (mediaRoot && mediaRoot.length > 0) {
                mediaRoot[0].after(recipes);
            } else {
                media[0].parentElement?.insertBefore(recipes, media[0]);
            }
        }

        media[media.length - 1].parentElement?.appendChild(ingredients);
    }

    deletePanels(recipes?: HTMLDivElement, ingredients?: HTMLDivElement) {
        if (!recipes) {
            recipes = document.getElementById("bone-market-recipe-container") as HTMLDivElement;
        }
        if (!ingredients) {
            ingredients = document.getElementById("bone-market-ingredient-container") as HTMLDivElement;
        }
        recipes?.remove();
        ingredients?.remove();
    }

    linkNetworkTools(interceptor: FLApiInterceptor): void {
        //todo put more calls to placeDivsInRightPosition here, maybe?
        interceptor.onResponseReceived("/api/storylet/choosebranch", (request, _) => {
            if (!this.enableBoneMarketHelper || !this.currentRecipeName || this.currentState.location.area.areaId !== 111138) {
                return;
            }
            const currentRecipe = recipeMap.get(this.currentRecipeName);
            const currentStepName = currentRecipe?.steps[this.currentRecipeStep];
            if (currentStepName) {
                for (const stepName of currentStepName) {
                    const currentStepId = AssemblyOptionIDMap[stepName];
                    if (request.branchId === currentStepId) {
                        this.currentRecipeStep++;
                        this.highlightCurrentStepOnDiagram();
                        sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { current_recipe_step: this.currentRecipeStep } });
                    }
                }
            }
            this.placeDivsInRightPosition();
        });
    }

    applySettings(settings: SettingsObject): void {
        this.currentSettings = settings;
        this.enableBoneMarketHelper = settings.bone_market_helper as boolean;
        this.currentRecipeName = settings.current_recipe_name as string;
        this.currentRecipeStep = Number(settings.current_recipe_step as string);
        this.fourExhaustion = settings.four_exhaustion as boolean;
        const worldQualities: Record<WorldQualityName, WorldQuality> = JSON.parse(settings.worldQualities as string);
        this.mania = worldQualities.ZOOLOGICAL_MANIA.result?.value;
        this.quality = worldQualities.BONE_MARKET_FLUCTUATIONS.result?.value;
        this.highlightCurrentStepOnDiagram();
        if (this.currentlyActive && !this.enableBoneMarketHelper) {
            this.deletePanels(undefined, undefined);
            this.currentlyActive = false;
        }
    }

    lockOrUnlockButtons() {
        const allBranches = document.getElementsByClassName("media branch media--branch") as HTMLCollectionOf<HTMLDivElement>;
        if (allBranches.length === 0) {
            return;
        }
        const currentRecipe = recipeMap.get(this.currentRecipeName);
        if (!currentRecipe) {
            for (const branch of allBranches) {
                this.unlockBranch(branch);
            }
        } else {
            const currentStep = currentRecipe.steps[this.currentRecipeStep];
            const currentOptionsIds = currentStep.map((option) => { return AssemblyOptionIDMap[option]; })
            for (const branch of allBranches) {
                if (branch.dataset.branchId && !isNaN(Number(branch.dataset.branchId))) {
                    if (currentOptionsIds.includes(Number(branch.dataset.branchId))) {
                        this.unlockBranch(branch)
                    } else {
                        this.lockBranch(branch)
                    }
                } else {
                    return;//probably best to just leave it alone?
                }
            }
        }
    }

    lockBranch(branch: HTMLDivElement) {
        if (!branch.classList.contains("media--locked")) {
            branch.classList.add("media--locked");
        }
        if (!branch.getElementsByClassName("button--go")[0].hasAttribute("disabled")) {
            branch.getElementsByClassName("button--go")[0].setAttribute("disabled", "");
        }
        if (branch.querySelector('img[alt="It is locked for your own good."]') === null) {
            const template = document.createElement("template");
            template.innerHTML =
                `<div class="icon icon--circular icon--locked quality-requirement">
            <div aria-label="It is locked for your own good." tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                <img alt="It is locked for your own good." aria-label="It is locked for your own good." class="cursor-magnifier" src="//images.fallenlondon.com/icons/mercysmall.png">
            </div>
        </div>`;
            const firstReq = branch.getElementsByClassName("quality-requirement")[0];
            firstReq.parentElement?.insertBefore(template.content.firstChild as HTMLDivElement, firstReq);
        }
    }

    unlockBranch(branch: HTMLDivElement) {
        branch.querySelectorAll('img[alt="It is locked for your own good."]').forEach((elem) => elem.parentElement?.parentElement?.remove())
        if (branch.getElementsByClassName("icon--locked quality-requirement").length === 0) {
            if (branch.classList.contains("media--locked")) {
                branch.classList.remove("media--locked");
            }
            if (branch.getElementsByClassName("button--go")[0].hasAttribute("disabled")) {
                branch.getElementsByClassName("button--go")[0].removeAttribute("disabled");
            }
        }
    }
}

const blankRecipe: Recipe = {
    name: "",
    bones: [],
    type: "Chimera",
    quality: [],
    steps: [],
    mania: []
};