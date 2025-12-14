"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, Info, ArrowRight } from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Demo tabs - we'll create simplified versions that use demo data
import { DemoOverviewTab } from "@/components/demo/demo-overview-tab"
import { DemoAgentsTab } from "@/components/demo/demo-agents-tab"
import { DemoStrategiesTab } from "@/components/demo/demo-strategies-tab"
import { DemoPredictionMarketsTab } from "@/components/demo/demo-prediction-markets-tab"
import { DemoCopyTradingTab } from "@/components/demo/demo-copy-trading-tab"
import { DemoRiskPortfolioTab } from "@/components/demo/demo-risk-portfolio-tab"

function DemoContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(searchParams.get('tab') || "overview")

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [searchParams])

  // Update URL when tab changes
  const handleTabChange = (newTab: string) => {
    setActiveTab(newTab)
    const currentParams = new URLSearchParams(searchParams.toString())
    currentParams.set('tab', newTab)
    router.push(`/demo?${currentParams.toString()}`, { scroll: false })
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-6">
      {/* Demo Banner */}
      <Card className="border-amber-500/50 bg-amber-500/10 p-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <Info className="h-5 w-5 text-amber-500 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-semibold text-amber-500 mb-1">Demo Mode</h3>
              <p className="text-sm text-muted-foreground mb-3">
                You're viewing a demo version with sample data. Sign up to start trading with $100,000 in play money.
              </p>
              <Button
                onClick={() => router.push('/login')}
                className="bg-amber-500 hover:bg-amber-600 text-white"
              >
                Sign Up for Free
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
          <Badge variant="outline" className="border-amber-500 text-amber-500">
            DEMO
          </Badge>
        </div>
      </Card>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="agents">Agents</TabsTrigger>
          <TabsTrigger value="strategies">Strategies</TabsTrigger>
          <TabsTrigger value="prediction-markets">Prediction Markets</TabsTrigger>
          <TabsTrigger value="copy-trading">Copy Trading</TabsTrigger>
          <TabsTrigger value="risk">Risk & Portfolio</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          <DemoOverviewTab />
        </TabsContent>

        <TabsContent value="agents" className="space-y-6 mt-6">
          <DemoAgentsTab />
        </TabsContent>

        <TabsContent value="strategies" className="space-y-6 mt-6">
          <DemoStrategiesTab />
        </TabsContent>

        <TabsContent value="prediction-markets" className="space-y-6 mt-6">
          <DemoPredictionMarketsTab />
        </TabsContent>

        <TabsContent value="copy-trading" className="space-y-6 mt-6">
          <DemoCopyTradingTab />
        </TabsContent>

        <TabsContent value="risk" className="space-y-6 mt-6">
          <DemoRiskPortfolioTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function DemoPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Card className="p-8 text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">Loading Demo...</h2>
          <p className="text-sm text-muted-foreground">Please wait</p>
        </Card>
      </div>
    }>
      <DemoContent />
    </Suspense>
  )
}
