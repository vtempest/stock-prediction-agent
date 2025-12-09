import { describe, it, expect, vi, beforeEach } from 'vitest';
import axios from 'axios';
import { executeAnalysisJob } from '../../src/queue/jobs.js';
import { db } from '../../src/db/index.js';
import { trackedStocks, jobHistory, analysisResults } from '../../src/db/schema.js';
import {
  createMockAxios,
  mockPrimoAnalysisResponse,
  mockTradingAnalysisResponse,
  mockJobData,
  mockStock,
} from '../mocks.js';

// Mock axios
vi.mock('axios');

describe('Job Orchestration', () => {
  beforeEach(async () => {
    vi.clearAllMocks();

    // Clean up database
    await db.delete(analysisResults);
    await db.delete(jobHistory);
    await db.delete(trackedStocks);

    // Insert test stock
    await db.insert(trackedStocks).values(mockStock);

    // Setup axios mock
    const mockAxios = createMockAxios();
    vi.mocked(axios.post).mockImplementation(mockAxios.post as any);
  });

  describe('PrimoAgent Analysis', () => {
    it('should execute PrimoAgent analysis successfully', async () => {
      const result = await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'primo',
        date: '2024-12-04',
      });

      expect(result.source).toBe('primo');
      expect(result.symbol).toBe('AAPL');
      expect(result.analysis).toBeDefined();
      expect(result.analysis.recommendation).toBe('BUY');
      expect(result.analysis.confidence).toBe(0.85);

      // Verify API was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('8002/analyze'),
        expect.objectContaining({
          symbols: ['AAPL'],
          date: '2024-12-04',
        }),
        expect.any(Object)
      );
    });

    it('should save PrimoAgent results to database', async () => {
      await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'primo',
        date: '2024-12-04',
      });

      const results = await db.query.analysisResults.findMany({
        where: (results, { eq }) => eq(results.symbol, 'AAPL'),
      });

      expect(results).toHaveLength(1);
      expect(results[0].source).toBe('primo');
      expect(results[0].recommendation).toBe('BUY');
    });
  });

  describe('TradingAgents Analysis', () => {
    it('should execute TradingAgents analysis successfully', async () => {
      const result = await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'trading',
        date: '2024-12-04',
      });

      expect(result.source).toBe('trading');
      expect(result.symbol).toBe('AAPL');
      expect(result.decision).toBeDefined();
      expect(result.decision.action).toBe('BUY');
      expect(result.decision.confidence).toBe(0.82);

      // Verify API was called correctly
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('8001/analyze'),
        expect.objectContaining({
          symbol: 'AAPL',
          date: '2024-12-04',
          max_debate_rounds: 2,
        }),
        expect.any(Object)
      );
    });

    it('should save TradingAgents results to database', async () => {
      await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'trading',
        date: '2024-12-04',
      });

      const results = await db.query.analysisResults.findMany({
        where: (results, { eq }) => eq(results.symbol, 'AAPL'),
      });

      expect(results).toHaveLength(1);
      expect(results[0].source).toBe('trading');
      expect(results[0].recommendation).toBe('BUY');
      expect(results[0].riskLevel).toBe('moderate');
    });
  });

  describe('Consensus Analysis', () => {
    it('should execute consensus analysis with both bots', async () => {
      const result = await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'consensus',
        date: '2024-12-04',
      });

      expect(result.source).toBe('consensus');
      expect(result.symbol).toBe('AAPL');
      expect(result.consensus).toBeDefined();

      // Should have called both APIs
      expect(axios.post).toHaveBeenCalledTimes(2);
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('8002/analyze'),
        expect.any(Object),
        expect.any(Object)
      );
      expect(axios.post).toHaveBeenCalledWith(
        expect.stringContaining('8001/analyze'),
        expect.any(Object),
        expect.any(Object)
      );
    });

    it('should calculate consensus when both agree', async () => {
      const result = await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'consensus',
        date: '2024-12-04',
      });

      expect(result.consensus.decision).toBe('BUY');
      expect(result.consensus.agreement).toBe(true);
      expect(result.consensus.strength).toBeGreaterThan(0.8);
    });

    it('should save all three analyses to database', async () => {
      await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'consensus',
        date: '2024-12-04',
      });

      const results = await db.query.analysisResults.findMany({
        where: (results, { eq }) => eq(results.symbol, 'AAPL'),
      });

      // Should have saved: primo, trading, and consensus
      expect(results).toHaveLength(3);

      const sources = results.map((r) => r.source).sort();
      expect(sources).toEqual(['consensus', 'primo', 'trading']);
    });

    it('should handle disagreement between bots', async () => {
      // Mock disagreement
      vi.mocked(axios.post).mockImplementation(((url: string) => {
        if (url.includes('8002')) {
          return Promise.resolve({
            data: {
              ...mockPrimoAnalysisResponse,
              result: {
                analyses: {
                  AAPL: {
                    ...mockPrimoAnalysisResponse.result.analyses.AAPL,
                    recommendation: 'SELL',
                    confidence: 0.75,
                  },
                },
              },
            },
          });
        } else {
          return Promise.resolve({
            data: {
              ...mockTradingAnalysisResponse,
              decision: {
                ...mockTradingAnalysisResponse.decision,
                action: 'BUY',
                confidence: 0.85,
              },
            },
          });
        }
      }) as any);

      const result = await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'consensus',
        date: '2024-12-04',
      });

      expect(result.consensus.agreement).toBe(false);
      // Should pick the higher confidence
      expect(result.consensus.decision).toBe('BUY');
      expect(result.consensus.strength).toBeLessThan(0.85);
    });
  });

  describe('Job Error Handling', () => {
    it('should handle API failures gracefully', async () => {
      vi.mocked(axios.post).mockRejectedValue(new Error('API timeout'));

      await expect(
        executeAnalysisJob({
          symbol: 'AAPL',
          jobType: 'primo',
          date: '2024-12-04',
        })
      ).rejects.toThrow('API timeout');

      // Check that failure was recorded
      const jobs = await db.query.jobHistory.findMany({
        where: (jobs, { eq }) => eq(jobs.symbol, 'AAPL'),
      });

      expect(jobs.length).toBeGreaterThan(0);
      expect(jobs[0].status).toBe('failed');
      expect(jobs[0].error).toContain('API timeout');
    });

    it('should update stock failure count on error', async () => {
      vi.mocked(axios.post).mockRejectedValue(new Error('API error'));

      try {
        await executeAnalysisJob({
          symbol: 'AAPL',
          jobType: 'primo',
          date: '2024-12-04',
        });
      } catch (error) {
        // Expected
      }

      const stock = await db.query.trackedStocks.findFirst({
        where: (stocks, { eq }) => eq(stocks.symbol, 'AAPL'),
      });

      expect(stock?.failureCount).toBeGreaterThan(0);
    });
  });

  describe('Stock Statistics Updates', () => {
    it('should update success count and average duration', async () => {
      await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'primo',
        date: '2024-12-04',
      });

      const stock = await db.query.trackedStocks.findFirst({
        where: (stocks, { eq }) => eq(stocks.symbol, 'AAPL'),
      });

      expect(stock?.analysisCount).toBe(1);
      expect(stock?.successCount).toBe(1);
      expect(stock?.avgDuration).toBeGreaterThan(0);
      expect(stock?.lastAnalyzed).toBeDefined();
    });

    it('should calculate rolling average duration', async () => {
      // First analysis
      await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'primo',
        date: '2024-12-04',
      });

      const stock1 = await db.query.trackedStocks.findFirst({
        where: (stocks, { eq }) => eq(stocks.symbol, 'AAPL'),
      });

      const firstDuration = stock1!.avgDuration!;

      // Second analysis
      await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'primo',
        date: '2024-12-05',
      });

      const stock2 = await db.query.trackedStocks.findFirst({
        where: (stocks, { eq }) => eq(stocks.symbol, 'AAPL'),
      });

      expect(stock2?.analysisCount).toBe(2);
      expect(stock2?.avgDuration).toBeDefined();
      // Average should be reasonable
      expect(stock2!.avgDuration!).toBeGreaterThan(0);
    });
  });

  describe('Alert Generation', () => {
    it('should create alert for high confidence BUY', async () => {
      await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'primo',
        date: '2024-12-04',
      });

      const alerts = await db.query.alerts.findMany({
        where: (alerts, { eq }) => eq(alerts.symbol, 'AAPL'),
      });

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].alertType).toBe('high_confidence');
      expect(alerts[0].severity).toBe('warning');
    });

    it('should create alert for consensus agreement', async () => {
      await executeAnalysisJob({
        symbol: 'AAPL',
        jobType: 'consensus',
        date: '2024-12-04',
      });

      const alerts = await db.query.alerts.findMany({
        where: (alerts, { eq }) => eq(alerts.symbol, 'AAPL'),
      });

      const consensusAlert = alerts.find((a) => a.alertType === 'consensus_agreement');
      expect(consensusAlert).toBeDefined();
      expect(consensusAlert?.message).toContain('Both agents agree');
    });
  });
});
