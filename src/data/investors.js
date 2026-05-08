// CSC Dashboard — Investor Data
// ETH: $2,274 | BNB: $637 | XRP: $1.38 | Última actualización: 2026-05-08

export const PRICES = {
  ETH: 2274,
  BNB: 637,
  XRP: 1.38,
  USDC: 1,
  USDT: 1,
  wstETH: 2813,
  WBNB: 637,
  ARB: 0.1282,
  GHO: 1,
  'USD₮0': 1,
  WBTC: 79380,
  lastUpdated: '2026-05-08T12:00:00Z',
};

// Map token symbol → price from PRICES
export function getAssetPrice(asset, prices) {
  const map = {
    ETH: prices.ETH,
    WETH: prices.ETH,
    wstETH: prices.wstETH,
    BNB: prices.BNB,
    WBNB: prices.BNB,
    XRP: prices.XRP,
    USDC: 1,
    USDT: 1,
    GHO: 1,
    'USD₮0': 1,
    ARB: prices.ARB,
    WBTC: prices.WBTC,
  };
  return map[asset] ?? 0;
}

// Recalculate a lending position's collateral value, debt and HF from live prices.
// Each collateral item must have a `liqThreshold` (0–1).
export function computeLendingPosition(pos, prices) {
  const collateralItems = pos.collateral.map(c => ({
    ...c,
    computedValueUSD: c.amount * getAssetPrice(c.asset, prices),
  }));
  const debtItems = pos.debt.map(d => ({
    ...d,
    computedValueUSD: d.amount * getAssetPrice(d.asset, prices),
  }));
  const totalCollateral = collateralItems.reduce((s, c) => s + c.computedValueUSD, 0);
  const totalDebt = debtItems.reduce((s, d) => s + d.computedValueUSD, 0);
  const weightedCollateral = collateralItems.reduce(
    (s, c) => s + c.computedValueUSD * (c.liqThreshold ?? 0.8), 0
  );
  const healthFactor = totalDebt > 0 ? weightedCollateral / totalDebt : null;
  return { collateralItems, debtItems, totalCollateral, totalDebt, healthFactor };
}

