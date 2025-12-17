import { getHistoricalRates, getRealTimeRates, Config } from "dukascopy-node";

export type InstrumentType =
  | "eurusd" | "gbpusd" | "usdjpy" | "audusd" | "usdcad"
  | "usdchf" | "nzdusd" | "eurgbp" | "eurjpy" | "gbpjpy"
  | "btcusd" | "ethusd" | "xauusd" | "xagusd" | "wtiusd";

export type TimeframeType = "tick" | "s1" | "m1" | "m5" | "m15" | "m30" | "h1" | "h4" | "d1" | "mn1";
export type FormatType = "array" | "json" | "csv";
export type PriceType = "bid" | "ask";

export interface DukascopyConfig {
  instrument: InstrumentType;
  dates: {
    from: Date | string | number;
    to?: Date | string | number;
  };
  timeframe?: TimeframeType;
  format?: FormatType;
  priceType?: PriceType;
  volumes?: boolean;
}

export interface RealTimeConfig {
  instrument: InstrumentType;
  timeframe?: TimeframeType;
  dates?: {
    from: Date | string | number;
    to?: Date | string | number;
  };
  last?: number;
  volumes?: boolean;
  format?: FormatType;
  priceType?: PriceType;
}

export interface JsonItem {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

export interface JsonItemTick {
  timestamp: number;
  askPrice: number;
  bidPrice: number;
  askVolume?: number;
  bidVolume?: number;
}

/**
 * Fetch historical forex data from Dukascopy
 */
export async function getForexHistoricalData(config: DukascopyConfig) {
  try {
    const dukascopyConfig: Config = {
      instrument: config.instrument,
      dates: {
        from: new Date(config.dates.from),
        to: config.dates.to ? new Date(config.dates.to) : new Date(),
      },
      timeframe: config.timeframe || "d1",
      format: config.format || "json",
      priceType: config.priceType || "bid",
      volumes: config.volumes !== false,
    };

    const data = await getHistoricalRates(dukascopyConfig);
    return { success: true, data };
  } catch (error: any) {
    console.error("Dukascopy historical data error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch historical data"
    };
  }
}

/**
 * Fetch real-time forex tick data from Dukascopy
 */
export async function getForexRealTimeData(config: RealTimeConfig) {
  try {
    const data = await getRealTimeRates({
      instrument: config.instrument,
      timeframe: config.timeframe || "tick",
      format: config.format || "json",
      priceType: config.priceType || "bid",
      last: config.last || 10,
      volumes: config.volumes !== false,
      ...(config.dates && {
        dates: {
          from: new Date(config.dates.from),
          to: config.dates.to ? new Date(config.dates.to) : new Date(),
        },
      }),
    });

    return { success: true, data };
  } catch (error: any) {
    console.error("Dukascopy real-time data error:", error);
    return {
      success: false,
      error: error.message || "Failed to fetch real-time data"
    };
  }
}

/**
 * Convert Dukascopy JSON data to chart format
 */
export function convertToChartData(data: JsonItem[] | JsonItemTick[]): any[] {
  if (!data || data.length === 0) return [];

  // Check if tick data
  if ('askPrice' in data[0]) {
    // Convert tick data to OHLC using bid price
    return (data as JsonItemTick[]).map(tick => ({
      time: tick.timestamp / 1000, // Convert to seconds
      value: tick.bidPrice,
      askPrice: tick.askPrice,
      bidPrice: tick.bidPrice,
      askVolume: tick.askVolume,
      bidVolume: tick.bidVolume,
    }));
  }

  // Convert OHLC data
  return (data as JsonItem[]).map(candle => ({
    time: candle.timestamp / 1000, // Convert to seconds
    open: candle.open,
    high: candle.high,
    low: candle.low,
    close: candle.close,
    volume: candle.volume,
  }));
}

/**
 * Get list of supported instruments
 */
export const FOREX_INSTRUMENTS = [
  { symbol: "eurusd", name: "EUR/USD", description: "Euro vs US Dollar" },
  { symbol: "gbpusd", name: "GBP/USD", description: "British Pound vs US Dollar" },
  { symbol: "usdjpy", name: "USD/JPY", description: "US Dollar vs Japanese Yen" },
  { symbol: "audusd", name: "AUD/USD", description: "Australian Dollar vs US Dollar" },
  { symbol: "usdcad", name: "USD/CAD", description: "US Dollar vs Canadian Dollar" },
  { symbol: "usdchf", name: "USD/CHF", description: "US Dollar vs Swiss Franc" },
  { symbol: "nzdusd", name: "NZD/USD", description: "New Zealand Dollar vs US Dollar" },
  { symbol: "eurgbp", name: "EUR/GBP", description: "Euro vs British Pound" },
  { symbol: "eurjpy", name: "EUR/JPY", description: "Euro vs Japanese Yen" },
  { symbol: "gbpjpy", name: "GBP/JPY", description: "British Pound vs Japanese Yen" },
  { symbol: "btcusd", name: "BTC/USD", description: "Bitcoin vs US Dollar" },
  { symbol: "ethusd", name: "ETH/USD", description: "Ethereum vs US Dollar" },
  { symbol: "xauusd", name: "XAU/USD", description: "Gold vs US Dollar" },
  { symbol: "xagusd", name: "XAG/USD", description: "Silver vs US Dollar" },
  { symbol: "wtiusd", name: "WTI/USD", description: "Crude Oil vs US Dollar" },
] as const;
