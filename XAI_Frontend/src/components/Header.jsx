import { SidebarTrigger } from "@/components/ui/sidebar";
import React from "react";

const Header = ({ title }) => {
  return (
    <header className="h-10 w-full flex justify-between items-center">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="text-white" />
        <h1 className="heading text-4xl font-semibold tracking-tighter bg-gradient-to-l from-blue-400 to-purple-950 bg-clip-text text-transparent">
          {title}
        </h1>
      </div>
    </header>
  );
};

export default Header;
