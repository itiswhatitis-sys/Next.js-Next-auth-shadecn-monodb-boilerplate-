"use client";

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Mail, X, Check, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { getPendingAssessments, updateAssessmentStatus } from '@/app/actions/getQualityAssesment';

interface IQualityAssessment {
  _id: string;
  shipmentId: string;
  itemSku: string;
  assessorEmail: string;
  parentEmail: string;
  assessmentNotes?: string;
  qualityImages: string[];
  isVerifiedByOwner: boolean;
  status: "pending" | "approved" | "rejected";
}

export default function OwnerNotificationsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [assessments, setAssessments] = useState<IQualityAssessment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAssessments = useCallback(async (email: string) => {
    setIsLoading(true);
    const result = await getPendingAssessments(email);
    if (result.error) {
      toast.error(result.error);
      setAssessments([]);
    } else {
      setAssessments(result.data as IQualityAssessment[]);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
    if (status === 'authenticated' && session?.user?.email) {
      fetchAssessments(session.user.email);
    }
  }, [status, session, fetchAssessments, router]);

  const onAction = async (assessmentId: string, actionStatus: 'approved' | 'rejected') => {
    if (!session?.user?.email) {
      toast.error("User session not found.");
      return;
    }

    setIsLoading(true);
    const result = await updateAssessmentStatus(assessmentId, actionStatus);

    if (result.success) {
      toast.success(`Assessment ${actionStatus}`);
      fetchAssessments(session.user.email); // Re-fetch the data to update the UI
    } else {
      toast.error(result.error || 'Failed to update assessment.');
      setIsLoading(false);
    }
  };

  return (
    <div className="md:ml-64 p-4 md:p-8 bg-background min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Mail className="w-8 h-8 text-blue-500" />
          Quality Assessment Notifications
        </h1>
        <p className="text-muted-foreground">
          View and manage quality assessments submitted by your team.
        </p>
      </div>

      {isLoading || status === 'loading' ? (
        <Card className="text-center p-8">
          <CardContent className="pt-8 pb-8 text-muted-foreground">
            <p>Loading assessments...</p>
          </CardContent>
        </Card>
      ) : assessments.length === 0 ? (
        <Card className="text-center p-8">
          <CardContent className="pt-8 pb-8 text-muted-foreground">
            <p>You have no pending quality assessments.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {assessments.map((assessment) => (
            <Card key={assessment._id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-4">
                <div className="flex items-start gap-3">
                  <div className="p-3 bg-blue-100 rounded-full flex-shrink-0">
                    <Eye className="w-6 h-6 text-blue-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="font-semibold truncate text-lg">
                      Assessment for Shipment ID: {assessment.shipmentId}
                    </CardTitle>
                    <CardDescription className="text-sm">
                      Submitted by {assessment.assessorEmail}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <p className="text-muted-foreground">
                    <span className="font-medium text-gray-700">Item SKU:</span> {assessment.itemSku}
                  </p>
                  {assessment.assessmentNotes && (
                    <p className="text-muted-foreground">
                      <span className="font-medium text-gray-700">Notes:</span> {assessment.assessmentNotes}
                    </p>
                  )}
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2">
               {assessment.qualityImages.map((image, index) => (
                    <div
                        key={index}
                        className="relative w-full h-32 rounded-md overflow-hidden border"
                    >
                        <img
                        src={image} // ✅ base64 string goes directly here
                        alt={`Quality Image ${index + 1}`}
                        className="object-cover w-full h-full"
                        />
                    </div>
                    ))}
                </div>

                <div className="flex gap-2 pt-3 border-t mt-4">
                  <Button
                    size="sm"
                    variant="default"
                    onClick={() => onAction(assessment._id, 'approved')}
                    className="flex-1"
                  >
                    <Check className="h-4 w-4 mr-1" />
                    Verify
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => onAction(assessment._id, 'rejected')}
                    className="flex-1"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Decline
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
