(function() {
    const debugMenu = document.createElement("div");
    Object.assign(debugMenu.style, {
        position: "fixed", 
        bottom: "10px", 
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
        overflowY: "auto"
    });

    if (document.body) {
        document.body.appendChild(debugMenu);
    } else {
        window.addEventListener('DOMContentLoaded', () => document.body.appendChild(debugMenu));
    }

    let debugEnabled = false;
    let savedMaterials = null;

    window.setMaterials = function() {
        const val = prompt("Enter new materials:");
        if (val !== null && !isNaN(parseFloat(val))) {
            window.state.materials = parseFloat(val);
            if (typeof animateMaterialChange === 'function') animateMaterialChange(window.state.materials);
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
        const name = prompt("Enter Pickaxe name exactly (e.g., Basic Pickaxe):");
        if (!name) return;
        const val = prompt(`Enter count for ${name}:`);
        if (val !== null && !isNaN(parseInt(val))) {
            if (!window.state.items) window.state.items = {};
            window.state.items[name] = parseInt(val);
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
        debugMenu.innerHTML = `
            <div style="margin-bottom: 5px;"><strong style="color:#fff;">DEBUG MENU - CHAPTER 1</strong></div>
            
            <div style="border-top: 1px solid #555; margin: 5px 0;"></div>
            <strong>RESOURCES</strong><br>
            Materials: <span id="db-materials">0</span> <button onclick="setMaterials()" style="font-size:10px; padding:0 3px; cursor:pointer;">Set</button><br>
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
        
        const elMat = document.getElementById('db-materials');
        const elRP = document.getElementById('db-rp');
        const elCB = document.getElementById('db-cost-basic');
        const elCA = document.getElementById('db-cost-adv');
        const elCE = document.getElementById('db-cost-epic');
        const elOB = document.getElementById('db-open-basic');
        const elOA = document.getElementById('db-open-adv');
        const elOE = document.getElementById('db-open-epic');
        const elPick = document.getElementById('db-pickaxes');
        const elRPS = document.getElementById('db-rps');
        const elMem = document.getElementById('db-memory');

        if(elMat) elMat.textContent = Math.floor(state.materials || 0);
        if(elRP) elRP.textContent = state.researchPoints || 0;
        
        if(elCB) elCB.textContent = state.crateCost || 0;
        if(elCA) elCA.textContent = state.advancedCrateCost || 0;
        if(elCE) elCE.textContent = state.epicCrateCost || 0;

        if(elOB) elOB.textContent = state.cratesOpened?.basic || 0;
        if(elOA) elOA.textContent = state.cratesOpened?.advanced || 0;
        if(elOE) elOE.textContent = state.cratesOpened?.epic || 0;

        if(elRPS) elRPS.textContent = (state.measuredRps || 0).toFixed(2);

        if(elPick) {
            const pickaxes = Object.entries(state.items || {})
                .filter(([key]) => key.toLowerCase().includes("pickaxe"))
                .map(([key, count]) => `${key}: ${count}`)
                .join(", ");
            elPick.textContent = pickaxes || "None";
        }

        if (elMem && performance && performance.memory) {
            const usedMB = (performance.memory.usedJSHeapSize / 1048576).toFixed(2);
            elMem.textContent = `Used JS Heap: ${usedMB} MB`;
        }

        requestAnimationFrame(updateDebugMenu);
    }

    function toggleDebugger() {
        debugEnabled = !debugEnabled;
        debugMenu.style.display = debugEnabled ? "block" : "none";

        if (debugEnabled) {
            buildDebugMenu();
            savedMaterials = (window.state && typeof window.state.materials === 'number') ? window.state.materials : null;
            if (!window.state) window.state = {};
            updateDebugMenu();
            if (typeof showFeedback === 'function') showFeedback("Debug Menu Opened");
        } else {
            if (savedMaterials !== null && window.state) {
                window.state.materials = savedMaterials;
                savedMaterials = null;
            }
            if (typeof updateAllUI === 'function') updateAllUI();
            if (typeof showFeedback === 'function') showFeedback("Debug Menu Closed");
        }
    }

    window.addEventListener("keydown", e => {
        if (e.ctrlKey && e.key === "[") {
            e.preventDefault();
            toggleDebugger();
        }
    });
})();