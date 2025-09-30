"use client";

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Package, MapPin, Calendar, Clock, BarChart2, DollarSign, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {  getShipmentDetailsByshipmentId } from '@/app/actions/getShipmentDetails';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface IShipment {
    shipmentId: string;
    title: string;
    description: string;
    ownerEmail: string;
    destination: {
        address: string;
        city: string;
        state: string;
        country: string;
    };
    expectedDeliveryDate: string;
    items: {
        sku: string;
        description: string;
        quantity: number;
        unit: string;
        weightKg: number;
    }[];
    preferredMode: string;
    priority: string;
    trackingStatus: string;
}

export default function ShipmentDetailsPage() {
    const { id } = useParams();
    const [shipment, setShipment] = useState<IShipment | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;

       const fetchDetails = async () => {
    setIsLoading(true);
    try {
        const result = await getShipmentDetailsByshipmentId(id as string);
        if (result && 'error' in result) {
            toast.error(result.error);
        } else {
            setShipment(result as unknown as IShipment);
        }
    } catch (error) {
        toast.error('Failed to fetch shipment details.');
    }
    setIsLoading(false);
};
        fetchDetails();
    }, [id]);

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    return (
        <div className="md:ml-64 p-4 md:p-8 bg-background min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Package className="w-8 h-8 text-blue-500" />
                    Shipment Details
                </h1>
                <p className="text-muted-foreground">
                    Information about the invited shipment.
                </p>
            </div>

            {isLoading ? (
                <Card className="text-center p-8">
                    <CardContent className="pt-8 pb-8 text-muted-foreground">
                        <p>Loading shipment details...</p>
                    </CardContent>
                </Card>
            ) : !shipment ? (
                <Card className="text-center p-8">
                    <CardContent className="pt-8 pb-8 text-muted-foreground">
                        <p>Shipment not found or an error occurred.</p>
                    </CardContent>
                </Card>
            ) : (
                 <div className="space-y-6">
                    {/* Back button */}
                <div className="flex items-center">
                  <Link href={"/supplier/notifications"}> <Button
                    variant="ghost"
                    className="flex items-center gap-2"
                    //   onClick={() => router.push("/supplier/notifications")}
                    >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                    </Button></Link> 
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Package className="h-5 w-5" />
                                {shipment.title}
                            </CardTitle>
                            <CardDescription>{shipment.description}</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <MapPin className="h-4 w-4" />
                                <span>
                                    <strong>Destination:</strong> {shipment.destination.city}, {shipment.destination.country}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Calendar className="h-4 w-4" />
                                <span>
                                    <strong>Expected Delivery:</strong> {formatDate(shipment.expectedDeliveryDate)}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                <span>
                                    <strong>Tracking Status:</strong>{' '}
                                    <Badge variant="secondary" className="capitalize">
                                        {shipment.trackingStatus.replace('-', ' ')}
                                    </Badge>
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <BarChart2 className="h-4 w-4" />
                                <span>
                                    <strong>Priority:</strong>{' '}
                                    <Badge variant="secondary" className="capitalize">
                                        {shipment.priority}
                                    </Badge>
                                </span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Items</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {shipment.items.map((item, index) => (
                                <div key={index}>
                                    <div className="flex justify-between items-center">
                                        <div className="text-sm font-medium">{item.description}</div>
                                        <Badge variant="outline">
                                            {item.quantity} {item.unit}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground mt-1">
                                        SKU: {item.sku} | Weight: {item.weightKg}kg
                                    </div>
                                    {index < shipment.items.length - 1 && <Separator className="my-3" />}
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>
                 </div>
            )}
        </div>
    );
}
