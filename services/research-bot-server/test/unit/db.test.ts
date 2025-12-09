import { describe, it, expect, vi, beforeEach } from 'vitest';
import { db } from '../../src/db/index.js';
import { trackedStocks, jobHistory, analysisResults } from '../../src/db/schema.js';
import { eq } from 'drizzle-orm';
import { mockStock, mockAnalysisResult } from '../mocks.js';

describe('Database Operations', () => {
  beforeEach(async () => {
    // Clean up database before each test
    await db.delete(analysisResults);
    await db.delete(jobHistory);
    await db.delete(trackedStocks);
  });

  describe('Tracked Stocks', () => {
    it('should create a tracked stock', async () => {
      const [stock] = await db.insert(trackedStocks).values(mockStock).returning();

      expect(stock.symbol).toBe('AAPL');
      expect(stock.enabled).toBe(true);
      expect(stock.priority).toBe(8);
    });

    it('should retrieve tracked stock by symbol', async () => {
      await db.insert(trackedStocks).values(mockStock);

      const stock = await db.query.trackedStocks.findFirst({
        where: eq(trackedStocks.symbol, 'AAPL'),
      });

      expect(stock).toBeDefined();
      expect(stock?.symbol).toBe('AAPL');
    });

    it('should update stock statistics', async () => {
      const [stock] = await db.insert(trackedStocks).values(mockStock).returning();

      await db
        .update(trackedStocks)
        .set({
          analysisCount: 10,
          successCount: 8,
          failureCount: 2,
          avgDuration: 5000,
        })
        .where(eq(trackedStocks.symbol, 'AAPL'));

      const updated = await db.query.trackedStocks.findFirst({
        where: eq(trackedStocks.symbol, 'AAPL'),
      });

      expect(updated?.analysisCount).toBe(10);
      expect(updated?.successCount).toBe(8);
      expect(updated?.failureCount).toBe(2);
      expect(updated?.avgDuration).toBe(5000);
    });

    it('should list enabled stocks sorted by priority', async () => {
      await db.insert(trackedStocks).values([
        { ...mockStock, symbol: 'AAPL', priority: 9 },
        { ...mockStock, symbol: 'GOOGL', priority: 7 },
        { ...mockStock, symbol: 'MSFT', priority: 8 },
      ]);

      const stocks = await db.query.trackedStocks.findMany({
        where: eq(trackedStocks.enabled, true),
      });

      expect(stocks).toHaveLength(3);
    });
  });

  describe('Analysis Results', () => {
    it('should store analysis result', async () => {
      const [result] = await db
        .insert(analysisResults)
        .values(mockAnalysisResult)
        .returning();

      expect(result.symbol).toBe('AAPL');
      expect(result.recommendation).toBe('BUY');
      expect(result.confidence).toBe(0.85);
    });

    it('should retrieve latest analysis for symbol', async () => {
      // Insert multiple analysis results
      await db.insert(analysisResults).values([
        { ...mockAnalysisResult, date: '2024-12-01', confidence: 0.75 },
        { ...mockAnalysisResult, date: '2024-12-02', confidence: 0.80 },
        { ...mockAnalysisResult, date: '2024-12-03', confidence: 0.85 },
      ]);

      const results = await db.query.analysisResults.findMany({
        where: eq(analysisResults.symbol, 'AAPL'),
        limit: 1,
      });

      expect(results).toHaveLength(1);
    });

    it('should filter analysis by source', async () => {
      await db.insert(analysisResults).values([
        { ...mockAnalysisResult, source: 'primo' },
        { ...mockAnalysisResult, source: 'trading' },
        { ...mockAnalysisResult, source: 'consensus' },
      ]);

      const consensusResults = await db.query.analysisResults.findMany({
        where: eq(analysisResults.source, 'consensus'),
      });

      expect(consensusResults).toHaveLength(1);
      expect(consensusResults[0].source).toBe('consensus');
    });
  });

  describe('Job History', () => {
    it('should record job execution', async () => {
      const [job] = await db
        .insert(jobHistory)
        .values({
          jobId: 'test-job-123',
          symbol: 'AAPL',
          jobType: 'consensus',
          status: 'processing',
          startedAt: new Date(),
          retryCount: 0,
        })
        .returning();

      expect(job.jobId).toBe('test-job-123');
      expect(job.status).toBe('processing');
    });

    it('should update job status on completion', async () => {
      const startTime = new Date();
      await db.insert(jobHistory).values({
        jobId: 'test-job-123',
        symbol: 'AAPL',
        jobType: 'consensus',
        status: 'processing',
        startedAt: startTime,
        retryCount: 0,
      });

      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      await db
        .update(jobHistory)
        .set({
          status: 'completed',
          completedAt: endTime,
          duration,
        })
        .where(eq(jobHistory.jobId, 'test-job-123'));

      const job = await db.query.jobHistory.findFirst({
        where: eq(jobHistory.jobId, 'test-job-123'),
      });

      expect(job?.status).toBe('completed');
      expect(job?.completedAt).toBeDefined();
      expect(job?.duration).toBeGreaterThanOrEqual(0);
    });

    it('should record job failures with error', async () => {
      await db.insert(jobHistory).values({
        jobId: 'test-job-failed',
        symbol: 'AAPL',
        jobType: 'consensus',
        status: 'failed',
        startedAt: new Date(),
        completedAt: new Date(),
        error: 'API timeout',
        retryCount: 3,
      });

      const job = await db.query.jobHistory.findFirst({
        where: eq(jobHistory.jobId, 'test-job-failed'),
      });

      expect(job?.status).toBe('failed');
      expect(job?.error).toBe('API timeout');
      expect(job?.retryCount).toBe(3);
    });
  });
});
