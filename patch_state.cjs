const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const s_state = `      const [balkisFees, setBalkisFees] = useState({ delivery: 0, return: 0 });
      const [unknownGovs, setUnknownGovs] = useState([]);
      const [dismissedUnknownGovs, setDismissedUnknownGovs] = useState(false);
      const [duplicateNids, setDuplicateNids] = useState([]);`;
      
const r_state = `      const [balkisFees, setBalkisFees] = useState({ delivery: 0, return: 0 });
      const [dismissedUnknownGovs, setDismissedUnknownGovs] = useState(false);
      const [duplicateNids, setDuplicateNids] = useState([]);
      const [unrecognizedStatuses, setUnrecognizedStatuses] = useState([]);`;

html = html.replace(s_state, r_state);

const s_reset = `        setAutoFeesInfo(null);
        setUnknownGovs([]);
        setDismissedUnknownGovs(false);
        setDuplicateNids([]);`;
const r_reset = `        setAutoFeesInfo(null);
        setDismissedUnknownGovs(false);
        setDuplicateNids([]);
        setUnrecognizedStatuses([]);`;
html = html.replace(s_reset, r_reset);

fs.writeFileSync('index.html', html);
console.log("State modified");
