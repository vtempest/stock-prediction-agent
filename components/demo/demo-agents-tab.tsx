"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { demoAgents } from "@/lib/demo-data"
import { Bot, Activity, Clock, AlertTriangle } from "lucide-react"

export function DemoAgentsTab() {
  const agents = demoAgents

  const getAgentTypeColor = (type: string) => {
    switch (type) {
      case 'analyst':
        return 'bg-blue-500/10 text-blue-500 border-blue-500/20'
      case 'researcher':
        return 'bg-purple-500/10 text-purple-500 border-purple-500/20'
      case 'trader':
        return 'bg-green-500/10 text-green-500 border-green-500/20'
      case 'risk':
        return 'bg-red-500/10 text-red-500 border-red-500/20'
      case 'pm':
        return 'bg-amber-500/10 text-amber-500 border-amber-500/20'
      default:
        return 'bg-gray-500/10 text-gray-500 border-gray-500/20'
    }
  }

  const getAgentTypeLabel = (type: string) => {
    switch (type) {
      case 'analyst':
        return 'Analyst'
      case 'researcher':
        return 'Researcher'
      case 'trader':
        return 'Trader'
      case 'risk':
        return 'Risk Manager'
      case 'pm':
        return 'Portfolio Manager'
      default:
        return type
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">AI Agent Fleet</h2>
          <p className="text-muted-foreground">
            Multi-agent system for collaborative trading decisions (Demo Data)
          </p>
        </div>
      </div>

      {/* Agent Status Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {agents.map((agent) => (
          <Card key={agent.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2">
                    <Bot className="h-5 w-5" />
                    {agent.name}
                  </CardTitle>
                  <Badge variant="outline" className={getAgentTypeColor(agent.type)}>
                    {getAgentTypeLabel(agent.type)}
                  </Badge>
                </div>
                <div className={`h-3 w-3 rounded-full ${
                  agent.errorRate < 1 ? 'bg-green-500' : 'bg-amber-500'
                } animate-pulse`} />
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Queue Length */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Activity className="h-3 w-3" />
                    Queue
                  </span>
                  <span className="font-medium">{agent.queueLength} tasks</span>
                </div>
                <Progress value={(agent.queueLength / 10) * 100} className="h-2" />
              </div>

              {/* Avg Latency */}
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  Avg Latency
                </span>
                <span className="font-medium">{agent.avgLatency}ms</span>
              </div>

              {/* Error Rate */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    Error Rate
                  </span>
                  <span className={`font-medium ${
                    agent.errorRate < 1 ? 'text-green-500' : 'text-amber-500'
                  }`}>
                    {agent.errorRate.toFixed(1)}%
                  </span>
                </div>
                <Progress
                  value={agent.errorRate * 10}
                  className={`h-2 ${agent.errorRate < 1 ? '' : '[&>div]:bg-amber-500'}`}
                />
              </div>

              {/* Recent Activity */}
              {agent.recentActivity && agent.recentActivity.length > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Recent Activity:</p>
                  <div className="space-y-1">
                    {agent.recentActivity.slice(0, 3).map((activity, idx) => (
                      <p key={idx} className="text-xs text-muted-foreground truncate">
                        • {activity}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Agent Flow */}
      <Card>
        <CardHeader>
          <CardTitle>Multi-Agent Decision Flow</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Badge className="bg-blue-500">1. Analyst Team</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Fundamentals, Sentiment, News, and Technical agents gather parallel data streams
                </p>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Badge className="bg-purple-500">2. Researcher Team</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Bull vs Bear agents debate insights using structured frameworks
                </p>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Badge className="bg-green-500">3. Trader Agent</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Synthesizes debate output, determines entry/exit timing + position size
                </p>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <Badge className="bg-red-500">4. Risk Manager</Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  Evaluates volatility, liquidity, portfolio correlation before execution
                </p>
              </div>
              <span className="text-muted-foreground">→</span>
            </div>
            <div className="flex-1">
              <Badge className="bg-amber-500">5. Portfolio Manager</Badge>
              <p className="text-sm text-muted-foreground mt-1">
                Final approval layer with veto power on all transactions
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
