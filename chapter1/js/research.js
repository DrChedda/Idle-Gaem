(function() {
	const fmt = n => typeof formatNumber === 'function' ? formatNumber(n) : typeof n === 'number' ? String(n) : n;

	function ensureState() {
		if (!window.state) window.state = {};
		if (!window.state.research) window.state.research = {};
		if (typeof window.state.researchPoints !== 'number') window.state.researchPoints = 0;
	}

	function findNode(keyOrId) {
		return RESEARCH_TREE[keyOrId] || Object.values(RESEARCH_TREE).find(n => n.id === keyOrId);
	}

	function updateResourcesAndButtons() {
		const rpEl = document.getElementById('research-points');
		if (rpEl) rpEl.textContent = `Research Points: ${fmt(window.state.researchPoints || 0)}`;
		const matEl = document.getElementById('materials-per-second-display');
		const hasMaterialsCounter = !!(window.state?.research?.['materials_counter']);
		if (matEl) {
			if (hasMaterialsCounter) {
				matEl.style.display = '';
				matEl.textContent = `Materials/s: ${fmt(window.state.measuredRps || 0)}`;
			} else {
				matEl.style.display = 'none';
			}
		}
		updateButtonStates();
	}

	function updateButtonStates() {
		const cr = window.state?.currentResearch;
		Object.values(RESEARCH_TREE).forEach(node => {
			const btn = document.querySelector(`.research-node[data-id="${node.id}"] .research-btn`);
			if (!btn) return;

			const unlocked = !!(window.state?.research?.[node.id]);
			const inProgress = cr && cr.id === node.id;

			if (unlocked) {
				btn.disabled = true;
				btn.textContent = 'Done';
			} else if (inProgress) {
				btn.disabled = true;
			} else {
				const prereqsMet = node.prereqs.every(p => !!(window.state?.research?.[p]));
				const affordable = canAffordNode(node);
				const researchBusy = !!(cr && cr.id);

				btn.disabled = !prereqsMet || !affordable || researchBusy;
			}
		});
	}

	const RESEARCH_TREE = {
		research_basic_mining: {
			id: 'construct_research_lab',
			name: 'Research Lab',
			desc: 'Fundamentals of research. Produces 1 Research Point per minute.',
			cost: 50000,
			prereqs: [],
			col: 3,
			row: 1
		},
		materials_counter: {
			id: 'materials_counter',
			name: 'Materials/s Counter',
			desc: 'Materials per second counter.',
			cost: 1,
			prereqs: ['construct_research_lab'],
			col: 2,
			row: 2
		},
		improved_mining: {
			id: 'improved_mining',
			name: 'Improved Mining',
			desc: 'Improved mining efficiency. (+1 Materials per click for every pickaxe)',
			cost: 5,
			prereqs: ['construct_research_lab'],
			col: 4,
			row: 2
		},
		automation_l1: {
			id: 'automation_l1',
			name: 'Automation',
			desc: 'Automate mining. 100 Materials/s',
			cost: 5,
			prereqs: ['construct_research_lab'],
			col: 3,
			row: 2
		},
		placeholder4: {
			id: 'placeholder4',
			name: 'placeholder4',
			desc: 'placeholder4',
			cost: 1e50,
			prereqs: ['materials_counter', 'automation_l1', 'improved_mining'],
			col: 3,
			row: 3
		},
		placeholder5: {
			id: 'placeholder5',
			name: 'placeholder5',
			desc: 'placeholder5',
			cost: 1e50,
			prereqs: ['placeholder4'],
			col: 2,
			row: 3
		},
    placeholder6: {
      id: 'placeholder6',
      name: 'placeholder6',
      desc: 'placeholder6',
      cost: 1e50,
      prereqs: ['placeholder4'],
      col: 4,
      row: 3
    },
    placeholder7: {
      id: 'placeholder7',
      name: 'placeholder7',
      desc: 'placeholder7 (TESTING SCROLL)',
      cost: 1e50,
      prereqs: ['placeholder4'],
      col: 3,
      row: 6
    }
  };

	function canAffordNode(node) {
		if (!node) return false;
		if (node.id === 'construct_research_lab') {
			const mats = Number(window.state?.rebirthOne?.materials ?? window.state?.materials ?? 0);
			return !Number.isNaN(mats) && mats >= node.cost;
		}
		return (window.state?.researchPoints || 0) >= node.cost;
	}

	function purchaseResearch(id) {
		const node = findNode(id);
		if (!node || !!(window.state?.research?.[node.id])) return;

		if (!canAffordNode(node)) return;

		if (node.id === 'construct_research_lab') {
			if (typeof window.state?.rebirthOne?.materials !== 'undefined') {
				window.state.rebirthOne.materials -= node.cost;
			} else {
				window.state.materials = (window.state.materials || 0) - node.cost;
			}
			startResearchProcess(node.id, 60000);
			updateResourcesAndButtons();
			return;
		}

		if (node.id === 'materials_counter') {
			if (typeof window.state?.rebirthOne?.researchPoints !== 'undefined') {
				window.state.rebirthOne.researchPoints -= node.cost;
			} else {
				window.state.researchPoints -= node.cost;
			}
			startResearchProcess(node.id, 60000);
			updateResourcesAndButtons();
			return;
		}

    if (node.id === 'improved_mining') {
      if (typeof window.state?.rebirthOne?.researchPoints !== 'undefined') {
        window.state.rebirthOne.researchPoints -= node.cost;
      } else {
        window.state.researchPoints -= node.cost;
      }
      startResearchProcess(node.id, 120000);
      updateResourcesAndButtons();
      return;
    }

    if (node.id === 'automation_l1') {
      if (typeof window.state?.rebirthOne?.researchPoints !== 'undefined') {
        window.state.rebirthOne.researchPoints -= node.cost;
      } else {
        window.state.researchPoints -= node.cost;
      }
      startResearchProcess(node.id, 120000);
      updateResourcesAndButtons();
      return;
    }

		ensureState();
		window.state.researchPoints -= node.cost;
		window.state.research[id] = true;
		updateResourcesAndButtons();
		if (typeof saveGame === 'function') saveGame();
		buildResearchUI();
	}

	function startResearchProcess(id, durationMs) {
		ensureState();
		if (window.state.currentResearch) return;
		window.state.currentResearch = {
			id: id,
			finish: Date.now() + (durationMs || 60000)
		};
		if (typeof saveGame === 'function') saveGame();
		buildResearchUI();
		ensureResearchProgressChecker();
	}

	function ensureResearchProgressChecker() {
		if (window._research_progress_interval) return;
		window._research_progress_interval = setInterval(() => {
			const cr = window.state?.currentResearch;
			if (cr) {
				const now = Date.now();
				if (now >= cr.finish) {
					window.state.research[cr.id] = true;
					delete window.state.currentResearch;
					buildResearchUI();
				} else {
					const btn = document.querySelector(`.research-node[data-id="${cr.id}"] .research-btn`);
					if (btn) {
						btn.textContent = `In progress (${Math.ceil((cr.finish - now) / 1000)}s)`;
					}
				}
			}
			updateResourcesAndButtons();
		}, 1000);
	}

	function startRPGenerator() {
		if (window._research_rp_interval) return;
		window._research_rp_interval = setInterval(() => {
			ensureState();
			if (!window.state.research['construct_research_lab']) return;
			window.state.researchPoints = (window.state.researchPoints || 0) + 1;
			updateResourcesAndButtons();
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

			const unlocked = !!(window.state?.research?.[node.id]);

			box.innerHTML = `
        <div class="research-title">${node.name}${unlocked ? ' (Unlocked)' : ''}</div>
        <div class="research-desc">${node.desc}</div>
        <div class="research-footer">
          <span class="research-cost">Cost: ${fmt(node.cost)} ${node.id === 'construct_research_lab' ? 'Materials' : 'RP'}</span>
          <button class="research-btn">${node.id === 'construct_research_lab' ? 'Build' : 'Research'}</button>
        </div>
      `;

			const btn = box.querySelector('.research-btn');
			btn.addEventListener('click', () => purchaseResearch(node.id));

			if (node.col) box.style.gridColumnStart = node.col;
			if (node.row) box.style.gridRowStart = node.row;

			grid.appendChild(box);
			elemMap[node.id] = box;
		});

		const wrapper = document.createElement('div');
		wrapper.className = 'research-grid-wrapper';
		const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
		svg.classList.add('research-svg');
		wrapper.appendChild(svg);
		wrapper.appendChild(grid);
		container.appendChild(wrapper);

		function drawConnectors() {
			while (svg.firstChild) svg.removeChild(svg.firstChild);
			svg.setAttribute('width', wrapper.clientWidth);
			svg.setAttribute('height', wrapper.clientHeight);
			const svgRect = wrapper.getBoundingClientRect();

			Object.values(RESEARCH_TREE).forEach(node => {
				const targetEl = elemMap[node.id];
				if (!targetEl) return;
				const tRect = targetEl.getBoundingClientRect();
				const tx = tRect.left + tRect.width / 2 - svgRect.left;
				const ty = tRect.top + tRect.height / 2 - svgRect.top;

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
					line.setAttribute('stroke', window.state.research[pid] ? '#6ec1ff' : '#777');
					line.setAttribute('stroke-width', '2');
					svg.appendChild(line);
				});
			});
		}

		new ResizeObserver(() => requestAnimationFrame(drawConnectors)).observe(wrapper);
		requestAnimationFrame(drawConnectors);
		updateResourcesAndButtons();
	}

	function initResearch() {
		ensureState();
		buildResearchUI();
		startRPGenerator();
		ensureResearchProgressChecker();
	}

	window.addEventListener('load', initResearch);
})();