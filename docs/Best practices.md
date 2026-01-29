# Mini Meeting - Development Best Practices

## 🎯 Coding Standards

### Go Backend

#### Naming Conventions

```go
// Exported (public) - PascalCase
type UserService struct {}
func CreateMeeting() {}

// Unexported (private) - camelCase
type userRepository struct {}
func validateEmail() {}

// Constants - UPPER_SNAKE_CASE or PascalCase
const MAX_PARTICIPANTS = 50
const DefaultMeetingDuration = 60 * time.Minute

// Interfaces - end with 'er' or descriptive name
type UserRepository interface {}
type MeetingHandler interface {}
```

#### Error Handling

```go
// ✅ Good - Return errors, don't panic
func GetUser(id uint) (*User, error) {
    user, err := repo.FindByID(id)
    if err != nil {
        return nil, fmt.Errorf("failed to get user: %w", err)
    }
    return user, nil
}

// ❌ Bad - Panicking
func GetUser(id uint) *User {
    user, err := repo.FindByID(id)
    if err != nil {
        panic(err) // Never do this!
    }
    return user
}

// ✅ Good - Custom error types
type ValidationError struct {
    Field   string
    Message string
}

func (e *ValidationError) Error() string {
    return fmt.Sprintf("%s: %s", e.Field, e.Message)
}
```

#### Project Structure Best Practices

```go
// ✅ Good - Separate concerns
// internal/handlers/meeting.go
func (h *MeetingHandler) CreateMeeting(c *fiber.Ctx) error {
    var req CreateMeetingRequest
    if err := c.BodyParser(&req); err != nil {
        return c.Status(400).JSON(fiber.Map{"error": "invalid request"})
    }

    meeting, err := h.service.CreateMeeting(req)
    if err != nil {
        return c.Status(500).JSON(fiber.Map{"error": err.Error()})
    }

    return c.Status(201).JSON(meeting)
}

// internal/services/meeting_service.go
func (s *MeetingService) CreateMeeting(req CreateMeetingRequest) (*Meeting, error) {
    // Business logic here
    meeting := &Meeting{
        Code:    generateMeetingCode(),
        Title:   req.Title,
        HostID:  req.HostID,
    }

    return s.repo.Create(meeting)
}

// internal/repositories/meeting_repository.go
func (r *MeetingRepository) Create(meeting *Meeting) (*Meeting, error) {
    result := r.db.Create(meeting)
    return meeting, result.Error
}
```

#### Dependency Injection

```go
// ✅ Good - Constructor injection
type MeetingService struct {
    repo  MeetingRepository
    cache CacheService
}

func NewMeetingService(repo MeetingRepository, cache CacheService) *MeetingService {
    return &MeetingService{
        repo:  repo,
        cache: cache,
    }
}

// ❌ Bad - Global variables
var globalRepo MeetingRepository // Avoid this!

func CreateMeeting() {
    globalRepo.Create() // Hard to test!
}
```

### TypeScript/React Frontend

#### Component Structure

```typescript
// ✅ Good - Functional component with TypeScript
interface VideoTileProps {
  stream: MediaStream;
  userId: string;
  isMuted?: boolean;
  isLocal?: boolean;
}

export const VideoTile: React.FC<VideoTileProps> = ({
  stream,
  userId,
  isMuted = false,
  isLocal = false,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return (
    <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted={isLocal || isMuted}
        className="w-full h-full object-cover"
      />
      {isMuted && <MutedIcon />}
    </div>
  );
};
```

#### Custom Hooks

```typescript
// ✅ Good - Reusable custom hook
export const useWebRTC = (meetingId: string) => {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [remoteStreams, setRemoteStreams] = useState<Map<string, MediaStream>>(
    new Map(),
  );
  const peerConnections = useRef<Map<string, RTCPeerConnection>>(new Map());

  const startLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
      return stream;
    } catch (error) {
      console.error("Failed to get local stream:", error);
      throw error;
    }
  };

  const createPeerConnection = (peerId: string) => {
    const pc = new RTCPeerConnection(ICE_SERVERS);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        // Send ICE candidate to peer
      }
    };

    pc.ontrack = (event) => {
      setRemoteStreams((prev) => {
        const updated = new Map(prev);
        updated.set(peerId, event.streams[0]);
        return updated;
      });
    };

    peerConnections.current.set(peerId, pc);
    return pc;
  };

  return {
    localStream,
    remoteStreams,
    startLocalStream,
    createPeerConnection,
  };
};
```

#### State Management with Context

