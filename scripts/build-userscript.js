const fs = require('fs');
const path = require('path');

const header = `// ==UserScript==
// @name         InstaWatch
// @namespace    https://github.com/KeremOzcn/instawatch
// @version      1.2.0
// @description  Track your Instagram followers over time — see who unfollowed you, who you unfollowed, and mutual changes between snapshots.
// @author       KeremOzcn
// @match        https://www.instagram.com/*
// @grant        none
// @run-at       document-idle
// @updateURL    https://raw.githubusercontent.com/KeremOzcn/instawatch/master/instawatch.user.js
// @downloadURL  https://raw.githubusercontent.com/KeremOzcn/instawatch/master/instawatch.user.js
// ==/UserScript==

`;

const distPath = path.resolve(__dirname, '../dist/dist.js');
const outPath = path.resolve(__dirname, '../instawatch.user.js');

const code = fs.readFileSync(distPath, 'utf8');
fs.writeFileSync(outPath, header + code, 'utf8');

console.log('✓ instawatch.user.js generated');
