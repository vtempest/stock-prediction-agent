# Research Bot Server Tests

Comprehensive test suite for trading strategy orchestration and backtesting.

## Test Structure

```
test/
├── setup.ts                    # Test environment setup
├── mocks.ts                    # Mock data and helper functions
├── unit/
│   ├── db.test.ts             # Database operations tests
│   └── jobs.test.ts           # Job orchestration unit tests
└── integration/
    └── strategy.test.ts       # End-to-end strategy and backtesting tests
```

## Running Tests

### All Tests
```bash
npm test
```

### Unit Tests Only
```bash
npm run test:unit
```

### Integration Tests Only
```bash
npm run test:integration
```

### Watch Mode (auto-rerun on changes)
```bash
npm run test:watch
```

### Coverage Report
```bash
npm run test:coverage
```

## Test Categories

### 1. Database Tests (`test/unit/db.test.ts`)

Tests for SQLite database operations:
- Creating and retrieving tracked stocks
- Storing analysis results
- Recording job history
- Updating stock statistics
- Filtering and querying data

**Example:**
```typescript
it('should create a tracked stock', async () => {
  const stock = await db.insert(trackedStocks).values({
    symbol: 'AAPL',
    priority: 8,
  });
  expect(stock.symbol).toBe('AAPL');
});
```

### 2. Job Orchestration Tests (`test/unit/jobs.test.ts`)

Tests for job execution and orchestration:
- PrimoAgent API integration
- TradingAgents API integration
- Consensus calculation
- Error handling and retries
- Alert generation
- Stock statistics updates

**Example:**
```typescript
it('should execute consensus analysis with both bots', async () => {
  const result = await executeAnalysisJob({
    symbol: 'AAPL',
    jobType: 'consensus',
  });

  expect(result.consensus.agreement).toBe(true);
  expect(result.consensus.decision).toBe('BUY');
});
```

### 3. Trading Strategy Integration Tests (`test/integration/strategy.test.ts`)

End-to-end tests for complete trading workflows:

#### Complete Strategy Workflow
Tests the full pipeline from analysis to execution:
```typescript
it('should orchestrate a complete trading strategy', async () => {
  // 1. Run consensus analysis
  const result = await executeAnalysisJob({
    symbol: 'AAPL',
    jobType: 'consensus',
    date: '2024-12-04',
  });

  // 2. Verify job tracking
  // 3. Check stock statistics
  // 4. Validate alerts
  // All in one comprehensive test
});
```

#### Backtest Report Generation
Tests backtest report creation with realistic trading data:
```typescript
it('should generate comprehensive backtest report with trades', () => {
  const report = generateMockBacktestReport('AAPL');

  expect(report.performance.totalReturn).toBeGreaterThan(0);
  expect(report.performance.sharpeRatio).toBeGreaterThan(1.0);
  expect(report.trades.total).toBeGreaterThan(0);
  expect(report.trades.winRate).toBeGreaterThan(50);
});
```

#### Multi-Stock Portfolio
Tests strategy orchestration across multiple stocks:
```typescript
it('should orchestrate strategy for multiple stocks', async () => {
  const symbols = ['AAPL', 'GOOGL', 'MSFT'];

  for (const symbol of symbols) {
    await executeAnalysisJob({ symbol, jobType: 'consensus' });
  }

  // Generate portfolio-level report
  // Verify all stocks analyzed
  // Check portfolio metrics
});
```

## Mock Data

The test suite uses comprehensive mock data in `test/mocks.ts`:

### Mock Analysis Responses
- `mockPrimoAnalysisResponse`: PrimoAgent API response
- `mockTradingAnalysisResponse`: TradingAgents API response
- `mockBacktestResponse`: Backtest results

### Mock Generators
- `generateMockPriceData(symbol, days, startPrice)`: Generate OHLCV data
- `generateMockBacktestReport(symbol)`: Generate complete backtest report
- `createMockAxios()`: Mock axios for API calls

### Example: Generate Price Data
```typescript
const priceData = generateMockPriceData('AAPL', 90, 150);
// Returns 90 days of realistic OHLCV data starting at $150
```

### Example: Generate Backtest Report
```typescript
const report = generateMockBacktestReport('AAPL');
console.log(report.performance.sharpeRatio); // 1.85
console.log(report.trades.total); // 24
console.log(report.comparison.outperformance); // 6.5%
```

## Key Test Scenarios

### 1. Strategy Orchestration
✅ Run analysis with both PrimoAgent and TradingAgents
✅ Calculate consensus between both bots
✅ Handle agreement and disagreement
✅ Save all results to database
✅ Generate alerts for high-confidence signals
✅ Update stock statistics

### 2. Backtesting
✅ Fetch backtest results from PrimoAgent
✅ Generate comprehensive backtest reports
✅ Calculate performance metrics (Sharpe, returns, drawdown)
✅ Track individual trades
✅ Compare strategy vs benchmark
✅ Validate realistic trading metrics

