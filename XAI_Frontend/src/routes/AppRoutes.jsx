import React, { Suspense, lazy } from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { ROUTES } from "./routes";
import ProtectedRoute from "./ProtectedRoute";
import LoadingScreen from "@/components/LoadingScreen";
import MainLayout from "@/layout/MainLayout";

// -----
const Login = lazy(() => import("@/pages/Login/Login"));

// -----
const Dashboard = lazy(() => import("@/pages/Dashboard/Dashboard"));

// -----
const QuickBuySell = lazy(() => import("@/pages/QuickBuySell/QuickBuySell"));

// -----
const AutoBuySellConfiguration = lazy(() =>
  import("@/pages/AutoBuySellConfiguration/AutoBuySellConfiguration")
);

// -----
const TransactionSettings = lazy(() =>
  import("@/pages/TransactionSettings/TransactionSettings")
);

// -----
const TransactionHistory = lazy(() =>
  import("@/pages/TransactionHistory/TransactionHistory")
);

// -----
const ScrappedToken = lazy(() => import("@/pages/ScrappedToken/ScrappedToken"));

// -----
const NotFoundPage = lazy(() => import("@/pages/NotFound/NotFoundPage"));

const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          <Route path={ROUTES.LOGIN} element={<Login />} />

          <Route element={<ProtectedRoute />}>
            <Route path={ROUTES.DASHBOARD} element={<MainLayout />}>
              {/* Nested Routes within Dashboard */}
              <Route index element={<Dashboard />} />
              <Route path={ROUTES.QUICK_BUY_SELL} element={<QuickBuySell />} />
              <Route
                path={ROUTES.AUTO_BUY_SELL_CONFIGURATION}
                element={<AutoBuySellConfiguration />}
              />
              <Route
                path={ROUTES.TRANSACTION_SETTINGS}
                element={<TransactionSettings />}
              />
              <Route
                path={ROUTES.TRANSACTION_HISTORY}
                element={<TransactionHistory />}
              />

              <Route path={ROUTES.SCRAPPED_TOKEN} element={<ScrappedToken />} />
            </Route>
          </Route>

          {/* Catch-all Route */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default AppRoutes;
