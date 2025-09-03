// game.js
let state = {
  resources: 0,
  perClick: 1,
  upgradeCost: 50,
  autoCollect: false,
  autoCollectCost: 150,
  doubleGain: false,
  doubleGainCost: 400,
  tripleGain: false,
  tripleGainCost: 1200,
  boost: false,
  boostCost: 3000,
  luckyGain: false,
  luckyGainCost: 10000,
  measuredRps: 0
};
let settings = {
  theme: "dark",
  
};
// Base multipliers
const BOOST_MULTIPLIER = 3;
const DOUBLE_MULTIPLIER = 2;
const TRIPLE_MULTIPLIER = 3;
const LUCKY_CHANCE = 0.12;
const LUCKY_MULTIPLIER = 6;

// --- Collect resources ---
function collect() {
  let amount = state.perClick;

  if (state.doubleGain) amount *= DOUBLE_MULTIPLIER;
  if (state.tripleGain) amount *= TRIPLE_MULTIPLIER;
  if (state.boost) amount *= BOOST_MULTIPLIER;
  if (state.luckyGain && Math.random() < LUCKY_CHANCE) amount *= LUCKY_MULTIPLIER;

  state.resources += amount;
  return amount; // optionally return for UI feedback
}

// --- Upgrade purchases ---
function buyUpgrade() {
  const cost = state.tripleGain ? Math.max(1, Math.floor(state.upgradeCost * 0.7)) : state.upgradeCost;
  if (state.resources >= cost) {
    state.resources -= cost;
    state.perClick += 1;                    // incremental growth
    state.upgradeCost = Math.floor(state.upgradeCost * 1.55); // smoother scaling
    return true;
  }
  return false;
}

function buyAutoCollect() {
  if (!state.autoCollect && state.resources >= state.autoCollectCost) {
    state.resources -= state.autoCollectCost;
    state.autoCollect = true;
    state.autoCollectCost = Math.floor(state.autoCollectCost * 1.6); // future upgrades could be more expensive
    return true;
  }
  return false;
}

function buyDoubleGain() {
  if (!state.doubleGain && state.resources >= state.doubleGainCost) {
    state.resources -= state.doubleGainCost;
    state.doubleGain = true;
    return true;
  }
  return false;
}

function buyTripleGain() {
  if (!state.tripleGain && state.resources >= state.tripleGainCost) {
    state.resources -= state.tripleGainCost;
    state.tripleGain = true;
    state.perClick = Math.max(1, Math.floor(state.perClick * TRIPLE_MULTIPLIER));
    return true;
  }
  return false;
}

function buyBoost() {
  if (!state.boost && state.resources >= state.boostCost) {
    state.resources -= state.boostCost;
    state.boost = true;
    return true;
  }
  return false;
}

function buyLuckyGain() {
  if (!state.luckyGain && state.resources >= state.luckyGainCost) {
    state.resources -= state.luckyGainCost;
    state.luckyGain = true;
    return true;
  }
  return false;
}

window.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === ".") {
    state.beginningfinished = true;
    saveGame();
    window.location.href = "chapter1/index.html";
    return;
  }
});