// Tests for text/CSV import decoding: accented French headers and statuses
// must survive the trip from a text file into XLSX so template detection and
// parsing behave exactly like their Excel counterparts.
//
// Run with: npm test

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

const { isBinarySpreadsheet, decodeTextBytes } = await import('../src/utils.js');

describe('isBinarySpreadsheet', () => {
  test('detects xlsx (ZIP) and xls (OLE2) signatures', () => {
    assert.equal(isBinarySpreadsheet(new Uint8Array([0x50, 0x4B, 0x03, 0x04])), true);
    assert.equal(isBinarySpreadsheet(new Uint8Array([0xD0, 0xCF, 0x11, 0xE0])), true);
  });

  test('rejects text content and short buffers', () => {
    assert.equal(isBinarySpreadsheet(new Uint8Array([49, 44, 50])), false);
    assert.equal(isBinarySpreadsheet(new Uint8Array([0x50])), false);
    assert.equal(isBinarySpreadsheet(null), false);
  });
});

describe('decodeTextBytes', () => {
  test('decodes UTF-8 accented French without mojibake', () => {
    const bytes = new TextEncoder().encode('ID,DESCRIPTION,QUANTITÉ,MONTANT\nFrais colis livrés');
    const text = decodeTextBytes(bytes);
    assert.ok(text.includes('QUANTITÉ'));
    assert.ok(text.includes('livrés'));
    assert.ok(!text.includes('\uFFFD'));
  });

  test('strips a UTF-8 BOM', () => {
    const body = new TextEncoder().encode('Contre Remboursement');
    const bytes = new Uint8Array([0xEF, 0xBB, 0xBF, ...body]);
    assert.equal(decodeTextBytes(bytes).charCodeAt(0) !== 0xFEFF, true);
    assert.equal(decodeTextBytes(bytes).startsWith('Contre Remboursement'), true);
  });

  test('falls back to Windows-1252 for legacy CSVs', () => {
    const bytes = Uint8Array.from('Frais colis livrés', (c) => c.charCodeAt(0) < 128 ? c.charCodeAt(0) : 0xE9);
    const text = decodeTextBytes(bytes);
    assert.ok(text.includes('é'));
    assert.ok(!text.includes('\uFFFD'));
  });
});

describe('CSV receipt matches Excel parsing', () => {
  test('a UTF-8 CSV receipt yields the same rows and auto fees as its xlsx twin', async () => {
    const XLSX = await import('xlsx');
    const { detectTemplate, parsePaymentReceipt } = await import('../src/utils.js');

    const csvText = [
      'ID,DESCRIPTION,QUANTITÉ,MONTANT',
      '1,Contre Remboursement,,"1 500,000 DT"',
      '2,Frais colis livrés,10,"70,000 DT"',
      '3,Frais colis retour,2,"4,000 DT"',
      '4,Total Frais de livraison,,"74,000 DT"',
      '5,Montant à payer,,"1 426,000 DT"',
    ].join('\n');

    const wb = XLSX.read(csvText, { type: 'string' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

    assert.equal(detectTemplate(rows), 'PAYMENT_RECEIPT');
    const result = parsePaymentReceipt(rows);
    assert.equal(result.rows.length, 12);
    assert.deepEqual(result.autoFees, { delivery: 7, return: 2 });
    assert.equal(result.summary.amountToPay, 1426);
  });

  test('a UTF-8 CSV order file keeps accented statuses and prices', async () => {
    const XLSX = await import('xlsx');
    const { detectTemplate, parseConverty } = await import('../src/utils.js');

    const csvText = [
      'Code,designation,prix,etat,telephone',
      'BC-001,Chemise en coton,"45,500",Livré,+216 20 111 222',
      'BC-002,Robe fleurie,120.75,Livré,20 333 444',
      'BC-003,Sac à main,0,Retourné,20 555 666',
    ].join('\n');

    const wb = XLSX.read(csvText, { type: 'string' });
    const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { header: 1, defval: '' });

    assert.equal(detectTemplate(rows), 'CONVERTY');
    const result = parseConverty(rows);
    assert.equal(result.rows.length, 3);
    assert.equal(result.rows[0].status, 'delivered');
    assert.equal(result.rows[2].status, 'returned');
  });
});