"use client"

import { useState, useCallback, useEffect } from "react"
import { TechnicalChart } from "./technical-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

interface DynamicStockChartProps {
  symbol: string
  initialRange?: string // '1d', '5d', '1mo', '3mo', '6mo', '1y', etc.
  interval?: string // '1m', '5m', '15m', '1h', '1d', etc.
}

interface ChartData {
  time: string | number
  open: number
  high: number
  low: number
  close: number
}

export function DynamicStockChart({
  symbol,
  initialRange = "1mo",
  interval = "1d"
}: DynamicStockChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchedRange, setLastFetchedRange] = useState<{from: number; to: number} | null>(null)

  // Fetch initial data
  useEffect(() => {
    fetchData(initialRange)
  }, [symbol, initialRange, interval])

  // Fetch data from API
  const fetchData = async (range?: string, period1?: string, period2?: string) => {
    try {
      setLoading(true)
      setError(null)

      let url = `/api/stocks/historical/${symbol}?interval=${interval}`

      if (period1 && period2) {
        // Use specific date range
        url += `&period1=${period1}&period2=${period2}`
      } else if (range) {
        // Use relative range
        url += `&range=${range}`
      }

      const response = await fetch(url)
      const result = await response.json()

      if (result.success && result.data) {
        // Transform the data to match TechnicalChart format
        const chartData: ChartData[] = result.data.map((quote: any) => ({
          time: quote.date || quote.time,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          close: quote.close
        })).filter((d: ChartData) => d.open && d.close) // Filter out invalid data

        setData(chartData)
      } else {
        setError(result.error || "Failed to fetch data")
      }
    } catch (err) {
      console.error("Error fetching chart data:", err)
      setError("Failed to load chart data")
    } finally {
      setLoading(false)
    }
  }

  // Handle visible range changes from the chart
  const handleVisibleRangeChange = useCallback((range: { from: number; to: number }) => {
    // Check if we need to fetch more data
    // Only fetch if the range has changed significantly (more than 10% difference)
    if (lastFetchedRange) {
      const rangeDiff = Math.abs(range.from - lastFetchedRange.from) + Math.abs(range.to - lastFetchedRange.to)
      const totalRange = lastFetchedRange.to - lastFetchedRange.from

      if (rangeDiff / totalRange < 0.1) {
        // Range hasn't changed significantly, skip fetching
        return
      }
    }

    // Convert timestamps to date strings
    const fromDate = new Date(range.from * 1000).toISOString().split('T')[0]
    const toDate = new Date(range.to * 1000).toISOString().split('T')[0]

    console.log(`Fetching data for new range: ${fromDate} to ${toDate}`)

    // Fetch data for the new range
    // Add some buffer to the range to ensure smooth scrolling
    const bufferDays = 7 * 24 * 60 * 60 // 7 days in seconds
    const bufferedFrom = new Date((range.from - bufferDays) * 1000).toISOString().split('T')[0]
    const bufferedTo = new Date((range.to + bufferDays) * 1000).toISOString().split('T')[0]

    fetchData(undefined, bufferedFrom, bufferedTo)
    setLastFetchedRange(range)
  }, [symbol, interval, lastFetchedRange])

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <CardTitle className="text-lg text-card-foreground flex items-center justify-between">
          <span>{symbol} Price Chart</span>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center h-[300px] text-destructive">
            <p>{error}</p>
          </div>
        ) : data.length > 0 ? (
          <TechnicalChart
            data={data}
            title={`${symbol} - ${interval}`}
            symbol={symbol}
            onVisibleRangeChange={handleVisibleRangeChange}
            colors={{
              backgroundColor: 'transparent',
              textColor: 'hsl(var(--foreground))',
            }}
          />
        ) : loading ? (
          <div className="flex items-center justify-center h-[300px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            <p>No data available</p>
          </div>
        )}

        {!loading && data.length > 0 && (
          <div className="mt-4 text-sm text-muted-foreground text-center">
            Zoom or pan the chart to load data for different time ranges
          </div>
        )}
      </CardContent>
    </Card>
  )
}
