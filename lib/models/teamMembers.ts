import mongoose, { Schema, Document } from "mongoose";

export interface ITeamMember extends Document {
  name: string;
  email: string;
  parentId: mongoose.Types.ObjectId; // supplierId or logisticId
  parentRole: "supplier" | "logistic"; // type of parent account
  teamRole: "operations" | "quality" | "finance" | "delivery-partner"; // team role
  registered: boolean; // true if the member has signed up
}

const teamMemberSchema = new Schema<ITeamMember>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    parentId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    parentRole: { type: String, enum: ["supplier", "logistic"], required: true },
    teamRole: {
      type: String,
      enum: ["operations", "quality", "finance", "delivery-partner"],
      required: true,
    },
    registered: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const TeamMember =
  mongoose.models.TeamMember ||
  mongoose.model<ITeamMember>("TeamMember", teamMemberSchema);
