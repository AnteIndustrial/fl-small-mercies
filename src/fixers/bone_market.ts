import { IMutationAware, IStateAware } from "./base";
import { SettingsObject } from "../settings";
import { GameStateController, GameState } from "../game_state";
import { MSG_TYPE_UPDATE_SETTINGS } from "../constants";
import { sendToServiceWorker } from "../comms";
import { FLApiInterceptor } from "../api_interceptor";
import { SortableTable } from "../sortable-table"
import { AssemblyOptionIDMap, BoneDetails, BONE_NAMES, Ingredient, recipeMap } from "./recipes";


//add other skeleton recipes, eg generators
//levi frame, brass skull, 2 ivory femur, reptile, bomba generator, 4.93. levi frame, brass skull, 2 amber fin, fish, bomba generator, 5.30
//Knock-Kneed Newt recipe checks for failed checks, and changes the recipe to recover. Maybe deal with that?
//Amalgamy bomb says the tail is optional (it's too slow to be worth grinding, but if you've got it, use it here). Some sort of optional tag on ingredients?
export class BoneMarketFixer implements IMutationAware, IStateAware {

    currentSettings!: SettingsObject;

    currentState!: GameState;
    enableBoneMarketHelper = true;
    currentRecipeName = "";
    currentRecipeStep = 0;
    currentlyActive = false;

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
                console.log("location change")
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
        const recipeDiv = document.getElementById("bone-market-recipe-helper") as HTMLDivElement || this.createRecipeSelect();
        const ingredientDiv = document.getElementById("bone-market-ingredient-container") as HTMLDivElement || this.generateIngredientTable();
        this.placeDivsInRightPosition(recipeDiv, ingredientDiv);
        const headings = document.getElementsByClassName("media__heading heading heading--2 storylet-root__heading");
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
            const requirementsListInner = document.getElementById("requirements-list") as HTMLUListElement;
            const chartParent = document.getElementById("bone-market-recipe-helper");
            if (!requirementsListInner || !chartParent) {
                console.log("couldn't find requirements list or chart parent");
                return;
            }
            requirementsListInner.replaceChildren();
            const recipeSelectInner = document.getElementById("recipe-select") as HTMLSelectElement;
            if (!recipeSelectInner) {
                console.log("couldn't find recipe select");
                return;
            }
            this.currentRecipeName = recipeSelectInner.value;
            this.currentRecipeStep = 0;
            sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { current_recipe_name: recipeSelectInner.value, current_recipe_step: "0" } });
            this.populateRequirementsList(requirementsListInner, recipeSelectInner.value);

            const oldDiagram = document.getElementById("bone-market-recipe-diagram")
            oldDiagram?.parentNode?.removeChild(oldDiagram);

            chartParent.appendChild(this.makeChartWithCss(recipeSelectInner.value));
            this.lockOrUnlockButtons();
        });
        left.appendChild(recipeSelect);

        const requirementsList = document.createElement("ul");
        requirementsList.id = "requirements-list";
        if (recipeSelect.value !== "") {
            this.populateRequirementsList(requirementsList, recipeSelect.value);
            infoDisplay.appendChild(this.makeChartWithCss(recipeSelect.value))
        }
        left.appendChild(requirementsList);


        contentsDiv.appendChild(infoDisplay);
        displayDiv.appendChild(contentsDiv);
        containerDiv.appendChild(displayDiv);

        //const routeMap = getRouteMap();
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        //routeMap.get("a")!.getVisualisation(containerDiv);
        //containerDiv.appendChild(diagramDiv);

        return containerDiv;
    }

    makeChartWithCss(recipeName: string): HTMLDivElement {
        const diagramDiv = document.createElement("div");
        diagramDiv.addEventListener("click", () => {
            this.currentRecipeStep++; //todo delete, testing
            this.highlightCurrentStepOnDiagram();
        })
        diagramDiv.id = "bone-market-recipe-diagram";
        const recipe = recipeMap.get(recipeName);
        if (!recipe) {
            console.log(`error finding ${recipeName}`);
            return diagramDiv;
        }
        diagramDiv.classList.add("diagram-col");
        //diagramDiv.style.display = "inline-flex"
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

    populateRequirementsList(requirementsList: HTMLUListElement, recipeName: string) { //todo is this updated?
        const recipe = recipeMap.get(recipeName);
        if (!recipe) {
            console.log(`error finding ${recipeName}`);
            return;
        }
        const requirements: Ingredient[] = [];
        const optionals: Ingredient[] = [];
        for (const requirement of recipe.bones) {
            const details = BoneDetails[requirement.bone];
            if (!details) {
                console.log(`can't find ID for bone ${requirement.bone}`);
                return;
            }
            requirement.optional ? optionals.push(requirement) : requirements.push(requirement);

            if (details.additionalCost) {
                for (const additionalReq of details.additionalCost) {
                    const quantityProduct = additionalReq.quantity * requirement.quantity;

                    requirement.optional ?
                        optionals.push({ bone: additionalReq.bone, quantity: quantityProduct }) :
                        requirements.push({ bone: additionalReq.bone, quantity: quantityProduct })
                }
            }
        }

        for (const bone of requirements) {
            const item = document.createElement("li");
            const boneID = BoneDetails[bone.bone].id;
            const bonesOwned = this.currentState.getQualityById(boneID)?.level || 0;
            item.textContent = `${bone.bone}: ${bone.quantity} needed, currently have ${bonesOwned}`;
            if (bone.quantity - bonesOwned > 0) {
                item.style.fontWeight = "bold";
            }
            requirementsList.appendChild(item);
        }

        for (const bone of optionals) {
            const item = document.createElement("li");
            const boneID = BoneDetails[bone.bone].id;
            const bonesOwned = this.currentState.getQualityById(boneID)?.level || 0;
            item.textContent = `${bone.bone}: ${bone.quantity} can optionally be added, currently have ${bonesOwned}`;
            if (bone.quantity - bonesOwned > 0) {
                item.style.fontWeight = "bold";
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
        });
    }

    applySettings(settings: SettingsObject): void {
        this.enableBoneMarketHelper = settings.bone_market_helper as boolean;
        this.currentRecipeName = settings.current_recipe_name as string;
        this.currentRecipeStep = Number(settings.current_recipe_step as string);
        this.highlightCurrentStepOnDiagram();
        this.currentSettings = settings;
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
