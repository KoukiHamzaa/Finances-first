const babel = require('@babel/core');
const fs = require('fs');

const html = fs.readFileSync('index.html', 'utf8');
const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (scriptMatch) {
  try {
    babel.transformSync(scriptMatch[1], { presets: ['@babel/preset-react'] });
    console.log("No syntax errors found by Babel.");
  } catch (e) {
    console.error("Babel error:", e.message);
  }
} else {
  console.log("No babel script found.");
}
