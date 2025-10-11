import {
  LayoutDashboard,
  FileText,
  LucideIcon,
  File,
  TextSelect,
  CheckSquare2,
  Settings,
} from "lucide-react";

export interface SidebarItem {
  title: string;
  url: string;
  icon: LucideIcon;
  badge?: string;
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export const sidebarConfig: SidebarSection[] = [
  {
    title: "MENU",
    items: [
      {
        title: "Dashboard",
        url: "/dashboard",
        icon: LayoutDashboard,
      },
      {
        title: "Surveys",
        url: "/surveys",
        icon: TextSelect,
      },
      {
        title: "Tasks",
        url: "/tasks",
        icon: CheckSquare2,
        badge: "24",
      },
      {
        title: "Reports",
        url: "/reports",
        icon: FileText,
      },
      {
        title: "Settings",
        url: "/settings",
        icon: Settings,
      },
    ],
  },
  // {
  //   title: "GENERAL",
  //   items: [

  //     {
  //       title: "Help",
  //       url: "/help",
  //       icon: HelpCircle,
  //     },
  //     {
  //       title: "Logout",
  //       url: "/logout",
  //       icon: LogOut,
  //     },
  //   ],
  // },
];
