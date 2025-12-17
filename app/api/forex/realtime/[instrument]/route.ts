import { NextRequest, NextResponse } from 'next/server';
import { getForexRealTimeData } from '@/lib/forex/dukascopy-client';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { instrument: string } }
) {
  try {
    const { instrument } = params;
    const searchParams = request.nextUrl.searchParams;

    // Get parameters
    const timeframe = (searchParams.get('timeframe') || 'tick') as any;
    const format = (searchParams.get('format') || 'json') as any;
    const priceType = (searchParams.get('priceType') || 'bid') as any;
    const last = parseInt(searchParams.get('last') || '10');
    const volumes = searchParams.get('volumes') !== 'false';

    // Optional date range (if not provided, uses 'last' parameter)
    const from = searchParams.get('from');
    const to = searchParams.get('to');

    const result = await getForexRealTimeData({
      instrument: instrument as any,
      timeframe,
      format,
      priceType,
      last,
      volumes,
      ...(from && {
        dates: {
          from: new Date(from),
          to: to ? new Date(to) : new Date(),
        },
      }),
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Forex real-time API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
