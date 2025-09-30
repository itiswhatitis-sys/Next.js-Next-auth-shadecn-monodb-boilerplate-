'use server';

import connect from "@/lib/db";
import Shipment from "@/lib/models/shipment";

export async function getSupplierShipments(email: string) {
  try {
    await connect();
    
    // Corrected query using $elemMatch
    const shipments = await Shipment.find({
      invitees: {
        $elemMatch: {
          email: email,
          status: 'accepted',
        },
      },
    }).lean(); 
    
    // Explicitly shape the returned data to match the client-side interface
    return shipments.map(shipment => ({
    //   _id: shipment._id.toString(), 
      // Use _id instead of id
      shipmentId: shipment.shipmentId,
      title: shipment.title,
      description: shipment.description,
      expectedDeliveryDate: shipment.expectedDeliveryDate.toISOString(),
      trackingStatus: shipment.trackingStatus,
      priority: shipment.priority,
      destination: {
        city: shipment.destination.city,
        state: shipment.destination.state,
      },
    }));
  } catch (error) {
    console.error("Failed to fetch supplier shipments:", error);
    return [];
  }
}