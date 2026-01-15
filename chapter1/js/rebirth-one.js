let rebirthOne = window.state || { 
    materials: 0, 
    perClick: 1, 
    measuredRps: 0, 
    crateCost: 10,
    advancedCrateCost: 100,
    epicCrateCost: 1000,
    cratesOpened: 0,
    items: {},
    achievements: {}
};
window.state = rebirthOne;
const state = window.state;

const pickaxes = {
    "Wooden Pickaxe": 0.2,
    "Iron Pickaxe": 0.5,
    "Diamond Pickaxe": 2,
    "Emerald Pickaxe": 7,
    "Godly Pickaxe": 15,
    "Unholy Pickaxe": 100,
    "Secret Pickaxe": 200
};

function round2(num) {
    return Math.round(num * 10) / 10;
}

function calculatePerClick() {
    let base = 1; // base per click
    for (const [key, amount] of Object.entries(state.items)) {
        if (pickaxes[key]) {
            base += pickaxes[key] * amount;
        }
    }
    state.perClick = round2(base);
}

function updateMaterialDisplay() {
    const materialDisplay = document.getElementById("material-display");
    if (!materialDisplay) return;
    materialDisplay.textContent = `Materials: ${formatNumber(state.materials)}`;
    updateCrateButtons();
}

function updateCrateButtons() {
    const basicBtn = document.getElementById("crate-btn");
    if (basicBtn) basicBtn.textContent = `Open Basic Crate (${formatNumber(state.crateCost)})`;

    const advancedBtn = document.getElementById("advanced-crate-btn");
    if (advancedBtn) advancedBtn.textContent = `Open Advanced Crate (${formatNumber(state.advancedCrateCost)})`;

    const epicBtn = document.getElementById("epic-crate-btn");
    if (epicBtn) epicBtn.textContent = `Open Epic Crate (${formatNumber(state.epicCrateCost)})`;
}

function updatePickaxeTab() {
    const container = document.getElementById("pickaxe-list");
    if (!container) return;
    const pickaxeEntries = Object.entries(state.items)
        .filter(([key]) => key.includes("Pickaxe"));

    if (pickaxeEntries.length === 0) {
        container.textContent = "No pickaxes yet.";
        return;
    }


    pickaxeEntries.sort((a, b) => (pickaxes[b[0]] || 0) - (pickaxes[a[0]] || 0));

    container.innerHTML = "";
    pickaxeEntries.forEach(([key, val]) => {
        const div = document.createElement("div");
        div.textContent = `${key} x${val} (+${formatNumber(pickaxes[key])} per click)`;
        container.appendChild(div);
    });
}

function showFeedback(msg, duration = 1500) {
    const container = document.getElementById("feedback");
    if (!container) return;

    if (!window._fbQueue) {
        window._fbQueue = [];
        window._fbActive = 0;
        window._fbMax = 4; // max visible messages at once
    }


    window._fbQueue.push({ text: msg, duration: duration });


    function tryShowNext() {
        if (window._fbActive >= window._fbMax) return;
        const next = window._fbQueue.shift();
        if (!next) return;

        const el = document.createElement("div");
        el.className = "msg";
        el.textContent = next.text;
        container.appendChild(el);


        requestAnimationFrame(() => el.classList.add("show"));
        window._fbActive++;


        setTimeout(() => {
            el.classList.remove("show");

            setTimeout(() => {
                if (el.parentElement === container) container.removeChild(el);
                window._fbActive = Math.max(0, window._fbActive - 1);

                if (window._fbQueue.length) tryShowNext();
            }, 220);
        }, next.duration);


        if (window._fbActive < window._fbMax && window._fbQueue.length) {
            tryShowNext();
        }
    }

    tryShowNext();
}

function openCrate() {
    if (state.materials < state.crateCost) {
        showFeedback("Not enough materials!");
        return;
    }

    state.materials -= state.crateCost;

    const roll = Math.random();
    let pickaxeType;
    if (roll < 0.4) pickaxeType = "Nothing";
    else if (roll < 0.6) pickaxeType = "Wooden Pickaxe";
    else if (roll < 0.75) pickaxeType = "Iron Pickaxe";
    else if (roll < 0.94) pickaxeType = "Diamond Pickaxe";
    else if (roll < 0.999) pickaxeType = "Emerald Pickaxe";
    else pickaxeType = "Godly Pickaxe";

    if (pickaxeType !== "Nothing") {
        state.items[pickaxeType] = (state.items[pickaxeType] || 0) + 1;
        showFeedback(`You got a ${pickaxeType}! +${formatNumber(pickaxes[pickaxeType])} per click`);
    } else {
        showFeedback("You got nothing!");
    }

    calculatePerClick(); // recalc total perClick after crate

    state.cratesOpened += 1;
    if (state.cratesOpened % 10 === 0) {
        state.crateCost *= 1.5;
        state.crateCost = round2(state.crateCost);
    }

    state.materials = round2(state.materials);

    updateMaterialDisplay();
    updatePickaxeTab();
    saveGame();
}

