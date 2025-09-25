'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Plus, X, Mail } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Sidebar } from '@/components/dashboard/Sidebar';
import { useSession } from "next-auth/react"
// Step 1: Invitees Schema
const inviteesSchema = z.object({
  invitees: z.array(z.object({
    email: z.string().email({ message: 'Please enter a valid email address' }),
    role: z.enum(['supplier', 'logistic'], {
      required_error: 'Please select a role',
    }),
    note: z.string().optional(),
  })).min(1, { message: 'At least one invitee is required' }),
});

// Step 2: Shipment Details Schema
const shipmentDetailsSchema = z.object({
  title: z.string().min(2, { message: 'Title is required' }),
  description: z.string().optional(),
  destination: z.object({
    address: z.string().min(2, { message: 'Address is required' }),
    city: z.string().min(2, { message: 'City is required' }),
    state: z.string().min(2, { message: 'State is required' }),
    country: z.string().min(2, { message: 'Country is required' }),
  }),
  expectedDeliveryDate: z.date({
    required_error: 'Expected delivery date is required',
  }),
  preferredMode: z.enum(['road', 'rail', 'air', 'sea'], {
    required_error: 'Please select a preferred mode',
  }),
  priority: z.enum(['low', 'medium', 'high'], {
    required_error: 'Please select priority level',
  }),
  qualityChecksRequired: z.array(z.string()).optional(),
});

// Step 3: Items Schema
const itemsSchema = z.object({
  items: z.array(z.object({
    sku: z.string().min(1, { message: 'SKU is required' }),
    description: z.string().optional(),
    quantity: z.coerce.number().positive({ message: 'Quantity must be a positive number' }),
    unit: z.string().min(1, { message: 'Unit is required' }),
    weightKg: z.coerce.number().positive({ message: 'Weight must be a positive number' }),
  })).min(1, { message: 'At least one item is required' }),
});

type InviteeType = {
  email: string;
  role: 'supplier' | 'logistic';
  note?: string;
};

type ItemType = {
  sku: string;
  description?: string;
  quantity: number;
  unit: string;
  weightKg: number;
};