```typescript
// ✅ Good - Typed context
interface MeetingContextValue {
  meeting: Meeting | null;
  participants: Participant[];
  joinMeeting: (code: string) => Promise<void>;
  leaveMeeting: () => Promise<void>;
}

const MeetingContext = createContext<MeetingContextValue | undefined>(undefined);

export const MeetingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const joinMeeting = async (code: string) => {
    const response = await api.joinMeeting(code);
    setMeeting(response.meeting);
    setParticipants(response.participants);
  };

  const leaveMeeting = async () => {
    if (meeting) {
      await api.leaveMeeting(meeting.id);
      setMeeting(null);
      setParticipants([]);
    }
  };

  return (
    <MeetingContext.Provider value={{ meeting, participants, joinMeeting, leaveMeeting }}>
      {children}
    </MeetingContext.Provider>
  );
};

export const useMeeting = () => {
  const context = useContext(MeetingContext);
  if (!context) {
    throw new Error('useMeeting must be used within MeetingProvider');
  }
  return context;
};
```

## 🔒 Security Best Practices

### Backend Security

```go
// ✅ Password hashing
import "golang.org/x/crypto/bcrypt"

func HashPassword(password string) (string, error) {
    bytes, err := bcrypt.GenerateFromPassword([]byte(password), bcrypt.DefaultCost)
    return string(bytes), err
}

func CheckPassword(password, hash string) bool {
    err := bcrypt.CompareHashAndPassword([]byte(hash), []byte(password))
    return err == nil
}

// ✅ JWT middleware
func AuthMiddleware(c *fiber.Ctx) error {
    token := c.Get("Authorization")
    if token == "" {
        return c.Status(401).JSON(fiber.Map{"error": "missing token"})
    }

    claims, err := ValidateJWT(token)
    if err != nil {
        return c.Status(401).JSON(fiber.Map{"error": "invalid token"})
    }

    c.Locals("user", claims)
    return c.Next()
}

// ✅ Input validation
type CreateMeetingRequest struct {
    Title string `json:"title" validate:"required,min=3,max=100"`
}

func validateRequest(req interface{}) error {
    validate := validator.New()
    return validate.Struct(req)
}

// ✅ SQL injection prevention (GORM does this automatically)
// ❌ Bad
query := fmt.Sprintf("SELECT * FROM users WHERE email = '%s'", email)

// ✅ Good - Use GORM
db.Where("email = ?", email).First(&user)
```

### Frontend Security

```typescript
// ✅ XSS Prevention - React escapes by default, but be careful with:
// ❌ Bad
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ Good - Sanitize if you must use dangerouslySetInnerHTML
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(userInput) }} />

// ✅ Secure token storage
// Store JWT in httpOnly cookie (backend sets it) or
// Use sessionStorage/localStorage with caution
const token = localStorage.getItem('token');
if (token) {
  api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// ✅ CORS handling
// Backend should validate origins
app.use(cors({
  origin: process.env.CORS_ORIGINS.split(','),
  credentials: true,
}));
```

## 🧪 Testing Best Practices

### Backend Testing

```go
// Test file naming: <file>_test.go
// internal/services/meeting_service_test.go

func TestMeetingService_CreateMeeting(t *testing.T) {
    // Arrange
    mockRepo := &MockMeetingRepository{}
    service := NewMeetingService(mockRepo, nil)

    req := CreateMeetingRequest{
        Title:  "Test Meeting",
        HostID: 1,
    }

    // Act
    meeting, err := service.CreateMeeting(req)

    // Assert
    assert.NoError(t, err)
    assert.NotNil(t, meeting)
    assert.Equal(t, "Test Meeting", meeting.Title)
}

// Table-driven tests
func TestValidateEmail(t *testing.T) {
    tests := []struct {
        name    string
        email   string
        wantErr bool
    }{
        {"valid email", "test@example.com", false},
        {"invalid email", "invalid", true},
        {"empty email", "", true},
    }

    for _, tt := range tests {
        t.Run(tt.name, func(t *testing.T) {
            err := ValidateEmail(tt.email)
            if (err != nil) != tt.wantErr {
                t.Errorf("ValidateEmail() error = %v, wantErr %v", err, tt.wantErr)
            }
        })
    }
}
```

### Frontend Testing

```typescript
// Component testing with React Testing Library
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoTile } from './VideoTile';

describe('VideoTile', () => {
  it('renders video element', () => {
    const mockStream = new MediaStream();
    render(<VideoTile stream={mockStream} userId="123" />);

    const video = screen.getByRole('video');
    expect(video).toBeInTheDocument();
  });

  it('shows muted icon when muted', () => {
    const mockStream = new MediaStream();
    render(<VideoTile stream={mockStream} userId="123" isMuted />);

    const mutedIcon = screen.getByTestId('muted-icon');
    expect(mutedIcon).toBeInTheDocument();
  });
});

// Hook testing
import { renderHook, act } from '@testing-library/react';
import { useWebRTC } from './useWebRTC';

describe('useWebRTC', () => {
  it('starts local stream', async () => {
    const { result } = renderHook(() => useWebRTC('meeting-123'));

    await act(async () => {
      await result.current.startLocalStream();
    });

    expect(result.current.localStream).toBeTruthy();
  });
});
```

## 📝 Documentation Best Practices

### Code Comments

