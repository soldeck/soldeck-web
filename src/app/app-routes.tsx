// import { lazy } from "react";

import { Navigate, useRoutes } from "react-router-dom";
import { SettingsPage } from "./ui/settings/settings-ui";
import { ProfilesPage } from "./ui/profiles/profiles-ui";
import { PortfolioPage } from "./ui/portfolio/portfolio-ui";
import { Home } from "./ui/home";

// const AccountListFeature = lazy(() => import('./account/account-list-feature'));
// const AccountDetailFeature = lazy(
//   () => import('./account/account-detail-feature')
// );
// const ClusterFeature = lazy(() => import('./cluster/cluster-feature'));

// const CounterFeature = lazy(() => import('./counter/counter-feature'));

// const DashboardFeature = lazy(() => import('./dashboard/dashboard-feature'));

export function AppRoutes() {
  return useRoutes([
    // { index: true, element: <Navigate to={"/dashboard"} replace={true} /> },
    // { path: "/account/", element: <AccountListFeature /> },
    // { path: "/account/:address", element: <AccountDetailFeature /> },
    // { path: "/clusters", element: <ClusterFeature /> },

    // { path: "/counter", element: <CounterFeature /> },

    // { path: "/dashboard", element: <DashboardFeature /> },
    { path: "/profiles", element: <ProfilesPage></ProfilesPage> },
    { path: "/portfolio", element: <PortfolioPage></PortfolioPage> },
    { path: "/settings", element: <SettingsPage></SettingsPage> },
    { path: "/", element: <Home /> },
    { path: "*", element: <Navigate to={"/"} replace={true} /> },
  ]);
}
