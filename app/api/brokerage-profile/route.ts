import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { brokerageProfiles } from "@/lib/db/schema"
import { BrokerageProfileSchema } from "@/lib/validations/brokerage"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"

// GET - Fetch user's brokerage profile
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

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Don't return sensitive fields
    const { taxId, ...safeProfile } = profile

    return NextResponse.json({
      profile: {
        ...safeProfile,
        taxId: "***-**-****", // Masked
      },
    })
  } catch (error) {
    console.error("Error fetching brokerage profile:", error)
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    )
  }
}

// POST - Create or update brokerage profile
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Validate the data
    const validatedData = BrokerageProfileSchema.parse(body)

    // Check if profile already exists
    const existingProfile = await db.query.brokerageProfiles.findFirst({
      where: eq(brokerageProfiles.userId, session.user.id),
    })

    const now = new Date()

    if (existingProfile) {
      // Update existing profile
      await db
        .update(brokerageProfiles)
        .set({
          ...validatedData,
          updatedAt: now,
          submittedAt: now,
        })
        .where(eq(brokerageProfiles.userId, session.user.id))

      return NextResponse.json({
        message: "Profile updated successfully",
        kycStatus: validatedData.kycStatus,
      })
    } else {
      // Create new profile
      const profileId = crypto.randomUUID()

      await db.insert(brokerageProfiles).values({
        id: profileId,
        userId: session.user.id,
        ...validatedData,
        createdAt: now,
        updatedAt: now,
        submittedAt: now,
      })

      return NextResponse.json({
        message: "Profile created successfully",
        profileId,
        kycStatus: validatedData.kycStatus,
      })
    }
  } catch (error) {
    console.error("Error saving brokerage profile:", error)

    if (error instanceof Error) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: "Failed to save profile" },
      { status: 500 }
    )
  }
}

// PATCH - Update KYC status (Admin only)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // TODO: Add admin role check
    // if (!session.user.isAdmin) {
    //   return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    // }

    const body = await request.json()
    const { userId, kycStatus, accountType, tradingPermissions } = body

    if (!userId || !kycStatus) {
      return NextResponse.json(
        { error: "userId and kycStatus are required" },
        { status: 400 }
      )
    }

    const now = new Date()
    const updateData: any = {
      kycStatus,
      updatedAt: now,
    }

    if (kycStatus === "APPROVED") {
      updateData.approvedAt = now
      updateData.approvedBy = session.user.id
    }

    if (accountType) {
      updateData.accountType = accountType
    }

    if (tradingPermissions) {
      updateData.tradingPermissions = tradingPermissions
    }

    await db
      .update(brokerageProfiles)
      .set(updateData)
      .where(eq(brokerageProfiles.userId, userId))

    return NextResponse.json({
      message: "KYC status updated successfully",
      kycStatus,
    })
  } catch (error) {
    console.error("Error updating KYC status:", error)
    return NextResponse.json(
      { error: "Failed to update KYC status" },
      { status: 500 }
    )
  }
}
