// CSC Dashboard — Investor Data
// ETH: $2,054 | BNB: $618 | XRP: $1.36

export const PRICES = {
  ETH: 2054,
  BNB: 618,
  XRP: 1.36,
  USDC: 1,
  USDT: 1,
  wstETH: 2054 * 1.05, // approximately
  WBNB: 618,
  lastUpdated: '2026-04-02T13:00:00Z',
};

export const investors = [
  {
    id: 'javi',
    name: 'Javi',
    portfolioTotal: 5399,
    pe: 4000,
    peNote: 'ciclo anterior',
    capitalInicial: null,
    fechaEntrada: null,
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

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
          { asset: 'WETH', amount: 2.856, valueUSD: 5866 },
        ],
        debt: [
          { asset: 'USDC', amount: 3294, valueUSD: 3294 },
        ],
        healthFactor: 1.55,
        liquidationPriceETH: 1356,
      },
      {
        protocol: 'Venus',
        network: 'BNB',
        collateral: [
          { asset: 'XRP', amount: 3028, valueUSD: 4118 },
          { asset: 'USDT', amount: 490, valueUSD: 490 },
        ],
        debt: [
          { asset: 'USDT', amount: 2108, valueUSD: 2108 },
        ],
        healthFactor: 1.44,
        liquidationPriceXRP: 0.87,
      },
      {
        protocol: 'Aave V3',
        network: 'BNB',
        collateral: [
          { asset: 'WBNB', amount: 0.2008, valueUSD: 124 },
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
    nsEstimado: 1800,
    aprPrevisto: 30,
    diasRestantes: 30,

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
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

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
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

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
    nsEstimado: 1800,
    aprPrevisto: 28,
    diasRestantes: 30,

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
    nsEstimado: 1800,
    aprPrevisto: 25,
    diasRestantes: 30,

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
];

// Helper: determine V3 status based on current prices
export function getV3Status(position, prices) {
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
  };
}
