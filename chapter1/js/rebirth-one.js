const DEFAULT_STATE = {
    materials: 0,
    researchPoints: 0,
    perClick: 1,
    measuredRps: 0,
    crateCost: 10,
    advancedCrateCost: 100,
    epicCrateCost: 1000,
    cratesOpened: { basic: 0, advanced: 0, epic: 0 },
    items: {},
    achievements: {}
};

const PICKAXES = {
    "Wooden Pickaxe": 0.2,
    "Iron Pickaxe": 0.5,
    "Diamond Pickaxe": 2,
    "Emerald Pickaxe": 4,
    "Obsidian Pickaxe": 10,
    "Titanium Pickaxe": 60,
    "Neutronium Pickaxe": 200
};

const CRATE_CONFIG = {
    basic: {
        costKey: 'crateCost',
        counterKey: 'basic',
        multiplier: 1.7,
        loot: [
            { threshold: 0.4, item: "Nothing" },
            { threshold: 0.6, item: "Wooden Pickaxe" },
            { threshold: 0.75, item: "Iron Pickaxe" },
            { threshold: 0.94, item: "Diamond Pickaxe" },
            { threshold: 0.999, item: "Emerald Pickaxe" },
            { threshold: 1.0, item: "Obsidian Pickaxe" }
        ]
    },
    advanced: {
        costKey: 'advancedCrateCost',
        counterKey: 'advanced',
        multiplier: 1.6,
        loot: [
            { threshold: 0.1, item: "Nothing" },
            { threshold: 0.25, item: "Wooden Pickaxe" },
            { threshold: 0.45, item: "Iron Pickaxe" },
            { threshold: 0.65, item: "Diamond Pickaxe" },
            { threshold: 0.99, item: "Emerald Pickaxe" },
            { threshold: 0.999, item: "Obsidian Pickaxe" },
            { threshold: 0.9999, item: "Titanium Pickaxe" }
        ]
    },
    epic: {
        costKey: 'epicCrateCost',
        counterKey: 'epic',
        multiplier: 1.5,
        loot: [
            { threshold: 0.05, item: "Nothing" },
            { threshold: 0.15, item: "Wooden Pickaxe" },
            { threshold: 0.3, item: "Iron Pickaxe" },
            { threshold: 0.5, item: "Diamond Pickaxe" },
            { threshold: 0.85, item: "Emerald Pickaxe" },
            { threshold: 0.99, item: "Obsidian Pickaxe" },
            { threshold: 0.999, item: "Titanium Pickaxe" },
            { threshold: 1.0, item: "Neutronium Pickaxe" }
        ]
    }
};

let rebirthOne = JSON.parse(JSON.stringify(DEFAULT_STATE));
const savedJson = localStorage.getItem("rebirthOne");

if (savedJson) {
    try {
        const parsed = JSON.parse(savedJson);
        if (parsed.items) rebirthOne.items = { ...rebirthOne.items, ...parsed.items };
        if (parsed.achievements) rebirthOne.achievements = { ...rebirthOne.achievements, ...parsed.achievements };
        Object.assign(rebirthOne, parsed);
    } catch (e) {
        console.warn("Save file corrupted, resetting.", e);
        localStorage.removeItem("rebirthOne");
    }
}

window.state = rebirthOne;
window.DEFAULT_STATE = DEFAULT_STATE;

const fmt = (n) => (typeof formatNumber === 'function' ? formatNumber(n) : n.toLocaleString());
const round2 = (num) => {
    if (typeof num !== 'number' || !isFinite(num)) return num;
    return parseFloat((Math.round((num + Number.EPSILON) * 10) / 10).toFixed(1));
};

let lastMaterials = window.state.materials;
let lastCrateClick = 0;

function animateMaterialChange(newVal) {
    const el = document.getElementById("material-display");
    const gameTab = document.getElementById("tab-game");
    if (!el || (gameTab && gameTab.style.display === "none")) {
        lastMaterials = newVal;
        return;
    }

    const start = lastMaterials;
    const duration = 80;
    let startTime = null;

    function step(ts) {
        if (!startTime) startTime = ts;
        const progress = Math.min((ts - startTime) / duration, 1);
        const interpolated = start + (newVal - start) * progress;
        const current = Math.round(interpolated * 10) / 10;
        el.textContent = `Materials: ${fmt(current)}`;
        if (progress < 1) requestAnimationFrame(step);
        else lastMaterials = newVal;
    }
    requestAnimationFrame(step);
}

