
const achievements = {
    "beginner_collector": {
        name: "First Steps",
        desc: "Collect your first 10 materials",
        unlock: "",
        condition: () => state.materials >= 10,
        unlocked: false,
        icon: "⛏️",
        hidden: false
    },
    "thousand_materials": {
        name: "Material Hoarder",
        desc: "Collect 1000 materials",
        unlock: "",
        condition: () => state.materials >= 1000,
        unlocked: false,
        icon: "💰",
        hidden: false
    },
    "ten_thousand_materials": {
        name: "Wealthy Miner",
        desc: "Collect 10,000 materials",
        unlock: "",
        condition: () => state.materials >= 10000,
        unlocked: false,
        icon: "💎",
        hidden: false
    },
    "hundred_thousand_materials": {
        name: "Millionaire",
        desc: "Collect 100,000 materials",
        unlock: "",
        condition: () => state.materials >= 100000,
        unlocked: false,
        icon: "🏦",
        hidden: false
    },
    "first_crate": {
        name: "Crate Opener",
        desc: "Open your first crate",
        unlock: "",
        condition: () => {
            const total = typeof state.cratesOpened === 'number' ? state.cratesOpened : ((state.cratesOpened && (state.cratesOpened.basic || 0) + (state.cratesOpened.advanced || 0) + (state.cratesOpened.epic || 0)) || 0);
            return total >= 1;
        },
        unlocked: false,
        icon: "📦",
        hidden: false
    },
    "hundred_crates": {
        name: "Crate Enthusiast",
        desc: "Open 100 crates",
        unlock: "Research Tree",
        condition: () => {
            const total = typeof state.cratesOpened === 'number' ? state.cratesOpened : ((state.cratesOpened && (state.cratesOpened.basic || 0) + (state.cratesOpened.advanced || 0) + (state.cratesOpened.epic || 0)) || 0);
            return total >= 100;
        },
        unlocked: false,
        icon: "📦",
        hidden: false
    },
    "thousand_crates": {
        name: "Crate Master",
        desc: "Open 1000 crates",
        unlock: "",
        condition: () => {
            const total = typeof state.cratesOpened === 'number' ? state.cratesOpened : ((state.cratesOpened && (state.cratesOpened.basic || 0) + (state.cratesOpened.advanced || 0) + (state.cratesOpened.epic || 0)) || 0);
            return total >= 1000;
        },
        unlocked: false,
        icon: "💯",
        hidden: false
    },
    "first_pickaxe": {
        name: "Tool Collector",
        desc: "Acquire your first pickaxe",
        unlock: "",
        condition: () => Object.keys(state.items).some(key => key.includes("Pickaxe")),
        unlocked: false,
        icon: "🔨",
        hidden: false
    },
    "diamond_pickaxe": {
        name: "Diamond Miner",
        desc: "Get a Diamond Pickaxe",
        unlock: "",
        condition: () => (state.items["Diamond Pickaxe"] || 0) >= 1,
        unlocked: false,
        icon: "💎",
        hidden: false
    },
    "godly_pickaxe": {
        name: "Divine Tool",
        desc: "Get a Godly Pickaxe",
        unlock: "",
        condition: () => (state.items["Godly Pickaxe"] || 0) >= 1,
        unlocked: false,
        icon: "👑",
        hidden: false
    },
    "unholy_pickaxe": {
        name: "Unholy Power",
        desc: "Get an Unholy Pickaxe",
        unlock: "",
        condition: () => (state.items["Unholy Pickaxe"] || 0) >= 1,
        unlocked: false,
        icon: "😈",
        hidden: false
    },
    "secret_pickaxe": {
        name: "Ultimate Secret",
        desc: "Get the Secret Pickaxe",
        unlock: "",
        condition: () => (state.items["Secret Pickaxe"] || 0) >= 1,
        unlocked: false,
        icon: "🤫",
        hidden: true
    },
    "ten_wooden": {
        name: "Wood Enthusiast",
        desc: "Own 10 Wooden Pickaxes",
        unlock: "",
        condition: () => (state.items["Wooden Pickaxe"] || 0) >= 10,
        unlocked: false,
        icon: "🌳",
        hidden: false
    },
    "five_diamond": {
        name: "Diamond Collector",
        desc: "Own 5 Diamond Pickaxes",
        unlock: "",
        condition: () => (state.items["Diamond Pickaxe"] || 0) >= 5,
        unlocked: false,
        icon: "💎",
        hidden: false
    },
    "per_click_10": {
        name: "Efficient Miner",
        desc: "Reach 10 per click",
        unlock: "",
        condition: () => state.perClick >= 10,
        unlocked: false,
        icon: "⚡",
        hidden: false
    },
    "per_click_100": {
        name: "Super Miner",
        desc: "Reach 100 per click",
        unlock: "",
        condition: () => state.perClick >= 100,
        unlocked: false,
        icon: "🚀",
        hidden: false
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
        if (window.updateResearchVisibility) window.updateResearchVisibility();
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
        let descText;
        if (ach.hidden) {
            div.innerHTML = "?";
            descText = ach.unlock ? `Unlock: ${ach.unlock}` : "Hidden Achievement";
        } else {
            div.innerHTML = ach.icon;
            descText = `${ach.name}: ${ach.desc}`;
            if (ach.unlock) descText += `\nUnlock: ${ach.unlock}`;
        }
        div.setAttribute("data-desc", descText);
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