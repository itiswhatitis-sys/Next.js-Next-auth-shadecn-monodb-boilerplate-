import mongoose, { Schema, Document } from "mongoose"

// Interface
export interface IShipment extends Document {
  shipmentId: string
  title: string
  description: string
ownerEmail: string 
  destination: {
    address: string
    city: string
    state: string
    country: string
  }
  expectedDeliveryDate: Date
  items: {
    sku: string
    description: string
    quantity: number
    unit: string
    weightKg: number
  }[]
  preferredMode: "road" | "rail" | "air" | "sea"
  priority: "low" | "medium" | "high"
  invitees: {
    email: string
    role: "supplier" | "logistic"
    note?: string
    status: "pending" | "accepted" | "rejected"
  }[]
  qualityChecksRequired: string[]
  trackingStatus: "created" | "in-transit" | "delivered" | "delayed"
  createdAt: Date
  updatedAt: Date
}

// Schema
const ShipmentSchema: Schema<IShipment> = new Schema(
  {
    shipmentId: { type: String, unique: true },
    title: { type: String, required: true },
    description: { type: String },
     ownerEmail: { type: String, required: true },
    destination: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      country: { type: String, required: true },
    },
    expectedDeliveryDate: { type: Date, required: true },
    items: [
      {
        sku: { type: String, required: true },
        description: { type: String },
        quantity: { type: Number, required: true },
        unit: { type: String, required: true },
        weightKg: { type: Number, required: true },
      },
    ],
    preferredMode: {
      type: String,
      enum: ["road", "rail", "air", "sea"],
      default: "road",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    invitees: [
      {
        email: { type: String, required: true },
        role: { type: String, enum: ["supplier", "logistic"], required: true },
        note: { type: String },
        status: {
          type: String,
          enum: ["pending", "accepted", "rejected"],
          default: "pending",
        },
      },
    ],
    qualityChecksRequired: [{ type: String }],
    trackingStatus: {
      type: String,
      enum: ["created", "in-transit", "delivered", "delayed"],
      default: "created",
    },
  },
  { timestamps: true }
)

// Helper to generate Shipment ID
// function generateShipmentId(ownerId: string) {
//   const today = new Date()
//   const yyyy = today.getFullYear()
//   const mm = String(today.getMonth() + 1).padStart(2, "0")
//   const dd = String(today.getDate()).padStart(2, "0")

//   const ownerShort = ownerId.slice(0, 3).toUpperCase()
//   const random6 = Math.random().toString(36).substring(2, 8).toUpperCase()

//   return `SH-${yyyy}${mm}${dd}-${ownerShort}-${random6}`
// }

// Pre-save hook to auto-generate shipmentId
ShipmentSchema.pre("save", function (next) {
  if (!this.shipmentId) {
    const today = new Date()
    const yyyy = today.getFullYear()
    const mm = String(today.getMonth() + 1).padStart(2, "0")
    const dd = String(today.getDate()).padStart(2, "0")
    const ownerShort = this.ownerEmail.slice(0, 3).toUpperCase()
    const random6 = Math.random().toString(36).substring(2, 8).toUpperCase()
    this.shipmentId = `SH-${yyyy}${mm}${dd}-${ownerShort}-${random6}`
  }
  next()
})

const Shipment =
  mongoose.models.Shipment || mongoose.model<IShipment>("Shipment", ShipmentSchema)

export default Shipment
