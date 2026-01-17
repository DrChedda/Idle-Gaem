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

let combined = "";

for (const file of FILES) {
  const text = fs.readFileSync(path.join(__dirname, file), "utf-8");
  combined += `/* ${file} */\n${text}\n`;
}

const buildId = "build-" + hashString(combined);
console.log("Game Build Verified:", buildId);
