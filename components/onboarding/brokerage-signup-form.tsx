"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Progress } from "@/components/ui/progress"
import { toast } from "sonner"
import {
  BrokerageProfileSchema,
  IdentityStepSchema,
  EmploymentStepSchema,
  FinancialStepSchema,
  InvestmentStepSchema,
  DisclosuresStepSchema,
  type BrokerageProfile,
} from "@/lib/validations/brokerage"

const TOTAL_STEPS = 5

interface BrokerageSignupFormProps {
  userId: string
  onComplete?: () => void
}

export function BrokerageSignupForm({ userId, onComplete }: BrokerageSignupFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<Partial<BrokerageProfile>>({
    resCountry: "USA",
    accountType: "CASH",
    kycStatus: "PENDING",
  })

  // Get current step schema
  const getCurrentStepSchema = () => {
    switch (currentStep) {
      case 1:
        return IdentityStepSchema
      case 2:
        return EmploymentStepSchema
      case 3:
        return FinancialStepSchema
      case 4:
        return InvestmentStepSchema
      case 5:
        return DisclosuresStepSchema
      default:
        return IdentityStepSchema
    }
  }

  const form = useForm<any>({
    resolver: zodResolver(getCurrentStepSchema()),
    defaultValues: formData,
    mode: "onChange",
  })

  const onStepSubmit = async (data: any) => {
    // Save current step data
    const updatedFormData = { ...formData, ...data }
    setFormData(updatedFormData)

    // If not the last step, move to next step
    if (currentStep < TOTAL_STEPS) {
      setCurrentStep(currentStep + 1)
      form.reset(updatedFormData)
      return
    }

    // Final submission
    setIsSubmitting(true)
    try {
      // Validate complete form data
      const validatedData = BrokerageProfileSchema.parse(updatedFormData)

      // Submit to API
      const response = await fetch("/api/brokerage-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validatedData,
          userId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || "Failed to submit brokerage profile")
      }

      toast.success("Brokerage profile submitted successfully!")

      if (onComplete) {
        onComplete()
      } else {
        router.push("/dashboard")
      }
    } catch (error) {
      console.error("Error submitting brokerage profile:", error)
      toast.error(error instanceof Error ? error.message : "Failed to submit profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
      form.reset(formData)
    }
  }

  const progress = (currentStep / TOTAL_STEPS) * 100

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="mb-8">
        <Progress value={progress} className="mb-2" />
        <p className="text-sm text-muted-foreground text-center">
          Step {currentStep} of {TOTAL_STEPS}
        </p>
      </div>

      <form onSubmit={form.handleSubmit(onStepSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>{getStepTitle(currentStep)}</CardTitle>
            <CardDescription>{getStepDescription(currentStep)}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && <IdentityStep form={form} />}
            {currentStep === 2 && <EmploymentStep form={form} />}
            {currentStep === 3 && <FinancialStep form={form} />}
            {currentStep === 4 && <InvestmentStep form={form} />}
            {currentStep === 5 && <DisclosuresStep form={form} />}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {currentStep === TOTAL_STEPS ? (isSubmitting ? "Submitting..." : "Submit") : "Next"}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}

// Step 1: Identity & Personal Information
function IdentityStep({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <Label htmlFor="firstName">First Name *</Label>
          <Input id="firstName" {...form.register("firstName")} />
          {form.formState.errors.firstName && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.firstName.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="middleName">Middle Name</Label>
          <Input id="middleName" {...form.register("middleName")} />
        </div>
        <div>
          <Label htmlFor="lastName">Last Name *</Label>
          <Input id="lastName" {...form.register("lastName")} />
          {form.formState.errors.lastName && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.lastName.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="dateOfBirth">Date of Birth *</Label>
        <Input id="dateOfBirth" type="date" {...form.register("dateOfBirth")} />
        {form.formState.errors.dateOfBirth && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.dateOfBirth.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-medium">Residential Address *</h3>
        <p className="text-xs text-muted-foreground">P.O. Boxes are not allowed</p>

        <Input placeholder="Street Address 1" {...form.register("resStreet1")} />
        {form.formState.errors.resStreet1 && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.resStreet1.message}</p>
        )}

        <Input placeholder="Street Address 2 (Optional)" {...form.register("resStreet2")} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="col-span-2">
            <Input placeholder="City" {...form.register("resCity")} />
            {form.formState.errors.resCity && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.resCity.message}</p>
            )}
          </div>
          <div>
            <Input placeholder="State" {...form.register("resState")} maxLength={2} />
            {form.formState.errors.resState && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.resState.message}</p>
            )}
          </div>
          <div>
            <Input placeholder="ZIP" {...form.register("resZip")} />
            {form.formState.errors.resZip && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.resZip.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="taxIdType">Tax ID Type *</Label>
          <Select onValueChange={(value) => form.setValue("taxIdType", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select Tax ID Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SSN">SSN (US Citizens)</SelectItem>
              <SelectItem value="ITIN">ITIN (US Residents)</SelectItem>
              <SelectItem value="FOREIGN_TAX_ID">Foreign Tax ID</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.taxIdType && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.taxIdType.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="taxId">Tax ID (SSN/ITIN) *</Label>
          <Input id="taxId" type="password" placeholder="XXX-XX-XXXX" {...form.register("taxId")} />
          {form.formState.errors.taxId && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.taxId.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="citizenshipCountry">Country of Citizenship *</Label>
          <Input id="citizenshipCountry" defaultValue="USA" {...form.register("citizenshipCountry")} />
          {form.formState.errors.citizenshipCountry && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.citizenshipCountry.message}</p>
          )}
        </div>
        <div>
          <Label htmlFor="visaType">Visa Type (if applicable)</Label>
          <Input id="visaType" placeholder="e.g., H1B, F1" {...form.register("visaType")} />
        </div>
      </div>
    </div>
  )
}

