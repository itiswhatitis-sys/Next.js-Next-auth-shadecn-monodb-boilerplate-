"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Mail, Truck, X, Check, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { getPendingInvitations } from '@/app/actions/getInvitations';
import Link from 'next/link';

interface Invitation {
    _id: string;
    recipientEmail: string;
    senderEmail: string;
    shipmentId: string;
    type: 'invitation';
    role: 'supplier' | 'logistic';
    status: 'pending' | 'accepted' | 'rejected';
    read: boolean;
}

export default function NotificationsPage() {
    const { data: session, status } = useSession();
    const router = useRouter();
    const [invitations, setInvitations] = useState<Invitation[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchInvitations = useCallback(async () => {
        if (!session?.user?.email) return;
        setIsLoading(true);
        const result = await getPendingInvitations(session.user.email);
        if (result.error) {
            toast.error(result.error);
            setInvitations([]);
        } else {
            setInvitations(result as Invitation[]);
        }
        setIsLoading(false);
    }, [session]);

    useEffect(() => {
        if (status === 'unauthenticated') {
            router.push('/login');
        }
        if (status === 'authenticated') {
            fetchInvitations();
        }
    }, [status, fetchInvitations, router]);

    const onAction = async (notificationId: string, shipmentId: string, actionStatus: 'accepted' | 'rejected') => {
        if (!session?.user?.email) {
            toast.error("User session not found.");
            return;
        }

        setIsLoading(true);
        const res = await fetch('/api/invitations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                notificationId,
                shipmentId,
                recipientEmail: session.user.email,
                status: actionStatus,
            }),
        });

        const result = await res.json();

        if (result.success) {
            toast.success(`Invitation ${actionStatus}`);
            fetchInvitations();
        } else {
            toast.error(result.error || 'Failed to update invitation.');
            setIsLoading(false);
        }
    };

    return (
        <div className="md:ml-64 p-4 md:p-8 bg-background min-h-screen">
            <div className="mb-8">
                <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                    <Mail className="w-8 h-8 text-blue-500" />
                    Invitations
                </h1>
                <p className="text-muted-foreground">
                    View and manage your pending shipment invitations.
                </p>
            </div>

            {isLoading || status === 'loading' ? (
                <Card className="text-center p-8">
                    <CardContent className="pt-8 pb-8 text-muted-foreground">
                        <p>Loading invitations...</p>
                    </CardContent>
                </Card>
            ) : invitations.length === 0 ? (
                <Card className="text-center p-8">
                    <CardContent className="pt-8 pb-8 text-muted-foreground">
                        <p>You have no pending invitations.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {invitations.map((invitation) => (
                        <Card key={invitation._id} className="hover:shadow-lg transition-shadow">
                            <CardHeader className="pb-4">
                                <div className="flex items-start gap-3">
                                    <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
                                        <Truck className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <CardTitle className="font-semibold truncate text-lg">
                                            Invitation from {invitation.senderEmail}
                                        </CardTitle>
                                        <CardDescription className="text-sm">
                                            You have been invited to collaborate as a{' '}
                                            <Badge variant="secondary" className="capitalize">
                                                {invitation.role.replace('-', ' ')}
                                            </Badge>
                                        </CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2 text-sm">
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <span className="font-medium">Shipment ID:</span>
                                        <span className="font-mono text-gray-700">{invitation.shipmentId}</span>
                                    </div>
                                </div>

                                <div className="flex gap-2 pt-3 border-t mt-4">
                                    <Link href={`/supplier/notifications/${invitation.shipmentId}`}><Button
                                        size="sm"
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        View Details
                                    </Button></Link>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => onAction(invitation._id, invitation.shipmentId, 'rejected')}
                                        className="flex-1"
                                    >
                                        <X className="h-4 w-4 mr-1" />
                                        Reject
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="default"
                                        onClick={() => onAction(invitation._id, invitation.shipmentId, 'accepted')}
                                        className="flex-1"
                                    >
                                        <Check className="h-4 w-4 mr-1" />
                                        Accept
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
