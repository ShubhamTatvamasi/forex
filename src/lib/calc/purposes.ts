export const CURRENCIES = ['USD', 'GBP', 'EUR', 'AUD', 'CAD', 'SGD', 'AED', 'JPY', 'CHF', 'NZD'] as const;
export type Currency = (typeof CURRENCIES)[number];

export const CURRENCY_SYMBOLS: Record<Currency, string> = {
  USD: '$',
  GBP: '£',
  EUR: '€',
  AUD: '$',
  CAD: '$',
  SGD: '$',
  AED: 'د.إ',
  JPY: '¥',
  CHF: 'Fr',
  NZD: '$',
};

/** Full Value (no correspondent bank charge) is available for these currencies only. */
export const FULL_VALUE_CURRENCIES: Currency[] = ['USD', 'EUR', 'GBP'];

export type PurposeKind = 'other' | 'education_loan' | 'education_medical';

export interface PurposeOption {
  /** RBI purpose code, e.g. "S0305". */
  code: string;
  label: string;
  kind: PurposeKind;
}

export interface PurposeGroup {
  group: string;
  options: PurposeOption[];
}

/** RBI purpose codes (Form A2), grouped by RBI purpose category. */
export const PURPOSE_GROUPS: PurposeGroup[] = [
  {
    group: 'Travel',
    options: [
      { code: 'S0301', label: 'Business travel', kind: 'other' },
      { code: 'S0303', label: 'Travel for pilgrimage', kind: 'other' },
      { code: 'S0304', label: 'Travel for medical treatment', kind: 'education_medical' },
      { code: 'S0305', label: 'Travel for education — funded by a specified loan', kind: 'education_loan' },
      { code: 'S0305', label: 'Travel for education — self-funded', kind: 'education_medical' },
      { code: 'S0306', label: 'Other travel, incl. holiday trips & credit card settlements', kind: 'other' },
    ],
  },
  {
    group: 'Capital Account',
    options: [
      { code: 'S0017', label: 'Acquisition of non-produced non-financial assets — Government', kind: 'other' },
      { code: 'S0019', label: 'Acquisition of non-produced non-financial assets — Non-Govt', kind: 'other' },
      { code: 'S0026', label: 'Capital transfers — Government', kind: 'other' },
      { code: 'S0027', label: 'Capital transfers — Non-Government', kind: 'other' },
      { code: 'S0099', label: 'Other capital payments not included elsewhere', kind: 'other' },
    ],
  },
  {
    group: 'Foreign Direct Investment',
    options: [
      { code: 'S0003', label: 'Indian Direct Investment abroad — equity shares', kind: 'other' },
      { code: 'S0004', label: 'Indian Direct Investment abroad — debt instruments', kind: 'other' },
      { code: 'S0005', label: 'Indian investment abroad — real estate', kind: 'other' },
      { code: 'S0006', label: 'Repatriation of FDI made by overseas investors in India — equity shares', kind: 'other' },
      { code: 'S0007', label: 'Repatriation of FDI made by overseas investors in India — debt instruments', kind: 'other' },
      { code: 'S0008', label: 'Repatriation of FDI made by overseas investors in India — real estate', kind: 'other' },
    ],
  },
  {
    group: 'Foreign Portfolio Investment',
    options: [
      { code: 'S0001', label: 'Indian Portfolio Investment abroad — equity shares', kind: 'other' },
      { code: 'S0002', label: 'Indian Portfolio Investment abroad — debt instruments', kind: 'other' },
      { code: 'S0009', label: 'Repatriation of Foreign Portfolio Investment in India — equity shares', kind: 'other' },
      { code: 'S0010', label: 'Repatriation of Foreign Portfolio Investment in India — debt instruments', kind: 'other' },
    ],
  },
  {
    group: 'External Commercial Borrowings / Loans',
    options: [
      { code: 'S0011', label: 'Loans extended to Non-Residents', kind: 'other' },
      { code: 'S0012', label: 'Repayment of long/medium term loans from Non-Residents', kind: 'other' },
      { code: 'S0013', label: 'Repayment of short term loans from Non-Residents', kind: 'other' },
    ],
  },
  {
    group: 'Banking Capital',
    options: [
      { code: 'S0014', label: 'Repatriation of Non-Resident Deposits (FCNR(B)/NR(E)RA etc.)', kind: 'other' },
      { code: 'S0015', label: 'Repayment of loans/overdrafts taken by ADs on own account', kind: 'other' },
      { code: 'S0016', label: 'Sale of a foreign currency against another foreign currency', kind: 'other' },
    ],
  },
  {
    group: 'Financial Derivatives and Others',
    options: [
      { code: 'S0020', label: 'Margin/premium/settlement payments — financial derivatives', kind: 'other' },
      { code: 'S0021', label: 'Sale of share under Employee Stock Option', kind: 'other' },
      { code: 'S0022', label: 'Investment in Indian Depository Receipts (IDRs)', kind: 'other' },
      { code: 'S0023', label: 'Opening of foreign currency account abroad with a bank', kind: 'other' },
    ],
  },
  {
    group: 'External Assistance',
    options: [
      { code: 'S0024', label: 'External Assistance extended by India', kind: 'other' },
      { code: 'S0025', label: 'Repayments on account of External Assistance received by India', kind: 'other' },
    ],
  },
  {
    group: 'Imports',
    options: [
      { code: 'S0101', label: 'Advance payment against imports (other than Nepal/Bhutan)', kind: 'other' },
      { code: 'S0102', label: 'Payment towards imports — settlement of invoice', kind: 'other' },
      { code: 'S0103', label: 'Imports by diplomatic missions', kind: 'other' },
      { code: 'S0104', label: 'Intermediary / transit trade', kind: 'other' },
      { code: 'S0108', label: 'Goods acquired under merchanting', kind: 'other' },
      { code: 'S0109', label: 'Payments for imports from Nepal and Bhutan', kind: 'other' },
    ],
  },
  {
    group: 'Transport',
    options: [
      { code: 'S0201', label: 'Surplus freight/passenger fare — foreign shipping cos. in India', kind: 'other' },
      { code: 'S0202', label: 'Operating expenses — Indian shipping cos. abroad', kind: 'other' },
      { code: 'S0203', label: 'Freight on imports — shipping companies', kind: 'other' },
      { code: 'S0204', label: 'Freight on exports — shipping companies', kind: 'other' },
      { code: 'S0205', label: 'Operational leasing/rental of vessels (with crew) — shipping', kind: 'other' },
      { code: 'S0206', label: 'Booking of passages abroad — shipping companies', kind: 'other' },
      { code: 'S0207', label: 'Surplus freight/passenger fare — foreign airlines in India', kind: 'other' },
      { code: 'S0208', label: 'Operating expenses — Indian airlines abroad', kind: 'other' },
      { code: 'S0209', label: 'Freight on imports — airlines companies', kind: 'other' },
      { code: 'S0210', label: 'Freight on exports — airlines companies', kind: 'other' },
      { code: 'S0211', label: 'Operational leasing/rental of vessels (with crew) — airlines', kind: 'other' },
      { code: 'S0212', label: 'Booking of passages abroad — airlines companies', kind: 'other' },
      { code: 'S0214', label: 'Stevedoring, demurrage, port handling — shipping', kind: 'other' },
      { code: 'S0215', label: 'Stevedoring, demurrage, port handling — airlines', kind: 'other' },
      { code: 'S0216', label: 'Payments for passenger — shipping companies', kind: 'other' },
      { code: 'S0217', label: 'Other payments by shipping companies', kind: 'other' },
      { code: 'S0218', label: 'Payments for passenger — airlines companies', kind: 'other' },
      { code: 'S0219', label: 'Other payments by airlines companies', kind: 'other' },
      { code: 'S0220', label: 'Freight — other transport modes (waterways/road/rail/pipeline)', kind: 'other' },
      { code: 'S0221', label: 'Passenger fare — other transport modes', kind: 'other' },
      { code: 'S0222', label: 'Postal & courier services by air', kind: 'other' },
      { code: 'S0223', label: 'Postal & courier services by sea', kind: 'other' },
      { code: 'S0224', label: 'Postal & courier services by others', kind: 'other' },
    ],
  },
  {
    group: 'Construction Services',
    options: [
      { code: 'S0501', label: 'Construction of projects abroad by Indian companies', kind: 'other' },
      { code: 'S0502', label: 'Cost of construction of projects by foreign cos. in India', kind: 'other' },
    ],
  },
  {
    group: 'Insurance and Pension Services',
    options: [
      { code: 'S0601', label: 'Life insurance premium except term insurance', kind: 'other' },
      { code: 'S0602', label: 'Freight insurance — import & export of goods', kind: 'other' },
      { code: 'S0603', label: 'Other general/reinsurance/term life insurance premium', kind: 'other' },
      { code: 'S0605', label: 'Auxiliary services incl. commission on insurance', kind: 'other' },
      { code: 'S0607', label: 'Insurance claim settlement — non-life / term life', kind: 'other' },
      { code: 'S0608', label: 'Life insurance claim settlements', kind: 'other' },
      { code: 'S0609', label: 'Standardised guarantee services', kind: 'other' },
      { code: 'S0610', label: 'Premium for pension funds', kind: 'other' },
      { code: 'S0611', label: 'Periodic pension entitlements', kind: 'other' },
      { code: 'S0612', label: 'Invoking of standardised guarantees', kind: 'other' },
    ],
  },
  {
    group: 'Financial Services',
    options: [
      { code: 'S0701', label: 'Financial intermediation — bank/collection/LC charges', kind: 'other' },
      { code: 'S0702', label: 'Investment banking — brokerage, underwriting commission', kind: 'other' },
      { code: 'S0703', label: 'Auxiliary services — regulatory fees, custodial/depository', kind: 'other' },
    ],
  },
  {
    group: 'Telecommunication, Computer & Information Services',
    options: [
      { code: 'S0801', label: 'Hardware consultancy/implementation', kind: 'other' },
      { code: 'S0802', label: 'Software consultancy/implementation', kind: 'other' },
      { code: 'S0803', label: 'Database, data processing charges', kind: 'other' },
      { code: 'S0804', label: 'Repair and maintenance of computer and software', kind: 'other' },
      { code: 'S0805', label: 'News agency services', kind: 'other' },
      { code: 'S0806', label: 'Subscription to newspapers, periodicals', kind: 'other' },
      { code: 'S0807', label: 'Off-site software imports', kind: 'other' },
      { code: 'S0808', label: 'Telecommunication services incl. email/voice mail', kind: 'other' },
      { code: 'S0809', label: 'Satellite services incl. space shuttle and rockets', kind: 'other' },
    ],
  },
  {
    group: 'Charges for Use of Intellectual Property',
    options: [
      { code: 'S0901', label: 'Franchises services', kind: 'other' },
      { code: 'S0902', label: 'Licensing of originals, patents, copyrights, trademarks', kind: 'other' },
    ],
  },
  {
    group: 'Other Business Services',
    options: [
      { code: 'S1002', label: 'Trade related services — commission on exports/imports', kind: 'other' },
      { code: 'S1003', label: 'Operational leasing without crew — airlines', kind: 'other' },
      { code: 'S1004', label: 'Legal services', kind: 'other' },
      { code: 'S1005', label: 'Accounting, auditing, book-keeping services', kind: 'other' },
      { code: 'S1006', label: 'Business/management consultancy & PR services', kind: 'other' },
      { code: 'S1007', label: 'Advertising, trade fair service', kind: 'other' },
      { code: 'S1008', label: 'Research & Development services', kind: 'other' },
      { code: 'S1009', label: 'Architectural services', kind: 'other' },
      { code: 'S1010', label: 'Agricultural services (pest/disease control, forestry)', kind: 'other' },
      { code: 'S1011', label: 'Payments for maintenance of offices abroad', kind: 'other' },
      { code: 'S1013', label: 'Environmental services', kind: 'other' },
      { code: 'S1014', label: 'Engineering services', kind: 'other' },
      { code: 'S1015', label: 'Tax consulting services', kind: 'other' },
      { code: 'S1016', label: 'Market research and public opinion polling', kind: 'other' },
      { code: 'S1017', label: 'Publishing and printing services', kind: 'other' },
      { code: 'S1018', label: 'Mining services (on-site processing, ore analysis)', kind: 'other' },
      { code: 'S1020', label: 'Commission agent services', kind: 'other' },
      { code: 'S1021', label: 'Wholesale and retailing trade services', kind: 'other' },
      { code: 'S1022', label: 'Operational leasing without crew — shipping', kind: 'other' },
      { code: 'S1023', label: 'Other technical services incl. scientific/space', kind: 'other' },
      { code: 'S1099', label: 'Other services not included elsewhere', kind: 'other' },
    ],
  },
  {
    group: 'Personal, Cultural & Recreational Services',
    options: [
      { code: 'S1101', label: 'Audio-visual/motion picture & video tape production', kind: 'other' },
      { code: 'S1103', label: 'Radio and television production/distribution', kind: 'other' },
      { code: 'S1104', label: 'Entertainment services', kind: 'other' },
      { code: 'S1105', label: 'Museums, library and archival services', kind: 'other' },
      { code: 'S1106', label: 'Recreation and sporting activities services', kind: 'other' },
      { code: 'S1107', label: 'Education — fees for correspondence courses abroad', kind: 'other' },
      { code: 'S1108', label: 'Health service — hospitals, doctors, remote/on-site', kind: 'education_medical' },
      { code: 'S1109', label: 'Other personal, cultural & recreational services', kind: 'other' },
    ],
  },
  {
    group: 'Government (n.i.e.)',
    options: [
      { code: 'S1201', label: 'Maintenance of Indian embassies abroad', kind: 'other' },
      { code: 'S1202', label: 'Remittances by foreign embassies in India', kind: 'other' },
    ],
  },
  {
    group: 'Secondary Income',
    options: [
      { code: 'S1301', label: 'Family maintenance and savings', kind: 'other' },
      { code: 'S1302', label: 'Personal gifts and donations', kind: 'other' },
      { code: 'S1303', label: 'Donations to religious/charitable institutions abroad', kind: 'other' },
      { code: 'S1304', label: 'Grants/donations to governments & charitable institutions', kind: 'other' },
      { code: 'S1305', label: 'Contributions/donations by Government to intl. institutions', kind: 'other' },
      { code: 'S1306', label: 'Payment / refund of taxes', kind: 'other' },
      { code: 'S1307', label: 'Migrant transfers incl. personal effects', kind: 'other' },
    ],
  },
  {
    group: 'Primary Income',
    options: [
      { code: 'S1401', label: 'Compensation of employees', kind: 'other' },
      { code: 'S1402', label: 'Interest on Non-Resident deposits (FCNR(B)/NR(E)RA)', kind: 'other' },
      { code: 'S1403', label: 'Interest on loans from Non-Residents (ST/MT/LT)', kind: 'other' },
      { code: 'S1405', label: 'Interest payment by ADs on own account', kind: 'other' },
      { code: 'S1408', label: 'Remittance of profit by FDI enterprises in India', kind: 'other' },
      { code: 'S1409', label: 'Remittance of dividends by FDI enterprises in India', kind: 'other' },
      { code: 'S1410', label: 'Interest by FDI enterprises to parent company abroad', kind: 'other' },
      { code: 'S1411', label: 'Interest income on Portfolio Investment in India', kind: 'other' },
      { code: 'S1412', label: 'Dividends on Portfolio Investment in India', kind: 'other' },
    ],
  },
  {
    group: 'Others',
    options: [
      { code: 'S1501', label: 'Refunds/rebates/reduction in invoice value — exports', kind: 'other' },
      { code: 'S1502', label: 'Reversal of wrong entries, refunds for non-exports', kind: 'other' },
      { code: 'S1503', label: 'Payments by residents for international bidding', kind: 'other' },
      { code: 'S1504', label: 'Notional sales — dishonored/cancelled export bills', kind: 'other' },
      { code: 'S1505', label: 'Deemed imports (SEZ/EPZ ↔ Domestic Tariff Area)', kind: 'other' },
    ],
  },
  {
    group: 'Maintenance and Repair Services',
    options: [
      { code: 'S1601', label: 'Maintenance/repair — vessels, ships, boats, warships', kind: 'other' },
      { code: 'S1602', label: 'Maintenance/repair — aircraft, space shuttles, rockets', kind: 'other' },
    ],
  },
  {
    group: 'Manufacturing Services',
    options: [{ code: 'S1701', label: 'Payments for processing of goods', kind: 'other' }],
  },
  {
    group: 'Not Listed',
    options: [{ code: '', label: 'Other purpose not listed above', kind: 'other' }],
  },
];

/** Stable id for a purpose option, used as the <option> value. */
export function purposeId(group: string, option: PurposeOption): string {
  return `${group}::${option.code}::${option.label}`;
}

export const DEFAULT_PURPOSE_ID = purposeId(
  'Foreign Portfolio Investment',
  PURPOSE_GROUPS.find((g) => g.group === 'Foreign Portfolio Investment')!.options[0],
);

export function findPurpose(id: string): PurposeOption {
  for (const g of PURPOSE_GROUPS) {
    for (const o of g.options) {
      if (purposeId(g.group, o) === id) return o;
    }
  }
  return { code: '', label: 'Other purpose not listed above', kind: 'other' };
}
