"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { demoStrategies } from "@/lib/demo-data"
import { Play, Pause, TrendingUp, TrendingDown, Activity } from "lucide-react"
import { QuoteView } from "@/components/dashboard/quote-view"
import { useState } from "react"

export function DemoStrategiesTab() {
  const strategies = demoStrategies
  const [selectedSymbol, setSelectedSymbol] = useState<string | null>(null)

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'low':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'medium':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      case 'high':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  if (selectedSymbol) {
    return (
      <div className="space-y-4">
        <Button
          variant="outline"
          onClick={() => setSelectedSymbol(null)}
        >
          ← Back to Strategies
        </Button>
        <QuoteView symbol={selectedSymbol} showBackButton={false} />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Trading Strategies</h2>
          <p className="text-muted-foreground">
            Algorithmic strategies from TradingView (Demo Data)
          </p>
        </div>
      </div>

      {/* Strategy Performance Grid */}
      <div className="grid gap-4">
        {strategies.map((strategy) => {
          const isProfitable = strategy.last30DaysPnL > 0
          return (
            <Card key={strategy.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <CardTitle>{strategy.name}</CardTitle>
                      <Badge variant={strategy.status === 'running' ? 'default' : strategy.status === 'paused' ? 'secondary' : 'outline'}>
                        {strategy.status === 'running' && <Play className="h-3 w-3 mr-1" />}
                        {strategy.status === 'paused' && <Pause className="h-3 w-3 mr-1" />}
                        {strategy.status}
                      </Badge>
                      <Badge variant="outline" className={getRiskColor(strategy.riskLevel)}>
                        {strategy.riskLevel} risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {/* 30-Day P&L */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">30-Day P&L</p>
                    <div className={`text-lg font-bold flex items-center gap-1 ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                      {isProfitable ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {formatCurrency(strategy.last30DaysPnL)}
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                    <div className="text-lg font-bold">{strategy.winRate.toFixed(1)}%</div>
                  </div>

                  {/* Active Markets */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Active Markets</p>
                    <div className="text-lg font-bold flex items-center gap-1">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      {strategy.activeMarkets}
                    </div>
                  </div>

                  {/* Trades Today */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Trades Today</p>
                    <div className="text-lg font-bold">{strategy.tradesToday}</div>
                  </div>
                </div>

                {/* Strategy Details */}
                <div className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-medium text-green-500 mb-1">✓ Best Conditions:</p>
                    <p className="text-sm text-muted-foreground">{strategy.bestConditions}</p>
                  </div>
                  <div>
                    <p className="text-xs font-medium text-red-500 mb-1">✗ Avoid When:</p>
                    <p className="text-sm text-muted-foreground">{strategy.avoidWhen}</p>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-4">
                    <span>Timeframe: {strategy.timeframe}</span>
                    <span>Today P&L: <span className={strategy.todayPnL >= 0 ? 'text-green-500' : 'text-red-500'}>{formatCurrency(strategy.todayPnL)}</span></span>
                    <span>7D P&L: <span className={strategy.last7DaysPnL >= 0 ? 'text-green-500' : 'text-red-500'}>{formatCurrency(strategy.last7DaysPnL)}</span></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
