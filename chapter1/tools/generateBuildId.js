const fs = require('fs');
const path = require('path');

const FILES = [
    "../js/common.js",
    "../js/rebirth-one.js",
    "../js/research.js",
    "../js/achievements.js",
    "../js/animations.js",
    "../js/ui.js",
    "../js/debugger.js"
];

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) - hash) + str.charCodeAt(i);
        hash |= 0;
    }
    return Math.abs(hash).toString(16);
}

function normalize(text) {
    // Convert all line endings to \n and trim extra spaces
    return text.replace(/\r\n/g, "\n").trim();
}

let combined = "";

for (const file of FILES) {
    const text = fs.readFileSync(path.join(__dirname, file), "utf-8");
    const normalized = normalize(text);
    
    console.log(`--- Reading file: ${file} ---`);
    console.log(normalized.slice(0, 200) + (normalized.length > 200 ? "..." : "")); // first 200 chars
    console.log("Length after normalize:", normalized.length);

    combined += `/* ${file} */\n${normalized}\n`;
}

console.log("\n--- Combined content preview ---");
console.log(combined.slice(0, 500) + (combined.length > 500 ? "..." : ""));
console.log("Total combined length:", combined.length);

const buildId = "build-" + hashString(combined);
console.log("Game Build Verified:", buildId);
