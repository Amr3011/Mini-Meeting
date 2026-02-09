import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Layout } from "../components/layout/Layout";
import { CreateMeetingModal } from "../components/meeting/CreateMeetingModal";
import { JoinMeetingInput } from "../components/meeting/JoinMeetingInput";
import { meetingService } from "../services/api/meeting.service";

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isCreateMeetingModalOpen, setIsCreateMeetingModalOpen] = useState(false);
  const [isStartingMeeting, setIsStartingMeeting] = useState(false);

  const handleStartNewMeeting = async () => {
    setIsStartingMeeting(true);
    try {
      const newMeeting = await meetingService.createMeeting();
      navigate(`/${newMeeting.meeting_code}`);
    } catch (err) {
      console.error("Failed to create meeting:", err);
      alert("Failed to create meeting. Please try again.");
    } finally {
      setIsStartingMeeting(false);
    }
  };

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="mt-2 text-gray-600">
            This is your dashboard. Create and manage your meetings here.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleStartNewMeeting}
              disabled={isStartingMeeting}
              className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
                <span className="ml-3 text-lg font-medium text-gray-900">
                  {isStartingMeeting ? "Starting..." : "Start New Meeting"}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Create a new video meeting instantly
              </p>
            </button>

            <button
              onClick={() => setIsCreateMeetingModalOpen(true)}
              className="bg-white rounded-lg shadow p-6 text-left hover:shadow-md transition-shadow"
            >
              <div className="flex items-center">
                <svg
                  className="h-6 w-6 text-blue-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
                <span className="ml-3 text-lg font-medium text-gray-900">
                  Create Meeting
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500">
                Create Meeting for later
              </p>
            </button>
          </div>
        </div>

        {/* Join Meeting Section */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow p-6">
            <JoinMeetingInput showExamples={false} />
          </div>
        </div>
      </div>

      {/* Create Meeting Modal */}
      <CreateMeetingModal
        isOpen={isCreateMeetingModalOpen}
        onClose={() => setIsCreateMeetingModalOpen(false)}
      />
    </Layout>
  );
}
