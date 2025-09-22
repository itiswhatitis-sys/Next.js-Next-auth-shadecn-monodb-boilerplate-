import mongoose, { Schema, Document } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  // image?: string;

  // Top-level role
  role: "supplier" | "supplier-team" | "logistic" | "logistic-team" | "owner";

  // Sub-role for team members
  teamRole?: "operations" | "quality" | "finance" | "delivery-partner";

  // Parent reference (only for team accounts)
  supplierId?: mongoose.Types.ObjectId;
  logisticId?: mongoose.Types.ObjectId;

  isTeamMember?: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, required: true },
    password: { type: String, required: true },
    // image: String,

    role: {
      type: String,
      enum: ["supplier", "supplier-team", "logistic", "logistic-team", "owner"],
      required: true,
    },

    teamRole: {
      type: String,
      enum: ["operations", "quality", "finance", "delivery-partner", null],
      default: null,
    },

    supplierId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    logisticId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    isTeamMember: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model<IUser>("User", userSchema);
