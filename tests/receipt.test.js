import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const {
  detectTemplate,
  parsePaymentReceipt,
  calculateStats,
} = await import('../src/utils.js');

const SAMPLE_RECEIPT_ROWS = [
  ['ID', 'DESCRIPTION', 'QUANTITÉ', 'MONTANT'],
  ['1', 'Contre Remboursement', '', '1 500,000 DT'],
  ['2', 'Frais colis livrés', '10', '70,000 DT'],
  ['3', 'Frais colis retour', '2', '4,000 DT'],
  ['4', 'Total Frais de livraison', '', '74,000 DT'],
  ['5', 'Montant à payer', '', '1 426,000 DT'],
];

describe('PAYMENT_RECEIPT Parsing and Workflow', () => {
  test('detects template as PAYMENT_RECEIPT', () => {
    const detected = detectTemplate(SAMPLE_RECEIPT_ROWS);
    assert.equal(detected, 'PAYMENT_RECEIPT');
  });

  test('extracts summary numbers and auto-fees', () => {
    const res = parsePaymentReceipt(SAMPLE_RECEIPT_ROWS);
    assert.equal(res.isSummaryReceipt, true);
    assert.equal(res.summary.cod, 1500);
    assert.equal(res.summary.deliveredCount, 10);
    assert.equal(res.summary.deliveryFees, 70);
    assert.equal(res.summary.returnedCount, 2);
    assert.equal(res.summary.returnFees, 4);
    assert.equal(res.summary.amountToPay, 1426);
    assert.deepEqual(res.autoFees, { delivery: 7, return: 2 });
  });

  test('generates order rows matching summary counts and exact COD', () => {
    const res = parsePaymentReceipt(SAMPLE_RECEIPT_ROWS);
    assert.equal(res.rows.length, 12); // 10 delivered + 2 returned
    
    const deliveredRows = res.rows.filter(r => r.status === 'delivered');
    const returnedRows = res.rows.filter(r => r.status === 'returned');

    assert.equal(deliveredRows.length, 10);
    assert.equal(returnedRows.length, 2);

    const totalSales = deliveredRows.reduce((sum, r) => sum + r.totalSales, 0);
    assert.equal(Math.round(totalSales * 1000) / 1000, 1500);
    assert.ok(returnedRows.every(r => r.totalSales === 0));
    assert.ok(deliveredRows.every(r => r.carrier_fee === 7));
    assert.ok(returnedRows.every(r => r.carrier_fee === 2));
  });

  test('parses explicit itemized orders if present in receipt', () => {
    const explicitReceipt = [
      ['ID', 'DESCRIPTION', 'QUANTITÉ', 'MONTANT'],
      ['1', 'Contre Remboursement', '', '250,000 DT'],
      ['2', 'Frais colis livrés', '2', '14,000 DT'],
      ['CMD-01', 'Robe fleurie', '1', '150,000 DT'],
      ['CMD-02', 'Chaussures', '1', '100,000 DT'],
    ];

    const res = parsePaymentReceipt(explicitReceipt);
    assert.equal(res.isSummaryReceipt, true);
    assert.equal(res.summary.cod, 250);
    assert.equal(res.rows.length, 2);
    assert.equal(res.rows[0].barcode, 'CMD-01');
    assert.equal(res.rows[0].totalSales, 150);
    assert.equal(res.rows[0].status, 'delivered');
    assert.equal(res.rows[1].barcode, 'CMD-02');
    assert.equal(res.rows[1].totalSales, 100);
  });

  test('calculates stats separately for Cakado and Balkis without double counting', () => {
    const res = parsePaymentReceipt(SAMPLE_RECEIPT_ROWS);
    const allRows = res.rows;

    // Assign 6 delivered + 1 returned to Cakado
    const cakadoRows = [...allRows.slice(0, 6), allRows[10]];
    // Assign 4 delivered + 1 returned to Balkis
    const balkisRows = [...allRows.slice(6, 10), allRows[11]];

    const fees = { delivery: 7, return: 2 };
    const cakadoStats = calculateStats(cakadoRows, fees);
    const balkisStats = calculateStats(balkisRows, fees);

    // Cakado: 6 * 150 = 900 sales, 6 * 7 = 42 delivery fee, 1 * 2 = 2 return fee. Net = 856
    assert.equal(cakadoStats.totalSales, 900);
    assert.equal(cakadoStats.totalRuleFeeDelivery, 42);
    assert.equal(cakadoStats.totalRuleFeeReturn, 2);
    assert.equal(cakadoStats.netRule, 856);

    // Balkis: 4 * 150 = 600 sales, 4 * 7 = 28 delivery fee, 1 * 2 = 2 return fee. Net = 570
    assert.equal(balkisStats.totalSales, 600);
    assert.equal(balkisStats.totalRuleFeeDelivery, 28);
    assert.equal(balkisStats.totalRuleFeeReturn, 2);
    assert.equal(balkisStats.netRule, 570);

    // Total net revenue combined
    const totalNet = cakadoStats.netRule + balkisStats.netRule;
    assert.equal(totalNet, 856 + 570); // 1426, matches amountToPay!
  });

  test('toggling status updates stats dynamically', () => {
    const res = parsePaymentReceipt(SAMPLE_RECEIPT_ROWS);
    const fees = { delivery: 7, return: 2 };

    // Initially 2 orders in Cakado (both delivered, 150 each)
    let cakadoRows = [
      { ...res.rows[0] },
      { ...res.rows[1] },
    ];
    let stats = calculateStats(cakadoRows, fees);
    assert.equal(stats.totalSales, 300);
    assert.equal(stats.counts.delivered, 2);
    assert.equal(stats.counts.returned, 0);

    // Reclassify order 2 as returned
    cakadoRows = [
      cakadoRows[0],
      {
        ...cakadoRows[1],
        status: 'returned',
        totalSales: 0,
      },
    ];

    stats = calculateStats(cakadoRows, fees);
    assert.equal(stats.totalSales, 150);
    assert.equal(stats.counts.delivered, 1);
    assert.equal(stats.counts.returned, 1);
    assert.equal(stats.totalRuleFeeDelivery, 7);
    assert.equal(stats.totalRuleFeeReturn, 2);
    assert.equal(stats.netRule, 141);
  });
});