export const investors = [
  // ── JAVI ──────────────────────────────────────────────────────────────────
  {
    id: 'javi',
    name: 'Javi',
    debankUrl: 'https://debank.com/profile/0xf4adc82dc4e78e1e695762087905308769079146',
    portfolioTotal: 5964,
    pe: 1721,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: '2025-04-04',
    inversionTotal: null,
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

    wallet: [
      { asset: 'ETH',   amount: 0.0214,  valueUSD: 48.83 },
      { asset: 'WETH',  amount: 0.0107,  valueUSD: 24.50 },
      { asset: 'BNB',   amount: 0.0307,  valueUSD: 19.64 },
      { asset: 'USDC',  amount: 17.9109, valueUSD: 17.91 },
      { asset: 'USD₮0', amount: 0.0639,  valueUSD: 0.06  },
      { asset: 'MON',   amount: 1,       valueUSD: 0.03  },
    ],

    v3Positions: [
      {
        id: 'ABRACADABRA-JAVI',
        pool: 'SPELL Rewards',
        protocol: 'Abracadabra',
        network: 'Arbitrum',
        liquidity: 0,
        rangeMin: null,
        rangeMax: null,
        rewardsPending: 4.43,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'ETH',
      },
    ],

    lending: [
      {
        protocol: 'Aave V3',
        network: 'Arbitrum',
        collateral: [
          { asset: 'WETH', amount: 2.8620, valueUSD: 6507, liqThreshold: 0.825 },
        ],
        debt: [
          { asset: 'USDC', amount: 3308.58, valueUSD: 3309 },
        ],
        liquidationPriceETH: 1401,
      },
      {
        protocol: 'Venus',
        network: 'BNB',
        collateral: [
          { asset: 'XRP',  amount: 3030.03, valueUSD: 4181, liqThreshold: 0.65 },
          { asset: 'USDT', amount: 491.21,  valueUSD: 491,  liqThreshold: 0.75 },
        ],
        debt: [
          { asset: 'USDT', amount: 2117.17, valueUSD: 2117 },
        ],
        liquidationPriceXRP: 0.89,
      },
      {
        protocol: 'Aave V3',
        network: 'BNB',
        collateral: [
          { asset: 'WBNB', amount: 0.2008, valueUSD: 128, liqThreshold: 0.75 },
        ],
        debt: [
          { asset: 'USDT', amount: 76.82, valueUSD: 77 },
        ],
        liquidationPriceBNB: 478,
      },
    ],

    deltas: [],
  },

  // ── JOSE ──────────────────────────────────────────────────────────────────
  {
    id: 'jose',
    name: 'José',
    debankUrl: 'https://debank.com/profile/0x25b6afcf82014dc263b6bba28a73d16b0f760ab4',
    portfolioTotal: 7526,
    pe: 2325,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: '2025-06-13',
    inversionTotal: null,
    nsEstimado: 1800,
    aprPrevisto: 30,
    diasRestantes: 30,

    wallet: [
      { asset: 'BNB',  amount: 0.0775, valueUSD: 49.58 },
      { asset: 'ETH',  amount: 0.0129, valueUSD: 29.44 },
      { asset: 'USDC', amount: 7.7395, valueUSD: 7.74  },
      { asset: 'MON',  amount: 1,      valueUSD: 0.03  },
    ],

    v3Positions: [],

    lending: [
      {
        protocol: 'Aave V3',
        network: 'Arbitrum',
        collateral: [
          { asset: 'WETH',   amount: 2.0222, valueUSD: 4598, liqThreshold: 0.825 },
          { asset: 'wstETH', amount: 0.8756, valueUSD: 2464, liqThreshold: 0.80  },
          { asset: 'USDC',   amount: 0.8264, valueUSD: 1,    liqThreshold: 0.87  },
        ],
        debt: [
          { asset: 'USDC', amount: 3206.95, valueUSD: 3207 },
          { asset: 'WETH', amount: 0.0355,  valueUSD: 81   },
        ],
        liquidationPriceETH: 1283,
      },
      {
        protocol: 'Venus',
        network: 'BNB',
        collateral: [
          { asset: 'XRP', amount: 4529.71, valueUSD: 6251, liqThreshold: 0.65 },
        ],
        debt: [
          { asset: 'USDT', amount: 2631.78, valueUSD: 2632 },
        ],
        liquidationPriceXRP: 0.89,
      },
    ],

    deltas: [],
  },

  // ── BENJY ─────────────────────────────────────────────────────────────────
  {
    id: 'benjy',
    name: 'Benjy',
    debankUrl: 'https://debank.com/profile/0x08e8563776ba62e43ef8fe324ce325bb4452ad0c',
    portfolioTotal: 5763,
    pe: 3623,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: '2025-07-23',
    inversionTotal: null,
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

    wallet: [
      { asset: 'ETH',  amount: 0.0140,  valueUSD: 31.92 },
      { asset: 'BNB',  amount: 0.0398,  valueUSD: 25.44 },
      { asset: 'XRP',  amount: 17.7226, valueUSD: 24.58 },
      { asset: 'WETH', amount: 0.0051,  valueUSD: 11.67 },
      { asset: 'MON',  amount: 1,       valueUSD: 0.03  },
    ],

    v3Positions: [],

    lending: [
      {
        protocol: 'Venus',
        network: 'BNB',
        collateral: [
          { asset: 'XRP', amount: 3712.97, valueUSD: 5124, liqThreshold: 0.65 },
        ],
        debt: [
          { asset: 'USDT', amount: 1973.59, valueUSD: 1974 },
        ],
        liquidationPriceXRP: 0.82,
      },
      {
        protocol: 'Aave V3',
        network: 'Arbitrum',
        collateral: [
          { asset: 'WETH', amount: 2.0361, valueUSD: 4630, liqThreshold: 0.825 },
          { asset: 'USDC', amount: 147.20, valueUSD: 147,  liqThreshold: 0.87  },
        ],
        debt: [
          { asset: 'USDC', amount: 2301.78, valueUSD: 2302 },
        ],
        liquidationPriceETH: 1294,
      },
    ],

    deltas: [],
  },

  // ── IRENE ─────────────────────────────────────────────────────────────────
  {
    id: 'irene',
    name: 'Irene',
    debankUrl: 'https://debank.com/profile/0xed2affb53c1840b82c84240f9f7dda86b02a4f9f',
    portfolioTotal: 3817,
    pe: 4166,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: '2025-10-08',
    inversionTotal: 8000,
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

    wallet: [
      { asset: 'ETH',   amount: 0.0215, valueUSD: 49.13 },
      { asset: 'USD₮0', amount: 0.0489, valueUSD: 0.05  },
    ],

    v3Positions: [],

    lending: [
      {
        protocol: 'Aave V3',
        network: 'Arbitrum',
        collateral: [
          { asset: 'WETH',   amount: 2.0482, valueUSD: 4658, liqThreshold: 0.825 },
          { asset: 'wstETH', amount: 0.9144, valueUSD: 2572, liqThreshold: 0.80  },
          { asset: 'USD₮0',  amount: 0.7890, valueUSD: 1,    liqThreshold: 0.75  },
          { asset: 'GHO',    amount: 0.1838, valueUSD: 0,    liqThreshold: 0.75  },
        ],
        debt: [
          { asset: 'USDC', amount: 3434.71, valueUSD: 3435 },
          { asset: 'WETH', amount: 0.0201,  valueUSD: 46   },
        ],
        liquidationPriceETH: 1334,
      },
    ],

    deltas: [],
  },

  // ── ROBERT ────────────────────────────────────────────────────────────────
  {
    id: 'robert',
    name: 'Robert',
    debankUrl: 'https://debank.com/profile/0xca701bc6a3f762c5ecc3da46a04ee32fc6a6ba93',
    portfolioTotal: 12264,
    pe: 4552,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: '2025-09-13',
    inversionTotal: null,
    nsEstimado: 1800,
    aprPrevisto: 28,
    diasRestantes: 30,

    wallet: [
      { asset: 'ETH', amount: 0.0167, valueUSD: 38.04 },
    ],

    v3Positions: [],

    lending: [
      {
        protocol: 'Aave V3',
        network: 'Arbitrum',
        collateral: [
          { asset: 'WETH',   amount: 5.0750, valueUSD: 11541, liqThreshold: 0.825 },
          { asset: 'wstETH', amount: 2.5781, valueUSD: 7252,  liqThreshold: 0.80  },
          { asset: 'USD₮0',  amount: 0.6700, valueUSD: 1,     liqThreshold: 0.75  },
        ],
        debt: [
          { asset: 'USDC', amount: 8656.16, valueUSD: 8656 },
        ],
        liquidationPriceETH: 1284,
      },
    ],

    deltas: [],
  },

  // ── GABI ──────────────────────────────────────────────────────────────────
  {
    id: 'gabi',
    name: 'Gabi',
    debankUrl: 'https://debank.com/profile/0x37080c717bfe37f87f26c7f84afce57ba9a32d17',
    portfolioTotal: 19699,
    pe: 3139,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: '2025-03-30',
    inversionTotal: null,
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

    wallet: [
      { asset: 'ETH',  amount: 0.0243,     valueUSD: 55.49 },
      { asset: 'USDC', amount: 28.4616,    valueUSD: 28.46 },
      { asset: 'WBTC', amount: 0.00003729, valueUSD: 2.96  },
    ],

    v3Positions: [
      {
        id: 'ABRACADABRA-GABI',
        pool: 'SPELL Rewards',
        protocol: 'Abracadabra',
        network: 'Arbitrum',
        liquidity: 0,
        rangeMin: null,
        rangeMax: null,
        rewardsPending: 0.01,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'ETH',
      },
      {
        id: 'GMX-GABI',
        pool: 'GMX Rewards',
        protocol: 'GMX',
        network: 'Arbitrum',
        liquidity: 0,
        rangeMin: null,
        rangeMax: null,
        rewardsPending: 0.01,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'ETH',
      },
    ],

    lending: [
      {
        protocol: 'Aave V3',
        network: 'Arbitrum',
        collateral: [
          { asset: 'WETH',   amount: 8.5512,   valueUSD: 19446, liqThreshold: 0.825 },
          { asset: 'wstETH', amount: 2.5202,   valueUSD: 7092,  liqThreshold: 0.80  },
          { asset: 'USDC',   amount: 607.5481, valueUSD: 608,   liqThreshold: 0.87  },
          { asset: 'ARB',    amount: 53.3795,  valueUSD: 416,   liqThreshold: 0.72  },
        ],
        debt: [
          { asset: 'USDC', amount: 15131.24, valueUSD: 15131 },
        ],
        liquidationPriceETH: 1498,
      },
      {
        protocol: 'YLDR',
        network: 'Arbitrum',
        collateral: [
          { asset: 'ARB', amount: 5.8064, valueUSD: 1, liqThreshold: 0.72 },
        ],
        debt: [
          { asset: 'USD₮0', amount: 0.3406, valueUSD: 0 },
        ],
      },
    ],

    deltas: [],
  },

  // ── CARMEN ────────────────────────────────────────────────────────────────
  {
    id: 'carmen',
    name: 'Carmen',
    debankUrl: 'https://debank.com/profile/0x485d68bdabc9d8134c742f82bb7fc10750189255',
    portfolioTotal: 8571,
    pe: 4195,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: '2025-09-23',
    inversionTotal: 8000,
    nsEstimado: 1800,
    aprPrevisto: 40,
    diasRestantes: 30,

    wallet: [
      { asset: 'ETH',    amount: 0.0979,   valueUSD: 223.53 },
      { asset: 'WETH',   amount: 0.0075,   valueUSD: 17.21  },
      { asset: 'USDC',   amount: 0.7867,   valueUSD: 0.79   },
      { asset: 'wstETH', amount: 0,        valueUSD: 0.01   },
    ],

    v3Positions: [
      {
        id: '#5061323',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 6017.16,
        rangeMin: 1900.79,
        rangeMax: 2399.49,
        tokens: [{ asset: 'WETH', amount: 2.1819 }, { asset: 'USDC', amount: 905.8250 }],
        rewardsPending: 131.04,
        apr: 0,
        fechaApertura: '2026-03-16',
        priceAsset: 'ETH',
      },
      {
        id: '#5370493',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 2240.83,
        rangeMin: 2107.00,
        rangeMax: 3703.35,
        tokens: [{ asset: 'WETH', amount: 0.2047 }, { asset: 'USDC', amount: 1646.0332 }],
        rewardsPending: 127.64,
        apr: 0,
        fechaApertura: '2025-11-06',
        priceAsset: 'ETH',
      },
      {
        id: '#4928029',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 71.65,
        rangeMin: null,
        rangeMax: null,
        tokens: [{ asset: 'WETH', amount: 0.0314 }, { asset: 'USDC', amount: 0 }],
        rewardsPending: 0,
        apr: 0,
        fechaApertura: '2025-09-24',
        priceAsset: 'ETH',
      },
    ],

    lending: [],

    deltas: [],
  },

  // ── MANEL ─────────────────────────────────────────────────────────────────
  {
    id: 'manel',
    name: 'Manel',
    debankUrl: 'https://debank.com/profile/0x053c5c7137601065ba30c830c02e0c0be9bbfc7b',
    portfolioTotal: 2921,
    pe: 2038,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: '2026-03-11',
    inversionTotal: null,
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

    wallet: [
      { asset: 'ETH',  amount: 0.0186, valueUSD: 42.41 },
      { asset: 'WETH', amount: 0.0026, valueUSD: 5.96  },
    ],

    v3Positions: [
      {
        id: '#5460348',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 1521.93,
        rangeMin: null,
        rangeMax: null,
        tokens: [{ asset: 'WETH', amount: 0.1465 }, { asset: 'USDC', amount: 1181.5289 }],
        rewardsPending: 6.17,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'ETH',
      },
      {
        id: '#5447645',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 1350.82,
        rangeMin: null,
        rangeMax: null,
        tokens: [{ asset: 'WETH', amount: 0.5042 }, { asset: 'USDC', amount: 170.2996 }],
        rewardsPending: 29.84,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'ETH',
      },
    ],

    lending: [],

    deltas: [],
  },

  // ── ALBERTO ───────────────────────────────────────────────────────────────
  {
    id: 'alberto',
    name: 'Alberto',
    debankUrl: 'https://debank.com/profile/0x8d9ee154b3df08f48b56ee74ff9fe73527941c81',
    portfolioTotal: 14163,
    pe: 2832,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: '2025-11-21',
    inversionTotal: null,
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

    wallet: [
      { asset: 'wstETH', amount: 0.1399, valueUSD: 393.52 },
      { asset: 'WETH',   amount: 0.0248, valueUSD: 56.57  },
      { asset: 'ETH',    amount: 0,      valueUSD: 0.02   },
    ],

    v3Positions: [
      {
        id: '#5136962',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 13201.06,
        rangeMin: null,
        rangeMax: null,
        tokens: [{ asset: 'WETH', amount: 5.7774 }, { asset: 'USDC', amount: 0 }],
        rewardsPending: 13.76,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'ETH',
      },
      {
        id: '#5422017',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 511.64,
        rangeMin: null,
        rangeMax: null,
        tokens: [{ asset: 'WETH', amount: 0.0322 }, { asset: 'USDC', amount: 430.9133 }],
        rewardsPending: 7.17,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'ETH',
      },
    ],

    lending: [],

    deltas: [],
  },
];

