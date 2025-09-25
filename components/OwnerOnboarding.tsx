"use client"

import React, { useEffect } from "react"
import { useForm } from "react-hook-form"
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
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { saveOwnerCompany } from "@/app/actions/saceOwnerOnboarding"

// ---------------- Validation Schema ----------------
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

export type FormValues = z.infer<typeof companySchema>

// ---------------- Component ----------------
export default function OwnerOnboardForm() {
  const { data: session, status } = useSession()
  const router = useRouter()

  const form = useForm<FormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: "",
      ownerName: "",
      address: "",
      gstNumber: "",
      companyEmail: "",
      contactNumber: "",
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (status === "loading") return
    if (session?.user?.email) {
      form.setValue("companyEmail", session.user.email, { shouldValidate: true })
    }
    if (!session) {
      router.push("/supplier/login")
    } else if (session.user?.role !== "owner") {
      router.push("/unauthorized")
    }
  }, [status, session, router, form])

  const onSubmit = async (values: FormValues) => {
    try {
      console.log("Owner Onboarding Complete:", values)

      const result = await saveOwnerCompany(values)

      if (result.success) {
        console.log("Owner company saved successfully")
        router.push("/owner")
      } else {
        console.error("Error saving company:", result.error)
      }
    } catch (err: any) {
      console.error("Unexpected error:", err)
      alert("An unexpected error occurred.")
    }
  }

  return (
    <div className="lg:flex grid grid-cols-1">
      {/* Left Sidebar */}
      <Card className="relative lg:w-1/3 w-full bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900 dark:to-indigo-800 flex flex-col justify-center items-start border border-gray-300 dark:border-gray-700 shadow-md rounded-lg p-6">
        <div
          className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-300"
          style={{ width: "100%" }} // only 1 step
        />
        <CardContent className="p-0 w-full">
          <div className="flex items-center mb-10">
            <h2 className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">
              Owner Onboarding
            </h2>
          </div>
          <div className="flex items-center text-blue-600 font-semibold dark:text-blue-400">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mr-3 text-sm bg-blue-600 text-white">
              1
            </div>
            <div>
              <p className="text-md">Step 1</p>
              <p className="text-lg">Company Details</p>
            </div>
          </div>
          <div className="mt-10 text-gray-500 dark:text-gray-400 text-sm hidden lg:block">
            <p>&copy; 2025 Interain AI</p>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="flex-1 lg:w-2/3 lg:pl-4 pt-4">
        <Card>
          <CardHeader>
            <CardTitle>Company Details</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Logo initials */}
                <div className="flex flex-col items-center space-y-3">
                  {(() => {
                    const email = session?.user?.email || "company@gmail.com"
                    const initials = email.slice(0, 2).toUpperCase()
                    const svg = `
                      <svg xmlns='http://www.w3.org/2000/svg' width='64' height='64'>
                        <circle cx='32' cy='32' r='32' fill='#4F46E5'/>
                        <text x='50%' y='50%' font-size='24' font-family='Arial' fill='white' text-anchor='middle' alignment-baseline='central'>
                          ${initials}
                        </text>
                      </svg>
                    `
                    const encoded = `data:image/svg+xml;base64,${btoa(svg)}`
                    return (
                      <img
                        src={encoded}
                        alt="logo"
                        className="h-22 w-22 rounded-full object-cover"
                      />
                    )
                  })()}
                </div>

                {/* Company + Owner Name */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

                {/* Contact + Email */}
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
                        <FormLabel>Company Email</FormLabel>
                        <FormControl>
                          <Input type="email" {...field} disabled />
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

                <Button type="submit" className="w-full">
                  Finish Onboarding
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
