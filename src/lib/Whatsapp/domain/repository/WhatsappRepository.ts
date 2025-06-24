import type { Message } from "@/lib/Whatsapp/domain/model/Message";

export interface WhatsappRepository {
  sendMessage(message: Message): Promise<void>;
  readMessages(chatId: string, limit?: number): Promise<any[]>;
  readSenders(type?: string, unreadOnly?: boolean, allowedSenders?: string[]): Promise<any[]>;
  replyToMessage(chatId: string, messageId: string, replyText: string): Promise<void>;
  transcribeVoiceMessage(messageId: string): Promise<string>;
  setupWebhook(webhookUrl: string): Promise<void>;
  removeWebhook(): Promise<void>;
}
