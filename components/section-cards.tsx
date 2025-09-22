import { IconTrendingDown, IconTrendingUp, IconTruck, IconBuildingFactory2, IconUsers, IconRoute } from "@tabler/icons-react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="*:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card dark:*:data-[slot=card]:bg-card grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:shadow-xs lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      
      {/* Total Shipments */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Shipments</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            1,250
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +8.2%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Growing shipment activity <IconTruck className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Compared to last quarter
          </div>
        </CardFooter>
      </Card>

      {/* Active Suppliers */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Active Suppliers</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            342
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingDown />
              -3.1%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Slight decline in supplier count <IconTrendingDown className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Supplier engagement needs attention
          </div>
        </CardFooter>
      </Card>

      {/* Logistics Partners */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Logistics Partners</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            28
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +6.0%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Strong collaborations <IconUsers className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Partnerships expanding steadily
          </div>
        </CardFooter>
      </Card>

      {/* On-Time Delivery Rate */}
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>On-Time Delivery Rate</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl">
            94.5%
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IconTrendingUp />
              +2.3%
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Improved delivery efficiency <IconRoute className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Meeting SLA targets consistently
          </div>
        </CardFooter>
      </Card>

    </div>
  )
}
