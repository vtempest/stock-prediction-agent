"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Activity,
} from "lucide-react"
import { demoPortfolio, demoStrategies, demoSignals } from "@/lib/demo-data"

export function DemoOverviewTab() {
  const portfolio = demoPortfolio
  const strategies = demoStrategies.slice(0, 5) // Show top 5
  const signals = demoSignals

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  const isPositive = portfolio.dailyPnL >= 0

  return (
    <div className="space-y-6">
      {/* Portfolio Summary */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equity</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(portfolio.totalEquity)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Cash: {formatCurrency(portfolio.cash)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily P&L</CardTitle>
            {isPositive ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {formatCurrency(portfolio.dailyPnL)}
            </div>
            <p className={`text-xs mt-1 ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
              {formatPercent(portfolio.dailyPnLPercent)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Win Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.winRate.toFixed(1)}%</div>
            <Progress value={portfolio.winRate} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open Positions</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolio.openPositions}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Stocks: {formatCurrency(portfolio.stocks)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Active Strategies */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Strategies (Demo Data)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {strategies.map((strategy) => {
              const isProfitable = strategy.last30DaysPnL > 0
              return (
                <div key={strategy.id} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-medium">{strategy.name}</p>
                      <Badge variant={strategy.status === 'running' ? 'default' : 'secondary'}>
                        {strategy.status}
                      </Badge>
                      <Badge variant="outline" className={`${
                        strategy.riskLevel === 'high' ? 'border-red-500 text-red-500' :
                        strategy.riskLevel === 'medium' ? 'border-amber-500 text-amber-500' :
                        'border-green-500 text-green-500'
                      }`}>
                        {strategy.riskLevel} risk
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{strategy.description}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Win Rate: {strategy.winRate.toFixed(1)}%</span>
                      <span>Active Markets: {strategy.activeMarkets}</span>
                      <span>Trades Today: {strategy.tradesToday}</span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-lg font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(strategy.last30DaysPnL)}
                    </div>
                    <p className="text-xs text-muted-foreground">30-day P&L</p>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Portfolio Allocation */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Cash</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(portfolio.cash)} ({((portfolio.cash / portfolio.totalEquity) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress value={(portfolio.cash / portfolio.totalEquity) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Stocks</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(portfolio.stocks)} ({((portfolio.stocks / portfolio.totalEquity) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress value={(portfolio.stocks / portfolio.totalEquity) * 100} className="h-2" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Prediction Markets</span>
                <span className="text-sm text-muted-foreground">
                  {formatCurrency(portfolio.predictionMarkets)} ({((portfolio.predictionMarkets / portfolio.totalEquity) * 100).toFixed(1)}%)
                </span>
              </div>
              <Progress value={(portfolio.predictionMarkets / portfolio.totalEquity) * 100} className="h-2" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
