import Header from "@/components/Header";
import React from "react";
import TokenHolding from "./components/TokenHolding/TokenHolding";
import CreatedWallet from "./components/CreatedWallet";
import WithdrawSOL from "./components/WithdrawSOL/WithdrawSOL";
import AutoBuySellConfigurationContainer from "./components/AutoBuySellConfigurationContainer";
import { useGetWalletInfoQuery } from "@/services/generalApi";
import EnableSnipping from "./components/EnableSnipping";

const Dashboard = () => {
  const { data: getWalletInfoData, isLoading: getWalletInfoIsLoading } =
    useGetWalletInfoQuery();

  return (
    <div className="w-full flex flex-col gap-y-10">
      <Header title="Dashboard" />
      <div className="w-full flex flex-col justify-center gap-y-6">
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 2xl:grid-cols-4 gap-6">
          <CreatedWallet
            data={getWalletInfoData?.data}
            isLoading={getWalletInfoIsLoading}
          />
          <WithdrawSOL
            data={getWalletInfoData?.data}
            isLoading={getWalletInfoIsLoading}
          />
          <EnableSnipping enable={getWalletInfoData?.data?.autoBuyEnable} />
          <AutoBuySellConfigurationContainer />
        </div>
        <TokenHolding />
      </div>
    </div>
  );
};

export default Dashboard;
