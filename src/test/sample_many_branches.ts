export const sampleBranchContainer = `
<div class="tab-content__bordered-container">
    <div class="media media--root" style="margin-bottom: 18px;">
        <div class="media__left">
            <div class="storylet-root__card">
                <div class="" style="background-image: url(&quot;https://images.fallenlondon.com/cards/Card-Unspecialised.png&quot;); background-size: cover;">
                    <img alt="Assemble a Skeleton" aria-label="Assemble a Skeleton" class="cursor-default media__object storylet-root__card-image" src="//images.fallenlondon.com/icons/skeleton.png">
                </div>
            </div>
        </div>
        <div class="media__body">
            <div class="storylet-root__frequency">
                <button type="button" class="buttonlet-container"><span class="buttonlet fa-stack fa-lg buttonlet-enabled" title="Look it up on Fallen London Wiki"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-inverse fa-stack-1x fa-search"></span><span class="u-visually-hidden"></span></span></button>
                <button class="buttonlet-container" type="button"><span class="buttonlet fa-stack fa-lg buttonlet-enabled  buttonlet-edit"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-inverse fa-stack-1x fa-pencil"></span><span class="u-visually-hidden">edit</span></span></button>
            </div>
            <h1 class="media__heading heading heading--2 storylet-root__heading">Assemble a Skeleton</h1>
            <p class="storylet-root__description-container">
            <p>This is where you reassemble skeletons, for the edification of the public.</p>

            <p>You prepare a manifest for purchasers:</p>

            <p></p>
            <p>Non-Worrying</p>
            <p>Relatively Recent</p>
            <p>Free of Rubbery Influence</p>

            <p></p>
            <p>Armless and Legless</p>
            <p>Finless and Tentacle-Free</p>
            <p></p>

            <p>
                <em><strong>Buyers in the Bone Market are currently most interested in amphibians, which require a head, four legs, and no tail. Buyers with a predilection for Amalgamous skeletons will pay out more than usual.</strong></em>
            </p></p>
        </div>
    </div>
    <div class="media" id="bone-market-recipe-container" style="outline: none;">
        <div class="storylet__body">
            <div class="storylet__title-and-description">
                <div id="bone-market-recipe-helper" style="display: flex; justify-content: space-between;">
                    <div style="display: inline-block;">
                        <select id="recipe-select"><option value=""></option><option value="Amalgamy Bird 1 Exhaustion">Amalgamy Bird 1 Exhaustion</option><option value="Amalgamy Bomb">Amalgamy Bomb</option><option value="Amalgamy Reptile 1 Exhaustion">Amalgamy Reptile 1 Exhaustion</option><option value="Amalgamy Primate 1 Exhaustion">Amalgamy Primate 1 Exhaustion</option><option value="Amalgamy Amphibian 1 Exhaustion">Amalgamy Amphibian 1 Exhaustion</option><option value="Menacing Bird 1 Exhaustion">Menacing Bird 1 Exhaustion</option><option value="Menacing Fish 1 Exhaustion">Menacing Fish 1 Exhaustion</option><option value="Antique Amphibian 1 Exhaustion">Antique Amphibian 1 Exhaustion</option><option value="Antique Bird 1 Exhaustion">Antique Bird 1 Exhaustion</option><option value="Antique Primate 1 Exhaustion">Antique Primate 1 Exhaustion</option></select>
                        <ul id="requirements-list">
                            <li>Human Ribcage: 1 needed, currently have 9</li>
                            <li style="font-weight: bold;">Sabre-toothed Skull: 1 needed, currently have 0</li>
                            <li>Femur of a Jurassic Beast: 2 needed, currently have 47</li>
                            <li style="font-weight: bold;">Fossilised Forelimb: 2 needed, currently have 0</li>
                        </ul>
                    </div>
                    <div id="bone-market-recipe-diagram" class="diagram-col">
                        <div class="diagram-pill diagram-row highlight-step">
                            <div class="diagram-rect">Build on the Human Ribcage</div>
                        </div>
                        <div class="diagram-line-h"></div>
                        <div class="diagram-pill diagram-row">
                            <div class="diagram-rect">Affix a Sabre-toothed Skull to your (Skeleton Type)</div>
                        </div>
                        <div class="diagram-line-h"></div>
                        <div class="diagram-pill diagram-row">
                            <div class="diagram-rect">Apply a Jurassic Thigh Bone to your (Skeleton Type)</div>
                        </div>
                        <div class="diagram-line-h"></div>
                        <div class="diagram-pill diagram-row">
                            <div class="diagram-rect">Apply a Jurassic Thigh Bone to your (Skeleton Type)</div>
                        </div>
                        <div class="diagram-line-h"></div>
                        <div class="diagram-pill diagram-row">
                            <div class="diagram-rect">Apply a Fossilised Forelimb to your (Skeleton Type)</div>
                        </div>
                        <div class="diagram-line-h"></div>
                        <div class="diagram-pill diagram-row">
                            <div class="diagram-rect">Apply a Fossilised Forelimb to your (Skeleton Type)</div>
                        </div>
                        <div class="diagram-line-h"></div>
                        <div class="diagram-pill diagram-row">
                            <div class="diagram-rect">Decide your (Skeleton Type) needs no tail</div>
                        </div>
                        <div class="diagram-line-h"></div>
                        <div class="diagram-pill diagram-row">
                            <div class="diagram-rect">Declare your (Skeleton Type) a completed Humanoid</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div>
        <div class="buttons buttons--left buttons--storylet-exit-options mimic-perhaps-not">
            <button class="button button--primary" type="button"><span><i class="fa fa-arrow-left"></i> Perhaps not</span></button>
        </div>
    </div>
    <div class="media branch media--branch" data-branch-id="242491">
        <div class="media__left branch__left">
            <div class="small-card storylet__card" role="button" tabindex="-1">
                <img alt="Build on the Human Ribcage" aria-label="Build on the Human Ribcage" class="cursor-default media__object small-card__image" src="//images.fallenlondon.com/icons/skeleton.png">
            </div>
        </div>
        <div class="media__body branch__body">
            <div>
                <div class="branch__plan-buttonlet">
                    <button aria-label="Mark this choice as a plan" class="buttonlet-container" type="button"><span class="buttonlet fa-stack fa-lg buttonlet-enabled  buttonlet-plan" title="Mark this choice as a plan"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-inverse fa-stack-1x fa-bookmark buttonlet--plan"></span><span class="u-visually-hidden">plan</span></span></button>
                </div>
                <div class="branch__plan-buttonlet">
                    <button type="button" class="buttonlet-container"><span class="buttonlet fa-stack fa-lg buttonlet-enabled" title="Look it up on Fallen London Wiki"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-inverse fa-stack-1x fa-search"></span><span class="u-visually-hidden"></span></span></button>
                </div>
                <h2 class="media__heading heading heading--3 branch__title">Build on the Human Ribcage</h2>
                <p>
                <p>You will be dealing with refreshingly familiar parts. One skull, four limbs, no tails.</p>
                <p>
                    <span class="descriptive">The Human Ribcage begins a skeleton with no Menace, Antiquity, or Amalgamy. The resulting skeleton can only be declared a human, ape, or chimera.</span>
                </p></p>
            </div>
            <div class="buttons storylet__buttons">
                <button class="js-tt button button--primary button--margin button--go" type="button"><span>Go</span></button>
                <input type="image" class="fave_toggle_button" title="Playing Favourites: toggle favourite" data-active="false" data-toggle-id="242491" src="chrome-extension://jkaoljkdjoecocmlnncdljoeeijlcjao/img/button_empty.png">
                <div class="icon quality-requirement">
                    <div aria-label="You unlocked this with a Human Ribcage (you have 9 in all)" tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                        <img alt="You unlocked this with a Human Ribcage (you have 9 in all)" aria-label="You unlocked this with a Human Ribcage (you have 9 in all)" class="cursor-magnifier" src="//images.fallenlondon.com/icons/bone3small.png">
                    </div>
                </div>
                <div class="icon icon--circular quality-requirement">
                    <div aria-label="You unlocked this by not having any Skeleton in Progress" tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                        <img alt="You unlocked this by not having any Skeleton in Progress" aria-label="You unlocked this by not having any Skeleton in Progress" class="cursor-magnifier" src="//images.fallenlondon.com/icons/bone3small.png">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="media branch media--branch media--locked" data-branch-id="242469">
        <div class="media__left branch__left">
            <div class="small-card storylet__card" role="button" tabindex="-1">
                <img alt="Make something of your Thorned Ribcage" aria-label="Make something of your Thorned Ribcage" class="cursor-default media__object small-card__image" src="//images.fallenlondon.com/icons/skeleton.png">
            </div>
        </div>
        <div class="media__body branch__body">
            <div>
                <div class="branch__plan-buttonlet">
                    <button aria-label="Mark this choice as a plan" class="buttonlet-container" type="button"><span class="buttonlet fa-stack fa-lg buttonlet-enabled  buttonlet-plan" title="Mark this choice as a plan"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-inverse fa-stack-1x fa-bookmark buttonlet--plan"></span><span class="u-visually-hidden">plan</span></span></button>
                </div>
                <div class="branch__plan-buttonlet">
                    <button type="button" class="buttonlet-container"><span class="buttonlet fa-stack fa-lg buttonlet-enabled" title="Look it up on Fallen London Wiki"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-inverse fa-stack-1x fa-search"></span><span class="u-visually-hidden"></span></span></button>
                </div>
                <h2 class="media__heading heading heading--3 branch__title">Make something of your Thorned Ribcage</h2>
                <p>
                <p>It will need a skull, four limbs, and a tail. Do not snag yourself on the thorns.</p>
                <p>
                    <span class="descriptive">The Thorned Ribcage begins a skeleton with one point each of Menace and Amalgamy.</span>
                </p></p>
            </div>
            <div class="buttons storylet__buttons">
                <button class="js-tt button button--primary button--margin button--go" disabled="" type="button"><span>Go</span></button>
                <input type="image" class="fave_toggle_button" title="Playing Favourites: toggle favourite" data-active="true" data-toggle-id="242469" src="chrome-extension://jkaoljkdjoecocmlnncdljoeeijlcjao/img/button_empty.png">
                <div class="icon icon--circular icon--locked quality-requirement">
                    <div aria-label="It is locked for your own good." tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                        <img alt="It is locked for your own good." aria-label="It is locked for your own good." class="cursor-magnifier" src="//images.fallenlondon.com/icons/mercysmall.png">
                    </div>
                </div>
                <div class="icon icon--circular quality-requirement">
                    <div aria-label="You need a Thorned Ribcage" tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                        <img alt="You need a Thorned Ribcage" aria-label="You need a Thorned Ribcage" class="cursor-magnifier" src="//images.fallenlondon.com/icons/bone19small.png">
                    </div>
                </div>
                <div class="icon icon--circular quality-requirement">
                    <div aria-label="You unlocked this by not having any Skeleton in Progress" tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                        <img alt="You unlocked this by not having any Skeleton in Progress" aria-label="You unlocked this by not having any Skeleton in Progress" class="cursor-magnifier" src="//images.fallenlondon.com/icons/bone3small.png">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="media branch media--branch media--locked" data-branch-id="255215">
        <div class="media__left branch__left">
            <div class="small-card storylet__card" role="button" tabindex="-1">
                <img alt="Build on a Segmented Ribcage" aria-label="Build on a Segmented Ribcage" class="cursor-default media__object small-card__image" src="//images.fallenlondon.com/icons/skeleton.png">
            </div>
        </div>
        <div class="media__body branch__body">
            <div>
                <div class="branch__plan-buttonlet">
                    <button aria-label="Mark this choice as a plan" class="buttonlet-container" type="button"><span class="buttonlet fa-stack fa-lg buttonlet-enabled  buttonlet-plan" title="Mark this choice as a plan"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-inverse fa-stack-1x fa-bookmark buttonlet--plan"></span><span class="u-visually-hidden">plan</span></span></button>
                </div>
                <div class="branch__plan-buttonlet">
                    <button type="button" class="buttonlet-container"><span class="buttonlet fa-stack fa-lg buttonlet-enabled" title="Look it up on Fallen London Wiki"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-inverse fa-stack-1x fa-search"></span><span class="u-visually-hidden"></span></span></button>
                </div>
                <h2 class="media__heading heading heading--3 branch__title">Build on a Segmented Ribcage</h2>
                <p>
                <p>The ribcage is long, sinuous, and without a taper. It would fit neatly with another of its kind.</p>
                <p>
                    <span class="descriptive">The Segmented Ribcage begins a simple skeleton that requires only two limbs, a head, and a tail. If you begin with a Segmented Ribcage, you will be able to add more later to add more joints to your skeleton.</span>
                </p></p>
            </div>
            <div class="buttons storylet__buttons">
                <button class="js-tt button button--primary button--margin button--go" disabled="" type="button"><span>Go</span></button>
                <input type="image" class="fave_toggle_button" title="Playing Favourites: toggle favourite" data-active="true" data-toggle-id="255215" src="chrome-extension://jkaoljkdjoecocmlnncdljoeeijlcjao/img/button_empty.png">
                <div class="icon icon--circular icon--locked quality-requirement">
                    <div aria-label="It is locked for your own good." tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                        <img alt="It is locked for your own good." aria-label="It is locked for your own good." class="cursor-magnifier" src="//images.fallenlondon.com/icons/mercysmall.png">
                    </div>
                </div>
                <div class="icon icon--circular quality-requirement">
                    <div aria-label="You unlocked this by not having any Skeleton in Progress" tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                        <img alt="You unlocked this by not having any Skeleton in Progress" aria-label="You unlocked this by not having any Skeleton in Progress" class="cursor-magnifier" src="//images.fallenlondon.com/icons/bone3small.png">
                    </div>
                </div>
                <div class="icon icon--locked quality-requirement">
                    <div aria-label="You need a Segmented Ribcage" tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                        <img alt="You need a Segmented Ribcage" aria-label="You need a Segmented Ribcage" class="cursor-magnifier" src="//images.fallenlondon.com/icons/bone8small.png">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="media branch media--branch media--locked" data-branch-id="242468">
        <div class="media__left branch__left">
            <div class="small-card storylet__card" role="button" tabindex="-1">
                <img alt="Reassemble your Headless Humanoid" aria-label="Reassemble your Headless Humanoid" class="cursor-default media__object small-card__image" src="//images.fallenlondon.com/icons/skeleton.png">
            </div>
        </div>
        <div class="media__body branch__body">
            <div>
                <div class="branch__plan-buttonlet">
                    <button aria-label="Mark this choice as a plan" class="buttonlet-container" type="button"><span class="buttonlet fa-stack fa-lg buttonlet-enabled  buttonlet-plan" title="Mark this choice as a plan"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-inverse fa-stack-1x fa-bookmark buttonlet--plan"></span><span class="u-visually-hidden">plan</span></span></button>
                </div>
                <div class="branch__plan-buttonlet">
                    <button type="button" class="buttonlet-container"><span class="buttonlet fa-stack fa-lg buttonlet-enabled" title="Look it up on Fallen London Wiki"><span class="fa fa-circle fa-stack-2x"></span><span class="fa fa-inverse fa-stack-1x fa-search"></span><span class="u-visually-hidden"></span></span></button>
                </div>
                <h2 class="media__heading heading heading--3 branch__title">Reassemble your Headless Humanoid</h2>
                <p>
                <p>All it will need is a skull. A skull (1).</p>
                <p>
                    <span class="descriptive">The Headless Skeleton offers no Menace, Antiquity, or Amalgamy. It can only be declared as a human or chimera.</span>
                </p></p>
            </div>
            <div class="buttons storylet__buttons">
                <button class="js-tt button button--primary button--margin button--go" disabled="" type="button"><span>Go</span></button>
                <input type="image" class="fave_toggle_button" title="Playing Favourites: toggle favourite" data-active="true" data-toggle-id="242468" src="chrome-extension://jkaoljkdjoecocmlnncdljoeeijlcjao/img/button_empty.png">
                <div class="icon icon--circular icon--locked quality-requirement">
                    <div aria-label="It is locked for your own good." tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                        <img alt="It is locked for your own good." aria-label="It is locked for your own good." class="cursor-magnifier" src="//images.fallenlondon.com/icons/mercysmall.png">
                    </div>
                </div>
                <div class="icon quality-requirement">
                    <div aria-label="You unlocked this with a Headless Skeleton (you have 3 in all)" tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                        <img alt="You unlocked this with a Headless Skeleton (you have 3 in all)" aria-label="You unlocked this with a Headless Skeleton (you have 3 in all)" class="cursor-magnifier" src="//images.fallenlondon.com/icons/bone3small.png">
                    </div>
                </div>
                <div class="icon icon--circular quality-requirement">
                    <div aria-label="You unlocked this by not having any Skeleton in Progress" tabindex="0" role="button" style="outline: 0px; outline-offset: 0px; cursor: default;">
                        <img alt="You unlocked this by not having any Skeleton in Progress" aria-label="You unlocked this by not having any Skeleton in Progress" class="cursor-magnifier" src="//images.fallenlondon.com/icons/bone3small.png">
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="buttons buttons--left buttons--storylet-exit-options">
        <button class="button button--primary" type="button"><span><i class="fa fa-arrow-left"></i> Perhaps not</span></button>
    </div>
</div>
`