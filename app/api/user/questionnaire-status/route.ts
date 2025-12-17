import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export async function GET(request: NextRequest) {
  try {
    const nextHeaders = await headers()
    const session = await auth.api.getSession({
      headers: nextHeaders,
    })

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await db
      .select({
        questionnaireCompleted: users.questionnaireCompleted,
      })
      .from(users)
      .where(eq(users.id, session.user.id))
      .limit(1)

    return NextResponse.json({
      completed: user[0]?.questionnaireCompleted || false,
    })
  } catch (error) {
    console.error("Error checking questionnaire status:", error)
    return NextResponse.json(
      { error: "Failed to check questionnaire status" },
      { status: 500 }
    )
  }
}
