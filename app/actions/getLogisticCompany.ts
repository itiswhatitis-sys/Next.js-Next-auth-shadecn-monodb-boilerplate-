"use server";

import connect from "@/lib/db";
import LogisticCompany from "@/lib/models/logisticOnboarding";


// Fetch all registered logistic companies
export async function fetchLogisticCompanies() {
  try {
    await connect();
    const companies = await LogisticCompany.find({});
    // Convert Mongoose documents to a plain JSON object
    return JSON.parse(JSON.stringify(companies));
  } catch (error) {
    console.error("Error fetching logistic companies:", error);
    return { error: "Failed to fetch logistic companies." };
  }
}