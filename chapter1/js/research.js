(function () {
  const fmt = n => typeof formatNumber === 'function' ? formatNumber(n) : typeof n === 'number' ? String(n) : n;

  function ensureState() {
    if (!window.state) window.state = {};
    if (!window.state.research) window.state.research = {};
    if (typeof window.state.researchPoints !== 'number') window.state.researchPoints = 0;
  }

  function findNode(keyOrId) {
    return RESEARCH_TREE[keyOrId] || Object.values(RESEARCH_TREE).find(n => n.id === keyOrId);
  }

  function updateRPDisplay() {
    const el = document.getElementById('research-points');
    if (el) el.textContent = `Research Points: ${fmt(window.state.researchPoints || 0)}`;
  }

  function isVisible(el){
    if(!el) return false;
    try{ return !!(el.offsetParent || el.getClientRects && el.getClientRects().length); }catch(e){return false}
  }

const RESEARCH_TREE = {
    research_basic_mining: {
      id: 'construct_research_lab',
      name: 'Research Lab',
      desc: 'Fundamentals of research. Produces 1 Research Point per minute.',
      cost: 50000,
      prereqs: [],
      col: 3, row: 1
    },
    placeholder1: {
      id: 'placeholder1',
      name: 'placeholder1',
      desc: 'placeholder1',
      cost: 9999999999999999999999999999999999999999999999999999,
      prereqs: ['construct_research_lab'],
      col: 2, row: 2
    },
    placeholder2: {
      id: 'placeholder2',
      name: 'placeholder2',
      desc: 'placeholder2',
      cost: 9999999999999999999999999999999999999999999999999999,
      prereqs: ['construct_research_lab'],
      col: 4, row: 2
    },
    placeholder3: {
      id: 'placeholder3',
      name: 'placeholder3',
      desc: 'placeholder3',
      cost: 9999999999999999999999999999999999999999999999999999,
      prereqs: ['construct_research_lab'],
      col: 3, row: 2
    },
    placeholder4: {
      id: 'placeholder4',
      name: 'placeholder4',
      desc: 'placeholder4',
      cost: 9999999999999999999999999999999999999999999999999999,
      prereqs: ['placeholder1', 'placeholder3','placeholder2'],
      col: 3, row: 3
    },
    placeholder5: {
      id: 'placeholder5',
      name: 'placeholder5',
      desc: 'placeholder5',
      cost: 9999999999999999999999999999999999999999999999999999,
      prereqs: ['placeholder4'],
      col: 2, row: 3
    }
  };

  function getUnlocked(id) { return !!(window.state?.research?.[id]); }
  function setUnlocked(id) { ensureState(); window.state.research[id] = true; }

  function canAfford(cost) { return typeof window.state?.researchPoints === 'number' && window.state.researchPoints >= cost; }

  function canAffordNode(node) {
    if (!node) return false;
    if (node.id === 'construct_research_lab') {
      const mats = Number(window.state?.rebirthOne?.materials ?? window.state?.materials ?? 0);
      return !Number.isNaN(mats) && mats >= node.cost;
    }
    return canAfford(node.cost);
  }

  function notify(msg, duration) {
    if (typeof window.showFeedback === 'function') return window.showFeedback(msg, duration);
    if (typeof showFeedback === 'function') return showFeedback(msg, duration);
    try { console.log('FEEDBACK:', msg); } catch (e) {}
  }

  function purchaseResearch(id) {
    const node = findNode(id);
    if (!node || getUnlocked(node.id || id)) return;
    for (const p of node.prereqs || []) if (!getUnlocked(p)) return notify('Prerequisite not unlocked');
    if (!canAffordNode(node)) return node.id === 'construct_research_lab' ? notify('Not enough materials') : notify('Not enough research points');

  if (node.id === 'construct_research_lab') {
      // Deduct materials from either rebirthOne or global materials
      if (typeof window.state?.rebirthOne?.materials !== 'undefined') {
        window.state.rebirthOne.materials = Number(window.state.rebirthOne.materials || 0) - node.cost;
      } else if (typeof window.state?.materials !== 'undefined') {
        window.state.materials = Number(window.state.materials || 0) - node.cost;
      } else {
        window.state.rebirthOne = window.state.rebirthOne || {};
        window.state.rebirthOne.materials = -node.cost;
      }
      const matEl = document.getElementById('materials-count') || document.getElementById('research-points');
      const matVal = Number(window.state.rebirthOne?.materials ?? window.state.materials ?? 0);
      if (matEl) matEl.textContent = `Materials: ${fmt(matVal)}`;
      startResearchProcess(node.id, 60000);
      return;
    }

    ensureState();
    window.state.researchPoints -= node.cost;
    updateRPDisplay();
    setUnlocked(id);
    notify(`Research completed: ${node.name}`);
    if (typeof saveGame === 'function') saveGame();
    buildResearchUI();
    if (typeof updateAllUI === 'function') updateAllUI();
  }

  function startResearchProcess(id, durationMs) {
    ensureState();
    if (window.state.currentResearch) return notify('Another research is already in progress');
    window.state.currentResearch = { id: id, finish: Date.now() + (durationMs || 60000) };
    if (typeof saveGame === 'function') saveGame();
    notify(`Research started: ${findNode(id)?.name || id}`);
    buildResearchUI();
    ensureResearchProgressChecker();
  }

  function completeResearch(id) {
    setUnlocked(id);
    if (window.state?.currentResearch?.id === id) delete window.state.currentResearch;
    if (typeof saveGame === 'function') saveGame();
    notify(`Research completed: ${findNode(id)?.name || id}`);
    buildResearchUI();
    if (typeof updateAllUI === 'function') updateAllUI();
  }

  function ensureResearchProgressChecker() {
    if (window._research_progress_interval) return;
    window._research_progress_interval = setInterval(() => {
      const cr = window.state?.currentResearch;
      if (cr) {
        if (Date.now() >= cr.finish) completeResearch(cr.id);
        else { updateRPDisplay(); if (document.getElementById('research-list')) buildResearchUI(); }
      }
    }, 1000);
  }

  function startRPGenerator() {
    if (window._research_rp_interval) return;
    window._research_rp_interval = setInterval(() => {
      ensureState();
      // Only generate RP if Research Lab is unlocked
      if (!getUnlocked('construct_research_lab')) return;
      window.state.researchPoints = (window.state.researchPoints || 0) + 1;
      updateRPDisplay();
      if (document.getElementById('research-list')) buildResearchUI();
      if (typeof saveGame === 'function') saveGame();
    }, 60000);
  }

  function buildResearchUI() {
    const container = document.getElementById('research-list');
    if (!container) return;
    container.innerHTML = '';

    const grid = document.createElement('div');
    grid.className = 'research-grid';

    const elemMap = {};

    Object.values(RESEARCH_TREE).forEach(node => {
      const box = document.createElement('div');
      box.className = 'research-node';
      box.dataset.id = node.id;
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
      if (node.id === 'construct_research_lab') {
        cost.textContent = `Cost: ${fmt(node.cost)} materials`;
      } else {
        cost.textContent = `Cost: ${fmt(node.cost)} RP`;
      }
      footer.appendChild(cost);

      const btn = document.createElement('button');
      btn.className = 'research-btn';
      const cr = window.state?.currentResearch;
      const inProgress = cr && cr.id;
      if (unlocked) {
        btn.textContent = 'Done';
        btn.disabled = true;
      } else if (inProgress && inProgress === node.id) {
        const remainingMs = Math.max(0, (cr.finish || 0) - Date.now());
        const remainingSec = Math.ceil(remainingMs / 1000);
        btn.textContent = `In progress (${remainingSec}s)`;
        btn.disabled = true;
      } else {
        btn.textContent = node.id === 'construct_research_lab' ? 'Build' : 'Research';
        btn.disabled = !node.prereqs.every(p => getUnlocked(p)) || !canAffordNode(node) || (cr && cr.id && cr.id !== node.id);
      }
      btn.addEventListener('click', () => purchaseResearch(node.id));
      footer.appendChild(btn);

      box.appendChild(footer);

      if (node.col) box.style.gridColumnStart = node.col;
      if (node.row) box.style.gridRowStart = node.row;

      grid.appendChild(box);
      elemMap[node.id] = box;
    });
  const wrapper = document.createElement('div');
  wrapper.className = 'research-grid-wrapper';

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.classList.add('research-svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('preserveAspectRatio', 'none');

  wrapper.appendChild(svg);
  wrapper.appendChild(grid);
    container.appendChild(wrapper);

    function drawConnectors() {
      while (svg.firstChild) svg.removeChild(svg.firstChild);
      const w = Math.max(1, Math.round(wrapper.clientWidth));
      const h = Math.max(1, Math.round(wrapper.clientHeight));
      svg.setAttribute('width', w);
      svg.setAttribute('height', h);
      const svgRect = wrapper.getBoundingClientRect();
      Object.values(RESEARCH_TREE).forEach(node => {
        const targetEl = elemMap[node.id];
        if (!targetEl) return;
        const targetRect = targetEl.getBoundingClientRect();
  const tx = targetRect.left + targetRect.width / 2 - svgRect.left;
  const ty = targetRect.top + targetRect.height / 2 - svgRect.top;

        (node.prereqs || []).forEach(pid => {
          const pEl = elemMap[pid];
          if (!pEl) return;
          const pRect = pEl.getBoundingClientRect();
          const px = pRect.left + pRect.width / 2 - svgRect.left;
          const py = pRect.top + pRect.height / 2 - svgRect.top;

          const line = document.createElementNS(svg.namespaceURI, 'line');
          line.setAttribute('x1', px);
          line.setAttribute('y1', py);
          line.setAttribute('x2', tx);
          line.setAttribute('y2', ty);
          const prereqUnlocked = getUnlocked(pid);
          const targetUnlocked = getUnlocked(node.id);
          line.setAttribute('stroke', prereqUnlocked ? '#6ec1ff' : '#777');
          const strokeWidth = Math.max(2, Math.round(Math.min(w, h) / 150));
          line.setAttribute('stroke-width', String(strokeWidth));
          line.setAttribute('stroke-linecap', 'round');
          line.setAttribute('opacity', targetUnlocked ? '0.95' : (prereqUnlocked ? '0.8' : '0.6'));
          svg.appendChild(line);
        });
      });
    }

    if (window._research_resize_observer && typeof window._research_resize_observer.disconnect === 'function') {
      try { window._research_resize_observer.disconnect(); } catch (e) { /* ignore */ }
    }
    const ro = new (window.ResizeObserver || window.WebKitResizeObserver || function () { this.observe = function(){}; this.disconnect = function(){}; })((entries) => {
      setTimeout(drawConnectors, 30);
    });
    ro.observe(wrapper);
    window._research_resize_observer = ro;
    setTimeout(drawConnectors, 60);
    window.addEventListener('resize', drawConnectors);
    ensureResearchProgressChecker();
  }

  function initResearch() {
    if (!window.state) window.state = {};
    window.state.research = window.state.research || {};
    if (typeof window.state.researchPoints !== 'number') window.state.researchPoints = 0;

    for (const id in RESEARCH_TREE) {
      if (window.state.research[id]) RESEARCH_TREE[id].unlocked = true;
    }

    buildResearchUI();

    const rpEl = document.getElementById('research-points');
    function refreshRP() {
      if (rpEl) rpEl.textContent = `Research Points: ${fmt(window.state.researchPoints || 0)}`;
    }
    refreshRP();
    startRPGenerator();
    const gainBtn = document.getElementById('gain-rp-btn');
    if (gainBtn && gainBtn.parentNode) gainBtn.parentNode.removeChild(gainBtn);

    window.RESEARCH = {
      tree: RESEARCH_TREE,
      purchase: purchaseResearch,
      buildUI: buildResearchUI
    };

    let _lastResearchRefresh = 0;
    function tryRefreshUI(){
      const now = Date.now();
      if(now - _lastResearchRefresh < 250) return;
      _lastResearchRefresh = now;
      const rl = document.getElementById('research-list');
      if(rl && isVisible(rl)) buildResearchUI();
    }
  // Prefer attaching directly to the top nav research button if present
  const navBtn = document.querySelector('.top-menu button[data-tab="research"]');
  if (navBtn) navBtn.addEventListener('click', tryRefreshUI);
  else document.addEventListener('click', tryRefreshUI, true);
    document.addEventListener('visibilitychange', ()=>{ if(!document.hidden) tryRefreshUI(); });
    window.addEventListener('focus', tryRefreshUI);

    if (typeof updateResearchVisibility === 'function') updateResearchVisibility();
  }

  window.addEventListener('load', () => initResearch());

})();
