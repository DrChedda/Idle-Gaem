
const achievements = {
    "first_collect": {
        name: "First Steps",
        desc: "Collect your first material",
        condition: () => state.materials >= 1,
        unlocked: false,
        icon: "⛏️"
    },
    "hundred_materials": {
        name: "Material Hoarder",
        desc: "Collect 1000 materials",
        condition: () => state.materials >= 1000,
        unlocked: false,
        icon: "💰"
    },
    "thousand_materials": {
        name: "Wealthy Miner",
        desc: "Collect 10,000 materials",
        condition: () => state.materials >= 10000,
        unlocked: false,
        icon: "💎"
    },
    "ten_thousand_materials": {
        name: "Millionaire",
        desc: "Collect 100,000 materials",
        condition: () => state.materials >= 100000,
        unlocked: false,
        icon: "🏦"
    },
    "first_crate": {
        name: "Crate Opener",
        desc: "Open your first crate",
        condition: () => state.cratesOpened >= 1,
        unlocked: false,
        icon: "📦"
    },
    "ten_crates": {
        name: "Crate Enthusiast",
        desc: "Open 100 crates",
        condition: () => state.cratesOpened >= 100,
        unlocked: false,
        icon: "📦"
    },
    "hundred_crates": {
        name: "Crate Master",
        desc: "Open 1000 crates",
        condition: () => state.cratesOpened >= 1000,
        unlocked: false,
        icon: "💯"
    },
    "first_pickaxe": {
        name: "Tool Collector",
        desc: "Acquire your first pickaxe",
        condition: () => Object.keys(state.items).some(key => key.includes("Pickaxe")),
        unlocked: false,
        icon: "🔨"
    },
    "diamond_pickaxe": {
        name: "Diamond Miner",
        desc: "Get a Diamond Pickaxe",
        condition: () => (state.items["Diamond Pickaxe"] || 0) >= 1,
        unlocked: false,
        icon: "💎"
    },
    "godly_pickaxe": {
        name: "Divine Tool",
        desc: "Get a Godly Pickaxe",
        condition: () => (state.items["Godly Pickaxe"] || 0) >= 1,
        unlocked: false,
        icon: "👑"
    },
    "unholy_pickaxe": {
        name: "Unholy Power",
        desc: "Get an Unholy Pickaxe",
        condition: () => (state.items["Unholy Pickaxe"] || 0) >= 1,
        unlocked: false,
        icon: "😈"
    },
    "secret_pickaxe": {
        name: "Ultimate Secret",
        desc: "Get the Secret Pickaxe",
        condition: () => (state.items["Secret Pickaxe"] || 0) >= 1,
        unlocked: false,
        icon: "🤫"
    },
    "ten_wooden": {
        name: "Wood Enthusiast",
        desc: "Own 10 Wooden Pickaxes",
        condition: () => (state.items["Wooden Pickaxe"] || 0) >= 10,
        unlocked: false,
        icon: "🌳"
    },
    "five_diamond": {
        name: "Diamond Collector",
        desc: "Own 5 Diamond Pickaxes",
        condition: () => (state.items["Diamond Pickaxe"] || 0) >= 5,
        unlocked: false,
        icon: "💎"
    },
    "per_click_10": {
        name: "Efficient Miner",
        desc: "Reach 10 per click",
        condition: () => state.perClick >= 10,
        unlocked: false,
        icon: "⚡"
    },
    "per_click_100": {
        name: "Super Miner",
        desc: "Reach 100 per click",
        condition: () => state.perClick >= 100,
        unlocked: false,
        icon: "🚀"
    }
};

function checkAchievements() {
    let newUnlock = false;
    for (const key in achievements) {
        if (!achievements[key].unlocked && achievements[key].condition()) {
            achievements[key].unlocked = true;
            state.achievements[key] = true;
            newUnlock = true;
            showFeedback(`Achievement Unlocked: ${achievements[key].name}!`);
        }
    }
    if (newUnlock) {
        updateAchievementsDisplay();
        saveGame();
    }
}

function updateAchievementsDisplay() {
    const container = document.getElementById("achievements-list");
    if (!container) return;

    container.innerHTML = "";
    for (const key in achievements) {
        const ach = achievements[key];
        const div = document.createElement("div");
        div.className = `achievement-box ${ach.unlocked ? "unlocked" : "locked"}`;
        div.setAttribute("data-desc", `${ach.name}: ${ach.desc}`);
        div.innerHTML = ach.icon;
        container.appendChild(div);
    }
}

window.addEventListener("load", () => {

    if (!state.achievements) state.achievements = {};
    for (const key in achievements) {
        achievements[key].unlocked = state.achievements[key] || false;
    }

    updateAchievementsDisplay();


    setInterval(checkAchievements, 1000);
});