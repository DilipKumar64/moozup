# Chat Feature Implementation

This document describes the chat feature implementation for the MoozUp event platform, allowing event attendees to communicate with each other through text messages and image attachments.

## Database Schema

### New Models Added

#### Chat
- `id`: Primary key
- `createdAt`: Chat creation timestamp
- `updatedAt`: Last update timestamp
- `participants`: Relation to ChatParticipant
- `messages`: Relation to ChatMessage

#### ChatParticipant
- `id`: Primary key
- `chatId`: Foreign key to Chat
- `attendeeId`: Foreign key to EventAttendee
- `joinedAt`: When participant joined
- `isActive`: Whether participant is active
- Unique constraint on `(chatId, attendeeId)` to prevent duplicate participants

#### ChatMessage
- `id`: Primary key
- `chatId`: Foreign key to Chat
- `senderId`: Foreign key to EventAttendee (sender)
- `content`: Message text content (optional for image messages)
- `messageType`: Type of message (TEXT, IMAGE, IMAGE_WITH_TEXT)
- `createdAt`: Message timestamp
- `updatedAt`: Last update timestamp
- `isRead`: Whether message has been read
- `attachments`: Relation to ChatAttachment

#### ChatAttachment
- `id`: Primary key
- `messageId`: Foreign key to ChatMessage
- `fileUrl`: URL to the uploaded file
- `fileName`: Original filename
- `fileType`: MIME type (e.g., image/jpeg)
- `fileSize`: File size in bytes
- `createdAt`: Upload timestamp

## API Endpoints

### 1. Get All Chats for an Attendee
```
GET /api/chat/attendee/:attendeeId
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "chatId": 1,
      "partner": {
        "id": 2,
        "firstName": "John",
        "lastName": "Doe",
        "profilePicture": "https://example.com/avatar.jpg"
      },
      "lastMessage": {
        "id": 10,
        "content": "Hello there!",
        "messageType": "TEXT",
        "createdAt": "2024-01-15T10:30:00Z",
        "senderId": 1,
        "attachments": []
      },
      "updatedAt": "2024-01-15T10:30:00Z",
      "unreadCount": 0
    }
  ]
}
```

### 2. Get Messages for a Specific Chat
```
GET /api/chat/:chatId/messages?page=1&limit=50
Authorization: Bearer <token>
Body: { "attendeeId": 1 }
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "content": "Hello!",
      "messageType": "TEXT",
      "createdAt": "2024-01-15T10:00:00Z",
      "sender": {
        "id": 1,
        "firstName": "Jane",
        "lastName": "Smith",
        "profilePicture": "https://example.com/avatar.jpg"
      },
      "attachments": []
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 50,
    "total": 25,
    "totalPages": 1
  }
}
```

### 3. Send a Message
```
POST /api/chat/send
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "senderId": 1,
  "receiverId": 2,
  "content": "Hello there!",
  "messageType": "TEXT"
}
```

**For Image Message:**
```json
{
  "senderId": 1,
  "receiverId": 2,
  "content": "Check out this image!",
  "messageType": "IMAGE_WITH_TEXT",
  "attachments": [
    {
      "fileUrl": "https://example.com/image.jpg",
      "fileName": "photo.jpg",
      "fileType": "image/jpeg",
      "fileSize": 1024000
    }
  ]
}
```

