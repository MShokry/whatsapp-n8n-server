import type { WhatsappRepository } from "@/lib/Whatsapp/domain/repository/WhatsappRepository";

export class ReplyToMessageUseCase {
  constructor(private readonly whatsappRepository: WhatsappRepository) {}

  async execute(chatId: string, messageId: string, replyText: string): Promise<void> {
    await this.whatsappRepository.replyToMessage(chatId, messageId, replyText);
  }
}