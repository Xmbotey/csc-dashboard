// CSC Dashboard — Investor Data
// ETH: $2,047 | BNB: $580 | XRP: $1.2994

export const PRICES = {
  ETH: 2047,
  BNB: 580,
  XRP: 1.2994,
  USDC: 1,
  USDT: 1,
  wstETH: 2047 * 1.05,
  WBNB: 580,
  lastUpdated: '2026-04-02T20:49:00Z',
};

export const investors = [
  {
    id: 'javi',
    name: 'Javi',
    portfolioTotal: 5007,
    pe: 4000,
    peNote: 'ciclo anterior',
    capitalInicial: null,
    fechaEntrada: null,
    startDate: null,
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

    wallet: [],

    v3Positions: [
      {
        id: '#5139243',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 2192,
        rangeMin: 2951,
        rangeMax: 4125,
        rewardsPending: 0,
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
          { asset: 'WETH', amount: 2.8559, valueUSD: 5840 },
        ],
        debt: [
          { asset: 'USDC', amount: 3292.94, valueUSD: 3293 },
        ],
        healthFactor: 1.49,
        liquidationPriceETH: 1356,
      },
      {
        protocol: 'Venus',
        network: 'BNB',
        collateral: [
          { asset: 'XRP', amount: 3028.25, valueUSD: 3933 },
          { asset: 'USDT', amount: 490.30, valueUSD: 490 },
        ],
        debt: [
          { asset: 'USDT', amount: 2109.56, valueUSD: 2110 },
        ],
        healthFactor: 1.40,
        liquidationPriceXRP: 0.87,
      },
      {
        protocol: 'Aave V3',
        network: 'BNB',
        collateral: [
          { asset: 'WBNB', amount: 0.2008, valueUSD: 116 },
        ],
        debt: [
          { asset: 'USDT', amount: 76.5, valueUSD: 76.5 },
        ],
        healthFactor: 1.22,
        liquidationPriceBNB: 473,
      },
    ],

    deltas: [],
  },

  {
    id: 'jose',
    name: 'José',
    portfolioTotal: 6989,
    pe: 2146,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: null,
    nsEstimado: 1800,
    aprPrevisto: 30,
    diasRestantes: 30,

    wallet: [],

    v3Positions: [
      {
        id: '#5396295',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 1359,
        rangeMin: 1901,
        rangeMax: 2399,
        rewardsPending: 0,
        apr: 30,
        fechaApertura: null,
        priceAsset: 'ETH',
      },
    ],

    lending: [
      {
        protocol: 'Venus',
        network: 'BNB',
        collateral: [
          { asset: 'XRP', amount: 4527, valueUSD: 6156 },
        ],
        debt: [
          { asset: 'USDT', amount: 2620, valueUSD: 2620 },
        ],
        healthFactor: 1.53,
        liquidationPriceXRP: 0.73,
      },
      {
        protocol: 'Aave V3',
        network: 'Arbitrum',
        collateral: [
          { asset: 'WETH', amount: 2.02, valueUSD: 4149 },
          { asset: 'wstETH', amount: 0.876, valueUSD: 1889 },
        ],
        debt: [
          { asset: 'USDC', amount: 3269, valueUSD: 3269 },
        ],
        healthFactor: 1.67,
        liquidationPriceETH: 1285,
      },
    ],

    deltas: [],
  },

  {
    id: 'benjy',
    name: 'Benjy',
    portfolioTotal: 5393,
    pe: 2148,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: null,
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

    wallet: [],

    v3Positions: [
      {
        id: '#BENJY-1',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 1510,
        rangeMin: 2951,
        rangeMax: 4125,
        rewardsPending: 0,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'ETH',
        note: 'Liquidez retirada',
      },
      {
        id: '#BENJY-2',
        pool: 'XRP/USDT',
        protocol: 'PancakeSwap',
        network: 'BNB',
        liquidity: 0,
        rangeMin: 2.88,
        rangeMax: 3.61,
        rewardsPending: 0,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'XRP',
      },
    ],

    lending: [
      {
        protocol: 'Venus',
        network: 'BNB',
        collateral: [
          { asset: 'XRP', amount: 3711, valueUSD: 5047 },
        ],
        debt: [
          { asset: 'USDT', amount: 1965, valueUSD: 1965 },
        ],
        healthFactor: 1.67,
        liquidationPriceXRP: 0.70,
      },
      {
        protocol: 'Aave V3',
        network: 'Arbitrum',
        collateral: [
          { asset: 'WETH', amount: 2.032, valueUSD: 4174 },
        ],
        debt: [
          { asset: 'USDC', amount: 2292, valueUSD: 2292 },
        ],
        healthFactor: 1.65,
        liquidationPriceETH: 1330,
      },
    ],

    deltas: [],
  },

  {
    id: 'irene',
    name: 'Irene',
    portfolioTotal: 3323,
    pe: 2127,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: null,
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

    wallet: [],

    v3Positions: [
      {
        id: '#IRENE-1',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 2409,
        rangeMin: 2951,
        rangeMax: 4125,
        rewardsPending: 0,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'ETH',
        note: 'Liquidez retirada',
      },
    ],

    lending: [
      {
        protocol: 'Aave V3',
        network: 'Arbitrum',
        collateral: [
          { asset: 'WETH', amount: 2.044, valueUSD: 4198 },
          { asset: 'wstETH', amount: 0.914, valueUSD: 1970 },
        ],
        debt: [
          { asset: 'USDC', amount: 3463, valueUSD: 3463 },
          { asset: 'WETH', amount: 0, valueUSD: 0 },
        ],
        healthFactor: 1.60,
        liquidationPriceETH: 1285,
      },
    ],

    deltas: [],
  },

  {
    id: 'robert',
    name: 'Robert',
    portfolioTotal: 11128,
    pe: 2152,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: null,
    nsEstimado: 1800,
    aprPrevisto: 28,
    diasRestantes: 30,

    wallet: [],

    v3Positions: [
      {
        id: '#ROBERT-1',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 3126,
        rangeMin: 2951,
        rangeMax: 4125,
        rewardsPending: 0,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'ETH',
        note: 'Capital retirado',
      },
      {
        id: '#5025098',
        pool: 'XRP/USDT',
        protocol: 'PancakeSwap',
        network: 'BNB',
        liquidity: 1987,
        rangeMin: 1.20,
        rangeMax: 1.60,
        rewardsPending: 27.20,
        apr: 28,
        fechaApertura: null,
        priceAsset: 'XRP',
        xrpAmount: 1440,
      },
    ],

    lending: [
      {
        protocol: 'Aave V3',
        network: 'Arbitrum',
        collateral: [
          { asset: 'WETH', amount: 5.064, valueUSD: 10401 },
          { asset: 'wstETH', amount: 2.578, valueUSD: 5557 },
        ],
        debt: [
          { asset: 'USDC', amount: 8620, valueUSD: 8620 },
        ],
        healthFactor: 1.69,
        liquidationPriceETH: 1300,
      },
      {
        protocol: 'Aave V3',
        network: 'BNB',
        collateral: [
          { asset: 'WBNB', amount: 6.79, valueUSD: 4196 },
        ],
        debt: [
          { asset: 'USDT', amount: 2036, valueUSD: 2036 },
        ],
        healthFactor: 1.55,
        liquidationPriceBNB: 475,
      },
    ],

    deltas: [],
  },

  {
    id: 'gabi',
    name: 'Gabi',
    portfolioTotal: 17951,
    pe: 2152,
    capitalInicial: null,
    fechaEntrada: null,
    startDate: null,
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

    wallet: [],

    v3Positions: [
      {
        id: '#GABI-1',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 3126,
        rangeMin: 2951,
        rangeMax: 4125,
        rewardsPending: 0,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'ETH',
        note: 'Capital retirado',
      },
      {
        id: '#GABI-2',
        pool: 'XRP/USDT',
        protocol: 'PancakeSwap',
        network: 'BNB',
        liquidity: 0,
        rangeMin: 2.39,
        rangeMax: 3.82,
        rewardsPending: 0,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'XRP',
      },
      {
        id: '#GABI-3',
        pool: 'USDT/WBNB',
        protocol: 'PancakeSwap',
        network: 'BNB',
        liquidity: 0,
        rangeMin: 550,
        rangeMax: 700,
        rewardsPending: 0,
        apr: 0,
        fechaApertura: null,
        priceAsset: 'BNB',
        note: '253 días parada',
      },
    ],

    lending: [
      {
        protocol: 'Aave V3',
        network: 'Arbitrum',
        collateral: [
          { asset: 'WETH', amount: 8.532, valueUSD: 17526 },
          { asset: 'wstETH', amount: 2.52, valueUSD: 5432 },
        ],
        debt: [
          { asset: 'USDC', amount: 15058, valueUSD: 15058 },
        ],
        healthFactor: 1.41,
        liquidationPriceETH: 1340,
      },
      {
        protocol: 'Aave V3',
        network: 'BNB',
        collateral: [
          { asset: 'WBNB', amount: 6.79, valueUSD: 4196 },
        ],
        debt: [
          { asset: 'USDT', amount: 2036, valueUSD: 2036 },
        ],
        healthFactor: 1.55,
        liquidationPriceBNB: 475,
      },
      {
        protocol: 'Venus',
        network: 'BNB',
        collateral: [
          { asset: 'XRP', amount: 5380, valueUSD: 7317 },
        ],
        debt: [
          { asset: 'USDT', amount: 2386, valueUSD: 2386 },
        ],
        healthFactor: 2.00,
        liquidationPriceXRP: 0.59,
      },
    ],

    deltas: [],
  },

  // ── CARMEN ────────────────────────────────────────────────────────────────
  {
    id: 'carmen',
    name: 'Carmen',
    portfolioTotal: 7730,
    pe: null,
    capitalInicial: null,
    fechaEntrada: null,
    // 192 days active as of 2026-04-02 → startDate = 2025-09-22
    startDate: '2025-09-22',
    nsEstimado: 1800,
    aprPrevisto: 40,      // media entre posiciones activas (58.82% en rango)
    diasRestantes: 30,

    wallet: [
      { asset: 'ETH',    amount: 0.0979,   valueUSD: 201.13 },
      { asset: 'WETH',   amount: 0.0075,   valueUSD: 15.49  },
      { asset: 'USDC',   amount: 0.7867,   valueUSD: 0.79   },
      { asset: 'MON',    amount: 1.0000,   valueUSD: 0.02   },
      { asset: 'wstETH', amount: 0.063303, valueUSD: 0.01   },
    ],

    v3Positions: [
      {
        // EN RANGO — Mar 16, 2026
        id: '#5061323',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 5375.58,
        rangeMin: 1900.79,
        rangeMax: 2399.49,
        rewardsPending: 45.69,   // 0.0108 WETH ($22.19) + 23.4946 USDC ($23.50)
        apr: 58.82,
        fechaApertura: '2026-03-16',
        priceAsset: 'ETH',
      },
      {
        // FUERA DE RANGO (precio por debajo del mínimo) — Nov 6, 2025
        id: '#5370493',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 2072.63,
        rangeMin: 2107.00,
        rangeMax: 3703.35,
        rewardsPending: 55.76,   // 0.0134 WETH ($27.55) + 28.2091 USDC ($28.21)
        apr: 23.48,
        fechaApertura: '2025-11-06',
        priceAsset: 'ETH',
      },
      {
        // FUERA DE RANGO — Sep 24, 2025 — rango pendiente de captura
        id: '#4928029',
        pool: 'WETH/USDC',
        protocol: 'Uniswap V3',
        network: 'Arbitrum',
        liquidity: 64.47,
        rangeMin: null,
        rangeMax: null,
        rewardsPending: 0,
        apr: 378.89,
        fechaApertura: '2025-09-24',
        priceAsset: 'ETH',
        note: 'Rango pendiente de actualización',
      },
    ],

    lending: [],   // sin posiciones de lending activas

    deltas: [],
  },
];

