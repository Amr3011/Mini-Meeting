# Mini Meeting - Architecture Diagrams

## System Architecture

```mermaid
graph TB
    subgraph "Client Browser"
        UI[React Frontend]
        WS[WebSocket Client]
        RTC[WebRTC Engine]
    end

    subgraph "Backend Server"
        API[Fiber REST API]
        WSH[WebSocket Handler]
        SIG[Signaling Service]
        AUTH[Auth Service]
        MEET[Meeting Service]
        REPO[Repositories]
    end

    subgraph "Data Layer"
        DB[(PostgreSQL)]
        REDIS[(Redis Cache)]
    end

    UI -->|HTTP/HTTPS| API
    UI -->|WebSocket| WSH
    RTC -->|Signaling| WSH
    WSH --> SIG
    API --> AUTH
    API --> MEET
    AUTH --> REPO
    MEET --> REPO
    REPO --> DB
    AUTH --> REDIS

    RTC -.->|P2P Media| RTC2[Other Peer's WebRTC]

    style UI fill:#61dafb
    style API fill:#00add8
    style DB fill:#336791
    style RTC fill:#ff6b6b
```

## WebRTC Signaling Flow

```mermaid
sequenceDiagram
    participant A as User A
    participant SA as Server (A's WS)
    participant SB as Server (B's WS)
    participant B as User B

    A->>SA: Connect WebSocket
    A->>SA: Join Meeting
    SA->>A: Meeting Joined

    B->>SB: Connect WebSocket
    B->>SB: Join Meeting
    SB->>B: Meeting Joined
    SB->>SA: New Peer (User B)
    SA->>A: Peer Joined (User B)

    Note over A: Create RTCPeerConnection
    A->>A: Create Offer
    A->>SA: Send Offer
    SA->>SB: Forward Offer
    SB->>B: Receive Offer

    Note over B: Create RTCPeerConnection
    B->>B: Set Remote (Offer)
    B->>B: Create Answer
    B->>SB: Send Answer
    SB->>SA: Forward Answer
    SA->>A: Receive Answer

    A->>A: Collect ICE Candidates
    A->>SA: Send ICE Candidates
    SA->>SB: Forward ICE
    SB->>B: Receive ICE

    B->>B: Collect ICE Candidates
    B->>SB: Send ICE Candidates
    SB->>SA: Forward ICE
    SA->>A: Receive ICE

    Note over A,B: P2P Connection Established
    A-.->B: Media Stream (Direct P2P)
    B-.->A: Media Stream (Direct P2P)
```

## Database Schema

```mermaid
erDiagram
    USERS ||--o{ MEETINGS : hosts
    USERS ||--o{ PARTICIPANTS : joins
    MEETINGS ||--o{ PARTICIPANTS : contains

    USERS {
        int id PK
        string email UK
        string password
        string name
        timestamp created_at
        timestamp updated_at
    }

    MEETINGS {
        int id PK
        string code UK
        string title
        int host_id FK
        boolean is_active
        timestamp started_at
        timestamp ended_at
        timestamp created_at
    }

    PARTICIPANTS {
        int id PK
        int meeting_id FK
        int user_id FK
        timestamp joined_at
        timestamp left_at
    }
```

## Component Hierarchy (Frontend)

```mermaid
graph TD
    App[App.tsx]

    App --> Router[React Router]

    Router --> Home[Home Page]
    Router --> Login[Login Page]
    Router --> Dashboard[Dashboard Page]
    Router --> Meeting[Meeting Page]

    subgraph "Meeting Page Components"
        Meeting --> VideoGrid
        Meeting --> Controls
        Meeting --> Chat
        Meeting --> ParticipantList

        VideoGrid --> VideoTile1[VideoTile]
        VideoGrid --> VideoTile2[VideoTile]
        VideoGrid --> VideoTileN[VideoTile...]
    end

    subgraph "Context Providers"
        App -.-> AuthContext
        App -.-> WebSocketContext
        App -.-> MeetingContext
    end

    subgraph "Custom Hooks"
        Meeting -.-> useWebRTC
        Meeting -.-> useWebSocket
        Meeting -.-> useMeeting
        Controls -.-> useWebRTC
    end

    style Meeting fill:#61dafb
    style AuthContext fill:#ffd93d
    style useWebRTC fill:#ff6b6b
```

## Request Flow (Backend)

```mermaid
graph LR
    Client[Client Request]

    Client --> Middleware{Middleware Chain}

    Middleware -->|CORS| CORS_MW[CORS Check]
    CORS_MW -->|Logger| Logger_MW[Request Logger]
    Logger_MW -->|Auth| Auth_MW[JWT Validation]

    Auth_MW -->|Valid| Router[Router]
    Auth_MW -->|Invalid| Err401[401 Error]

    Router --> Handler[Handler]
    Handler --> Service[Service Layer]
    Service --> Repository[Repository]
    Repository --> DB[(Database)]

    DB --> Repository
    Repository --> Service
    Service --> Handler
    Handler --> Response[JSON Response]

    style Middleware fill:#ffd93d
    style Service fill:#00add8
    style DB fill:#336791
```

## Meeting Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: User creates meeting
    Created --> Active: First participant joins
    Active --> Active: Participants join/leave
    Active --> Ended: Host ends meeting
    Active --> Ended: Auto-end (all left)
    Ended --> [*]

    Active --> Paused: Connection issues
    Paused --> Active: Reconnected
    Paused --> Ended: Timeout
```

## Deployment Architecture

```mermaid
graph TB
    subgraph "Client"
        Browser[Web Browser]
    end

    subgraph "Load Balancer"
        LB[Nginx/Load Balancer]
    end

    subgraph "Application Servers"
        BE1[Backend Instance 1]
        BE2[Backend Instance 2]
        BE3[Backend Instance N]
    end

    subgraph "Static Assets"
        CDN[CDN/S3]
        FE[Frontend Build]
    end

    subgraph "Data & Cache"
        DB[(PostgreSQL Primary)]
        DB_R[(PostgreSQL Replica)]
        REDIS[(Redis Cluster)]
    end

    subgraph "External Services"
        TURN[TURN Server]
        STUN[STUN Server]
    end

    Browser -->|HTTPS| LB
    Browser -->|Assets| CDN
    CDN --> FE

    LB --> BE1
    LB --> BE2
    LB --> BE3

    BE1 --> DB
    BE2 --> DB
    BE3 --> DB

    DB -.->|Replication| DB_R

    BE1 --> REDIS
    BE2 --> REDIS
    BE3 --> REDIS

    Browser -.->|WebRTC| TURN
    Browser -.->|WebRTC| STUN

    style Browser fill:#61dafb
    style LB fill:#00add8
    style DB fill:#336791
    style REDIS fill:#dc382d
```

## File Upload Flow (Future Feature)

```mermaid
sequenceDiagram
    participant U as User
    participant FE as Frontend
    participant BE as Backend
    participant S3 as S3/Storage
    participant DB as Database

    U->>FE: Select file
    FE->>BE: Request upload URL
    BE->>S3: Generate presigned URL
    S3->>BE: Return presigned URL
    BE->>FE: Return upload URL
    FE->>S3: Upload file directly
    S3->>FE: Upload complete
    FE->>BE: Confirm upload + metadata
    BE->>DB: Save file record
    DB->>BE: Record saved
    BE->>FE: Upload successful
    FE->>U: Show success message
```
