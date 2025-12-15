// Stock Quote API Route
import { NextRequest, NextResponse } from 'next/server';
import YahooFinance from 'yahoo-finance2';

const yahooFinance = new YahooFinance();

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ symbol: string }> }
) {
    try {
        const { symbol } = await params;
        const { searchParams } = new URL(request.url);
        const modulesParam = searchParams.get('modules');

        const modules = modulesParam
            ? modulesParam.split(',')
            : ['price', 'summaryDetail', 'defaultKeyStatistics', 'financialData', 'summaryProfile'];

        const data = await yahooFinance.quoteSummary(symbol, { modules: modules as any });
        
        // Fetch peers/related stocks
        let peers: any[] = [];
        try {
            const recommendations = await yahooFinance.recommendationsBySymbol(symbol);
            if (recommendations && Array.isArray(recommendations)) {
                 peers = recommendations.map((r: any) => r.symbol);
            }
        } catch (e) {
            console.warn(`Failed to fetch recommendations for ${symbol}`, e);
        }

        return NextResponse.json({
            success: true,
            symbol,
            data: { ...data, peers }, // Append peers to data
            timestamp: new Date().toISOString()
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch quote',
                code: 'QUOTE_ERROR',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
