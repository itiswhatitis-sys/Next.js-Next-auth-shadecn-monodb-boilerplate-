"use server";

import connect from "@/lib/db";
import Shipment, { IShipment } from "@/lib/models/shipment";

export async function getShipmentsByOwner(ownerEmail: string) {
  if (!ownerEmail) {
    throw new Error("Owner email is required"); // just throw error
  }

  await connect();

  // Use `.lean()` to get plain JS objects
  const shipments = await Shipment.find({ ownerEmail }).sort({ createdAt: -1 });

  return  JSON.parse(JSON.stringify(shipments)); // plain array of objects, safe for Client Component
}


export async function fetchShipmentDetailsById(id: string) {
  try {
    await connect()
    const shipment = await Shipment.findById(id)
    if (!shipment) {
      return { error: "Shipment not found." }
    }
    // Convert Mongoose document to a plain JSON object
    return JSON.parse(JSON.stringify(shipment))
  } catch (error) {
    console.error(`Error fetching shipment with ID ${id}:`, error)
    return { error: "Failed to fetch shipment details." }
  }
}




export async function getShipmentDetailsByshipmentId(id: string) {
  try {
    await connect();
    const shipment = await Shipment.findOne({ shipmentId: id }).lean(); // Use findOne and lean for performance
    
    if (!shipment) {
      return { error: "Shipment not found." };
    }
    
    return JSON.parse(JSON.stringify(shipment)) as IShipment;
  } catch (error) {
    console.error(`Error fetching shipment with ID ${id}:`, error);
    return { error: "Failed to fetch shipment details." };
  }
}
