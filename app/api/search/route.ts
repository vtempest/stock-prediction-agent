
import { NextRequest, NextResponse } from "next/server"
import { tavily } from "tavily"

export async function GET(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams
    const query = searchParams.get("q")

    if (!query) {
        return NextResponse.json({ error: "Missing query" }, { status: 400 })
    }

    const apiKey = process.env.TAVILY_API_KEY
    if (!apiKey) {
        return NextResponse.json({ error: "Server configuration error: Missing TAVILY_API_KEY" }, { status: 500 })
    }

    try {
        const tv = tavily({ apiKey })

        // Tavily search options
        const response = await tv.search(query, {
            search_depth: "basic", // or 'advanced'
            include_images: true,
            include_answer: true,
            max_results: 10,
        })

        return NextResponse.json({
            results: response.results.map((r: any) => ({
                title: r.title,
                url: r.url,
                snippet: r.content,
                domain: new URL(r.url).hostname,
                // Tavily doesn't always return favicon or engines, but we fit the SearchWebResponse shape
                favicon: "",
                engines: "tavily"
            }))
        })

    } catch (error: any) {
        console.error("Search API Error:", error)
        return NextResponse.json({ error: "Search failed" }, { status: 500 })
    }
}
