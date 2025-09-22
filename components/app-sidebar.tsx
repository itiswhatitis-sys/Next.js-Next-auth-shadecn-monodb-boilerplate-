"use client"

import * as React from "react"
import {
  IconDashboard,
  IconListDetails,
  IconChartBar,
  IconUsers,
  IconFolder,
  IconSettings,
  IconHelp,
  IconSearch,
  IconBuildingFactory2,
  IconTruck,
  IconReport,
  IconDatabase,
  IconFlag,
  IconUserPlus,
  IconCalendarEvent,
  IconPackageExport,
  IconRoute,
} from "@tabler/icons-react"

import { NavDocuments } from "@/components/nav-documents"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const data = {
  user: {
    name: "SCM Hackathon Owner",
    email: "owner@supplyhack.com",
    avatar: "/avatars/owner.jpg",
  },
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: IconDashboard,
    },
    {
      title: "Shipments",
      url: "#",
      icon: IconPackageExport,
    },
    {
      title: "Suppliers",
      url: "#",
      icon: IconBuildingFactory2,
    },
    {
      title: "Logistics Partners",
      url: "#",
      icon: IconTruck,
    },
    {
      title: "Routes & Tracking",
      url: "#",
      icon: IconRoute,
    },
    {
      title: "Teams",
      url: "#",
      icon: IconUsers,
    },
    {
      title: "Analytics",
      url: "#",
      icon: IconChartBar,
    },
  ],
  documents: [
    {
      name: "Reports",
      url: "#",
      icon: IconReport,
    },
    {
      name: "Data Library",
      url: "#",
      icon: IconDatabase,
    },
    {
      name: "Compliance Rules",
      url: "#",
      icon: IconFlag,
    },
  ],
  navSecondary: [
    {
      title: "Create Shipment",
      url: "#",
      icon: IconCalendarEvent,
    },
    {
      title: "Invite Team Members",
      url: "#",
      icon: IconUserPlus,
    },
    {
      title: "Settings",
      url: "#",
      icon: IconSettings,
    },
    {
      title: "Get Help",
      url: "#",
      icon: IconHelp,
    },
    {
      title: "Search",
      url: "#",
      icon: IconSearch,
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="#">
                <IconTruck className="!size-5" />
                <span className="text-base font-semibold">
                  SCM Hackathon HQ
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={data.navMain} />
        <NavDocuments items={data.documents} />
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={data.user} />
      </SidebarFooter>
    </Sidebar>
  )
}
