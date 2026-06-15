"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import { toast } from "sonner";
import { IconTrendingUp } from "@tabler/icons-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { type OutlineItem } from "./data-table-types";

const chartData = [
  { month: "January", desktop: 186, mobile: 80 },
  { month: "February", desktop: 305, mobile: 200 },
  { month: "March", desktop: 237, mobile: 120 },
  { month: "April", desktop: 73, mobile: 190 },
  { month: "May", desktop: 209, mobile: 130 },
  { month: "June", desktop: 214, mobile: 140 },
];

const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "var(--chart-1)",
  },
  mobile: {
    label: "Mobile",
    color: "var(--chart-2)",
  },
} satisfies ChartConfig;

interface TableCellViewerProps {
  item: OutlineItem;
  updateRow?: (rowId: string, updatedValues: Partial<OutlineItem>) => void;
}

export function TableCellViewer({ item, updateRow }: TableCellViewerProps) {
  const isMobile = useIsMobile();
  const [isOpen, setIsOpen] = React.useState(false);

  // Drawer Form State — derived from item; reset on open via key
  const [header, setHeader] = React.useState(item.header);
  const [type, setType] = React.useState(item.type);
  const [status, setStatus] = React.useState(item.status);
  const [target, setTarget] = React.useState(item.target);
  const [limit, setLimit] = React.useState(item.limit);
  const [reviewer, setReviewer] = React.useState(item.reviewer);

  // Sync form state when the drawer opens (useLayoutEffect is intentional here)
  /* eslint-disable react-hooks/set-state-in-effect */
  React.useLayoutEffect(() => {
    if (isOpen) {
      setHeader(item.header);
      setType(item.type);
      setStatus(item.status);
      setTarget(item.target);
      setLimit(item.limit);
      setReviewer(item.reviewer);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);
  /* eslint-enable react-hooks/set-state-in-effect */

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateRow?.(item.id.toString(), {
      header,
      type,
      status,
      target,
      limit,
      reviewer,
    });
    setIsOpen(false);
    toast.success(`Updated section "${header}"`);
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen} direction={isMobile ? "bottom" : "right"}>
      <DrawerTrigger asChild>
        <Button variant="link" className="w-fit px-0 text-left text-foreground hover:no-underline font-medium hover:text-primary transition-colors">
          {item.header}
        </Button>
      </DrawerTrigger>
      <DrawerContent className="h-full max-h-screen">
        <form onSubmit={handleSubmit} className="flex flex-col h-full">
          <DrawerHeader className="gap-1 shrink-0 px-6 pt-6 pb-2">
            <DrawerTitle className="text-sm font-bold tracking-tight">{header || "Edit Section"}</DrawerTitle>
            <DrawerDescription className="text-xs">
              Showing total visitors and config variables for the last 6 months.
            </DrawerDescription>
          </DrawerHeader>
          
          <div className="flex-1 overflow-y-auto px-6 py-2 space-y-4 text-xs">
            {!isMobile && (
              <>
                <div className="rounded-xl border bg-muted/15 p-2">
                  <ChartContainer config={chartConfig} className="h-40 w-full">
                    <AreaChart
                      accessibilityLayer
                      data={chartData}
                      margin={{
                        left: 0,
                        right: 10,
                        top: 5,
                        bottom: 0,
                      }}
                    >
                      <CartesianGrid vertical={false} strokeDasharray="3 3" />
                      <XAxis
                        dataKey="month"
                        tickLine={false}
                        axisLine={false}
                        tickMargin={4}
                        tickFormatter={(value) => value.slice(0, 3)}
                      />
                      <ChartTooltip
                        cursor={false}
                        content={<ChartTooltipContent indicator="dot" />}
                      />
                      <Area
                        dataKey="mobile"
                        type="natural"
                        fill="var(--color-mobile)"
                        fillOpacity={0.4}
                        stroke="var(--color-mobile)"
                        stackId="a"
                      />
                      <Area
                        dataKey="desktop"
                        type="natural"
                        fill="var(--color-desktop)"
                        fillOpacity={0.6}
                        stroke="var(--color-desktop)"
                        stackId="a"
                      />
                    </AreaChart>
                  </ChartContainer>
                </div>
                <div className="flex flex-col gap-1 pl-2.5 border-l-2 border-primary">
                  <div className="flex gap-2 items-center font-semibold text-foreground">
                    Trending up by 5.2% this month{" "}
                    <IconTrendingUp className="size-4 text-emerald-500" />
                  </div>
                  <div className="text-[11px] text-muted-foreground leading-relaxed">
                    Showing total visitor statistics and outline properties.
                  </div>
                </div>
                <Separator className="my-2" />
              </>
            )}
            
            <div className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="hdr" className="text-xs font-semibold text-foreground/85">Header</Label>
                <Input id="hdr" value={header} onChange={(e) => setHeader(e.target.value)} className="rounded-xl h-8 text-xs bg-muted/20" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="typ" className="text-xs font-semibold text-foreground/85">Type</Label>
                  <Select value={type} onValueChange={(val) => { if (val) setType(val) }}>
                    <SelectTrigger id="typ" className="w-full text-xs rounded-xl h-8">
                      <SelectValue placeholder="Select a type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Table of Contents">Table of Contents</SelectItem>
                      <SelectItem value="Executive Summary">Executive Summary</SelectItem>
                      <SelectItem value="Technical Approach">Technical Approach</SelectItem>
                      <SelectItem value="Design">Design</SelectItem>
                      <SelectItem value="Capabilities">Capabilities</SelectItem>
                      <SelectItem value="Focus Documents">Focus Documents</SelectItem>
                      <SelectItem value="Narrative">Narrative</SelectItem>
                      <SelectItem value="Cover Page">Cover Page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="st" className="text-xs font-semibold text-foreground/85">Status</Label>
                  <Select value={status} onValueChange={(val) => { if (val) setStatus(val) }}>
                    <SelectTrigger id="st" className="w-full text-xs rounded-xl h-8">
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Done">Done</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Not Started">Not Started</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="trg" className="text-xs font-semibold text-foreground/85">Target</Label>
                  <Input id="trg" value={target} onChange={(e) => setTarget(e.target.value)} className="rounded-xl h-8 text-xs bg-muted/20" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="lim" className="text-xs font-semibold text-foreground/85">Limit</Label>
                  <Input id="lim" value={limit} onChange={(e) => setLimit(e.target.value)} className="rounded-xl h-8 text-xs bg-muted/20" />
                </div>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="rev" className="text-xs font-semibold text-foreground/85">Reviewer</Label>
                <Select value={reviewer} onValueChange={(val) => { if (val) setReviewer(val) }}>
                  <SelectTrigger id="rev" className="w-full text-xs rounded-xl h-8">
                    <SelectValue placeholder="Select a reviewer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Assign reviewer">Assign reviewer</SelectItem>
                    <SelectItem value="Eddie Lake">Eddie Lake</SelectItem>
                    <SelectItem value="Jamik Tashpulatov">Jamik Tashpulatov</SelectItem>
                    <SelectItem value="Emily Whalen">Emily Whalen</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          
          <DrawerFooter className="shrink-0 border-t border-border/40 bg-muted/10 p-4 flex flex-row items-center justify-end gap-2">
            <DrawerClose asChild>
              <Button type="button" variant="outline" className="rounded-xl h-8 px-4 text-xs font-medium">
                Cancel
              </Button>
            </DrawerClose>
            <Button type="submit" className="rounded-xl h-8 px-4 text-xs font-semibold">
              Save Changes
            </Button>
          </DrawerFooter>
        </form>
      </DrawerContent>
    </Drawer>
  );
}