### 4. Upload Chat Image
```
POST /api/chat/upload-image/:chatId
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

**Parameters:**
- `chatId`: The ID of the chat where the image will be used

**Form Data:**
- `image`: Image file (JPEG, PNG, GIF, WebP, max 5MB)

**Response:**
```json
{
  "success": true,
  "data": {
    "fileUrl": "https://your-project.supabase.co/storage/v1/object/public/moozup/chat/123/image.jpg",
    "fileName": "image.jpg",
    "fileType": "image/jpeg",
    "fileSize": 1024000
  }
}
```

### 5. Mark Messages as Read
```
PATCH /api/chat/mark-read
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "chatId": 1,
  "attendeeId": 2
}
```

### 6. Get Unread Message Count
```
GET /api/chat/attendee/:attendeeId/unread-count
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "unreadCount": 5
  }
}
```

### 7. Get Chattable Attendees
```
GET /api/chat/chattable-attendees?eventId=1&currentAttendeeId=1&search=john
Authorization: Bearer <token>
```

**Query Parameters:**
- `eventId`: The ID of the event to get attendees from
- `currentAttendeeId`: The ID of the current attendee (will be excluded from results)
- `search` (optional): Search query to filter attendees by name (first name, last name, or full name)

**Response:**
```json
{
  "success": true,
  "data": {
    "attendees": [
      {
        "attendeeId": 2,
        "firstName": "John",
        "lastName": "Doe",
        "profilePicture": "https://example.com/avatar.jpg",
        "fullName": "John Doe"
      },
      {
        "attendeeId": 3,
        "firstName": "Johnny",
        "lastName": "Smith",
        "profilePicture": null,
        "fullName": "Johnny Smith"
      }
    ],
    "count": 2,
    "searchQuery": "john"
  }
}
```

**Search Features:**
- **First Name Search**: `?search=john` finds attendees with "john" in their first name
- **Last Name Search**: `?search=doe` finds attendees with "doe" in their last name  
- **Full Name Search**: `?search=john doe` finds attendees matching the full name
- **Partial Matching**: `?search=jo` finds attendees with names starting with "jo"
- **Case Insensitive**: Search works regardless of case (uppercase/lowercase)
- **No Search**: Omitting the `search` parameter returns all chattable attendees

## Socket.IO Events

### Client to Server Events

#### Join Chat Room
```javascript
socket.emit('joinChat', chatId);
```

#### Leave Chat Room
```javascript
socket.emit('leaveChat', chatId);
```

### Server to Client Events

#### New Chat Message
```javascript
socket.on('newChatMessage', (messageData) => {
  console.log('New message received:', messageData);
  // Update UI with new message
});
```

**Message Data Structure:**
```json
{
  "chatId": 1,
  "message": {
    "id": 10,
    "content": "Hello there!",
    "messageType": "TEXT",
    "createdAt": "2024-01-15T10:30:00Z",
    "sender": {
      "id": 1,
      "firstName": "Jane",
      "lastName": "Smith",
      "profilePicture": "https://example.com/avatar.jpg"
    },
    "attachments": []
  }
}
```

#### Chat Update
```javascript
socket.on('chatUpdate', (chatData) => {
  console.log('Chat updated:', chatData);
  // Update chat list or notifications
});
```

## Message Types

1. **TEXT**: Simple text message
2. **IMAGE**: Image only (no text)
3. **IMAGE_WITH_TEXT**: Image with accompanying text

## Features

### Automatic Chat Creation
- When a user sends a message to another attendee, a chat is automatically created if it doesn't exist
- Each pair of attendees can only have one chat (enforced by unique constraint)

### Real-time Messaging
- Messages are delivered instantly via Socket.IO
- Both participants receive the message in real-time

### Message History
- All messages are stored in the database
- Pagination support for loading message history
- Messages are ordered chronologically

### Read Status
- Messages can be marked as read
- Unread message count tracking

### File Attachments
- Support for image attachments
- File metadata storage (name, type, size)
- Multiple attachments per message
- **Supabase storage integration** with chat-specific folders
- **Organized storage** in `chat/{chatId}/` folders for easy management

### User Information
- Sender details included with each message
- Profile pictures, names, and IDs included

## Implementation Notes

### Database Relationships
- `EventAttendee` has many `ChatParticipant` and `ChatMessage`
- `Chat` has many `ChatParticipant` and `ChatMessage`
- `ChatMessage` has many `ChatAttachment`

### Security
- All endpoints require JWT authentication
- Attendee validation before operations
- Input validation for all parameters

### Performance
- Pagination for message history
- Efficient queries with proper indexing
- Socket room management for real-time updates
- **Supabase storage** for fast image delivery
- **Chat-specific folders** for organized file management

## Usage Example

### Frontend Implementation

```javascript
// Connect to socket
const socket = io('http://localhost:3000', {
  auth: {
    token: 'your-jwt-token'
  }
});

// Join a chat room
socket.emit('joinChat', chatId);

// Listen for new messages
socket.on('newChatMessage', (messageData) => {
  if (messageData.chatId === currentChatId) {
    // Add message to UI
    addMessageToUI(messageData.message);
  }
});

