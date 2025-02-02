import React from "react";
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from "react-router-dom";
import { ThemeProvider, CssBaseline } from "@mui/material";
import { Provider } from "react-redux";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
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

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Layout />}>
      <Route path="/" element={<HomePage />} />
      <Route path="/chat" element={<ChatPage />} />
      <Route path="/dashboard" element={<PerformanceDashboard />} />
      <Route path="/health" element={<SystemHealth />} />
      <Route path="/optimization" element={<OptimizationHistory />} />
      <Route path="/analytics" element={<PerformanceAnalytics />} />
      <Route path="/auth/linkedin/callback" element={<LinkedInCallback />} />
    </Route>
  )
);

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <LocalizationProvider dateAdapter={AdapterDateFns}>
          <CssBaseline />
          <RouterProvider router={router} />
        </LocalizationProvider>
      </ThemeProvider>
    </Provider>
  );
}

export default App;