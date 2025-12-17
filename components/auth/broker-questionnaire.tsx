"use client"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import SignatureCanvas from "react-signature-canvas"
import Link from "next/link"

interface BrokerQuestionnaireProps {
  userId: string
}

export default function BrokerQuestionnaire({ userId }: BrokerQuestionnaireProps) {
  const router = useRouter()
  const signatureRef = useRef<SignatureCanvas>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [responses, setResponses] = useState({
    investmentSize: "",
    annualIncome: "",
    investmentExperience: "",
    riskTolerance: "",
    investmentObjectives: "",
    employmentStatus: "",
    agreedToTerms: false,
    agreedToRiskDisclosure: false,
  })

  const handleResponseChange = (field: string, value: string | boolean) => {
    setResponses((prev) => ({ ...prev, [field]: value }))
  }

  const clearSignature = () => {
    signatureRef.current?.clear()
  }

  const handleSubmit = async () => {
    // Validate all fields are filled
    const requiredFields = [
      "investmentSize",
      "annualIncome",
      "investmentExperience",
      "riskTolerance",
      "investmentObjectives",
      "employmentStatus",
    ]

    for (const field of requiredFields) {
      if (!responses[field as keyof typeof responses]) {
        alert(`Please complete all required fields: ${field}`)
        return
      }
    }

    if (!responses.agreedToTerms || !responses.agreedToRiskDisclosure) {
      alert("You must agree to the Terms of Service and Risk Disclosure to continue")
      return
    }

    if (signatureRef.current?.isEmpty()) {
      alert("Please provide your signature")
      return
    }

    setIsSubmitting(true)

    try {
      const signatureBase64 = signatureRef.current?.toDataURL()

      const response = await fetch("/api/broker-questionnaire", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          ...responses,
          signatureBase64,
          agreementDate: new Date().toISOString(),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit questionnaire")
      }

      // Redirect to dashboard
      router.push("/dashboard")
    } catch (error) {
      console.error("Error submitting questionnaire:", error)
      alert("Failed to submit questionnaire. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted py-12 px-4">
      <div className="container mx-auto max-w-3xl">
        <Card className="backdrop-blur-sm bg-white/80 border-white/40 shadow-lg">
          <CardHeader>
            <CardTitle className="text-3xl text-center">Broker Account Agreement</CardTitle>
            <CardDescription className="text-center">
              Please complete this questionnaire as required by financial regulations
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            {/* Investment Size */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                1. What is your approximate investment portfolio size?
              </Label>
              <RadioGroup
                value={responses.investmentSize}
                onValueChange={(value) => handleResponseChange("investmentSize", value)}
              >
                <div className="space-y-2">
                  {[
                    "Under $10,000",
                    "$10,000 - $50,000",
                    "$50,000 - $100,000",
                    "$100,000 - $500,000",
                    "$500,000 - $1,000,000",
                    "Over $1,000,000",
                  ].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`size-${option}`} />
                      <Label htmlFor={`size-${option}`} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Annual Income */}
            <div className="space-y-3">
              <Label className="text-base font-medium">2. What is your annual income?</Label>
              <RadioGroup
                value={responses.annualIncome}
                onValueChange={(value) => handleResponseChange("annualIncome", value)}
              >
                <div className="space-y-2">
                  {[
                    "Under $50,000",
                    "$50,000 - $100,000",
                    "$100,000 - $200,000",
                    "$200,000 - $500,000",
                    "Over $500,000",
                  ].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`income-${option}`} />
                      <Label htmlFor={`income-${option}`} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Investment Experience */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                3. What is your level of experience with stock market investing?
              </Label>
              <RadioGroup
                value={responses.investmentExperience}
                onValueChange={(value) => handleResponseChange("investmentExperience", value)}
              >
                <div className="space-y-2">
                  {[
                    "No Experience",
                    "Limited (Less than 2 years)",
                    "Moderate (2-5 years)",
                    "Experienced (5-10 years)",
                    "Very Experienced (Over 10 years)",
                  ].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`exp-${option}`} />
                      <Label htmlFor={`exp-${option}`} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Risk Tolerance */}
            <div className="space-y-3">
              <Label className="text-base font-medium">4. What is your risk tolerance?</Label>
              <RadioGroup
                value={responses.riskTolerance}
                onValueChange={(value) => handleResponseChange("riskTolerance", value)}
              >
                <div className="space-y-2">
                  {[
                    "Conservative (Capital preservation)",
                    "Moderately Conservative (Low risk)",
                    "Moderate (Balanced)",
                    "Moderately Aggressive (Growth oriented)",
                    "Aggressive (Maximum growth)",
                  ].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`risk-${option}`} />
                      <Label htmlFor={`risk-${option}`} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Investment Objectives */}
            <div className="space-y-3">
              <Label className="text-base font-medium">
                5. What are your primary investment objectives?
              </Label>
              <RadioGroup
                value={responses.investmentObjectives}
                onValueChange={(value) => handleResponseChange("investmentObjectives", value)}
              >
                <div className="space-y-2">
                  {[
                    "Capital Preservation",
                    "Income Generation",
                    "Growth",
                    "Speculation",
                    "Diversification",
                  ].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`obj-${option}`} />
                      <Label htmlFor={`obj-${option}`} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Employment Status */}
            <div className="space-y-3">
              <Label className="text-base font-medium">6. What is your employment status?</Label>
              <RadioGroup
                value={responses.employmentStatus}
                onValueChange={(value) => handleResponseChange("employmentStatus", value)}
              >
                <div className="space-y-2">
                  {["Employed", "Self-Employed", "Retired", "Student", "Unemployed"].map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <RadioGroupItem value={option} id={`emp-${option}`} />
                      <Label htmlFor={`emp-${option}`} className="font-normal cursor-pointer">
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
            </div>

            {/* Legal Agreements */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Legal Agreements</h3>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="terms"
                  checked={responses.agreedToTerms}
                  onCheckedChange={(checked) => handleResponseChange("agreedToTerms", checked as boolean)}
                />
                <Label htmlFor="terms" className="font-normal cursor-pointer leading-relaxed">
                  I have read and agree to the{" "}
                  <Link href="/legal/terms" target="_blank" className="text-primary underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/legal/privacy" target="_blank" className="text-primary underline">
                    Privacy Policy
                  </Link>
                </Label>
              </div>

              <div className="flex items-start space-x-3">
                <Checkbox
                  id="risk"
                  checked={responses.agreedToRiskDisclosure}
                  onCheckedChange={(checked) =>
                    handleResponseChange("agreedToRiskDisclosure", checked as boolean)
                  }
                />
                <Label htmlFor="risk" className="font-normal cursor-pointer leading-relaxed">
                  I have read and understand the{" "}
                  <Link
                    href="/docs/risk-disclosure"
                    target="_blank"
                    className="text-primary underline"
                  >
                    Risk Disclosure Statement
                  </Link>
                  . I understand that trading involves risk and I may lose my invested capital.
                </Label>
              </div>
            </div>

            {/* Signature */}
            <div className="space-y-4 border-t pt-6">
              <h3 className="text-lg font-semibold">Signature</h3>
              <p className="text-sm text-muted-foreground">
                By signing below, you confirm that all information provided is accurate and complete.
              </p>

              <div className="border-2 border-muted rounded-md">
                <SignatureCanvas
                  ref={signatureRef}
                  canvasProps={{
                    className: "w-full h-40 cursor-crosshair",
                  }}
                />
              </div>

              <Button variant="outline" size="sm" onClick={clearSignature} type="button">
                Clear Signature
              </Button>
            </div>

            {/* Submit Button */}
            <div className="flex justify-center pt-6">
              <Button size="lg" onClick={handleSubmit} disabled={isSubmitting} className="px-12">
                {isSubmitting ? "Submitting..." : "Submit and Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