// Upload an image for chat
async function uploadChatImage(imageFile, chatId) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`/api/chat/upload-image/${chatId}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data; // Returns { fileUrl, fileName, fileType, fileSize }
    }
  } catch (error) {
    console.error('Error uploading image:', error);
  }
}

// Send a text message
async function sendTextMessage(content, receiverId) {
  try {
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        senderId: currentUserId,
        receiverId: receiverId,
        content: content,
        messageType: 'TEXT'
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Message sent:', data.data);
    }
  } catch (error) {
    console.error('Error sending message:', error);
  }
}

// Send an image message
async function sendImageMessage(imageFile, textContent, receiverId, chatId) {
  try {
    // First upload the image
    const uploadResult = await uploadChatImage(imageFile, chatId);
    if (!uploadResult) {
      throw new Error('Failed to upload image');
    }

    // Then send the message with the uploaded image
    const response = await fetch('/api/chat/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        senderId: currentUserId,
        receiverId: receiverId,
        content: textContent || '',
        messageType: textContent ? 'IMAGE_WITH_TEXT' : 'IMAGE',
        attachments: [uploadResult]
      })
    });
    
    const data = await response.json();
    if (data.success) {
      console.log('Image message sent:', data.data);
    }
  } catch (error) {
    console.error('Error sending image message:', error);
  }
}

// Example usage
document.getElementById('sendTextBtn').addEventListener('click', () => {
  const content = document.getElementById('messageInput').value;
  sendTextMessage(content, receiverId);
});

document.getElementById('sendImageBtn').addEventListener('click', () => {
  const imageFile = document.getElementById('imageInput').files[0];
  const textContent = document.getElementById('imageCaption').value;
  const chatId = currentChatId; // Get current chat ID
  sendImageMessage(imageFile, textContent, receiverId, chatId);
});

// Get chattable attendees for chat tiles
async function getChattableAttendees(eventId, currentAttendeeId, searchQuery = null) {
  try {
    const params = new URLSearchParams({
      eventId: eventId,
      currentAttendeeId: currentAttendeeId
    });
    
    if (searchQuery && searchQuery.trim()) {
      params.append('search', searchQuery.trim());
    }
    
    const response = await fetch(`/api/chat/chattable-attendees?${params}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    const data = await response.json();
    if (data.success) {
      return data.data.attendees;
    }
  } catch (error) {
    console.error('Error fetching chattable attendees:', error);
  }
}

// Example: Load chat tiles with search
async function loadChatTiles(eventId, currentAttendeeId, searchQuery = null) {
  const attendees = await getChattableAttendees(eventId, currentAttendeeId, searchQuery);
  
  const chatTilesContainer = document.getElementById('chatTilesContainer');
  chatTilesContainer.innerHTML = '';
  
  if (attendees.length === 0) {
    chatTilesContainer.innerHTML = `
      <div class="no-results">
        <p>${searchQuery ? `No attendees found matching "${searchQuery}"` : 'No attendees available for chat'}</p>
      </div>
    `;
    return;
  }
  
  attendees.forEach(attendee => {
    const tile = document.createElement('div');
    tile.className = 'chat-tile';
    tile.innerHTML = `
      <img src="${attendee.profilePicture || '/default-avatar.png'}" alt="${attendee.fullName}">
      <div class="attendee-info">
        <h4>${attendee.fullName}</h4>
        <button onclick="startChat(${attendee.attendeeId})">Start Chat</button>
      </div>
    `;
    chatTilesContainer.appendChild(tile);
  });
}

// Example: Search functionality
document.getElementById('searchInput').addEventListener('input', (e) => {
  const searchQuery = e.target.value;
  const eventId = currentEventId; // Get current event ID
  const currentAttendeeId = currentUserId; // Get current user ID
  
  // Debounce the search to avoid too many API calls
  clearTimeout(searchTimeout);
  searchTimeout = setTimeout(() => {
    loadChatTiles(eventId, currentAttendeeId, searchQuery);
  }, 300);
});

// Example: Clear search
document.getElementById('clearSearchBtn').addEventListener('click', () => {
  document.getElementById('searchInput').value = '';
  loadChatTiles(currentEventId, currentUserId);
});
```

## Migration

After updating the schema, run:
```bash
npx prisma migrate dev --name add-chat-feature
npx prisma generate
```

This will create the necessary database tables and update the Prisma client. 