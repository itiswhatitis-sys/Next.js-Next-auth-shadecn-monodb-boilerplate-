import mongoose, { Schema, Document } from "mongoose";

export interface ITeamMember extends Document {
  name?: string;
  email?: string;
  parentEmail: string; // parent account's email
  parentRole: "supplier" | "logistic";
  teamRole?: "operations" | "quality" | "finance" | "delivery-partner";
  registered: boolean;
  skipped: boolean; // new field
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String },
    email: { type: String, unique: true, sparse: true },
    parentEmail: { type: String, required: true },
    parentRole: { type: String, enum: ["supplier", "logistic"], required: true },
    teamRole: {
      type: String,
      enum: ["operations", "quality", "finance", "delivery-partner"],
    },
    registered: { type: Boolean, default: false },
    skipped: { type: Boolean, default: false }, // added
  },
  { timestamps: true }
);

export const TeamMember =
  mongoose.models.TeamMember ||
  mongoose.model<ITeamMember>("TeamMember", teamMemberSchema);
