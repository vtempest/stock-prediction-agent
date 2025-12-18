import { Suspense } from "react"
import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { db } from "@/lib/db"
import { brokerageProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { BrokerageSignupForm } from "@/components/onboarding/brokerage-signup-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default async function OnboardingPage() {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user) {
    redirect("/login")
  }

  // Check if user already has a brokerage profile
  const existingProfile = await db.query.brokerageProfiles.findFirst({
    where: eq(brokerageProfiles.userId, session.user.id),
  })

  // If approved, redirect to dashboard
  if (existingProfile && existingProfile.kycStatus === "APPROVED") {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background py-12">
      <div className="container max-w-4xl mx-auto px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Complete Your Account Setup</h1>
          <p className="text-muted-foreground">
            To comply with securities regulations, we need to collect some information about you.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            This information is required by FINRA, SEC, and anti-money laundering (AML) laws.
          </p>
        </div>

        {existingProfile && existingProfile.kycStatus === "REVIEW" ? (
          <Card className="max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle>Application Under Review</CardTitle>
              <CardDescription>
                Your brokerage account application is currently being reviewed by our compliance team.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p>
                  We typically complete reviews within 1-2 business days. You'll receive an email notification
                  once your account has been approved.
                </p>
                <p className="text-sm text-muted-foreground">
                  If we need any additional information, we'll contact you at {session.user.email}.
                </p>
              </div>
            </CardContent>
          </Card>
        ) : existingProfile && existingProfile.kycStatus === "REJECTED" ? (
          <Card className="max-w-2xl mx-auto border-red-500">
            <CardHeader>
              <CardTitle className="text-red-500">Application Rejected</CardTitle>
              <CardDescription>
                Unfortunately, we were unable to approve your brokerage account at this time.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                Please contact our support team at support@example.com for more information.
              </p>
            </CardContent>
          </Card>
        ) : (
          <Suspense fallback={<div>Loading...</div>}>
            <BrokerageSignupForm userId={session.user.id} />
          </Suspense>
        )}

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>
            Your information is encrypted and secured. We will never share your personal information
            without your consent.
          </p>
          <p className="mt-2">
            Questions? Contact us at{" "}
            <a href="mailto:support@example.com" className="underline">
              support@example.com
            </a>
          </p>
        </div>
      </div>
    </div>
  )
}
