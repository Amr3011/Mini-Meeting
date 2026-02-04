# Meeting UI Implementation Guide

## Context

This guide provides complete instructions for implementing the meeting UI with onboarding pages for the Mini-Meeting application (similar to Google Meet). LiveKit is already set up in both backend (Go/Fiber) and frontend (React/TypeScript), but the UI needs to be connected.

## Requirements

### 1. Meeting Lobby/Pre-Join Page (`/:meetingCode`)

Create a meeting lobby page where users can configure their devices before joining.

**Location:** `frontend/src/pages/MeetingLobby.tsx`

**Features:**

- Display meeting code prominently at the top
- Live preview of user's camera (video element showing camera feed)
- Microphone level indicator (real-time audio visualization bars)
- Device selection dropdowns:
  - Camera selection (enumerate and list all available video input devices)
  - Microphone selection (enumerate and list all available audio input devices)
  - Speaker selection (enumerate and list all available audio output devices)
- Toggle buttons for:
  - Enable/disable camera before joining (default: enabled)
  - Enable/disable microphone before joining (default: enabled)
- "Join Meeting" button that:
  - Generates LiveKit token using the meeting code via API
  - when i join i still in the same url base/meeting_code
- Display user's name from auth context
- Allow to add display name for non Authenticated users
- Loading states:
  - While requesting device permissions
  - While generating LiveKit token
  - While connecting to meeting
- Error handling:
  - Invalid meeting code (404 from backend)
  - Network errors (connection failures)
  - Device access denied (permissions)
  - Camera/microphone not available
- "Copy meeting link" button to share with others
- Meeting info section (optional: show meeting creator, time created)

**Design Reference:** Similar to Google Meet's pre-join screen with:

- Dark video preview area in center
- Device controls below video
- Join button prominently displayed
- Clean, modern, minimalist interface

**Device Permissions:**

```typescript
// Request permissions early
const stream = await navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,
});

// Get device list after permissions granted
const devices = await navigator.mediaDevices.enumerateDevices();
const videoDevices = devices.filter((d) => d.kind === "videoinput");
const audioDevices = devices.filter((d) => d.kind === "audioinput");
const audioOutputDevices = devices.filter((d) => d.kind === "audiooutput");
```

### 2. Meeting Room Page (the same URL for Pre-Join) (`/:meetingCode`)

Create the actual meeting room page that uses the existing `LiveKitMeetingRoom` component.

**Location:** `frontend/src/pages/MeetingRoom.tsx`

**Features:**

- Use the existing `LiveKitMeetingRoom` component from `src/components/meeting/LiveKitMeetingRoom.tsx`
- Receive device preferences from lobby page via:
  - URL state/location state
  - Session storage
  - Context API
- Apply selected devices to LiveKit before connection:

  ```typescript
  import { Room } from "livekit-client";

  // Configure devices before joining
  await room.switchActiveDevice("videoinput", selectedCameraId);
  await room.switchActiveDevice("audioinput", selectedMicId);
  ```

- Handle disconnect event:
  - Navigate back to dashboard (if logged in)
  - Navigate to landing page (if guest)
  - Show disconnect reason (network error, kicked by admin, etc.)
- Full-screen meeting experience (no header/footer)
- Add "Leave Meeting" button that shows confirmation dialog
- Optional: Add recording indicator if meeting is being recorded

**Props to Pass:**

```typescript
interface MeetingRoomProps {
  meetingCode: string;
  devicePreferences?: {
    videoDeviceId?: string;
    audioDeviceId?: string;
    videoEnabled: boolean;
    audioEnabled: boolean;
  };
}
```

### 3. Landing Page with Meeting Join (`/`)

Modify the root route to show a landing page instead of redirecting to dashboard/login.

**Location:** `frontend/src/pages/Landing.tsx`

**Features:**

**Hero Section:**

- App logo and branding
- Tagline: "Video meetings made simple" or similar
- Eye-catching hero image or illustration

**Main Call-to-Action:**

- Large input field to enter meeting code or full meeting link
- Placeholder: "Enter meeting code or link"
- Parse both formats:
  - Meeting code: `abc-defg-hij`
  - Full meeting link: `http://localhost:5173/abc-defg-hij`
  - Extract code from link automatically
- "Join Meeting" button next to input
- Validate format before navigating
- Show error if invalid format

**Conditional Content Based on Auth State:**

If **logged in** (authenticated):

- Welcome message: "Welcome back, [User Name]!"
- Primary action: "Create New Meeting" button
  - Calls `POST /api/v1/meetings` to create meeting
  - Redirects to `/:code` lobby with new meeting code
