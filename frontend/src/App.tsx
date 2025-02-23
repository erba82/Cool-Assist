import React from "react";
import { createBrowserRouter, RouterProvider, Route, createRoutesFromElements } from "react-router-dom";
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

// تنظیم زبان برای dayjs
dayjs.locale("fa");

const router = createBrowserRouter(
  createRoutesFromElements(
    <React.Fragment>
      <Route path="/" element={<HomePage />} /> {/* فقط Route صفحه اصلی */}
    </React.Fragment>
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