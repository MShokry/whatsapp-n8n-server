import type { WhatsappRepository } from "@/lib/Whatsapp/domain/repository/WhatsappRepository";

export class ReadMessagesUseCase {
  constructor(private readonly repository: WhatsappRepository) {}

  async run(chatId: string, limit: number = 50): Promise<any[]> {
    return await this.repository.readMessages(chatId, limit);
  }
}