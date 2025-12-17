"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import { TechnicalChart } from "./technical-chart"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Loader2, X, Search } from "lucide-react"
import type { IChartApi, ISeriesApi } from "lightweight-charts"
import { LineSeries } from "lightweight-charts"
import { useTheme } from "next-themes"

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

interface ComparisonSymbol {
  symbol: string
  color: string
  data: ChartData[]
  loading: boolean
}

// Predefined colors for comparison symbols
const COMPARISON_COLORS = [
  'rgb(225, 87, 90)',    // Red
  'rgb(242, 142, 44)',   // Orange
  'rgb(76, 175, 80)',    // Green
  'rgb(156, 39, 176)',   // Purple
  'rgb(33, 150, 243)',   // Blue
  'rgb(255, 193, 7)',    // Yellow
]

export function DynamicStockChart({
  symbol,
  initialRange = "1mo",
  interval = "1d"
}: DynamicStockChartProps) {
  const [data, setData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastFetchedRange, setLastFetchedRange] = useState<{ from: number; to: number } | null>(null)

  // Comparison state
  const [comparisonSymbols, setComparisonSymbols] = useState<ComparisonSymbol[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [showSearchResults, setShowSearchResults] = useState(false)
  const chartRef = useRef<IChartApi | null>(null)
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null)
  const comparisonSeriesRefs = useRef<Map<string, ISeriesApi<any>>>(new Map())

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

  // Search for stocks
  const handleSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSearchResults([])
      setShowSearchResults(false)
      return
    }

    try {
      const res = await fetch(`/api/stocks/autocomplete?q=${encodeURIComponent(query)}&limit=5`)
      const json = await res.json()
      if (json.success) {
        setSearchResults(json.data)
        setShowSearchResults(true)
      }
    } catch (error) {
      console.error("Error searching stocks:", error)
    }
  }, [])

  // Add comparison symbol
  const addComparisonSymbol = useCallback(async (compareSymbol: string) => {
    // Don't add if it's the same as main symbol or already added
    if (compareSymbol === symbol || comparisonSymbols.some(c => c.symbol === compareSymbol)) {
      return
    }

    // Get next color
    const color = COMPARISON_COLORS[comparisonSymbols.length % COMPARISON_COLORS.length]

    // Add to state with loading flag
    const newComparison: ComparisonSymbol = {
      symbol: compareSymbol,
      color,
      data: [],
      loading: true
    }

    setComparisonSymbols(prev => [...prev, newComparison])
    setSearchQuery("")
    setShowSearchResults(false)

    // Fetch data for the comparison symbol
    try {
      const res = await fetch(`/api/stocks/historical/${compareSymbol}?range=${initialRange}&interval=${interval}`)
      const json = await res.json()

      if (json.success && json.data) {
        const chartData: ChartData[] = json.data.map((quote: any) => ({
          time: quote.date || quote.time,
          open: quote.open,
          high: quote.high,
          low: quote.low,
          close: quote.close
        })).filter((d: ChartData) => d.open && d.close)

        setComparisonSymbols(prev => prev.map(c =>
          c.symbol === compareSymbol ? { ...c, data: chartData, loading: false } : c
        ))
      }
    } catch (error) {
      console.error("Error fetching comparison data:", error)
      // Remove failed comparison
      setComparisonSymbols(prev => prev.filter(c => c.symbol !== compareSymbol))
    }
  }, [symbol, comparisonSymbols, initialRange, interval])

  // Remove comparison symbol
  const removeComparisonSymbol = useCallback((compareSymbol: string) => {
    setComparisonSymbols(prev => prev.filter(c => c.symbol !== compareSymbol))
    comparisonSeriesRefs.current.delete(compareSymbol)
  }, [])

  // Handle chart ready
  const handleChartReady = useCallback((chart: IChartApi, series: ISeriesApi<any>) => {
    chartRef.current = chart
    mainSeriesRef.current = series
  }, [])

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

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery) {
        handleSearch(searchQuery)
      }
    }, 300)

    return () => clearTimeout(timer)
  }, [searchQuery, handleSearch])

  return (
    <Card className="border-border bg-card">
      <CardHeader>
        <div className="flex items-center justify-between gap-4">
          <CardTitle className="text-lg text-card-foreground flex items-center gap-2">
            <span>{symbol} Price Chart</span>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
          </CardTitle>

          {/* Comparison Search */}
          <div className="relative w-64">
            <div className="flex gap-2">
              <Input
                placeholder="Compare with symbol..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => searchQuery && setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="pr-8"
              />
              <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            </div>

            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full mt-1 w-full bg-popover border border-border rounded-md shadow-lg z-50 max-h-48 overflow-y-auto">
                {searchResults.map((result) => (
                  <button
                    key={result.symbol}
                    onClick={() => addComparisonSymbol(result.symbol)}
                    className="w-full px-3 py-2 text-left hover:bg-accent hover:text-accent-foreground text-sm flex items-center justify-between"
                  >
                    <span className="font-medium">{result.symbol}</span>
                    <span className="text-muted-foreground text-xs truncate ml-2">{result.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Comparison Badges */}
        {comparisonSymbols.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            <Badge variant="outline" style={{ borderColor: '#2962FF' }}>
              {symbol}
            </Badge>
            {comparisonSymbols.map((comp) => (
              <Badge
                key={comp.symbol}
                variant="outline"
                style={{ borderColor: comp.color }}
                className="flex items-center gap-1"
              >
                <span>{comp.symbol}</span>
                {comp.loading && <Loader2 className="h-3 w-3 animate-spin" />}
                <button
                  onClick={() => removeComparisonSymbol(comp.symbol)}
                  className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="flex items-center justify-center h-[300px] text-destructive">
            <p>{error}</p>
          </div>
        ) : data.length > 0 ? (
          <MultiSeriesChart
            mainData={data}
            mainSymbol={symbol}
            comparisonData={comparisonSymbols}
            interval={interval}
            onVisibleRangeChange={handleVisibleRangeChange}
            onChartReady={handleChartReady}
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

// Multi-series chart component to render main + comparison series
function MultiSeriesChart({
  mainData,
  mainSymbol,
  comparisonData,
  interval,
  onVisibleRangeChange,
  onChartReady
}: {
  mainData: ChartData[]
  mainSymbol: string
  comparisonData: ComparisonSymbol[]
  interval: string
  onVisibleRangeChange?: (range: { from: number; to: number }) => void
  onChartReady?: (chart: IChartApi, series: ISeriesApi<any>) => void
}) {
  const chartRef = useRef<IChartApi | null>(null)
  const mainSeriesRef = useRef<ISeriesApi<any> | null>(null)
  const comparisonSeriesRefs = useRef<Map<string, ISeriesApi<any>>>(new Map())
  const isChartReadyCalled = useRef(false)

  // Handle chart ready - only call once
  const handleChartReady = useCallback((chart: IChartApi, series: ISeriesApi<any>) => {
    if (isChartReadyCalled.current) return

    chartRef.current = chart
    mainSeriesRef.current = series
    isChartReadyCalled.current = true
    onChartReady?.(chart, series)
  }, [onChartReady])

  // Update comparison series when data changes
  useEffect(() => {
    if (!chartRef.current) return

    const chart = chartRef.current

    // Add or update comparison series
    comparisonData.forEach((comp) => {
      if (comp.data.length > 0) {
        let lineSeries = comparisonSeriesRefs.current.get(comp.symbol)

        if (!lineSeries) {
          // Add new line series for comparison
          lineSeries = chart.addSeries(LineSeries, {
            color: comp.color,
            lineWidth: 2,
            priceScaleId: 'right', // Use same price scale
          })
          comparisonSeriesRefs.current.set(comp.symbol, lineSeries)
        }

        if (lineSeries) {
          // Convert data to close prices for line series
          const lineData = comp.data.map(d => {
            let timeVal = d.time;
            if (typeof timeVal === 'string' && timeVal.includes('T')) {
              const date = new Date(timeVal);
              if (!isNaN(date.getTime())) {
                timeVal = Math.floor(date.getTime() / 1000) as any;
              }
            }
            return {
              time: timeVal,
              value: d.close
            };
          })

          lineSeries.setData(lineData)
        }
      }
    })

    // Remove series for symbols that are no longer in comparisonData
    const currentSymbols = new Set(comparisonData.map(c => c.symbol))
    comparisonSeriesRefs.current.forEach((series, symbol) => {
      if (!currentSymbols.has(symbol)) {
        (chart as any).removeSeries(series)
        comparisonSeriesRefs.current.delete(symbol)
      }
    })
  }, [comparisonData])


  // We need to use the Chart component from lightweight-charts-react-components
  // but add comparison series dynamically
  const { resolvedTheme } = useTheme()
  const textColor = resolvedTheme === 'dark' ? '#ffffff' : '#000000'

  return (
    <div className="w-full relative">
      <TechnicalChart
        data={mainData}
        title={`${mainSymbol} - ${interval}`}
        symbol={mainSymbol}
        onVisibleRangeChange={onVisibleRangeChange}
        onChartReady={handleChartReady}
        colors={{
          backgroundColor: 'transparent',
          textColor: textColor,
        }}
      />
    </div>
  )
}