function openAdvancedCrate() {
    if (state.materials < state.advancedCrateCost) {
        showFeedback("Not enough materials!");
        return;
    }

    state.materials -= state.advancedCrateCost;

    const roll = Math.random();
    let pickaxeType;
    if (roll < 0.1) pickaxeType = "Nothing";
    else if (roll < 0.25) pickaxeType = "Wooden Pickaxe";
    else if (roll < 0.45) pickaxeType = "Iron Pickaxe";
    else if (roll < 0.65) pickaxeType = "Diamond Pickaxe";
    else if (roll < 0.99) pickaxeType = "Emerald Pickaxe";
    else if (roll < 0.999) pickaxeType = "Godly Pickaxe";
    else if (roll < 0.9999) pickaxeType = "Unholy Pickaxe";
    else pickaxeType = "Secret Pickaxe";

    if (pickaxeType !== "Nothing") {
        state.items[pickaxeType] = (state.items[pickaxeType] || 0) + 1;
        showFeedback(`You got a ${pickaxeType}! +${formatNumber(pickaxes[pickaxeType])} per click`);
    } else {
        showFeedback("You got nothing!");
    }

    calculatePerClick(); // recalc total perClick after crate

    state.cratesOpened += 1;
    if (state.cratesOpened % 10 === 0) {
        state.advancedCrateCost *= 1.7;
        state.advancedCrateCost = round2(state.advancedCrateCost);
    }

    state.materials = round2(state.materials);

    updateMaterialDisplay();
    updatePickaxeTab();
    saveGame();
}

function openEpicCrate() {
    if (state.materials < state.epicCrateCost) {
        showFeedback("Not enough materials!");
        return;
    }

    state.materials -= state.epicCrateCost;

    const roll = Math.random();
    let pickaxeType;
    if (roll < 0.05) pickaxeType = "Nothing";
    else if (roll < 0.15) pickaxeType = "Wooden Pickaxe";
    else if (roll < 0.3) pickaxeType = "Iron Pickaxe";
    else if (roll < 0.5) pickaxeType = "Diamond Pickaxe";
    else if (roll < 0.85) pickaxeType = "Emerald Pickaxe";
    else if (roll < 0.99) pickaxeType = "Godly Pickaxe";
    else if (roll < 0.999) pickaxeType = "Unholy Pickaxe";
    else pickaxeType = "Secret Pickaxe";

    if (pickaxeType !== "Nothing") {
        state.items[pickaxeType] = (state.items[pickaxeType] || 0) + 1;
        showFeedback(`You got a ${pickaxeType}! +${formatNumber(pickaxes[pickaxeType])} per click`);
    } else {
        showFeedback("You got nothing!");
    }

    calculatePerClick(); // recalc total perClick after crate

    state.cratesOpened += 1;
    if (state.cratesOpened % 10 === 0) {
        state.epicCrateCost *= 1.5;
        state.epicCrateCost = round2(state.epicCrateCost);
    }

    state.materials = round2(state.materials);

    updateMaterialDisplay();
    updatePickaxeTab();
    saveGame();
}

window.addEventListener("load", () => {
    loadGame();

    let lastCollectClick = 0;
    const collectBtn = document.getElementById("collect-btn");
    if (collectBtn) {
        collectBtn.addEventListener("click", () => {
            if (Date.now() - lastCollectClick < 20) return;
            lastCollectClick = Date.now();
            state.materials += state.perClick || 1;
            state.materials = round2(state.materials);
            updateMaterialDisplay();
        });
    }

    const crateBtn = document.getElementById("crate-btn");
    if (crateBtn) {
        crateBtn.addEventListener("click", openCrate);
    }

    const advancedCrateBtn = document.getElementById("advanced-crate-btn");
    if (advancedCrateBtn) {
        advancedCrateBtn.addEventListener("click", openAdvancedCrate);
    }

    const epicCrateBtn = document.getElementById("epic-crate-btn");
    if (epicCrateBtn) {
        epicCrateBtn.addEventListener("click", openEpicCrate);
    }

    calculatePerClick(); // ensure buffs apply on load
    updateMaterialDisplay();
    updatePickaxeTab();
    updateCrateButtons();
});
