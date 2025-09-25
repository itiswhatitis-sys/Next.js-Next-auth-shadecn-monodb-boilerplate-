'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Plus, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { getShipmentsByOwner } from '@/app/actions/getShipmentDetails';

interface Shipment {
  _id: string;
  shipmentId: string;
  title: string;
  description: string;
  expectedDeliveryDate: string;
  trackingStatus: 'created' | 'in-transit' | 'delivered' | 'delayed';
  priority: 'low' | 'medium' | 'high';
  destination: {
    city: string;
    state: string;
  };
}

export default function ShipmentsPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [isLoading, setIsLoading] = useState(false);


  // Helper to fetch shipments
const fetchShipments = async (email: string) => {
  try {
    setIsLoading(true);
    const data = await getShipmentsByOwner(email); // now returns plain objects
    setShipments(data);
  } catch (error) {
    console.error("Failed to fetch shipments:", error);
  } finally {
    setIsLoading(false);
  }
};

  // Effect to fetch when session email is available
  useEffect(() => {
    if (!session?.user?.email) return;
    fetchShipments(session.user.email);
  }, [session?.user?.email]);

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (!res.ok) throw new Error('Logout failed');
      router.push('/login');
    } catch (err) {
      toast.error('Logout failed');
    }
  };

  const getStatusColor = (status: Shipment['trackingStatus']) => {
    switch (status) {
      case 'created': return 'bg-slate-100 text-slate-800';
      case 'in-transit': return 'bg-blue-100 text-blue-800';
      case 'delivered': return 'bg-green-100 text-green-800';
      case 'delayed': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getStatusIcon = (status: Shipment['trackingStatus']) => {
    switch (status) {
      case 'created': return <Clock className="h-5 w-5 text-slate-500" />;
      case 'in-transit': return <FileText className="h-5 w-5 text-blue-500" />;
      case 'delivered': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'delayed': return <AlertCircle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={handleLogout} />

      <div className="md:ml-64 p-4 md:p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Shipments</h1>
            <p className="text-muted-foreground">Manage your shipments</p>
          </div>
          <Button onClick={() => router.push('/shipments/create')}>
            <Plus className="mr-2 h-4 w-4" /> Create Shipment
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-2">
                  <div className="h-6 w-3/4 bg-muted rounded"></div>
                  <div className="h-4 w-1/2 bg-muted rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 w-full bg-muted rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : shipments.length === 0 ? (
          <Card className="text-center p-8">
            <CardContent className="pt-8 pb-8">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No shipments yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first shipment to start tracking
              </p>
              <Button onClick={() => router.push('/shipments/create')}>
                <Plus className="mr-2 h-4 w-4" /> Create Shipment
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {shipments.map((shipment) => (
              <Card
                key={shipment._id}
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-shadow duration-200"
                onClick={() => router.push(`/shipments/${shipment._id}`)}
              >
                <CardHeader className="pb-2 flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{shipment.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {shipment.destination.city}, {shipment.destination.state}
                    </p>
                  </div>
                  {getStatusIcon(shipment.trackingStatus)}
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <Badge className={`mt-2 ${getStatusColor(shipment.trackingStatus)}`}>
                      {shipment.trackingStatus}
                    </Badge>
                    <p className="text-sm text-muted-foreground">
                      Priority: {shipment.priority}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
