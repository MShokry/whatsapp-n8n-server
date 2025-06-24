import type { Message } from "@/lib/Whatsapp/domain/model/Message";
import type { WhatsappRepository } from "@/lib/Whatsapp/domain/repository/WhatsappRepository";
import { getWhatsAppClient } from "@/lib/Whatsapp/infrastructure/WhatsappClient";
import { WhatsappClientIsNotReadyError } from "../../domain/exceptions/WhatsappClientIsNotReadyError";

let webhookUrl: string | null = null;
let webhookSetup = false;

export class WhatsappService implements WhatsappRepository {
  async sendMessage(message: Message): Promise<void> {
    const client = await getWhatsAppClient();

    if (!client) {
      throw new WhatsappClientIsNotReadyError(
        "Client not ready or disconnected"
      );
    }

    await client.sendMessage(
      `${message.number.value}@c.us`,
      message.content.value
    );
  }

  async readMessages(chatId: string, limit: number = 50): Promise<any[]> {
    const client = await getWhatsAppClient();

    if (!client) {
      throw new WhatsappClientIsNotReadyError(
        "Client not ready or disconnected"
      );
    }

    const chat = await client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit });

    return messages.map((msg) => ({
      id: msg.id._serialized,
      body: msg.body,
      from: msg.from,
      to: msg.to,
      timestamp: msg.timestamp,
      type: msg.type,
      fromMe: msg.fromMe,
      hasMedia: msg.hasMedia,
      author: msg.author,
      deviceType: msg.deviceType,
    }));
  }

  async readSenders(
    type: string = "all",
    unreadOnly: boolean = false,
    allowedSenders: string[] = []
  ): Promise<any[]> {
    const client = await getWhatsAppClient();

    if (!client) {
      throw new WhatsappClientIsNotReadyError(
        "Client not ready or disconnected"
      );
    }
    try {

      const chats = await client.getChats();

      if (!chats || !Array.isArray(chats)) {
        console.warn('No chats found or invalid chats data');
        return [];
      }

      let filteredChats = chats;
      if (type === "groups") {
        filteredChats = chats.filter((chat) => chat && chat.isGroup);
      } else if (type === "contacts") {
        filteredChats = chats.filter((chat) => chat && !chat.isGroup);
      }

      // Filter by unread count if requested
      if (unreadOnly) {
        filteredChats = filteredChats.filter((chat) => {
          try {
            return chat && typeof chat.unreadCount === 'number' && chat.unreadCount > 0;
          } catch (error) {
            console.warn('Error checking unread count for chat:', chat?.id, error instanceof Error ? error.message : String(error));
            return false;
          }
        });
      }

      // Filter by allowed senders if provided
      if (allowedSenders.length > 0) {
        filteredChats = filteredChats.filter((chat) => {
          try {
            if (!chat || !chat.id || !chat.id.user) {
              return false;
            }
            const phoneNumber = chat.id.user;
            return allowedSenders.some(
              (allowed) =>
                allowed.replace(/[^0-9]/g, "") === phoneNumber ||
                allowed === `+${phoneNumber}` ||
                allowed === phoneNumber
            );
          } catch (error) {
            console.warn('Error filtering chat by allowed senders:', chat?.id, error instanceof Error ? error.message : String(error));
            return false;
          }
        });
      }

      return filteredChats.map((chat) => {
        try {
          return {
            id: chat.id?._serialized || chat.id?.toString() || 'unknown',
            name: chat.name || 'Unknown',
            isGroup: Boolean(chat.isGroup),
            isMuted: Boolean(chat.isMuted),
            isReadOnly: Boolean(chat.isReadOnly),
            unreadCount: typeof chat.unreadCount === 'number' ? chat.unreadCount : 0,
            timestamp: chat.timestamp || Date.now(),
            lastMessage: chat.lastMessage
              ? {
                  body: chat.lastMessage.body || '',
                  timestamp: chat.lastMessage.timestamp || Date.now(),
                  from: chat.lastMessage.from || '',
                  type: chat.lastMessage.type || 'unknown',
                }
              : null,
          };
        } catch (error) {
          console.warn('Error mapping chat data:', chat?.id, error instanceof Error ? error.message : String(error));
          return {
            id: 'error',
            name: 'Error loading chat',
            isGroup: false,
            isMuted: false,
            isReadOnly: false,
            unreadCount: 0,
            timestamp: Date.now(),
            lastMessage: null,
          };
        }
      }).filter(chat => chat.id !== 'error'); // Remove error entries
    } catch (error) {
      console.error('Error in readSenders:', error);
      throw new Error(`Failed to read senders: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async replyToMessage(
    chatId: string,
    messageId: string,
    replyText: string
  ): Promise<void> {
    const client = await getWhatsAppClient();

    if (!client) {
      throw new WhatsappClientIsNotReadyError(
        "Client not ready or disconnected"
      );
    }

    const chat = await client.getChatById(chatId);
    const messages = await chat.fetchMessages({ limit: 20 });
    const targetMessage = messages.find((msg) => msg.id.id === messageId);

    if (!targetMessage) {
      await client.sendMessage(chatId, replyText);
    } else {
      await targetMessage.reply(replyText);
    }
    // Mark chat as read to clear unread messages
    // await chat.markUnread();
    await chat.sendSeen();
  }

  async transcribeVoiceMessage(messageId: string): Promise<string> {
    const client = await getWhatsAppClient();

    if (!client) {
      throw new WhatsappClientIsNotReadyError(
        "Client not ready or disconnected"
      );
    }

    try {
      // Get the message by ID
      const message = await client.getMessageById(messageId);
      
      if (!message || !message.hasMedia || message.type !== 'ptt') {
        throw new Error('Message is not a voice message');
      }

      // Download the voice message
      const media = await message.downloadMedia();
      
      if (!media) {
        throw new Error('Failed to download voice message');
      }

      // Convert base64 to buffer
      const audioBuffer = Buffer.from(media.data, 'base64');
      
      // Call OpenAI Whisper API for transcription
      const openaiApiKey = process.env.OPENAI_API_KEY;
      if (!openaiApiKey) {
        throw new Error('OpenAI API key not configured');
      }

      const formData = new FormData();
      const audioBlob = new Blob([audioBuffer], { type: 'audio/ogg' });
      formData.append('file', audioBlob, 'voice.ogg');
      formData.append('model', 'whisper-1');
      formData.append('language', 'auto');

      const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.statusText}`);
      }

      const result = await response.json();
      return result.text || 'Could not transcribe audio';
      
    } catch (error) {
      console.error('Error transcribing voice message:', error);
      throw new Error(`Failed to transcribe voice message: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  async setupWebhook(url: string): Promise<void> {
    const client = await getWhatsAppClient();

    if (!client) {
      throw new WhatsappClientIsNotReadyError(
        "Client not ready or disconnected"
      );
    }

    webhookUrl = url;

    if (!webhookSetup) {
      client.on("message", async (message) => {
        if (webhookUrl && !message.fromMe) {
          try {
            let messageBody = message.body;
            let transcription = null;
            
            // Handle voice messages
            if (message.type === 'ptt' && message.hasMedia) {
              try {
                transcription = await this.transcribeVoiceMessage(message.id._serialized);
                messageBody = `[Voice Message] ${transcription}`;
              } catch (error) {
                console.error('Failed to transcribe voice message:', error);
                messageBody = '[Voice Message - Transcription failed]';
              }
            }
            
            const chat = await message.getChat();
            const contact = await message.getContact();
            
            const webhookData = {
              id: chat.id?._serialized || chat.id?.toString() || 'unknown',
              name: chat.name || 'Unknown',
              isGroup: Boolean(chat.isGroup),
              isMuted: Boolean(chat.isMuted),
              isReadOnly: Boolean(chat.isReadOnly),
              unreadCount: typeof chat.unreadCount === 'number' ? chat.unreadCount : 0,
              timestamp: message.timestamp || Date.now(),
              lastMessage: {
                id: message.id._serialized,
                body: messageBody,
                originalBody: message.body,
                timestamp: message.timestamp || Date.now(),
                from: message.from || '',
                to: message.to || '',
                type: message.type || 'unknown',
                hasMedia: message.hasMedia,
                author: message.author,
                deviceType: message.deviceType,
                transcription: transcription,
                fromMe: message.fromMe,
              },
              contact: {
                id: message.author || message.from,
                name: contact.name || contact.pushname,
                number: contact.number,
              },
            };

            // Retry mechanism for webhook delivery
            let retries = process.env.WEBHOOK_RETRY_ATTEMPTS ? parseInt(process.env.WEBHOOK_RETRY_ATTEMPTS) : 1;
            while (retries > 0) {
              try {
                const response = await fetch(webhookUrl, {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                    "User-Agent": "WhatsApp-n8n-Server/1.0",
                  },
                  body: JSON.stringify(webhookData),
                });
                
                if (response.ok) {
                  break; // Success, exit retry loop
                } else {
                  throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
              } catch (error) {
                retries--;
                console.error(`Webhook delivery failed (${3 - retries}/3):`, error instanceof Error ? error.message : String(error));
                if (retries > 0) {
                  await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries))); // Exponential backoff
                }
              }
            }
          } catch (error) {
            console.error("Error processing webhook message:", error);
          }
        }
      });
      
      // Add error handling for webhook setup
      client.on('disconnected', () => {
        console.log('WhatsApp client disconnected, webhook will be inactive');
        webhookSetup = false;
      });
      
      client.on('auth_failure', () => {
        console.log('WhatsApp authentication failed, webhook will be inactive');
        webhookSetup = false;
      });
      
      webhookSetup = true;
      console.log(`Webhook setup completed for URL: ${url}`);
    }
  }

  async removeWebhook(): Promise<void> {
    webhookUrl = null;
    // Note: We keep the event listener but it won't send data without webhookUrl
  }
}
