import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const {
      userId,
      investmentSize,
      annualIncome,
      investmentExperience,
      riskTolerance,
      investmentObjectives,
      employmentStatus,
      agreedToTerms,
      agreedToRiskDisclosure,
      signatureBase64,
      agreementDate,
    } = body

    // Validate required fields
    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    if (
      !investmentSize ||
      !annualIncome ||
      !investmentExperience ||
      !riskTolerance ||
      !investmentObjectives ||
      !employmentStatus
    ) {
      return NextResponse.json({ error: "All questionnaire fields are required" }, { status: 400 })
    }

    if (!agreedToTerms || !agreedToRiskDisclosure) {
      return NextResponse.json(
        { error: "You must agree to the Terms and Risk Disclosure" },
        { status: 400 }
      )
    }

    if (!signatureBase64) {
      return NextResponse.json({ error: "Signature is required" }, { status: 400 })
    }

    // Update user with questionnaire data
    await db
      .update(users)
      .set({
        investmentSize,
        annualIncome,
        investmentExperience,
        riskTolerance,
        investmentObjectives,
        employmentStatus,
        signatureBase64,
        agreedToTerms: agreedToTerms ? 1 : 0,
        agreedToRiskDisclosure: agreedToRiskDisclosure ? 1 : 0,
        agreementDate: new Date(agreementDate),
        questionnaireCompleted: 1,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error saving broker questionnaire:", error)
    return NextResponse.json(
      { error: "Failed to save questionnaire" },
      { status: 500 }
    )
  }
}