// Helper: determine V3 status based on current prices
export function getV3Status(position, prices) {
  // If range is not set yet, treat as OUT_OF_RANGE
  if (position.rangeMin === null || position.rangeMax === null) return 'OUT_OF_RANGE';
  const price = prices[position.priceAsset] || 0;
  if (price === 0) return 'UNKNOWN';
  return price >= position.rangeMin && price <= position.rangeMax ? 'IN_RANGE' : 'OUT_OF_RANGE';
}

// Helper: HF color
export function getHFColor(hf) {
  if (hf >= 2.0) return 'green';
  if (hf >= 1.5) return 'orange';
  return 'red';
}

// Helper: format currency
export function formatUSD(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
}

export function formatUSD2(value) {
  if (value === null || value === undefined) return '—';
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 2 }).format(value);
}

// Helper: days active and days remaining to 365
export function getDaysInfo(startDate) {
  if (!startDate) return { daysActive: null, daysToComplete: null };
  const start = new Date(startDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysActive = Math.floor((today - start) / (1000 * 60 * 60 * 24));
  const daysToComplete = Math.max(0, 365 - daysActive);
  return { daysActive, daysToComplete };
}

// Helper: check if wallet gas is low (ETH or BNB < $15)
export function hasLowGas(wallet) {
  const eth = wallet.find(t => t.asset === 'ETH');
  const bnb = wallet.find(t => t.asset === 'BNB' || t.asset === 'WBNB');
  const ethLow = eth ? eth.valueUSD < 15 : false;
  const bnbLow = bnb ? bnb.valueUSD < 15 : false;
  return { ethLow, bnbLow, anyLow: ethLow || bnbLow };
}

// Compute derived totals for an investor
export function getInvestorSummary(investor, prices) {
  const v3Statuses = investor.v3Positions.map(p => getV3Status(p, prices));
  const activeV3 = investor.v3Positions.filter((p, i) => v3Statuses[i] === 'IN_RANGE');
  const totalRewards = investor.v3Positions.reduce((s, p) => s + (p.rewardsPending || 0), 0);
  const minHF = investor.lending.length > 0
    ? Math.min(...investor.lending.map(l => l.healthFactor))
    : null;

  // Projections
  const activeV3Liquidity = activeV3.reduce((s, p) => s + p.liquidity, 0);
  const rewards30d = activeV3Liquidity * (investor.aprPrevisto / 100) * (30 / 365);
  const rewardsAnnual = activeV3Liquidity * (investor.aprPrevisto / 100);
  const deltaBounty = investor.deltas
    .filter(d => d.status === 'ACTIVO')
    .reduce((s, d) => s + d.ethBorrowed * (d.activationPrice - investor.nsEstimado), 0);
  const grossProfit = rewards30d + deltaBounty;
  const cscFee = grossProfit * 0.5;
  const netProfit = grossProfit * 0.5;

  let status = 'ACTIVO';
  if (minHF !== null && minHF < 1.5) status = 'CRÍTICO';
  else if (minHF !== null && minHF < 2.0) status = 'VIGILANCIA';

  const gasInfo = hasLowGas(investor.wallet || []);

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
    gasAlert: gasInfo.anyLow,
  };
}
