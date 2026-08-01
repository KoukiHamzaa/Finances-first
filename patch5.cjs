const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const calcStatsStart = "      const calculateStats = (rows, fees) => {";
const calcStatsEnd = "return { totalSales, totalDeliveryFees, totalReturnFees, netRevenue, count: rows.length };\n      };";

const newCalcStats = `      const calculateStats = (rows, fees) => {
        let totalSales = 0;
        let totalRuleFeeDelivery = 0;
        let totalRuleFeeReturn = 0;
        let totalCarrierFee = 0;
        let hasCarrierFee = false;
        
        let prepaidCount = 0;
        let counts = { delivered: 0, returned: 0, in_progress: 0, cancelled: 0, exchange: 0 };
        
        const newUnknownGovs = [];

        rows.forEach(row => {
          if (counts[row.status] !== undefined) counts[row.status]++;
          
          if (row.carrier_fee != null) {
            hasCarrierFee = true;
            totalCarrierFee += row.carrier_fee;
          }
          
          if (row.status === 'delivered') {
             if (row.totalSales === 0) prepaidCount++;
             totalSales += row.totalSales;
             
             let rf = (row.carrier === 'INTIGO') ? 7 : (fees.delivery || 0);
             row.rule_fee = rf;
             totalRuleFeeDelivery += rf;
          } else if (row.status === 'returned') {
             let rf = fees.return || 0;
             if (row.carrier === 'INTIGO') {
                const govInfo = resolveGov(row.city);
                rf = govInfo.isGrandTunis ? 1 : 2;
                if (govInfo.unknown) newUnknownGovs.push(govInfo.raw);
             }
             row.rule_fee = rf;
             totalRuleFeeReturn += rf;
          } else {
             row.rule_fee = 0;
          }
          
          if (row.carrier_fee != null) {
             row.fee_delta = round3(row.carrier_fee - row.rule_fee);
          }
        });
        
        const netRule = totalSales - totalRuleFeeDelivery - totalRuleFeeReturn;
        const netCarrier = hasCarrierFee ? (totalSales - totalCarrierFee) : null;
        
        return { 
           totalSales: round3(totalSales), 
           totalRuleFeeDelivery: round3(totalRuleFeeDelivery), 
           totalRuleFeeReturn: round3(totalRuleFeeReturn), 
           netRule: round3(netRule), 
           netCarrier: hasCarrierFee ? round3(netCarrier) : null,
           hasCarrierFee,
           count: rows.length,
           counts,
           prepaidCount,
           newUnknownGovs: [...new Set(newUnknownGovs)]
        };
      };`;

const s = html.indexOf(calcStatsStart);
const e = html.indexOf(calcStatsEnd, s);
if (s > -1 && e > -1) {
  html = html.substring(0, s) + newCalcStats + html.substring(e + calcStatsEnd.length);
  fs.writeFileSync('index.html', html);
  console.log("Patch 5 successful");
} else {
  console.log("Could not find calculateStats block");
  process.exit(1);
}
