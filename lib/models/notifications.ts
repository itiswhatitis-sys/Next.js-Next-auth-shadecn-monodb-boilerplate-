import mongoose, { Schema, Document } from "mongoose";

// Interface for the Notification document
export interface INotification extends Document {
  recipientEmail: string;
  senderEmail: string;
  shipmentId: string;
  type: "invitation";
  role: "supplier" | "logistic";
  status: "pending" | "accepted" | "rejected";
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Schema for the Notification model
const NotificationSchema: Schema<INotification> = new Schema(
  {
    // The email of the person being invited
    recipientEmail: { type: String, required: true, index: true },
    // The email of the person who sent the invite (the owner)
    senderEmail: { type: String, required: true },
    // The ID of the shipment the invitation is for
    shipmentId: { type: String, required: true, index: true },
    // The type of notification (e.g., "invitation")
    type: { type: String, enum: ["invitation"], required: true },
    // The role the invitee is being invited to
    role: {
      type: String,
      enum: ["supplier", "logistic"],
      required: true,
    },
    // The status of the invitation
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    // A flag to check if the notification has been read by the recipient
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Notification = mongoose.models.Notification || mongoose.model<INotification>("Notification", NotificationSchema);

export default Notification;
