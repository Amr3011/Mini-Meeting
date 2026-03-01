import { Route } from "react-router-dom";
import { lazy } from "react";
import MeetingCodeValidator from "../components/MeetingCodeValidator";

const NotFound = lazy(() => import("../../pages/NotFound"));

/**
 * Meeting routes - accessible to everyone (authenticated and guests)
 * Must be after all specific routes as it's a dynamic catch-all
 */
export const MeetingRoutes = (
  <>
    {/* Meeting route with code validation */}
    <Route path="/:meetingCode" element={<MeetingCodeValidator />} />

    {/* 404 - catch all unmatched routes */}
    <Route path="*" element={<NotFound />} />
  </>
);
