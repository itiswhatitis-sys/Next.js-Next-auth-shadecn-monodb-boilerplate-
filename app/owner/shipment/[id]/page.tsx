'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import {
  AlertCircle,
  Package,
  Plane,
  Truck,
  Ship,
  Train,
  Clock,
  MapPin,
  Lock,
  Calendar,
  Layers,
  CircleCheck,
  CircleEllipsis
} from 'lucide-react';
import { fetchShipmentDetailsById } from '@/app/actions/getShipmentDetails';

// Import the new server action

// Interface for the shipment data
interface IShipment {
  _id: string;
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
  preferredMode: "road" | "rail" | "air" | "sea";
  priority: "low" | "medium" | "high";
  invitees: {
    email: string;
    role: "supplier" | "logistic";
    note?: string;
    status: "pending" | "accepted" | "rejected";
  }[];
  qualityChecksRequired: string[];
  trackingStatus: "created" | "in-transit" | "delivered" | "delayed";
  createdAt: string;
  updatedAt: string;
}

export default function ShipmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const shipmentId = params.id as string;

  const [shipment, setShipment] = useState<IShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    async function getShipment() {
      if (!shipmentId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const data = await fetchShipmentDetailsById(shipmentId);

      if (data.error) {
        toast.error('Error', { description: data.error });
        setShipment(null);
      } else {
        setShipment(data as IShipment);
      }
      setIsLoading(false);
    }

    getShipment();
  }, [shipmentId]);

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      toast.success('You have been successfully logged out');
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'created':
        return 'bg-blue-100 text-blue-800';
      case 'in-transit':
        return 'bg-yellow-100 text-yellow-800';
      case 'delivered':
        return 'bg-green-100 text-green-800';
      case 'delayed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getModeIcon = (mode: string) => {
    switch (mode) {
      case 'road':
        return <Truck className="h-4 w-4" />;
      case 'rail':
        return <Train className="h-4 w-4" />;
      case 'air':
        return <Plane className="h-4 w-4" />;
      case 'sea':
        return <Ship className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getTrackingProgress = (status: string) => {
    const statuses = ["created", "in-transit", "delivered"];
    const progress = statuses.indexOf(status) + 1;
    return (progress / statuses.length) * 100;
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!shipment) {
    return (
      <div className="min-h-screen bg-background">
        {/* <Sidebar onLogout={handleLogout} /> */}
        <div className="md:ml-64 p-4 md:p-8">
          <Card className="text-center p-8">
            <CardContent className="pt-8 pb-8">
              <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Shipment not found</h3>
              <p className="text-muted-foreground mb-4">
                The shipment you're looking for doesn't exist.
              </p>
              <Button onClick={() => router.push('/shipments')}>
                Back to Shipments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <Sidebar onLogout={handleLogout} /> */}
      
      <div className="md:ml-64 p-4 md:p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-bold tracking-tight">{shipment.title}</h1>
              <Badge className={getStatusColor(shipment.trackingStatus)}>
                {shipment.trackingStatus}
              </Badge>
            </div>
            <p className="text-muted-foreground">
              Shipment ID: {shipment.shipmentId}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/shipments')}>
              Back to Shipments
            </Button>
          </div>
        </div>
        
        <Tabs defaultValue="overview" className="mb-8" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="history" disabled>
              Tracking History <Lock className="ml-1 h-3 w-3" />
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Summary</CardTitle>
                <CardDescription>
                  Key information about this shipment
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="p-4 bg-muted/50 rounded-md flex items-center gap-4">
                    <MapPin className="h-4 w-4 text-primary" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Destination</h3>
                      <p>{shipment.destination.city}, {shipment.destination.country}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md flex items-center gap-4">
                    <Calendar className="h-4 w-4 text-primary flex items-center justify-center" />
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Expected Delivery</h3>
                      <p>{new Date(shipment.expectedDeliveryDate).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="p-4 bg-muted/50 rounded-md flex items-center gap-4">
                    <div className="h-8 w-8 text-primary flex items-center justify-center">
                      {getModeIcon(shipment.preferredMode)}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground">Mode of Transport</h3>
                      <p className="capitalize">{shipment.preferredMode}</p>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-4 border-t pt-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Tracking Progress</h3>
                  <div className="flex-1">
                    <Progress value={getTrackingProgress(shipment.trackingStatus)} className="h-3" />
                  </div>
                  {/* <div className="text-sm font-medium">
                    {getTrackingProgress(shipment.trackingStatus)}%
                  </div> */}
                </div>

                <div className="border rounded-lg p-4 space-y-4">
                  <div className="font-semibold text-lg">Tracking Status Timeline</div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col items-center">
                      <CircleCheck className={`h-8 w-8 ${shipment.trackingStatus === 'created' ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-xs mt-1">Created</span>
                    </div>
                    <CircleEllipsis className="h-6 w-6 text-gray-400" />
                    <div className="flex flex-col items-center">
                      <CircleCheck className={`h-8 w-8 ${shipment.trackingStatus === 'in-transit' ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-xs mt-1">In Transit</span>
                    </div>
                    <CircleEllipsis className="h-6 w-6 text-gray-400" />
                    <div className="flex flex-col items-center">
                      <CircleCheck className={`h-8 w-8 ${shipment.trackingStatus === 'delivered' ? 'text-green-500' : 'text-gray-400'}`} />
                      <span className="text-xs mt-1">Delivered</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Description</CardTitle>
                <CardDescription>
                  Detailed description of the shipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="mt-1 text-muted-foreground">{shipment.description}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quality Checks Required</CardTitle>
                <CardDescription>
                  List of required quality checks before delivery.
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shipment.qualityChecksRequired && shipment.qualityChecksRequired.length > 0 ? (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {shipment.qualityChecksRequired.map((check, index) => (
                      <Badge key={index} variant="secondary">
                        {check}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specific quality checks required.</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Items</CardTitle>
                <CardDescription>
                  All items included in this shipment
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shipment.items && shipment.items.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-5 gap-4 p-4 border-b font-medium text-sm">
                      <div className="col-span-1">SKU</div>
                      <div className="col-span-2">Description</div>
                      <div className="col-span-1">Quantity</div>
                      <div className="col-span-1 text-right">Weight (Kg)</div>
                    </div>
                    {shipment.items.map((item, index) => (
                      <div key={index} className="grid grid-cols-5 gap-4 p-4 border-b text-sm">
                        <div className="col-span-1 font-medium">{item.sku}</div>
                        <div className="col-span-2 text-muted-foreground">{item.description}</div>
                        <div className="col-span-1">{item.quantity} {item.unit}</div>
                        <div className="col-span-1 text-right">{item.weightKg} kg</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No items listed for this shipment.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="details" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Shipment Details</CardTitle>
                <CardDescription>
                  Detailed information about the shipment's logistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Shipment ID</h3>
                    <p>{shipment.shipmentId}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Owner</h3>
                    <p>{shipment.ownerEmail}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Priority</h3>
                    <Badge className={getPriorityColor(shipment.priority)}>
                      {shipment.priority.charAt(0).toUpperCase() + shipment.priority.slice(1)}
                    </Badge>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Created At</h3>
                    <p>{new Date(shipment.createdAt).toLocaleDateString()}</p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Last Updated</h3>
                    <p>{new Date(shipment.updatedAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Destination Details</CardTitle>
                <CardDescription>
                  Complete address of the destination
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p>{shipment.destination.address}</p>
                <p>{shipment.destination.city}, {shipment.destination.state}, {shipment.destination.country}</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Invitees</CardTitle>
                <CardDescription>
                  List of invitees and their roles
                </CardDescription>
              </CardHeader>
              <CardContent>
                {shipment.invitees && shipment.invitees.length > 0 ? (
                  <div className="rounded-md border">
                    <div className="grid grid-cols-3 gap-4 p-4 border-b font-medium text-sm">
                      <div className="col-span-1">Email</div>
                      <div className="col-span-1">Role</div>
                      <div className="col-span-1">Status</div>
                    </div>
                    {shipment.invitees.map((invitee, index) => (
                      <div key={index} className="grid grid-cols-3 gap-4 p-4 border-b text-sm">
                        <div className="col-span-1 font-medium">{invitee.email}</div>
                        <div className="col-span-1 capitalize">{invitee.role}</div>
                        <div className="col-span-1 capitalize">
                          <Badge variant="outline" className={`
                            ${invitee.status === 'accepted' ? 'text-green-600 bg-green-50' : ''}
                            ${invitee.status === 'rejected' ? 'text-red-600 bg-red-50' : ''}
                            ${invitee.status === 'pending' ? 'text-yellow-600 bg-yellow-50' : ''}
                          `}>
                            {invitee.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No invitees for this shipment.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="history">
            {/* Locked content due to disabled tab */}
            <Card>
              <CardHeader>
                <CardTitle>Tracking History</CardTitle>
                <CardDescription>
                  <Lock className="h-4 w-4 inline-block mr-1" />
                  This feature is not yet implemented.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">Feature coming soon!</h3>
                  <p className="text-muted-foreground">
                    Detailed tracking history will be available here in a future update.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
