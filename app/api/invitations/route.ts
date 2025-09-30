// app/api/invitations/route.ts
import { NextResponse } from "next/server";
import connect from "@/lib/db";
import Notification from "@/lib/models/notifications";
import Shipment from "@/lib/models/shipment";

export async function POST(req: Request) {
  try {
    const { notificationId, recipientEmail, shipmentId, status } = await req.json();

    if (!notificationId || !recipientEmail || !shipmentId || !status) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connect();

    // 1. Update Notification
    const updatedNotification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientEmail },
      { $set: { status, read: true } },
      { new: true }
    );

    if (!updatedNotification) {
      return NextResponse.json(
        { success: false, error: "Invitation not found" },
        { status: 404 }
      );
    }

    // 2. Update Shipment invitee status
    const updatedShipment = await Shipment.findOneAndUpdate(
      { shipmentId, "invitees.email": recipientEmail },
      { $set: { "invitees.$.status": status } },
      { new: true }
    );

    if (!updatedShipment) {
      return NextResponse.json(
        { success: false, error: "Shipment not found or invitee not matched" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        notification: updatedNotification,
        shipment: updatedShipment,
      },
    });
  } catch (err: any) {
    console.error("Error updating invitation & shipment:", err);
    return NextResponse.json(
      { success: false, error: "Failed to update invitation & shipment" },
      { status: 500 }
    );
  }
}
