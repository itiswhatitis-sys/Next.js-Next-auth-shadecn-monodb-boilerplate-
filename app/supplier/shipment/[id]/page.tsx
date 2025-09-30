'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  CircleEllipsis,
  Upload,
  Camera,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { getShipmentDetailsByshipmentId } from '@/app/actions/getShipmentDetails';

// FilePond imports (you'll need to install these)
// npm install filepond react-filepond filepond-plugin-image-preview filepond-plugin-file-validate-type
import { FilePond, registerPlugin } from 'react-filepond';
import 'filepond/dist/filepond.min.css';
import FilePondPluginImagePreview from 'filepond-plugin-image-preview';
import 'filepond-plugin-image-preview/dist/filepond-plugin-image-preview.css';
import FilePondPluginFileValidateType from 'filepond-plugin-file-validate-type';
import { useSession } from 'next-auth/react';
import { getTeamRoleByEmail } from '@/app/actions/teamMembers';

import { submitQualityAssessment } from '@/app/actions/qualityAssesment';

// Register FilePond plugins
registerPlugin(FilePondPluginImagePreview, FilePondPluginFileValidateType);

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

// Interface for quality assessment
interface QualityAssessment {
  itemSku: string;
  images: File[];
  notes: string;
  status: 'pending' | 'approved' | 'rejected';
}

// User role type
type UserRole = 'supplier' | 'operations' | 'quality' | 'finance' |'delivery-partner';

