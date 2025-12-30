import
  {
    Calendar,
    Building2,
    BookOpen,
    DoorOpen,
    LayoutDashboard,
    Sparkles,
    Tag,
    Settings,
    CheckCircle2,
  } from "lucide-react";
import { Link, useLocation } from "@tanstack/react-router";

import
  {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
  } from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { LogoIcon } from "@/components/logo";
import { useCourses, useRooms, useBuildings, useRoomTypes, useSchedules } from "@/hooks";
import { cn } from "@/lib/utils";

const navigation = [
  {
    title: "Main",
    items: [
      { title: "Home", href: "/app", icon: LayoutDashboard },
      { title: "Timetable", href: "/app/schedule", icon: Calendar },
    ],
  },
  {
    title: "Manage",
    items: [
      { title: "Courses", href: "/app/courses", icon: BookOpen },
      { title: "Rooms", href: "/app/rooms", icon: DoorOpen },
      { title: "Buildings", href: "/app/buildings", icon: Building2 },
      { title: "Room Types", href: "/app/room-types", icon: Tag },
    ],
  },
  {
    title: "Create",
    items: [
      { title: "New Schedule", href: "/app/generate", icon: Sparkles },
    ],
  },
  {
    title: "Account",
    items: [
      { title: "Settings", href: "/app/settings", icon: Settings },
    ],
  },
];

export function AppSidebar ()
{
  const location = useLocation();

  const { data: courses = [] } = useCourses();
  const { data: rooms = [] } = useRooms();
  const { data: buildings = [] } = useBuildings();
  const { data: roomTypes = [] } = useRoomTypes();
  const { data: schedules = [] } = useSchedules();

  // Hide setup progress if a schedule has been generated
  const hasSchedule = schedules.length > 0;

  // Calculate setup progress
  const setupSteps = [
    { complete: buildings.length > 0, label: "Buildings" },
    { complete: roomTypes.length > 0, label: "Room Types" },
    { complete: rooms.length > 0, label: "Rooms" },
    { complete: courses.length > 0, label: "Courses" },
  ];
  const completedSteps = setupSteps.filter(s => s.complete).length;
  const setupProgress = (completedSteps / setupSteps.length) * 100;
  const isSetupComplete = completedSteps === setupSteps.length;

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild tooltip="Course Scheduler">
              <Link to="/app">
                <LogoIcon size="md" />
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">Course Scheduler</span>
                  <span className="truncate text-xs text-muted-foreground">University</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {navigation.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={location.pathname === item.href}
                      tooltip={item.title}
                    >
                      <Link to={item.href}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Setup Progress Footer - only show if no schedule generated yet */}
      {!hasSchedule && (
        <SidebarFooter>
          <div className="p-3 group-data-[collapsible=icon]:p-2">
            <Link to="/app" className="block">
              <div className={cn(
                "rounded-lg p-3 transition-colors",
                isSetupComplete
                  ? "bg-emerald-500/10 hover:bg-emerald-500/15"
                  : "bg-muted/50 hover:bg-muted"
              )}>
                <div className="flex items-center gap-2 group-data-[collapsible=icon]:justify-center">
                  <CheckCircle2 className={cn(
                    "size-4 shrink-0",
                    isSetupComplete ? "text-emerald-500" : "text-muted-foreground"
                  )} />
                  <span className="text-xs font-medium group-data-[collapsible=icon]:hidden">
                    {isSetupComplete ? "Setup Complete" : "Setup Progress"}
                  </span>
                </div>
                <div className="mt-2 group-data-[collapsible=icon]:hidden">
                  <Progress value={setupProgress} className="h-1.5" />
                  <p className="text-[10px] text-muted-foreground mt-1">
                    {completedSteps} of {setupSteps.length} steps
                  </p>
                </div>
              </div>
            </Link>
          </div>
        </SidebarFooter>
      )}

      <SidebarRail />
    </Sidebar>
  );
}
