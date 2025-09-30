'use client'

import { useEffect, useState } from 'react';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { CampaignChart } from '@/components/dashboard/CampaignChart';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { BellIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function SupplierDashboardPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const { data: session, status } = useSession();

  const [notifications, setNotifications] = useState<any>([
    {
      text: 'This is a notification',
      date: '02-01-2015',
      read: true,
    },
    {
      text: 'This is another notification',
      date: '02-01-2015',
      read: false,
    },
  ]);

  if (!session) {
    return null;
  }

  if (session.user?.role !== 'supplier') {
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
    <div className="min-h-screen bg-background">
      <div className="md:ml-64 p-4 md:p-8">
        {/* Header with title + notifications + create button */}
        <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground capitalize">
              Welcome back{session ? `, ${session.user.name}` : ''} 👋
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Notifications Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="relative" variant="outline" size="icon">
                  <div
                    className={`absolute -top-2 -right-1 h-3 w-3 rounded-full my-1 ${
                      notifications.find((x: any) => x.read === false)
                        ? 'bg-green-500'
                        : 'bg-neutral-200'
                    }`}
                  ></div>
                  <BellIcon className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {notifications.map((item: any, key: number) => (
                  <DropdownMenuItem
                    key={key}
                    className="py-2 px-3 cursor-pointer hover:bg-neutral-50 transition flex items-start gap-2"
                  >
                    <div
                      className={`h-3 w-3 rounded-full my-1 ${
                        !item.read ? 'bg-green-500' : 'bg-neutral-200'
                      }`}
                    ></div>
                    <div>
                      <p>{item.text}</p>
                      <p className="text-xs text-neutral-500">{item.date}</p>
                    </div>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Create Campaign button */}
            <Button onClick={() => router.push('/supplier/shipment/')}>
              <Plus className="mr-2 h-4 w-4" /> Track Shipment
            </Button>
          </div>
        </div>

        <StatsCards className="mb-8" />
        <CampaignChart className="mb-8" />
        <ActivityFeed className="mb-8" />
      </div>
    </div>
  );
}
