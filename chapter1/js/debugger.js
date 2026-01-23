(function() {
    const DEBUG_CODE = "OTg2MjU=";
	const getAccessKey = (str) => atob(str);

    const codeGui = document.createElement("div");
    Object.assign(codeGui.style, {
        position: "fixed",
        bottom: "10px",
        right: "10px",
        zIndex: "10001",
        display: "none",
        gap: "5px",
        background: "#1a1a1a",
        padding: "5px",
        border: "1px solid #444",
        borderRadius: "4px",
        boxShadow: "0 0 10px rgba(0,0,0,0.5)",
        alignItems: "center"
    });

    codeGui.innerHTML = `
        <input type="password" id="debug-pass" placeholder="Code..." style="width: 70px; background: #000; color: #0f0; border: 1px solid #333; font-size: 12px; padding: 2px 5px; outline: none;">
        <button id="debug-submit" style="cursor: pointer; background: #333; color: #fff; border: 1px solid #555; padding: 2px 8px; font-size: 10px; border-radius: 3px;">OK</button>
    `;

    const debugMenu = document.createElement("div");
    Object.assign(debugMenu.style, {
        position: "fixed",
        bottom: "50px",
        right: "10px",
        background: "rgba(30,30,30,0.95)",
        color: "#ccc",
        font: "12px monospace",
        padding: "10px 15px",
        border: "1px solid #555",
        borderRadius: "5px",
        lineHeight: "1.6em",
        display: "none",
        zIndex: "10000",
        pointerEvents: "auto",
        boxShadow: "0 0 15px rgba(0,0,0,0.5)",
        maxHeight: "80vh",
        overflowY: "auto",
        overflowX: "hidden"
    });

    if (document.body) {
        document.body.appendChild(codeGui);
        document.body.appendChild(debugMenu);
    } else {
        window.addEventListener('DOMContentLoaded', () => {
            document.body.appendChild(codeGui);
            document.body.appendChild(debugMenu);
        });
    }

    let debugEnabled = false;

    window.addEventListener("keydown", e => {
        if (e.ctrlKey && e.key === "[") {
            e.preventDefault();
            
			if (debugEnabled) {
				debugEnabled = false;
				debugMenu.style.display = "none";
				codeGui.style.display = "none";
				if (typeof updateAllUI === 'function') showFeedback("Debug Menu Closed");
			} else {
				const isHidden = codeGui.style.display === "none";
				codeGui.style.display = isHidden ? "flex" : "none";
				if (isHidden) {
					setTimeout(() => document.getElementById("debug-pass").focus(), 10);
				}
			}
        }
    });

    function validateCode() {
        const input = document.getElementById("debug-pass");
		const accessKey = getAccessKey(DEBUG_CODE);

        if (input.value === accessKey) {
			codeGui.style.display = "none";
            input.value = "";
            toggleDebugger();
        } else {
            if (typeof showFeedback === 'function') showFeedback("Invalid Access Code");
            input.style.borderColor = "red";
            setTimeout(() => input.style.borderColor = "#333", 500);
        }
    }

    document.getElementById("debug-submit").addEventListener("click", validateCode);
    document.getElementById("debug-pass").addEventListener("keydown", e => {
        if (e.key === "Enter") validateCode();
    });

    window.setMaterials = function() {
        const val = prompt("Enter new materials:");
        if (val !== null && !isNaN(parseFloat(val))) {
            window.state.materials = parseFloat(val);
            if (typeof animateMaterialChange === 'function') animateMaterialChange(window.state.materials);
            if (typeof updateAllUI === 'function') updateAllUI();
        }
    };

    window.setMaterialsPerSecond = function() {
        const val = prompt("Enter new Materials Per Second:");
        if (val !== null && !isNaN(parseFloat(val))) {
            window.state.materialsPerSecond = parseFloat(val);
            if (typeof updateAllUI === 'function') updateAllUI();
        }
    };

    window.setRP = function() {
        const val = prompt("Enter new Research Points:");
        if (val !== null && !isNaN(parseFloat(val))) {
            window.state.researchPoints = parseFloat(val);
            if (typeof updateRPDisplay === 'function') updateRPDisplay();
        }
    };

    window.setPickaxeCount = function() {
        const name = prompt("Enter Pickaxe name exactly (e.g., Wooden Pickaxe):");
        if (!name) return;

        const targetPath = (window.state.items && window.state.items.pickaxes) ? window.state.items.pickaxes : window.state.items;

        if (!targetPath || (!(name in targetPath) && name !== "")) {
            alert(`Item "${name}" not found in inventory.`);
            return;
        }
        
        const val = prompt(`Enter new count for ${name} (Enter 0 to remove):`);
        if (val !== null && val.trim() !== "" && !isNaN(val)) {
            const count = parseInt(val);
            if (count <= 0) {
                delete targetPath[name];
                saveGame();
            } else {
                targetPath[name] = count;
            }
            if (typeof calculatePerClick === 'function') calculatePerClick();
            if (typeof updateAllUI === 'function') updateAllUI();
        }
    };

    window.setCrates = function(type) {
        const val = prompt(`Enter new ${type} crates opened:`);
        if (val !== null && !isNaN(parseInt(val))) {
            if (!window.state.cratesOpened) window.state.cratesOpened = {};
            window.state.cratesOpened[type] = parseInt(val);
            if (typeof updateAllUI === 'function') updateAllUI();
        }
    };

    window.setCrateCost = function(type) {
        const val = prompt(`Enter new cost for ${type} crates:`);
        if (val !== null && !isNaN(parseInt(val))) {
            if (type === 'basic') window.state.crateCost = parseInt(val);
            if (type === 'advanced') window.state.advancedCrateCost = parseInt(val);
            if (type === 'epic') window.state.epicCrateCost = parseInt(val);
            if (typeof updateAllUI === 'function') updateAllUI();
        }
    };

    function buildDebugMenu() {
        const buildId = window.CURRENT_BUILD_ID || "Unknown";
        debugMenu.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                <strong style="color:#fff;">DEBUG MENU - CHAPTER 1</strong>
                <span style="font-size: 10px; color: #ffffff; cursor: pointer; border: 1px solid #444; padding: 0 4px; borderRadius: 3px;" 
                      onclick="navigator.clipboard.writeText('${buildId}'); showFeedback('ID Copied!')">
                    ${buildId}
                </span>
            </div>
            <div style="border-top: 1px solid #555; margin: 5px 0;"></div>
            <strong>RESOURCES</strong><br>
            Materials: <span id="db-materials">0</span> <button onclick="setMaterials()" style="font-size:10px; padding:0 3px; cursor:pointer;">Set</button><br>
            Materials/s: <span id="db-mps">0</span> <button onclick="setMaterialsPerSecond()" style="font-size:10px; padding:0 3px; cursor:pointer;">Set</button><br>
            RP: <span id="db-rp">0</span> <button onclick="setRP()" style="font-size:10px; padding:0 3px; cursor:pointer;">Set</button><br>

            <div style="margin-top: 8px;"><strong>CRATE COSTS</strong></div>
            Basic: <span id="db-cost-basic">0</span> <button onclick="setCrateCost('basic')" style="font-size:9px; padding:0 3px; cursor:pointer;">$</button><br>
            Adv: <span id="db-cost-adv">0</span> <button onclick="setCrateCost('advanced')" style="font-size:9px; padding:0 3px; cursor:pointer;">$</button><br>
            Epic: <span id="db-cost-epic">0</span> <button onclick="setCrateCost('epic')" style="font-size:9px; padding:0 3px; cursor:pointer;">$</button><br>

            <div style="margin-top: 8px;"><strong>CRATES OPENED</strong></div>
            Basic: <span id="db-open-basic">0</span> <button onclick="setCrates('basic')" style="font-size:10px; padding:0 3px; cursor:pointer;">Set</button><br>
            Adv: <span id="db-open-adv">0</span> <button onclick="setCrates('advanced')" style="font-size:10px; padding:0 3px; cursor:pointer;">Set</button><br>
            Epic: <span id="db-open-epic">0</span> <button onclick="setCrates('epic')" style="font-size:10px; padding:0 3px; cursor:pointer;">Set</button><br>

            <div style="margin-top: 8px;"><strong>ITEMS</strong></div>
            Pickaxes: <span id="db-pickaxes" style="font-size:10px; color:#aaa;">None</span><br>
            <button onclick="setPickaxeCount()" style="font-size:10px; padding:0 3px; cursor:pointer; margin-top:2px;">Modify Item Count</button><br>

            <div style="margin-top: 8px;"><strong>STATS & MEMORY</strong></div>
            Measured RPS: <span id="db-rps">0.00</span><br>
            <span id="db-memory" style="font-size:10px; color:#888;">Memory Info...</span>
        `;
    }

    function updateDebugMenu() {
        if (!debugEnabled) return;

        const state = window.state || {};
        const getEl = (id) => document.getElementById(id);

        if (getEl('db-materials')) getEl('db-materials').textContent = Math.floor(state.materials || 0);
        if (getEl('db-mps')) getEl('db-mps').textContent = (state.materialsPerSecond || 0).toFixed(2);
        if (getEl('db-rp')) getEl('db-rp').textContent = state.researchPoints || 0;
        if (getEl('db-cost-basic')) getEl('db-cost-basic').textContent = state.crateCost || 0;
        if (getEl('db-cost-adv')) getEl('db-cost-adv').textContent = state.advancedCrateCost || 0;
        if (getEl('db-cost-epic')) getEl('db-cost-epic').textContent = state.epicCrateCost || 0;
        if (getEl('db-open-basic')) getEl('db-open-basic').textContent = state.cratesOpened?.basic || 0;
        if (getEl('db-open-adv')) getEl('db-open-adv').textContent = state.cratesOpened?.advanced || 0;
        if (getEl('db-open-epic')) getEl('db-open-epic').textContent = state.cratesOpened?.epic || 0;
        if (getEl('db-rps')) getEl('db-rps').textContent = (state.measuredRps || 0).toFixed(2);

        if (getEl('db-pickaxes')) {
            const p = (state.items && state.items.pickaxes) ? state.items.pickaxes : (state.items || {});
            const pickaxes = Object.entries(p)
                .filter(([key]) => key.toLowerCase().includes("pickaxe"))
                .map(([key, count]) => `${key}: ${count}`)
                .join(", ");
            getEl('db-pickaxes').textContent = pickaxes || "None";
        }

        if (getEl('db-memory') && performance && performance.memory) {
            const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            getEl('db-memory').textContent = `Used JS Heap: ${usedMB} MB`;
        }

        requestAnimationFrame(updateDebugMenu);
    }

    function toggleDebugger() {
        debugEnabled = !debugEnabled;
        debugMenu.style.display = debugEnabled ? "block" : "none";

        if (debugEnabled) {
            buildDebugMenu();
            if (!window.state) window.state = {};
            updateDebugMenu();
            if (typeof showFeedback === 'function') showFeedback("Debug Menu Opened");
        } else {
            if (typeof updateAllUI === 'function') updateAllUI();
        }
    }
})();