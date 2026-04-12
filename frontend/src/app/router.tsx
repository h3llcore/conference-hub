import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

import ProtectedRoute from "../features/auth/ProtectedRoute";
import AuthorDashboard from "../pages/AuthorDashboard";
import ReviewerDashboard from "../pages/ReviewerDashboard";
import CommitteeDashboard from "../pages/CommitteeDashboard";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "unauthorized", element: <UnauthorizedPage /> },

      // AUTHOR only
      {
        element: <ProtectedRoute roles={["AUTHOR"]} />,
        children: [{ path: "author", element: <AuthorDashboard /> }],
      },

      // REVIEWER only
      {
        element: <ProtectedRoute roles={["REVIEWER"]} />,
        children: [{ path: "reviewer", element: <ReviewerDashboard /> }],
      },

      // COMMITTEE only
      {
        element: <ProtectedRoute roles={["COMMITTEE"]} />,
        children: [{ path: "committee", element: <CommitteeDashboard /> }],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
