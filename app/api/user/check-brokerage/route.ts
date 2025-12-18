import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { brokerageProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const profile = await db.query.brokerageProfiles.findFirst({
      where: eq(brokerageProfiles.userId, session.user.id),
    })

    return NextResponse.json({
      hasProfile: !!profile,
      kycStatus: profile?.kycStatus || null,
      accountType: profile?.accountType || null,
      needsOnboarding: !profile || profile.kycStatus === "PENDING",
    })
  } catch (error) {
    console.error("Error checking brokerage profile:", error)
    return NextResponse.json(
      { error: "Failed to check profile status" },
      { status: 500 }
    )
  }
}
