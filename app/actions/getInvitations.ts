"use server";

import connect from "@/lib/db";
import Notification from "@/lib/models/notifications";
import Shipment from "@/lib/models/shipment";
import mongoose from "mongoose";

// This server action fetches all pending invitations for a given email address.
export async function getPendingInvitations(email: string) {
  try {
    if (mongoose.connection.readyState !== 1) {
      await connect();
    }
    const invitations = await Notification.find({
      recipientEmail: email,
      status: "pending",
      type: "invitation",
    }).lean();
    return JSON.parse(JSON.stringify(invitations));
  } catch (error) {
    console.error("Error fetching invitations:", error);
    return { error: "Failed to fetch invitations." };
  }
}

// This server action handles accepting or rejecting an invitation.
export async function handleInvitation(
  notificationId: string,
  shipmentId: string,
  recipientEmail: string,
  status: "accepted" | "rejected"
) {
  const session = await mongoose.startSession();
  try {
    if (mongoose.connection.readyState !== 1) {
      await connect();
    }
    session.startTransaction();

    await Notification.findByIdAndUpdate(
      notificationId,
      { status: status, read: true },
      { session }
    );

    await Shipment.findOneAndUpdate(
      { "invitees.email": recipientEmail, "shipmentId": shipmentId },
      { $set: { "invitees.$.status": status } },
      { session }
    );

    await session.commitTransaction();
    return { success: true };
  } catch (error) {
    console.error("Error handling invitation:", error);
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    return { success: false, error: "Failed to update invitation status." };
  } finally {
    session.endSession();
  }
}
