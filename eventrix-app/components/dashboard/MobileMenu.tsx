"use client";

import { DashboardSidebar } from "@/components/dashboard/DashboardSidebar";
import Navbars from "@/components/ui/navbars";

export function MobileMenu() {
  return (
    <Navbars
      menuLabel="Dashboard menu"
      renderContent={(closeMenu) => (
        <DashboardSidebar className="border-r-0" onNavigate={closeMenu} />
      )}
    />
  );
}
