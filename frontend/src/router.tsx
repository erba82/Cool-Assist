import React from "react";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from "./App";
import GoogleLoginCallback from "./pages/GoogleLoginCallback";

/**
 * The error TS2322 occurs because createRoutesFromElements is meant to work
 * directly with <Route> elements, not with an array of route objects.
 * 
 * You can either:
 * 1) Remove createRoutesFromElements and directly pass an array of route objects
 *    to createBrowserRouter (shown below), or
 * 2) Use createRoutesFromElements and wrap your routes in <Route> components 
 *    (instead of plain objects).
 * 
 * This example removes createRoutesFromElements and uses an array of objects.
 */

const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <App />,
      children: [
        {
          path: "auth/google/callback",
          element: <GoogleLoginCallback />,
        },
      ],
    },
  ],
  {
    // Remove or adjust this block if your version of React Router doesn't support these flags
    future: {
      v7_relativeSplatPath: true,
    },
  }
);

export default function AppRouter() {
  return <RouterProvider router={router} />;
}