```go
// ✅ Good - Document public APIs
// CreateMeeting creates a new meeting room with the given parameters.
// It generates a unique meeting code and sets the host.
// Returns the created meeting or an error if creation fails.
func CreateMeeting(title string, hostID uint) (*Meeting, error) {
    // Implementation
}

// ✅ Good - Explain complex logic
// We use a sliding window approach here to prevent rate limiting
// by tracking requests in the last 60 seconds
func checkRateLimit(userID uint) bool {
    // Complex implementation
}

// ❌ Bad - Obvious comments
// Get user by ID
func GetUserByID(id uint) (*User, error) {
    // ...
}
```

### API Documentation

```go
// Use Swagger/OpenAPI annotations
// @Summary Create a new meeting
// @Description Creates a new meeting room with a unique code
// @Tags meetings
// @Accept json
// @Produce json
// @Param meeting body CreateMeetingRequest true "Meeting details"
// @Success 201 {object} Meeting
// @Failure 400 {object} ErrorResponse
// @Failure 401 {object} ErrorResponse
// @Router /api/meetings [post]
func (h *MeetingHandler) CreateMeeting(c *fiber.Ctx) error {
    // Implementation
}
```

## 🚀 Performance Best Practices

### Backend Performance

```go
// ✅ Use database indexes
type User struct {
    Email string `gorm:"index:idx_email,unique"`
}

// ✅ Use connection pooling
db, err := gorm.Open(postgres.Open(dsn), &gorm.Config{})
sqlDB, _ := db.DB()
sqlDB.SetMaxIdleConns(10)
sqlDB.SetMaxOpenConns(100)
sqlDB.SetConnMaxLifetime(time.Hour)

// ✅ Cache frequently accessed data
func (s *MeetingService) GetMeeting(id uint) (*Meeting, error) {
    // Check cache first
    if cached := s.cache.Get(fmt.Sprintf("meeting:%d", id)); cached != nil {
        return cached.(*Meeting), nil
    }

    // Fetch from DB
    meeting, err := s.repo.FindByID(id)
    if err != nil {
        return nil, err
    }

    // Store in cache
    s.cache.Set(fmt.Sprintf("meeting:%d", id), meeting, 5*time.Minute)
    return meeting, nil
}

// ✅ Use goroutines for concurrent operations
func notifyParticipants(participants []Participant) {
    var wg sync.WaitGroup
    for _, p := range participants {
        wg.Add(1)
        go func(participant Participant) {
            defer wg.Done()
            sendNotification(participant)
        }(p)
    }
    wg.Wait()
}
```

### Frontend Performance

```typescript
// ✅ Memoize expensive computations
const sortedParticipants = useMemo(() => {
  return participants.sort((a, b) => a.name.localeCompare(b.name));
}, [participants]);

// ✅ Debounce user input
const debouncedSearch = useCallback(
  debounce((query: string) => {
    searchMeetings(query);
  }, 300),
  []
);

// ✅ Lazy load components
const MeetingRoom = lazy(() => import('./pages/Meeting'));

// ✅ Virtual scrolling for large lists
import { FixedSizeList } from 'react-window';

const ParticipantList = ({ participants }) => (
  <FixedSizeList
    height={400}
    itemCount={participants.length}
    itemSize={50}
  >
    {({ index, style }) => (
      <div style={style}>{participants[index].name}</div>
    )}
  </FixedSizeList>
);
```

## 🐛 Debugging Tips

### Backend Debugging

```go
// Use structured logging
import "github.com/sirupsen/logrus"

log := logrus.WithFields(logrus.Fields{
    "user_id":    userID,
    "meeting_id": meetingID,
    "action":     "join_meeting",
})
log.Info("User joined meeting")

// Add request ID for tracing
func RequestIDMiddleware(c *fiber.Ctx) error {
    requestID := uuid.New().String()
    c.Locals("requestID", requestID)
    c.Set("X-Request-ID", requestID)
    return c.Next()
}
```

### Frontend Debugging

```typescript
// Use React DevTools
// Add display names
VideoTile.displayName = "VideoTile";

// Log WebRTC events
peerConnection.addEventListener("iceconnectionstatechange", () => {
  console.log("ICE connection state:", peerConnection.iceConnectionState);
});

// Add error boundaries
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
  }
}
```

## 📋 Git Workflow

```bash
# Feature branch naming
git checkout -b feature/add-screen-sharing
git checkout -b fix/video-freeze-issue
git checkout -b refactor/meeting-service

# Commit message format
git commit -m "feat: add screen sharing functionality"
git commit -m "fix: resolve video freeze on reconnect"
git commit -m "refactor: simplify meeting service logic"

# Types: feat, fix, refactor, docs, test, chore, style
```

## ✅ Pre-deployment Checklist

- [ ] All tests passing
- [ ] No console errors/warnings
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Error tracking setup (Sentry, etc.)
- [ ] Performance monitoring
- [ ] Security headers set
- [ ] SSL/TLS certificates
- [ ] Backup strategy
- [ ] Documentation updated