export default function ShipmentDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const shipmentId = params.id as string;

  // Mock user role - in real app, this would come from authentication context
  const [userRole,setUserRole] = useState<UserRole>('supplier'); // Change this to test different roles

  const [shipment, setShipment] = useState<IShipment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Quality Assessment state
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [qualityImages, setQualityImages] = useState<File[]>([]);
  const [qualityNotes, setQualityNotes] = useState('');
  const [qualityAssessments, setQualityAssessments] = useState<QualityAssessment[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Invoice state
  const [invoiceFiles, setInvoiceFiles] = useState<File[]>([]);

const filesToBase64 = async (files: File[]) => {
  const promises = files.map(file => {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  });
  return Promise.all(promises);
};


  // useEffect for fetching teamRole
  useEffect(() => {
    // Only run the effect if the user's email is available
    if (session?.user?.email) {
      const getRole = async () => {
        // Call the server action to fetch the role
        const role = await getTeamRoleByEmail(session.user.email||'');

        // Check if the fetched role is one of the valid types before updating state
        // This prevents type errors if an unexpected value is returned
        if (
          role === 'operations' ||
          role === 'quality' ||
          role === 'finance' ||
          role === 'delivery-partner'
        ) {
          // If a role is found, update the state
          setUserRole(role);
        } else {
          // If no role is found or it's not a teamRole, default to 'supplier'
          setUserRole('supplier');
        }

        setLoading(false);
      };

      getRole();
    }
  }, [session?.user?.email]);

  useEffect(() => {
    async function getShipment() {
      if (!shipmentId) {
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      const data = await getShipmentDetailsByshipmentId(shipmentId);

      if (data.error) {
        toast.error('Error', { description: data.error });
        setShipment(null);
      } else {
        setShipment(data as unknown as IShipment);
        // Set default tab based on user role
        if (userRole === 'quality') {
          setActiveTab('quality');
        } else if (userRole === 'finance') {
          setActiveTab('invoices');
        }
      }
      setIsLoading(false);
    }

    getShipment();
  }, [shipmentId, userRole]);

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

  // Check if user can access a specific tab
  const canAccessTab = (tabName: string): boolean => {
    switch (userRole) {
      case 'supplier':
      case 'operations':
        return ['overview', 'details', 'quality', 'invoices'].includes(tabName);
      case 'quality':
        return tabName === 'quality';
      case 'finance':
        return tabName === 'invoices';
      default:
        return false;
    }
  };

  // Get available tabs based on user role
  const getAvailableTabs = () => {
    const allTabs = [
      { value: 'overview', label: 'Overview', icon: <Package className="h-4 w-4" /> },
      { value: 'details', label: 'Details', icon: <FileText className="h-4 w-4" /> },
      { value: 'quality', label: 'Quality Assessment', icon: <CheckCircle2 className="h-4 w-4" /> },
      { value: 'invoices', label: 'Invoices', icon: <Upload className="h-4 w-4" /> },
    ];

    return allTabs.filter(tab => canAccessTab(tab.value));
  };

  // Helper function to upload images (you'll need to implement this based on your upload service)
//   const uploadImages = async (files: File[]): Promise<string[]> => {
//     // This is a placeholder implementation
//     // You'll need to implement actual file upload to your storage service (AWS S3, Cloudinary, etc.)
    
//     try {
//       const uploadPromises = files.map(async (file) => {
//         // For now, we'll create a mock URL - replace this with actual upload logic
//         // Example: const response = await uploadToCloudinary(file);
//         // return response.secure_url;
        
//         return `https://example.com/uploads/${file.name}-${Date.now()}`;
//       });
      
//       return await Promise.all(uploadPromises);
//     } catch (error) {
//       console.error('Error uploading images:', error);
//       throw new Error('Failed to upload images');
//     }
//   };

  // Handle quality assessment submission
  const handleQualitySubmit = async () => {
    if (!selectedItem) {
      toast.error("Please select an item");
      return;
    }

    if (!session?.user?.email) {
      toast.error("User session not found");
      return;
    }

    if (!shipment) {
      toast.error("Shipment data not found");
      return;
    }
      const base64Images = await filesToBase64(qualityImages);
    setIsSubmitting(true);

    try {
      // Get the selected item description
      const selectedItemData = shipment.items.find(item => item.sku === selectedItem);
      const selectedItemDescription = selectedItemData?.description || '';

      // Upload images first and get URLs
    //   let imageUrls: string[] = [];
    //   if (qualityImages.length > 0) {
    //     imageUrls = await uploadImages(qualityImages);
    //   }

      const newAssessment = {
        shipmentId: shipment.shipmentId,
        itemSku: selectedItem,
        itemDescription: selectedItemDescription,
        assessorEmail: session.user.email,
        parentEmail: shipment.ownerEmail,
        assessmentNotes: qualityNotes,
        qualityImages:  base64Images, // Pass URLs instead of File objects
      };

      const result = await submitQualityAssessment(newAssessment);

      if (result.success) {
        // Add to local state for immediate UI update
        setQualityAssessments((prev) => [...prev, {
          itemSku: selectedItem,
          images: qualityImages,
          notes: qualityNotes,
          status: 'pending'
        }]);
        
        // Clear form
        setSelectedItem("");
        setQualityImages([]);
        setQualityNotes("");
        
        toast.success(result.message || "Quality assessment submitted successfully");
      } else {
        toast.error(result.message || "Failed to submit assessment");
      }
    } catch (error) {
      console.error('Error submitting quality assessment:', error);
      toast.error("An unexpected error occurred while submitting the assessment");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle invoice upload
  const handleInvoiceUpload = () => {
    if (invoiceFiles.length === 0) {
      toast.error('Please select at least one invoice file');
      return;
    }

    // In real app, you would upload files to server here
    toast.success(`${invoiceFiles.length} invoice(s) uploaded successfully`);
    setInvoiceFiles([]);
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

  const availableTabs = getAvailableTabs();

  return (
    <div className="min-h-screen bg-background">
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
              Shipment ID: {shipment.shipmentId} | Role: {userRole}
            </p>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => router.push('/shipments')}>
              Back to Shipments
            </Button>
          </div>
        </div>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-8">
          <TabsList className="mb-4">
            {availableTabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="flex items-center gap-2">
                {tab.icon}
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {/* Overview Tab */}
          {canAccessTab('overview') && (
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
          )}
          
          {/* Details Tab */}
          {canAccessTab('details') && (
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
          )}

          {/* Quality Assessment Tab */}
          {canAccessTab('quality') && (
            <TabsContent value="quality" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Quality Assessment</CardTitle>
                  <CardDescription>
                    Upload images and assessments for shipment items
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="item-select">Select Item</Label>
                      <Select value={selectedItem} onValueChange={setSelectedItem}>
                        <SelectTrigger>
                          <SelectValue placeholder="Choose an item to assess" />
                        </SelectTrigger>
                        <SelectContent>
                          {shipment.items.map((item) => (
                            <SelectItem key={item.sku} value={item.sku}>
                              {item.sku} - {item.description}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label>Upload Images</Label>
                      <div className="mt-2">
                        <FilePond
                          files={qualityImages}
                          onupdatefiles={(fileItems) => {
                            setQualityImages(fileItems.map(item => item.file as File));
                          }}
                          allowMultiple={true}
                          allowImagePreview={true}
                          acceptedFileTypes={['image/*']}
                          name="quality-images"
                          labelIdle='Drag & Drop your images or <span class="filepond--label-action">Browse</span>'
                        />
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="quality-notes">Assessment Notes</Label>
                      <textarea
                        id="quality-notes"
                        className="w-full p-3 border rounded-md resize-none"
                        rows={3}
                        placeholder="Add your quality assessment notes..."
                        value={qualityNotes}
                        onChange={(e) => setQualityNotes(e.target.value)}
                      />
                    </div>

                    <Button 
                      onClick={handleQualitySubmit} 
                      className="w-full"
                      disabled={isSubmitting || !selectedItem}
                    >
                      <Camera className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Submitting...' : 'Submit Quality Assessment'}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Previous Quality Assessments */}
              {qualityAssessments.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Previous Assessments</CardTitle>
                    <CardDescription>
                      History of quality assessments for this shipment
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {qualityAssessments.map((assessment, index) => (
                        <div key={index} className="border rounded-lg p-4">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-medium">Item: {assessment.itemSku}</h4>
                            <Badge variant={assessment.status === 'approved' ? 'default' : 'secondary'}>
                              {assessment.status}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            Images: {assessment.images.length} uploaded
                          </p>
                          <p className="text-sm">{assessment.notes}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}

          {/* Invoices Tab */}
          {canAccessTab('invoices') && (
            <TabsContent value="invoices" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Upload Invoices</CardTitle>
                  <CardDescription>
                    Upload invoice documents for this shipment
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Select Invoice Files</Label>
                    <div className="mt-2">
                      <FilePond
                        files={invoiceFiles}
                        onupdatefiles={(fileItems) => {
                          setInvoiceFiles(fileItems.map(item => item.file as File));
                        }}
                        allowMultiple={true}
                        acceptedFileTypes={['application/pdf', 'image/*', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel']}
                        name="invoice-files"
                        labelIdle='Drag & Drop your invoice files or <span class="filepond--label-action">Browse</span>'
                      />
                    </div>
                  </div>

                  <Button onClick={handleInvoiceUpload} className="w-full" disabled={invoiceFiles.length === 0}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Invoices
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Uploaded Invoices</CardTitle>
                  <CardDescription>
                    Previously uploaded invoice documents
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No invoices uploaded yet</h3>
                    <p className="text-muted-foreground">
                      Upload your first invoice using the form above.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>
      </div>
    </div>
  );
}