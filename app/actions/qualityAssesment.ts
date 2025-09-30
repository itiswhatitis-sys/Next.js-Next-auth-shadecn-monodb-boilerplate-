"use server";

import connect from "@/lib/db";
import { QualityAsssessment } from "@/lib/models/qualiityAssesment";

// Assuming you have a database connection utility

interface SubmitResult {
  success: boolean;
  message?: string;
  data?: any;
}

export async function submitQualityAssessment(
  formData: any // Use a more specific type if possible
): Promise<SubmitResult> {
  try {
    // Connect to the database
    await connect();

    // Create a new document using the QualityAssessment model
    const newAssessment = new QualityAsssessment({
      shipmentId: formData.shipmentId,
      itemSku: formData.itemSku,
      itemDescription: formData.itemDescription,
      assessorEmail: formData.assessorEmail,
      parentEmail: formData.parentEmail,
      assessmentNotes: formData.assessmentNotes,
      qualityImages: formData.qualityImages,
    });

    // Save the new document to the database
    await newAssessment.save();

    return {
      success: true,
      message: "Quality assessment submitted successfully.",
      data: newAssessment.toObject(),
    };
  } catch (error) {
    console.error("Error submitting quality assessment:", error);
    return {
      success: false,
      message: "An error occurred while submitting the assessment.",
    };
  }
}
