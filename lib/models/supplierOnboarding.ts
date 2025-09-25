import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeamMember {
  name: string;
  email: string;
  role: "operations" | "quality" | "finance";
}

export interface ICompany extends Document {
  companyName: string;
  ownerName: string;
  contactNumber: string;
  companyEmail: string;
  gstNumber: string;
  address: string;
  teamMembers?: ITeamMember[];
  teamSkipped: boolean;
}

const TeamMemberSchema: Schema = new Schema({
  name: { type: String, required: true, minlength: 2 },
  email: { type: String, required: true, match: /^\S+@\S+\.\S+$/ },
  role: {
    type: String,
    enum: ["operations", "quality", "finance"],
    required: true,
  },
});

const CompanySchema: Schema<ICompany> = new Schema({
  companyName: { type: String, required: true, minlength: 2 },
  ownerName: { type: String, required: true, minlength: 2 },
  contactNumber: { type: String, required: true, match: /^[0-9]{10}$/ },
  companyEmail: { type: String, required: true, match: /^\S+@\S+\.\S+$/ },
  gstNumber: { type: String, required: true, minlength: 5 },
  address: { type: String, required: true, minlength: 5 },
  teamMembers: { type: [TeamMemberSchema], required: false },
  teamSkipped: { type: Boolean, default: false },
});

// ✅ Fix: match the model name correctly
const SupplierCompany: Model<ICompany> =
  mongoose.models.SupplierCompany ||
  mongoose.model<ICompany>("SupplierCompany", CompanySchema);

export default SupplierCompany;
