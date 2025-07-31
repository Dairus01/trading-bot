import React from "react";
import AppRoutes from "./routes/AppRoutes";
import { WalletProviderContext } from "./context/walletConnectContext";
import { Toaster } from "./components/ui/sonner";
import { Provider } from "react-redux";
import { store } from "./store/store";

const App = () => {
  return (
    <>
      <WalletProviderContext>
        <Provider store={store}>
          <Toaster richColors />
          <AppRoutes />
        </Provider>
      </WalletProviderContext>
    </>
  );
};

export default App;
