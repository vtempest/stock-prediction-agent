import { NextRequest, NextResponse } from 'next/server';
import { getForexHistoricalData } from '@/lib/forex/dukascopy-client';

export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { instrument: string } }
) {
  try {
    const { instrument } = params;
    const searchParams = request.nextUrl.searchParams;

    // Get date range
    const from = searchParams.get('from');
    const to = searchParams.get('to');
    const range = searchParams.get('range'); // e.g., '1d', '7d', '1mo'

    // Get other parameters
    const timeframe = (searchParams.get('timeframe') || 'd1') as any;
    const format = (searchParams.get('format') || 'json') as any;
    const priceType = (searchParams.get('priceType') || 'bid') as any;
    const volumes = searchParams.get('volumes') !== 'false';

    // Calculate date range
    let fromDate: Date;
    let toDate: Date = new Date();

    if (from) {
      fromDate = new Date(from);
    } else if (range) {
      // Parse range string
      const rangeMatch = range.match(/^(\d+)([dmyhw])$/);
      if (!rangeMatch) {
        return NextResponse.json(
          { success: false, error: 'Invalid range format' },
          { status: 400 }
        );
      }

      const [, value, unit] = rangeMatch;
      const now = new Date();
      fromDate = new Date(now);

      switch (unit) {
        case 'd':
          fromDate.setDate(now.getDate() - parseInt(value));
          break;
        case 'w':
          fromDate.setDate(now.getDate() - parseInt(value) * 7);
          break;
        case 'm':
          fromDate.setMonth(now.getMonth() - parseInt(value));
          break;
        case 'y':
          fromDate.setFullYear(now.getFullYear() - parseInt(value));
          break;
        case 'h':
          fromDate.setHours(now.getHours() - parseInt(value));
          break;
      }
    } else {
      // Default to 1 month
      fromDate = new Date();
      fromDate.setMonth(fromDate.getMonth() - 1);
    }

    if (to) {
      toDate = new Date(to);
    }

    const result = await getForexHistoricalData({
      instrument: instrument as any,
      dates: {
        from: fromDate,
        to: toDate,
      },
      timeframe,
      format,
      priceType,
      volumes,
    });

    if (!result.success) {
      return NextResponse.json(result, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Forex historical API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Internal server error',
      },
      { status: 500 }
    );
  }
}