function popElement(el) {
    if (!el) return;
    el.classList.add("pop");
    setTimeout(() => el.classList.remove("pop"), 120);
}

function ensureCrateCounters() {
    if (!window.state) return;
    if (typeof window.state.cratesOpened === 'number') {
        window.state.cratesOpened = { basic: window.state.cratesOpened, advanced: 0, epic: 0 };
    } else {
        window.state.cratesOpened = { basic: 0, advanced: 0, epic: 0, ...window.state.cratesOpened };
    }
}

function saveGame() {
    try {
        if (typeof window.saveGame === 'function' && window.saveGame !== saveGame) {
            return window.saveGame();
        }
    } catch (e) {
    }

    try {
        localStorage.setItem("rebirthOne", JSON.stringify(window.state));
    } catch (e) {
        console.warn('Failed to save rebirthOne to localStorage', e);
    }
}

function calculatePerClick() {
    let base = 1;
    for (const [key, amount] of Object.entries(window.state.items)) {
        if (PICKAXES[key]) base += PICKAXES[key] * amount;
    }
    window.state.perClick = round2(base);
}

function handleCrateOpen(type) {
    const config = CRATE_CONFIG[type];
    if (!config) return;

    const cost = window.state[config.costKey];
    if (window.state.materials < cost) return showFeedback("Not enough materials!");

    window.state.materials -= cost;

    const roll = Math.random();
    const result = config.loot.find(entry => roll < entry.threshold);
    const pickaxeType = result ? result.item : "Nothing";

    if (pickaxeType !== "Nothing") {
        window.state.items[pickaxeType] = (window.state.items[pickaxeType] || 0) + 1;
        showFeedback(`You got a ${pickaxeType}! +${fmt(PICKAXES[pickaxeType])} per click`);
    } else {
        showFeedback("You got nothing!");
    }

    calculatePerClick();

    window.state.cratesOpened[config.counterKey] += 1;
    if (window.state.cratesOpened[config.counterKey] % 10 === 0) {
        window.state[config.costKey] = round2(window.state[config.costKey] * config.multiplier);
    }

    window.state.materials = round2(window.state.materials);
    
    animateMaterialChange(window.state.materials);
    
    updateAllUI();
    saveGame();
}

function updateAllUI() {
    updateCrateButtons();
    updatePickaxeTab();
    updateResearchVisibility();
    
    const el = document.getElementById("material-display");
    if (el && Math.abs(lastMaterials - window.state.materials) < 0.1) {
        el.textContent = `Materials: ${fmt(window.state.materials)}`;
    }
}

function updateCrateButtons() {
    const btnMap = { basic: "crate-btn", advanced: "advanced-crate-btn", epic: "epic-crate-btn" };
    Object.keys(CRATE_CONFIG).forEach(type => {
        const btn = document.getElementById(btnMap[type]);
        if (btn) {
            const label = type.charAt(0).toUpperCase() + type.slice(1);
            const cost = window.state[CRATE_CONFIG[type].costKey];
            btn.textContent = `Open ${label} Crate (${fmt(cost)})`;
        }
    });
}

function updateResearchVisibility() {
    if (!window.state) {
        total = 0;
    } else if (typeof window.state.cratesOpened === 'number') {
        total = window.state.cratesOpened;
    } else if (window.state.cratesOpened) {
        total = (window.state.cratesOpened.basic || 0) + (window.state.cratesOpened.advanced || 0) + (window.state.cratesOpened.epic || 0);
    }

    const hasAchievement = !!(window.state?.achievements?.['hundred_crates']);
    const unlocked = hasAchievement || total >= 200;

    const btn = document.querySelector('.top-menu button[data-tab="research"]');
    const displayStyle = unlocked ? '' : 'none';
    if (btn) btn.style.display = displayStyle;
}
window.updateResearchVisibility = updateResearchVisibility;

function updatePickaxeTab() {
    const container = document.getElementById("pickaxe-list");
    if (!container) return;

    const pickaxeEntries = Object.entries(window.state.items).filter(([key]) => key.includes("Pickaxe"));

    if (pickaxeEntries.length === 0) {
        container.textContent = "No pickaxes yet.";
        return;
    }
    pickaxeEntries.sort((a, b) => (PICKAXES[b[0]] || 0) - (PICKAXES[a[0]] || 0));
    container.innerHTML = pickaxeEntries.map(([key, val]) => 
        `<div>${key} x${val} (+${fmt(PICKAXES[key])} per click)</div>`
    ).join('');
}