export function ShipmentCreator() {
     const { data: session, status } = useSession()
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Step 1: Invitees
    invitees: [] as InviteeType[],
    
    // Step 2: Shipment Details
    title: '',
    description: '',
    destination: {
      address: '',
      city: '',
      state: '',
      country: '',
    },
    expectedDeliveryDate: new Date(),
    preferredMode: 'road' as 'road' | 'rail' | 'air' | 'sea',
    priority: 'medium' as 'low' | 'medium' | 'high',
    qualityChecksRequired: [] as string[],
    
    // Step 3: Items
    items: [] as ItemType[],
  });

    if (!session) return null ;

    console.log("session id :",session?.user.id) 
  // Step 1 form - Invitees
  const inviteesForm = useForm<z.infer<typeof inviteesSchema>>({
    resolver: zodResolver(inviteesSchema),
    defaultValues: {
      invitees: formData.invitees.length > 0 ? formData.invitees : [{
        email: '',
        role: 'supplier',
        note: '',
      }],
    },
  });

  // Step 2 form - Shipment Details
  const shipmentDetailsForm = useForm<z.infer<typeof shipmentDetailsSchema>>({
    resolver: zodResolver(shipmentDetailsSchema),
    defaultValues: {
      title: formData.title,
      description: formData.description,
      destination: formData.destination,
      expectedDeliveryDate: formData.expectedDeliveryDate,
      preferredMode: formData.preferredMode,
      priority: formData.priority,
      qualityChecksRequired: formData.qualityChecksRequired,
    },
  });

  // Step 3 form - Items
  const itemsForm = useForm<z.infer<typeof itemsSchema>>({
    resolver: zodResolver(itemsSchema),
    defaultValues: {
      items: formData.items.length > 0 ? formData.items : [{
        sku: '',
        description: '',
        quantity: 1,
        unit: '',
        weightKg: 0,
      }],
    },
  });

  // Handle quality checks input
  const [qualityCheckInput, setQualityCheckInput] = useState('');
  
  const addQualityCheck = () => {
    if (qualityCheckInput.trim() && !formData.qualityChecksRequired.includes(qualityCheckInput.trim())) {
      const updatedChecks = [...formData.qualityChecksRequired, qualityCheckInput.trim()];
      shipmentDetailsForm.setValue('qualityChecksRequired', updatedChecks);
      setFormData(prevData => ({ ...prevData, qualityChecksRequired: updatedChecks }));
      setQualityCheckInput('');
    }
  };

  const removeQualityCheck = (check: string) => {
    const updatedChecks = formData.qualityChecksRequired.filter(c => c !== check);
    shipmentDetailsForm.setValue('qualityChecksRequired', updatedChecks);
    setFormData(prevData => ({ ...prevData, qualityChecksRequired: updatedChecks }));
  };

  // Add new invitee
  const addInvitee = () => {
    const currentInvitees = inviteesForm.getValues().invitees || [];
    const newInvitee = {
      email: '',
      role: 'supplier' as const,
      note: '',
    };
    inviteesForm.setValue('invitees', [...currentInvitees, newInvitee]);
  };

  // Remove invitee
  const removeInvitee = (index: number) => {
    const currentInvitees = inviteesForm.getValues().invitees;
    const updatedInvitees = currentInvitees.filter((_, i) => i !== index);
    inviteesForm.setValue('invitees', updatedInvitees);
  };

  // Add new item
  const addItem = () => {
    const currentItems = itemsForm.getValues().items || [];
    const newItem = {
      sku: '',
      description: '',
      quantity: 1,
      unit: '',
      weightKg: 0,
    };
    itemsForm.setValue('items', [...currentItems, newItem]);
  };

  // Remove item
  const removeItem = (index: number) => {
    const currentItems = itemsForm.getValues().items;
    const updatedItems = currentItems.filter((_, i) => i !== index);
    itemsForm.setValue('items', updatedItems);
  };

  // Step 1 submission - Invitees
  const onSubmitInvitees = (values: z.infer<typeof inviteesSchema>) => {
    setFormData({ ...formData, invitees: values.invitees });
    setStep(2);
  };

  // Step 2 submission - Shipment Details
  const onSubmitShipmentDetails = (values: z.infer<typeof shipmentDetailsSchema>) => {
    setFormData({ ...formData, ...values });
    setStep(3);
  };

  // Step 3 submission - Final (Items)
  const onSubmitItems = async (values: z.infer<typeof itemsSchema>) => {
    setIsLoading(true);
    try {
      // Create the final shipment data structure
      const finalData = {
        title: formData.title,
        description: formData.description,
        ownerEmail: session.user.email , // In real app, this would come from auth context
        destination: formData.destination,
        expectedDeliveryDate: formData.expectedDeliveryDate,
        items: values.items,
        preferredMode: formData.preferredMode,
        priority: formData.priority,
        invitees: formData.invitees.map(invitee => ({
          ...invitee,
          status: 'pending' as const,
        })),
        qualityChecksRequired: formData.qualityChecksRequired,
        trackingStatus: 'created' as const,
      };
      
      console.log('Final Shipment Data:', finalData);


    //api to submit data
    const response = await fetch('/api/shipment/create', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(finalData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create shipment');
    }
    
    const result = await response.json();
    console.log('Created shipment:', result);
      
      toast.success('Success', {
        description: 'Shipment created successfully (check console for data)'
      });
      
      // In a real app, you would make an API call here
      // const response = await fetch('/api/shipments/create', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(finalData),
      // });
      
      router.push('/owner/shipments');
      setIsLoading(false);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create shipment';
      toast.error('Error', {
        description: errorMessage
      });
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Logout failed');
      }

      toast.success('Logged out', {
        description: 'You have been successfully logged out'
      });

      router.push('/login');
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Logout error:', errorMessage);
      toast.error('Error', {
        description: 'Failed to logout. Please try again.'
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* <Sidebar onLogout={handleLogout} /> */}
      
      <div className="md:ml-64 p-4 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Create Shipment</h1>
          <p className="text-muted-foreground">
            Set up a new shipment and invite collaborators
          </p>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <Progress value={step * 33.33} className="h-2" />
          <div className="flex justify-between mt-2 text-sm text-muted-foreground">
            <span className={step >= 1 ? 'font-medium text-primary' : ''}>Invite Collaborators</span>
            <span className={step >= 2 ? 'font-medium text-primary' : ''}>Shipment Details</span>
            <span className={step >= 3 ? 'font-medium text-primary' : ''}>Items & Review</span>
          </div>
        </div>
        
        {/* Step 1: Invite Collaborators */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Invite Collaborators</CardTitle>
              <CardDescription>
                Invite suppliers and logistics partners to collaborate on this shipment
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...inviteesForm}>
                <form onSubmit={inviteesForm.handleSubmit(onSubmitInvitees)} className="space-y-4">
                  {inviteesForm.watch('invitees').map((invitee, index) => (
                    <Card key={index} className="border border-muted">
                      <CardHeader className="bg-muted/50 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Mail className="h-4 w-4" />
                            <CardTitle className="text-lg">Invitee {index + 1}</CardTitle>
                          </div>
                          {index > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeInvitee(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </CardHeader>
                      <CardContent className="py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                          <FormField
                            control={inviteesForm.control}
                            name={`invitees.${index}.email`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email Address</FormLabel>
                                <FormControl>
                                  <Input placeholder="e.g. supplier@company.com" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={inviteesForm.control}
                            name={`invitees.${index}.role`}
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select role" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="supplier">Supplier</SelectItem>
                                    <SelectItem value="logistic">Logistics Partner</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={inviteesForm.control}
                          name={`invitees.${index}.note`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Note (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Add a note for this collaborator..." 
                                  className="min-h-[80px]"
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addInvitee}
                    className="w-full"
                  >
                    <Plus className="mr-2 h-4 w-4" /> Add Another Invitee
                  </Button>
                  
                  <div className="flex justify-end">
                    <Button type="submit">
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
        
        {/* Step 2: Shipment Details */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Shipment Details</CardTitle>
              <CardDescription>
                Provide details about the shipment and delivery requirements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...shipmentDetailsForm}>
                <form onSubmit={shipmentDetailsForm.handleSubmit(onSubmitShipmentDetails)} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={shipmentDetailsForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem className="md:col-span-2">
                          <FormLabel>Shipment Title</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. Electronics Components Shipment" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={shipmentDetailsForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description (Optional)</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Describe the shipment details..." 
                            className="min-h-[100px]"
                            {...field} 
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {/* Destination */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Destination</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={shipmentDetailsForm.control}
                        name="destination.address"
                        render={({ field }) => (
                          <FormItem className="md:col-span-2">
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. 123 Main Street" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={shipmentDetailsForm.control}
                        name="destination.city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. New York" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={shipmentDetailsForm.control}
                        name="destination.state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. NY" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={shipmentDetailsForm.control}
                        name="destination.country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country</FormLabel>
                            <FormControl>
                              <Input placeholder="e.g. United States" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={shipmentDetailsForm.control}
                      name="expectedDeliveryDate"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Expected Delivery Date</FormLabel>
                          <DatePicker
                            date={field.value}
                            setDate={field.onChange}
                          />
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={shipmentDetailsForm.control}
                      name="preferredMode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preferred Mode</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select mode" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="road">Road</SelectItem>
                              <SelectItem value="rail">Rail</SelectItem>
                              <SelectItem value="air">Air</SelectItem>
                              <SelectItem value="sea">Sea</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={shipmentDetailsForm.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Priority</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select priority" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="low">Low</SelectItem>
                              <SelectItem value="medium">Medium</SelectItem>
                              <SelectItem value="high">High</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Quality Checks */}
                  <FormField
                    control={shipmentDetailsForm.control}
                    name="qualityChecksRequired"
                    render={() => (
                      <FormItem>
                        <FormLabel>Quality Checks Required</FormLabel>
                        <div className="flex gap-2">
                          <Input
                            placeholder="e.g. Temperature Check, Package Integrity"
                            value={qualityCheckInput}
                            onChange={(e) => setQualityCheckInput(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addQualityCheck();
                              }
                            }}
                          />
                          <Button type="button" onClick={addQualityCheck}>
                            Add
                          </Button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {formData.qualityChecksRequired.map((check) => (
                            <Badge key={check} variant="secondary" className="flex items-center gap-1">
                              {check}
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 p-0"
                                onClick={() => removeQualityCheck(check)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-between">
                    <Button type="button" variant="outline" onClick={() => setStep(1)}>
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back
                    </Button>
                    <Button type="submit">
                      Next <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        )}
        
        {/* Step 3: Items & Review */}
       {step === 3 && (
  <Card>
    <CardHeader>
      <CardTitle>Items & Review</CardTitle>
      <CardDescription>
        Add items to the shipment and review all details
      </CardDescription>
    </CardHeader>
    <CardContent>
      <Form {...itemsForm}>
        <form onSubmit={itemsForm.handleSubmit(onSubmitItems)} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Items</h3>
            {itemsForm.watch('items').map((item, index) => (
              <Card key={index} className="border border-muted">
                <CardHeader className="bg-muted/50 py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="flex items-center justify-center h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-medium">
                        {index + 1}
                      </span>
                      <CardTitle className="text-lg">Item {index + 1}</CardTitle>
                    </div>
                    {index > 0 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="py-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={itemsForm.control}
                      name={`items.${index}.sku`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>SKU</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. ELEC-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={itemsForm.control}
                      name={`items.${index}.description`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. LED Display Panel" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={itemsForm.control}
                      name={`items.${index}.quantity`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Quantity</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              placeholder="e.g. 50"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={itemsForm.control}
                      name={`items.${index}.unit`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unit</FormLabel>
                          <FormControl>
                            <Input placeholder="e.g. pcs, kg, liters" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={itemsForm.control}
                      name={`items.${index}.weightKg`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg)</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              step="0.01"
                              min="0"
                              placeholder="e.g. 25.5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            <Button
              type="button"
              variant="outline"
              onClick={addItem}
              className="w-full"
            >
              <Plus className="mr-2 h-4 w-4" /> Add Another Item
            </Button>
          </div>
          
          {/* Review Section */}
          <div className="space-y-4 border-t pt-6">
            <h3 className="text-lg font-semibold">Review</h3>
            
            <div className="bg-muted/50 p-4 rounded-md space-y-3">
              <div>
                <p className="text-sm font-medium">Shipment Title</p>
                <p className="text-sm text-muted-foreground">{formData.title}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium">Destination</p>
                <p className="text-sm text-muted-foreground">
                  {formData.destination.address}, {formData.destination.city}, {formData.destination.state}, {formData.destination.country}
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm font-medium">Expected Delivery</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.expectedDeliveryDate.toLocaleDateString()}
                  </p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Preferred Mode</p>
                  <p className="text-sm text-muted-foreground capitalize">{formData.preferredMode}</p>
                </div>
                
                <div>
                  <p className="text-sm font-medium">Priority</p>
                  <p className="text-sm text-muted-foreground capitalize">{formData.priority}</p>
                </div>
              </div>
              
              {formData.invitees.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Invitees</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.invitees.map((invitee, index) => (
                      <Badge key={index} variant="secondary">
                        {invitee.email} ({invitee.role})
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              {formData.qualityChecksRequired.length > 0 && (
                <div>
                  <p className="text-sm font-medium">Quality Checks</p>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {formData.qualityChecksRequired.map((check) => (
                      <Badge key={check} variant="outline">
                        {check}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-between">
            <Button type="button" variant="outline" onClick={() => setStep(2)}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Creating Shipment...' : 'Create Shipment'}
            </Button>
          </div>
        </form>
      </Form>
    </CardContent>
  </Card>
)}

  </div>
          </div>
)}