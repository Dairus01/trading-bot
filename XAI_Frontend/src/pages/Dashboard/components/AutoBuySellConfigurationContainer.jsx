import React from "react";
import AutoBuyConfiguration from "./AutoBuyConfiguration";
import AutoSellConfiguration from "./AutoSellConfiguration";
import { useGetAutoBuySellConfigurationQuery } from "@/services/configurationApi";

const AutoBuySellConfigurationContainer = () => {
  // get api for token balance for validation
  const {
    data: getAutoBuySellConfigurationData,
    isLoading: getAutoBuySellConfigurationIsLoading,
  } = useGetAutoBuySellConfigurationQuery();

  console.log(
    "getAutoBuySellConfigurationData-->",
    getAutoBuySellConfigurationData
  );

  return (
    <>
      <AutoBuyConfiguration
        data={getAutoBuySellConfigurationData?.data}
        isLoading={getAutoBuySellConfigurationIsLoading}
      />
      <AutoSellConfiguration
        data={getAutoBuySellConfigurationData?.data}
        isLoading={getAutoBuySellConfigurationIsLoading}
      />
    </>
  );
};

export default AutoBuySellConfigurationContainer;
