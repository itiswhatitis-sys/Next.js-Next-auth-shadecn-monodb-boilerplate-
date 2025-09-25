"use server"

import connect from "@/lib/db"
import OwnerCompany from "@/lib/models/ownerOnboarding"

export async function fetchCompanyProfileByEmail(companyEmail: string) {
  try {
    await connect()
    const companyProfile = await OwnerCompany.findOne({ companyEmail })

    if (!companyProfile) {
      return { error: "Company profile not found." }
    }

    // Convert Mongoose document to a plain JSON object
    return JSON.parse(JSON.stringify(companyProfile))
  } catch (error) {
    console.error(`Error fetching company profile for ${companyEmail}:`, error)
    return { error: "Failed to fetch company profile." }
  }
}
