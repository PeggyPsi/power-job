import { AppSidebar } from "@/components/sidebar/AppSidebar";
import {
  SidebarNavMenuGroup,
  SidebarNavMenuGroupItem,
} from "@/components/sidebar/SidebarNavMenuGroup";
import SidebarUserBtn from "@/features/users/components/SidebarUserBtn";
import {
  BrainCircuitIcon,
  ClipboardListIcon,
  LayoutDashboard,
  LogInIcon,
} from "lucide-react";

export default function JobSeekerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const menuItems: Array<SidebarNavMenuGroupItem> = [
    {
      href: "/",
      label: "Power Job",
      icon: <ClipboardListIcon />,
    },
    {
      href: "/ai-search",
      label: "AI Search",
      icon: <BrainCircuitIcon />,
    },
    {
      href: "/employer",
      label: "Employer Dashboard",
      icon: <LayoutDashboard />,
      authStatus: "signedIn",
    },
    {
      href: "/sign-in",
      label: "Sign In",
      icon: <LogInIcon />,
      authStatus: "signedOut",
    },
  ];

  return (
    <AppSidebar
      content={<SidebarNavMenuGroup className="mt-auto" items={menuItems} />}
      footerButton={<SidebarUserBtn />}
    >
      {children}
    </AppSidebar>
  );
}
