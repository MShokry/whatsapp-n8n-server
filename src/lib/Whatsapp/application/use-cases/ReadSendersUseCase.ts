import type { WhatsappRepository } from "@/lib/Whatsapp/domain/repository/WhatsappRepository";

export class ReadSendersUseCase {
  constructor(private readonly repository: WhatsappRepository) {}

  async run(type: string = "all", unreadOnly: boolean = false, allowedSenders: string[] = []): Promise<any[]> {
    return await this.repository.readSenders(type, unreadOnly, allowedSenders);
  }
}