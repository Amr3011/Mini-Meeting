import { SidebarPanel } from "../SidebarPanel";
import { AdminControls } from "../AdminControls";

interface AdminPanelProps {
  meetingCode: string;
  isAdmin: boolean;
  isOpen: boolean;
  onClose: () => void;
  onEndMeeting: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  meetingCode,
  isAdmin,
  isOpen,
  onClose,
  onEndMeeting,
}) => {
  if (!isOpen) return null;

  return (
    <SidebarPanel title="Admin Controls" onClose={onClose}>
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        <AdminControls
          meetingCode={meetingCode}
          isAdmin={isAdmin}
          onEndMeeting={onEndMeeting}
        />
      </div>
    </SidebarPanel>
  );
};
