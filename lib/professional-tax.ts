/**
 * Employee professional-tax slabs used for take-home estimates.
 * States levy this differently, and some cities vary. The payslip wins:
 * every state can be overridden with the amount actually deducted.
 */

export type Gender = "male" | "female";

type MonthlyBand = { upto: number | null; monthly: number; february?: number };
type HalfYearBand = { upto: number | null; amount: number };

type StateRule = {
  id: string;
  name: string;
  kind: "none" | "monthly" | "halfYearly";
  bands?: MonthlyBand[];
  womenBands?: MonthlyBand[];
  halfYearBands?: HalfYearBand[];
  note: { en: string; hi: string };
  sourceLabel: string;
  sourceUrl: string;
};

const NONE_NOTE = {
  en: "This state does not levy professional tax on salaried employees.",
  hi: "यह राज्य वेतनभोगी कर्मचारियों पर प्रोफेशनल टैक्स नहीं लगाता।",
};

export const PROFESSIONAL_TAX_STATES: StateRule[] = [
  {
    id: "andhra-pradesh",
    name: "Andhra Pradesh",
    kind: "monthly",
    bands: [
      { upto: 15_000, monthly: 0 },
      { upto: 20_000, monthly: 150 },
      { upto: null, monthly: 200 },
    ],
    note: {
      en: "Employee slabs commonly applied on the Andhra Pradesh schedule. Confirm the figure on your payslip.",
      hi: "आंध्र प्रदेश की आम कर्मचारी स्लैब। पक्का आंकड़ा पे-स्लिप पर देखें।",
    },
    sourceLabel: "Andhra Pradesh professional tax schedule (employee slabs, confirm locally)",
    sourceUrl: "https://www.incometax.gov.in/",
  },
  {
    id: "delhi",
    name: "Delhi",
    kind: "none",
    note: NONE_NOTE,
    sourceLabel: "Delhi does not levy professional tax",
    sourceUrl: "https://www.incometax.gov.in/",
  },
  {
    id: "gujarat",
    name: "Gujarat",
    kind: "monthly",
    bands: [
      { upto: 11_999, monthly: 0 },
      { upto: null, monthly: 200 },
    ],
    note: {
      en: "Gujarat: nil up to ₹11,999 a month, then ₹200. Source: Gujarat State Tax on Professions Act, 1976 schedule, as commonly applied to salary.",
      hi: "गुजरात: ₹11,999 मासिक तक शून्य, उसके बाद ₹200।",
    },
    sourceLabel: "Gujarat profession tax schedule",
    sourceUrl: "https://commercialtax.gujarat.gov.in/",
  },
  {
    id: "haryana",
    name: "Haryana",
    kind: "none",
    note: NONE_NOTE,
    sourceLabel: "Haryana does not levy professional tax",
    sourceUrl: "https://www.incometax.gov.in/",
  },
  {
    id: "karnataka",
    name: "Karnataka",
    kind: "monthly",
    bands: [
      { upto: 24_999, monthly: 0 },
      { upto: null, monthly: 200, february: 300 },
    ],
    note: {
      en: "Karnataka revised these slabs from 1 April 2025 (Karnataka Act 33 of 2025): nil below ₹25,000, otherwise ₹200 a month and ₹300 in February.",
      hi: "कर्नाटक में 1 अप्रैल 2025 से: ₹25,000 से कम पर शून्य, अन्यथा ₹200 और फरवरी में ₹300।",
    },
    sourceLabel: "Karnataka Act 33 of 2025",
    sourceUrl: "https://erajyapatra.karnataka.gov.in/WriteReadData/2025/8459.pdf",
  },
  {
    id: "kerala",
    name: "Kerala",
    kind: "halfYearly",
    halfYearBands: [
      { upto: 11_999, amount: 0 },
      { upto: 17_999, amount: 320 },
      { upto: 29_999, amount: 450 },
      { upto: 44_999, amount: 600 },
      { upto: 99_999, amount: 750 },
      { upto: 124_999, amount: 1_000 },
      { upto: null, amount: 1_250 },
    ],
    note: {
      en: "Kerala collects professional tax half-yearly. The monthly figure here is the annual amount divided by 12. Half-yearly income is treated as six times monthly gross.",
      hi: "केरल में प्रोफेशनल टैक्स छमाही लगता है। यहाँ मासिक आंकड़ा सालाना राशि को 12 से भाग देकर है।",
    },
    sourceLabel: "Kerala profession tax half-yearly slabs",
    sourceUrl: "https://www.keralataxes.gov.in/",
  },
  {
    id: "madhya-pradesh",
    name: "Madhya Pradesh",
    kind: "monthly",
    bands: [
      { upto: 18_750, monthly: 0 },
      { upto: 25_000, monthly: 125 },
      { upto: 33_333, monthly: 167 },
      { upto: null, monthly: 208, february: 212 },
    ],
    note: {
      en: "Madhya Pradesh employee slabs in wide payroll use. February is ₹212 above ₹33,333 so the year reaches the ₹2,500 constitutional ceiling. Confirm on your payslip.",
      hi: "मध्य प्रदेश की आम कर्मचारी स्लैब। ₹33,333 से ऊपर फरवरी में ₹212 कटता है। पे-स्लिप से मिला लें।",
    },
    sourceLabel: "Madhya Pradesh profession tax employee slabs",
    sourceUrl: "https://www.mptax.mp.gov.in/",
  },
  {
    id: "maharashtra",
    name: "Maharashtra",
    kind: "monthly",
    bands: [
      { upto: 7_500, monthly: 0 },
      { upto: 10_000, monthly: 175 },
      { upto: null, monthly: 200, february: 300 },
    ],
    womenBands: [
      { upto: 25_000, monthly: 0 },
      { upto: null, monthly: 200, february: 300 },
    ],
    note: {
      en: "Maharashtra Profession Tax Act, 1975, Schedule I as on 31 March 2025. Women are exempt up to ₹25,000 a month. Above the top slab, February is ₹300 and other months are ₹200.",
      hi: "महाराष्ट्र प्रोफेशन टैक्स अधिनियम, 1975। महिलाओं को ₹25,000 मासिक तक छूट है। ऊपरी स्लैब में फरवरी ₹300 है।",
    },
    sourceLabel: "Maharashtra Profession Tax Act, 1975, Schedule I",
    sourceUrl: "https://mahagst.gov.in/",
  },
  {
    id: "punjab",
    name: "Punjab",
    kind: "none",
    note: NONE_NOTE,
    sourceLabel: "Punjab does not levy professional tax on salary",
    sourceUrl: "https://www.incometax.gov.in/",
  },
  {
    id: "rajasthan",
    name: "Rajasthan",
    kind: "none",
    note: NONE_NOTE,
    sourceLabel: "Rajasthan does not levy professional tax",
    sourceUrl: "https://www.incometax.gov.in/",
  },
  {
    id: "tamil-nadu",
    name: "Tamil Nadu",
    kind: "halfYearly",
    halfYearBands: [
      { upto: 21_000, amount: 0 },
      { upto: 30_000, amount: 180 },
      { upto: 45_000, amount: 425 },
      { upto: 60_000, amount: 930 },
      { upto: 75_000, amount: 1_025 },
      { upto: null, amount: 1_250 },
    ],
    note: {
      en: "Tamil Nadu professional tax is levied by municipalities and can differ. These are the widely used half-yearly slabs, capped at ₹2,500 a year. Half-yearly income is treated as six times monthly gross.",
      hi: "तमिलनाडु में यह टैक्स नगर निकाय लगाते हैं और स्लैब अलग हो सकती है। यहाँ आम छमाही स्लैब है, साल में अधिकतम ₹2,500।",
    },
    sourceLabel: "Tamil Nadu municipal professional tax slabs (confirm locally)",
    sourceUrl: "https://www.tn.gov.in/",
  },
  {
    id: "telangana",
    name: "Telangana",
    kind: "monthly",
    bands: [
      { upto: 15_000, monthly: 0 },
      { upto: 20_000, monthly: 150 },
      { upto: null, monthly: 200 },
    ],
    note: {
      en: "Telangana Tax on Professions, Trades, Callings and Employments Act, 1987, First Schedule: nil up to ₹15,000, ₹150 from ₹15,001 to ₹20,000, and ₹200 above that.",
      hi: "तेलंगाना: ₹15,000 तक शून्य, ₹15,001 से ₹20,000 पर ₹150, उसके ऊपर ₹200।",
    },
    sourceLabel: "Telangana profession tax First Schedule",
    sourceUrl: "https://www.tgct.gov.in/tgportal/AllActs/APPT/APPTSchedule.aspx",
  },
  {
    id: "uttar-pradesh",
    name: "Uttar Pradesh",
    kind: "none",
    note: NONE_NOTE,
    sourceLabel: "Uttar Pradesh does not levy professional tax",
    sourceUrl: "https://www.incometax.gov.in/",
  },
  {
    id: "west-bengal",
    name: "West Bengal",
    kind: "monthly",
    bands: [
      { upto: 10_000, monthly: 0 },
      { upto: 15_000, monthly: 110 },
      { upto: 25_000, monthly: 130 },
      { upto: 40_000, monthly: 150 },
      { upto: null, monthly: 200 },
    ],
    note: {
      en: "West Bengal State Tax on Professions, Trades, Callings and Employments Act, 1979, salary slabs.",
      hi: "पश्चिम बंगाल प्रोफेशन टैक्स अधिनियम, 1979 की वेतन स्लैब।",
    },
    sourceLabel: "West Bengal profession tax salary slabs",
    sourceUrl: "https://www.wbcomtax.gov.in/",
  },
  {
    id: "other",
    name: "Other / not listed",
    kind: "none",
    note: {
      en: "This state is not in the built-in list. Enter the monthly professional tax from your payslip if it is deducted.",
      hi: "यह राज्य सूची में नहीं है। अगर कटता है तो पे-स्लिप से मासिक प्रोफेशनल टैक्स भरें।",
    },
    sourceLabel: "Enter the payslip amount",
    sourceUrl: "https://www.incometax.gov.in/",
  },
];

