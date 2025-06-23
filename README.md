# WhatsApp N8N Server – Automate WhatsApp Messaging via REST API + N8N

A Node.js server that integrates with WhatsApp Web via `whatsapp-web.js`, enabling automated message sending through a REST API. Built with Clean Architecture principles.


## ✨ Features

- WhatsApp Web integration using [`whatsapp-web.js`](https://github.com/pedroslopez/whatsapp-web.js)
- REST API endpoint for sending messages
- QR code authentication
- Session persistence with `LocalAuth`
- Clean Architecture

## ⚙️ Prerequisites

- Node.js v18 or higher
- A WhatsApp account
- A smartphone with WhatsApp installed
- Package manager: Bun (recommended)

> [!NOTE]
> This project uses Bun for local development and scripting, but is fully compatible with any Node.js-compatible package manager.

## 🚀 Installation

Clone the repository:
```bash
git clone https://github.com/nicolasdelrosario/whatsapp-n8n-server.git
cd whatsapp-n8n-server
```

Install dependencies
```bash
bun install
```

## 🧪 Usage

Start development mode
```bash
bun dev
```

- On first run, a QR code will appear in the terminal.
- Scan it using WhatsApp on your phone to authenticate.
- Once authenticated, your session will be saved.

Server will run on:
```bash
http://localhost:3000
```

## 📡 API

```bash
POST /api/v1/send-message
```

Sends a WhatsApp message to a phone number.

🔸 Request Body (JSON)

```json
{
    "number": "51123456789",
    "content": "Hello from WhatsApp N8N Server"
}
```

`number:` Phone number in international format (without +)

`content:` The message to send

🔸 Response

```json
{
    "message": "OK"
}
```

## 🧑‍💻 Author

Developed by [Nicolas Del Rosario](https://github.com/nicolasdelrosario)

## 📜 License

MIT



## Server Status:
The server is running successfully on http://localhost:3000 with all new endpoints available:

- POST /api/v1/send-message - Send messages (existing)
- GET /api/v1/qr-code - Get QR code for authentication
- GET /api/v1/messages?chatId=<id>&limit=<number> - Read messages
- GET /api/v1/senders?type=<all|contacts|groups> - Get sender lists
The WhatsApp client initialization has started automatically and will generate a QR code that you can access via the /qr-code endpoint for authentication with WhatsApp Web. All diagnostic errors have been resolved and the codebase is now clean and functional.