import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import BrokerQuestionnaire from "@/components/auth/broker-questionnaire"
import { db } from "@/lib/db"
import { users } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export default async function QuestionnairePage() {
  const nextHeaders = await headers()
  const session = await auth.api.getSession({
    headers: nextHeaders,
  })

  if (!session) {
    redirect("/login")
  }

  // Check if user already completed questionnaire
  const user = await db
    .select()
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1)

  if (user[0]?.questionnaireCompleted) {
    redirect("/dashboard")
  }

  return <BrokerQuestionnaire userId={session.user.id} />
}