export type ProfessionalTaxResult = {
  stateId: string;
  stateName: string;
  monthly: number;
  february: number;
  annual: number;
  note: { en: string; hi: string };
  sourceLabel: string;
  sourceUrl: string;
  overridden: boolean;
};

function pickBand<T extends { upto: number | null }>(amount: number, bands: T[]): T {
  for (const band of bands) {
    if (band.upto == null || amount <= band.upto) return band;
  }
  const last = bands[bands.length - 1];
  if (!last) throw new Error("Professional tax bands are empty");
  return last;
}

export function getState(stateId: string): StateRule {
  return PROFESSIONAL_TAX_STATES.find((state) => state.id === stateId) ?? PROFESSIONAL_TAX_STATES[PROFESSIONAL_TAX_STATES.length - 1]!;
}

export function annualProfessionalTax(options: {
  stateId: string;
  monthlyGross: number;
  gender: Gender;
  /** When set, this monthly payslip amount replaces the slab, including zero. */
  monthlyOverride?: number | null;
}): ProfessionalTaxResult {
  const state = getState(options.stateId);
  const gross = Number.isFinite(options.monthlyGross) && options.monthlyGross > 0 ? options.monthlyGross : 0;

  if (options.monthlyOverride != null && Number.isFinite(options.monthlyOverride) && options.monthlyOverride >= 0) {
    const monthly = Math.round(options.monthlyOverride);
    return {
      stateId: state.id,
      stateName: state.name,
      monthly,
      february: monthly,
      annual: monthly * 12,
      note: {
        en: "Using the monthly professional tax you entered, for all twelve months.",
        hi: "आपके भरे मासिक प्रोफेशनल टैक्स को बारह महीनों पर लगाया गया है।",
      },
      sourceLabel: "Payslip override",
      sourceUrl: state.sourceUrl,
      overridden: true,
    };
  }

  if (state.kind === "none" || !state.bands && state.kind === "monthly") {
    return {
      stateId: state.id,
      stateName: state.name,
      monthly: 0,
      february: 0,
      annual: 0,
      note: state.note,
      sourceLabel: state.sourceLabel,
      sourceUrl: state.sourceUrl,
      overridden: false,
    };
  }

  if (state.kind === "halfYearly" && state.halfYearBands) {
    const halfIncome = gross * 6;
    const band = pickBand(halfIncome, state.halfYearBands);
    const annual = band.amount * 2;
    const smoothed = Math.round(annual / 12);
    return {
      stateId: state.id,
      stateName: state.name,
      monthly: smoothed,
      february: smoothed,
      annual,
      note: state.note,
      sourceLabel: state.sourceLabel,
      sourceUrl: state.sourceUrl,
      overridden: false,
    };
  }

  const bands = options.gender === "female" && state.womenBands ? state.womenBands : state.bands ?? [];
  const band = pickBand(gross, bands);
  const monthly = band.monthly;
  const february = band.february ?? band.monthly;
  return {
    stateId: state.id,
    stateName: state.name,
    monthly,
    february,
    annual: monthly * 11 + february,
    note: state.note,
    sourceLabel: state.sourceLabel,
    sourceUrl: state.sourceUrl,
    overridden: false,
  };
}
