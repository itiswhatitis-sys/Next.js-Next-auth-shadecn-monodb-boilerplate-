"use client"

import React, { useState } from "react"
import { useForm, useFieldArray } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Plus, X } from "lucide-react"
import { cn } from "@/lib/utils"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useSession } from "next-auth/react";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { saveLogisticCompany } from "@/app/actions/saveLogisticOnboarding"
// ---------------- Validation Schemas ----------------

// Step 1: Company details schema
const companySchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  ownerName: z.string().min(2, "Owner name must be at least 2 characters"),
  contactNumber: z
    .string()
    .regex(/^[0-9]{10}$/, "Contact number must be 10 digits"),
  companyEmail: z.string().email("Invalid company email"),
  gstNumber: z.string().min(5, "GST number must be at least 5 characters"),
  address: z.string().min(5, "Address must be at least 5 characters"),
})

// Step 2: Team details schema (optional)
const teamSchema = z.object({
  teamMembers: z
    .array(
      z.object({
        name: z.string().min(2, "Member name must be at least 2 characters"),
        email: z.string().email("Invalid email"),
        role: z.enum(["operations","delivery-partner"]),
      })
    )
    .optional(),
})

// Merge
const fullSchema = companySchema.merge(teamSchema).extend({
  teamSkipped: z.boolean().optional()
})

export type FormValues = z.infer<typeof fullSchema>

// ---------------- Component ----------------
export default function LogisticrOnboardFlow() {
   const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return; // wait until session is fetched
  if (session?.user?.email) {
    form.setValue("companyEmail", session.user.email, { shouldValidate: true });
  }
    if (!session) {
      console.log("no session");
      router.push("/logistic/login");
    } else if (session.user?.role !== "logistic") {
      router.push("/unauthorized");
    }
  }, [status, session, router]);  
  const [step, setStep] = useState(0)

  const steps = ["Company Details", "Team Details"]
  const email = session?.user?.email ||'';
  const form = useForm<FormValues>({
    resolver: zodResolver(fullSchema),
    defaultValues: {
      companyName: "",
      ownerName: "",
      address: "",
      gstNumber:"",
      companyEmail:  "",
      contactNumber: "",
      teamMembers: [
      { name: "", email: "", role: "operations" },
      { name: "", email: "", role: "operations" },
      { name: "", email: "", role: "operations" }
    ],
    },
    mode: "onChange",
  })

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "teamMembers",
  })

  const nextStep = async () => {
    const valid = await form.trigger(["companyName", "gstNumber", "address", "contactNumber", "companyEmail","ownerName"])
    if (valid) setStep(1)
  }


// Add this new function after the existing onSubmit function
const onSkipTeam = async () => {
  try {
    const companyData = form.getValues();
    
    // Create data object with skip flag
    const dataWithSkip = {
      ...companyData,
      teamSkipped: true,
      teamMembers: [] // Empty team members array
    };

    console.log("Skipping team setup:", dataWithSkip);

    // Call the server action with skip flag
    const result = await saveLogisticCompany(dataWithSkip);

    if (result.success) {
      console.log("Company saved successfully (team skipped)");
      router.push('/logistic');
    } else {
      console.error("Error saving company:", result.error);
    }
  } catch (err: any) {
    console.error("Unexpected error:", err);
    alert("An unexpected error occurred.");
  }
};

