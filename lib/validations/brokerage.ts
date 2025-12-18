import { z } from "zod"

// ========== Enums for Brokerage Profile ==========

export const TaxIdType = z.enum(["SSN", "ITIN", "FOREIGN_TAX_ID"])

export const EmploymentStatus = z.enum([
  "EMPLOYED",
  "UNEMPLOYED",
  "RETIRED",
  "STUDENT",
  "SELF_EMPLOYED",
])

export const IncomeRange = z.enum([
  "<25K",
  "25K-50K",
  "50K-100K",
  "100K-200K",
  "200K-500K",
  "500K+",
])

export const IncomeSource = z.enum([
  "SALARY",
  "INVESTMENTS",
  "INHERITANCE",
  "BUSINESS",
  "RETIREMENT",
  "OTHER",
])

export const NetWorthRange = z.enum([
  "<50K",
  "50K-100K",
  "100K-250K",
  "250K-500K",
  "500K-1M",
  "1M-5M",
  "5M+",
])

export const TaxBracket = z.enum([
  "10%",
  "12%",
  "22%",
  "24%",
  "32%",
  "35%",
  "37%",
])

export const InvestmentObjective = z.enum([
  "INCOME",
  "GROWTH",
  "SPECULATION",
  "CAPITAL_PRESERVATION",
])

export const RiskTolerance = z.enum(["LOW", "MEDIUM", "HIGH"])

export const TimeHorizon = z.enum(["SHORT", "AVERAGE", "LONG"])

export const LiquidityNeeds = z.enum([
  "VERY_IMPORTANT",
  "SOMEWHAT_IMPORTANT",
  "NOT_IMPORTANT",
])

export const KYCStatus = z.enum(["PENDING", "REVIEW", "APPROVED", "REJECTED"])

export const AccountType = z.enum(["CASH", "MARGIN", "PM"])

export const ExperienceYears = z.enum(["0", "1-2", "3-5", "5+"])

export const TradesPerYear = z.enum(["0-5", "6-30", "30-100", "100+"])

export const KnowledgeLevel = z.enum(["NONE", "LIMITED", "GOOD", "EXTENSIVE"])

// ========== Sub-Schemas ==========

// Investment Experience for a specific asset class
export const AssetExperienceSchema = z.object({
  years: ExperienceYears,
  tradesPerYear: TradesPerYear,
  knowledgeLevel: KnowledgeLevel,
})

// Full investment experience across asset classes
export const InvestmentExperienceSchema = z.object({
  equities: AssetExperienceSchema,
  options: AssetExperienceSchema.optional(),
  crypto: AssetExperienceSchema.optional(),
  futures: AssetExperienceSchema.optional(),
  forex: AssetExperienceSchema.optional(),
})

// Residential Address Schema
export const ResidentialAddressSchema = z.object({
  street1: z.string().min(1, "Street address is required").max(200),
  street2: z.string().max(200).optional(),
  city: z.string().min(1, "City is required").max(100),
  state: z.string().min(2, "State is required").max(50),
  zip: z.string().min(5, "Valid ZIP code is required").max(10),
  country: z.string().min(1, "Country is required").default("USA"),
})

// Mailing Address Schema (Optional)
export const MailingAddressSchema = z
  .object({
    street1: z.string().max(200).optional(),
    street2: z.string().max(200).optional(),
    city: z.string().max(100).optional(),
    state: z.string().max(50).optional(),
    zip: z.string().max(10).optional(),
    country: z.string().max(100).optional(),
  })
  .optional()

// Trusted Contact Schema
export const TrustedContactSchema = z.object({
  name: z.string().max(200).optional(),
  phone: z.string().max(20).optional(),
  email: z.string().email("Valid email required").optional(),
})

// ========== Main Brokerage Profile Schema ==========

