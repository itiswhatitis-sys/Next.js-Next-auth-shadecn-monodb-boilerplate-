import mongoose, { Schema, Document } from "mongoose";

// Interface for the quality assessment document
export interface IQualityAssessment extends Document {
  shipmentId: string; // ID of the shipment being assessed
  itemSku: string; // The SKU of the item from the shipment
  itemDescription?: string; // Description of the item
  assessorEmail: string; // Email of the team member who performed the assessment
  parentEmail: string; // Email of the parent supplier/logistic company
  assessmentNotes?: string; // Text notes from the assessment
  qualityImages: string[]; // URLs or paths to the uploaded images from FilePond
  isVerifiedByOwner: boolean; // Flag to indicate if the owner has verified the assessment
  status: "pending" | "approved" | "rejected"; // Status of the assessment
}

// Mongoose schema for the quality assessment model
const qualityAssessmentSchema = new Schema<IQualityAssessment>(
  {
    shipmentId: { type: String, required: true, index: true },
    itemSku: { type: String, required: true },
    itemDescription: { type: String },
    assessorEmail: { type: String, required: true, index: true },
    parentEmail: { type: String, required: true },
    assessmentNotes: { type: String },
    qualityImages: { type: [String], default: [] }, // Array of strings to hold image URLs
    isVerifiedByOwner: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true } // Adds createdAt and updatedAt fields
);

// Export the Mongoose model
export const QualityAsssessment =
  mongoose.models.QualityAssessment ||
  mongoose.model<IQualityAssessment>("QualityAssessment", qualityAssessmentSchema);