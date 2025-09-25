'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from '@/components/logisticdashboard/Sidebar';
import { StatsCards } from '@/components/logisticdashboard/StatsCards';
import { CampaignChart } from '@/components/logisticdashboard/CampaignChart';
import { ActivityFeed } from '@/components/logisticdashboard/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { signOut, useSession } from 'next-auth/react';

export default function SupplierDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
   const { data: session, status } = useSession();
console.log(session?.user.role);

if(!session){
  return null ;
}
   if(session.user?.role !== "logistic"){
    return router.push('/unauthorized');
   }


   const handleLogout = async () => {
    try {
      // This will clear the session and redirect to homepage
      await signOut({ redirect: false }); 
      router.push('/'); // redirect to home after logout
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar onLogout={handleLogout} />
      
      <div className="md:ml-64 p-4 md:p-8">
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground capitalize">
              Welcome back{session ? `, ${session.user.name}` : ''}👋
            </p>
          </div>
          <Button onClick={() => router.push('/campaigns/create')}>
            <Plus className="mr-2 h-4 w-4" /> Create Campaign
          </Button>
        </div>
        
        <StatsCards className="mb-8" />
        
        <CampaignChart className="mb-8" />
        
        <ActivityFeed className="mb-8" />
      </div>
    </div>
  );
}
