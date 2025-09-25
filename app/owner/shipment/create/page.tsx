"use client";
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { ShipmentCreator } from '@/components/shipments/shipmentCreator';
export default function CreateShipmentPage() {

      const router = useRouter();
      const [isLoading, setIsLoading] = useState(false);
       const { data: session, status } = useSession();
    console.log(session?.user.role);
    
    if(!session){
      return null ;
    }
       if(session.user?.role !== "owner"){
        return router.push('/unauthorized');
       }
    
    
    
      if (isLoading) {
        return (
          <div className="flex h-screen items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          </div>
        );
      }
  return (
    <ShipmentCreator />
  )
}
