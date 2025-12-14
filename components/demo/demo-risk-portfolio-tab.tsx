"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { demoRiskMetrics, demoPositions, demoTrades } from "@/lib/demo-data"
import {
  Shield,
  AlertTriangle,
  TrendingUp,
  TrendingDown,
  Activity,
  Clock,
  DollarSign
} from "lucide-react"

export function DemoRiskPortfolioTab() {
  const risk = demoRiskMetrics
  const positions = demoPositions
  const trades = demoTrades.slice(0, 10)

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

  const getVixColor = (regime: string) => {
    switch (regime) {
      case 'Low':
        return 'text-green-500'
      case 'Moderate':
        return 'text-amber-500'
      case 'High':
      case 'Extreme':
        return 'text-red-500'
      default:
        return 'text-gray-500'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Risk & Portfolio Management</h2>
          <p className="text-muted-foreground">
            Real-time risk monitoring and position tracking (Demo Data)
          </p>
        </div>
      </div>

      {/* Risk Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">VIX Index</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getVixColor(risk.vixRegime)}`}>
              {risk.vix.toFixed(1)}
            </div>
            <Badge variant="outline" className={`mt-2 ${
              risk.vixRegime === 'Low' ? 'border-green-500 text-green-500' :
              risk.vixRegime === 'Moderate' ? 'border-amber-500 text-amber-500' :
              'border-red-500 text-red-500'
            }`}>
              {risk.vixRegime} Volatility
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Portfolio Volatility</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{risk.portfolioVolatility.toFixed(1)}%</div>
            <Progress value={risk.portfolioVolatility} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Leverage</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{risk.currentLeverage.toFixed(2)}x</div>
            <p className="text-xs text-muted-foreground mt-2">
              Max: {risk.maxLeverage.toFixed(1)}x
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily VaR</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">
              {formatCurrency(risk.varDaily)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">95% confidence</p>
          </CardContent>
        </Card>
      </div>

      {/* Top Concentrations */}
      <Card>
        <CardHeader>
          <CardTitle>Portfolio Concentrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {risk.topConcentrations.map((concentration, idx) => (
              <div key={idx}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{concentration.name}</span>
                  <span className={`text-sm font-bold ${
                    concentration.exposure > 40 ? 'text-red-500' :
                    concentration.exposure > 25 ? 'text-amber-500' :
                    'text-green-500'
                  }`}>
                    {concentration.exposure.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={concentration.exposure}
                  className={`h-2 ${
                    concentration.exposure > 40 ? '[&>div]:bg-red-500' :
                    concentration.exposure > 25 ? '[&>div]:bg-amber-500' :
                    ''
                  }`}
                />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Open Positions */}
      <Card>
        <CardHeader>
          <CardTitle>Open Positions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {positions.map((position) => {
              const isProfitable = position.unrealizedPnL > 0
              return (
                <div key={position.id} className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{position.asset}</span>
                      <Badge variant="outline" className="text-xs">
                        {position.type === 'stock' ? 'Stock' : 'Prediction Market'}
                      </Badge>
                      <Badge variant="secondary" className="text-xs">
                        {position.strategy}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>Entry: {formatCurrency(position.entryPrice)}</span>
                      <span>Current: {formatCurrency(position.currentPrice)}</span>
                      <span>Size: {position.size}</span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(position.openedAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className={`text-lg font-bold ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                      {isProfitable ? <TrendingUp className="h-4 w-4 inline mr-1" /> : <TrendingDown className="h-4 w-4 inline mr-1" />}
                      {formatCurrency(position.unrealizedPnL)}
                    </div>
                    <div className={`text-xs ${isProfitable ? 'text-green-500' : 'text-red-500'}`}>
                      {formatPercent(position.unrealizedPnLPercent)}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Trades */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Trades</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {trades.map((trade) => (
              <div key={trade.id} className="flex items-center justify-between text-sm border-b pb-2 last:border-0 last:pb-0">
                <div className="flex items-center gap-3">
                  <Badge variant={trade.action === 'buy' ? 'default' : 'secondary'}>
                    {trade.action.toUpperCase()}
                  </Badge>
                  <span className="font-medium">{trade.asset}</span>
                  <Badge variant="outline" className="text-xs">{trade.strategy}</Badge>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-muted-foreground">
                    {trade.size} @ {formatCurrency(trade.price)}
                  </span>
                  {trade.pnl !== undefined && (
                    <span className={`font-medium ${trade.pnl >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                      {formatCurrency(trade.pnl)}
                    </span>
                  )}
                  <span className="text-xs text-muted-foreground">
                    {new Date(trade.timestamp).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
