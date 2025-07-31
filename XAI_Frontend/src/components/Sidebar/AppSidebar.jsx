import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { sidebarData } from "./data/sidebarData";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { useDispatch } from "react-redux";
import { clearToken, clearUser } from "@/store/slices/authSlice";
import { ROUTES } from "@/routes/routes";
import { Bot, LogOutIcon } from "lucide-react";
import { BotIcon, RobotIcon } from "@/assets/Icons";
import { useWallet } from "@solana/wallet-adapter-react";

const AppSidebar = () => {
  const { setOpenMobile } = useSidebar();
  const { disconnect } = useWallet();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = () => {
    console.log("loggin out...");
    disconnect();
    setTimeout(() => {
      dispatch(clearUser());
      dispatch(clearToken());
      navigate(ROUTES.LOGIN);
    }, 500); // setTimeout for user experience
  };

  return (
    <Sidebar className="flex flex-col overflow-y-auto">
      {/* header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <div className="flex items-center gap-4 justify-center">
              <Bot className="h-14 w-14 text-white" />
              <span className="text-white text-xl font-semibold">XAI Bot</span>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-3">
              {sidebarData.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <NavLink
                    to={item.url}
                    end={item.url === ROUTES.DASHBOARD}
                    className={({ isActive }) =>
                      cn(
                        "flex gap-2 items-center px-3.5 py-2.5 rounded-full border border-gray-200 text-white/60 font-medium",
                        {
                          " bg-white/10 backdrop:blur-3xl text-purple-600 border-purple-600":
                            isActive,
                          "hover:bg-gray-900 hover:text-gray-300": !isActive,
                        }
                      )
                    }
                    onClick={() => setOpenMobile(false)}
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={cn("w-6 h-6", {
                            "text-purple-600": isActive,
                            "text-white": !isActive,
                          })}
                        />
                        <span className="text-base">{item.title}</span>
                      </>
                    )}
                  </NavLink>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* footer */}
      <SidebarFooter>
        <SidebarMenu>
          <div
            onClick={logoutHandler}
            className="w-full flex gap-x-2 py-2 px-4 items-center justify-center border border-green-700 text-green-700 hover:border-red-700 hover:text-red-700 rounded-full cursor-pointer active:scale-95 transition-all duration-200 ease-in"
          >
            <LogOutIcon className="h-6 w-6" />
            <span className="text-base text-nowrap font-medium">Log Out</span>
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
