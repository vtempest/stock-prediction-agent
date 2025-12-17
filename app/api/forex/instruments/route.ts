import { NextResponse } from 'next/server';
import { FOREX_INSTRUMENTS } from '@/lib/forex/dukascopy-client';

export const runtime = 'nodejs';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: FOREX_INSTRUMENTS,
  });
}