- Secondary action: "Go to Dashboard" button/link
- Show recent meetings list (optional)
- Display user avatar and account menu

If **not logged in** (guest):

- "Sign In" button → Navigate to `/login`
- "Sign Up" button → Navigate to `/register`
- Still allow joining meetings without authentication:
  - Input field still works
  - User can join as guest with display name prompt
  - Guest mode has limited features (can't create meetings)

**Additional Sections:**

- Features showcase (video quality, screen sharing, etc.)
- How it works (3 simple steps)
- Testimonials or social proof
- Footer with links (About, Privacy, Terms, Contact)

**Input Parsing Logic:**

```typescript
const parseInput = (input: string): string | null => {
  // Trim whitespace
  const trimmed = input.trim();

  // Check if it's a meeting code format (xxx-xxxx-xxx)
  const codeRegex = /^[a-z]{3}-[a-z]{4}-[a-z]{3}$/;
  if (codeRegex.test(trimmed)) {
    return trimmed;
  }

  // Check if it's a full URL
  try {
    const url = new URL(trimmed);
    const pathMatch = url.pathname.match(
      /\/meeting\/([a-z]{3}-[a-z]{4}-[a-z]{3})/,
    );
    if (pathMatch) {
      return pathMatch[1];
    }
  } catch {}

  return null; // Invalid format
};
```

### 4. Update Routing Configuration

Update the React Router setup to support the new flow.

**File:** `frontend/src/App.tsx` or your routing file

**Current Behavior (TO CHANGE):**

```typescript
// OLD - Remove this logic
<Route path="/" element={
  isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />
} />
```

**New Routing Structure:**

```typescript
<Routes>
  {/* Public Routes */}
  <Route path="/" element={<Landing />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route path="/verify-email" element={<VerifyEmail />} />
  <Route path="/forgot-password" element={<ForgotPassword />} />
  <Route path="/reset-password" element={<ResetPassword />} />

  {/* Meeting Routes - Public but may require auth for token */}
  <Route path="/:meetingCode" element={<MeetingLobby />} />
  <Route path="/room/:meetingCode" element={
    <ProtectedRoute>
      <MeetingRoom />
    </ProtectedRoute>
  } />

  {/* Protected Routes */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />
  <Route path="/profile" element={
    <ProtectedRoute>
      <Profile />
    </ProtectedRoute>
  } />

  {/* Admin Routes */}
  <Route path="/admin/users" element={
    <ProtectedRoute adminOnly>
      <AdminUsers />
    </ProtectedRoute>
  } />

  {/* 404 */}
  <Route path="*" element={<NotFound />} />
</Routes>
```

**Navigation Flow:**

1. User visits `/` → Always shows Landing page
2. User enters meeting code → Navigate to `/meeting/:code`
3. User clicks "Join" in lobby → Navigate to `/room/:code`
4. User clicks "Dashboard" → Navigate to `/dashboard`
5. User clicks "Sign In" → Navigate to `/login`

## Technical Implementation Details

### Use Existing Code

**DO NOT RECREATE** these - they already exist:

- ✅ `src/hooks/useLiveKit.ts` - Hook for LiveKit connection
- ✅ `src/components/meeting/LiveKitMeetingRoom.tsx` - Meeting room component
- ✅ `src/services/api/livekit.service.ts` - LiveKit API service
- ✅ `src/services/api/meeting.service.ts` - Meeting API service
- ✅ `src/contexts/AuthContext.tsx` - Authentication context
- ✅ Existing styled components in `src/components/common/`

### Device Management Implementation

**1. Enumerate Devices:**

```typescript
import { useState, useEffect } from "react";

const useMediaDevices = () => {
  const [devices, setDevices] = useState({
    videoInputs: [],
    audioInputs: [],
    audioOutputs: [],
  });
  const [permission, setPermission] = useState<"granted" | "denied" | "prompt">(
    "prompt",
  );

  useEffect(() => {
    const getDevices = async () => {
      try {
        // Request permissions first
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        setPermission("granted");

        // Get all devices
        const deviceList = await navigator.mediaDevices.enumerateDevices();

        setDevices({
          videoInputs: deviceList.filter((d) => d.kind === "videoinput"),
          audioInputs: deviceList.filter((d) => d.kind === "audioinput"),
          audioOutputs: deviceList.filter((d) => d.kind === "audiooutput"),
        });

        // Stop the stream (preview will use separate stream)
        stream.getTracks().forEach((track) => track.stop());
      } catch (error) {
        setPermission("denied");
        console.error("Device access error:", error);
      }
    };

    getDevices();

    // Listen for device changes (plug/unplug)
    navigator.mediaDevices.addEventListener("devicechange", getDevices);
    return () => {
      navigator.mediaDevices.removeEventListener("devicechange", getDevices);
    };
  }, []);

  return { devices, permission };
};
```

**2. Video Preview Component:**

```typescript
import { useEffect, useRef } from 'react';

interface VideoPreviewProps {
  deviceId?: string;
  enabled: boolean;
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ deviceId, enabled }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled || !videoRef.current) return;

    const startPreview = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: deviceId ? { deviceId: { exact: deviceId } } : true,
          audio: false
        });

        streamRef.current = stream;
        videoRef.current.srcObject = stream;
      } catch (error) {
        console.error('Video preview error:', error);
      }
    };

    startPreview();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [deviceId, enabled]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="w-full h-full object-cover rounded-lg"
    />
  );
};
```

**3. Audio Level Indicator:**

```typescript
import { useEffect, useRef, useState } from 'react';

interface AudioLevelIndicatorProps {
  deviceId?: string;
  enabled: boolean;
}

const AudioLevelIndicator: React.FC<AudioLevelIndicatorProps> = ({ deviceId, enabled }) => {
  const [level, setLevel] = useState(0);
  const analyzerRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    if (!enabled) {
      setLevel(0);
      return;
    }

    const startAnalysis = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: deviceId ? { deviceId: { exact: deviceId } } : true,
          video: false
        });

        streamRef.current = stream;

        const audioContext = new AudioContext();
        const source = audioContext.createMediaStreamSource(stream);
        const analyzer = audioContext.createAnalyser();
        analyzer.fftSize = 256;

        source.connect(analyzer);
        analyzerRef.current = analyzer;

        const dataArray = new Uint8Array(analyzer.frequencyBinCount);

        const updateLevel = () => {
          if (!analyzerRef.current) return;

          analyzer.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          setLevel(average / 255 * 100); // Convert to percentage

          requestAnimationFrame(updateLevel);
        };

        updateLevel();
      } catch (error) {
        console.error('Audio analysis error:', error);
      }
    };

    startAnalysis();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [deviceId, enabled]);

  return (
    <div className="flex gap-1 items-end h-8">
      {[...Array(10)].map((_, i) => (
        <div
          key={i}
          className={`w-1 rounded-full transition-all ${
            level > i * 10 ? 'bg-green-500' : 'bg-gray-300'
          }`}
          style={{
            height: `${20 + i * 8}%`
          }}
        />
      ))}
    </div>
  );
};
```

**4. Device Selector Component:**

```typescript
interface DeviceSelectorProps {
  label: string;
  devices: MediaDeviceInfo[];
  selectedId?: string;
  onSelect: (deviceId: string) => void;
  icon?: React.ReactNode;
}

const DeviceSelector: React.FC<DeviceSelectorProps> = ({
  label,
  devices,
  selectedId,
  onSelect,
  icon
}) => {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
        {icon}
        {label}
      </label>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `${label} ${devices.indexOf(device) + 1}`}
          </option>
        ))}
      </select>
    </div>
  );
};
```

### LiveKit Integration with Device Preferences

**Passing Device Preferences to Meeting Room:**

**Option 1: Using Location State (Recommended)**

```typescript
// In MeetingLobby.tsx
const navigate = useNavigate();

const handleJoinMeeting = async () => {
  // Generate token
  const tokenData = await generateToken(meetingCode);

  // Navigate with state
  navigate(`/room/${meetingCode}`, {
    state: {
      devicePreferences: {
        videoDeviceId: selectedCamera,
        audioDeviceId: selectedMic,
        videoEnabled: cameraEnabled,
        audioEnabled: micEnabled,
      },
      token: tokenData.token,
      url: tokenData.url,
    },
  });
};

// In MeetingRoom.tsx
const location = useLocation();
const { devicePreferences, token, url } = location.state || {};
```

**Option 2: Using Session Storage**

```typescript
// In MeetingLobby.tsx
sessionStorage.setItem(
  "devicePreferences",
  JSON.stringify({
    videoDeviceId: selectedCamera,
    audioDeviceId: selectedMic,
    videoEnabled: cameraEnabled,
    audioEnabled: micEnabled,
  }),
);

// In MeetingRoom.tsx
const prefs = JSON.parse(sessionStorage.getItem("devicePreferences") || "{}");
```

**Applying Devices in LiveKit:**

```typescript
// Extend LiveKitMeetingRoom component or create wrapper
import { useRoomContext } from "@livekit/components-react";

// Inside component
const room = useRoomContext();

useEffect(() => {
  if (room && devicePreferences) {
    // Switch video device
    if (devicePreferences.videoDeviceId) {
      room.switchActiveDevice("videoinput", devicePreferences.videoDeviceId);
    }

    // Switch audio device
    if (devicePreferences.audioDeviceId) {
      room.switchActiveDevice("audioinput", devicePreferences.audioDeviceId);
    }

    // Set initial mute states
    room.localParticipant.setCameraEnabled(devicePreferences.videoEnabled);
    room.localParticipant.setMicrophoneEnabled(devicePreferences.audioEnabled);
  }
}, [room, devicePreferences]);
```

### API Integration

**Create Meeting (Logged In Users):**

```typescript
// In Landing.tsx
import { createMeeting } from "../services/api/meeting.service";

const handleCreateMeeting = async () => {
  try {
    setLoading(true);
    const meeting = await createMeeting();
    navigate(`/meeting/${meeting.meeting_code}`);
  } catch (error) {
    console.error("Failed to create meeting:", error);
    setError("Failed to create meeting. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

**Verify Meeting Exists (Before Lobby):**

```typescript
// In MeetingLobby.tsx
import { getMeetingByCode } from "../services/api/meeting.service";

useEffect(() => {
  const verifyMeeting = async () => {
    try {
      const meeting = await getMeetingByCode(meetingCode);
      setMeetingData(meeting);
    } catch (error) {
      setError("Meeting not found");
      // Optionally redirect to landing page
      setTimeout(() => navigate("/"), 3000);
    }
  };

  verifyMeeting();
}, [meetingCode]);
```

**Generate Token (Before Joining):**

```typescript
// In MeetingLobby.tsx
import { generateToken } from "../services/api/livekit.service";

const handleJoin = async () => {
  try {
    setLoading(true);
    const tokenData = await generateToken(meetingCode, displayName);

    // Navigate to meeting room with token and preferences
    navigate(`/room/${meetingCode}`, {
      state: { tokenData, devicePreferences },
    });
  } catch (error) {
    console.error("Failed to generate token:", error);
    setError("Failed to join meeting. Please try again.");
  } finally {
    setLoading(false);
  }
};
```

## Styling Guidelines

### Design System

- Use existing Tailwind CSS configuration
- Follow the color scheme already in use
- Maintain consistency with existing components
- Reference: Google Meet's clean, modern interface

### Key UI Elements

**Meeting Lobby:**

- Large video preview (640x480 or responsive)
- Dark background for video area
- Light background for controls
- Rounded corners, subtle shadows
- Clear visual hierarchy

**Landing Page:**

- Hero section with gradient or image
- Large, prominent input field
- High-contrast CTA buttons
- Responsive grid layout

**Color Palette (Example):**

```css
Primary: #1976d2 (Blue)
Secondary: #424242 (Dark Gray)
Success: #4caf50 (Green)
Error: #f44336 (Red)
Background: #ffffff (White)
Surface: #f5f5f5 (Light Gray)
```

### Responsive Design

- Mobile-first approach
- Breakpoints:
  - Mobile: < 640px
  - Tablet: 640px - 1024px
  - Desktop: > 1024px
- Stack vertically on mobile
- Side-by-side on desktop

## File Structure to Create

```
frontend/src/
├── pages/
│   ├── Landing.tsx                  (NEW - home/landing page)
│   ├── MeetingLobby.tsx            (NEW - pre-join configuration)
│   └── MeetingRoom.tsx             (NEW - actual meeting room)
├── components/
│   └── meeting/
│       ├── DeviceSelector.tsx       (NEW - dropdown for devices)
│       ├── VideoPreview.tsx         (NEW - camera preview)
│       ├── AudioLevelIndicator.tsx  (NEW - mic level bars)
│       └── LiveKitMeetingRoom.tsx   (EXISTS - already created)
├── hooks/
│   ├── useMediaDevices.ts          (NEW - device management hook)
│   └── useLiveKit.ts               (EXISTS - already created)
└── services/
    └── api/
        ├── livekit.service.ts       (EXISTS - already created)
        └── meeting.service.ts       (EXISTS - already created)
```

## Testing Checklist

After implementation, verify:

- [ ] Landing page loads at `/`
- [ ] Can enter meeting code and navigate to lobby
- [ ] Can parse and extract code from full URL
- [ ] Meeting lobby requests device permissions
- [ ] Video preview shows camera feed
- [ ] Audio level indicator responds to microphone
- [ ] Can select different cameras/microphones
- [ ] Toggle buttons enable/disable video/audio
- [ ] Join button generates token and navigates
- [ ] Meeting room connects to LiveKit successfully
- [ ] Selected devices are applied in meeting
- [ ] Can leave meeting and return to dashboard
- [ ] Create meeting button works (logged in)
- [ ] Sign in/sign up buttons work (not logged in)
- [ ] Invalid meeting code shows error
- [ ] Denied permissions show helpful message
- [ ] Mobile responsive on all pages

## Example User Journeys

### Journey 1: First-time User Joining Meeting

1. Receives meeting link from email: `http://localhost:5173/abc-defg-hij`
2. Clicks link → Opens browser
3. Lands on meeting lobby page
4. Browser prompts for camera/mic permissions → Grants
5. Sees video preview and mic level
6. Clicks "Join Meeting"
7. Enters meeting room with video/audio enabled
8. Participates in meeting
9. Clicks "Leave" → Returns to landing page

### Journey 2: Existing User Creating Meeting

1. Visits landing page: `http://localhost:5173/`
2. Already logged in → Sees welcome message
3. Clicks "Create New Meeting"
4. Backend creates meeting, returns code
5. Redirected to meeting lobby with new code
6. Configures devices
7. Clicks "Join Meeting"
8. Waits for other participants
9. Copies meeting link to share

### Journey 3: Guest Joining Existing Meeting

1. Visits landing page
2. Not logged in → Sees sign-in options
3. Enters meeting code in input field
4. Clicks "Join Meeting" (without signing in)
5. Redirected to meeting lobby
6. Prompted to enter display name
7. Configures devices
8. Joins as guest participant

## Error Scenarios to Handle

1. **Invalid Meeting Code**
   - Show: "Meeting not found. Please check the code and try again."
   - Action: Stay on lobby, allow re-entry

2. **Device Access Denied**
   - Show: "Camera and microphone access required. Please enable in browser settings."
   - Action: Provide instructions with screenshots

3. **Network Error**
   - Show: "Connection failed. Please check your internet and try again."
   - Action: Retry button

4. **Token Generation Failed**
   - Show: "Failed to join meeting. Please try again or contact support."
   - Action: Retry button

5. **Meeting Room Connection Failed**
   - Show: "Could not connect to meeting. Please check your connection."
   - Action: Return to lobby button

## Accessibility Considerations

- Add ARIA labels to all interactive elements
- Keyboard navigation support (Tab, Enter, Escape)
- Screen reader announcements for state changes
- Focus management (trap focus in modal dialogs)
- High contrast mode support
- Respect prefers-reduced-motion for animations
- Provide text alternatives for icons

## Performance Optimization

- Lazy load meeting room components
- Preload video/audio tracks in lobby
- Optimize video preview resolution (lower for preview)
- Debounce device change events
- Clean up media streams on unmount
- Use React.memo for heavy components
- Code splitting for routes

## Security Considerations

- Validate meeting codes on both client and server
- Sanitize user inputs (display names)
- Secure token storage (don't persist in localStorage)
- HTTPS required for getUserMedia in production
- Rate limit meeting creation
- Implement meeting expiration
- Add meeting passwords (future enhancement)

## Future Enhancements (Optional)

- Waiting room for participants
- Virtual backgrounds
- Background blur
- Noise cancellation
- Grid/speaker view toggle
- Chat integration
- Reactions/emoji
- Meeting recording
- Screen annotation
- Breakout rooms
- Polls and Q&A
- Meeting templates
- Calendar integration

---

## Quick Implementation Checklist

1. ✅ Create `Landing.tsx` with meeting code input
2. ✅ Create `MeetingLobby.tsx` with device configuration
3. ✅ Create `MeetingRoom.tsx` wrapper component
4. ✅ Create `DeviceSelector.tsx` component
5. ✅ Create `VideoPreview.tsx` component
6. ✅ Create `AudioLevelIndicator.tsx` component
7. ✅ Create `useMediaDevices.ts` hook
8. ✅ Update routing in `App.tsx`
9. ✅ Remove auto-redirect from root route
10. ✅ Test complete user flow
11. ✅ Add error handling
12. ✅ Polish UI/UX
13. ✅ Test on mobile devices
14. ✅ Add loading states
15. ✅ Implement analytics (optional)

---

**Note:** This implementation guide assumes you have the LiveKit backend already configured and running. The backend should respond to:

- `POST /api/v1/meetings` - Create meeting
- `GET /api/v1/meetings/code/:code` - Get meeting by code
- `POST /api/v1/livekit/token` - Generate join token

All APIs require authentication (JWT token in Authorization header) except for joining meetings (which can be public or require auth based on your requirements).
