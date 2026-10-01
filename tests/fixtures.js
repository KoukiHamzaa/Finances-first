// Small hand-built fixtures, one per supported carrier.
// Column order matters: the parsers read by header name (Converty/Intigo)
// or by fixed index (Logista).

// --- Converty: header must be unaccented (designation / prix / etat / code / telephone)
// because detectTemplate matches the literal string 'designation'.
export const CONVERTY_ROWS = [
  ['Code', 'designation', 'prix', 'etat', 'telephone'],
  ['BC-001', 'Chemise en coton', '45,500', 'Livré', '+216 20 111 222'],
  ['BC-002', 'Robe fleurie', '120.75', 'Livré', '20 333 444'],
  ['BC-003', 'Sac à main', '0', 'Retour received', '20 555 666'],
  ['BC-004', 'Chaussures', '88.999', 'Retourné', '20 777 888'],
  ['BC-005', 'Ceinture cuir', '35', 'Annulé', '20 999 000'],
  ['BC-006', 'Bijoux fantaisie', '15,25', 'Échange', '21 111 222'],
  ['BC-007', 'Lampe bureau', '70,000', 'En cours de livraison', '21 333 444'],
  ['BC-008', 'Tapis berbère', '250,00', 'مسلم', '21 555 666'],
  ['BC-009', 'Duplicata', '10,00', 'Livré', '21 777 888'],
  ['bc 001', 'Doublon (casse differente)', '11,00', 'Livré', '21 999 000'],
  ['BC-011', 'Sans prix', 'n/a', 'Livré', ''],
];

// --- Intigo: nid / ville / statut / prix cod / frais / téléphone
export const INTIGO_ROWS = [
  ['NID', 'Ville', 'Statut', 'Prix COD', 'Frais', 'Téléphone', 'Client'],
  ['NI-1001', 'Tunis', '5000', '150,000', '7,00', '+216 22 100 100', 'Ali B'],
  ['NI-1002', 'Sfax', '6900', '80,500', '7,00', '22 100 200', 'Sami C'],
  ['NI-1003', 'Tunis', '3201', '60,000', '7,00', '22 100 300', 'Nadia D'],
  ['NI-1004', 'Sousse', '6000', '45,250', '7,00', '22 100 400', 'Rim E'],
  ['NI-1005', 'Nabeul', '6500', '30,000', '7,00', '22 100 500', 'Sonia F'],
  ['NI-1006', 'Tunis', '1100', '25,000', '7,00', '22 100 600', 'Hedi G'],
  ['NI-1007', 'Bizerte', 'état mystère', '12,000', '7,00', '22 100 700', 'Mounir H'],
  ['NI-1008', 'Tunis', 'livré', '11,000', '7,00', '22 100 800', 'Ines I'],
  ['NI-1009', 'Kairouan', 'retour en cours', '9,000', '7,00', '22 100 900', 'Amor J'],
  ['NI-1001', 'Doublon', '5000', '5,000', '7,00', '22 100 100', 'Ali B'],
];

// --- Logista: two stacked tables, delivered then returns.
// Fixed indices the parser relies on: 0 barcode, 2 designation,
// 8 TTC, 9 HT, 10 fee.
export const LOGISTA_ROWS = [
  ['DETAILS PAIEMENT'],
  [],
  ['Code Barres', 'Client', 'Désignation', 'Gouv', 'Date', 'Téléphone', 'Type', 'Montant HT', 'Montant TTC', 'Montant HT2', 'Frais Liv'],
  ['LG-9001', 'Ahmed Z', 'Chaussures Nike', 'Tunis', '01/02/2026', '+216 22 300 300', 'CMD', '200,000', '240,000', '200,000', '7,000'],
  ['LG-9002', 'Bousselem K', 'Sac cuir', 'Sfax', '02/02/2026', '22 300 400', 'CMD', '150,500', '180,600', '150,500', '7,000'],
  ['LG-9003', 'Chouaib M', 'Montre', 'Ariana', '03/02/2026', '22 300 500', 'CMD', '300,000', '360,000', '300,000', '7,000'],
  ['TOTAL LIV', '', '', '', '', '', '', '', '780,600', '', '21,000'],
  [],
  ['Code Barres', 'Client', 'Désignation', 'Gouv', 'Date', 'Téléphone', 'Type', 'Montant HT', 'Montant TTC', 'Montant HT2', 'Frais Ret'],
  ['LG-9004', 'Dridi N', 'Chemise', 'Tunis', '04/02/2026', '22 300 600', 'RET', '90,000', '90,000', '90,000', '2,000'],
  ['LG-9005', 'Ezzedine P', 'Casquette', 'Sousse', '05/02/2026', '22 300 700', 'RET', '35,000', '35,000', '35,000', '2,000'],
  ['TOTAL RET', '', '', '', '', '', '', '', '125,000', '', '4,000'],
];
