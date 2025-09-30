import connect from '@/lib/db';
import Notification from '@/lib/models/notifications';
import Shipment from '@/lib/models/shipment';
import { NextRequest, NextResponse } from 'next/server';


export async function POST(request: NextRequest) {
  try {
    await connect();

    const body = await request.json();
    
    // Validate required fields
    const {
      title,
      description,
      ownerEmail,
      destination,
      expectedDeliveryDate,
      items,
      preferredMode,
      priority,
      invitees,
      qualityChecksRequired
    } = body;

    if (!title || !ownerEmail || !destination || !expectedDeliveryDate || !items || items.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create new shipment
    const newShipment = new Shipment({
      title,
      description: description || '',
      ownerEmail,
      destination: {
        address: destination.address,
        city: destination.city,
        state: destination.state,
        country: destination.country,
      },
      expectedDeliveryDate: new Date(expectedDeliveryDate),
      items: items.map((item: any) => ({
        sku: item.sku,
        description: item.description || '',
        quantity: parseInt(item.quantity),
        unit: item.unit,
        weightKg: parseFloat(item.weightKg),
      })),
      preferredMode: preferredMode || 'road',
      priority: priority || 'medium',
      invitees: invitees.map((invitee: any) => ({
        email: invitee.email,
        role: invitee.role,
        note: invitee.note || '',
        status: 'pending',
      })),
      qualityChecksRequired: qualityChecksRequired || [],
      trackingStatus: 'created',
    });

    const savedShipment = await newShipment.save();

    // Create a new notification for each invitee
    if (savedShipment.invitees && savedShipment.invitees.length > 0) {
        const notifications = savedShipment.invitees.map((invitee: { email: any; role: any; }) => ({
            recipientEmail: invitee.email,
            senderEmail: savedShipment.ownerEmail,
            shipmentId: savedShipment.shipmentId,
            type: "invitation",
            role: invitee.role,
        }));

        await Notification.insertMany(notifications);
    }

    return NextResponse.json(
      {
        message: 'Shipment created successfully',
        shipment: savedShipment,
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Error creating shipment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create shipment' },
      { status: 500 }
    );
  }
}
