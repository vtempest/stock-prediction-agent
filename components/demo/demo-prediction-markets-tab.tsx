"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { demoPredictionMarkets } from "@/lib/demo-data"
import { TrendingUp, TrendingDown, ExternalLink, Clock, DollarSign } from "lucide-react"

export function DemoPredictionMarketsTab() {
  const markets = demoPredictionMarkets

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${(value * 100).toFixed(1)}%`
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'politics':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'macro':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'tech':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'sports':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Prediction Markets</h2>
          <p className="text-muted-foreground">
            Polymarket & Kalshi opportunities analyzed by AI (Demo Data)
          </p>
        </div>
      </div>

      {/* Markets Grid */}
      <div className="grid gap-4">
        {markets.map((market) => {
          const hasEdge = market.expectedEdge > 3
          const isPositiveEdge = market.expectedEdge > 0

          return (
            <Card key={market.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{market.platform}</Badge>
                      <Badge variant="outline" className={getCategoryColor(market.category)}>
                        {market.category}
                      </Badge>
                      {hasEdge && (
                        <Badge className={isPositiveEdge ? 'bg-green-500' : 'bg-red-500'}>
                          {isPositiveEdge ? '+' : ''}{market.expectedEdge.toFixed(1)}% Edge
                        </Badge>
                      )}
                    </div>
                    <CardTitle className="text-lg">{market.eventName}</CardTitle>
                  </div>
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {/* Current Odds */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Market Odds</p>
                    <div className="text-lg font-bold">{formatPercent(market.currentOdds)}</div>
                  </div>

                  {/* LLM Probability */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">AI Probability</p>
                    <div className={`text-lg font-bold flex items-center gap-1 ${
                      market.llmProbability > market.currentOdds ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {market.llmProbability > market.currentOdds ?
                        <TrendingUp className="h-4 w-4" /> :
                        <TrendingDown className="h-4 w-4" />
                      }
                      {formatPercent(market.llmProbability)}
                    </div>
                  </div>

                  {/* Volume */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Volume</p>
                    <div className="text-lg font-bold flex items-center gap-1">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      {formatCurrency(market.volume)}
                    </div>
                  </div>

                  {/* Time to Resolution */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Resolves In</p>
                    <div className="text-lg font-bold flex items-center gap-1">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      {market.timeToResolution}
                    </div>
                  </div>
                </div>

                {/* LLM Analysis */}
                <div className="pt-4 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">AI Analysis:</p>
                  <p className="text-sm text-muted-foreground">{market.llmAnalysis}</p>
                </div>

                {/* Correlated Tickers */}
                {market.correlatedTickers && market.correlatedTickers.length > 0 && (
                  <div className="pt-4 border-t mt-4">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Correlated Assets:</p>
                    <div className="flex flex-wrap gap-2">
                      {market.correlatedTickers.map((ticker) => (
                        <Badge key={ticker} variant="secondary">
                          {ticker}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Liquidity */}
                <div className="pt-4 border-t mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Liquidity: {formatCurrency(market.liquidity)}</span>
                  <span>Expected Edge: <span className={isPositiveEdge ? 'text-green-500' : 'text-red-500'}>
                    {isPositiveEdge ? '+' : ''}{market.expectedEdge.toFixed(1)}%
                  </span></span>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
