'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/dashboard/Sidebar'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Building,
  Mail,
  Phone,
  MapPin,
  FileText,
  User,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'

import { useSession } from 'next-auth/react'
import { fetchCompanyProfileByEmail } from '@/app/actions/getSupplierCompanies'

interface CompanyProfile {
  _id: string
  companyName: string
  ownerName: string
  contactNumber: string
  companyEmail: string
  gstNumber: string
  address: string
  createdAt: string
  updatedAt: string
}

export default function CompanyProfilePage() {
  const router = useRouter()
  const [isLoadingProfile, setIsLoadingProfile] = useState(true)
  const [profile, setProfile] = useState<CompanyProfile | null>(null)
const { data: session, status } = useSession();


useEffect(() => {
  if (session?.user?.email) {
    fetchProfile();
  }
}, [session?.user?.email]);

  if (!session){
    return  null;
  }
  
  const fetchProfile = async () => {
    try {
      setIsLoadingProfile(true)
      const data = await fetchCompanyProfileByEmail(session.user.email||'')

      if (data.error) {
        toast.error('Error', { description: data.error })
        setProfile(null)
      } else {
        setProfile(data as CompanyProfile)
        console.log(profile)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Failed to fetch profile')
    } finally {
      setIsLoadingProfile(false)
    }
  }

// if (!data){
//    toast.error('You havent completed onboarding , fill onboarding')
//    router.push('/supplier/onboarding')

// }


  if (isLoadingProfile) {
    return (
      <div className="min-h-screen bg-background">
        {/* <Sidebar onLogout={handleLogout} /> */}
        <div className="md:ml-64 p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            <Skeleton className="h-8 w-64" />
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-64" />
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-6 w-full" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* <Sidebar onLogout={handleLogout} /> */}
      
      <div className="md:ml-64 p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-3xl font-bold">Company Profile</h1>
            <p className="text-muted-foreground mt-2">
              View and manage your company information
            </p>
          </div>

          {profile && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-6 w-6" />
                  {profile.companyName}
                </CardTitle>
                <CardDescription>
                  Last updated: {new Date(profile.updatedAt).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Company Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <User className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Owner Name</p>
                      <p className="text-sm font-medium">{profile.ownerName}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Mail className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Company Email</p>
                      <a 
                        href={`mailto:${profile.companyEmail}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {profile.companyEmail}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <Phone className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Contact Number</p>
                      <a 
                        href={`tel:${profile.contactNumber}`}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        {profile.contactNumber}
                      </a>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <MapPin className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">Address</p>
                      <p className="text-sm font-medium">{profile.address}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
                    <FileText className="h-5 w-5 text-primary" />
                    <div>
                      <p className="text-sm text-muted-foreground">GST Number</p>
                      <p className="text-sm font-medium">{profile.gstNumber}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
