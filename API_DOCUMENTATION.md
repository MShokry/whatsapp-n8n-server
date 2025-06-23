# WhatsApp n8n Server API Documentation

This server provides a REST API to integrate WhatsApp with n8n for automation workflows. It supports sending messages, reading conversations, replying to messages, and webhook notifications for incoming messages.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
The server uses WhatsApp Web authentication. You need to scan a QR code to authenticate.

## Endpoints

### 1. Get QR Code for Authentication
**GET** `/qr-code`

Returns the QR code for WhatsApp Web authentication.

**Response:**
```json
{
  "qrCode": "data:image/png;base64,...",
  "status": "qr",
  "message": "Scan QR code to authenticate"
}
```

**Status Values:**
- `initializing` - Client is starting up
- `qr` - QR code is available for scanning
- `authenticating` - User scanned QR, authenticating
- `ready` - Client is ready to use
- `disconnected` - Client is disconnected

### 2. Send Message
**POST** `/send-message`

Sends a message to a WhatsApp contact or group.

**Request Body:**
```json
{
  "number": "+1234567890",
  "content": "Hello from n8n!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Message sent successfully"
}
```

### 3. Read Messages
**GET** `/messages?chatId={chatId}&limit={limit}`

Retrieves messages from a specific chat.

**Query Parameters:**
- `chatId` (required) - The chat ID to read messages from
- `limit` (optional, default: 50) - Number of messages to retrieve

**Response:**
```json
{
  "messages": [
    {
      "id": "message_id",
      "body": "Message content",
      "from": "sender_id",
      "to": "recipient_id",
      "timestamp": 1234567890,
      "type": "chat",
      "fromMe": false,
      "hasMedia": false,
      "author": "author_id",
      "deviceType": "web"
    }
  ],
  "count": 1,
  "chatId": "chat_id",
  "limit": 50
}
```

### 4. Read Senders/Contacts List
**GET** `/senders?type={type}&unreadOnly={unreadOnly}&allowedSenders={allowedSenders}`

Retrieves list of contacts and groups.

**Query Parameters:**
- `type` (optional, default: "all") - Filter by type:
  - `all` - Returns all chats
  - `contacts` - Returns only individual contacts
  - `groups` - Returns only group chats
- `unreadOnly` (optional, default: "false") - Filter by unread status:
  - `true` - Returns only chats with unread messages
  - `false` - Returns all chats
- `allowedSenders` (optional) - Comma-separated list of phone numbers to filter by

**Example Requests:**
```bash
# Get all senders
curl "http://localhost:3000/api/v1/senders"

# Get only senders with unread messages
curl "http://localhost:3000/api/v1/senders?unreadOnly=true"

# Get specific allowed senders
curl "http://localhost:3000/api/v1/senders?allowedSenders=+1234567890,+0987654321"

# Combine filters
curl "http://localhost:3000/api/v1/senders?unreadOnly=true&allowedSenders=+1234567890,+0987654321"
```

**Response:**
```json
{
  "senders": [
    {
      "id": "chat_id",
      "name": "Contact Name",
      "isGroup": false,
      "isMuted": false,
      "isReadOnly": false,
      "unreadCount": 3,
      "timestamp": 1234567890,
      "lastMessage": {
        "body": "Last message content",
        "timestamp": 1234567890,
        "from": "sender_id",
        "type": "chat"
      }
    }
  ],
  "count": 1,
  "type": "all",
  "unreadOnly": false
}
```

### 5. Reply to Message
**POST** `/reply`

Replies to a specific message in a chat.

**Request Body:**
```json
{
  "chatId": "chat_id",
  "messageId": "message_id",
  "replyText": "This is a reply"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply sent successfully",
  "data": {
    "chatId": "chat_id",
    "messageId": "message_id",
    "replyText": "This is a reply"
  }
}
```

### 6. Setup Webhook
**POST** `/webhook/setup`

Sets up a webhook URL to receive notifications for incoming messages.

**Request Body:**
```json
{
  "webhookUrl": "https://your-n8n-instance.com/webhook/whatsapp"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Webhook setup successfully",
  "data": {
    "webhookUrl": "https://your-n8n-instance.com/webhook/whatsapp"
  }
}
```

### 7. Remove Webhook
**DELETE** `/webhook`

Removes the configured webhook.

**Response:**
```json
{
  "success": true,
  "message": "Webhook removed successfully"
}
```

