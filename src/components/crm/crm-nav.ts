import {
  CalendarCheck,
  LayoutDashboard,
  PanelLeft,
  Settings,
  SquareKanban,
  Users,
} from "lucide-react";

export const crmNavItems = [
  {
    href: "/crm/hoje",
    label: "Hoje",
    icon: CalendarCheck,
  },
  {
    href: "/crm/pipeline",
    label: "Pipeline",
    icon: SquareKanban,
  },
  {
    href: "/crm/contactos",
    label: "Contactos",
    icon: Users,
  },
  {
    href: "/crm/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/crm/configuracoes",
    label: "Configuracoes",
    icon: Settings,
  },
];

export const ShellIcon = PanelLeft;
