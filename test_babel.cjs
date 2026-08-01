const fs = require('fs');
const babel = require('@babel/core');
const html = fs.readFileSync('index.html', 'utf8');

const scriptMatch = html.match(/<script type="text\/babel">([\s\S]*?)<\/script>/);
if (!scriptMatch) {
  console.log("No babel script found!");
  process.exit(1);
}

try {
  babel.transformSync(scriptMatch[1], {
    presets: ['@babel/preset-react']
  });
  console.log("Babel parse successful");
} catch(e) {
  console.error(e);
  process.exit(1);
}
