import connect from "@/lib/db";
import Shipment from "@/lib/models/shipment";
import type { NextApiRequest, NextApiResponse } from "next";


type ResponseData = 
  | { success: true; data: any[] }
  | { success: false; message: string };

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>
) {
  // Connect to MongoDB
  await connect();

  // Only allow GET requests
  if (req.method !== "GET") {
    return res.status(405).json({ success: false, message: "Method not allowed" });
  }

  const { ownerEmail } = req.query;

  if (!ownerEmail || typeof ownerEmail !== "string") {
    return res.status(400).json({ success: false, message: "ownerEmail is required" });
  }

  try {
    const shipments = await Shipment.find({ ownerEmail }).sort({ createdAt: -1 });

    // Always return JSON, even if empty
    return res.status(200).json({ success: true, data: shipments });
  } catch (error: any) {
    console.error("Error fetching shipments:", error);
    return res.status(500).json({ success: false, message: error.message || "Internal Server Error" });
  }
}
