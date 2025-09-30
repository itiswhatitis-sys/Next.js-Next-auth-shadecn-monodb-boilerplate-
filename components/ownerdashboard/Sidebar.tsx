'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/common/ThemeToggle';
import { 
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { signOut } from 'next-auth/react';



export function Sidebar() {
  const pathname = usePathname();
  const [openCampaigns, setOpenCampaigns] = useState(false);
const handleLogout = async () => {
  try {
    await signOut({ callbackUrl: "/" }) // redirects automatically
  } catch (error) {
    console.error("Logout failed:", error)
  }
}
  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const NavItem = ({ path, label, icon: Icon }: { path: string; label: string; icon: React.ElementType }) => (
    <Link 
      href={path} 
      className={`flex items-center gap-3 px-3 py-2 rounded-md transition-colors ${
        isActive(path) 
          ? 'bg-primary text-primary-foreground' 
          : 'hover:bg-muted'
      }`}
    >
      <Icon className="h-5 w-5" />
      <span>{label}</span>
    </Link>
  );

  const NavContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold text-primary">INTERAIN</span>
        </Link>
      </div>
      
      <div className="flex-1 py-6 px-4 space-y-6">
        <div className="space-y-1">
          <NavItem path="/owner/dashboard" label="Dashboard" icon={LayoutDashboard} />
          
          <Collapsible
            open={openCampaigns}
            onOpenChange={setOpenCampaigns}
            className="w-full"
          >
            <CollapsibleTrigger asChild>
              <Button
                variant={isActive('/owner/shipment') ? "default" : "ghost"}
                className={`w-full justify-between ${
                  isActive('/owner/shipment') ? 'bg-primary text-primary-foreground' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5" />
                  <span>Shipment</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${openCampaigns ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pl-9 mt-1 space-y-1">
              <Link 
                href="/owner/shipment" 
                className={`block py-2 px-3 rounded-md transition-colors ${
                  pathname === '/owner/shipment' ? 'bg-muted font-medium' : 'hover:bg-muted'
                }`}
              >
                All Shipment
              </Link>
              <Link 
                href="/owner/shipment/create" 
                className={`block py-2 px-3 rounded-md transition-colors ${
                  pathname === '/owner/shipment/create' ? 'bg-muted font-medium' : 'hover:bg-muted'
                }`}
              >
                Create Shipment
              </Link>
            </CollapsibleContent>
          </Collapsible>
            <NavItem path="/owner/logistics" label="Logistics" icon={Users} />
          <NavItem path="/owner/team" label="Team" icon={FileText} />
          <NavItem path="/owner/profile" label="Company Profile" icon={Settings} />
        </div>
      </div>
      
      <div className="p-4 border-t mt-auto">
        <div className="flex items-center justify-between">
          <ThemeToggle />
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 border-r bg-background z-10">
        <NavContent />
      </aside>
      
      {/* Mobile Sidebar */}
      <div className="md:hidden border-b bg-background sticky top-0 z-10">
        <div className="flex items-center justify-between p-4">
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-xl font-bold text-primary">INTERAIN</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <NavContent />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </>
  );
}
