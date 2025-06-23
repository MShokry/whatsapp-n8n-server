# WhatsApp AI Assistant n8n Workflow

This directory contains n8n workflows for automating WhatsApp responses using AI.

## 🚀 Quick Setup

### 1. Import the Workflow
1. Open your n8n instance
2. Go to **Workflows** → **Import from File**
3. Upload `whatsapp_ai_assistant.json`
4. Save the workflow

### 2. Configure Credentials

#### OpenAI API
1. Go to **Credentials** → **Add Credential**
2. Select **OpenAI**
3. Add your OpenAI API key
4. Test the connection

#### Google Sheets (Optional)
1. Go to **Credentials** → **Add Credential**
2. Select **Google Sheets OAuth2 API**
3. Follow the OAuth setup process
4. Create a spreadsheet with columns:
   - `PhoneNumber`: WhatsApp phone numbers (e.g., +1234567890)
   - `Active`: Yes/No to enable/disable responses
   - `Name`: Contact name (optional)

### 3. Configure Webhook URL
1. In n8n, go to your workflow
2. Click on the **Webhook** node
3. Copy the webhook URL
4. Update the **Setup Webhook** node with this URL

### 4. Update Server URLs
If your WhatsApp server is not running on `localhost:3000`, update all HTTP Request nodes:
- Get Unread Senders
- Get Chat History
- Send Reply
- Setup Webhook
- Get Webhook Chat History
- Send Webhook Reply

## 📋 Workflow Features

### 🔄 Scheduled Polling (Every Minute)
- Checks for unread messages
- Filters by allowed senders list
- Processes each conversation individually

### 🎯 Real-time Webhook Processing
- Instant response to new messages
- Uses the same AI logic as scheduled polling
- More efficient for high-volume scenarios

### 🤖 AI Context Awareness
- Retrieves last 20 messages for context
- Maintains conversation history
- Provides helpful, concise responses

### 👥 Sender Management
- Google Sheets integration for allowed senders
- Easy enable/disable functionality
- Supports unlimited contacts

## 🛠️ Customization Options

### AI Behavior
Modify the system prompt in the **Format Conversation** nodes:
```javascript
conversationHistory.unshift({
  role: 'system',
  content: 'Your custom AI instructions here...'
});
```

### Message Limit
Change the number of messages retrieved for context:
- Update `limit=20` in HTTP Request URLs
- Adjust based on your needs (more context = better responses, but higher API costs)

### Polling Frequency
Modify the **Schedule Trigger**:
- Current: Every minute
- Options: Every 30 seconds, 5 minutes, hourly, etc.

### Response Filtering
Add custom logic in **Filter Allowed Senders**:
```javascript
// Example: Only respond during business hours
const currentHour = new Date().getHours();
if (currentHour < 9 || currentHour > 17) {
  return { json: { filteredSenders: [] } };
}
```

## 🔧 Advanced Configuration

### Environment Variables
Create a `.env` file in your n8n instance:
```env
WHATSAPP_SERVER_URL=http://localhost:3000
OPENAI_API_KEY=your_openai_key
GOOGLE_SHEETS_ID=your_sheet_id
```

### Error Handling
The workflow includes basic error handling, but you can enhance it:
1. Add **Error Trigger** nodes
2. Implement retry logic
3. Add logging to external services

### Multiple AI Models
You can switch between different AI providers:
- OpenAI GPT-4
- Anthropic Claude
- Local LLM models
- Custom AI endpoints

## 📊 Monitoring & Analytics

### Workflow Execution Data
- Monitor response times
- Track message volumes
- Analyze AI performance

### Custom Metrics
Add nodes to track:
- Response accuracy
- User satisfaction
- Conversation completion rates

## 🚨 Troubleshooting

### Common Issues

1. **Webhook not receiving messages**
   - Check webhook URL in WhatsApp server
   - Verify n8n webhook is active
   - Test with manual trigger

2. **AI responses not sending**
   - Verify OpenAI credentials
   - Check WhatsApp server connectivity
   - Review error logs

3. **Sender filtering not working**
   - Verify Google Sheets permissions
   - Check phone number format
   - Ensure 'Active' column values

### Debug Mode
Enable debug mode in n8n:
1. Go to **Settings** → **Log Level**
2. Set to **Debug**
3. Check execution logs

## 🔐 Security Best Practices

1. **API Keys**: Store in n8n credentials, never in workflow
2. **Webhook Security**: Use HTTPS and authentication
3. **Rate Limiting**: Implement to prevent abuse
4. **Data Privacy**: Be mindful of message content handling

## 📈 Scaling Considerations

### High Volume
- Use webhook mode instead of polling
- Implement message queuing
- Consider multiple n8n instances

### Performance Optimization
- Cache conversation history
- Batch process multiple messages
- Use faster AI models for simple responses

## 🤝 Contributing

To improve this workflow:
1. Test thoroughly in development
2. Document any changes
3. Share improvements with the community

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Review n8n documentation
3. Check WhatsApp server logs
4. Test individual nodes in isolation