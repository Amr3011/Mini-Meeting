package cache

import (
	"encoding/json"
	"log"
	"sync"

	"github.com/gofiber/contrib/websocket"
)

// LobbyHub manages WebSocket connections for lobby functionality.
// It tracks admin connections per meeting and visitor connections per request.
type LobbyHub struct {
	mu sync.RWMutex

	// meetingCode → set of admin WS connections
	admins map[string]map[*websocket.Conn]struct{}

	// requestID → visitor WS connection
	visitors map[string]*websocket.Conn
}

// Global hub instance
var Hub = NewLobbyHub()

func NewLobbyHub() *LobbyHub {
	return &LobbyHub{
		admins:   make(map[string]map[*websocket.Conn]struct{}),
		visitors: make(map[string]*websocket.Conn),
	}
}

// --- Admin connections ---

func (h *LobbyHub) RegisterAdmin(meetingCode string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if h.admins[meetingCode] == nil {
		h.admins[meetingCode] = make(map[*websocket.Conn]struct{})
	}
	h.admins[meetingCode][conn] = struct{}{}
	log.Printf("[LobbyHub] Admin registered for meeting %s (total: %d)", meetingCode, len(h.admins[meetingCode]))
}

func (h *LobbyHub) UnregisterAdmin(meetingCode string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()

	if conns, ok := h.admins[meetingCode]; ok {
		delete(conns, conn)
		if len(conns) == 0 {
			delete(h.admins, meetingCode)
		}
	}
	log.Printf("[LobbyHub] Admin unregistered for meeting %s", meetingCode)
}

// --- Visitor connections ---

func (h *LobbyHub) RegisterVisitor(requestID string, conn *websocket.Conn) {
	h.mu.Lock()
	defer h.mu.Unlock()
	h.visitors[requestID] = conn
	log.Printf("[LobbyHub] Visitor registered: %s", requestID)
}

func (h *LobbyHub) UnregisterVisitor(requestID string) {
	h.mu.Lock()
	defer h.mu.Unlock()
	delete(h.visitors, requestID)
	log.Printf("[LobbyHub] Visitor unregistered: %s", requestID)
}

// --- Notifications ---

// NotifyAdmins broadcasts a JSON message to all admin connections for a meeting.
// Dead connections are automatically evicted on write failure.
func (h *LobbyHub) NotifyAdmins(meetingCode string, msg interface{}) {
	h.mu.RLock()
	conns := make([]*websocket.Conn, 0)
	if adminSet, ok := h.admins[meetingCode]; ok {
		for conn := range adminSet {
			conns = append(conns, conn)
		}
	}
	h.mu.RUnlock()

	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("[LobbyHub] Failed to marshal admin notification: %v", err)
		return
	}

	for _, conn := range conns {
		if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
			log.Printf("[LobbyHub] Failed to send to admin, evicting dead connection: %v", err)
			// Evict dead connection to prevent memory leak
			h.mu.Lock()
			if adminSet, ok := h.admins[meetingCode]; ok {
				delete(adminSet, conn)
				if len(adminSet) == 0 {
					delete(h.admins, meetingCode)
				}
			}
			h.mu.Unlock()
		}
	}
}

// NotifyVisitor sends a JSON message to a specific visitor connection.
// Removes the dead connection on write failure.
func (h *LobbyHub) NotifyVisitor(requestID string, msg interface{}) {
	h.mu.RLock()
	conn, ok := h.visitors[requestID]
	h.mu.RUnlock()

	if !ok {
		log.Printf("[LobbyHub] No visitor connection for request %s", requestID)
		return
	}

	data, err := json.Marshal(msg)
	if err != nil {
		log.Printf("[LobbyHub] Failed to marshal visitor notification: %v", err)
		return
	}

	if err := conn.WriteMessage(websocket.TextMessage, data); err != nil {
		log.Printf("[LobbyHub] Failed to send to visitor %s, evicting: %v", requestID, err)
		h.mu.Lock()
		delete(h.visitors, requestID)
		h.mu.Unlock()
	}
}
