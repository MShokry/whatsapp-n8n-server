# WhatsApp N8N Server

A production-ready WhatsApp integration server with AI capabilities, voice message transcription, and webhook support.

## Features

- 🔐 **Session Persistence**: Maintains WhatsApp sessions across restarts
- 📱 **QR Code Authentication**: Easy setup with QR code scanning
- 🎤 **Voice Message Transcription**: Converts voice messages to text using OpenAI Whisper
- ✅ **Read Confirmations**: Automatically marks messages as read when replying
- 🔄 **Reliable Webhooks**: Enhanced webhook delivery with retry mechanism
- 🤖 **AI Integration**: Ready for n8n workflow integration
- 📊 **Message History**: Retrieve chat history and sender information

## Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn
- OpenAI API key (for voice transcription)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd whatsapp-n8n-server
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` with your configuration:
```env
NODE_ENV=production
API_KEY=your-secure-api-key
OPENAI_API_KEY=your-openai-api-key
WHATSAPP_SESSION_PATH=./whatsapp-session
WHATSAPP_CLIENT_ID=whatsapp-client
WEBHOOK_RETRY_ATTEMPTS=3
WEBHOOK_TIMEOUT=10000
```

4. Start the server:
```bash
npm run dev
```

5. Scan the QR code displayed in the terminal with your WhatsApp mobile app

## API Endpoints

### Authentication

#### Get QR Code
```http
GET /qr-code
```

Returns the current QR code for WhatsApp authentication.

### Messaging

#### Send Message
```http
POST /send
Content-Type: application/json

{
  "chatId": "1234567890@c.us",
  "message": "Hello, World!"
}
```

#### Reply to Message
```http
POST /reply
Content-Type: application/json

{
  "chatId": "1234567890@c.us",
  "messageId": "message_id_here",
  "replyText": "This is a reply"
}
```

*Note: Automatically marks the chat as read and sends read confirmation.*

#### Transcribe Voice Message
```http
POST /transcribe-voice
Content-Type: application/json

{
  "messageId": "voice_message_id_here"
}
```

### Data Retrieval

#### Get Messages
```http
GET /messages?chatId=1234567890@c.us&limit=50
```

#### Get Senders
```http
GET /senders?limit=20
```

### Webhooks

#### Setup Webhook
```http
POST /webhook
Content-Type: application/json

{
  "url": "https://your-webhook-url.com/webhook"
}
```

#### Remove Webhook
```http
DELETE /webhook
```

## Production Deployment

### Environment Configuration

1. **Session Persistence**: Set `WHATSAPP_SESSION_PATH` to a persistent directory
2. **Client ID**: Use a unique `WHATSAPP_CLIENT_ID` for each deployment
3. **OpenAI API**: Configure `OPENAI_API_KEY` for voice transcription
4. **Webhook Settings**: Adjust `WEBHOOK_RETRY_ATTEMPTS` and `WEBHOOK_TIMEOUT` as needed

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Process Management

For production, use a process manager like PM2:

```bash
npm install -g pm2
pm2 start npm --name "whatsapp-server" -- start
```

## N8N Integration

### Workflow Setup

1. Import the provided n8n workflow: `n8n_workflows/whatsapp_voice_handler.json`
2. Configure your OpenAI credentials in n8n
3. Set up the webhook URL in your WhatsApp server
4. Activate the workflow

### Webhook Data Format

The server sends webhook data in this format:

```json
{
  "message": {
    "id": "message_id",
    "body": "Message content",
    "type": "chat|ptt|image|document",
    "from": "sender_id@c.us",
    "timestamp": 1234567890,
    "hasMedia": false,
    "transcription": "Voice message transcription (if applicable)"
  },
  "chat": {
    "id": "chat_id@c.us",
    "name": "Chat Name",
    "isGroup": false
  },
  "contact": {
    "id": "contact_id@c.us",
    "name": "Contact Name",
    "pushname": "Display Name"
  }
}
```

## Voice Message Handling

The server automatically:

1. Detects voice messages (`ptt` type)
2. Downloads the audio file
3. Transcribes using OpenAI Whisper API
4. Includes transcription in webhook data
5. Provides fallback transcription endpoint

## Troubleshooting

### Common Issues

1. **QR Code Not Appearing**: Check if WhatsApp Web is already logged in elsewhere
2. **Session Lost**: Ensure `WHATSAPP_SESSION_PATH` is persistent and writable
3. **Voice Transcription Fails**: Verify `OPENAI_API_KEY` is valid and has credits
4. **Webhook Not Working**: Check URL accessibility and retry configuration

### Logs

Enable detailed logging by setting `NODE_ENV=development` in your `.env` file.

### Health Check

The server provides a health check endpoint:

```http
GET /health
```

Returns:
```json
{
  "status": "ok",
  "whatsapp": "connected|disconnected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Security Considerations

- Use strong `API_KEY` values
- Keep `OPENAI_API_KEY` secure
- Use HTTPS in production
- Implement rate limiting for public endpoints
- Regularly rotate API keys
- Monitor webhook endpoints for security

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the troubleshooting section
2. Review the API documentation
3. Open an issue on GitHub

---

**Note**: This server is designed for legitimate business use cases. Ensure compliance with WhatsApp's Terms of Service and applicable laws in your jurisdiction.



## Server Status:
The server is running successfully on http://localhost:3000 with all new endpoints available:

- POST /api/v1/send-message - Send messages (existing)
- GET /api/v1/qr-code - Get QR code for authentication
- GET /api/v1/messages?chatId=<id>&limit=<number> - Read messages
- GET /api/v1/senders?type=<all|contacts|groups> - Get sender lists
The WhatsApp client initialization has started automatically and will generate a QR code that you can access via the /qr-code endpoint for authentication with WhatsApp Web. All diagnostic errors have been resolved and the codebase is now clean and functional.