// ── Helpers ──────────────────────────────────────────────────────────────────

export function getV3Status(position, prices) {
  if (position.tokens && position.tokens.length >= 2) {
    return position.tokens.every(t => t.amount > 0) ? 'IN_RANGE' : 'OUT_OF_RANGE';
  }
  if (position.confirmedInRange) return 'IN_RANGE';
  if (position.rangeMin === null || position.rangeMax === null) return 'OUT_OF_RANGE';
  const price = prices[position.priceAsset] || 0;
  if (price === 0) return 'UNKNOWN';
  return price >= position.rangeMin && price <= position.rangeMax ? 'IN_RANGE' : 'OUT_OF_RANGE';
}

export function getHFColor(hf) {
  if (hf >= 2.0) return 'green';
  if (hf >= 1.5) return 'orange';
  return 'red';
}

export function formatUSD(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatUSD2(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

export function getDaysInfo(startDate) {
  if (!startDate) return { daysActive: null, daysToComplete: null };
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysActive = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const daysToComplete = Math.max(0, 365 - daysActive);
  return { daysActive, daysToComplete };
}

export function hasLowGas(wallet) {
  const eth = wallet.find(t => t.asset === 'ETH');
  const bnb = wallet.find(t => t.asset === 'BNB' || t.asset === 'WBNB');
  const ethLow = eth ? eth.valueUSD < 15 : false;
  const bnbLow = bnb ? bnb.valueUSD < 15 : false;
  return { ethLow, bnbLow, anyLow: ethLow || bnbLow };
}

export function getInvestorSummary(investor, prices) {
  const v3Statuses = investor.v3Positions.map(p => getV3Status(p, prices));
  const activeV3 = investor.v3Positions.filter((p, i) => v3Statuses[i] === 'IN_RANGE');
  const totalRewards = investor.v3Positions.reduce((s, p) => s + (p.rewardsPending || 0), 0);

  // Dynamic HF from live prices; use reportedHF override when present
  const lendingComputed = investor.lending.map(l => computeLendingPosition(l, prices));
  const hfValues = investor.lending.map((l, i) =>
    l.reportedHF != null ? l.reportedHF : lendingComputed[i].healthFactor
  ).filter(h => h !== null && isFinite(h));
  const minHF = hfValues.length > 0 ? Math.min(...hfValues) : null;

  const activeV3Liquidity = activeV3.reduce((s, p) => s + p.liquidity, 0);
  const rewards30d = activeV3Liquidity * (investor.aprPrevisto / 100) * (30 / 365);
  const rewardsAnnual = activeV3Liquidity * (investor.aprPrevisto / 100);
  const deltaBounty = investor.deltas
    .filter(d => d.status === 'ACTIVO')
    .reduce((s, d) => s + d.ethBorrowed * (d.activationPrice - investor.nsEstimado), 0);
  const grossProfit = rewards30d + deltaBounty;
  const cscFee = grossProfit * 0.5;
  const netProfit = grossProfit * 0.5;

  const isActive = investor.v3Positions.some((p, i) => v3Statuses[i] === 'IN_RANGE') ||
                   investor.deltas.some(d => d.status === 'ACTIVO');

  let status = 'ACTIVO';
  if (minHF !== null && minHF < 1.5) status = 'CRÍTICO';
  else if (minHF !== null && minHF < 2.0) status = 'VIGILANCIA';

  const gasAlert = hasLowGas(investor.wallet || []).anyLow;

  return {
    activeV3Count: activeV3.length,
    totalV3Count: investor.v3Positions.length,
    totalRewards,
    minHF,
    status,
    rewards30d,
    rewardsAnnual,
    deltaBounty,
    grossProfit,
    cscFee,
    netProfit,
    gasAlert,
    lendingComputed,
    isActive,
  };
}