export const BrokerageProfileSchema = z
  .object({
    // ========== I. Identity Object (CIP & AML) ==========
    firstName: z
      .string()
      .min(1, "First name is required")
      .max(100, "First name is too long"),
    middleName: z.string().max(100).optional(),
    lastName: z
      .string()
      .min(1, "Last name is required")
      .max(100, "Last name is too long"),

    // Residential Address
    resStreet1: z
      .string()
      .min(1, "Street address is required")
      .max(200)
      .refine((val) => !val.toLowerCase().includes("p.o. box"), {
        message: "P.O. Boxes are not allowed for residential address",
      }),
    resStreet2: z.string().max(200).optional(),
    resCity: z.string().min(1, "City is required").max(100),
    resState: z.string().min(2, "State is required").max(50),
    resZip: z
      .string()
      .min(5, "Valid ZIP code is required")
      .max(10)
      .regex(/^\d{5}(-\d{4})?$/, "Invalid ZIP code format"),
    resCountry: z.string().min(1, "Country is required").default("USA"),

    // Mailing Address (Optional)
    mailStreet1: z.string().max(200).optional(),
    mailStreet2: z.string().max(200).optional(),
    mailCity: z.string().max(100).optional(),
    mailState: z.string().max(50).optional(),
    mailZip: z.string().max(10).optional(),
    mailCountry: z.string().max(100).optional(),

    // Date of Birth & Tax ID
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format")
      .refine(
        (date) => {
          const birthDate = new Date(date)
          const today = new Date()
          const age = today.getFullYear() - birthDate.getFullYear()
          return age >= 18
        },
        { message: "You must be at least 18 years old" }
      ),
    taxIdType: TaxIdType,
    taxId: z
      .string()
      .min(9, "Tax ID must be at least 9 characters")
      .max(20)
      .refine(
        (val) => {
          // Remove hyphens and spaces for validation
          const cleaned = val.replace(/[-\s]/g, "")
          return /^\d+$/.test(cleaned)
        },
        { message: "Tax ID must contain only numbers" }
      ),

    // Citizenship Status
    citizenshipCountry: z.string().min(1, "Citizenship country is required"),
    visaType: z.string().max(50).optional(),

    // Trusted Contact
    trustedContactName: z.string().max(200).optional(),
    trustedContactPhone: z.string().max(20).optional(),
    trustedContactEmail: z.string().email().optional().or(z.literal("")),

    // ========== II. Employment Object (Rule 3210) ==========
    employmentStatus: EmploymentStatus,
    employerName: z.string().max(200).optional(),
    occupation: z.string().max(200).optional(),
    industryCode: z.string().max(50).optional(),

    // Affiliation Flags
    isAffiliatedBrokerDealer: z.boolean().default(false),
    isControlPerson: z.boolean().default(false),
    controlPersonTickers: z.string().optional(), // JSON array
    isPoliticallyExposed: z.boolean().default(false),

    // ========== III. Financial Profile Object (Suitability) ==========
    annualIncome: IncomeRange,
    incomeSource: IncomeSource,
    totalNetWorth: NetWorthRange,
    liquidNetWorth: NetWorthRange,
    taxBracket: TaxBracket.optional(),

    // ========== IV. Investment Profile Object (Risk & Permissions) ==========
    investmentObjective: InvestmentObjective,
    riskTolerance: RiskTolerance,
    timeHorizon: TimeHorizon,
    liquidityNeeds: LiquidityNeeds,
    investmentExperience: z.string(), // JSON string

    // ========== V. Disclosures & Agreements ==========
    w9Certified: z.boolean(),
    isNonProfessionalSubscriber: z.boolean().default(true),
    marginAgreementAccepted: z.boolean().default(false),
    privacyPolicyAccepted: z.boolean(),
    termsAccepted: z.boolean(),

    // ========== VI. Infrastructure / API Logic ==========
    kycStatus: KYCStatus.default("PENDING"),
    accountType: AccountType.default("CASH"),
  })
  .refine(
    (data) => {
      // Validate that employer info is provided if employed
      if (
        (data.employmentStatus === "EMPLOYED" ||
          data.employmentStatus === "SELF_EMPLOYED") &&
        !data.employerName
      ) {
        return false
      }
      return true
    },
    {
      message:
        "Employer name is required when employment status is EMPLOYED or SELF_EMPLOYED",
      path: ["employerName"],
    }
  )
  .refine(
    (data) => {
      // Validate control person tickers if applicable
      if (data.isControlPerson && !data.controlPersonTickers) {
        return false
      }
      return true
    },
    {
      message:
        "Ticker symbols are required if you are a control person of a public company",
      path: ["controlPersonTickers"],
    }
  )
  .refine(
    (data) => {
      // Validate that privacy policy and terms are accepted
      return data.privacyPolicyAccepted && data.termsAccepted
    },
    {
      message: "You must accept the privacy policy and terms of service",
      path: ["termsAccepted"],
    }
  )
  .refine(
    (data) => {
      // Validate W-9 certification
      return data.w9Certified
    },
    {
      message: "W-9/W-8BEN certification is required",
      path: ["w9Certified"],
    }
  )

// Type inference
export type BrokerageProfile = z.infer<typeof BrokerageProfileSchema>
export type InvestmentExperience = z.infer<typeof InvestmentExperienceSchema>
export type AssetExperience = z.infer<typeof AssetExperienceSchema>

// ========== Step-by-Step Validation Schemas ==========
// For multi-step form validation

export const IdentityStepSchema = BrokerageProfileSchema.pick({
  firstName: true,
  middleName: true,
  lastName: true,
  resStreet1: true,
  resStreet2: true,
  resCity: true,
  resState: true,
  resZip: true,
  resCountry: true,
  dateOfBirth: true,
  taxIdType: true,
  taxId: true,
  citizenshipCountry: true,
  visaType: true,
})

export const EmploymentStepSchema = BrokerageProfileSchema.pick({
  employmentStatus: true,
  employerName: true,
  occupation: true,
  industryCode: true,
  isAffiliatedBrokerDealer: true,
  isControlPerson: true,
  controlPersonTickers: true,
  isPoliticallyExposed: true,
})

export const FinancialStepSchema = BrokerageProfileSchema.pick({
  annualIncome: true,
  incomeSource: true,
  totalNetWorth: true,
  liquidNetWorth: true,
  taxBracket: true,
})

export const InvestmentStepSchema = BrokerageProfileSchema.pick({
  investmentObjective: true,
  riskTolerance: true,
  timeHorizon: true,
  liquidityNeeds: true,
  investmentExperience: true,
})

export const DisclosuresStepSchema = BrokerageProfileSchema.pick({
  trustedContactName: true,
  trustedContactPhone: true,
  trustedContactEmail: true,
  w9Certified: true,
  isNonProfessionalSubscriber: true,
  marginAgreementAccepted: true,
  privacyPolicyAccepted: true,
  termsAccepted: true,
  accountType: true,
})