// Update the existing onSubmit function to handle normal completion
const onSubmit = async (values: FormValues) => {
  try {
    console.log("Onboarding Complete:", values);

    // Add teamSkipped flag as false for normal completion
    const dataWithSkipFlag = {
      ...values,
      teamSkipped: false
    };

    const result = await saveLogisticCompany(dataWithSkipFlag);

    if (result.success) {
      console.log("Company saved successfully:");
      router.push('/logistic');
    } else {
      console.error("Error saving company:", result.error);
    }
  } catch (err: any) {
    console.error("Unexpected error:", err);
    alert("An unexpected error occurred.");
  }
};

  return (
    <div className="lg:flex grid grid-cols-1  ">
    
     {/* Left Sidebar for Progress */}
    <Card className="relative lg:w-1/3  w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 flex flex-col justify-center items-start border border-gray-300 dark:border-gray-700 shadow-md rounded-lg p-6">
      <div
        className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-300"
        style={{ width: `${((step + 1) / 2) * 100}%` }} // 👈 2 steps only
      />

      <CardContent className="p-0 w-full">
        <div className="flex items-center mb-10">
          <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
            Logistic Onboarding
          </h2>
        </div>

        <div className="space-y-8">
          {[1, 2].map((s) => (
            <div
              key={s}
              className={cn(
                "flex items-center",
                step + 1 === s
                  ? "text-blue-600 font-semibold dark:text-blue-400"
                  : "text-gray-500 dark:text-gray-400"
              )}
            >
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center mr-3 text-sm",
                  step + 1 === s
                    ? "bg-blue-600 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300"
                )}
              >
                {s}
              </div>
              <div>
                <p className="text-md">Step {s}</p>
                <p className="text-lg">
                  {s === 1 ? "Company Details" : "Team Details"}

                </p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-10 text-gray-500 dark:text-gray-400 text-sm hidden lg:block">
          <p>&copy; 2025 Interain AI</p>
        </div>
      </CardContent>
    </Card>


      {/* Main content */}
      <div className="flex-1 lg:w-2/3 lg:pl-4 pt-4 ">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <div>{steps[step]}</div>
             {
                  step === 1 ? 
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={onSkipTeam} // ✅ Change this from form.handleSubmit(onSubmit)() to onSkipTeam
                  >
                    Skip for Now
                  </Button> : ""
                }
              </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
               {/* Step 1: Company */}
                {step === 0 && (
                  <div className="space-y-6  ">
                    {/* Logo upload */}
                    <div className="flex flex-col items-center space-y-3">
                      {/* Generate initials from email */}
                      {(() => {
                        const email = "company@gmail.com"; // replace with actual user email
                        const initials = email.slice(0, 2).toUpperCase();

                        // create a text-based SVG logo and encode it as a data URL
                        const svg = `
                          <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
                            <circle cx='32' cy='32' r='32' fill='#4F46E5'/>
                            <text x='50%' y='50%' font-size='24' font-family='Arial' fill='white' text-anchor='middle' alignment-baseline='central'>
                              ${initials}
                            </text>
                          </svg>
                        `;
                        const encoded = `data:image/svg+xml;base64,${btoa(svg)}`;

                        return (
                          <img
                            src={encoded}
                            alt="logo"
                            className="h-22 w-22 rounded-full object-cover"
                          />
                        );
                      })()}

                      {/* Remove file input since you don’t want editable */}
                    </div>

                    {/* Company Name + Owner Name */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4   ">
                      <FormField
                        control={form.control}  
                        name="companyName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter company name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="ownerName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Owner Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter owner name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Contact No + Gmail */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="contactNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Contact Number</FormLabel>
                            <FormControl>
                              <Input placeholder="0123456789" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="companyEmail"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Company Gmail</FormLabel>
                            <FormControl>
                              <Input type="email" placeholder={email} {...field} disabled/>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* GST + Address */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="gstNumber"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>GST Number</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter GST number" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="address"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Address</FormLabel>
                            <FormControl>
                              <Input placeholder="Enter address" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <Button type="button" onClick={nextStep} className="w-full">
                      Next
                    </Button>
                  </div>
                )}

                {/* Step 2: Team */}
                {step === 1 && (
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <h3 className="font-semibold">Team Members</h3>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          append({ name: "", email: "", role: "operations" })
                        }
                      >
                        <Plus className="w-4 h-4 mr-1" /> Add Member
                      </Button>
                    </div>

                    {fields.map((field, idx) => (
                      <div
                        key={field.id}
                        className="grid grid-cols-3 gap-2 border rounded-lg p-3 relative"
                      >
                        <FormField
                          control={form.control}
                          name={`teamMembers.${idx}.name`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Member name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name={`teamMembers.${idx}.email`}
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="company@member.com" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                        control={form.control}
                        name={`teamMembers.${idx}.role`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value} // bind value from RHF
                              >
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Select role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="operations">Operations Staff</SelectItem>
                                  <SelectItem value="delivery-partner">Delivery Partner</SelectItem>
                                  {/* <SelectItem value="finance">Finance Staff</SelectItem> */}
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                        <Button
                          type="button"
                          size="icon"
                          variant="ghost"
                          className="absolute top-2 right-2"
                          onClick={() => remove(idx)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}

                    <div className="flex items-center justify-between gap-3">
                      <Button type="button" variant="outline"  onClick={() => setStep(0)}>
                        Back
                      </Button>
                      <Button type="submit">Finish Onboarding</Button>
                      {/* <Button
                        type="button"
                        variant="ghost"
                        onClick={() => form.handleSubmit(onSubmit)()}
                      >
                        Skip for Now
                      </Button> */}
                    </div>
                  </div>
                )}
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
