// SEC Filings API Route
import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const STOCK_NAMES_FILE = path.join(process.cwd(), 'lib/data/stock-names.json');

// Helper to pad CIK with zeros to 10 digits as required by SEC API
function padCik(cik: string | number): string {
    return String(cik).padStart(10, '0');
}

export async function GET(
    request: NextRequest,
    { params }: { params: { symbol: string } }
) {
    try {
        const { symbol } = params;
        const { searchParams } = new URL(request.url);
        const limit = parseInt(searchParams.get('limit') || '20');

        // Check if stock names file exists
        if (!fs.existsSync(STOCK_NAMES_FILE)) {
            return NextResponse.json(
                {
                    success: false,
                    error: 'Stock data not available. Please run import:stocks first.',
                    code: 'DATA_UNAVAILABLE',
                    timestamp: new Date().toISOString()
                },
                { status: 503 }
            );
        }

        // Read and parse stock data to find CIK
        const fileContent = fs.readFileSync(STOCK_NAMES_FILE, 'utf-8');
        const stocks = JSON.parse(fileContent); // Array of arrays: [symbol, name, sector, industry, marketCap, cik]
        
        // Find stock by symbol (case insensitive)
        const stockData = stocks.find((s: any[]) => 
            String(s[0]).toLowerCase() === symbol.toLowerCase()
        );

        if (!stockData) {
            return NextResponse.json(
                {
                    success: false,
                    error: `Symbol ${symbol} not found`,
                    code: 'SYMBOL_NOT_FOUND',
                    timestamp: new Date().toISOString()
                },
                { status: 404 }
            );
        }

        const cik = stockData[5]; // CIK is at index 5

        if (!cik) {
            return NextResponse.json(
                {
                    success: false,
                    error: `No CIK found for ${symbol}. Cannot fetch filings.`,
                    code: 'CIK_NOT_FOUND',
                    timestamp: new Date().toISOString()
                },
                { status: 404 }
            );
        }

        // Fetch filings from SEC EDGAR API
        // NOTE: SEC requires a valid User-Agent with contact info (email/website)
        const paddedCik = padCik(cik);
        // Using submissions endpoint which contains recent filings
        const secUrl = `https://data.sec.gov/submissions/CIK${paddedCik}.json`;
        
        console.log(`Fetching filings for ${symbol} (CIK: ${cik}) from ${secUrl}`);

        const response = await fetch(secUrl, {
            headers: {
                // SEC requires specific User-Agent format: AppName ContactEmail
                'User-Agent': 'StockPredictionAgent (admin@example.com)',
                'Accept-Encoding': 'gzip, deflate',
                'Host': 'data.sec.gov'
            }
        });

        if (!response.ok) {
            throw new Error(`SEC API returned ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        
        // Transform the messy separate arrays into array of objects
        const filings = [];
        if (data.filings && data.filings.recent) {
            const recent = data.filings.recent;
            const count = recent.accessionNumber.length;
            
            for (let i = 0; i < Math.min(count, limit); i++) {
                filings.push({
                    accessionNumber: recent.accessionNumber[i],
                    filingDate: recent.filingDate[i],
                    reportDate: recent.reportDate[i],
                    acceptanceDateTime: recent.acceptanceDateTime[i],
                    act: recent.act[i],
                    form: recent.form[i],
                    fileNumber: recent.fileNumber[i],
                    filmNumber: recent.filmNumber[i],
                    items: recent.items[i],
                    size: recent.size[i],
                    isXBRL: recent.isXBRL[i],
                    isInlineXBRL: recent.isInlineXBRL[i],
                    primaryDocument: recent.primaryDocument[i],
                    primaryDocDescription: recent.primaryDocDescription[i],
                    url: `https://www.sec.gov/Archives/edgar/data/${cik}/${recent.accessionNumber[i].replace(/-/g, '')}/${recent.primaryDocument[i]}`
                });
            }
        }

        return NextResponse.json({
            success: true,
            symbol: symbol.toUpperCase(),
            cik: cik,
            companyName: data.name,
            sic: data.sic,
            sicDescription: data.sicDescription,
            fiscalYearEnd: data.fiscalYearEnd,
            stateOfIncorporation: data.stateOfIncorporation,
            filings: filings,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('SEC Filings Error:', error);
        return NextResponse.json(
            {
                success: false,
                error: error.message || 'Failed to fetch SEC filings',
                code: 'SEC_FETCH_ERROR',
                timestamp: new Date().toISOString()
            },
            { status: 500 }
        );
    }
}
