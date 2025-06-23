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

    const chats = await client.getChats();

    let filteredChats = chats;
    if (type === "groups") {
      filteredChats = chats.filter((chat) => chat.isGroup);
    } else if (type === "contacts") {
      filteredChats = chats.filter((chat) => !chat.isGroup);
    }

    // Filter by unread count if requested
    if (unreadOnly) {
      filteredChats = filteredChats.filter((chat) => chat.unreadCount > 0);
    }

    // Filter by allowed senders if provided
    if (allowedSenders.length > 0) {
      filteredChats = filteredChats.filter((chat) => {
        const phoneNumber = chat.id.user;
        return allowedSenders.some(
          (allowed) =>
            allowed.replace(/[^0-9]/g, "") === phoneNumber ||
            allowed === `+${phoneNumber}` ||
            allowed === phoneNumber
        );
      });
    }

    return filteredChats.map((chat) => ({
      id: chat.id._serialized,
      name: chat.name,
      isGroup: chat.isGroup,
      isMuted: chat.isMuted,
      isReadOnly: chat.isReadOnly,
      unreadCount: chat.unreadCount,
      timestamp: chat.timestamp,
      lastMessage: chat.lastMessage
        ? {
            body: chat.lastMessage.body,
            timestamp: chat.lastMessage.timestamp,
            from: chat.lastMessage.from,
            type: chat.lastMessage.type,
          }
        : null,
      chat,
    }));
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
            const webhookData = {
              id: message.id._serialized,
              body: message.body,
              from: message.from,
              to: message.to,
              timestamp: message.timestamp,
              type: message.type,
              hasMedia: message.hasMedia,
              author: message.author,
              deviceType: message.deviceType,
              chat: {
                id: message.from,
                name: (await message.getChat()).name,
                isGroup: (await message.getChat()).isGroup,
              },
              contact: {
                id: message.author || message.from,
                name:
                  (await message.getContact()).name ||
                  (await message.getContact()).pushname,
                number: (await message.getContact()).number,
              },
            };

            await fetch(webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(webhookData),
            });
          } catch (error) {
            console.error("Error sending webhook:", error);
          }
        }
      });
      webhookSetup = true;
    }
  }

  async removeWebhook(): Promise<void> {
    webhookUrl = null;
    // Note: We keep the event listener but it won't send data without webhookUrl
  }
}
