import { vi } from 'vitest';

/**
 * Mock responses for PrimoAgent API
 */
export const mockPrimoAnalysisResponse = {
  success: true,
  result: {
    analyses: {
      AAPL: {
        recommendation: 'BUY',
        confidence: 0.85,
        price_target: 185.50,
        technical_analysis: {
          trend: 'bullish',
          support: 175.00,
          resistance: 190.00,
          rsi: 65,
          macd: 'positive',
        },
        fundamental_analysis: {
          pe_ratio: 28.5,
          revenue_growth: 0.12,
          earnings_trend: 'positive',
          valuation: 'fair',
        },
        risk_factors: ['market_volatility', 'sector_rotation'],
      },
    },
  },
};

/**
 * Mock responses for TradingAgents API
 */
export const mockTradingAnalysisResponse = {
  success: true,
  decision: {
    action: 'BUY',
    confidence: 0.82,
    analysis: {
      technical: {
        trend: 'bullish',
        indicators: {
          rsi: 65,
          macd: 'positive',
          moving_averages: 'golden_cross',
        },
      },
      fundamental: {
        pe_ratio: 28.5,
        revenue_growth: 0.12,
        earnings_trend: 'positive',
      },
      sentiment: {
        news: 0.65,
        social_media: 0.72,
      },
    },
    risk_assessment: {
      level: 'moderate',
      factors: ['volatility', 'market_conditions'],
    },
    recommendation: {
      position_size: 0.15,
      stop_loss: 170.50,
      take_profit: 195.00,
    },
  },
};

/**
 * Mock backtest results from PrimoAgent
 */
export const mockBacktestResponse = {
  success: true,
  symbol: 'AAPL',
  primo_results: {
    'Cumulative Return [%]': 45.2,
    'Annual Volatility [%]': 22.5,
    'Max Drawdown [%]': -12.3,
    'Sharpe Ratio': 1.85,
    'Total Trades': 24,
    'Win Rate [%]': 62.5,
    'Avg Trade Return [%]': 1.88,
  },
  buyhold_results: {
    'Cumulative Return [%]': 38.7,
    'Annual Volatility [%]': 25.1,
    'Max Drawdown [%]': -15.8,
    'Sharpe Ratio': 1.42,
    'Total Trades': 2,
    'Win Rate [%]': 50.0,
    'Avg Trade Return [%]': 19.35,
  },
  comparison: {
    relative_return: 6.5,
    outperformed: true,
    metrics: {
      cumulative_return_diff: 6.5,
      volatility_diff: -2.6,
      max_drawdown_diff: 3.5,
      sharpe_diff: 0.43,
    },
  },
  timestamp: new Date().toISOString(),
};

/**
 * Create mock axios instance
 */
export function createMockAxios() {
  return {
    post: vi.fn((url: string, data: any) => {
      if (url.includes('8002/analyze')) {
        // PrimoAgent analyze
        return Promise.resolve({ data: mockPrimoAnalysisResponse });
      } else if (url.includes('8002/backtest')) {
        // PrimoAgent backtest
        return Promise.resolve({ data: mockBacktestResponse });
      } else if (url.includes('8001/analyze')) {
        // TradingAgents analyze
        return Promise.resolve({ data: mockTradingAnalysisResponse });
      }
      return Promise.reject(new Error('Unknown endpoint'));
    }),
    get: vi.fn(),
  };
}

/**
 * Mock job data for testing
 */
export const mockJobData = {
  symbol: 'AAPL',
  date: '2024-12-04',
  jobType: 'consensus' as const,
  priority: 8,
};

/**
 * Mock analysis results for database
 */
export const mockAnalysisResult = {
  symbol: 'AAPL',
  date: '2024-12-04',
  source: 'consensus',
  recommendation: 'BUY',
  confidence: 0.85,
  priceTarget: 185.50,
  riskLevel: 'moderate',
  analysis: JSON.stringify({
    decision: 'BUY',
    strength: 0.85,
    agreement: true,
  }),
};

/**
 * Mock stock data
 */
export const mockStock = {
  symbol: 'AAPL',
  name: 'Apple Inc.',
  sector: 'Technology',
  enabled: true,
  priority: 8,
  analysisCount: 0,
  successCount: 0,
  failureCount: 0,
};

/**
 * Helper to generate historical price data for backtesting
 */
export function generateMockPriceData(
  symbol: string,
  days: number = 30,
  startPrice: number = 100
) {
  const data = [];
  let price = startPrice;

  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - i));

    // Random walk with slight upward bias
    const change = (Math.random() - 0.45) * 2;
    price = price * (1 + change / 100);

    data.push({
      date: date.toISOString().split('T')[0],
      open: price,
      high: price * 1.02,
      low: price * 0.98,
      close: price,
      volume: Math.floor(Math.random() * 10000000) + 5000000,
    });
  }

  return data;
}

/**
 * Mock trading strategy backtest results
 */
export function generateMockBacktestReport(symbol: string) {
  const priceData = generateMockPriceData(symbol, 90);
  const trades = generateMockTrades(priceData);

  return {
    symbol,
    period: {
      start: priceData[0].date,
      end: priceData[priceData.length - 1].date,
      tradingDays: priceData.length,
    },
    performance: {
      totalReturn: 45.2,
      annualizedReturn: 182.3,
      sharpeRatio: 1.85,
      maxDrawdown: -12.3,
      volatility: 22.5,
      winRate: 62.5,
    },
    trades: {
      total: trades.length,
      winners: trades.filter((t) => t.return > 0).length,
      losers: trades.filter((t) => t.return < 0).length,
      avgReturn: trades.reduce((sum, t) => sum + t.return, 0) / trades.length,
      avgWinner:
        trades.filter((t) => t.return > 0).reduce((sum, t) => sum + t.return, 0) /
        trades.filter((t) => t.return > 0).length,
      avgLoser:
        trades.filter((t) => t.return < 0).reduce((sum, t) => sum + t.return, 0) /
        trades.filter((t) => t.return < 0).length,
      largestWin: Math.max(...trades.map((t) => t.return)),
      largestLoss: Math.min(...trades.map((t) => t.return)),
    },
    tradeList: trades,
    comparison: {
      strategy: 'AI Consensus Strategy',
      benchmark: 'Buy & Hold',
      outperformance: 6.5,
      betterSharpe: true,
      lowerDrawdown: true,
    },
  };
}

function generateMockTrades(priceData: any[]) {
  const trades = [];
  let position = null;

  for (let i = 10; i < priceData.length - 1; i++) {
    // Simple strategy: buy on uptrend, sell on downtrend
    const ma5 =
      priceData.slice(i - 5, i).reduce((sum, d) => sum + d.close, 0) / 5;
    const ma10 =
      priceData.slice(i - 10, i).reduce((sum, d) => sum + d.close, 0) / 10;

    if (!position && ma5 > ma10) {
      // Buy signal
      position = {
        type: 'BUY',
        entryDate: priceData[i].date,
        entryPrice: priceData[i].close,
        confidence: 0.75 + Math.random() * 0.2,
      };
    } else if (position && ma5 < ma10) {
      // Sell signal
      const exitPrice = priceData[i].close;
      const returnPct =
        ((exitPrice - position.entryPrice) / position.entryPrice) * 100;

      trades.push({
        entryDate: position.entryDate,
        entryPrice: position.entryPrice,
        exitDate: priceData[i].date,
        exitPrice,
        return: returnPct,
        holdingPeriod: i - priceData.findIndex((d) => d.date === position.entryDate),
        confidence: position.confidence,
      });

      position = null;
    }
  }

  return trades;
}
