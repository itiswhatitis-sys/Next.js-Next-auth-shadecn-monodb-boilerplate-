"use server";

import dbConnect from "@/lib/db";
import { QualityAsssessment } from "@/lib/models/qualiityAssesment";
import { revalidatePath } from "next/cache";

/**
 * Fetches all pending quality assessments for a specific parentEmail.
 * @param parentEmail The email of the parent supplier/logistic company.
 * @returns An object with success status and the data or an error message.
 */
export const getPendingAssessments = async (parentEmail: string) => {
  try {
    await dbConnect();
    const assessments = await QualityAsssessment.find({
      parentEmail,
      isVerifiedByOwner: false,
      status: "pending",
    });
    // Ensure the data is plain JSON to avoid serialization errors
    return { success: true, data: JSON.parse(JSON.stringify(assessments)) };
  } catch (error) {
    console.error("Error fetching pending assessments:", error);
    return { success: false, error: "Failed to fetch assessments." };
  }
};

/**
 * Updates the status of a quality assessment.
 * @param assessmentId The ID of the assessment to update.
 * @param newStatus The new status ("approved" or "rejected").
 * @returns An object with success status and the updated data or an error message.
 */
export const updateAssessmentStatus = async (
  assessmentId: string,
  newStatus: "approved" | "rejected"
) => {
  try {
    await dbConnect();

    const updateResult = await QualityAsssessment.findByIdAndUpdate(
      assessmentId,
      {
        status: newStatus,
        isVerifiedByOwner: true,
      },
      { new: true } // Return the updated document
    );

    if (!updateResult) {
      return { success: false, error: "Assessment not found." };
    }

    revalidatePath("/owner/notifications"); // Revalidate the owner's notifications page

    return {
      success: true,
      data: JSON.parse(JSON.stringify(updateResult)),
    };
  } catch (error) {
    console.error("Error updating assessment status:", error);
    return { success: false, error: "Failed to update assessment status." };
  }
};
