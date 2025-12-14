"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { demoTopTraders } from "@/lib/demo-data"
import { TrendingUp, TrendingDown, Users, Award, Clock, Activity } from "lucide-react"

export function DemoCopyTradingTab() {
  const traders = demoTopTraders

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Copy Trading Leaderboard</h2>
          <p className="text-muted-foreground">
            Follow and copy trades from top performers (Demo Data)
          </p>
        </div>
      </div>

      {/* Top Traders Grid */}
      <div className="grid gap-4">
        {traders.map((trader) => {
          const isProfitable = trader.overallPnL > 0
          const isLowVolatility = trader.volatility < 20

          return (
            <Card key={trader.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <Award className="h-5 w-5 text-amber-500" />
                      <CardTitle className="text-xl">{trader.name}</CardTitle>
                      <Badge variant="secondary">Rank #{trader.rank}</Badge>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {trader.markets.map((market, idx) => (
                        <Badge key={idx} variant="outline" className="text-xs">
                          {market}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  <Button variant="default" className="ml-4">
                    <Users className="h-4 w-4 mr-2" />
                    Copy Trader
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                  {/* Overall P&L */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Overall P&L</p>
                    <div className={`text-lg font-bold flex items-center gap-1 ${
                      isProfitable ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {isProfitable ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      {formatCurrency(trader.overallPnL)}
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Win Rate</p>
                    <div className="text-lg font-bold">{trader.winRate.toFixed(1)}%</div>
                    <Progress value={trader.winRate} className="mt-1 h-1" />
                  </div>

                  {/* Portfolio Value */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Portfolio Value</p>
                    <div className="text-lg font-bold">{formatCurrency(trader.currentValue)}</div>
                  </div>

                  {/* Active Positions */}
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Active Positions</p>
                    <div className="text-lg font-bold flex items-center gap-1">
                      <Activity className="h-4 w-4 text-muted-foreground" />
                      {trader.activePositions}
                    </div>
                  </div>
                </div>

                {/* Additional Metrics */}
                <div className="pt-4 border-t grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Avg Holding Period</p>
                    <div className="text-sm font-medium flex items-center gap-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      {trader.avgHoldingPeriod}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Max Drawdown</p>
                    <div className="text-sm font-medium text-red-500">
                      {formatPercent(trader.maxDrawdown)}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Volatility</p>
                    <div className={`text-sm font-medium ${
                      isLowVolatility ? 'text-green-500' : 'text-amber-500'
                    }`}>
                      {trader.volatility.toFixed(1)}%
                      {isLowVolatility && <span className="ml-1 text-xs">(Low)</span>}
                    </div>
                  </div>
                </div>

                {/* Risk Profile */}
                <div className="pt-4 border-t mt-4">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Risk Profile:</span>
                    <Badge variant="outline" className={
                      trader.volatility < 15 ? 'border-green-500 text-green-500' :
                      trader.volatility < 30 ? 'border-amber-500 text-amber-500' :
                      'border-red-500 text-red-500'
                    }>
                      {trader.volatility < 15 ? 'Conservative' :
                       trader.volatility < 30 ? 'Moderate' : 'Aggressive'}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Info Card */}
      <Card className="border-blue-500/50 bg-blue-500/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-blue-500 mt-0.5" />
            <div>
              <h4 className="font-semibold text-blue-500 mb-1">How Copy Trading Works</h4>
              <p className="text-sm text-muted-foreground">
                Our AI monitors wallets of historically profitable traders and public figures.
                When they make a trade, our system can automatically replicate it in your portfolio
                with customizable position sizing and risk limits.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
