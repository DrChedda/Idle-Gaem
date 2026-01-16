// research.js - placeholder research tree for Chapter 1
// Provides simple placeholder research nodes and UI wiring for #research-list

(function () {
  const fmt = (n) => (typeof formatNumber === 'function' ? formatNumber(n) : (typeof n === 'number' ? n.toString() : n));

  // Simple placeholder research tree. Add more fields as you expand functionality.
  const RESEARCH_TREE = {
    research_basic_mining: {
      id: 'research_basic_mining',
      name: 'Basic Mining',
      desc: 'Improve basic materials extraction (placeholder).',
      cost: 50,
      unlocked: false,
      prereqs: []
    },
    research_crate_efficiency: {
      id: 'research_crate_efficiency',
      name: 'Crate Efficiency',
      desc: 'Slightly increases crate rewards (placeholder).',
      cost: 200,
      unlocked: false,
      prereqs: ['research_basic_mining']
    },
    research_advanced_tools: {
      id: 'research_advanced_tools',
      name: 'Advanced Tools',
      desc: 'Unlocks access to advanced pickaxe upgrades (placeholder).',
      cost: 1000,
      unlocked: false,
      prereqs: ['research_crate_efficiency']
    }
  };

  function getUnlocked(id) {
    return !!(window.state?.research?.[id]);
  }

  function setUnlocked(id) {
    window.state = window.state || {};
    window.state.research = window.state.research || {};
    window.state.research[id] = true;
  }

  function canAfford(cost) {
    return (typeof window.state?.materials === 'number') && window.state.materials >= cost;
  }

  function purchaseResearch(id) {
    const node = RESEARCH_TREE[id];
    if (!node) return;
    if (getUnlocked(id)) return;
    // check prereqs
    for (const p of node.prereqs || []) {
      if (!getUnlocked(p)) return showFeedback('Prerequisite not unlocked');
    }
    if (!canAfford(node.cost)) return showFeedback('Not enough materials');

    window.state.materials -= node.cost;
    setUnlocked(id);
    showFeedback(`Research completed: ${node.name}`);
    saveGame();
    buildResearchUI();
    if (typeof updateAllUI === 'function') updateAllUI();
  }

  function buildResearchUI() {
    const container = document.getElementById('research-list');
    if (!container) return;
    container.innerHTML = '';

    const list = document.createElement('div');
    list.className = 'research-list-tree';

    Object.values(RESEARCH_TREE).forEach(node => {
      const box = document.createElement('div');
      box.className = 'research-node';
      const unlocked = getUnlocked(node.id);

      const title = document.createElement('div');
      title.className = 'research-title';
      title.textContent = node.name + (unlocked ? ' (Unlocked)' : '');
      box.appendChild(title);

      const desc = document.createElement('div');
      desc.className = 'research-desc';
      desc.textContent = node.desc;
      box.appendChild(desc);

      const footer = document.createElement('div');
      footer.className = 'research-footer';
      const cost = document.createElement('span');
      cost.className = 'research-cost';
      cost.textContent = `Cost: ${fmt(node.cost)}`;
      footer.appendChild(cost);

      const btn = document.createElement('button');
      btn.className = 'research-btn';
      btn.textContent = unlocked ? 'Done' : 'Research';
      btn.disabled = unlocked || !node.prereqs.every(p => getUnlocked(p)) || !canAfford(node.cost);
      btn.addEventListener('click', () => purchaseResearch(node.id));
      footer.appendChild(btn);

      box.appendChild(footer);
      list.appendChild(box);
    });

    container.appendChild(list);
  }

  function initResearch() {
    // Ensure state.research exists and copy saved statuses from state if present.
    if (!window.state) window.state = {};
    window.state.research = window.state.research || {};

    // If the save already had research entries, respect them
    for (const id in RESEARCH_TREE) {
      if (window.state.research[id]) RESEARCH_TREE[id].unlocked = true;
    }

    buildResearchUI();

    // Expose API for other modules
    window.RESEARCH = {
      tree: RESEARCH_TREE,
      purchase: purchaseResearch,
      buildUI: buildResearchUI
    };

    // make sure Research tab visibility updates when needed
    if (typeof updateResearchVisibility === 'function') updateResearchVisibility();
  }

  // Initialize after DOM is ready
  window.addEventListener('load', () => initResearch());

})();
