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
    // Remove BOM
    text = text.replace(/^\uFEFF/, "");
    // Normalize line endings
    text = text.replace(/\r\n/g, "\n");
    // Trim trailing empty lines
    text = text.replace(/\n+$/g, "");
    return text;
}

let combined = "";

for (const file of FILES) {
    const text = fs.readFileSync(path.join(__dirname, file), "utf-8");
    const normalized = normalize(text);
    const commentPath = file.replace(/^(\.\.\/)+/, ""); // Remove ../ prefixes
    console.log(`Adding file: ${commentPath}, length: ${normalized.length}`);
    combined += `/* ${commentPath} */\n${normalized}\n`;
}

console.log("Total combined length:", combined.length);
const buildId = "build-" + hashString(combined);
console.log("Game Build Verified:", buildId);
