import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';
import { db } from '../../src/db/index.js';
import { trackedStocks, analysisResults, jobHistory } from '../../src/db/schema.js';
import { executeAnalysisJob } from '../../src/queue/jobs.js';
import {
  createMockAxios,
  mockBacktestResponse,
  generateMockBacktestReport,
  generateMockPriceData,
  mockStock,
} from '../mocks.js';

// Mock axios
vi.mock('axios');

describe('Trading Strategy Orchestration and Backtesting', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Clean database
    await db.delete(analysisResults);
    await db.delete(jobHistory);
    await db.delete(trackedStocks);

    // Setup axios mock
    const mockAxios = createMockAxios();
    vi.mocked(axios.post).mockImplementation(mockAxios.post as any);

    // Add test stock
    await db.insert(trackedStocks).values(mockStock);
  });

  describe('Complete Trading Strategy Workflow', () => {
    it('should orchestrate a complete trading strategy from analysis to execution', async () => {
      const symbol = 'AAPL';
      const date = '2024-12-04';

      // Step 1: Run consensus analysis
      const analysisResult = await executeAnalysisJob({
        symbol,
        jobType: 'consensus',
        date,
      });

      // Verify consensus was calculated
      expect(analysisResult.source).toBe('consensus');
      expect(analysisResult.consensus).toBeDefined();
      expect(analysisResult.consensus.decision).toBe('BUY');
      expect(analysisResult.consensus.agreement).toBe(true);

      // Verify both underlying analyses exist
      const allResults = await db.query.analysisResults.findMany({
        where: (results, { eq, and }) =>
          and(eq(results.symbol, symbol), eq(results.date, date)),
      });

      // Should have: primo, trading, consensus
      expect(allResults).toHaveLength(3);

      const resultSources = allResults.map((r) => r.source).sort();
      expect(resultSources).toEqual(['consensus', 'primo', 'trading']);

      // Step 2: Verify job was tracked
      const jobs = await db.query.jobHistory.findMany({
        where: (jobs, { eq }) => eq(jobs.symbol, symbol),
      });

      expect(jobs.length).toBeGreaterThan(0);
      const completedJobs = jobs.filter((j) => j.status === 'completed');
      expect(completedJobs.length).toBeGreaterThan(0);

      // Step 3: Verify stock statistics were updated
      const stock = await db.query.trackedStocks.findFirst({
        where: (stocks, { eq }) => eq(stocks.symbol, symbol),
      });

      expect(stock?.analysisCount).toBeGreaterThan(0);
      expect(stock?.successCount).toBeGreaterThan(0);
      expect(stock?.lastAnalyzed).toBeDefined();

      // Step 4: Verify alerts were created
      const alerts = await db.query.alerts.findMany({
        where: (alerts, { eq }) => eq(alerts.symbol, symbol),
      });

      expect(alerts.length).toBeGreaterThan(0);

      // Should have high confidence alert
      const highConfAlert = alerts.find((a) => a.alertType === 'high_confidence');
      expect(highConfAlert).toBeDefined();

      // Should have consensus agreement alert
      const consensusAlert = alerts.find((a) => a.alertType === 'consensus_agreement');
      expect(consensusAlert).toBeDefined();
    });

    it('should generate comprehensive trading strategy report', async () => {
      const symbol = 'AAPL';

      // Run analysis for multiple days to build history
      const dates = ['2024-12-01', '2024-12-02', '2024-12-03', '2024-12-04'];

      for (const date of dates) {
        await executeAnalysisJob({
          symbol,
          jobType: 'consensus',
          date,
        });
      }

      // Fetch all results
      const results = await db.query.analysisResults.findMany({
        where: (results, { eq }) => eq(results.symbol, symbol),
      });

      // Group by date
      const resultsByDate = results.reduce((acc, result) => {
        if (!acc[result.date]) {
          acc[result.date] = [];
        }
        acc[result.date].push(result);
        return acc;
      }, {} as Record<string, typeof results>);

      // Generate strategy report
      const strategyReport = {
        symbol,
        period: {
          start: dates[0],
          end: dates[dates.length - 1],
          tradingDays: dates.length,
        },
        analyses: resultsByDate,
        summary: {
          totalAnalyses: results.length,
          consensusAnalyses: results.filter((r) => r.source === 'consensus').length,
          recommendations: results
            .filter((r) => r.source === 'consensus')
            .map((r) => ({
              date: r.date,
              recommendation: r.recommendation,
              confidence: r.confidence,
            })),
          avgConfidence:
            results
              .filter((r) => r.source === 'consensus')
              .reduce((sum, r) => sum + r.confidence, 0) /
            results.filter((r) => r.source === 'consensus').length,
          recommendationCounts: results
            .filter((r) => r.source === 'consensus')
            .reduce((acc, r) => {
              acc[r.recommendation] = (acc[r.recommendation] || 0) + 1;
              return acc;
            }, {} as Record<string, number>),
        },
      };

      // Verify report structure
      expect(strategyReport.period.tradingDays).toBe(4);
      expect(strategyReport.summary.consensusAnalyses).toBe(4);
      expect(strategyReport.summary.avgConfidence).toBeGreaterThan(0);
      expect(strategyReport.summary.recommendations).toHaveLength(4);

      // All consensus recommendations should be BUY (based on mock)
      expect(
        strategyReport.summary.recommendations.every((r) => r.recommendation === 'BUY')
      ).toBe(true);
    });
  });

  describe('Backtesting Integration', () => {
    it('should fetch and process backtest results from PrimoAgent', async () => {
      const symbol = 'AAPL';

      // Mock backtest endpoint
      vi.mocked(axios.post).mockImplementation(((url: string, data: any) => {
        if (url.includes('backtest')) {
          return Promise.resolve({ data: mockBacktestResponse });
        }
        return createMockAxios().post(url, data);
      }) as any);

      // Simulate fetching backtest results
      const backtestResponse = await axios.post(
        'http://localhost:8002/backtest',
        {
          symbol,
          data_dir: './output/csv',
          printlog: false,
        },
        { timeout: 300000 }
      );

      const backtest = backtestResponse.data;

      expect(backtest.success).toBe(true);
      expect(backtest.symbol).toBe(symbol);
      expect(backtest.primo_results).toBeDefined();
      expect(backtest.buyhold_results).toBeDefined();
      expect(backtest.comparison).toBeDefined();

      // Verify performance metrics
      expect(backtest.primo_results['Cumulative Return [%]']).toBe(45.2);
      expect(backtest.primo_results['Sharpe Ratio']).toBe(1.85);
      expect(backtest.comparison.outperformed).toBe(true);
    });

    it('should generate comprehensive backtest report with trades', () => {
      const symbol = 'AAPL';
      const report = generateMockBacktestReport(symbol);

      // Verify report structure
      expect(report.symbol).toBe(symbol);
      expect(report.period).toBeDefined();
      expect(report.period.tradingDays).toBe(90);

      // Verify performance metrics
      expect(report.performance.totalReturn).toBeGreaterThan(0);
      expect(report.performance.sharpeRatio).toBeGreaterThan(0);
      expect(report.performance.maxDrawdown).toBeLessThan(0);
      expect(report.performance.winRate).toBeGreaterThan(0);
      expect(report.performance.winRate).toBeLessThanOrEqual(100);

      // Verify trade statistics
      expect(report.trades.total).toBeGreaterThan(0);
      expect(report.trades.winners).toBeGreaterThanOrEqual(0);
      expect(report.trades.losers).toBeGreaterThanOrEqual(0);
      expect(report.trades.winners + report.trades.losers).toBe(report.trades.total);

      // Verify win rate calculation
      const calculatedWinRate = (report.trades.winners / report.trades.total) * 100;
      expect(Math.abs(calculatedWinRate - report.performance.winRate)).toBeLessThan(0.1);

      // Verify trade list exists
      expect(report.tradeList).toHaveLength(report.trades.total);

      // Verify each trade has required fields
      report.tradeList.forEach((trade) => {
        expect(trade.entryDate).toBeDefined();
        expect(trade.entryPrice).toBeGreaterThan(0);
        expect(trade.exitDate).toBeDefined();
        expect(trade.exitPrice).toBeGreaterThan(0);
        expect(trade.return).toBeDefined();
        expect(trade.holdingPeriod).toBeGreaterThan(0);
        expect(trade.confidence).toBeGreaterThan(0);
        expect(trade.confidence).toBeLessThanOrEqual(1);
      });

      // Verify comparison with benchmark
      expect(report.comparison.strategy).toBe('AI Consensus Strategy');
      expect(report.comparison.benchmark).toBe('Buy & Hold');
      expect(report.comparison.outperformance).toBeGreaterThan(0);
    });

    it('should validate backtest report against strategy signals', async () => {
      const symbol = 'AAPL';

      // Step 1: Generate strategy signals
      const analysisDate = '2024-12-04';
      await executeAnalysisJob({
        symbol,
        jobType: 'consensus',
        date: analysisDate,
      });

      const consensusResult = await db.query.analysisResults.findFirst({
        where: (results, { eq, and }) =>
          and(
            eq(results.symbol, symbol),
            eq(results.source, 'consensus'),
            eq(results.date, analysisDate)
          ),
      });

      expect(consensusResult).toBeDefined();
      expect(consensusResult?.recommendation).toBe('BUY');

      // Step 2: Generate backtest report
      const backtestReport = generateMockBacktestReport(symbol);

      // Step 3: Validate that strategy would generate trades
      expect(backtestReport.trades.total).toBeGreaterThan(0);

      // Step 4: Check if there are winning trades (strategy should work)
      expect(backtestReport.trades.winners).toBeGreaterThan(0);
      expect(backtestReport.performance.winRate).toBeGreaterThan(50);

      // Step 5: Verify risk-adjusted returns
      expect(backtestReport.performance.sharpeRatio).toBeGreaterThan(1.0);

      // Step 6: Verify outperformance vs benchmark
      expect(backtestReport.comparison.outperformance).toBeGreaterThan(0);
      expect(backtestReport.comparison.betterSharpe).toBe(true);
    });

    it('should calculate realistic trading metrics from price data', () => {
      const priceData = generateMockPriceData('AAPL', 90, 150);

      expect(priceData).toHaveLength(90);

      // Verify price data structure
      priceData.forEach((day) => {
        expect(day.date).toBeDefined();
        expect(day.open).toBeGreaterThan(0);
        expect(day.high).toBeGreaterThanOrEqual(day.open);
        expect(day.low).toBeLessThanOrEqual(day.open);
        expect(day.close).toBeGreaterThan(0);
        expect(day.volume).toBeGreaterThan(0);
      });

      // Calculate basic metrics
      const firstPrice = priceData[0].close;
      const lastPrice = priceData[priceData.length - 1].close;
      const totalReturn = ((lastPrice - firstPrice) / firstPrice) * 100;

      // Calculate volatility (standard deviation of returns)
      const returns = [];
      for (let i = 1; i < priceData.length; i++) {
        const dailyReturn =
          ((priceData[i].close - priceData[i - 1].close) / priceData[i - 1].close) * 100;
        returns.push(dailyReturn);
      }

      const avgReturn = returns.reduce((sum, r) => sum + r, 0) / returns.length;
      const variance =
        returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / returns.length;
      const volatility = Math.sqrt(variance);

      expect(volatility).toBeGreaterThan(0);
      expect(volatility).toBeLessThan(10); // Daily volatility should be reasonable

      // Annualized metrics
      const annualizedReturn = totalReturn * (252 / 90);
      const annualizedVolatility = volatility * Math.sqrt(252);

      expect(annualizedVolatility).toBeGreaterThan(0);

      // Sharpe ratio (assuming 2% risk-free rate)
      const riskFreeRate = 2;
      const sharpeRatio = (annualizedReturn - riskFreeRate) / annualizedVolatility;

      expect(sharpeRatio).toBeDefined();
    });
  });

  describe('Multi-Stock Portfolio Strategy', () => {
    it('should orchestrate strategy for multiple stocks', async () => {
      const symbols = ['AAPL', 'GOOGL', 'MSFT'];
      const date = '2024-12-04';

      // Add all stocks
      for (const symbol of symbols.slice(1)) {
        await db.insert(trackedStocks).values({
          ...mockStock,
          symbol,
        });
      }

      // Run consensus analysis for all stocks
      const results = [];
      for (const symbol of symbols) {
        const result = await executeAnalysisJob({
          symbol,
          jobType: 'consensus',
          date,
        });
        results.push(result);
      }

      // Verify all analyses completed
      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.source).toBe('consensus');
        expect(result.consensus).toBeDefined();
      });

      // Fetch all results from database
      const allResults = await db.query.analysisResults.findMany({
        where: (results, { eq }) => eq(results.date, date),
      });

      // Should have 9 results (3 stocks × 3 sources each)
      expect(allResults).toHaveLength(9);

      // Group by symbol
      const bySymbol = allResults.reduce((acc, result) => {
        if (!acc[result.symbol]) {
          acc[result.symbol] = [];
        }
        acc[result.symbol].push(result);
        return acc;
      }, {} as Record<string, typeof allResults>);

      // Each symbol should have 3 analyses
      expect(Object.keys(bySymbol)).toHaveLength(3);
      Object.values(bySymbol).forEach((symbolResults) => {
        expect(symbolResults).toHaveLength(3);
      });

      // Generate portfolio report
      const portfolioReport = {
        date,
        symbols,
        analyses: bySymbol,
        summary: {
          totalStocks: symbols.length,
          buySignals: Object.values(bySymbol).filter(
            (results) =>
              results.find((r) => r.source === 'consensus')?.recommendation === 'BUY'
          ).length,
          sellSignals: Object.values(bySymbol).filter(
            (results) =>
              results.find((r) => r.source === 'consensus')?.recommendation === 'SELL'
          ).length,
          holdSignals: Object.values(bySymbol).filter(
            (results) =>
              results.find((r) => r.source === 'consensus')?.recommendation === 'HOLD'
          ).length,
          avgConfidence:
            Object.values(bySymbol).reduce(
              (sum, results) =>
                sum + (results.find((r) => r.source === 'consensus')?.confidence || 0),
              0
            ) / symbols.length,
          highConfidenceStocks: Object.entries(bySymbol)
            .filter(
              ([_, results]) =>
                (results.find((r) => r.source === 'consensus')?.confidence || 0) >= 0.8
            )
            .map(([symbol]) => symbol),
        },
      };

      expect(portfolioReport.summary.totalStocks).toBe(3);
      expect(portfolioReport.summary.avgConfidence).toBeGreaterThan(0);
      expect(portfolioReport.summary.highConfidenceStocks.length).toBeGreaterThan(0);
    });
  });

  describe('Performance Benchmarking', () => {
    it('should measure job execution performance', async () => {
      const symbol = 'AAPL';
      const date = '2024-12-04';

      const startTime = Date.now();

      await executeAnalysisJob({
        symbol,
        jobType: 'consensus',
        date,
      });

      const duration = Date.now() - startTime;

      // Verify job was recorded with duration
      const job = await db.query.jobHistory.findFirst({
        where: (jobs, { eq }) => eq(jobs.symbol, symbol),
      });

      expect(job?.duration).toBeDefined();
      expect(job?.duration).toBeGreaterThan(0);
      expect(job?.duration).toBeLessThan(30000); // Should complete within 30 seconds

      // Verify stock stats were updated with duration
      const stock = await db.query.trackedStocks.findFirst({
        where: (stocks, { eq }) => eq(stocks.symbol, symbol),
      });

      expect(stock?.avgDuration).toBeDefined();
      expect(stock?.avgDuration).toBeGreaterThan(0);
    });
  });
});
