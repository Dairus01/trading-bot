import { BotIcon } from "@/assets/Icons";
import React, { useEffect } from "react";
import WalletConnectButton from "./components/WalletConnectButton";
import { Bot } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "@/routes/routes";
import { useSelector } from "react-redux";

const Login = () => {
  const navigate = useNavigate();
  const token = useSelector((state) => state.auth.token);
  // const token = true;

  useEffect(() => {
    if (token) {
      navigate(ROUTES.DASHBOARD);
    }
  }, [token]);

  return (
    <div className="w-screen h-screen bg-gray-100">
      <div className="flex min-h-full flex-1 flex-col px-6 py-12s lg:px-8">
        <div className="mt-14">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <Bot className="h-24 w-24 mx-auto text-indigo-600" />
            <h2 className="mt-10 text-center text-2xl/9 font-bold tracking-tight text-gray-600">
              Sign in to your account by connecting your{" "}
              <span className="text-indigo-600 font-semibold">wallet</span>
            </h2>
          </div>

          <div className="mt-20 sm:mx-auto sm:w-full sm:max-w-xs">
            <div className="flex items-center justify-center">
              <WalletConnectButton />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