// Step 2: Employment Information
function EmploymentStep({ form }: { form: any }) {
  const [employmentStatus, setEmploymentStatus] = useState(form.getValues("employmentStatus"))
  const [isControlPerson, setIsControlPerson] = useState(form.getValues("isControlPerson"))

  return (
    <div className="space-y-4">
      <div>
        <Label>Employment Status *</Label>
        <RadioGroup
          value={employmentStatus}
          onValueChange={(value) => {
            setEmploymentStatus(value)
            form.setValue("employmentStatus", value)
          }}
          className="mt-2"
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="EMPLOYED" id="employed" />
            <Label htmlFor="employed">Employed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="SELF_EMPLOYED" id="self_employed" />
            <Label htmlFor="self_employed">Self-Employed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="UNEMPLOYED" id="unemployed" />
            <Label htmlFor="unemployed">Unemployed</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="RETIRED" id="retired" />
            <Label htmlFor="retired">Retired</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="STUDENT" id="student" />
            <Label htmlFor="student">Student</Label>
          </div>
        </RadioGroup>
        {form.formState.errors.employmentStatus && (
          <p className="text-sm text-red-500 mt-1">{form.formState.errors.employmentStatus.message}</p>
        )}
      </div>

      {(employmentStatus === "EMPLOYED" || employmentStatus === "SELF_EMPLOYED") && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="employerName">Employer Name *</Label>
            <Input id="employerName" {...form.register("employerName")} />
            {form.formState.errors.employerName && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.employerName.message}</p>
            )}
          </div>
          <div>
            <Label htmlFor="occupation">Occupation *</Label>
            <Input id="occupation" placeholder="e.g., Software Engineer" {...form.register("occupation")} />
          </div>
        </div>
      )}

      <div className="space-y-3 border-t pt-4">
        <h3 className="text-sm font-medium">Regulatory Disclosures</h3>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="isAffiliatedBrokerDealer"
            onCheckedChange={(checked) => form.setValue("isAffiliatedBrokerDealer", checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="isAffiliatedBrokerDealer" className="font-normal">
              I am associated with a FINRA member firm or broker-dealer
            </Label>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="isControlPerson"
            onCheckedChange={(checked) => {
              setIsControlPerson(checked)
              form.setValue("isControlPerson", checked)
            }}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="isControlPerson" className="font-normal">
              I am a 10% shareholder or director of a publicly traded company
            </Label>
          </div>
        </div>

        {isControlPerson && (
          <div>
            <Label htmlFor="controlPersonTickers">Ticker Symbols *</Label>
            <Input
              id="controlPersonTickers"
              placeholder="e.g., TSLA, AAPL"
              {...form.register("controlPersonTickers")}
            />
            {form.formState.errors.controlPersonTickers && (
              <p className="text-sm text-red-500 mt-1">{form.formState.errors.controlPersonTickers.message}</p>
            )}
          </div>
        )}

        <div className="flex items-start space-x-2">
          <Checkbox
            id="isPoliticallyExposed"
            onCheckedChange={(checked) => form.setValue("isPoliticallyExposed", checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="isPoliticallyExposed" className="font-normal">
              I am a senior political figure or hold a significant public position
            </Label>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 3: Financial Profile
function FinancialStep({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="annualIncome">Annual Income *</Label>
          <Select onValueChange={(value) => form.setValue("annualIncome", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<25K">Less than $25,000</SelectItem>
              <SelectItem value="25K-50K">$25,000 - $50,000</SelectItem>
              <SelectItem value="50K-100K">$50,000 - $100,000</SelectItem>
              <SelectItem value="100K-200K">$100,000 - $200,000</SelectItem>
              <SelectItem value="200K-500K">$200,000 - $500,000</SelectItem>
              <SelectItem value="500K+">$500,000+</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.annualIncome && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.annualIncome.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="incomeSource">Primary Income Source *</Label>
          <Select onValueChange={(value) => form.setValue("incomeSource", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select source" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SALARY">Salary/Wages</SelectItem>
              <SelectItem value="INVESTMENTS">Investments</SelectItem>
              <SelectItem value="INHERITANCE">Inheritance</SelectItem>
              <SelectItem value="BUSINESS">Business Income</SelectItem>
              <SelectItem value="RETIREMENT">Retirement/Pension</SelectItem>
              <SelectItem value="OTHER">Other</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.incomeSource && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.incomeSource.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="totalNetWorth">Total Net Worth *</Label>
          <Select onValueChange={(value) => form.setValue("totalNetWorth", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<50K">Less than $50,000</SelectItem>
              <SelectItem value="50K-100K">$50,000 - $100,000</SelectItem>
              <SelectItem value="100K-250K">$100,000 - $250,000</SelectItem>
              <SelectItem value="250K-500K">$250,000 - $500,000</SelectItem>
              <SelectItem value="500K-1M">$500,000 - $1,000,000</SelectItem>
              <SelectItem value="1M-5M">$1,000,000 - $5,000,000</SelectItem>
              <SelectItem value="5M+">$5,000,000+</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.totalNetWorth && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.totalNetWorth.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="liquidNetWorth">Liquid Net Worth *</Label>
          <Select onValueChange={(value) => form.setValue("liquidNetWorth", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="<50K">Less than $50,000</SelectItem>
              <SelectItem value="50K-100K">$50,000 - $100,000</SelectItem>
              <SelectItem value="100K-250K">$100,000 - $250,000</SelectItem>
              <SelectItem value="250K-500K">$250,000 - $500,000</SelectItem>
              <SelectItem value="500K-1M">$500,000 - $1,000,000</SelectItem>
              <SelectItem value="1M-5M">$1,000,000 - $5,000,000</SelectItem>
              <SelectItem value="5M+">$5,000,000+</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground mt-1">Cash + marketable securities</p>
          {form.formState.errors.liquidNetWorth && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.liquidNetWorth.message}</p>
          )}
        </div>
      </div>

      <div>
        <Label htmlFor="taxBracket">Federal Tax Bracket (Optional)</Label>
        <Select onValueChange={(value) => form.setValue("taxBracket", value)}>
          <SelectTrigger>
            <SelectValue placeholder="Select tax bracket" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="10%">10%</SelectItem>
            <SelectItem value="12%">12%</SelectItem>
            <SelectItem value="22%">22%</SelectItem>
            <SelectItem value="24%">24%</SelectItem>
            <SelectItem value="32%">32%</SelectItem>
            <SelectItem value="35%">35%</SelectItem>
            <SelectItem value="37%">37%</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}

// Step 4: Investment Profile
function InvestmentStep({ form }: { form: any }) {
  const [experience, setExperience] = useState({
    equities: { years: "0", tradesPerYear: "0-5", knowledgeLevel: "NONE" },
    options: { years: "0", tradesPerYear: "0-5", knowledgeLevel: "NONE" },
    crypto: { years: "0", tradesPerYear: "0-5", knowledgeLevel: "NONE" },
  })

  const updateExperience = () => {
    form.setValue("investmentExperience", JSON.stringify(experience))
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="investmentObjective">Investment Objective *</Label>
          <Select onValueChange={(value) => form.setValue("investmentObjective", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select objective" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="CAPITAL_PRESERVATION">Capital Preservation</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="GROWTH">Growth</SelectItem>
              <SelectItem value="SPECULATION">Speculation</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.investmentObjective && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.investmentObjective.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="riskTolerance">Risk Tolerance *</Label>
          <Select onValueChange={(value) => form.setValue("riskTolerance", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select risk level" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">Low / Conservative</SelectItem>
              <SelectItem value="MEDIUM">Medium / Moderate</SelectItem>
              <SelectItem value="HIGH">High / Aggressive</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.riskTolerance && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.riskTolerance.message}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="timeHorizon">Investment Time Horizon *</Label>
          <Select onValueChange={(value) => form.setValue("timeHorizon", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select time horizon" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SHORT">Short (&lt; 3 years)</SelectItem>
              <SelectItem value="AVERAGE">Average (4-7 years)</SelectItem>
              <SelectItem value="LONG">Long (7+ years)</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.timeHorizon && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.timeHorizon.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="liquidityNeeds">Liquidity Needs *</Label>
          <Select onValueChange={(value) => form.setValue("liquidityNeeds", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select liquidity needs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="VERY_IMPORTANT">Very Important</SelectItem>
              <SelectItem value="SOMEWHAT_IMPORTANT">Somewhat Important</SelectItem>
              <SelectItem value="NOT_IMPORTANT">Not Important</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.liquidityNeeds && (
            <p className="text-sm text-red-500 mt-1">{form.formState.errors.liquidityNeeds.message}</p>
          )}
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-4">Investment Experience *</h3>

        {/* Equities Experience */}
        <div className="mb-4 p-4 border rounded-lg">
          <h4 className="font-medium mb-3">Stocks/Equities</h4>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Years Trading</Label>
              <Select
                value={experience.equities.years}
                onValueChange={(value) => {
                  const newExp = { ...experience, equities: { ...experience.equities, years: value as any } }
                  setExperience(newExp)
                  updateExperience()
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">None</SelectItem>
                  <SelectItem value="1-2">1-2 years</SelectItem>
                  <SelectItem value="3-5">3-5 years</SelectItem>
                  <SelectItem value="5+">5+ years</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Trades/Year</Label>
              <Select
                value={experience.equities.tradesPerYear}
                onValueChange={(value) => {
                  const newExp = { ...experience, equities: { ...experience.equities, tradesPerYear: value as any } }
                  setExperience(newExp)
                  updateExperience()
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0-5">0-5</SelectItem>
                  <SelectItem value="6-30">6-30</SelectItem>
                  <SelectItem value="30-100">30-100</SelectItem>
                  <SelectItem value="100+">100+</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Knowledge</Label>
              <Select
                value={experience.equities.knowledgeLevel}
                onValueChange={(value) => {
                  const newExp = { ...experience, equities: { ...experience.equities, knowledgeLevel: value as any } }
                  setExperience(newExp)
                  updateExperience()
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NONE">None</SelectItem>
                  <SelectItem value="LIMITED">Limited</SelectItem>
                  <SelectItem value="GOOD">Good</SelectItem>
                  <SelectItem value="EXTENSIVE">Extensive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Step 5: Disclosures & Agreements
function DisclosuresStep({ form }: { form: any }) {
  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <h3 className="text-sm font-medium">Trusted Contact (Optional but Recommended)</h3>
        <p className="text-xs text-muted-foreground">
          FINRA Rule 4512 requires firms to request a trusted contact person to protect your account.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="trustedContactName">Name</Label>
            <Input id="trustedContactName" {...form.register("trustedContactName")} />
          </div>
          <div>
            <Label htmlFor="trustedContactPhone">Phone</Label>
            <Input id="trustedContactPhone" type="tel" {...form.register("trustedContactPhone")} />
          </div>
        </div>
        <div>
          <Label htmlFor="trustedContactEmail">Email</Label>
          <Input id="trustedContactEmail" type="email" {...form.register("trustedContactEmail")} />
        </div>
      </div>

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium mb-3">Account Type</h3>
        <RadioGroup
          defaultValue="CASH"
          onValueChange={(value) => form.setValue("accountType", value)}
        >
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="CASH" id="cash" />
            <Label htmlFor="cash">Cash Account (No margin/borrowing)</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="MARGIN" id="margin" />
            <Label htmlFor="margin">Margin Account (Borrowing enabled)</Label>
          </div>
        </RadioGroup>
      </div>

      <div className="border-t pt-4 space-y-3">
        <h3 className="text-sm font-medium">Required Agreements *</h3>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="w9Certified"
            onCheckedChange={(checked) => form.setValue("w9Certified", checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="w9Certified" className="font-normal">
              I certify under penalty of perjury that the tax information provided is accurate (W-9/W-8BEN)
            </Label>
          </div>
        </div>
        {form.formState.errors.w9Certified && (
          <p className="text-sm text-red-500">{form.formState.errors.w9Certified.message}</p>
        )}

        <div className="flex items-start space-x-2">
          <Checkbox
            id="isNonProfessionalSubscriber"
            defaultChecked
            onCheckedChange={(checked) => form.setValue("isNonProfessionalSubscriber", checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="isNonProfessionalSubscriber" className="font-normal">
              I am a non-professional subscriber for real-time market data
            </Label>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="privacyPolicyAccepted"
            onCheckedChange={(checked) => form.setValue("privacyPolicyAccepted", checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="privacyPolicyAccepted" className="font-normal">
              I accept the <a href="/privacy" target="_blank" className="underline">Privacy Policy</a>
            </Label>
          </div>
        </div>
        {form.formState.errors.privacyPolicyAccepted && (
          <p className="text-sm text-red-500">{form.formState.errors.privacyPolicyAccepted.message}</p>
        )}

        <div className="flex items-start space-x-2">
          <Checkbox
            id="termsAccepted"
            onCheckedChange={(checked) => form.setValue("termsAccepted", checked)}
          />
          <div className="grid gap-1.5 leading-none">
            <Label htmlFor="termsAccepted" className="font-normal">
              I accept the <a href="/terms" target="_blank" className="underline">Terms of Service</a> and{" "}
              <a href="/customer-agreement" target="_blank" className="underline">Customer Agreement</a>
            </Label>
          </div>
        </div>
        {form.formState.errors.termsAccepted && (
          <p className="text-sm text-red-500">{form.formState.errors.termsAccepted.message}</p>
        )}
      </div>

      <div className="bg-muted p-4 rounded-lg text-sm">
        <p className="font-medium mb-2">Important Information:</p>
        <ul className="list-disc list-inside space-y-1 text-muted-foreground">
          <li>All information will be verified for compliance with securities regulations</li>
          <li>Your account will be reviewed before approval (typically 1-2 business days)</li>
          <li>You will receive an email notification when your account is approved</li>
          <li>Providing false information may result in account closure and legal consequences</li>
        </ul>
      </div>
    </div>
  )
}

function getStepTitle(step: number): string {
  switch (step) {
    case 1:
      return "Personal Information"
    case 2:
      return "Employment & Affiliations"
    case 3:
      return "Financial Profile"
    case 4:
      return "Investment Experience"
    case 5:
      return "Disclosures & Agreements"
    default:
      return ""
  }
}

function getStepDescription(step: number): string {
  switch (step) {
    case 1:
      return "We need to verify your identity to comply with federal regulations (CIP & AML)."
    case 2:
      return "Employment information helps us ensure compliance with FINRA Rule 3210."
    case 3:
      return "This helps us understand your financial situation and suitability for trading."
    case 4:
      return "Your investment goals and experience determine appropriate trading permissions."
    case 5:
      return "Please review and accept the required agreements to complete your account setup."
    default:
      return ""
  }
}