## Webhook Payload

When a webhook is configured, incoming messages will be sent to your webhook URL with the following payload:

```json
{
  "id": "message_id",
  "body": "Message content",
  "from": "sender_id",
  "to": "recipient_id",
  "timestamp": 1234567890,
  "type": "chat",
  "hasMedia": false,
  "author": "author_id",
  "deviceType": "web",
  "chat": {
    "id": "chat_id",
    "name": "Chat Name",
    "isGroup": false
  },
  "contact": {
    "id": "contact_id",
    "name": "Contact Name",
    "number": "+1234567890"
  }
}
```

## n8n Integration Examples

### Basic Message Sending

1. **HTTP Request Node Configuration:**
   - Method: POST
   - URL: `http://localhost:3000/api/v1/send-message`
   - Body:
     ```json
     {
       "number": "+1234567890",
       "content": "Hello from n8n!"
     }
     ```

### AI-Powered Auto-Response Workflow

**Complete workflow available in:** `n8n_workflows/whatsapp_ai_assistant.json`

**Features:**
- Automatic response to new messages
- AI context awareness (last 20 messages)
- Sender filtering via Google Sheets
- Real-time webhook processing
- Scheduled polling backup

**Setup Steps:**
1. Import the workflow from `n8n_workflows/whatsapp_ai_assistant.json`
2. Configure OpenAI credentials
3. Set up Google Sheets for sender management (optional)
4. Update webhook URLs
5. Activate the workflow

### Sender Management with Google Sheets

**Template:** Use `n8n_workflows/google_sheets_template.csv`

**Columns:**
- `PhoneNumber`: WhatsApp numbers (+1234567890)
- `Active`: Yes/No to enable/disable responses
- `Name`: Contact name for reference
- `Notes`: Additional information
- `LastResponse`: Timestamp of last AI response
- `ResponseCount`: Number of AI responses sent

### Testing Workflow

**Test Suite:** `n8n_workflows/whatsapp_server_test.json`

**Tests Include:**
- QR Code generation
- Message sending/receiving
- Sender filtering
- Webhook setup/removal
- Reply functionality
- Comprehensive reporting

### Advanced Filtering Examples

```javascript
// n8n Function Node: Business Hours Filter
const currentHour = new Date().getHours();
const isBusinessHours = currentHour >= 9 && currentHour <= 17;

if (!isBusinessHours) {
  return { json: { filteredSenders: [] } };
}

return $input.item(0).json;
```

```javascript
// n8n Function Node: Priority Sender Filter
const prioritySenders = ['+1234567890', '+0987654321'];
const senders = $input.item(0).json.data.senders;

const filteredSenders = senders.filter(sender => 
  prioritySenders.includes(sender.id) && sender.unreadCount > 0
);

return { json: { filteredSenders } };
```

### 1. Auto-Reply Workflow
1. Set up webhook in n8n to receive incoming messages
2. Use webhook trigger node to capture incoming messages
3. Add logic to determine response
4. Use HTTP Request node to send reply via `/reply` endpoint

### 2. Customer Support Automation
1. Monitor unread messages using `/senders?unreadOnly=true`
2. Fetch messages from specific chats using `/messages`
3. Process messages with AI or predefined rules
4. Send automated responses using `/send-message` or `/reply`

### 3. Notification System
1. Set up webhook to receive all incoming messages
2. Filter messages based on keywords or sender
3. Forward important messages to email, Slack, or other systems
4. Log conversations to database or CRM

## Error Handling

All endpoints return appropriate HTTP status codes:

- `200` - Success
- `400` - Bad Request (missing or invalid parameters)
- `500` - Internal Server Error
- `503` - Service Unavailable (WhatsApp client not ready)

Error responses include a descriptive message:
```json
{
  "message": "Error description",
  "error": "Detailed error information"
}
```

## Getting Started

1. Start the server: `bun run dev`
2. Get QR code: `GET /api/v1/qr-code`
3. Scan QR code with WhatsApp mobile app
4. Wait for status to become "ready"
5. Start using the API endpoints
6. Set up webhook for real-time message notifications

## Notes

- The server maintains a persistent WhatsApp Web session
- QR code authentication is required on first run or after session expires
- Webhook notifications are only sent for incoming messages (not sent by you)
- Message IDs are unique identifiers that can be used for replies
- Chat IDs remain consistent and can be used to identify conversations