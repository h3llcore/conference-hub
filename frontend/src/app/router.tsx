import { createBrowserRouter } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";
import HomePage from "../pages/HomePage";
import LoginPage from "../pages/LoginPage";
import RegisterPage from "../pages/RegisterPage";
import NotFoundPage from "../pages/NotFoundPage";
import UnauthorizedPage from "../pages/UnauthorizedPage";

import ProtectedRoute from "../features/auth/ProtectedRoute";
import AuthorDashboard from "../pages/AuthorDashboard";
import AuthorSubmitPage from "../pages/AuthorSubmitPage";
import AuthorSubmissionDetailsPage from "../pages/AuthorSubmissionDetailsPage";
import AuthorReviewsPage from "../pages/AuthorReviewsPage";
import ReviewerDashboard from "../pages/ReviewerDashboard";
import ReviewerSubmissionDetailsPage from "../pages/ReviewerSubmissionDetailsPage";
import ReviewerReviewFormPage from "../pages/ReviewerReviewFormPage";
import CommitteeDashboard from "../pages/CommitteeDashboard";
import JournalsPage from "../pages/JournalsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "register", element: <RegisterPage /> },
      { path: "unauthorized", element: <UnauthorizedPage /> },
      { path: "journals", element: <JournalsPage /> },

      {
        element: <ProtectedRoute roles={["AUTHOR"]} />,
        children: [
          { path: "author", element: <AuthorDashboard /> },
          { path: "author/submit", element: <AuthorSubmitPage /> },
          {
            path: "author/submission/:id",
            element: <AuthorSubmissionDetailsPage />,
          },
          { path: "author/edit/:id", element: <AuthorSubmitPage /> },
          { path: "author/reviews/:id", element: <AuthorReviewsPage /> },
        ],
      },

      {
        element: <ProtectedRoute roles={["REVIEWER"]} />,
        children: [
          { path: "reviewer", element: <ReviewerDashboard /> },
          {
            path: "reviewer/submission/:id",
            element: <ReviewerSubmissionDetailsPage />,
          },
          {
            path: "reviewer/review/:id",
            element: <ReviewerReviewFormPage />,
          },
        ],
      },

      {
        element: <ProtectedRoute roles={["COMMITTEE"]} />,
        children: [{ path: "committee", element: <CommitteeDashboard /> }],
      },

      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);
