"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, RefreshCw, Activity } from "lucide-react"
import { TechnicalChart } from "./technical-chart"
import type { IChartApi, ISeriesApi } from "lightweight-charts"

interface ForexLiveChartProps {
  instrument?: string
  autoRefresh?: boolean
  refreshInterval?: number // in milliseconds
}

const TIMEFRAMES = [
  { value: "tick", label: "Tick" },
  { value: "s1", label: "1 Second" },
  { value: "m1", label: "1 Minute" },
  { value: "m5", label: "5 Minutes" },
  { value: "m15", label: "15 Minutes" },
  { value: "m30", label: "30 Minutes" },
  { value: "h1", label: "1 Hour" },
  { value: "h4", label: "4 Hours" },
  { value: "d1", label: "1 Day" },
]

const FOREX_PAIRS = [
  { value: "eurusd", label: "EUR/USD" },
  { value: "gbpusd", label: "GBP/USD" },
  { value: "usdjpy", label: "USD/JPY" },
  { value: "btcusd", label: "BTC/USD" },
  { value: "ethusd", label: "ETH/USD" },
  { value: "xauusd", label: "XAU/USD (Gold)" },
]

export function ForexLiveChart({
  instrument = "eurusd",
  autoRefresh = true,
  refreshInterval = 5000
}: ForexLiveChartProps) {
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInstrument, setSelectedInstrument] = useState(instrument)
  const [selectedTimeframe, setSelectedTimeframe] = useState("m1")
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [isLive, setIsLive] = useState(autoRefresh)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch real-time data
  const fetchRealTimeData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)

      const url = `/api/forex/realtime/${selectedInstrument}?timeframe=${selectedTimeframe}&last=100&format=json`
      const response = await fetch(url)
      const result = await response.json()

      if (result.success && result.data) {
        // Convert to chart format
        const chartData = result.data.map((item: any) => {
          // Handle tick data vs OHLC data
          if (item.askPrice !== undefined) {
            // Tick data
            return {
              time: Math.floor(item.timestamp / 1000),
              value: item.bidPrice,
            }
          } else {
            // OHLC data
            return {
              time: Math.floor(item.timestamp / 1000),
              open: item.open,
              high: item.high,
              low: item.low,
              close: item.close,
            }
          }
        })

        setData(chartData)
        setLastUpdate(new Date())
      } else {
        setError(result.error || "Failed to fetch data")
      }
    } catch (err: any) {
      console.error("Fetch error:", err)
      setError(err.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }, [selectedInstrument, selectedTimeframe])

  // Initial fetch
  useEffect(() => {
    fetchRealTimeData()
  }, [fetchRealTimeData])

  // Auto-refresh
  useEffect(() => {
    if (isLive && refreshInterval > 0) {
      intervalRef.current = setInterval(fetchRealTimeData, refreshInterval)
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }
  }, [isLive, refreshInterval, fetchRealTimeData])

  const toggleLive = () => {
    setIsLive(!isLive)
  }

  const handleRefresh = () => {
    fetchRealTimeData()
  }

  const chartType = selectedTimeframe === "tick" ? "line" : "candlestick"

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <CardTitle>Live Forex Data</CardTitle>
            {isLive && (
              <Badge variant="default" className="animate-pulse">
                <Activity className="w-3 h-3 mr-1" />
                LIVE
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Select value={selectedInstrument} onValueChange={setSelectedInstrument}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {FOREX_PAIRS.map((pair) => (
                  <SelectItem key={pair.value} value={pair.value}>
                    {pair.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TIMEFRAMES.map((tf) => (
                  <SelectItem key={tf.value} value={tf.value}>
                    {tf.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              variant={isLive ? "default" : "outline"}
              size="sm"
              onClick={toggleLive}
            >
              {isLive ? "Stop" : "Start"} Live
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {lastUpdate && (
          <p className="text-sm text-muted-foreground">
            Last update: {lastUpdate.toLocaleTimeString()}
          </p>
        )}
      </CardHeader>

      <CardContent>
        {error ? (
          <div className="text-center text-red-500 py-8">{error}</div>
        ) : data.length === 0 ? (
          <div className="text-center text-muted-foreground py-8">
            {loading ? "Loading..." : "No data available"}
          </div>
        ) : (
          <div className="w-full h-[500px]">
            <TechnicalChart
              data={data}
              chartType={chartType}
              height={500}
              showVolume={false}
            />
          </div>
        )}
      </CardContent>
    </Card>
  )
}
