let rebirthOne = window.state || { 
    materials: 0, 
    perClick: 1, 
    measuredRps: 0, 
    crateCost: 10,
    items: {}
};
window.state = rebirthOne;

const pickaxes = {
    "Wooden Pickaxe": 0.2,
    "Iron Pickaxe": 0.5,
    "Diamond Pickaxe": 2,
    "Emerald Pickaxe": 7,
    "Godly Pickaxe": 15,
    "Unholy Pickaxe": 100
};

function round2(num) {
    return Math.round(num * 100) / 100;
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
    if (document.getElementById("tab-game").style.display !== "none") {
        materialDisplay.textContent = `Materials: ${round2(state.materials)} | Crate Cost: ${round2(state.crateCost)}`;
    }
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

    // Sort by per-click value (rarity) descending
    pickaxeEntries.sort((a, b) => (pickaxes[b[0]] || 0) - (pickaxes[a[0]] || 0));

    container.innerHTML = "";
    pickaxeEntries.forEach(([key, val]) => {
        const div = document.createElement("div");
        div.textContent = `${key} x${val} (+${pickaxes[key]} per click)`;
        container.appendChild(div);
    });
}

function showFeedback(msg, duration = 1500) {
    const feedback = document.getElementById("feedback");
    if (!feedback) return;
    feedback.textContent = msg;
    feedback.classList.add("show");
    setTimeout(() => feedback.classList.remove("show"), duration);
}

function openCrate() {
    if (state.materials < state.crateCost) {
        showFeedback("Not enough materials!");
        return;
    }

    state.materials -= state.crateCost;
    state.crateCost = 40;

    const roll = Math.random();
    let pickaxeType;
    if (roll < 0.3) pickaxeType = "Nothing";
    else if (roll < 0.6) pickaxeType = "Wooden Pickaxe";
    else if (roll < 0.9) pickaxeType = "Iron Pickaxe";
    else if (roll < 0.99) pickaxeType = "Diamond Pickaxe";
    else if (roll < 0.999) pickaxeType = "Emerald Pickaxe";
    else if (roll < 0.9999) pickaxeType = "Godly Pickaxe";
    else pickaxeType = "Unholy Pickaxe";

    if (pickaxeType !== "Nothing") {
        state.items[pickaxeType] = (state.items[pickaxeType] || 0) + 1;
        showFeedback(`You got a ${pickaxeType}! +${pickaxes[pickaxeType]} per click`);
    } else {
        showFeedback("You got nothing!");
    }

    calculatePerClick(); // recalc total perClick after crate

    state.materials = round2(state.materials);
    state.crateCost = round2(state.crateCost);

    updateMaterialDisplay();
    updatePickaxeTab();
    saveGame();
}

window.addEventListener("load", () => {
    loadGame();

    const collectBtn = document.getElementById("collect-btn");
    if (collectBtn) {
        collectBtn.addEventListener("click", () => {
            state.materials += state.perClick || 1;
            state.materials = round2(state.materials);
            updateMaterialDisplay();
        });
    }

    const crateBtn = document.getElementById("crate-btn");
    if (crateBtn) {
        crateBtn.addEventListener("click", openCrate);
    }

    calculatePerClick(); // ensure buffs apply on load
    updateMaterialDisplay();
    updatePickaxeTab();
});
