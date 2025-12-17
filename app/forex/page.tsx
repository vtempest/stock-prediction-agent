"use client"

import { RealtimeForexChart } from "@/components/dashboard/realtime-forex-chart"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

export default function ForexPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Live Forex Trading</h1>
        <p className="text-muted-foreground">
          Real-time forex data powered by Dukascopy - no API key required
        </p>
      </div>

      <Tabs defaultValue="eurusd" className="w-full">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="eurusd">EUR/USD</TabsTrigger>
          <TabsTrigger value="gbpusd">GBP/USD</TabsTrigger>
          <TabsTrigger value="usdjpy">USD/JPY</TabsTrigger>
          <TabsTrigger value="btcusd">BTC/USD</TabsTrigger>
          <TabsTrigger value="ethusd">ETH/USD</TabsTrigger>
          <TabsTrigger value="xauusd">Gold</TabsTrigger>
        </TabsList>

        <TabsContent value="eurusd" className="mt-6">
          <RealtimeForexChart instrument="eurusd" timeframe="m1" height={600} />
        </TabsContent>

        <TabsContent value="gbpusd" className="mt-6">
          <RealtimeForexChart instrument="gbpusd" timeframe="m1" height={600} />
        </TabsContent>

        <TabsContent value="usdjpy" className="mt-6">
          <RealtimeForexChart instrument="usdjpy" timeframe="m1" height={600} />
        </TabsContent>

        <TabsContent value="btcusd" className="mt-6">
          <RealtimeForexChart instrument="btcusd" timeframe="m5" height={600} />
        </TabsContent>

        <TabsContent value="ethusd" className="mt-6">
          <RealtimeForexChart instrument="ethusd" timeframe="m5" height={600} />
        </TabsContent>

        <TabsContent value="xauusd" className="mt-6">
          <RealtimeForexChart instrument="xauusd" timeframe="m15" height={600} />
        </TabsContent>
      </Tabs>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Real-Time Updates</CardTitle>
            <CardDescription>Live tick data streaming</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Charts update automatically every 1-5 seconds with the latest market data from Dukascopy.
              Use the "Pause Live" button to stop updates.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Multiple Timeframes</CardTitle>
            <CardDescription>From 1 minute to daily</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Choose from multiple timeframes: 1m, 5m, 15m, 1h to analyze price action at different scales.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Interactive Charts</CardTitle>
            <CardDescription>Professional trading tools</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Hover over candles to see OHLC data, zoom with mouse wheel, and use the "Go to Realtime" button
              to jump to the latest data.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Supported Instruments</CardTitle>
          <CardDescription>15+ forex pairs, crypto, and commodities</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Major Pairs</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>EUR/USD</li>
                <li>GBP/USD</li>
                <li>USD/JPY</li>
                <li>AUD/USD</li>
                <li>USD/CAD</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Cross Pairs</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>EUR/GBP</li>
                <li>EUR/JPY</li>
                <li>GBP/JPY</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Crypto</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>BTC/USD</li>
                <li>ETH/USD</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Commodities</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>XAU/USD (Gold)</li>
                <li>XAG/USD (Silver)</li>
                <li>WTI/USD (Oil)</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Features</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✓ No API key</li>
                <li>✓ Free forever</li>
                <li>✓ Real-time data</li>
                <li>✓ Since 2003</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
