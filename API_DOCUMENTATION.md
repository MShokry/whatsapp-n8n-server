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

Replies to a specific message in a chat. Automatically marks the chat as read and sends read confirmation.

**Request Body:**
```json
{
  "chatId": "1234567890@c.us",
  "messageId": "message_id_here",
  "replyText": "This is a reply"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Reply sent successfully",
  "data": {
    "chatId": "1234567890@c.us",
    "messageId": "message_id_here",
    "replyText": "This is a reply"
  }
}
```

### 6. Transcribe Voice Message
**POST** `/transcribe-voice`

Transcribes a voice message using OpenAI Whisper API.

**Request Body:**
```json
{
  "messageId": "voice_message_id_here"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Voice message transcribed successfully",
  "data": {
    "messageId": "voice_message_id_here",
    "transcription": "Hello, this is the transcribed text from the voice message."
  }
}
```

**Error Response:**
```json
{
  "message": "Failed to transcribe voice message",
  "error": "Message is not a voice message"
}
```

### 7. Setup Webhook
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

### 8. Remove Webhook
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

## Production Improvements

### Session Persistence
- **Persistent Authentication:** WhatsApp sessions are now saved locally using `LocalAuth` with a dedicated client ID
- **Automatic Reconnection:** The client automatically attempts to reconnect using saved session data
- **Reduced QR Scanning:** Sessions persist between server restarts, minimizing QR code requirements

### Voice Message Support
- **Automatic Transcription:** Voice messages are automatically transcribed using OpenAI Whisper API
- **Webhook Integration:** Voice messages in webhooks include both original audio and transcribed text
- **AI-Ready Format:** Transcriptions are formatted for easy AI processing in n8n workflows

### Enhanced Webhook Reliability
- **Retry Mechanism:** Failed webhook deliveries are retried up to 3 times with exponential backoff
- **Timeout Handling:** 10-second timeout prevents hanging requests
- **Error Recovery:** Webhook automatically reactivates after client reconnection
- **Structured Data:** Improved webhook payload structure with separate message, chat, and contact objects

### Read Confirmation
- **Automatic Read Receipts:** Replying to messages automatically marks chats as read
- **Unread Count Reset:** Clears unread message indicators when responding
- **Better UX:** Provides proper message acknowledgment for users

## Production Considerations

- **Environment Variables:** Set `OPENAI_API_KEY` for voice transcription functionality
- **HTTPS Required:** Use HTTPS for webhook URLs in production
- **Session Storage:** Ensure `.wwebjs_auth` directory is persistent and backed up
- **Error Handling:** Implement proper error handling and logging
- **Rate Limiting:** Consider rate limiting for API endpoints
- **Monitoring:** Monitor WhatsApp client connection status and webhook delivery
- **Security:** Never expose OpenAI API keys in logs or client-side code

## Notes

- The server maintains a persistent WhatsApp Web session
- QR code authentication is required on first run or after session expires
- Webhook notifications are only sent for incoming messages (not sent by you)
- Message IDs are unique identifiers that can be used for replies
- Chat IDs remain consistent and can be used to identify conversations