const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

html = html.replace('const [unknownGovs, setUnknownGovs] = useState([]);\n', '');
html = html.replace('setUnknownGovs([]);\n', '');

fs.writeFileSync('index.html', html);
