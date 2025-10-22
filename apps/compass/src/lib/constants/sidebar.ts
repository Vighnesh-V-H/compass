import {
  LucideIcon,
  Settings,
  DraftingCompassIcon,
  CropIcon,
  ProjectorIcon,
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
        title: "Projects",
        url: "/projects",
        icon: ProjectorIcon,
      },
      {
        title: "Canvas",
        url: "/surveys",
        icon: DraftingCompassIcon,
      },
      {
        title: "Designs",
        url: "/designs",
        icon: CropIcon,
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