function showFeedback(msg, duration = 1500) {
    const container = document.getElementById("feedback");
    if (!container) return;

    if (!window._fbQueue) { window._fbQueue = []; window._fbActive = 0; window._fbMax = 4; }

    const existing = window._fbQueue.find(item => item.text === msg);
    if (existing) {
        existing.count++;
    } else {
        window._fbQueue.push({ text: msg, count: 1, duration: duration });
    }
    processFeedbackQueue(container);
}

function processFeedbackQueue(container) {
    if (window._fbActive >= window._fbMax || window._fbQueue.length === 0) return;
    const next = window._fbQueue.shift();
    if (!next) return;

    const el = document.createElement("div");
    el.className = "msg";
    el.textContent = next.text + (next.count > 1 ? ` x${next.count}` : '');
    container.appendChild(el);

    requestAnimationFrame(() => el.classList.add("show"));
    window._fbActive++;

    setTimeout(() => {
        el.classList.remove("show");
        setTimeout(() => {
            if (el.parentNode === container) container.removeChild(el);
            window._fbActive = Math.max(0, window._fbActive - 1);
            processFeedbackQueue(container);
        }, 220);
    }, next.duration);
    
    if (window._fbActive < window._fbMax) processFeedbackQueue(container);
}

window.addEventListener("load", () => {
    ensureCrateCounters();

    const confirmBar = document.getElementById("confirm-bar");
    const confirmYesChapter = document.getElementById("confirm-yes-chapter");
    const confirmYesFull = document.getElementById("confirm-yes-full");
    const confirmNo = document.getElementById("confirm-no");
    const resetBtn = document.getElementById("reset-btn");
    const saveBtn = document.getElementById("save-btn");

    if (confirmBar) confirmBar.style.display = "none";

    let lastCollectClick = 0;
    const collectBtn = document.getElementById("collect-btn");
    if (collectBtn) {
        collectBtn.addEventListener("click", () => {
            const now = Date.now();
            if (now - lastCollectClick < 20) return; 
            lastCollectClick = now;

            window.state.materials += window.state.perClick || 1;
            window.state.materials = round2(window.state.materials);
            
            animateMaterialChange(window.state.materials);
        });
    }

    const listeners = [
        { id: "crate-btn", type: "basic" },
        { id: "advanced-crate-btn", type: "advanced" },
        { id: "epic-crate-btn", type: "epic" }
    ];
    listeners.forEach(l => {
        const btn = document.getElementById(l.id);
        if (btn) btn.addEventListener("click", () => {
            const now = Date.now();
            if (now - lastCrateClick < 20) return; // ignore clicks faster than 20ms
            lastCrateClick = now;
            handleCrateOpen(l.type);
        });
    });

    if (saveBtn) {
        saveBtn.addEventListener("click", () => {
            saveGame();
            showFeedback("Game Saved!");
        });
    }

    function closeConfirmBar(button) {
        popElement(button);
        if(!confirmBar) return;
        confirmBar.classList.remove("show");
        setTimeout(() => (confirmBar.style.display = "none"), 300);
    }

    if (resetBtn) {
        resetBtn.addEventListener("click", () => {
            if(!confirmBar) return;
            confirmBar.style.display = "flex";
            if (confirmYesChapter) confirmYesChapter.textContent = "Chapter Reset";
            if (confirmYesFull) confirmYesFull.textContent = "Full Reset";
            if (confirmNo) confirmNo.textContent = "Cancel";
            setTimeout(() => confirmBar.classList.add("show"), 10);
        });
    }

    if (confirmYesChapter) {
        confirmYesChapter.addEventListener("click", () => {
            localStorage.removeItem("rebirthOne");
            window.state = JSON.parse(JSON.stringify(window.DEFAULT_STATE));
            
            animateMaterialChange(0);
            showFeedback("Chapter data reset!");
            closeConfirmBar(confirmYesChapter);
            updateAllUI();
            
            window.location.reload();
        });
    }

    if (confirmYesFull) {
        confirmYesFull.addEventListener("click", () => {
            localStorage.removeItem("rebirthOne");
            localStorage.removeItem("idleGameSave");
            
            animateMaterialChange(0);
            showFeedback("All data wiped!");
            closeConfirmBar(confirmYesFull);
            
            window.location.href = "../index.html";
        });
    }

    if (confirmNo) {
        confirmNo.addEventListener("click", () => {
            closeConfirmBar(confirmNo);
        });
    }

    calculatePerClick();
    updateAllUI();
    const el = document.getElementById("material-display");
    if(el) el.textContent = `Materials: ${fmt(window.state.materials)}`;
});