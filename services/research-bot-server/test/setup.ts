import { beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { initializeDatabase } from '../src/db/index.js';

// Mock Redis connection for tests
vi.mock('../src/queue/connection.js', () => ({
  connection: {
    on: vi.fn(),
    disconnect: vi.fn(),
  },
}));

// Setup database before all tests
beforeAll(async () => {
  process.env.DATABASE_PATH = ':memory:'; // Use in-memory SQLite for tests
  process.env.NODE_ENV = 'test';
  process.env.LOG_LEVEL = 'error'; // Suppress logs during tests

  initializeDatabase();
});

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
});

afterAll(async () => {
  // Cleanup
});
