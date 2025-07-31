import React from "react";
import { Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import AppSidebar from "@/components/Sidebar/AppSidebar";
import Footer from "@/components/Footer";

const MainLayout = () => {
  return (
    <>
      <SidebarProvider
        style={{
          "--sidebar-width": "20rem",
          "--sidebar-width-mobile": "20rem",
        }}
      >
        <AppSidebar />
        <SidebarInset className="bg-gray-200 flex flex-col w-[calc(100vw_-_var(--sidebar-width))] overflow-y-auto">
          <div className="px-4 py-4 pb-14 flex flex-1">
            <Outlet />
          </div>
          <Footer />
        </SidebarInset>
      </SidebarProvider>
    </>
  );
};

export default MainLayout;
