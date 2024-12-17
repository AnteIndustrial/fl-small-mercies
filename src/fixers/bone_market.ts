/* eslint-disable @typescript-eslint/no-unused-vars */
import { IMutationAware, IStateAware } from "./base";
import { SettingsObject } from "../settings";
import { GameStateController, GameState } from "../game_state";
import { MSG_TYPE_SAVE_SETTINGS, MSG_TYPE_UPDATE_SETTINGS } from "../constants";
import { sendToServiceWorker } from "../comms";
import { FLApiInterceptor } from "../api_interceptor";
import { SortableTable } from "../sortable-table"
import { IBeginStoryletRequest } from "../interfaces";
import { AssemblyMap, AssemblyStep, BoneDetails, BONE_NAMES, recipeMap } from "./recipes";


const ASSEMBLE_A_SKELETON_ID = 330107;



//after opening 'assemble skeleton' the thing moves above the cards, keep it in one place
//disable storylets to add things that don't fit the recipe
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
        return this.enableBoneMarketHelper && this.currentState.location.area.areaId === 111138;
    }

    linkState(state: GameStateController): void {
        this.currentState = state.getState();
        state.onLocationChanged((_, location) => {
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
        if (document.getElementsByClassName("media").length === 0) {
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

    onNodeAdded(_: HTMLElement): void {
        if (document.getElementById("bone-market-recipe-helper") === null) {
            this.createBoneMarketPanels();
        } else {
            this.placeDivsInRightPosition();
        }
    }

    createBoneMarketPanels() {
        const storylets = document.getElementsByClassName("media");
        if (storylets.length == 0) {
            console.log("error");
            return;
        }

        const recipeDiv = document.getElementById("bone-market-recipe-helper") as HTMLDivElement || this.createRecipeSelect();
        const ingredientDiv = document.getElementById("bone-market-ingredient-container") as HTMLDivElement || this.generateIngredientTable();
        this.placeDivsInRightPosition(recipeDiv, ingredientDiv);
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
            if (!requirementsListInner) {
                console.log("couldn't find requirements list");
                return;
            }
            requirementsListInner.replaceChildren();
            const recipeSelectInner = document.getElementById("recipe-select") as HTMLSelectElement;
            if (!recipeSelectInner) {
                console.log("couldn't find recipe select");
                return;
            }
            sendToServiceWorker(MSG_TYPE_UPDATE_SETTINGS, { settings: { current_recipe_name: recipeSelectInner.value, current_recipe_step: "0" } });
            this.populateRequirementsList(requirementsListInner, recipeSelectInner);
            //todo blockOrUnblockBranches()
        });
        infoDisplay.appendChild(recipeSelect);

        const requirementsList = document.createElement("ul");
        requirementsList.id = "requirements-list";
        if (recipeSelect.value !== "") {
            this.populateRequirementsList(requirementsList, recipeSelect);
        }
        infoDisplay.appendChild(requirementsList);


        contentsDiv.appendChild(infoDisplay);
        displayDiv.appendChild(contentsDiv);
        containerDiv.appendChild(displayDiv);
        return containerDiv;
    }

    populateRequirementsList(requirementsList: HTMLUListElement, recipeSelect: HTMLSelectElement) {
        const recipe = recipeMap.get(recipeSelect.value);
        if (!recipe) {
            console.log(`error finding ${recipeSelect.value}`);
            return;
        }

        const requirements = [];
        for (const requirement of recipe.bones) {
            const details = BoneDetails.get(requirement.bone);
            if (!details) {
                console.log(`can't find ID for bone ${requirement.bone}`);
                return;
            }
            requirements.push(requirement);
            if (details.additionalCost) {
                for (const additionalReq of details.additionalCost) {
                    const quantityProduct = additionalReq.quantity * requirement.quantity;

                    requirements.push({ bone: additionalReq.bone, quantity: quantityProduct })
                }
            }
        }

        for (const bone of requirements) {
            const item = document.createElement("li");
            // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
            const boneID = BoneDetails.get(bone.bone)!.id;
            const bonesOwned = this.currentState.getQualityById(boneID)?.level || 0;
            item.textContent = `${bone.bone}: ${bone.quantity} needed, currently have ${bonesOwned}`;
            if (bone.quantity - bonesOwned > 0) {
                item.style.fontWeight = "bold";
            }
            requirementsList.appendChild(item);
        }
    }

    generateIngredientTable(): HTMLDivElement {
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
            const details = BoneDetails.get(name);
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
        interceptor.onResponseReceived("/api/storylet/begin", (request, response) => {
            if (!this.enableBoneMarketHelper || !this.currentRecipeName) {
                return;
            }

            const beginRequest = request as unknown as IBeginStoryletRequest;
            if (beginRequest.eventId !== ASSEMBLE_A_SKELETON_ID) {
                return;
            }

            blockBranches(response.storylet.childBranches, recipeMap.get(this.currentRecipeName)?.steps[this.currentRecipeStep] as AssemblyStep);
        });

        interceptor.onResponseReceived("/api/storylet", (_request, response) => {
            if (!this.enableBoneMarketHelper || !this.currentRecipeName) {
                return;
            }

            if (response.phase != "In") {
                return;
            }

            if (response.storylet.id !== ASSEMBLE_A_SKELETON_ID) {
                return;
            }

            blockBranches(response.storylet.childBranches, recipeMap.get(this.currentRecipeName)?.steps[this.currentRecipeStep] as AssemblyStep);
        });
        interceptor.onResponseReceived("/api/storylet/choosebranch", (request, response) => {
            if (!this.enableBoneMarketHelper || !this.currentRecipeName || this.currentState.location.area.areaId !== 111138) {
                return;
            }
            const currentRecipe = recipeMap.get(this.currentRecipeName);
            const currentStepName = currentRecipe?.steps[this.currentRecipeStep];
            if (currentStepName) {
                const currentStepId = AssemblyMap[currentStepName];
                if (request.branchId === currentStepId) {
                    //response.isSuccess could branch the recipe
                    this.currentRecipeStep++;
                }
            }
            
            
        });
    }

    applySettings(settings: SettingsObject): void {
        this.enableBoneMarketHelper = settings.bone_market_helper as boolean;
        this.currentRecipeName = settings.current_recipe_name as string;
        this.currentRecipeStep = Number(settings.current_recipe_step as string);
        this.currentSettings = settings;
        if (this.currentlyActive && !this.enableBoneMarketHelper) {
            this.deletePanels(undefined, undefined);
            this.currentlyActive = false;
        }
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function blockBranches(branches: any[], currentStepName: AssemblyStep) {
    const currentStepId = AssemblyMap[currentStepName]
    for (const branch of branches) {
        if (currentStepId && branch.id !== currentStepId) {
            branch.qualityLocked = true;
            branch.qualityRequirements.push(SMALL_MERCIES_LOCKED_QUALITY);
        }
    }
}

export const SMALL_MERCIES_LOCKED_QUALITY = {
    allowedOn: "Character",
    qualityId: 777_777_777,
    qualityName: "Abundance of Caution",
    tooltip: "It is locked for your own good.",
    availableAtMessage: 'You can re-enable this branch by clearing your selected recipe.',
    category: "Extension",
    nature: "Status",
    status: "Locked",
    isCost: false,
    image: "mercy",
    id: 777_777_777,
};
