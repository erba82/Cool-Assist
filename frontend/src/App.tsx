import React from "react";
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Navigate
} from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import "dayjs/locale/fa";

import { store } from "./store/store";
import { theme } from "./utils/theme";
import Layout from "./components/Layout/Layout";
import HomePage from "./pages/HomePage";
import ChatPage from "./pages/ChatPage";
import PerformanceDashboard from "./components/Dashboard/PerformanceDashboard";
import SystemHealth from "./components/Monitoring/SystemHealth";
import OptimizationHistory from "./components/Optimization/OptimizationHistory";
import PerformanceAnalytics from "./components/Analytics/PerformanceAnalytics";
import LinkedInCallback from "./components/Auth/LinkedInCallback";
import SplashScreen from "./components/SplashScreen/SplashScreen";
import AuthLayout from "./components/Auth/AuthLayout";
import Login from "./components/Auth/Login";
import SignUp from "./components/Auth/SignUp";
import UnitConverter from "./components/Tools/UnitConverter";
import RefrigerantCalculator from "./components/Tools/RefrigerantCalculator";
import ElectricalCalculator from "./components/Tools/ElectricalCalculator";
import FlowDiagramTool from "./components/Tools/FlowDiagramTool";
import UserHistory from "./components/User/UserHistory";
import ProtectedRoute from "./components/Auth/ProtectedRoute";

// تنظیم زبان برای dayjs
dayjs.locale("fa");

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<AuthLayout />}>
      {/* Splash Screen */}
      <Route path="/splash" element={<SplashScreen />} />
      
      {/* Auth Routes */}
      <Route path="/auth">
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<SignUp />} />
        <Route path="linkedin/callback" element={<LinkedInCallback />} />
      </Route>

      {/* Protected Routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/chat" element={<ChatPage />} />
          <Route path="/dashboard" element={<PerformanceDashboard />} />
          <Route path="/health" element={<SystemHealth />} />
          <Route path="/optimization" element={<OptimizationHistory />} />
          <Route path="/analytics" element={<PerformanceAnalytics />} />
          <Route path="/history" element={<UserHistory />} />
          
          {/* Tools Routes */}
          <Route path="/tools">
            <Route path="unit-converter" element={<UnitConverter />} />
            <Route path="refrigerant-calculator" element={<RefrigerantCalculator />} />
            <Route path="electrical-calculator" element={<ElectricalCalculator />} />
            <Route path="flow-diagram" element={<FlowDiagramTool />} />
          </Route>
        </Route>
      </Route>

      {/* Redirect unknown routes to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Route>
  )
);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <CssBaseline />
          <RouterProvider router={router} />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;