### 3. Portfolio Management
✅ Analyze multiple stocks simultaneously
✅ Generate portfolio-level reports
✅ Track high-confidence signals across portfolio
✅ Calculate portfolio-wide metrics

### 4. Error Handling
✅ Handle API failures gracefully
✅ Record errors in job history
✅ Update failure statistics
✅ Create error alerts
✅ Retry failed jobs

## Test Data Examples

### Backtest Report Structure
```typescript
{
  symbol: 'AAPL',
  period: {
    start: '2024-09-05',
    end: '2024-12-04',
    tradingDays: 90
  },
  performance: {
    totalReturn: 45.2,           // %
    annualizedReturn: 182.3,     // %
    sharpeRatio: 1.85,
    maxDrawdown: -12.3,          // %
    volatility: 22.5,            // %
    winRate: 62.5                // %
  },
  trades: {
    total: 24,
    winners: 15,
    losers: 9,
    avgReturn: 1.88,             // %
    avgWinner: 4.2,              // %
    avgLoser: -2.1,              // %
    largestWin: 8.5,             // %
    largestLoss: -4.2            // %
  },
  tradeList: [
    {
      entryDate: '2024-09-10',
      entryPrice: 152.30,
      exitDate: '2024-09-15',
      exitPrice: 158.45,
      return: 4.04,              // %
      holdingPeriod: 5,          // days
      confidence: 0.85
    },
    // ... more trades
  ],
  comparison: {
    strategy: 'AI Consensus Strategy',
    benchmark: 'Buy & Hold',
    outperformance: 6.5,         // %
    betterSharpe: true,
    lowerDrawdown: true
  }
}
```

### Portfolio Report Structure
```typescript
{
  date: '2024-12-04',
  symbols: ['AAPL', 'GOOGL', 'MSFT'],
  summary: {
    totalStocks: 3,
    buySignals: 2,
    sellSignals: 0,
    holdSignals: 1,
    avgConfidence: 0.83,
    highConfidenceStocks: ['AAPL', 'GOOGL']
  }
}
```

## Coverage Goals

Target test coverage:
- **Statements**: > 80%
- **Branches**: > 75%
- **Functions**: > 80%
- **Lines**: > 80%

View coverage report:
```bash
npm run test:coverage
open coverage/index.html
```

## CI/CD Integration

Tests are designed to run in CI/CD pipelines:

```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm test
      - run: npm run test:coverage
```

## Writing New Tests

### Template for Unit Test
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('Feature Name', () => {
  beforeEach(async () => {
    // Setup test data
  });

  it('should do something specific', async () => {
    // Arrange
    const input = ...;

    // Act
    const result = await functionUnderTest(input);

    // Assert
    expect(result).toBe(expected);
  });
});
```

### Template for Integration Test
```typescript
import { describe, it, expect, beforeEach } from 'vitest';

describe('End-to-End Workflow', () => {
  beforeEach(async () => {
    // Clean database
    // Setup mocks
  });

  it('should complete full workflow', async () => {
    // Step 1: Initial action
    const step1 = await action1();
    expect(step1).toBeDefined();

    // Step 2: Dependent action
    const step2 = await action2(step1.data);
    expect(step2.success).toBe(true);

    // Step 3: Verify final state
    const finalState = await getState();
    expect(finalState).toMatchObject(expected);
  });
});
```

## Debugging Tests

### Run Single Test File
```bash
npx vitest test/integration/strategy.test.ts
```

### Run Single Test
```bash
npx vitest -t "should orchestrate a complete trading strategy"
```

### Enable Debug Logging
```typescript
process.env.LOG_LEVEL = 'debug';
```

## Troubleshooting

### Tests Hanging
- Check for unclosed database connections
- Verify all async operations use `await`
- Check for infinite loops in mocks

### Mock Not Working
- Verify mock is set up in `beforeEach`
- Check import paths match mock paths
- Use `vi.clearAllMocks()` between tests

### Database Errors
- Ensure using in-memory database for tests
- Clean up tables in `beforeEach`
- Check for unique constraint violations

## Best Practices

1. **Isolation**: Each test should be independent
2. **Cleanup**: Always clean up database before each test
3. **Mocking**: Mock external dependencies (APIs, Redis)
4. **Assertions**: Use specific assertions, avoid generic `toBeTruthy()`
5. **Naming**: Use descriptive test names that explain what is being tested
6. **Performance**: Keep tests fast (< 1 second each)
7. **Coverage**: Aim for high coverage but prioritize important paths

## Resources

- [Vitest Documentation](https://vitest.dev/)
- [Testing Best Practices](https://github.com/goldbergyoni/javascript-testing-best-practices)
- [Drizzle ORM Testing](https://orm.drizzle.team/docs/get-started-sqlite)
