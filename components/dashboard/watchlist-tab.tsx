"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Star, Trash2, Loader2, TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import { useSession } from "@/lib/auth-client"
import Link from "next/link"

interface WatchlistItem {
  id: string
  symbol: string
  name: string | null
  addedAt: Date
}

interface QuoteData {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  name?: string
}

export function WatchlistTab() {
  const { data: session } = useSession()
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([])
  const [quotes, setQuotes] = useState<Record<string, QuoteData>>({})
  const [loading, setLoading] = useState(true)
  const [quotesLoading, setQuotesLoading] = useState(false)
  const [visibleSymbols, setVisibleSymbols] = useState<Set<string>>(new Set())
  const [refreshing, setRefreshing] = useState(false)

  // Fetch watchlist
  useEffect(() => {
    if (!session?.user) {
      setLoading(false)
      return
    }

    const fetchWatchlist = async () => {
      try {
        setLoading(true)
        const res = await fetch('/api/user/watchlist')
        const json = await res.json()
        if (json.success && json.data) {
          setWatchlist(json.data)
          // Show all symbols by default
          const symbols = new Set(json.data.map((item: WatchlistItem) => item.symbol))
          setVisibleSymbols(symbols)
        }
      } catch (err) {
        console.error('Error fetching watchlist:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchWatchlist()
  }, [session])

  // Fetch quotes for all watchlist items
  useEffect(() => {
    if (watchlist.length === 0) return

    const fetchQuotes = async () => {
      try {
        setQuotesLoading(true)
        const quotePromises = watchlist.map(async (item) => {
          try {
            const res = await fetch(`/api/stocks/quote/${item.symbol}`)
            const json = await res.json()
            if (json.success && json.data) {
              const price = json.data.price
              return {
                symbol: item.symbol,
                data: {
                  symbol: item.symbol,
                  price: price.regularMarketPrice,
                  change: price.regularMarketChange,
                  changePercent: price.regularMarketChangePercent,
                  volume: price.regularMarketVolume,
                  marketCap: price.marketCap,
                  name: price.longName || price.shortName || item.name || item.symbol,
                }
              }
            }
          } catch (err) {
            console.error(`Error fetching quote for ${item.symbol}:`, err)
          }
          return null
        })

        const results = await Promise.all(quotePromises)
        const quotesMap: Record<string, QuoteData> = {}
        results.forEach((result) => {
          if (result) {
            quotesMap[result.symbol] = result.data
          }
        })
        setQuotes(quotesMap)
      } catch (err) {
        console.error('Error fetching quotes:', err)
      } finally {
        setQuotesLoading(false)
      }
    }

    fetchQuotes()
  }, [watchlist])

  const handleRemove = async (symbol: string) => {
    try {
      const res = await fetch(`/api/user/watchlist?symbol=${symbol}`, {
        method: 'DELETE',
      })
      const json = await res.json()
      if (json.success) {
        setWatchlist(prev => prev.filter(item => item.symbol !== symbol))
        setVisibleSymbols(prev => {
          const newSet = new Set(prev)
          newSet.delete(symbol)
          return newSet
        })
      }
    } catch (err) {
      console.error('Error removing from watchlist:', err)
    }
  }

  const toggleVisibility = (symbol: string) => {
    setVisibleSymbols(prev => {
      const newSet = new Set(prev)
      if (newSet.has(symbol)) {
        newSet.delete(symbol)
      } else {
        newSet.add(symbol)
      }
      return newSet
    })
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    // Refetch quotes
    const quotePromises = watchlist.map(async (item) => {
      try {
        const res = await fetch(`/api/stocks/quote/${item.symbol}`)
        const json = await res.json()
        if (json.success && json.data) {
          const price = json.data.price
          return {
            symbol: item.symbol,
            data: {
              symbol: item.symbol,
              price: price.regularMarketPrice,
              change: price.regularMarketChange,
              changePercent: price.regularMarketChangePercent,
              volume: price.regularMarketVolume,
              marketCap: price.marketCap,
              name: price.longName || price.shortName || item.name || item.symbol,
            }
          }
        }
      } catch (err) {
        console.error(`Error fetching quote for ${item.symbol}:`, err)
      }
      return null
    })

    const results = await Promise.all(quotePromises)
    const quotesMap: Record<string, QuoteData> = {}
    results.forEach((result) => {
      if (result) {
        quotesMap[result.symbol] = result.data
      }
    })
    setQuotes(quotesMap)
    setRefreshing(false)
  }

  const formatNumber = (num: number) => {
    if (!num) return "N/A"
    return new Intl.NumberFormat('en-US', {
      notation: "compact",
      maximumFractionDigits: 2
    }).format(num)
  }

  const formatCurrency = (num: number) => {
    if (num === undefined || num === null) return "N/A"
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num)
  }

  if (!session?.user) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-bold mb-2">Sign in to use Watchlist</h3>
              <p className="text-muted-foreground">
                Create an account to save and track your favorite stocks.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (watchlist.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center p-6">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-bold mb-2">Your Watchlist is Empty</h3>
              <p className="text-muted-foreground mb-4">
                Search for stocks and click the star icon to add them to your watchlist.
              </p>
              <Link href="/dashboard?tab=strategies">
                <Button>Browse Strategies</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Watchlist</h2>
          <p className="text-muted-foreground">
            {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} • {visibleSymbols.size} visible
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh Quotes
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {watchlist.map((item) => {
          const quote = quotes[item.symbol]
          const isVisible = visibleSymbols.has(item.symbol)
          const isPositive = quote ? quote.change >= 0 : false

          return (
            <Card
              key={item.id}
              className={`relative ${!isVisible ? 'opacity-50' : ''}`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={isVisible}
                      onCheckedChange={() => toggleVisibility(item.symbol)}
                    />
                    <Link href={`/dashboard?tab=strategies&symbol=${item.symbol}`}>
                      <CardTitle className="text-lg hover:underline cursor-pointer">
                        {item.symbol}
                      </CardTitle>
                    </Link>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive hover:text-destructive"
                    onClick={() => handleRemove(item.symbol)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
                {quote && (
                  <p className="text-xs text-muted-foreground truncate">
                    {quote.name}
                  </p>
                )}
              </CardHeader>
              <CardContent>
                {quotesLoading && !quote ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                  </div>
                ) : quote ? (
                  <div className="space-y-2">
                    <div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(quote.price)}
                      </div>
                      <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                        {isPositive ? (
                          <TrendingUp className="h-3 w-3" />
                        ) : (
                          <TrendingDown className="h-3 w-3" />
                        )}
                        <span>
                          {isPositive ? '+' : ''}{formatCurrency(quote.change)} ({isPositive ? '+' : ''}{quote.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <div className="text-muted-foreground">Volume</div>
                        <div className="font-medium">{formatNumber(quote.volume)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Market Cap</div>
                        <div className="font-medium">{formatNumber(quote.marketCap)}</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Failed to load quote
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
